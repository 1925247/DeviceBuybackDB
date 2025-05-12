-- SQL schema for partner tenant databases
-- This creates a separate database schema for each partner

-- Partner staff members table
CREATE TABLE staff (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'staff',
  phone TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Partner inventory table
CREATE TABLE inventory (
  id SERIAL PRIMARY KEY,
  device_id INTEGER NOT NULL,  -- References device from main DB
  condition TEXT NOT NULL,
  purchase_price DECIMAL(10, 2) NOT NULL,
  selling_price DECIMAL(10, 2),
  status TEXT NOT NULL DEFAULT 'in_stock',
  acquired_date TIMESTAMP NOT NULL DEFAULT NOW(),
  sold_date TIMESTAMP,
  serial_number TEXT,
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Partner assigned leads table (from buyback requests)
CREATE TABLE assigned_leads (
  id SERIAL PRIMARY KEY,
  buyback_request_id INTEGER NOT NULL,  -- References buyback request from main DB
  assigned_to INTEGER REFERENCES staff(id),
  status TEXT NOT NULL DEFAULT 'pending',
  priority TEXT DEFAULT 'medium',
  assigned_date TIMESTAMP NOT NULL DEFAULT NOW(),
  due_date TIMESTAMP,
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Lead status history
CREATE TABLE lead_status_history (
  id SERIAL PRIMARY KEY,
  lead_id INTEGER NOT NULL REFERENCES assigned_leads(id),
  status TEXT NOT NULL,
  notes TEXT,
  updated_by INTEGER REFERENCES staff(id),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Partner device valuation settings
CREATE TABLE valuation_settings (
  id SERIAL PRIMARY KEY,
  device_model_id INTEGER NOT NULL,  -- References device model from main DB
  base_price DECIMAL(10, 2) NOT NULL,
  deduction_rates JSONB,  -- JSON object with deduction rates for different conditions
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Partner pickups
CREATE TABLE pickups (
  id SERIAL PRIMARY KEY,
  lead_id INTEGER NOT NULL REFERENCES assigned_leads(id),
  staff_id INTEGER REFERENCES staff(id),
  scheduled_date TIMESTAMP,
  completed_date TIMESTAMP,
  status TEXT NOT NULL DEFAULT 'scheduled',
  address TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Partner payment records
CREATE TABLE payments (
  id SERIAL PRIMARY KEY,
  lead_id INTEGER REFERENCES assigned_leads(id),
  amount DECIMAL(10, 2) NOT NULL,
  payment_method TEXT NOT NULL,
  transaction_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  paid_to TEXT NOT NULL,  -- Name of the person who received the payment
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Partner payment methods configuration
CREATE TABLE payment_methods (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  config JSONB,  -- JSON configuration specific to the payment method
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Partner specialization for Windows phones (or other device types)
CREATE TABLE specializations (
  id SERIAL PRIMARY KEY,
  device_type_id INTEGER NOT NULL,  -- References device type from main DB
  expertise_level TEXT NOT NULL DEFAULT 'medium',
  priority INTEGER NOT NULL DEFAULT 1,  -- Lower number = higher priority
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Partner settings
CREATE TABLE settings (
  id SERIAL PRIMARY KEY,
  setting_key TEXT NOT NULL UNIQUE,
  setting_value JSONB NOT NULL,
  description TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Initial settings
INSERT INTO settings (setting_key, setting_value, description)
VALUES 
  ('notification_preferences', '{"email": true, "sms": false, "in_app": true}', 'Notification preferences'),
  ('lead_auto_assignment', '{"enabled": true, "round_robin": true}', 'Automatic lead assignment settings'),
  ('commission_rates', '{"default": 0.10, "windows_phones": 0.15}', 'Commission rates for different device types');