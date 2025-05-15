-- Create partner_wallets table
CREATE TABLE IF NOT EXISTS partner_wallets (
  id SERIAL PRIMARY KEY,
  partner_id INTEGER NOT NULL REFERENCES partners(id),
  balance DECIMAL(12, 2) NOT NULL DEFAULT 0,
  pending_balance DECIMAL(12, 2) DEFAULT 0,
  pan_number TEXT,
  bank_account_number TEXT,
  bank_ifsc TEXT,
  bank_name TEXT,
  account_holder_name TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  verification_date TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create wallet_transactions table
CREATE TABLE IF NOT EXISTS wallet_transactions (
  id SERIAL PRIMARY KEY,
  wallet_id INTEGER NOT NULL REFERENCES partner_wallets(id),
  amount DECIMAL(12, 2) NOT NULL,
  type TEXT NOT NULL, -- credit, debit
  status TEXT NOT NULL DEFAULT 'completed', -- pending, completed, failed
  description TEXT NOT NULL,
  reference_id TEXT,
  reference_type TEXT,
  metadata JSONB,
  transaction_date TIMESTAMP NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create withdrawal_requests table
CREATE TABLE IF NOT EXISTS withdrawal_requests (
  id SERIAL PRIMARY KEY,
  wallet_id INTEGER NOT NULL REFERENCES partner_wallets(id),
  amount DECIMAL(12, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, approved, rejected, processed
  transaction_id INTEGER REFERENCES wallet_transactions(id),
  payment_method TEXT NOT NULL, -- bank_transfer, upi, etc.
  payment_details JSONB,
  notes TEXT,
  processed_by INTEGER REFERENCES users(id),
  processed_date TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_partner_wallets_partner_id ON partner_wallets(partner_id);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_wallet_id ON wallet_transactions(wallet_id);
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_wallet_id ON withdrawal_requests(wallet_id);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_reference_id ON wallet_transactions(reference_id);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_type ON wallet_transactions(type);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_status ON wallet_transactions(status);
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_status ON withdrawal_requests(status);