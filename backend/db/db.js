const { Pool } = require('pg');

// Get the connection string directly from Render's environment variable
const connectionString = process.env.DATABASE_URL;

// ** ADD THIS LOGGING LINE **
console.log("Attempting to connect using DATABASE_URL:", connectionString ? connectionString.replace(/:[^:]+@/, ':[PASSWORD_HIDDEN]@') : 'NOT FOUND'); // Log the string, hiding password

if (!connectionString) {
  console.error("FATAL ERROR: DATABASE_URL environment variable is not set!");
  process.exit(1); // Exit if the connection string is missing
}

// Configure the pool
const dbConfig = {
  connectionString: connectionString,
  // Render often requires SSL for external connections
  ssl: { rejectUnauthorized: false }
};

const pool = new Pool(dbConfig);

pool.on('connect', () => {
  console.log('Database pool connected successfully!');
});
pool.on('error', (err) => {
  console.error('DATABASE POOL ERROR:', err); // Make errors very clear
});

module.exports = pool;