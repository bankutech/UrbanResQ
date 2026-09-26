const jwt = require('jsonwebtoken');
const db = require('./db');
const { wrap } = require('./util');

const SECRET = process.env.JWT_SECRET;
if (!SECRET || SECRET.length < 24) {
  console.error('JWT_SECRET is missing or shorter than 24 characters');
  process.exit(1);
}

const sign = u => jwt.sign({ sub: u.user_id }, SECRET, { expiresIn: '8h' });

const requireAuth = wrap(async (req, res, next) => {
  const h = req.headers.authorization || '';
  if (!h.startsWith('Bearer ')) return res.status(401).json({ error: 'Login required' });
  let payload;
  try { payload = jwt.verify(h.slice(7), SECRET); }
  catch { return res.status(401).json({ error: 'Invalid or expired token' }); }
  const [[u]] = await db.query(
    'SELECT u.user_id, u.full_name, r.name AS role FROM users u JOIN roles r USING (role_id) WHERE u.user_id = ? AND u.is_active',
    [payload.sub]);
  if (!u) return res.status(401).json({ error: 'Account disabled' });
  req.user = { id: u.user_id, name: u.full_name, role: u.role };
  next();
});

const requireRole = (...roles) => (req, res, next) =>
  req.user.role === 'admin' || roles.includes(req.user.role)
    ? next() : res.status(403).json({ error: 'Not allowed for your role' });

module.exports = { sign, requireAuth, requireRole };
