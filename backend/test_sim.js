require('dotenv').config();
const { runWhatIf } = require('./src/services/simulationService');
const { query } = require('./src/config/db');

async function test() {
  try {
    const res = await runWhatIf({ disasterId: 1 }, 1);
    console.log(JSON.stringify(res, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}
test();
