-- GadgetSwap Device Buyback Platform Database Schema
-- Complete database structure for production deployment
-- Generated: January 2025
-- Version: 2.1.0

-- Create database extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create enums
CREATE TYPE user_role AS ENUM ('customer', 'admin', 'partner', 'partner_staff', 'partner_manager', 'partner_owner');
CREATE TYPE user_status AS ENUM ('active', 'inactive', 'pending', 'suspended');
CREATE TYPE question_type AS ENUM ('single_choice', 'multiple_choice', 'text_input');
CREATE TYPE buyback_status AS ENUM ('pending', 'confirmed', 'picked_up', 'evaluated', 'paid', 'cancelled');
CREATE TYPE transaction_type AS ENUM ('credit', 'debit', 'commission', 'withdrawal', 'refund');

-- Sessions table for authentication
CREATE TABLE sessions (
    sid VARCHAR PRIMARY KEY,
    sess JSONB NOT NULL,
    expire TIMESTAMP NOT NULL
);
CREATE INDEX "IDX_session_expire" ON sessions (expire);

-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    first_name TEXT,
    last_name TEXT,
    role TEXT DEFAULT 'customer' NOT NULL,
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    partner_id INTEGER REFERENCES partners(id),
    region_id INTEGER,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Partners table
CREATE TABLE partners (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    address TEXT,
    logo TEXT,
    status TEXT DEFAULT 'active' NOT NULL,
    specialization TEXT,
    regions JSONB,
    device_types JSONB,
    pin_codes JSONB,
    commission_rate REAL DEFAULT 10 NOT NULL,
    tenant_id TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Partner Wallets
CREATE TABLE partner_wallets (
    id SERIAL PRIMARY KEY,
    partner_id INTEGER NOT NULL REFERENCES partners(id),
    current_balance DOUBLE PRECISION DEFAULT 0,
    total_earned DOUBLE PRECISION DEFAULT 0,
    total_withdrawn DOUBLE PRECISION DEFAULT 0,
    pending_amount DOUBLE PRECISION DEFAULT 0,
    currency TEXT DEFAULT 'INR',
    status TEXT DEFAULT 'active',
    last_updated TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Wallet Transactions
CREATE TABLE wallet_transactions (
    id SERIAL PRIMARY KEY,
    wallet_id INTEGER NOT NULL REFERENCES partner_wallets(id),
    transaction_type TEXT NOT NULL,
    amount DOUBLE PRECISION NOT NULL,
    balance_before DOUBLE PRECISION NOT NULL,
    balance_after DOUBLE PRECISION NOT NULL,
    reference TEXT,
    order_id TEXT,
    description TEXT,
    status TEXT DEFAULT 'completed',
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Partner Staff
CREATE TABLE partner_staff (
    id SERIAL PRIMARY KEY,
    partner_id INTEGER NOT NULL REFERENCES partners(id),
    user_id INTEGER REFERENCES users(id),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    role TEXT DEFAULT 'staff' NOT NULL,
    permissions JSONB,
    service_areas JSONB,
    status TEXT DEFAULT 'active',
    hire_date DATE,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Device Types
CREATE TABLE device_types (
    id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    icon TEXT,
    category TEXT,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Brands
CREATE TABLE brands (
    id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    logo TEXT,
    website TEXT,
    country TEXT,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Device Models
CREATE TABLE device_models (
    id SERIAL PRIMARY KEY,
    brand_id INTEGER NOT NULL REFERENCES brands(id),
    device_type_id INTEGER NOT NULL REFERENCES device_types(id),
    name TEXT NOT NULL,
    model_number TEXT,
    slug TEXT NOT NULL,
    image TEXT,
    specifications JSONB,
    release_date DATE,
    original_price DOUBLE PRECISION,
    base_buyback_price DOUBLE PRECISION,
    min_buyback_price DOUBLE PRECISION,
    max_buyback_price DOUBLE PRECISION,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
    UNIQUE(brand_id, slug)
);

-- Device Model Variants
CREATE TABLE device_model_variants (
    id SERIAL PRIMARY KEY,
    model_id INTEGER NOT NULL REFERENCES device_models(id),
    name TEXT NOT NULL,
    storage TEXT,
    color TEXT,
    ram TEXT,
    sku TEXT UNIQUE,
    original_price DOUBLE PRECISION,
    current_market_price DOUBLE PRECISION,
    base_buyback_price DOUBLE PRECISION,
    images JSONB,
    specifications JSONB,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Question Groups
CREATE TABLE question_groups (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT,
    device_type_ids JSONB,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Questions
CREATE TABLE questions (
    id SERIAL PRIMARY KEY,
    question_group_id INTEGER REFERENCES question_groups(id),
    text TEXT NOT NULL,
    description TEXT,
    question_type TEXT DEFAULT 'single_choice',
    device_type_ids JSONB,
    brand_ids JSONB,
    model_ids JSONB,
    is_required BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Answer Choices
CREATE TABLE answer_choices (
    id SERIAL PRIMARY KEY,
    question_id INTEGER NOT NULL REFERENCES questions(id),
    text TEXT NOT NULL,
    description TEXT,
    price_impact_percentage DOUBLE PRECISION DEFAULT 0,
    severity TEXT DEFAULT 'none',
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Buyback Requests
CREATE TABLE buyback_requests (
    id SERIAL PRIMARY KEY,
    tracking_id TEXT UNIQUE NOT NULL,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_address JSONB,
    device_type_id INTEGER REFERENCES device_types(id),
    brand_id INTEGER REFERENCES brands(id),
    model_id INTEGER REFERENCES device_models(id),
    variant_id INTEGER REFERENCES device_model_variants(id),
    device_info JSONB,
    assessment_responses JSONB,
    quoted_price DOUBLE PRECISION,
    final_price DOUBLE PRECISION,
    price_breakdown JSONB,
    status TEXT DEFAULT 'pending',
    partner_id INTEGER REFERENCES partners(id),
    agent_id INTEGER REFERENCES partner_staff(id),
    pickup_date DATE,
    pickup_time_slot TEXT,
    pickup_address JSONB,
    evaluation_notes TEXT,
    payment_method TEXT,
    payment_status TEXT DEFAULT 'pending',
    payment_details JSONB,
    cancellation_reason TEXT,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Indian Geographic Data
CREATE TABLE indian_states (
    id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    state_code TEXT UNIQUE NOT NULL,
    region TEXT,
    tier INTEGER DEFAULT 3,
    is_active BOOLEAN DEFAULT true
);

CREATE TABLE indian_cities (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    state_id INTEGER NOT NULL REFERENCES indian_states(id),
    district TEXT,
    tier INTEGER DEFAULT 3,
    population INTEGER,
    is_metro BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true
);

CREATE TABLE indian_postal_codes (
    id SERIAL PRIMARY KEY,
    pin_code TEXT UNIQUE NOT NULL,
    city_id INTEGER NOT NULL REFERENCES indian_cities(id),
    area_name TEXT,
    office_type TEXT,
    delivery_status TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    is_serviceable BOOLEAN DEFAULT true
);

-- Route Rules for Partner Assignment
CREATE TABLE route_rules (
    id SERIAL PRIMARY KEY,
    partner_id INTEGER NOT NULL REFERENCES partners(id),
    pin_codes JSONB NOT NULL,
    device_type_ids JSONB,
    priority INTEGER DEFAULT 1,
    max_orders_per_day INTEGER DEFAULT 50,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- User Feedback
CREATE TABLE user_feedback (
    id SERIAL PRIMARY KEY,
    user_email TEXT,
    page_url TEXT,
    feedback_type TEXT,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    message TEXT,
    device_info JSONB,
    is_anonymous BOOLEAN DEFAULT false,
    status TEXT DEFAULT 'open',
    response TEXT,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Error Reports
CREATE TABLE error_reports (
    id SERIAL PRIMARY KEY,
    error_type TEXT,
    error_message TEXT,
    stack_trace TEXT,
    user_agent TEXT,
    page_url TEXT,
    user_id INTEGER REFERENCES users(id),
    request_data JSONB,
    severity TEXT DEFAULT 'medium',
    status TEXT DEFAULT 'open',
    resolved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_partners_status ON partners(status);
CREATE INDEX idx_partner_wallets_partner_id ON partner_wallets(partner_id);
CREATE INDEX idx_wallet_transactions_wallet_id ON wallet_transactions(wallet_id);
CREATE INDEX idx_device_models_brand_id ON device_models(brand_id);
CREATE INDEX idx_device_models_device_type_id ON device_models(device_type_id);
CREATE INDEX idx_device_model_variants_model_id ON device_model_variants(model_id);
CREATE INDEX idx_questions_question_group_id ON questions(question_group_id);
CREATE INDEX idx_answer_choices_question_id ON answer_choices(question_id);
CREATE INDEX idx_buyback_requests_status ON buyback_requests(status);
CREATE INDEX idx_buyback_requests_tracking_id ON buyback_requests(tracking_id);
CREATE INDEX idx_buyback_requests_partner_id ON buyback_requests(partner_id);
CREATE INDEX idx_indian_cities_state_id ON indian_cities(state_id);
CREATE INDEX idx_indian_postal_codes_pin_code ON indian_postal_codes(pin_code);
CREATE INDEX idx_route_rules_partner_id ON route_rules(partner_id);

-- Insert default admin user (password: admin123)
INSERT INTO users (email, password_hash, first_name, last_name, role) VALUES 
('admin@buyback.com', '$2b$10$rOvHPRkpN/AUSL7FDlj/XOVKDXJg9fKBmJ4zX9XPqxZjKZVxG2O.W', 'Admin', 'User', 'admin');

-- Insert sample device types
INSERT INTO device_types (name, slug, description, icon, category) VALUES 
('Smartphones', 'smartphones', 'Mobile phones and smartphones', 'smartphone', 'mobile'),
('Laptops', 'laptops', 'Laptops and notebooks', 'laptop', 'computing'),
('Tablets', 'tablets', 'Tablets and iPads', 'tablet', 'mobile'),
('Smartwatches', 'smartwatches', 'Smart watches and fitness trackers', 'watch', 'wearable'),
('Headphones', 'headphones', 'Headphones and earbuds', 'headphones', 'audio'),
('Gaming Consoles', 'gaming-consoles', 'Gaming consoles and accessories', 'gamepad', 'gaming'),
('Cameras', 'cameras', 'Digital cameras and camcorders', 'camera', 'photography'),
('Smart Home', 'smart-home', 'Smart home devices and IoT', 'home', 'home');

-- Insert sample brands
INSERT INTO brands (name, slug, logo, website, country) VALUES 
('Apple', 'apple', '/brands/apple.png', 'https://apple.com', 'USA'),
('Samsung', 'samsung', '/brands/samsung.png', 'https://samsung.com', 'South Korea'),
('Google', 'google', '/brands/google.png', 'https://google.com', 'USA'),
('OnePlus', 'oneplus', '/brands/oneplus.png', 'https://oneplus.com', 'China'),
('Xiaomi', 'xiaomi', '/brands/xiaomi.png', 'https://xiaomi.com', 'China'),
('Nothing', 'nothing', '/brands/nothing.png', 'https://nothing.tech', 'UK'),
('Realme', 'realme', '/brands/realme.png', 'https://realme.com', 'China'),
('Vivo', 'vivo', '/brands/vivo.png', 'https://vivo.com', 'China'),
('Oppo', 'oppo', '/brands/oppo.png', 'https://oppo.com', 'China'),
('HP', 'hp', '/brands/hp.png', 'https://hp.com', 'USA'),
('Dell', 'dell', '/brands/dell.png', 'https://dell.com', 'USA'),
('Lenovo', 'lenovo', '/brands/lenovo.png', 'https://lenovo.com', 'China'),
('Asus', 'asus', '/brands/asus.png', 'https://asus.com', 'Taiwan'),
('Sony', 'sony', '/brands/sony.png', 'https://sony.com', 'Japan');

-- Insert Indian states
INSERT INTO indian_states (name, state_code, region, tier) VALUES 
('Maharashtra', 'MH', 'West', 1),
('Delhi', 'DL', 'North', 1),
('Karnataka', 'KA', 'South', 1),
('Tamil Nadu', 'TN', 'South', 1),
('Telangana', 'TS', 'South', 1),
('Gujarat', 'GJ', 'West', 1),
('Uttar Pradesh', 'UP', 'North', 2),
('West Bengal', 'WB', 'East', 2),
('Rajasthan', 'RJ', 'North', 2),
('Madhya Pradesh', 'MP', 'Central', 2);

-- Insert major cities
INSERT INTO indian_cities (name, state_id, district, tier, population, is_metro) VALUES 
('Mumbai', 1, 'Mumbai', 1, 12442373, true),
('New Delhi', 2, 'New Delhi', 1, 11034555, true),
('Bangalore', 3, 'Bangalore Urban', 1, 8443675, true),
('Chennai', 4, 'Chennai', 1, 7088000, true),
('Hyderabad', 5, 'Hyderabad', 1, 6809970, true),
('Ahmedabad', 6, 'Ahmedabad', 1, 5570585, true),
('Pune', 1, 'Pune', 1, 3124458, true),
('Kolkata', 8, 'Kolkata', 1, 4486679, true),
('Jaipur', 9, 'Jaipur', 2, 3046163, false),
('Lucknow', 7, 'Lucknow', 2, 2901474, false);

-- Create sample question groups
INSERT INTO question_groups (name, description, category) VALUES 
('Physical Condition', 'Assessment of physical damage and wear', 'physical'),
('Display Quality', 'Screen and display related questions', 'display'),
('Functionality', 'Device functionality and performance', 'functional'),
('Battery Health', 'Battery condition and charging', 'battery'),
('Connectivity', 'Network and connectivity features', 'connectivity'),
('Accessories', 'Original accessories and packaging', 'accessories');

-- Insert sample questions
INSERT INTO questions (question_group_id, text, question_type) VALUES 
(1, 'What is the overall physical condition of your device?', 'single_choice'),
(1, 'Are there any cracks or damage to the body?', 'single_choice'),
(1, 'Has the device been exposed to water?', 'single_choice'),
(2, 'How is the screen condition?', 'single_choice'),
(2, 'Are there any dead pixels or display issues?', 'single_choice'),
(2, 'Does the touch screen work properly?', 'single_choice'),
(3, 'Do all buttons work correctly?', 'single_choice'),
(3, 'How is the camera quality?', 'single_choice'),
(3, 'Do speakers and microphone work?', 'single_choice'),
(4, 'How is the battery life?', 'single_choice'),
(4, 'Does the device charge properly?', 'single_choice'),
(5, 'Do WiFi and Bluetooth work correctly?', 'single_choice'),
(6, 'Do you have the original charger?', 'single_choice'),
(6, 'Do you have the original box?', 'single_choice');

-- Insert answer choices with price impacts
INSERT INTO answer_choices (question_id, text, price_impact_percentage, severity) VALUES 
-- Physical condition answers
(1, 'Excellent (like new)', 5, 'none'),
(1, 'Very Good (minor wear)', 0, 'minor'),
(1, 'Good (noticeable wear)', -10, 'moderate'),
(1, 'Fair (significant wear)', -25, 'major'),
(1, 'Poor (heavy damage)', -40, 'critical'),

-- Body damage answers  
(2, 'No damage', 0, 'none'),
(2, 'Minor scratches', -5, 'minor'),
(2, 'Noticeable scratches', -15, 'moderate'),
(2, 'Cracks or dents', -30, 'major'),
(2, 'Severe damage', -50, 'critical'),

-- Water exposure answers
(3, 'Never exposed', 0, 'none'),
(3, 'Minor exposure, works fine', -10, 'minor'),
(3, 'Some exposure, minor issues', -25, 'moderate'),
(3, 'Water damage, major issues', -45, 'critical'),

-- Screen condition answers
(4, 'Perfect condition', 0, 'none'),
(4, 'Minor scratches', -5, 'minor'),
(4, 'Noticeable scratches', -15, 'moderate'),
(4, 'Cracks or major damage', -35, 'major'),

-- Display issues answers
(5, 'No issues', 0, 'none'),
(5, 'Minor display problems', -10, 'minor'),
(5, 'Noticeable display issues', -20, 'moderate'),
(5, 'Major display problems', -40, 'critical'),

-- Touch screen answers
(6, 'Works perfectly', 0, 'none'),
(6, 'Minor touch issues', -10, 'minor'),
(6, 'Significant touch problems', -25, 'major'),
(6, 'Touch not working', -50, 'critical');

-- Add more answer choices for remaining questions (7-14)
INSERT INTO answer_choices (question_id, text, price_impact_percentage, severity) VALUES 
-- Buttons functionality (question 7)
(7, 'All buttons work perfectly', 0, 'none'),
(7, 'Most buttons work, minor issues', -5, 'minor'),
(7, 'Some buttons not working', -15, 'moderate'),
(7, 'Multiple buttons not working', -30, 'major'),

-- Camera quality (question 8)
(8, 'Excellent quality', 0, 'none'),
(8, 'Good quality', -5, 'minor'),
(8, 'Average quality', -10, 'moderate'),
(8, 'Poor quality or not working', -25, 'major'),

-- Audio functionality (question 9)
(9, 'Perfect audio', 0, 'none'),
(9, 'Minor audio issues', -5, 'minor'),
(9, 'Significant audio problems', -15, 'moderate'),
(9, 'Audio not working', -30, 'major'),

-- Battery life (question 10)
(10, 'Excellent battery life', 5, 'none'),
(10, 'Good battery life', 0, 'minor'),
(10, 'Average battery life', -10, 'moderate'),
(10, 'Poor battery life', -20, 'major'),

-- Charging functionality (question 11)
(11, 'Charges perfectly', 0, 'none'),
(11, 'Minor charging issues', -5, 'minor'),
(11, 'Significant charging problems', -20, 'major'),
(11, 'Does not charge', -40, 'critical'),

-- Connectivity (question 12)
(12, 'All connectivity works', 0, 'none'),
(12, 'Minor connectivity issues', -5, 'minor'),
(12, 'Significant connectivity problems', -15, 'moderate'),

-- Original charger (question 13)
(13, 'Yes, have original charger', 2, 'none'),
(13, 'No, using compatible charger', 0, 'minor'),

-- Original box (question 14)
(14, 'Yes, have original box', 3, 'none'),
(14, 'No, no original box', 0, 'minor');