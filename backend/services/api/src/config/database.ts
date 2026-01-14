import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

export const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'linkvesta',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  // Connection pool settings - optimized for multiple concurrent users
  max: parseInt(process.env.DB_POOL_MAX || '50'), // Increased from 20 to 50 for better concurrency
  min: parseInt(process.env.DB_POOL_MIN || '5'), // Minimum connections to keep alive
  idleTimeoutMillis: parseInt(process.env.DB_POOL_IDLE_TIMEOUT || '30000'), // 30 seconds
  connectionTimeoutMillis: parseInt(process.env.DB_POOL_CONNECTION_TIMEOUT || '10000'), // 10 seconds
  statement_timeout: parseInt(process.env.DB_STATEMENT_TIMEOUT || '30000'), // 30 second query timeout
  query_timeout: parseInt(process.env.DB_QUERY_TIMEOUT || '30000'), // 30 seconds
  // Allow connection reuse
  allowExitOnIdle: false,
});

// Test connection
pool.on('connect', () => {
  console.log('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

