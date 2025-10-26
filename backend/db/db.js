require('dotenv').config(); // Load local .env file ONLY for local testing
const { Pool } = require('pg');

// Use Render's DATABASE_URL if available (in production), otherwise use local .env variables
const connectionString = process.env.DATABASE_URL;

// Configuration object
const dbConfig = connectionString
  ? { connectionString: connectionString,
      // IMPORTANT: Render often requires SSL for external connections
      ssl: { rejectUnauthorized: false } }
  : { // Fallback for local development using .env file
      user: process.env.DB_USER,
      host: process.env.DB_HOST,
      database: process.env.DB_DATABASE,
      password: process.env.DB_PASSWORD,
      port: process.env.DB_PORT,
    };

const pool = new Pool(dbConfig);

// Optional: Add basic connection logging
pool.on('connect', () => {
  console.log('Database pool connected');
});
pool.on('error', (err) => {
  console.error('Database pool error:', err);
});


module.exports = pool;