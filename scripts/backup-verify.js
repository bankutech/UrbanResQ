require('dotenv').config();
const mysql = require('mysql2/promise');
const { dump, restore, mysqlRun } = require('./backup');

(async () => {
  const src = process.env.DB_NAME, tmp = src + '_verify';
  const cfg = { host: process.env.DB_HOST, port: process.env.DB_PORT, user: process.env.DB_USER, password: process.env.DB_PASS };
  const counts = async db => {
    const c = await mysql.createConnection({ ...cfg, database: db });
    const [t] = await c.query("SELECT table_name AS n FROM information_schema.tables WHERE table_schema = ? AND table_type = 'BASE TABLE' ORDER BY 1", [db]);
    const out = {};
    for (const { n } of t) out[n] = (await c.query(`SELECT COUNT(*) AS c FROM \`${n}\``))[0][0].c;
    await c.end();
    return out;
  };
  const file = await dump(src);
  await mysqlRun(['-e', `DROP DATABASE IF EXISTS \`${tmp}\``]);
  await restore(file, tmp);
  const a = await counts(src), b = await counts(tmp);
  await mysqlRun(['-e', `DROP DATABASE \`${tmp}\``]);
  const bad = Object.keys(a).filter(k => a[k] !== b[k]);
  console.log(`Backup ${file}\nTables compared: ${Object.keys(a).length}`);
  if (bad.length) { console.error('MISMATCH in:', bad.join(', ')); process.exit(1); }
  console.log('Restore verified: every table row count matches.');
})().catch(e => { console.error(e.message); process.exit(1); });
