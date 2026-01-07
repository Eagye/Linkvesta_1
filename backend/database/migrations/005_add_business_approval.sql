-- LinkVesta Database Schema
-- PostgreSQL Migration: Add Business Approval System
-- Only approved businesses will be displayed on the main page

-- Add approved column to businesses table (default to false)
ALTER TABLE businesses 
ADD COLUMN IF NOT EXISTS approved BOOLEAN DEFAULT false;

-- Create index on approved for faster queries
CREATE INDEX IF NOT EXISTS idx_businesses_approved ON businesses(approved);

-- Mark existing businesses as not approved (they need admin approval)
UPDATE businesses SET approved = false WHERE approved IS NULL;
