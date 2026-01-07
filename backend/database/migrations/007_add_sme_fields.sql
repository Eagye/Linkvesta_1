-- LinkVesta Database Schema
-- PostgreSQL Migration: Add SME/Startup Registration Fields
-- Adds TIN and business_registration_document fields to users table

-- Add TIN (Tax Identification Number) column
ALTER TABLE users
ADD COLUMN IF NOT EXISTS tin VARCHAR(50);

-- Add business_registration_document column (stores file path or URL)
ALTER TABLE users
ADD COLUMN IF NOT EXISTS business_registration_document TEXT;

-- Create index on TIN for faster queries
CREATE INDEX IF NOT EXISTS idx_users_tin ON users(tin);
