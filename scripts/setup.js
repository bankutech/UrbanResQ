#!/usr/bin/env node
// One-command first run: writes .env, checks the database connection, builds the schema, sets login passwords.
//   npm run setup                      asks a few questions
//   npm run setup -- --yes --db-user=root --db-pass=secret      no questions
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const crypto = require('crypto');
const { spawnSync } = require('child_process');
const mysql = require('mysql2/promise');

const root = path.join(__dirname, '..');
const ENV = path.join(root, '.env');
const args = Object.fromEntries(process.argv.slice(2).filter(a => a.startsWith('--')).map(a => { const [k, ...v] = a.slice(2).split('='); return [k, v.length ? v.join('=') : 'true']; }));
const rl = args.yes ? null : readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = (q, d = '') => args.yes ? Promise.resolve(d) : new Promise(r => rl.question(`${q}${d ? ` [${d}]` : ''}: `, a => r(a.trim() || d)));

function friendly(e, cfg) {
  if (e.code === 'ECONNREFUSED') return `Nothing is listening on ${cfg.host}:${cfg.port}. Start MySQL (or MariaDB) first, then run this again.`;
  if (e.code === 'ER_ACCESS_DENIED_ERROR') return `MySQL refused the login for user "${cfg.user}". Check the username and password.`;
  if (e.code === 'ENOTFOUND') return `Cannot find the host "${cfg.host}".`;
  if (e.code === 'ER_DBACCESS_DENIED_ERROR' || e.code === 'ER_SPECIFIC_ACCESS_DENIED_ERROR') return `User "${cfg.user}" is not allowed to create or change databases. Use a user with CREATE rights.`;
  return e.message;
}

(async () => {
  console.log('UrbanResQ setup\n');
  if (fs.existsSync(ENV) && !args.force) {
    console.log('Keeping your existing .env (add --force to write a new one).');
  } else {
    const cfg = {
      DB_HOST: args['db-host'] || await ask('MySQL host', '127.0.0.1'),
      DB_PORT: args['db-port'] || await ask('MySQL port', '3306'),
      DB_USER: args['db-user'] || await ask('MySQL user', 'root'),
      DB_PASS: args['db-pass'] ?? await ask('MySQL password (typed text is visible)', ''),
      DB_NAME: args['db-name'] || await ask('Database name', 'urbanresq'),
      PORT: args.port || await ask('Web port', '4000')
    };
    if (!/^[A-Za-z0-9_]+$/.test(cfg.DB_NAME)) throw new Error('Database name can only use letters, digits and underscores.');
    const lines = Object.entries(cfg).map(([k, v]) => `${k}=${v}`);
    lines.push(`JWT_SECRET=${crypto.randomBytes(32).toString('hex')}`, 'CORS_ORIGIN=', 'TRUST_PROXY=');
    fs.writeFileSync(ENV, lines.join('\n') + '\n', { mode: 0o600 });
    console.log('Wrote .env with a fresh random JWT_SECRET.');
  }
  require('dotenv').config({ path: ENV, override: true });
  const cfg = { host: process.env.DB_HOST, port: Number(process.env.DB_PORT), user: process.env.DB_USER, password: process.env.DB_PASS };

  let conn;
  try { conn = await mysql.createConnection(cfg); } catch (e) { throw new Error(friendly(e, cfg)); }
  const [[v]] = await conn.query('SELECT VERSION() AS v');
  console.log('Connected to MySQL/MariaDB', v.v);
  const [have] = await conn.query('SELECT COUNT(*) AS n FROM information_schema.tables WHERE table_schema = ?', [process.env.DB_NAME]);
  await conn.end();

  let build = true;
  if (have[0].n > 0) {
    const a = args.yes ? (args.rebuild ? 'y' : 'n') : await ask(`Database "${process.env.DB_NAME}" already has ${have[0].n} tables. Rebuild it? THIS ERASES ITS DATA (y/N)`, 'n');
    build = /^y/i.test(a);
  }
  if (build) {
    const r = spawnSync(process.execPath, [path.join(root, 'db', 'init.js')], { stdio: 'inherit', cwd: root });
    if (r.status !== 0) throw new Error('Building the database failed (see the message above).');
    const pw = args['seed-password'] || process.env.SEED_PASSWORD || crypto.randomBytes(9).toString('base64url');
    const s = spawnSync(process.execPath, [path.join(root, 'scripts', 'seed-users.js')], { stdio: 'pipe', cwd: root, env: { ...process.env, SEED_PASSWORD: pw } });
    if (s.status !== 0) throw new Error('Setting passwords failed: ' + s.stderr.toString());
    console.log(`\nSample accounts (all use the same password): admin@urbanresq.local, coord@urbanresq.local, field@urbanresq.local`);
    console.log(`Password: ${pw}\n(Shown once. Change it under Settings, and remove these accounts before real use.)`);
  } else console.log('Left the database as it is.');
  console.log('\nDone. Start the app with:  npm start   then open http://localhost:' + (process.env.PORT || 4000));
  if (rl) rl.close();
})().catch(e => { console.error('\nSetup stopped:', e.message); if (rl) rl.close(); process.exit(1); });
