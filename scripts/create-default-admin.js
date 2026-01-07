const path = require('path');

// Try to use pg from auth service node_modules, or require it directly
let Pool;
try {
  // Try from auth service
  const authServicePath = path.join(__dirname, '..', 'backend', 'services', 'auth', 'node_modules', 'pg');
  Pool = require(authServicePath).Pool;
} catch {
  try {
    // Try from root or global
    Pool = require('pg').Pool;
  } catch {
    console.error('❌ pg module not found. Please install it: npm install pg dotenv');
    process.exit(1);
  }
}

try {
  require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
} catch {
  // dotenv optional
}

const pool = new Pool({
  host: process.env.DB_HOST || process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || process.env.POSTGRES_PORT || '5432'),
  database: process.env.DB_NAME || process.env.POSTGRES_DB || 'linkvesta',
  user: process.env.DB_USER || process.env.POSTGRES_USER || 'postgres',
  password: process.env.DB_PASSWORD || process.env.POSTGRES_PASSWORD || 'postgres',
});

async function createDefaultAdmin() {
  try {
    console.log('Connecting to database...');
    
    // Check if admin already exists
    const checkResult = await pool.query(
      "SELECT id FROM users WHERE role = 'admin' LIMIT 1"
    );

    if (checkResult.rows.length > 0) {
      console.log('✅ Admin user already exists!');
      await pool.end();
      return;
    }

    // Create default admin
    const passwordHash = '$2b$10$NTFZz.hEjJidHB7Vv.yKouczN2YDOAtM/Vn6FYOXfNHDjaCVd3KmK'; // admin123
    const result = await pool.query(
      `INSERT INTO users (email, password_hash, name, role) 
       VALUES ($1, $2, $3, $4) 
       RETURNING id, email, name, role`,
      ['admin@linkvesta.com', passwordHash, 'Default Admin', 'admin']
    );

    console.log('✅ Default admin account created successfully!');
    console.log('\nDefault Admin Credentials:');
    console.log('  Email: admin@linkvesta.com');
    console.log('  Password: admin123');
    console.log('\n⚠️  IMPORTANT: Change the password after first login!');
    
    await pool.end();
  } catch (error) {
    console.error('❌ Error creating default admin:', error.message || error);
    console.error('Error details:', error.code, error);
    if (error.code === 'ECONNREFUSED' || error.message?.includes('connect')) {
      console.error('\n⚠️  Could not connect to database. Make sure PostgreSQL is running.');
      console.error('   Trying to connect to:', {
        host: process.env.DB_HOST || process.env.POSTGRES_HOST || 'localhost',
        port: process.env.DB_PORT || process.env.POSTGRES_PORT || '5432',
        database: process.env.DB_NAME || process.env.POSTGRES_DB || 'linkvesta',
        user: process.env.DB_USER || process.env.POSTGRES_USER || 'postgres'
      });
    } else if (error.code === '42P01') {
      console.error('\n⚠️  Database tables do not exist. Please run migrations first:');
      console.error('   1. Run migration 001_initial_schema.sql');
      console.error('   2. Run migration 003_add_user_roles.sql');
      console.error('   3. Then run this script again');
    } else if (error.code === '3D000') {
      console.error('\n⚠️  Database does not exist. Please create the database first.');
    }
    try {
      await pool.end();
    } catch {}
    process.exit(1);
  }
}

createDefaultAdmin();
