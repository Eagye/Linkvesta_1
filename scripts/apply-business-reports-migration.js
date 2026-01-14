const fs = require('fs');
const path = require('path');

// Try to use pg from auth service node_modules
let Pool;
try {
  const authServicePath = path.join(__dirname, '..', 'backend', 'services', 'auth', 'node_modules', 'pg');
  Pool = require(authServicePath).Pool;
} catch {
  try {
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

async function applyMigration() {
  try {
    console.log('Connecting to database...');
    
    const migrationFile = path.join(__dirname, '..', 'backend', 'database', 'migrations', '011_create_business_reports_table.sql');
    const sql = fs.readFileSync(migrationFile, 'utf8');
    
    console.log('Applying business_reports table migration...');
    await pool.query(sql);
    
    console.log('✅ Business reports table migration applied successfully!');
    
    // Verify table was created
    const tableResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'business_reports';
    `);
    
    if (tableResult.rows.length > 0) {
      console.log('✅ Verified: business_reports table exists');
    } else {
      console.log('⚠️  Warning: business_reports table not found after migration');
    }
    
    await pool.end();
  } catch (error) {
    console.error('❌ Error applying migration:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.error('\n⚠️  Could not connect to database. Make sure PostgreSQL is running.');
    }
    await pool.end();
    process.exit(1);
  }
}

applyMigration();
