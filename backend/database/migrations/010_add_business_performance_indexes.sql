-- LinkVesta Database Schema
-- PostgreSQL Migration: Add Performance Indexes for Businesses
-- Improves query performance for businesses listing

-- Composite index for approved businesses ordered by created_at
-- This index optimizes the query: SELECT ... FROM businesses WHERE approved = true ORDER BY created_at DESC
CREATE INDEX IF NOT EXISTS idx_businesses_approved_created_at ON businesses(approved, created_at DESC);

-- Index on created_at for general sorting
CREATE INDEX IF NOT EXISTS idx_businesses_created_at ON businesses(created_at DESC);

-- Analyze tables to update statistics
ANALYZE businesses;
ANALYZE users;
ANALYZE investors;
