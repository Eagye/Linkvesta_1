-- LinkVesta Database Schema
-- PostgreSQL Migration: Businesses and Waitlist

-- Create businesses table
CREATE TABLE IF NOT EXISTS businesses (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    description TEXT,
    category_color VARCHAR(7) DEFAULT '#6b7280',
    logo_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create waitlist table
CREATE TABLE IF NOT EXISTS waitlist (
    id SERIAL PRIMARY KEY,
    business_id INTEGER REFERENCES businesses(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(business_id, email)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_businesses_category ON businesses(category);
CREATE INDEX IF NOT EXISTS idx_waitlist_business_id ON waitlist(business_id);
CREATE INDEX IF NOT EXISTS idx_waitlist_email ON waitlist(email);

-- Create trigger for businesses updated_at
CREATE TRIGGER update_businesses_updated_at BEFORE UPDATE ON businesses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample businesses (only if they don't exist)
INSERT INTO businesses (name, category, description, category_color)
SELECT * FROM (VALUES
    ('Solarify', 'Energy', 'Pay-as-you-go solar solutions for off-grid communities.', '#fbbf24'),
    ('EduLearn', 'Ed-Tech', 'AI-driven personalized learning for WASSCE students.', '#a855f7'),
    ('LogiTrak', 'Logistics', 'Last-mile delivery infrastructure for e-commerce.', '#6b7280')
) AS v(name, category, description, category_color)
WHERE NOT EXISTS (
    SELECT 1 FROM businesses WHERE businesses.name = v.name
);

