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

async function clearDatabase() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    console.log('🔍 Finding admin user...');
    
    // Get admin user data
    const adminResult = await client.query(
      "SELECT id, email, password_hash, name, role FROM users WHERE role = 'admin' LIMIT 1"
    );
    
    if (adminResult.rows.length === 0) {
      console.log('⚠️  No admin user found. Creating default admin...');
      // Create default admin
      const passwordHash = '$2b$10$NTFZz.hEjJidHB7Vv.yKouczN2YDOAtM/Vn6FYOXfNHDjaCVd3KmK'; // admin123
      await client.query(
        `INSERT INTO users (email, password_hash, name, role) 
         VALUES ($1, $2, $3, $4)`,
        ['admin@linkvesta.com', passwordHash, 'Default Admin', 'admin']
      );
      console.log('✅ Default admin created');
    } else {
      const admin = adminResult.rows[0];
      console.log(`✅ Found admin user: ${admin.email}`);
    }
    
    // Get admin user again (in case we just created it)
    const finalAdminResult = await client.query(
      "SELECT id, email, password_hash, name, role FROM users WHERE role = 'admin' LIMIT 1"
    );
    const admin = finalAdminResult.rows[0];
    const adminId = admin.id;
    const adminEmail = admin.email;
    const adminPasswordHash = admin.password_hash;
    const adminName = admin.name;
    const adminRole = admin.role;
    
    console.log('\n🗑️  Clearing database...');
    
    // Delete all data from tables (in order to respect foreign keys)
    // Delete from tables that reference other tables first
    
    console.log('  - Deleting business_reports...');
    await client.query('DELETE FROM business_reports');
    
    console.log('  - Deleting waitlist...');
    await client.query('DELETE FROM waitlist');
    
    console.log('  - Deleting businesses...');
    await client.query('DELETE FROM businesses');
    
    console.log('  - Deleting investors...');
    await client.query('DELETE FROM investors');
    
    console.log('  - Deleting files...');
    await client.query('DELETE FROM files');
    
    console.log('  - Deleting all users except admin...');
    await client.query('DELETE FROM users WHERE id != $1', [adminId]);
    
    // Verify admin still exists
    const verifyResult = await client.query(
      "SELECT id, email, password_hash, name, role FROM users WHERE role = 'admin'"
    );
    
    if (verifyResult.rows.length === 0) {
      // Re-insert admin if it was accidentally deleted
      console.log('  - Re-inserting admin user...');
      await client.query(
        `INSERT INTO users (email, password_hash, name, role) 
         VALUES ($1, $2, $3, $4)`,
        [adminEmail, adminPasswordHash, adminName, adminRole]
      );
    }
    
    await client.query('COMMIT');
    
    console.log('\n✅ Database cleared successfully!');
    console.log('\nAdmin user preserved:');
    console.log(`  Email: ${adminEmail}`);
    console.log(`  Name: ${adminName}`);
    console.log(`  Role: ${adminRole}`);
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error clearing database:', error.message || error);
    console.error('Error details:', error.code, error);
    if (error.code === 'ECONNREFUSED' || error.message?.includes('connect')) {
      console.error('\n⚠️  Could not connect to database. Make sure PostgreSQL is running.');
    }
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

clearDatabase().catch(() => {
  process.exit(1);
});
