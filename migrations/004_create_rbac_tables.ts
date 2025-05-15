import { sql } from 'drizzle-orm';
import { neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool } from '@neondatabase/serverless';
import { SQL } from 'drizzle-orm';
import ws from 'ws';

neonConfig.webSocketConstructor = ws;

async function migrate(migrationQuery: SQL) {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool);

  try {
    await pool.query(migrationQuery.toString());
    console.log('Migration executed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

async function main() {
  await migrate(sql`
    -- Create user_role enum if not exists
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM (
          'customer',
          'admin',
          'partner',
          'partner_staff',
          'partner_manager',
          'partner_owner'
        );
      END IF;
    END
    $$;

    -- Create user_status enum if not exists
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_status') THEN
        CREATE TYPE user_status AS ENUM (
          'active',
          'inactive',
          'pending',
          'suspended'
        );
      END IF;
    END
    $$;

    -- Alter users table to add role and status if not already present
    ALTER TABLE users ADD COLUMN IF NOT EXISTS role user_role NOT NULL DEFAULT 'customer';
    ALTER TABLE users ADD COLUMN IF NOT EXISTS status user_status NOT NULL DEFAULT 'active';
    ALTER TABLE users ADD COLUMN IF NOT EXISTS partner_id INTEGER REFERENCES partners(id);
    ALTER TABLE users ADD COLUMN IF NOT EXISTS permissions JSONB;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login TIMESTAMP;

    -- Create Role Permissions Table
    CREATE TABLE IF NOT EXISTS role_permissions (
      id SERIAL PRIMARY KEY,
      role user_role NOT NULL,
      resource TEXT NOT NULL,
      action TEXT NOT NULL,
      restrictions JSONB,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
      UNIQUE(role, resource, action)
    );

    -- Create Partner Staff Table
    CREATE TABLE IF NOT EXISTS partner_staff (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id),
      partner_id INTEGER NOT NULL REFERENCES partners(id),
      role user_role NOT NULL DEFAULT 'partner_staff',
      assigned_regions JSONB,
      assigned_pincodes JSONB,
      custom_permissions JSONB,
      status user_status NOT NULL DEFAULT 'active',
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    );

    -- Create Postal Codes Table
    CREATE TABLE IF NOT EXISTS postal_codes (
      id SERIAL PRIMARY KEY,
      pincode TEXT NOT NULL UNIQUE,
      office_name TEXT,
      district TEXT,
      state TEXT NOT NULL,
      country TEXT NOT NULL DEFAULT 'India',
      region_id INTEGER REFERENCES regions(id),
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    );

    -- Insert default role permissions
    INSERT INTO role_permissions (role, resource, action, restrictions)
    VALUES
      -- Admin permissions
      ('admin', 'all', 'all', NULL),
      
      -- Partner owner permissions
      ('partner_owner', 'leads', 'read', NULL),
      ('partner_owner', 'leads', 'update', NULL),
      ('partner_owner', 'wallet', 'read', NULL),
      ('partner_owner', 'wallet', 'withdraw', NULL),
      ('partner_owner', 'staff', 'create', NULL),
      ('partner_owner', 'staff', 'read', NULL),
      ('partner_owner', 'staff', 'update', NULL),
      ('partner_owner', 'staff', 'delete', NULL),
      ('partner_owner', 'documents', 'read', NULL),
      ('partner_owner', 'documents', 'create', NULL),
      
      -- Partner manager permissions
      ('partner_manager', 'leads', 'read', NULL),
      ('partner_manager', 'leads', 'update', NULL),
      ('partner_manager', 'wallet', 'read', NULL),
      ('partner_manager', 'staff', 'read', NULL),
      ('partner_manager', 'documents', 'read', NULL),
      ('partner_manager', 'documents', 'create', NULL),
      
      -- Partner staff permissions
      ('partner_staff', 'leads', 'read', NULL),
      ('partner_staff', 'leads', 'update', '{"status": ["assigned", "processing", "completed"]}'),
      ('partner_staff', 'documents', 'read', NULL)
    ON CONFLICT (role, resource, action) DO NOTHING;

    -- Create indexes for better performance
    CREATE INDEX IF NOT EXISTS idx_partner_staff_partner_id ON partner_staff(partner_id);
    CREATE INDEX IF NOT EXISTS idx_partner_staff_user_id ON partner_staff(user_id);
    CREATE INDEX IF NOT EXISTS idx_postal_codes_pincode ON postal_codes(pincode);
    CREATE INDEX IF NOT EXISTS idx_postal_codes_state ON postal_codes(state);
  `);

  console.log('Migration completed: RBAC tables created');
}

main().catch(error => {
  console.error('Migration failed:', error);
  process.exit(1);
});