-- Run this in Neon SQL editor to add paid tracking to expense shares
ALTER TABLE expense_shares ADD COLUMN IF NOT EXISTS paid BOOLEAN DEFAULT FALSE;
