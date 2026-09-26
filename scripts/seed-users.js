require('dotenv').config();
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');

(async () => {
  const password = process.env.SEED_PASSWORD || crypto.randomBytes(9).toString('base64url');
  const hash = await bcrypt.hash(password, 12);
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST, port: process.env.DB_PORT,
    user: process.env.DB_USER, password: process.env.DB_PASS, database: process.env.DB_NAME
  });
  const [r] = await conn.query("UPDATE users SET password_hash = ? WHERE email LIKE '%@urbanresq.local'", [hash]);
  console.log(`Updated ${r.affectedRows} seed users.`);
  if (!process.env.SEED_PASSWORD) console.log('Password:', password);
  console.log('Logins: admin@ / coord@ / field@urbanresq.local');
  await conn.end();
})().catch(e => { console.error(e.message); process.exit(1); });
