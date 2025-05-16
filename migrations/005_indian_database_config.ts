import { SQL, sql } from "drizzle-orm";
import { migrate } from "../server/migrate";

// Migration to add Indian-specific database configurations
async function main() {
  const migrationQueries: SQL[] = [];

  // Add Indian States table
  migrationQueries.push(sql`
    CREATE TABLE IF NOT EXISTS indian_states (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      code TEXT NOT NULL UNIQUE,
      is_union_territory BOOLEAN DEFAULT FALSE,
      active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT NOW() NOT NULL,
      updated_at TIMESTAMP DEFAULT NOW() NOT NULL
    );
  `);

  // Add Indian Cities table with state reference
  migrationQueries.push(sql`
    CREATE TABLE IF NOT EXISTS indian_cities (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      state_id INTEGER NOT NULL REFERENCES indian_states(id),
      is_metro BOOLEAN DEFAULT FALSE,
      active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT NOW() NOT NULL,
      updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
      UNIQUE(name, state_id)
    );
  `);

  // Add Indian Postal Codes table with extended data
  migrationQueries.push(sql`
    CREATE TABLE IF NOT EXISTS indian_postal_codes (
      id SERIAL PRIMARY KEY,
      pincode TEXT NOT NULL UNIQUE,
      post_office_name TEXT,
      district TEXT NOT NULL,
      state_id INTEGER NOT NULL REFERENCES indian_states(id),
      city_id INTEGER REFERENCES indian_cities(id),
      delivery_status TEXT,
      division_name TEXT,
      region_name TEXT,
      circle_name TEXT,
      taluk TEXT,
      active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT NOW() NOT NULL,
      updated_at TIMESTAMP DEFAULT NOW() NOT NULL
    );
  `);

  // Add GST configuration table
  migrationQueries.push(sql`
    CREATE TABLE IF NOT EXISTS gst_configuration (
      id SERIAL PRIMARY KEY,
      tax_rate REAL NOT NULL,
      hsn_code TEXT NOT NULL,
      description TEXT NOT NULL,
      category TEXT NOT NULL,
      active BOOLEAN DEFAULT TRUE,
      effective_from DATE NOT NULL,
      effective_to DATE,
      created_at TIMESTAMP DEFAULT NOW() NOT NULL,
      updated_at TIMESTAMP DEFAULT NOW() NOT NULL
    );
  `);

  // Add KYC document types table
  migrationQueries.push(sql`
    CREATE TABLE IF NOT EXISTS kyc_document_types (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      code TEXT NOT NULL UNIQUE,
      description TEXT,
      required_for_partners BOOLEAN DEFAULT FALSE,
      required_for_customers BOOLEAN DEFAULT FALSE,
      verification_type TEXT NOT NULL,
      active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT NOW() NOT NULL,
      updated_at TIMESTAMP DEFAULT NOW() NOT NULL
    );
  `);

  // Add KYC documents table for storing user documents
  migrationQueries.push(sql`
    CREATE TABLE IF NOT EXISTS kyc_documents (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id),
      document_type_id INTEGER NOT NULL REFERENCES kyc_document_types(id),
      document_number TEXT NOT NULL,
      document_url TEXT NOT NULL,
      verification_status TEXT NOT NULL DEFAULT 'pending',
      verified_by INTEGER REFERENCES users(id),
      verification_date TIMESTAMP,
      rejection_reason TEXT,
      expiry_date DATE,
      created_at TIMESTAMP DEFAULT NOW() NOT NULL,
      updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
      UNIQUE(user_id, document_type_id)
    );
  `);

  // Add Partner Service Areas table (specific to Indian geography)
  migrationQueries.push(sql`
    CREATE TABLE IF NOT EXISTS partner_service_areas (
      id SERIAL PRIMARY KEY,
      partner_id INTEGER NOT NULL REFERENCES partners(id),
      state_id INTEGER REFERENCES indian_states(id),
      city_id INTEGER REFERENCES indian_cities(id),
      pincode TEXT REFERENCES indian_postal_codes(pincode),
      is_primary BOOLEAN DEFAULT FALSE,
      active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT NOW() NOT NULL,
      updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
      CHECK ((state_id IS NOT NULL) OR (city_id IS NOT NULL) OR (pincode IS NOT NULL))
    );
  `);

  // Add multi-tenant configuration table
  migrationQueries.push(sql`
    CREATE TABLE IF NOT EXISTS tenant_configurations (
      id SERIAL PRIMARY KEY,
      partner_id INTEGER NOT NULL REFERENCES partners(id) UNIQUE,
      database_name TEXT,
      database_host TEXT,
      database_port INTEGER,
      database_user TEXT,
      database_password TEXT,
      settings JSONB DEFAULT '{}',
      is_multi_tenant BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT NOW() NOT NULL,
      updated_at TIMESTAMP DEFAULT NOW() NOT NULL
    );
  `);

  // Add tenant customization table 
  migrationQueries.push(sql`
    CREATE TABLE IF NOT EXISTS tenant_customizations (
      id SERIAL PRIMARY KEY,
      partner_id INTEGER NOT NULL REFERENCES partners(id) UNIQUE,
      logo_url TEXT,
      primary_color TEXT,
      secondary_color TEXT,
      invoice_template TEXT,
      email_template TEXT,
      sms_template TEXT,
      domain TEXT,
      company_details JSONB,
      gstin TEXT,
      payment_gateway_config JSONB,
      terms_and_conditions TEXT,
      privacy_policy TEXT,
      created_at TIMESTAMP DEFAULT NOW() NOT NULL,
      updated_at TIMESTAMP DEFAULT NOW() NOT NULL
    );
  `);

  // Run all migrations
  for (const query of migrationQueries) {
    await migrate(query);
  }

  // Seed Indian states data
  await migrate(sql`
    INSERT INTO indian_states (name, code, is_union_territory) VALUES
    ('Andhra Pradesh', 'AP', FALSE),
    ('Arunachal Pradesh', 'AR', FALSE),
    ('Assam', 'AS', FALSE),
    ('Bihar', 'BR', FALSE),
    ('Chhattisgarh', 'CG', FALSE),
    ('Goa', 'GA', FALSE),
    ('Gujarat', 'GJ', FALSE),
    ('Haryana', 'HR', FALSE),
    ('Himachal Pradesh', 'HP', FALSE),
    ('Jharkhand', 'JH', FALSE),
    ('Karnataka', 'KA', FALSE),
    ('Kerala', 'KL', FALSE),
    ('Madhya Pradesh', 'MP', FALSE),
    ('Maharashtra', 'MH', FALSE),
    ('Manipur', 'MN', FALSE),
    ('Meghalaya', 'ML', FALSE),
    ('Mizoram', 'MZ', FALSE),
    ('Nagaland', 'NL', FALSE),
    ('Odisha', 'OR', FALSE),
    ('Punjab', 'PB', FALSE),
    ('Rajasthan', 'RJ', FALSE),
    ('Sikkim', 'SK', FALSE),
    ('Tamil Nadu', 'TN', FALSE),
    ('Telangana', 'TG', FALSE),
    ('Tripura', 'TR', FALSE),
    ('Uttar Pradesh', 'UP', FALSE),
    ('Uttarakhand', 'UK', FALSE),
    ('West Bengal', 'WB', FALSE),
    ('Andaman and Nicobar Islands', 'AN', TRUE),
    ('Chandigarh', 'CH', TRUE),
    ('Dadra and Nagar Haveli and Daman and Diu', 'DN', TRUE),
    ('Delhi', 'DL', TRUE),
    ('Jammu and Kashmir', 'JK', TRUE),
    ('Ladakh', 'LA', TRUE),
    ('Lakshadweep', 'LD', TRUE),
    ('Puducherry', 'PY', TRUE)
    ON CONFLICT (code) DO NOTHING;
  `);

  // Seed KYC document types for India
  await migrate(sql`
    INSERT INTO kyc_document_types (name, code, description, required_for_partners, required_for_customers, verification_type) VALUES
    ('PAN Card', 'PAN', 'Permanent Account Number issued by Income Tax Department', TRUE, FALSE, 'manual'),
    ('Aadhaar Card', 'AADHAAR', 'Unique Identification Authority of India', TRUE, TRUE, 'manual'),
    ('GST Registration', 'GST', 'Goods and Services Tax Registration', TRUE, FALSE, 'manual'),
    ('Shop & Establishment License', 'SHOP_ACT', 'Shop and Establishment License', TRUE, FALSE, 'manual'),
    ('Voter ID', 'VOTER', 'Election Commission ID Card', FALSE, TRUE, 'manual'),
    ('Driving License', 'DL', 'Driving License issued by RTO', FALSE, TRUE, 'manual'),
    ('Passport', 'PASSPORT', 'Passport issued by Government of India', FALSE, TRUE, 'manual')
    ON CONFLICT (code) DO NOTHING;
  `);

  // Seed GST configurations for electronics
  await migrate(sql`
    INSERT INTO gst_configuration (tax_rate, hsn_code, description, category, active, effective_from) VALUES
    (18.0, '8471', 'Computers and computer peripherals', 'ELECTRONICS', TRUE, '2022-01-01'),
    (18.0, '8517', 'Mobile phones, smartphones and communication devices', 'ELECTRONICS', TRUE, '2022-01-01'),
    (18.0, '8523', 'Memory cards, storage devices', 'ELECTRONICS', TRUE, '2022-01-01'),
    (18.0, '8528', 'Monitors and televisions', 'ELECTRONICS', TRUE, '2022-01-01'),
    (28.0, '8415', 'Air conditioners', 'ELECTRONICS', TRUE, '2022-01-01'),
    (28.0, '8418', 'Refrigerators', 'ELECTRONICS', TRUE, '2022-01-01')
    ON CONFLICT DO NOTHING;
  `);

  console.log("Indian database configuration migration completed successfully!");
}

main().catch(console.error);