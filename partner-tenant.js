import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import crypto from 'crypto';

dotenv.config();

// Get the current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create a connection pool to the main database
const mainPool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

/**
 * Creates a new tenant database for a partner
 * @param {string} partnerName - Name of the partner
 * @param {string} partnerEmail - Email of the partner
 * @returns {Promise<object>} - Partner tenant details
 */
async function createPartnerTenant(partnerName, partnerEmail) {
  try {
    // Generate a unique tenant ID
    const tenantId = `tenant-${crypto.randomUUID().slice(0, 8)}`;
    
    // Create a unique database name based on the tenant ID
    const databaseName = `partner_${tenantId.replace(/[-]/g, '_')}`;
    
    console.log(`Creating tenant database for ${partnerName} (${partnerEmail})...`);
    
    // First, register the partner in the main database
    const partnerResult = await mainPool.query(`
      INSERT INTO partners (name, email, tenant_id, status) 
      VALUES ($1, $2, $3, 'active')
      RETURNING id, name, email, tenant_id
    `, [partnerName, partnerEmail, tenantId]);
    
    const partner = partnerResult.rows[0];
    console.log(`Partner created with ID: ${partner.id}`);
    
    // Create a new database for the partner (would require elevated privileges in production)
    // In Replit's environment, we'll simulate this by creating a schema instead
    await mainPool.query(`
      CREATE SCHEMA IF NOT EXISTS ${tenantId}
    `);
    
    console.log(`Schema '${tenantId}' created successfully`);
    
    // Read tenant schema creation SQL
    const tenantSchemaSQL = fs.readFileSync(path.join(__dirname, 'migrations/tenant-schema.sql'), 'utf8');
    
    // Replace schema name placeholder with the tenant ID
    const tenantSQL = tenantSchemaSQL.replace(/\$\{TENANT_SCHEMA\}/g, tenantId);
    
    // Execute the tenant schema SQL
    await mainPool.query(tenantSQL);
    
    console.log(`Tenant schema tables created successfully`);
    
    // Return the partner tenant details
    return {
      partnerId: partner.id,
      partnerName: partner.name,
      partnerEmail: partner.email,
      tenantId: partner.tenant_id,
      schemaName: tenantId,
    };
    
  } catch (error) {
    console.error('Error creating partner tenant:', error);
    throw error;
  } finally {
    // Close the connection pool
    await mainPool.end();
  }
}

/**
 * Lists all partner tenants
 * @returns {Promise<array>} - List of partner tenants
 */
async function listPartnerTenants() {
  try {
    const result = await mainPool.query(`
      SELECT id, name, email, tenant_id, status, created_at
      FROM partners
      ORDER BY name
    `);
    
    console.log(`Found ${result.rows.length} partner tenants:`);
    result.rows.forEach(partner => {
      console.log(`- ${partner.name} (${partner.email}): ${partner.tenant_id} [${partner.status}]`);
    });
    
    return result.rows;
    
  } catch (error) {
    console.error('Error listing partner tenants:', error);
    throw error;
  } finally {
    // Close the connection pool
    await mainPool.end();
  }
}

// Run command based on arguments
const [command, ...args] = process.argv.slice(2);

if (command === 'create' && args.length >= 2) {
  const [partnerName, partnerEmail] = args;
  createPartnerTenant(partnerName, partnerEmail)
    .then(tenant => {
      console.log('Partner tenant created successfully:', tenant);
      process.exit(0);
    })
    .catch(err => {
      console.error('Failed to create partner tenant:', err);
      process.exit(1);
    });
} else if (command === 'list') {
  listPartnerTenants()
    .then(() => {
      process.exit(0);
    })
    .catch(err => {
      console.error('Failed to list partner tenants:', err);
      process.exit(1);
    });
} else {
  console.log('Usage:');
  console.log('  node partner-tenant.js create "Partner Name" partner@email.com');
  console.log('  node partner-tenant.js list');
  process.exit(1);
}