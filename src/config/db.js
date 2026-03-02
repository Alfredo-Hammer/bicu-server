const { Pool } = require('pg');
require('dotenv').config();

// Render usa DATABASE_URL, desarrollo usa variables individuales
const pool = process.env.DATABASE_URL
  ? new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  })
  : new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

pool.on('connect', () => {
  console.log('✓ Database pool connection established');
});

pool.on('error', (err) => {
  console.error('═══════════════════════════════════════════');
  console.error('✗ CRITICAL: PostgreSQL pool error');
  console.error('✗ Error:', err.message);
  console.error('✗ Code:', err.code);
  console.error('✗ Stack:', err.stack);
  console.error('═══════════════════════════════════════════');
  process.exit(-1);
});

// Log de configuración en producción
if (process.env.NODE_ENV === 'production') {
  console.log('✓ Database configured with DATABASE_URL (PostgreSQL)');
} else {
  console.log(`✓ Database configured: ${process.env.DB_NAME}@${process.env.DB_HOST}:${process.env.DB_PORT}`);
}

const query = (text, params) => pool.query(text, params);
const connect = () => pool.connect();

module.exports = {
  query,
  pool,
  connect,
};
