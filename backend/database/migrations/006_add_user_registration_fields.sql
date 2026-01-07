-- LinkVesta Database Schema
-- PostgreSQL Migration: Add User Registration Fields
-- Adds phone_number, country, and account_type fields to users table

-- Add phone_number column
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS phone_number VARCHAR(50);

-- Add country column
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS country VARCHAR(100);

-- Add account_type column (user, investor, or startup)
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS account_type VARCHAR(50) CHECK (account_type IN ('user', 'investor', 'startup'));

-- Create index on account_type for faster queries
CREATE INDEX IF NOT EXISTS idx_users_account_type ON users(account_type);
