require('dotenv').config();
const { restore } = require('./backup');

const file = process.argv[2];
const target = process.argv[3] || process.env.DB_NAME;
if (!file) { console.error('Usage: npm run restore -- backups/<file>.sql [target_database]'); process.exit(1); }
if (target === process.env.DB_NAME && !process.argv.includes('--yes')) {
  console.error(`This overwrites the live database "${target}". Add --yes to continue, or pass a different target database.`);
  process.exit(1);
}
restore(file, target).then(() => console.log('Restored into', target)).catch(e => { console.error(e.message); process.exit(1); });
