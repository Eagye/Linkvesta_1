-- LinkVesta Database Schema
-- PostgreSQL Migration: Business Reports/Archive Table
-- This table stores deleted businesses for future reference

-- Create business_reports table to archive deleted businesses
CREATE TABLE IF NOT EXISTS business_reports (
    id SERIAL PRIMARY KEY,
    original_business_id INTEGER NOT NULL,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    description TEXT,
    category_color VARCHAR(7) DEFAULT '#6b7280',
    logo_url TEXT,
    approved BOOLEAN DEFAULT false,
    deleted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_by INTEGER, -- Admin user ID who deleted the business
    deletion_reason TEXT, -- Optional reason for deletion
    created_at TIMESTAMP, -- Original creation timestamp
    updated_at TIMESTAMP -- Last update timestamp before deletion
);

-- Create indexes for business_reports
CREATE INDEX IF NOT EXISTS idx_business_reports_deleted_at ON business_reports(deleted_at DESC);
CREATE INDEX IF NOT EXISTS idx_business_reports_deleted_by ON business_reports(deleted_by);
CREATE INDEX IF NOT EXISTS idx_business_reports_original_id ON business_reports(original_business_id);
CREATE INDEX IF NOT EXISTS idx_business_reports_category ON business_reports(category);

-- Add comment to table
COMMENT ON TABLE business_reports IS 'Archived/deleted businesses for reporting and future reference';
