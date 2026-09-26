require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const path = require('path');
const rateLimit = require('express-rate-limit');
const { requireAuth } = require('./src/auth');
const stream = require('./src/stream');
const pool = require('./src/db');

const tileUrl = process.env.TILE_URL || 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
const tileSrc = (() => {
  try {
    const u = new URL(tileUrl.replace(/\{s\}/g, 'a').replace(/\{[^}]+\}/g, '0'));
    return [u.origin, ...(tileUrl.includes('{s}') ? ['https://*.' + u.hostname.replace(/^a\./, '')] : [])];
  } catch { return []; }
})();

const app = express();
app.use(helmet({ contentSecurityPolicy: { useDefaults: false, directives: {
  defaultSrc: ["'self'"],
  scriptSrc: ["'self'"],
  styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
  fontSrc: ['https://fonts.gstatic.com'],
  imgSrc: ["'self'", 'data:', ...tileSrc],
  connectSrc: ["'self'"], objectSrc: ["'none'"], frameAncestors: ["'none'"]
} } }));
app.use(cors({ origin: process.env.CORS_ORIGIN || false }));
if (process.env.TRUST_PROXY) app.set('trust proxy', /^\d+$/.test(process.env.TRUST_PROXY) ? Number(process.env.TRUST_PROXY) : process.env.TRUST_PROXY);
app.use(express.json({ limit: '100kb' }));
app.get('/healthz', async (_q, res) => { try { await pool.query('SELECT 1'); res.json({ ok: true }); } catch { res.status(503).json({ ok: false }); } });

app.use('/api', rateLimit({ windowMs: 60 * 1000, limit: 600, standardHeaders: true, legacyHeaders: false }));
app.use('/api/auth', require('./src/routes/auth'));
app.use('/api', requireAuth);
app.get('/api/stream', (req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache, no-transform', Connection: 'keep-alive', 'X-Accel-Buffering': 'no' });
  res.write('retry: 4000\n\n');
  stream.add(req.user.id, res);
  stream.send(res, 'hello', { user: req.user.name });
  const hb = setInterval(() => res.write(': ping\n\n'), 25000);
  res.on('close', () => clearInterval(hb));
});
app.use('/api', (req, res, next) => {
  if (req.method !== 'GET' && !/\/position$/.test(req.path)) {
    const topic = req.path.split('/')[1] || 'api';
    res.on('finish', () => { if (res.statusCode < 400) stream.refresh(topic); });
  }
  next();
});
app.use('/api/dashboard', require('./src/routes/dashboard'));
app.use('/api/incidents', require('./src/routes/incidents'));
app.use('/api/requests', require('./src/routes/requests'));
app.use('/api/allocations', require('./src/routes/allocations'));
app.use('/api/analytics', require('./src/routes/analytics'));
app.use('/api/admin', require('./src/routes/admin'));
app.use('/api/registry', require('./src/routes/registry'));
app.use('/api', require('./src/routes/comms'));
app.use('/api', require('./src/routes/attachments'));
app.use('/api', require('./src/routes/ops'));
app.use('/api', require('./src/routes/teams'));
app.use('/api', require('./src/routes/facilities'));
app.use('/api', require('./src/routes/inventory'));

app.use(express.static(path.join(__dirname, 'public')));
app.use('/api', (_req, res) => res.status(404).json({ error: 'Not found' }));
app.use((err, _req, res, _next) => {
  if (err.status) return res.status(err.status).json({ error: err.message });
  if (err.sqlState === '45000') return res.status(409).json({ error: err.sqlMessage });
  if (err.code === 'ER_NO_REFERENCED_ROW_2') return res.status(400).json({ error: 'Referenced record does not exist' });
  if (err.name === 'MulterError') return res.status(400).json({ error: err.code === 'LIMIT_FILE_SIZE' ? 'File is larger than 5 MB' : err.message });
  if (err.type === 'entity.parse.failed') return res.status(400).json({ error: 'Invalid JSON' });
  console.error(err);
  res.status(500).json({ error: 'Server error' });
});

const port = process.env.PORT || 4000;
if (require.main === module) {
  const server = app.listen(port, () => console.log(`urbanresq api on :${port}`));
  const stop = () => { stream.closeAll(); server.close(() => pool.end().finally(() => process.exit(0))); server.closeIdleConnections?.(); setTimeout(() => process.exit(0), 3000).unref(); };
  process.on('SIGTERM', stop);
  process.on('SIGINT', stop);
  const hours = Number(process.env.BACKUP_EVERY_HOURS);
  if (hours > 0) {
    const bk = require('./scripts/backup');
    setInterval(() => bk.dump().then(bk.prune).then(f => console.log('backup written', f)).catch(e => console.error('backup failed:', e.message)), hours * 3600e3).unref();
  }
}
module.exports = app;
