import fs from 'fs';
import path from 'path';

async function reloadProcs() {
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
    const procsPath = path.resolve(__dirname, '../../../database/procedures.sql');
    console.log(`Reading SQL from ${procsPath}...`);
    
    // We can't just pass DELIMITER $$ to mysql2.
    // mysql2 multipleStatements=true doesn't support the DELIMITER keyword natively.
    // So we need to split on $$ manually and execute them.
    
    let sqlContent = fs.readFileSync(procsPath, 'utf8');
    
    // Remove DELIMITER $$ and DELIMITER ; lines
    sqlContent = sqlContent.replace(/DELIMITER \$\$/g, '');
    sqlContent = sqlContent.replace(/DELIMITER ;/g, '');
    
    // Split by $$
    const statements = sqlContent.split('$$').map(s => s.trim()).filter(s => s.length > 0);
    
    console.log(`Found ${statements.length} statements.`);
    
    for (let i = 0; i < statements.length; i++) {
        console.log(`Executing statement ${i + 1}...`);
        await connection.query(statements[i]);
    }
    
    console.log('Procedures reloaded successfully.');
  } catch (error) {
    console.error('Error reloading procedures:', error);
  } finally {
    await connection.end();
  }
}

reloadProcs();
