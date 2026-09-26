const router = require('express').Router();
const db = require('../db');
const { requireRole } = require('../auth');
const { notify } = require('../notify');
const { HttpError, bad, wrap, posInt, oneOf, text, paging, audit } = require('../util');

router.get('/notifications', wrap(async (req, res) => {
  const { limit, page, offset } = paging(req.query);
  const where = 'user_id = ?' + (req.query.unread === '1' ? ' AND read_at IS NULL' : '');
  const [[{ total }]] = await db.query(`SELECT COUNT(*) AS total FROM notifications WHERE ${where}`, [req.user.id]);
  const [[{ unread }]] = await db.query('SELECT COUNT(*) AS unread FROM notifications WHERE user_id = ? AND read_at IS NULL', [req.user.id]);
  const [data] = await db.query(
    `SELECT notification_id, kind, title, body, incident_id, created_at, read_at FROM notifications WHERE ${where} ORDER BY notification_id DESC LIMIT ? OFFSET ?`,
    [req.user.id, limit, offset]);
  res.json({ data, page, limit, total, unread });
}));

router.post('/notifications/read', wrap(async (req, res) => {
  if (req.body.all) await db.query('UPDATE notifications SET read_at = NOW() WHERE user_id = ? AND read_at IS NULL', [req.user.id]);
  else {
    const ids = (Array.isArray(req.body.ids) ? req.body.ids : []).map(Number).filter(Number.isInteger).slice(0, 200);
    if (!ids.length) throw bad('ids or all is required');
    await db.query('UPDATE notifications SET read_at = NOW() WHERE user_id = ? AND notification_id IN (?) AND read_at IS NULL', [req.user.id, ids]);
  }
  res.json({ ok: true });
}));

router.get('/broadcasts', wrap(async (_q, res) => {
  const [rows] = await db.query(
    'SELECT b.broadcast_id, b.audience, b.message, b.sent_external, b.created_at, b.incident_id, u.full_name AS sender FROM broadcasts b JOIN users u ON u.user_id = b.sender_id ORDER BY b.broadcast_id DESC LIMIT 50');
  res.json(rows);
}));

router.post('/broadcasts', requireRole('coordinator'), wrap(async (req, res) => {
  const audience = oneOf(req.body.audience, ['all', 'admin', 'coordinator', 'field_team'], 'audience');
  const message = text(req.body.message, 'message', 1000);
  const incidentId = req.body.incident_id ? posInt(req.body.incident_id, 'incident_id') : null;
  const external = !!req.body.external;
  if (incidentId) {
    const [[i]] = await db.query('SELECT 1 AS ok FROM incidents WHERE incident_id = ?', [incidentId]);
    if (!i) throw new HttpError(404, 'Incident not found');
  }
  const [ins] = await db.query('INSERT INTO broadcasts (sender_id, audience, incident_id, message, sent_external) VALUES (?,?,?,?,?)',
    [req.user.id, audience, incidentId, message, external]);
  const roles = audience === 'all' ? ['admin', 'coordinator', 'field_team'] : [audience];
  const recipients = await notify({ roles, kind: 'broadcast', title: 'Broadcast: ' + message.slice(0, 80), body: message, incidentId, external });
  if (incidentId) await db.query('INSERT INTO incident_messages (incident_id, user_id, message) VALUES (?,?,?)', [incidentId, req.user.id, `[Broadcast to ${audience}] ${message}`]);
  await audit(db, req.user.id, 'broadcast', 'broadcast', ins.insertId, { audience, external });
  res.status(201).json({ broadcast_id: ins.insertId, recipients });
}));

router.get('/incidents/:id/messages', wrap(async (req, res) => {
  const [rows] = await db.query(
    'SELECT m.message_id, m.message, m.created_at, u.full_name AS author FROM incident_messages m JOIN users u USING (user_id) WHERE m.incident_id = ? ORDER BY m.message_id', [posInt(req.params.id, 'id')]);
  res.json(rows);
}));

router.post('/incidents/:id/messages', wrap(async (req, res) => {
  const id = posInt(req.params.id, 'id'), message = text(req.body.message, 'message', 1000);
  const [[i]] = await db.query('SELECT 1 AS ok FROM incidents WHERE incident_id = ?', [id]);
  if (!i) throw new HttpError(404, 'Incident not found');
  const [r] = await db.query('INSERT INTO incident_messages (incident_id, user_id, message) VALUES (?,?,?)', [id, req.user.id, message]);
  res.status(201).json({ message_id: r.insertId });
}));

module.exports = router;
