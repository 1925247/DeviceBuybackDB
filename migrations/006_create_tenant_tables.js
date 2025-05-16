const { migrate } = require("../server/migrate");
const { sql } = require("drizzle-orm");

async function main() {
  try {
    // Create tenant_configs table for managing partner-specific database configurations
    await migrate(sql`
      CREATE TABLE IF NOT EXISTS tenant_configs (
        id SERIAL PRIMARY KEY,
        partner_id INTEGER NOT NULL UNIQUE REFERENCES partners(id),
        tenant_id VARCHAR(50) NOT NULL UNIQUE,
        settings JSONB DEFAULT '{}',
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );

      -- Index for faster tenant lookup
      CREATE INDEX IF NOT EXISTS idx_tenant_configs_partner_id ON tenant_configs(partner_id);
      CREATE INDEX IF NOT EXISTS idx_tenant_configs_tenant_id ON tenant_configs(tenant_id);
    `);

    console.log("Created tenant configuration tables");
    
    // Ensure all data tables have partner_id for multi-tenant filtering
    await migrate(sql`
      -- Add tenant tracking to existing tables where appropriate
      
      -- Inventory tracking table for tenant-specific inventory
      CREATE TABLE IF NOT EXISTS partner_inventory (
        id SERIAL PRIMARY KEY,
        partner_id INTEGER NOT NULL REFERENCES partners(id),
        device_model_id INTEGER NOT NULL REFERENCES device_models(id),
        condition VARCHAR(50) NOT NULL,
        quantity INTEGER NOT NULL DEFAULT 0,
        price REAL NOT NULL,
        is_available BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
        UNIQUE(partner_id, device_model_id, condition)
      );

      -- Price rules for tenant-specific pricing
      CREATE TABLE IF NOT EXISTS partner_price_rules (
        id SERIAL PRIMARY KEY,
        partner_id INTEGER NOT NULL REFERENCES partners(id),
        device_model_id INTEGER NOT NULL REFERENCES device_models(id),
        condition_factor REAL NOT NULL DEFAULT 1.0,
        base_price REAL NOT NULL,
        min_price REAL NOT NULL,
        max_price REAL NOT NULL,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
        UNIQUE(partner_id, device_model_id)
      );
      
      -- Partner-specific leads management
      CREATE TABLE IF NOT EXISTS partner_leads (
        id SERIAL PRIMARY KEY,
        partner_id INTEGER NOT NULL REFERENCES partners(id),
        user_id INTEGER REFERENCES users(id),
        device_model_id INTEGER REFERENCES device_models(id),
        estimated_value REAL,
        status VARCHAR(50) NOT NULL DEFAULT 'new',
        notes TEXT,
        assigned_staff_id INTEGER REFERENCES partner_staff(id),
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
      
      -- Indexes for performance
      CREATE INDEX IF NOT EXISTS idx_partner_inventory_partner ON partner_inventory(partner_id);
      CREATE INDEX IF NOT EXISTS idx_partner_price_rules_partner ON partner_price_rules(partner_id);
      CREATE INDEX IF NOT EXISTS idx_partner_leads_partner ON partner_leads(partner_id);
    `);
    
    console.log("Created partner-specific data tables");
  } catch (error) {
    console.error("Migration failed:", error);
    throw error;
  }
}

main()
  .then(() => {
    console.log("Multi-tenant architecture migration completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Multi-tenant architecture migration failed:", error);
    process.exit(1);
  });