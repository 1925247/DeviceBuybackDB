-- Tenant-specific schema for partner data
-- The ${TENANT_SCHEMA} placeholder will be replaced with the actual tenant ID

-- Create tenant-specific inventory table
CREATE TABLE IF NOT EXISTS ${TENANT_SCHEMA}.inventory (
  id SERIAL PRIMARY KEY,
  product_id INTEGER NOT NULL,
  device_id INTEGER,
  sku TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0,
  location TEXT,
  condition TEXT,
  purchase_price DECIMAL(10, 2),
  selling_price DECIMAL(10, 2),
  status TEXT NOT NULL DEFAULT 'in_stock',
  last_checked TIMESTAMP,
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create tenant-specific staff table
CREATE TABLE IF NOT EXISTS ${TENANT_SCHEMA}.staff (
  id SERIAL PRIMARY KEY,
  user_id INTEGER,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'staff',
  permissions JSONB,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create tenant-specific sales table
CREATE TABLE IF NOT EXISTS ${TENANT_SCHEMA}.sales (
  id SERIAL PRIMARY KEY,
  order_id INTEGER,
  staff_id INTEGER,
  customer_name TEXT,
  customer_email TEXT,
  customer_phone TEXT,
  sale_date TIMESTAMP NOT NULL DEFAULT NOW(),
  total_amount DECIMAL(10, 2) NOT NULL,
  payment_method TEXT,
  payment_status TEXT NOT NULL DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create tenant-specific expenses table
CREATE TABLE IF NOT EXISTS ${TENANT_SCHEMA}.expenses (
  id SERIAL PRIMARY KEY,
  category TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  description TEXT,
  expense_date TIMESTAMP NOT NULL DEFAULT NOW(),
  paid_by TEXT,
  payment_method TEXT,
  receipt_url TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create tenant-specific repairs table
CREATE TABLE IF NOT EXISTS ${TENANT_SCHEMA}.repairs (
  id SERIAL PRIMARY KEY,
  device_id INTEGER,
  staff_id INTEGER,
  customer_name TEXT,
  customer_email TEXT,
  customer_phone TEXT,
  description TEXT NOT NULL,
  diagnosis TEXT,
  status TEXT NOT NULL DEFAULT 'received',
  cost DECIMAL(10, 2),
  parts_used JSONB,
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create tenant-specific store settings table
CREATE TABLE IF NOT EXISTS ${TENANT_SCHEMA}.store_settings (
  id SERIAL PRIMARY KEY,
  store_name TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  email TEXT,
  logo_url TEXT,
  business_hours JSONB,
  tax_rate DECIMAL(5, 2) DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  payment_methods JSONB,
  invoice_prefix TEXT,
  receipt_footer TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Insert default store settings
INSERT INTO ${TENANT_SCHEMA}.store_settings (
  store_name, address, phone, email, business_hours, tax_rate, payment_methods
) VALUES (
  'Partner Store', 
  '123 Main St, City, ST 12345',
  '(555) 123-4567',
  'partner@example.com',
  '{"monday": "9:00-18:00", "tuesday": "9:00-18:00", "wednesday": "9:00-18:00", "thursday": "9:00-18:00", "friday": "9:00-18:00", "saturday": "10:00-16:00", "sunday": "closed"}',
  7.5,
  '["cash", "credit_card", "debit_card"]'
);