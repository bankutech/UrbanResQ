require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

const files = ['01_schema.sql', '02_programs.sql', '04_modules_schema.sql', '06_gap_schema.sql'];
if (!process.argv.includes('--no-seed')) files.push('03_seed.sql', '05_modules_seed.sql', '07_gap_seed.sql');

(async () => {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST, port: process.env.DB_PORT,
    user: process.env.DB_USER, password: process.env.DB_PASS,
    multipleStatements: true
  });
  const target = process.env.DB_NAME || 'urbanresq';
  const [have] = await conn.query('SELECT table_name AS n, table_type AS t FROM information_schema.tables WHERE table_schema = ?', [target]);
  if (have.length) {
    await conn.query('SET FOREIGN_KEY_CHECKS = 0');
    for (const { n, t } of have) await conn.query(`DROP ${t === 'VIEW' ? 'VIEW' : 'TABLE'} IF EXISTS \`${target}\`.\`${n}\``);
    await conn.query('SET FOREIGN_KEY_CHECKS = 1');
    console.log(`cleared ${have.length} existing tables in ${target}`);
  }
  for (const f of files) {
    const sql = fs.readFileSync(path.join(__dirname, f), 'utf8')
      .replace(/USE urbanresq;/g, `USE \`${target}\`;`).replace(/CREATE DATABASE IF NOT EXISTS urbanresq/g, `CREATE DATABASE IF NOT EXISTS \`${target}\``);
    await conn.query(sql);
    console.log('ok', f);
  }
  await conn.end();
})().catch(e => { console.error(e.message); process.exit(1); });
