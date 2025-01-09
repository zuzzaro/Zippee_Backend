// zippee-backend - File:src/db.js

const { Pool } = require('pg');
require('dotenv').config()

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

module.exports = {
  query: (text, params) => pool.query(text, params),
};

// test
//const { query } = require('./db');
//
//async function testConnection() {
//  try {
//    const res = await query('SELECT NOW()');
//    console.log('Connessione al database riuscita:', res.rows[0].now);
//  } catch (err) {
//    console.error('Errore di connessione al database:', err);
//  }
//}
//
//testConnection();