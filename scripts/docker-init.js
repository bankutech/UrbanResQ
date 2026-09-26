// Used by docker-compose: wait for MySQL, and build + seed the database only on the very first start.
require('dotenv').config();
const { spawnSync } = require('child_process');
const path = require('path');
const mysql = require('mysql2/promise');

const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const cfg = { host: process.env.DB_HOST, port: Number(process.env.DB_PORT || 3306), user: process.env.DB_USER, password: process.env.DB_PASS };
  let conn;
  for (let i = 0; i < 60 && !conn; i++) { try { conn = await mysql.createConnection(cfg); } catch { await sleep(2000); } }
  if (!conn) throw new Error('MySQL did not become ready in time');
  const [r] = await conn.query("SELECT COUNT(*) AS n FROM information_schema.tables WHERE table_schema = ? AND table_name = 'users'", [process.env.DB_NAME]);
  await conn.end();
  if (r[0].n > 0) return console.log('Database already set up, leaving it alone.');
  if (!process.env.SEED_PASSWORD || process.env.SEED_PASSWORD.length < 10) throw new Error('Set SEED_PASSWORD (10+ characters) so the first accounts can be created.');
  const root = path.join(__dirname, '..');
  for (const s of ['db/init.js', 'scripts/seed-users.js']) {
    const x = spawnSync(process.execPath, [path.join(root, s)], { stdio: 'inherit', cwd: root });
    if (x.status !== 0) throw new Error(s + ' failed');
  }
})().catch(e => { console.error(e.message); process.exit(1); });
