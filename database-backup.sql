-- ====================================================
-- Device Buyback Platform - Database Backup & Setup
-- Generated: June 2025
-- PostgreSQL 14+ Compatible
-- ====================================================

-- Create database (run this manually first)
-- CREATE DATABASE buyback_platform;
-- \c buyback_platform;

-- ====================================================
-- EXTENSIONS
-- ====================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ====================================================
-- ENUMS
-- ====================================================
CREATE TYPE user_role AS ENUM ('admin', 'partner', 'staff', 'customer');
CREATE TYPE user_status AS ENUM ('active', 'inactive', 'pending');
CREATE TYPE question_type AS ENUM ('multiple_choice', 'yes_no', 'text', 'number', 'rating');

-- ====================================================
-- CORE TABLES
-- ====================================================

-- Sessions table for authentication
CREATE TABLE sessions (
    id VARCHAR(128) PRIMARY KEY,
    sess JSON NOT NULL,
    expire TIMESTAMP(6) NOT NULL
);

-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    phone VARCHAR(20),
    role user_role DEFAULT 'customer',
    status user_status DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Partners table
CREATE TABLE partners (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    postal_code VARCHAR(10),
    tenant_id VARCHAR(50) UNIQUE,
    commission_rate DECIMAL(5,2) DEFAULT 10.00,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Partner staff management
CREATE TABLE partner_staff (
    id SERIAL PRIMARY KEY,
    partner_id INTEGER REFERENCES partners(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'staff',
    permissions JSONB,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Partner wallets for financial tracking
CREATE TABLE partner_wallets (
    id SERIAL PRIMARY KEY,
    partner_id INTEGER REFERENCES partners(id) ON DELETE CASCADE,
    balance DECIMAL(12,2) DEFAULT 0.00,
    currency VARCHAR(3) DEFAULT 'INR',
    last_transaction_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Wallet transactions
CREATE TABLE wallet_transactions (
    id SERIAL PRIMARY KEY,
    wallet_id INTEGER REFERENCES partner_wallets(id) ON DELETE CASCADE,
    transaction_type VARCHAR(20) NOT NULL, -- credit, debit, commission
    amount DECIMAL(12,2) NOT NULL,
    description TEXT,
    reference_id VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Withdrawal requests
CREATE TABLE withdrawal_requests (
    id SERIAL PRIMARY KEY,
    wallet_id INTEGER REFERENCES partner_wallets(id) ON DELETE CASCADE,
    amount DECIMAL(12,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending', -- pending, approved, rejected, processed
    bank_details JSONB,
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP,
    notes TEXT
);

-- Route rules for geographic assignment
CREATE TABLE route_rules (
    id SERIAL PRIMARY KEY,
    partner_id INTEGER REFERENCES partners(id) ON DELETE CASCADE,
    postal_codes TEXT[], -- Array of postal codes
    states TEXT[], -- Array of states
    cities TEXT[], -- Array of cities
    priority INTEGER DEFAULT 1,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ====================================================
-- DEVICE MANAGEMENT TABLES
-- ====================================================

-- Device types (smartphones, laptops, etc.)
CREATE TABLE device_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    icon VARCHAR(100),
    active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Device brands
CREATE TABLE brands (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    logo VARCHAR(255),
    website VARCHAR(255),
    active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Device models with pricing
CREATE TABLE device_models (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    brand_id INTEGER REFERENCES brands(id) ON DELETE CASCADE,
    device_type_id INTEGER REFERENCES device_types(id) ON DELETE CASCADE,
    base_price DECIMAL(10,2), -- USD base price
    image VARCHAR(255),
    specifications JSONB,
    release_year INTEGER,
    active BOOLEAN DEFAULT true,
    featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Device model variants (storage, color options)
CREATE TABLE device_model_variants (
    id SERIAL PRIMARY KEY,
    model_id INTEGER REFERENCES device_models(id) ON DELETE CASCADE,
    variant_name VARCHAR(255) NOT NULL, -- "128GB Space Gray"
    storage_capacity VARCHAR(50), -- "128GB", "256GB"
    color VARCHAR(50), -- "Space Gray", "Silver"
    price_modifier DECIMAL(8,2) DEFAULT 0.00, -- Price difference from base
    sku VARCHAR(100),
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Brand-device type relationships
CREATE TABLE brand_device_types (
    id SERIAL PRIMARY KEY,
    brand_id INTEGER REFERENCES brands(id) ON DELETE CASCADE,
    device_type_id INTEGER REFERENCES device_types(id) ON DELETE CASCADE,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(brand_id, device_type_id)
);

-- ====================================================
-- QUESTION & ASSESSMENT SYSTEM
-- ====================================================

-- Question groups for categorization
CREATE TABLE question_groups (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    statement TEXT NOT NULL, -- Legacy compatibility
    description TEXT,
    category VARCHAR(100) DEFAULT 'general', -- screen, battery, physical, functional
    device_types TEXT[], -- Which device types this applies to
    device_type_id INTEGER, -- Legacy compatibility
    icon TEXT,
    sort_order INTEGER DEFAULT 0,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Questions with device targeting
CREATE TABLE questions (
    id SERIAL PRIMARY KEY,
    question_group_id INTEGER REFERENCES question_groups(id) ON DELETE CASCADE,
    question_text TEXT, -- Legacy column
    text TEXT, -- New standardized column
    question_type TEXT, -- Legacy column
    type question_type DEFAULT 'multiple_choice', -- New enum column
    group_id INTEGER, -- Legacy column
    required BOOLEAN DEFAULT true,
    help_text TEXT,
    tooltip TEXT, -- Legacy column
    device_model_ids TEXT[], -- Specific models this question applies to
    brand_ids TEXT[], -- Specific brands this question applies to
    applicable_models TEXT, -- JSON string for complex rules
    sort_order INTEGER DEFAULT 0,
    "order" INTEGER, -- Legacy column
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Answer choices with price impact
CREATE TABLE answer_choices (
    id SERIAL PRIMARY KEY,
    question_id INTEGER REFERENCES questions(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    answer_text TEXT, -- Legacy column
    value TEXT NOT NULL,
    price_impact DECIMAL(10,2) DEFAULT 0, -- Fixed price impact
    percentage_impact DECIMAL(5,2) DEFAULT 0, -- Percentage impact
    impact DECIMAL(10,2), -- Legacy column
    severity VARCHAR(50) DEFAULT 'none', -- none, minor, major, critical
    icon_color VARCHAR(20) DEFAULT 'gray',
    icon TEXT, -- Legacy column
    weightage REAL, -- Legacy column
    repair_cost REAL, -- Legacy column
    follow_up_action JSONB, -- Legacy column
    device_specific BOOLEAN DEFAULT false,
    is_default BOOLEAN DEFAULT false, -- Legacy column
    sort_order INTEGER DEFAULT 0,
    "order" INTEGER, -- Legacy column
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Device question mappings for model-specific assignments
CREATE TABLE device_question_mappings (
    id SERIAL PRIMARY KEY,
    device_model_id INTEGER REFERENCES device_models(id) ON DELETE CASCADE,
    question_id INTEGER REFERENCES questions(id) ON DELETE CASCADE,
    required BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(device_model_id, question_id)
);

-- Product question mappings (alternative mapping system)
CREATE TABLE product_question_mappings (
    id SERIAL PRIMARY KEY,
    product_id INTEGER, -- Generic product reference
    question_id INTEGER REFERENCES questions(id) ON DELETE CASCADE,
    device_type_id INTEGER REFERENCES device_types(id),
    brand_id INTEGER REFERENCES brands(id),
    model_pattern VARCHAR(255), -- Pattern matching for models
    required BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ====================================================
-- BUYBACK & TRANSACTION TABLES
-- ====================================================

-- Buyback requests from customers
CREATE TABLE buyback_requests (
    id SERIAL PRIMARY KEY,
    order_id VARCHAR(50) UNIQUE NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    device_type VARCHAR(100) NOT NULL,
    manufacturer VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    condition VARCHAR(50) NOT NULL,
    offered_price DECIMAL(10,2) NOT NULL,
    final_price DECIMAL(10,2),
    status VARCHAR(20) DEFAULT 'pending', -- pending, accepted, rejected, completed
    pickup_address TEXT NOT NULL,
    pickup_date DATE,
    pickup_time VARCHAR(20),
    condition_answers JSONB, -- Assessment question responses
    notes TEXT,
    partner_id INTEGER REFERENCES partners(id),
    staff_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ====================================================
-- INDIAN LOCALIZATION TABLES
-- ====================================================

-- Indian states master data
CREATE TABLE indian_states (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(3) NOT NULL UNIQUE, -- State code (MH, DL, etc.)
    gst_code VARCHAR(2), -- GST state code
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indian cities with state relationships
CREATE TABLE indian_cities (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    state_id INTEGER REFERENCES indian_states(id) ON DELETE CASCADE,
    district VARCHAR(100),
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    population INTEGER,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indian postal codes for PIN code validation
CREATE TABLE indian_postal_codes (
    pincode VARCHAR(6) PRIMARY KEY,
    office_name TEXT,
    district TEXT,
    state_id INTEGER REFERENCES indian_states(id),
    city_id INTEGER REFERENCES indian_cities(id),
    delivery_status TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- GST configuration for tax calculations
CREATE TABLE gst_configuration (
    id SERIAL PRIMARY KEY,
    gst_rate REAL NOT NULL,
    applicable_from DATE NOT NULL,
    applicable_to DATE,
    product_category TEXT,
    state_id INTEGER REFERENCES indian_states(id),
    is_active BOOLEAN DEFAULT true,
    created_by INTEGER REFERENCES users(id),
    effective_from DATE NOT NULL,
    effective_to DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ====================================================
-- FEATURE & CONFIGURATION TABLES
-- ====================================================

-- Feature toggles for A/B testing and gradual rollouts
CREATE TABLE feature_toggles (
    id SERIAL PRIMARY KEY,
    feature_key VARCHAR(100) UNIQUE NOT NULL,
    feature_name VARCHAR(255) NOT NULL,
    description TEXT,
    is_enabled BOOLEAN DEFAULT false,
    environments TEXT[] DEFAULT ARRAY['development'], -- development, staging, production
    user_percentage INTEGER DEFAULT 0, -- Percentage of users to enable for
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Partner service areas for geographic coverage
CREATE TABLE partner_service_areas (
    id SERIAL PRIMARY KEY,
    partner_id INTEGER REFERENCES partners(id) ON DELETE CASCADE,
    state_id INTEGER REFERENCES indian_states(id),
    city_id INTEGER REFERENCES indian_cities(id),
    postal_codes TEXT[], -- Specific PIN codes served
    service_radius INTEGER, -- Radius in kilometers
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ====================================================
-- INDEXES FOR PERFORMANCE
-- ====================================================

-- Authentication and sessions
CREATE INDEX idx_sessions_expire ON sessions(expire);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);

-- Device management indexes
CREATE INDEX idx_device_models_brand ON device_models(brand_id);
CREATE INDEX idx_device_models_type ON device_models(device_type_id);
CREATE INDEX idx_device_models_active ON device_models(active);
CREATE INDEX idx_device_variants_model ON device_model_variants(model_id);

-- Question system indexes
CREATE INDEX idx_questions_group ON questions(question_group_id);
CREATE INDEX idx_questions_active ON questions(active);
CREATE INDEX idx_answer_choices_question ON answer_choices(question_id);
CREATE INDEX idx_device_mappings_model ON device_question_mappings(device_model_id);
CREATE INDEX idx_device_mappings_question ON device_question_mappings(question_id);

-- Buyback and transaction indexes
CREATE INDEX idx_buyback_status ON buyback_requests(status);
CREATE INDEX idx_buyback_partner ON buyback_requests(partner_id);
CREATE INDEX idx_buyback_created ON buyback_requests(created_at);
CREATE INDEX idx_wallet_transactions_wallet ON wallet_transactions(wallet_id);

-- Geographic indexes
CREATE INDEX idx_postal_codes_state ON indian_postal_codes(state_id);
CREATE INDEX idx_cities_state ON indian_cities(state_id);

-- ====================================================
-- SAMPLE DATA INSERT
-- ====================================================

-- Insert default admin user
INSERT INTO users (username, email, password_hash, full_name, role, status) VALUES
('admin', 'admin@buyback.com', '$2b$10$rQFDGbK1z8z8z8z8z8z8z.', 'System Administrator', 'admin', 'active');

-- Insert device types
INSERT INTO device_types (name, slug, description, icon, sort_order, active) VALUES
('Smartphone', 'smartphone', 'Mobile phones and smartphones', 'smartphone', 1, true),
('Laptop', 'laptop', 'Laptops and notebooks', 'laptop', 2, true),
('Tablet', 'tablet', 'Tablets and iPads', 'tablet', 3, true),
('Smartwatch', 'smartwatch', 'Wearable smart devices', 'watch', 4, true),
('Headphones', 'headphones', 'Audio devices and headphones', 'headphones', 5, true);

-- Insert popular brands
INSERT INTO brands (name, slug, logo, sort_order, active) VALUES
('Apple', 'apple', '/assets/brands/apple.png', 1, true),
('Samsung', 'samsung', '/assets/brands/samsung.png', 2, true),
('OnePlus', 'oneplus', '/assets/brands/oneplus.png', 3, true),
('Google', 'google', '/assets/brands/google.png', 4, true),
('Xiaomi', 'xiaomi', '/assets/brands/xiaomi.png', 5, true);

-- Insert sample device models
INSERT INTO device_models (name, slug, brand_id, device_type_id, base_price, image, release_year, active, featured) VALUES
('iPhone 13', 'iphone-13', 1, 1, 300.00, '/assets/models/iphone-13.png', 2021, true, true),
('iPhone 14', 'iphone-14', 1, 1, 400.00, '/assets/models/iphone-14.png', 2022, true, true),
('Galaxy S24', 'galaxy-s24', 2, 1, 280.00, '/assets/models/galaxy-s24.png', 2024, true, true),
('MacBook Air M2', 'macbook-air-m2', 1, 2, 800.00, '/assets/models/macbook-air-m2.png', 2022, true, true),
('iPad Pro 12.9"', 'ipad-pro-12', 1, 3, 600.00, '/assets/models/ipad-pro.png', 2023, true, false);

-- Insert brand-device type relationships
INSERT INTO brand_device_types (brand_id, device_type_id, active) VALUES
(1, 1, true), -- Apple smartphones
(1, 2, true), -- Apple laptops
(1, 3, true), -- Apple tablets
(2, 1, true), -- Samsung smartphones
(2, 3, true), -- Samsung tablets
(3, 1, true), -- OnePlus smartphones
(4, 1, true), -- Google smartphones
(5, 1, true); -- Xiaomi smartphones

-- Insert sample question groups
INSERT INTO question_groups (name, statement, description, category, device_types, sort_order, active) VALUES
('Screen Assessment', 'Screen Physical Condition?', 'Questions related to screen condition and functionality', 'screen', ARRAY['smartphone', 'tablet', 'laptop'], 1, true),
('Battery Performance', 'Battery Health Check', 'Questions about battery health and charging capabilities', 'battery', ARRAY['smartphone', 'tablet', 'laptop'], 2, true),
('Physical Condition', 'Overall Physical State', 'Questions about overall physical appearance and damage', 'physical', NULL, 3, true),
('Functional Testing', 'Device Functionality', 'Questions about device functionality and performance', 'functional', NULL, 4, true);

-- Insert sample questions
INSERT INTO questions (question_group_id, text, question_text, type, question_type, required, help_text, sort_order, active) VALUES
(1, 'What is the current condition of the screen?', 'What is the current condition of the screen?', 'multiple_choice', 'multiple_choice', true, 'Check for cracks, scratches, dead pixels, or discoloration', 1, true),
(1, 'Are there any dead pixels on the display?', 'Are there any dead pixels on the display?', 'multiple_choice', 'multiple_choice', true, 'Look closely for stuck or dead pixels', 2, true),
(2, 'How long does the battery last on full charge?', 'How long does the battery last on full charge?', 'multiple_choice', 'multiple_choice', true, 'Based on typical daily usage patterns', 1, true),
(3, 'Overall physical condition of the device?', 'Overall physical condition of the device?', 'multiple_choice', 'multiple_choice', true, 'Check for dents, scratches, and general wear', 1, true);

-- Insert sample answer choices
INSERT INTO answer_choices (question_id, text, answer_text, value, percentage_impact, severity, sort_order, active) VALUES
-- Screen condition answers
(1, 'Perfect - No visible damage', 'Perfect - No visible damage', 'perfect', 0, 'none', 1, true),
(1, 'Excellent - Minor micro-scratches', 'Excellent - Minor micro-scratches', 'excellent', -2, 'minor', 2, true),
(1, 'Good - Light scratches, functional', 'Good - Light scratches, functional', 'good', -8, 'minor', 3, true),
(1, 'Fair - Visible scratches, no cracks', 'Fair - Visible scratches, no cracks', 'fair', -20, 'major', 4, true),
(1, 'Poor - Cracks or significant damage', 'Poor - Cracks or significant damage', 'poor', -40, 'critical', 5, true),

-- Dead pixels answers
(2, 'No dead pixels detected', 'No dead pixels detected', 'no_dead_pixels', 0, 'none', 1, true),
(2, '1-2 dead pixels in corner', '1-2 dead pixels in corner', 'minor_dead_pixels', -5, 'minor', 2, true),
(2, '3-5 dead pixels scattered', '3-5 dead pixels scattered', 'moderate_dead_pixels', -15, 'major', 3, true),
(2, 'Multiple dead pixels affected', 'Multiple dead pixels affected', 'major_dead_pixels', -35, 'critical', 4, true),

-- Battery life answers
(3, 'Full day usage (8+ hours)', 'Full day usage (8+ hours)', 'battery_excellent', 0, 'none', 1, true),
(3, 'Moderate usage (4-8 hours)', 'Moderate usage (4-8 hours)', 'battery_good', -5, 'minor', 2, true),
(3, 'Light usage (2-4 hours)', 'Light usage (2-4 hours)', 'battery_fair', -15, 'major', 3, true),
(3, 'Poor battery life (under 2 hours)', 'Poor battery life (under 2 hours)', 'battery_poor', -30, 'critical', 4, true),

-- Physical condition answers
(4, 'Like new condition', 'Like new condition', 'excellent', 0, 'none', 1, true),
(4, 'Minor wear signs', 'Minor wear signs', 'good', -10, 'minor', 2, true),
(4, 'Moderate wear and tear', 'Moderate wear and tear', 'fair', -25, 'major', 3, true),
(4, 'Significant damage visible', 'Significant damage visible', 'poor', -45, 'critical', 4, true);

-- Insert sample Indian states
INSERT INTO indian_states (name, code, gst_code, active) VALUES
('Delhi', 'DL', '07', true),
('Maharashtra', 'MH', '27', true),
('Karnataka', 'KA', '29', true),
('Tamil Nadu', 'TN', '33', true),
('Gujarat', 'GJ', '24', true),
('West Bengal', 'WB', '19', true),
('Rajasthan', 'RJ', '08', true),
('Uttar Pradesh', 'UP', '09', true);

-- Insert sample cities
INSERT INTO indian_cities (name, state_id, district, population, active) VALUES
('New Delhi', 1, 'New Delhi', 21000000, true),
('Mumbai', 2, 'Mumbai', 20000000, true),
('Bangalore', 3, 'Bangalore Urban', 12000000, true),
('Chennai', 4, 'Chennai', 10000000, true),
('Ahmedabad', 5, 'Ahmedabad', 8000000, true),
('Kolkata', 6, 'Kolkata', 15000000, true),
('Jaipur', 7, 'Jaipur', 4000000, true),
('Lucknow', 8, 'Lucknow', 3500000, true);

-- Insert sample postal codes
INSERT INTO indian_postal_codes (pincode, office_name, district, state_id, city_id, delivery_status, active) VALUES
('110001', 'New Delhi GPO', 'New Delhi', 1, 1, 'Delivery', true),
('400001', 'Mumbai GPO', 'Mumbai', 2, 2, 'Delivery', true),
('560001', 'Bangalore GPO', 'Bangalore Urban', 3, 3, 'Delivery', true),
('600001', 'Chennai GPO', 'Chennai', 4, 4, 'Delivery', true),
('380001', 'Ahmedabad GPO', 'Ahmedabad', 5, 5, 'Delivery', true);

-- Insert feature toggles
INSERT INTO feature_toggles (feature_key, feature_name, description, is_enabled, environments, user_percentage) VALUES
('question_targeting', 'Question Model Targeting', 'Enable device-specific question targeting', true, ARRAY['development', 'production'], 100),
('pin_code_autofill', 'PIN Code Auto-fill', 'Automatic city/state population from PIN code', true, ARRAY['development', 'production'], 100),
('advanced_pricing', 'Advanced Pricing Algorithm', 'ML-powered pricing calculations', false, ARRAY['development'], 25),
('partner_dashboard', 'Partner Dashboard', 'Enhanced partner portal features', true, ARRAY['development', 'production'], 100);

-- ====================================================
-- STORED PROCEDURES (Optional)
-- ====================================================

-- Function to calculate device price based on condition answers
CREATE OR REPLACE FUNCTION calculate_device_price(
    model_id INTEGER,
    condition_answers JSONB
) RETURNS DECIMAL(10,2) AS $$
DECLARE
    base_price DECIMAL(10,2);
    total_impact DECIMAL(5,2) := 0;
    final_price DECIMAL(10,2);
    answer_record RECORD;
BEGIN
    -- Get base price for the model
    SELECT dm.base_price INTO base_price 
    FROM device_models dm 
    WHERE dm.id = model_id;
    
    -- Calculate total impact from answers
    FOR answer_record IN 
        SELECT ac.percentage_impact
        FROM answer_choices ac
        WHERE ac.id IN (
            SELECT value::integer 
            FROM jsonb_each_text(condition_answers)
        )
    LOOP
        total_impact := total_impact + answer_record.percentage_impact;
    END LOOP;
    
    -- Calculate final price (convert USD to INR and apply impact)
    final_price := (base_price * 83) * (1 + total_impact / 100);
    
    -- Ensure minimum price of ₹1000
    IF final_price < 1000 THEN
        final_price := 1000;
    END IF;
    
    RETURN final_price;
END;
$$ LANGUAGE plpgsql;

-- ====================================================
-- BACKUP COMPLETE
-- ====================================================

-- Grant permissions (adjust as needed)
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO buyback_user;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO buyback_user;

-- Enable row level security (optional, for multi-tenant setup)
-- ALTER TABLE partners ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE buyback_requests ENABLE ROW LEVEL SECURITY;

COMMIT;