-- Add email verification fields to users table
-- Migration: 008_add_email_verification.sql

-- Add email_verified column (defaults to false for new users)
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false;

-- Add verification_token column (stores the token for email verification)
ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_token VARCHAR(255);

-- Add verification_token_expires_at column (24 hours from creation)
ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_token_expires_at TIMESTAMP;

-- Create index on verification_token for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_verification_token ON users(verification_token);

-- Create index on email_verified for filtering
CREATE INDEX IF NOT EXISTS idx_users_email_verified ON users(email_verified);

-- Update existing users to have email_verified = true (grandfather clause)
-- This assumes existing users have already been verified
UPDATE users SET email_verified = true WHERE email_verified IS NULL;
