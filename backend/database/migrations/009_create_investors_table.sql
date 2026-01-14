-- LinkVesta Database Schema
-- PostgreSQL Migration: Create Investors Table
-- Investors require admin approval before they can access the system

-- Create investors table
CREATE TABLE IF NOT EXISTS investors (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    phone_number VARCHAR(50),
    country VARCHAR(100),
    approved BOOLEAN DEFAULT false,
    approved_at TIMESTAMP,
    approved_by INTEGER REFERENCES users(id),
    rejection_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_investors_email ON investors(email);
CREATE INDEX IF NOT EXISTS idx_investors_user_id ON investors(user_id);
CREATE INDEX IF NOT EXISTS idx_investors_approved ON investors(approved);
CREATE INDEX IF NOT EXISTS idx_investors_created_at ON investors(created_at);

-- Create trigger for updated_at
CREATE TRIGGER update_investors_updated_at BEFORE UPDATE ON investors
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
