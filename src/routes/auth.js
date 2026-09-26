const router = require('express').Router();
const bcrypt = require('bcryptjs');
const rateLimit = require('express-rate-limit');
const db = require('../db');
const { sign, requireAuth } = require('../auth');
const { wrap, text, audit, bad } = require('../util');

const DUMMY = bcrypt.hashSync('not-a-real-password', 12);

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 200, standardHeaders: true, legacyHeaders: false });

router.post('/login', limiter, wrap(async (req, res) => {
  const email = text(req.body.email, 'email', 120);
  const password = text(req.body.password, 'password', 200);
  const [[u]] = await db.query(
    'SELECT u.user_id, u.full_name, u.password_hash, r.name AS role FROM users u JOIN roles r USING (role_id) WHERE u.email = ? AND u.is_active',
    [email]);
  const ok = await bcrypt.compare(password, u ? u.password_hash : DUMMY) && !!u;
  if (!ok) return res.status(401).json({ error: 'Wrong email or password' });
  await audit(db, u.user_id, 'login', 'user', u.user_id);
  res.json({ token: sign(u), user: { id: u.user_id, name: u.full_name, role: u.role } });
}));

router.get('/me', requireAuth, wrap(async (req, res) => {
  const [[u]] = await db.query('SELECT phone FROM users WHERE user_id = ?', [req.user.id]);
  res.json({ ...req.user, phone: u?.phone || null });
}));

router.post('/password', requireAuth, wrap(async (req, res) => {
  const current = text(req.body.current, 'current password', 200), next = text(req.body.next, 'new password', 200);
  if (next.length < 10) throw bad('New password needs at least 10 characters');
  if (next === current) throw bad('New password must differ from the current one');
  const [[u]] = await db.query('SELECT password_hash FROM users WHERE user_id = ?', [req.user.id]);
  if (!await bcrypt.compare(current, u.password_hash)) return res.status(403).json({ error: 'Current password is wrong' });
  await db.query('UPDATE users SET password_hash = ? WHERE user_id = ?', [await bcrypt.hash(next, 12), req.user.id]);
  await audit(db, req.user.id, 'password_change', 'user', req.user.id);
  res.json({ ok: true });
}));

router.patch('/profile', requireAuth, wrap(async (req, res) => {
  const phone = text(req.body.phone, 'phone', 30, false);
  if (phone && !/^\+?[0-9 ()-]{6,30}$/.test(phone)) throw bad('phone looks invalid');
  await db.query('UPDATE users SET phone = ? WHERE user_id = ?', [phone, req.user.id]);
  res.json({ ok: true });
}));

module.exports = router;
