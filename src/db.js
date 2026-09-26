const mysql = require('mysql2/promise');

module.exports = mysql.createPool({
  host: process.env.DB_HOST, port: process.env.DB_PORT,
  user: process.env.DB_USER, password: process.env.DB_PASS,
  database: process.env.DB_NAME, connectionLimit: 10, dateStrings: true
});
