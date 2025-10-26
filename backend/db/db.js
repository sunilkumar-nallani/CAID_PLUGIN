require('dotenv').config(); // Load variables from .env file
const { Pool } = require('pg');

const connectionString = process.env.DATABASE_URL; // Render sets this variable automatically

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

module.exports = pool;