import { db } from "../db";
import { sql } from "drizzle-orm";

/**
 * This script creates the necessary tables for the multi-tenant architecture
 */
async function runTenantMigration() {
  try {
    console.log("Starting multi-tenant database migration...");

    // Create tenant_configs table
    await db.execute(sql`
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
    
    console.log("Created tenant_configs table");
    
    // Create partner-specific inventory table
    await db.execute(sql`
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

      -- Index for faster partner inventory lookup
      CREATE INDEX IF NOT EXISTS idx_partner_inventory_partner ON partner_inventory(partner_id);
    `);
    
    console.log("Created partner_inventory table");

    // Create partner-specific price rules table
    await db.execute(sql`
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
      
      -- Index for faster partner price rules lookup
      CREATE INDEX IF NOT EXISTS idx_partner_price_rules_partner ON partner_price_rules(partner_id);
    `);
    
    console.log("Created partner_price_rules table");
    
    // Create partner-specific leads table
    await db.execute(sql`
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
      
      -- Index for faster partner leads lookup
      CREATE INDEX IF NOT EXISTS idx_partner_leads_partner ON partner_leads(partner_id);
      CREATE INDEX IF NOT EXISTS idx_partner_leads_status ON partner_leads(status);
    `);
    
    console.log("Created partner_leads table");
    
    // Add tenant_id to partner table if it doesn't exist
    try {
      await db.execute(sql`
        ALTER TABLE partners ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(50);
        CREATE INDEX IF NOT EXISTS idx_partners_tenant_id ON partners(tenant_id);
      `);
      console.log("Added tenant_id column to partners table");
    } catch (error) {
      console.error("Error adding tenant_id column to partners table:", error);
    }
    
    console.log("Multi-tenant database migration completed successfully");
  } catch (error) {
    console.error("Failed to run multi-tenant migration:", error);
    process.exit(1);
  }
}

// Run the migration
runTenantMigration()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Migration script failed:", error);
    process.exit(1);
  });