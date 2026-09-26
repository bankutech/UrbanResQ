require('dotenv').config();
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const DIR = path.join(__dirname, '..', 'backups');
const conn = () => ['-h', process.env.DB_HOST || '127.0.0.1', '-P', String(process.env.DB_PORT || 3306), '-u', process.env.DB_USER];
const env = () => ({ ...process.env, MYSQL_PWD: process.env.DB_PASS || '' });

function dump(db = process.env.DB_NAME) {
  return new Promise((resolve, reject) => {
    fs.mkdirSync(DIR, { recursive: true });
    const file = path.join(DIR, `${db}-${new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14)}.sql`);
    const out = fs.createWriteStream(file);
    const p = spawn('mysqldump', [...conn(), '--single-transaction', '--routines', '--triggers', db], { env: env() });
    let err = '';
    p.stdout.pipe(out);
    p.stderr.on('data', d => { err += d; });
    p.on('error', e => reject(new Error('mysqldump not found: ' + e.message)));
    p.on('close', c => c === 0 ? resolve(file) : (fs.unlink(file, () => {}), reject(new Error(err.trim() || 'mysqldump failed'))));
  });
}

function mysqlRun(args, input) {
  return new Promise((resolve, reject) => {
    const p = spawn('mysql', [...conn(), ...args], { env: env() });
    let err = '';
    p.stderr.on('data', d => { err += d; });
    p.on('error', reject);
    p.on('close', c => c === 0 ? resolve() : reject(new Error(err.trim() || 'mysql failed')));
    if (input) fs.createReadStream(input).pipe(p.stdin); else p.stdin.end();
  });
}

async function restore(file, target) {
  if (!/^[A-Za-z0-9_]+$/.test(target)) throw new Error('Database name must be letters, digits, underscores');
  await mysqlRun(['-e', `CREATE DATABASE IF NOT EXISTS \`${target}\` CHARACTER SET utf8mb4`]);
  await mysqlRun([target], file);
}

function prune(file) {
  const keep = Number(process.env.BACKUP_KEEP) || 14;
  const files = fs.readdirSync(DIR).filter(f => f.endsWith('.sql')).sort().reverse();
  files.slice(keep).forEach(f => fs.unlinkSync(path.join(DIR, f)));
  return file;
}

module.exports = { dump, restore, prune, mysqlRun };

if (require.main === module) {
  dump().then(prune).then(f => console.log('Backup written:', f)).catch(e => { console.error(e.message); process.exit(1); });
}
