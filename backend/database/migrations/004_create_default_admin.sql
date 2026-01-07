-- LinkVesta Database Schema
-- PostgreSQL Migration: Create Default Admin User
-- Default credentials: admin@linkvesta.com / admin123
-- IMPORTANT: Change the password after first login in production!

-- Insert default admin user (only if no admin exists)
INSERT INTO users (email, password_hash, name, role)
SELECT 'admin@linkvesta.com', '$2b$10$NTFZz.hEjJidHB7Vv.yKouczN2YDOAtM/Vn6FYOXfNHDjaCVd3KmK', 'Default Admin', 'admin'
WHERE NOT EXISTS (
    SELECT 1 FROM users WHERE role = 'admin'
);
