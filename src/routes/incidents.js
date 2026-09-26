const router = require('express').Router();
const db = require('../db');
const { requireRole } = require('../auth');
const { notify } = require('../notify');
const { wrap, bad, posInt, oneOf, text, paging, audit, timeline } = require('../util');

const KINDS = ['flood', 'fire', 'earthquake', 'cyclone', 'landslide', 'industrial'];
const SEV = ['low', 'moderate', 'high', 'critical'];
const STATUS = ['reported', 'verified', 'responding', 'contained', 'resolved'];
const SORT = { reported_at: 'i.reported_at', priority: 'i.priority', affected_pop: 'i.affected_pop', severity: 'i.severity' };

router.get('/', wrap(async (req, res) => {
  const { kind, severity, status, area_id, q } = req.query;
  const w = [], p = [];
  if (kind) { w.push('i.kind = ?'); p.push(oneOf(kind, KINDS, 'kind')); }
  if (severity) { w.push('i.severity = ?'); p.push(oneOf(severity, SEV, 'severity')); }
  if (status) { w.push('i.status = ?'); p.push(oneOf(status, STATUS, 'status')); }
  if (area_id) { w.push('i.area_id = ?'); p.push(posInt(area_id, 'area_id')); }
  if (q) { w.push('(i.code LIKE ? OR a.name LIKE ? OR i.description LIKE ?)'); p.push(`%${q}%`, `%${q}%`, `%${q}%`); }
  const where = w.length ? 'WHERE ' + w.join(' AND ') : '';
  const col = SORT[req.query.sort] || SORT.reported_at;
  const dir = req.query.dir === 'asc' ? 'ASC' : 'DESC';
  const { limit, page, offset } = paging(req.query);
  const [[{ total }]] = await db.query(`SELECT COUNT(*) AS total FROM incidents i JOIN areas a USING (area_id) ${where}`, p);
  const [data] = await db.query(
    `SELECT i.*, a.name AS area FROM incidents i JOIN areas a USING (area_id) ${where}
     ORDER BY ${col} ${dir}, i.incident_id DESC LIMIT ? OFFSET ?`, [...p, limit, offset]);
  res.json({ data, page, limit, total });
}));

router.get('/:id', wrap(async (req, res) => {
  const id = posInt(req.params.id, 'id');
  const [[incident]] = await db.query('SELECT i.*, a.name AS area, c.full_name AS commander FROM incidents i JOIN areas a USING (area_id) LEFT JOIN users c ON c.user_id = i.commander_id WHERE i.incident_id = ?', [id]);
  if (!incident) return res.status(404).json({ error: 'Incident not found' });
  const [timelineRows] = await db.query(
    'SELECT t.entry_id, t.event, t.created_at, u.full_name AS by_user FROM incident_timeline t LEFT JOIN users u USING (user_id) WHERE t.incident_id = ? ORDER BY t.created_at, t.entry_id', [id]);
  res.json({ ...incident, timeline: timelineRows });
}));

router.post('/', wrap(async (req, res) => {
  const b = req.body;
  const kind = oneOf(b.kind, KINDS, 'kind');
  const severity = oneOf(b.severity, SEV, 'severity');
  const area_id = posInt(b.area_id, 'area_id');
  const priority = b.priority == null ? 3 : Number(b.priority);
  if (!Number.isInteger(priority) || priority < 1 || priority > 5) throw bad('priority must be 1 to 5');
  const affected = b.affected_pop == null ? 0 : Number(b.affected_pop);
  if (!Number.isInteger(affected) || affected < 0) throw bad('affected_pop must be 0 or more');
  const blank = v => v == null || v === '';
  const lat = blank(b.lat) ? null : Number(b.lat), lng = blank(b.lng) ? null : Number(b.lng);
  if (lat !== null && Number.isNaN(lat) || lng !== null && Number.isNaN(lng)) throw bad('lat/lng must be numbers');
  if ((lat != null && !(lat >= -90 && lat <= 90)) || (lng != null && !(lng >= -180 && lng <= 180))) throw bad('lat/lng out of range');
  const description = text(b.description, 'description', 2000, false);
  const commander = b.commander_id == null ? null : posInt(b.commander_id, 'commander_id');
  const respondBy = b.respond_by || null;
  if (respondBy && Number.isNaN(Date.parse(respondBy))) throw bad('respond_by must be a date-time');

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const tmp = 'T' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    const [ins] = await conn.query(
      `INSERT INTO incidents (code, kind, severity, priority, area_id, lat, lng, affected_pop, commander_id, respond_by, description, reported_by)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
      [tmp, kind, severity, priority, area_id, lat, lng, affected, commander, respondBy, description, req.user.id]);
    const code = `INC-${new Date().getFullYear()}-${String(ins.insertId).padStart(3, '0')}`;
    await conn.query('UPDATE incidents SET code = ? WHERE incident_id = ?', [code, ins.insertId]);
    await timeline(conn, ins.insertId, req.user.id, 'Incident reported');
    await audit(conn, req.user.id, 'create', 'incident', ins.insertId, { kind, severity });
    await conn.commit();
    if (severity === 'critical') await notify({ roles: ['admin', 'coordinator'], kind: 'critical_incident', title: `Critical incident ${code}`, body: `${kind}, ${affected} people affected`, incidentId: ins.insertId, external: true });
    res.status(201).json({ incident_id: ins.insertId, code });
  } catch (e) { await conn.rollback(); throw e; }
  finally { conn.release(); }
}));

router.patch('/:id/status', requireRole('coordinator'), wrap(async (req, res) => {
  const id = posInt(req.params.id, 'id');
  const status = oneOf(req.body.status, STATUS, 'status');
  const [r] = await db.query(
    "UPDATE incidents SET status = ?, resolved_at = IF(? = 'resolved', NOW(), NULL) WHERE incident_id = ?", [status, status, id]);
  if (!r.affectedRows) return res.status(404).json({ error: 'Incident not found' });
  await timeline(db, id, req.user.id, `Status changed to ${status}`);
  await audit(db, req.user.id, 'status', 'incident', id, { status });
  res.json({ incident_id: id, status });
}));

module.exports = router;
