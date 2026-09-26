const router = require('express').Router();
const bcrypt = require('bcryptjs');
const db = require('../db');
const { requireRole } = require('../auth');
const { HttpError, bad, wrap, posInt, oneOf, text, paging, audit } = require('../util');

router.use(requireRole());

router.get('/audit', wrap(async (req, res) => {
  const w = [], p = [];
  if (req.query.action) { w.push('l.action = ?'); p.push(String(req.query.action).slice(0, 60)); }
  if (req.query.user_id) { w.push('l.user_id = ?'); p.push(posInt(req.query.user_id, 'user_id')); }
  const where = w.length ? 'WHERE ' + w.join(' AND ') : '';
  const { limit, page, offset } = paging(req.query);
  const [[{ total }]] = await db.query(`SELECT COUNT(*) AS total FROM audit_logs l ${where}`, p);
  const [data] = await db.query(
    `SELECT l.log_id, l.action, l.entity, l.entity_id, l.details, l.created_at, u.full_name AS user
     FROM audit_logs l LEFT JOIN users u USING (user_id) ${where} ORDER BY l.log_id DESC LIMIT ? OFFSET ?`, [...p, limit, offset]);
  res.json({ data, page, limit, total });
}));

router.get('/users', wrap(async (_q, res) => {
  const [rows] = await db.query('SELECT u.user_id, u.full_name, u.email, u.is_active, u.created_at, r.name AS role FROM users u JOIN roles r USING (role_id) ORDER BY u.user_id');
  res.json(rows);
}));

router.post('/users', wrap(async (req, res) => {
  const email = text(req.body.email, 'email', 120);
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) && !/^[^@\s]+@urbanresq\.local$/.test(email)) throw bad('email looks invalid');
  const password = text(req.body.password, 'password', 200);
  if (password.length < 10) throw bad('password needs at least 10 characters');
  const role = oneOf(req.body.role, ['admin', 'coordinator', 'field_team'], 'role');
  const [[r]] = await db.query('SELECT role_id FROM roles WHERE name = ?', [role]);
  try {
    const [ins] = await db.query('INSERT INTO users (role_id, full_name, email, password_hash) VALUES (?,?,?,?)',
      [r.role_id, text(req.body.full_name, 'full_name', 100), email, await bcrypt.hash(password, 12)]);
    await audit(db, req.user.id, 'create', 'user', ins.insertId, { role });
    res.status(201).json({ user_id: ins.insertId });
  } catch (e) { if (e.code === 'ER_DUP_ENTRY') throw new HttpError(409, 'Email already registered'); throw e; }
}));

router.patch('/users/:id', wrap(async (req, res) => {
  const id = posInt(req.params.id, 'id');
  if (id === req.user.id) throw new HttpError(409, 'You cannot change your own role or access');
  const sets = [], p = [];
  if (req.body.role != null) {
    const [[r]] = await db.query('SELECT role_id FROM roles WHERE name = ?', [oneOf(req.body.role, ['admin', 'coordinator', 'field_team'], 'role')]);
    sets.push('role_id = ?'); p.push(r.role_id);
  }
  if (req.body.is_active != null) { sets.push('is_active = ?'); p.push(req.body.is_active ? 1 : 0); }
  if (!sets.length) throw bad('Nothing to update');
  const [r] = await db.query(`UPDATE users SET ${sets.join(', ')} WHERE user_id = ?`, [...p, id]);
  if (!r.affectedRows) throw new HttpError(404, 'User not found');
  await audit(db, req.user.id, 'update', 'user', id, req.body);
  res.json({ user_id: id });
}));

module.exports = router;
