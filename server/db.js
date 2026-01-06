const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5433,
  database: 'connectingservices',
  user: process.env.USER || 'clayarnold',
});

module.exports = pool;
