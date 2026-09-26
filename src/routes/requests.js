const router = require('express').Router();
const db = require('../db');
const { requireRole } = require('../auth');
const { notify } = require('../notify');
const { HttpError, bad, wrap, posInt, oneOf, text, paging, audit, timeline } = require('../util');

const PRIORITY = ['low', 'medium', 'high', 'critical'];
const STATUS = ['pending', 'approved', 'rejected', 'partially_fulfilled', 'fulfilled', 'cancelled'];

router.get('/', wrap(async (req, res) => {
  const { status, priority, incident_id } = req.query;
  const w = [], p = [];
  if (status) { w.push('q.status = ?'); p.push(oneOf(status, STATUS, 'status')); }
  if (priority) { w.push('q.priority = ?'); p.push(oneOf(priority, PRIORITY, 'priority')); }
  if (incident_id) { w.push('q.incident_id = ?'); p.push(posInt(incident_id, 'incident_id')); }
  const where = w.length ? 'WHERE ' + w.join(' AND ') : '';
  const { limit, page, offset } = paging(req.query);
  const [[{ total }]] = await db.query(`SELECT COUNT(*) AS total FROM resource_requests q ${where}`, p);
  const [data] = await db.query(
    `SELECT q.request_id, q.status, q.priority, q.created_at, i.code AS incident, a.name AS area, u.full_name AS requested_by
     FROM resource_requests q JOIN incidents i USING (incident_id) JOIN areas a ON a.area_id = q.area_id JOIN users u ON u.user_id = q.requested_by
     ${where} ORDER BY FIELD(q.priority,'critical','high','medium','low'), q.created_at LIMIT ? OFFSET ?`, [...p, limit, offset]);
  res.json({ data, page, limit, total });
}));

router.get('/:id', wrap(async (req, res) => {
  const id = posInt(req.params.id, 'id');
  const [[r]] = await db.query('SELECT * FROM resource_requests WHERE request_id = ?', [id]);
  if (!r) return res.status(404).json({ error: 'Request not found' });
  const [items] = await db.query(
    'SELECT ri.resource_id, rs.name, rs.unit, ri.qty_requested, ri.qty_allocated FROM resource_request_items ri JOIN resources rs USING (resource_id) WHERE ri.request_id = ?', [id]);
  res.json({ ...r, items });
}));

router.post('/', wrap(async (req, res) => {
  const incidentId = posInt(req.body.incident_id, 'incident_id');
  const priority = oneOf(req.body.priority || 'medium', PRIORITY, 'priority');
  const items = req.body.items;
  if (!Array.isArray(items) || !items.length || items.length > 30) throw bad('items must be a list of 1 to 30 entries');
  const seen = new Set();
  const clean = items.map(it => {
    const rid = posInt(it.resource_id, 'resource_id');
    if (seen.has(rid)) throw bad('Each resource can appear once per request');
    seen.add(rid);
    return [rid, posInt(it.qty, 'qty')];
  });
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const [[inc]] = await conn.query('SELECT area_id, status FROM incidents WHERE incident_id = ? FOR UPDATE', [incidentId]);
    if (!inc) throw new HttpError(404, 'Incident not found');
    if (inc.status === 'resolved') throw new HttpError(409, 'Incident is already resolved');
    const [ins] = await conn.query(
      'INSERT INTO resource_requests (incident_id, area_id, requested_by, priority) VALUES (?,?,?,?)',
      [incidentId, inc.area_id, req.user.id, priority]);
    await conn.query('INSERT INTO resource_request_items (request_id, resource_id, qty_requested) VALUES ?', [clean.map(c => [ins.insertId, ...c])]);
    await timeline(conn, incidentId, req.user.id, `Resource request #${ins.insertId} submitted (${priority})`);
    await audit(conn, req.user.id, 'create', 'request', ins.insertId);
    await conn.commit();
    if (['high', 'critical'].includes(priority)) await notify({ roles: ['admin', 'coordinator'], kind: 'urgent_request', title: `${priority} priority request #${ins.insertId}`, body: `${clean.length} item line(s) requested`, incidentId, external: priority === 'critical' });
    res.status(201).json({ request_id: ins.insertId });
  } catch (e) { await conn.rollback(); throw e; }
  finally { conn.release(); }
}));

router.post('/:id/decision', requireRole('coordinator'), wrap(async (req, res) => {
  const id = posInt(req.params.id, 'id');
  const decision = oneOf(req.body.decision, ['approve', 'reject'], 'decision');
  const note = text(req.body.note, 'note', 255, false);
  const status = decision === 'approve' ? 'approved' : 'rejected';
  const [r] = await db.query(
    "UPDATE resource_requests SET status = ?, decided_by = ?, decided_at = NOW(), decision_note = ? WHERE request_id = ? AND status = 'pending'",
    [status, req.user.id, note, id]);
  if (!r.affectedRows) return res.status(409).json({ error: 'Request is not pending' });
  const [[q]] = await db.query('SELECT incident_id, requested_by FROM resource_requests WHERE request_id = ?', [id]);
  await timeline(db, q.incident_id, req.user.id, `Request #${id} ${status}`);
  await notify({ userIds: [q.requested_by], kind: 'request_decision', title: `Request #${id} ${status}`, body: note || '', incidentId: q.incident_id });
  await audit(db, req.user.id, decision, 'request', id, { note });
  res.json({ request_id: id, status });
}));

router.post('/:id/cancel', wrap(async (req, res) => {
  const id = posInt(req.params.id, 'id');
  const staff = ['admin', 'coordinator'].includes(req.user.role);
  const [r] = await db.query(
    `UPDATE resource_requests SET status = 'cancelled'
     WHERE request_id = ? AND status IN ('pending','approved') AND (requested_by = ? OR ?)
       AND NOT EXISTS (SELECT 1 FROM allocations a WHERE a.request_id = ? AND a.status <> 'cancelled')`,
    [id, req.user.id, staff, id]);
  if (!r.affectedRows) return res.status(409).json({ error: 'Request cannot be cancelled' });
  await audit(db, req.user.id, 'cancel', 'request', id);
  res.json({ request_id: id, status: 'cancelled' });
}));

module.exports = router;
