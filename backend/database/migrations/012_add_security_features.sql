-- LinkVesta Database Schema
-- PostgreSQL Migration: Add Security Features
-- Adds password reset, account lockout, and security logging fields

-- Add password reset fields
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS password_reset_token VARCHAR(255);

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS password_reset_token_expires_at TIMESTAMP;

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS password_reset_at TIMESTAMP;

-- Add account lockout fields
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS failed_login_attempts INTEGER DEFAULT 0;

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS account_locked_until TIMESTAMP;

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP;

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS last_login_ip VARCHAR(45); -- IPv6 max length

-- Create indexes for security fields
CREATE INDEX IF NOT EXISTS idx_users_password_reset_token ON users(password_reset_token);
CREATE INDEX IF NOT EXISTS idx_users_account_locked_until ON users(account_locked_until);

-- Create security_events table for audit logging
CREATE TABLE IF NOT EXISTS security_events (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    event_type VARCHAR(50) NOT NULL, -- 'login_success', 'login_failure', 'password_reset', 'account_locked', etc.
    ip_address VARCHAR(45),
    user_agent TEXT,
    details JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes on security_events
CREATE INDEX IF NOT EXISTS idx_security_events_user_id ON security_events(user_id);
CREATE INDEX IF NOT EXISTS idx_security_events_event_type ON security_events(event_type);
CREATE INDEX IF NOT EXISTS idx_security_events_created_at ON security_events(created_at);
CREATE INDEX IF NOT EXISTS idx_security_events_ip_address ON security_events(ip_address);

-- Create password_history table to prevent password reuse
CREATE TABLE IF NOT EXISTS password_history (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index on password_history
CREATE INDEX IF NOT EXISTS idx_password_history_user_id ON password_history(user_id);
