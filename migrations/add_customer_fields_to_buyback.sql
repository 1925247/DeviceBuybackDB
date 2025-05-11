-- Add customer fields to buyback_requests table
ALTER TABLE buyback_requests 
ADD COLUMN IF NOT EXISTS customer_name TEXT,
ADD COLUMN IF NOT EXISTS customer_email TEXT,
ADD COLUMN IF NOT EXISTS customer_phone TEXT,
ADD COLUMN IF NOT EXISTS pickup_address TEXT,
ADD COLUMN IF NOT EXISTS pickup_date TEXT,
ADD COLUMN IF NOT EXISTS pickup_time TEXT;