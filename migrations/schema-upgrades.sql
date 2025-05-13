-- Schema upgrades for enhancing the e-commerce platform

-- Add regions table
CREATE TABLE IF NOT EXISTS regions (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  code TEXT NOT NULL UNIQUE,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Add partners table
CREATE TABLE IF NOT EXISTS partners (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  address TEXT,
  logo TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  specialization TEXT,
  regions JSONB, -- Array of region IDs
  device_types JSONB, -- Array of device type IDs
  pin_codes JSONB, -- Array of PIN codes
  commission_rate DECIMAL(5, 2) DEFAULT 10 NOT NULL,
  tenant_id TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Add new columns to condition_questions table
ALTER TABLE condition_questions 
  ADD COLUMN IF NOT EXISTS brand_id INTEGER REFERENCES brands(id),
  ADD COLUMN IF NOT EXISTS question_type TEXT NOT NULL DEFAULT 'multiple_choice',
  ADD COLUMN IF NOT EXISTS required BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS help_text TEXT;

-- Add new columns to condition_answers table
ALTER TABLE condition_answers 
  ADD COLUMN IF NOT EXISTS deduction_type TEXT NOT NULL DEFAULT 'percentage',
  ADD COLUMN IF NOT EXISTS fixed_amount DECIMAL(10, 2),
  ADD COLUMN IF NOT EXISTS applicable_brands JSONB,
  ADD COLUMN IF NOT EXISTS applicable_models JSONB,
  ADD COLUMN IF NOT EXISTS description TEXT;

-- Add new columns to buyback_requests table
ALTER TABLE buyback_requests 
  ADD COLUMN IF NOT EXISTS partner_id INTEGER REFERENCES partners(id),
  ADD COLUMN IF NOT EXISTS region_id INTEGER REFERENCES regions(id),
  ADD COLUMN IF NOT EXISTS pin_code TEXT,
  ADD COLUMN IF NOT EXISTS staff_id INTEGER REFERENCES users(id),
  ADD COLUMN IF NOT EXISTS questionnaire_answers JSONB,
  ADD COLUMN IF NOT EXISTS image_urls JSONB,
  ADD COLUMN IF NOT EXISTS deductions JSONB,
  ADD COLUMN IF NOT EXISTS final_price DECIMAL(10, 2);

-- Add new columns to marketplace_listings table
ALTER TABLE marketplace_listings 
  ADD COLUMN IF NOT EXISTS sell_ready BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS partner_sourced BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS partner_id INTEGER REFERENCES partners(id),
  ADD COLUMN IF NOT EXISTS regions JSONB,
  ADD COLUMN IF NOT EXISTS template_id INTEGER,
  ADD COLUMN IF NOT EXISTS seo_title TEXT,
  ADD COLUMN IF NOT EXISTS seo_description TEXT;

-- Add new columns to products table
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS regions JSONB,
  ADD COLUMN IF NOT EXISTS template_id INTEGER,
  ADD COLUMN IF NOT EXISTS sell_ready BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS refurbished BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS partner_id INTEGER REFERENCES partners(id);

-- Add new columns to users table
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS partner_id INTEGER REFERENCES partners(id),
  ADD COLUMN IF NOT EXISTS region_id INTEGER REFERENCES regions(id);

-- Create store_templates table
CREATE TABLE IF NOT EXISTS store_templates (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL, -- product, category, cart, checkout, etc.
  thumbnail TEXT,
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  configuration JSONB,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create store_themes table
CREATE TABLE IF NOT EXISTS store_themes (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT FALSE,
  colors JSONB,
  fonts JSONB,
  layout JSONB,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create invoice_templates table
CREATE TABLE IF NOT EXISTS invoice_templates (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  html_template TEXT NOT NULL,
  css_styles TEXT,
  configuration JSONB,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Insert default regions
INSERT INTO regions (name, code)
VALUES 
  ('North America', 'NA'),
  ('Europe', 'EU'),
  ('Asia Pacific', 'APAC'),
  ('Middle East', 'ME'),
  ('Africa', 'AF')
ON CONFLICT DO NOTHING;

-- Insert default store templates
INSERT INTO store_templates (name, description, type, is_default)
VALUES 
  ('Standard Product Page', 'Default product page layout', 'product', TRUE),
  ('Grid Category Page', 'Grid layout for category pages', 'category', TRUE),
  ('Standard Cart', 'Default cart page layout', 'cart', TRUE),
  ('Standard Checkout', 'Default checkout page layout', 'checkout', TRUE)
ON CONFLICT DO NOTHING;

-- Insert default store theme
INSERT INTO store_themes (name, description, is_active, colors, fonts)
VALUES 
  ('Default Theme', 'Default store theme', TRUE, 
   '{"primary": "#3b82f6", "secondary": "#f97316", "background": "#ffffff", "text": "#333333"}',
   '{"heading": "Inter", "body": "Inter"}')
ON CONFLICT DO NOTHING;

-- Insert default invoice template
INSERT INTO invoice_templates (name, description, is_default, html_template)
VALUES 
  ('Standard Invoice', 'Default invoice template', TRUE, 
   '<div class="invoice"><h1>INVOICE</h1>{{invoiceContent}}</div>')
ON CONFLICT DO NOTHING;

-- Create route_rules table for PIN code-based lead assignment
CREATE TABLE IF NOT EXISTS route_rules (
  id SERIAL PRIMARY KEY,
  path TEXT NOT NULL,
  pin_code TEXT,
  partner_id INTEGER REFERENCES partners(id),
  region_id INTEGER REFERENCES regions(id),
  priority INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  description TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);