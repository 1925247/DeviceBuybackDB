-- Lead Completion Process Schema
-- Tables for Post-Revaluation → Completion Flow

-- Lead Photos Table
CREATE TABLE IF NOT EXISTS lead_photos (
  id SERIAL PRIMARY KEY,
  lead_id INTEGER NOT NULL,
  photo_type VARCHAR(50) NOT NULL, -- 'front', 'back', 'left', 'right', 'top', 'bottom'
  photo_url TEXT NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_size INTEGER,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  agent_id VARCHAR(50) NOT NULL
);

-- Lead KYC Table
CREATE TABLE IF NOT EXISTS lead_kyc (
  id SERIAL PRIMARY KEY,
  lead_id INTEGER NOT NULL UNIQUE,
  customer_name VARCHAR(255) NOT NULL,
  id_type VARCHAR(50) NOT NULL, -- 'aadhaar', 'pan', 'passport', 'driving_license'
  id_number VARCHAR(100) NOT NULL,
  id_photo_front TEXT, -- File path
  id_photo_back TEXT, -- File path (if applicable)
  customer_selfie TEXT NOT NULL, -- File path
  verification_status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'verified', 'rejected'
  verified_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  agent_id VARCHAR(50) NOT NULL
);

-- Lead Payments Table
CREATE TABLE IF NOT EXISTS lead_payments (
  id SERIAL PRIMARY KEY,
  lead_id INTEGER NOT NULL UNIQUE,
  payment_method VARCHAR(50) NOT NULL, -- 'cash', 'bank_transfer', 'upi', 'cheque'
  amount DECIMAL(10,2) NOT NULL,
  account_details TEXT, -- Bank details or UPI ID
  transfer_proof TEXT, -- File path for proof
  payment_status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'confirmed'
  confirmed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  agent_id VARCHAR(50) NOT NULL
);

-- Lead Completion Status Table
CREATE TABLE IF NOT EXISTS lead_completion_status (
  id SERIAL PRIMARY KEY,
  lead_id INTEGER NOT NULL UNIQUE,
  revaluation_completed BOOLEAN DEFAULT FALSE,
  photos_uploaded BOOLEAN DEFAULT FALSE,
  kyc_completed BOOLEAN DEFAULT FALSE,
  payment_confirmed BOOLEAN DEFAULT FALSE,
  device_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP,
  agent_id VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_lead_photos_lead_id ON lead_photos(lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_kyc_lead_id ON lead_kyc(lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_payments_lead_id ON lead_payments(lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_completion_lead_id ON lead_completion_status(lead_id);

-- Insert initial completion status for existing leads
INSERT INTO lead_completion_status (lead_id, agent_id, revaluation_completed)
SELECT 
  1001 as lead_id, 
  'AGENT001' as agent_id, 
  TRUE as revaluation_completed
WHERE NOT EXISTS (SELECT 1 FROM lead_completion_status WHERE lead_id = 1001);

INSERT INTO lead_completion_status (lead_id, agent_id, revaluation_completed)
SELECT 
  1002 as lead_id, 
  'AGENT001' as agent_id, 
  TRUE as revaluation_completed
WHERE NOT EXISTS (SELECT 1 FROM lead_completion_status WHERE lead_id = 1002);

INSERT INTO lead_completion_status (lead_id, agent_id, revaluation_completed)
SELECT 
  1003 as lead_id, 
  'AGENT001' as agent_id, 
  TRUE as revaluation_completed
WHERE NOT EXISTS (SELECT 1 FROM lead_completion_status WHERE lead_id = 1003);