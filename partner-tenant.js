// Script to create and manage multi-tenant databases for partners
const { Pool } = require('pg');
const { randomUUID } = require('crypto');
const fs = require('fs');
const path = require('path');

// Main function to create a new tenant database for a partner
async function createPartnerTenant(partnerName, partnerEmail) {
  try {
    // Connect to main database
    const mainPool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
    
    // Generate a unique tenant ID
    const tenantId = `partner_${randomUUID().replace(/-/g, '')}`;
    const safePartnerName = partnerName.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const databaseName = `${safePartnerName}_${tenantId.substring(0, 8)}`;
    
    console.log(`Creating tenant database for partner: ${partnerName}`);
    console.log(`Tenant ID: ${tenantId}`);
    console.log(`Database Name: ${databaseName}`);
    
    // Create the new database
    await mainPool.query(`CREATE DATABASE ${databaseName}`);
    
    // Connect to the new database
    const tenantPool = new Pool({
      connectionString: process.env.DATABASE_URL.replace(/\/[^/]*$/, `/${databaseName}`),
    });
    
    // Execute migrations on the new database
    console.log('Running migrations on the tenant database...');
    const migrationSql = fs.readFileSync(path.join(__dirname, 'migrations/tenant-schema.sql'), 'utf8');
    await tenantPool.query(migrationSql);
    
    // Register the partner in the main database
    const insertPartnerResult = await mainPool.query(
      `INSERT INTO partners (name, email, status, tenant_id) 
       VALUES ($1, $2, 'active', $3) 
       RETURNING id`,
      [partnerName, partnerEmail, tenantId]
    );
    
    const partnerId = insertPartnerResult.rows[0].id;
    
    // Create configuration for connecting to tenant database
    const tenantConfig = {
      tenant_id: tenantId,
      database_name: databaseName,
      connection_string: process.env.DATABASE_URL.replace(/\/[^/]*$/, `/${databaseName}`),
      partner_id: partnerId,
      created_at: new Date().toISOString()
    };
    
    // Save tenant configuration to a file for reference
    fs.writeFileSync(
      path.join(__dirname, `tenant-configs/${tenantId}.json`), 
      JSON.stringify(tenantConfig, null, 2)
    );
    
    console.log(`Partner tenant database successfully created with ID: ${partnerId}`);
    console.log(`Tenant ID: ${tenantId}`);
    
    // Close connections
    await tenantPool.end();
    await mainPool.end();
    
    return {
      partnerId,
      tenantId,
      databaseName
    };
    
  } catch (error) {
    console.error('Error creating partner tenant:', error);
    throw error;
  }
}

// Function to list all partner tenants
async function listPartnerTenants() {
  try {
    const mainPool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
    
    const result = await mainPool.query(
      `SELECT id, name, email, tenant_id, status FROM partners ORDER BY id`
    );
    
    console.log('\nPartner Tenants:');
    console.log('----------------');
    
    result.rows.forEach(partner => {
      console.log(`ID: ${partner.id}`);
      console.log(`Name: ${partner.name}`);
      console.log(`Email: ${partner.email}`);
      console.log(`Tenant ID: ${partner.tenant_id}`);
      console.log(`Status: ${partner.status}`);
      console.log('----------------');
    });
    
    await mainPool.end();
    return result.rows;
    
  } catch (error) {
    console.error('Error listing partner tenants:', error);
    throw error;
  }
}

// Export functions
module.exports = {
  createPartnerTenant,
  listPartnerTenants
};

// If script is run directly
if (require.main === module) {
  const command = process.argv[2];
  
  if (command === 'create') {
    const partnerName = process.argv[3];
    const partnerEmail = process.argv[4];
    
    if (!partnerName || !partnerEmail) {
      console.error('Usage: node partner-tenant.js create "Partner Name" "partner@email.com"');
      process.exit(1);
    }
    
    createPartnerTenant(partnerName, partnerEmail)
      .then(() => process.exit(0))
      .catch(() => process.exit(1));
  } 
  else if (command === 'list') {
    listPartnerTenants()
      .then(() => process.exit(0))
      .catch(() => process.exit(1));
  }
  else {
    console.error('Usage: node partner-tenant.js [create|list]');
    process.exit(1);
  }
}