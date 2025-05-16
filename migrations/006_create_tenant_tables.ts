import { sql } from "drizzle-orm";
import { migrate } from "../server/migrate";

async function main() {
  // Create tenant_configs table
  await migrate(sql`
    CREATE TABLE IF NOT EXISTS tenant_configs (
      id SERIAL PRIMARY KEY,
      partner_id INTEGER NOT NULL UNIQUE REFERENCES partners(id),
      table_prefix TEXT NOT NULL UNIQUE,
      settings JSONB,
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
    
    -- Index for faster tenant lookup
    CREATE INDEX IF NOT EXISTS idx_tenant_configs_partner_id ON tenant_configs(partner_id);
  `);
  
  console.log("Created tenant configuration tables");
}

main()
  .then(() => {
    console.log("Tenant tables migration completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Tenant tables migration failed:", error);
    process.exit(1);
  });