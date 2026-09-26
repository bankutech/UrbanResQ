import fs from 'fs';
import path from 'path';

async function runSeed() {
  const seedPath = path.resolve(__dirname, '../../../database/seed_extra.sql');
  console.log(`Reading SQL from ${seedPath}...`);
  
  const sqlContent = fs.readFileSync(seedPath, 'utf8');
  
  const mysql = require('mysql2/promise');
  require('dotenv').config();

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    multipleStatements: true
  });

  try {
    console.log('Executing seed_extra.sql...');
    await connection.query(sqlContent);
    console.log('Extra seed completed successfully.');
  } catch (error) {
    console.error('Error executing seed:', error);
  } finally {
    await connection.end();
  }
}

runSeed();
