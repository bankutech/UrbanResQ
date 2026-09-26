const router = require('express').Router();
const db = require('../db');
const { requireRole } = require('../auth');
const { HttpError, bad, wrap, posInt, oneOf, text, paging, audit } = require('../util');

router.use(requireRole('coordinator'));
const age = v => { if (v == null || v === '') return null; const n = Number(v); if (!Number.isInteger(n) || n < 0 || n > 120) throw bad('age must be 0 to 120'); return n; };
const optId = (v, n) => (v ? posInt(v, n) : null);

router.get('/victims', wrap(async (req, res) => {
  const { limit, page, offset } = paging(req.query);
  const q = req.query.q ? `%${req.query.q}%` : null;
  const where = q ? 'WHERE v.full_name LIKE ?' : '';
  const [[{ total }]] = await db.query(`SELECT COUNT(*) AS total FROM victims v ${where}`, q ? [q] : []);
  const [data] = await db.query(
    `SELECT v.*, i.code AS incident, s.name AS shelter, h.name AS hospital FROM victims v JOIN incidents i USING (incident_id)
     LEFT JOIN shelters s USING (shelter_id) LEFT JOIN hospitals h USING (hospital_id) ${where} ORDER BY v.victim_id DESC LIMIT ? OFFSET ?`,
    [...(q ? [q] : []), limit, offset]);
  await audit(db, req.user.id, 'view', 'victim_registry', null, { q: req.query.q || null, rows: data.length });
  res.json({ data, page, limit, total });
}));

router.post('/victims', wrap(async (req, res) => {
  const b = req.body;
  const status = oneOf(b.status || 'registered', ['registered', 'sheltered', 'hospitalised', 'discharged'], 'status');
  const [r] = await db.query(
    'INSERT INTO victims (incident_id, full_name, age, condition_note, status, shelter_id, hospital_id, registered_by) VALUES (?,?,?,?,?,?,?,?)',
    [posInt(b.incident_id, 'incident_id'), text(b.full_name, 'full_name', 100), age(b.age), text(b.condition_note, 'condition_note', 255, false), status, optId(b.shelter_id, 'shelter_id'), optId(b.hospital_id, 'hospital_id'), req.user.id]);
  await audit(db, req.user.id, 'create', 'victim', r.insertId);
  res.status(201).json({ victim_id: r.insertId });
}));

router.patch('/victims/:id', wrap(async (req, res) => {
  const id = posInt(req.params.id, 'id');
  const status = oneOf(req.body.status, ['registered', 'sheltered', 'hospitalised', 'discharged'], 'status');
  const [r] = await db.query('UPDATE victims SET status = ?, shelter_id = ?, hospital_id = ? WHERE victim_id = ?', [status, optId(req.body.shelter_id, 'shelter_id'), optId(req.body.hospital_id, 'hospital_id'), id]);
  if (!r.affectedRows) throw new HttpError(404, 'Record not found');
  await audit(db, req.user.id, 'update', 'victim', id, { status });
  res.json({ victim_id: id });
}));

router.get('/missing', wrap(async (req, res) => {
  const w = [], p = [];
  if (req.query.status) { w.push('m.status = ?'); p.push(oneOf(req.query.status, ['missing', 'located', 'reunified'], 'status')); }
  if (req.query.q) { w.push('m.full_name LIKE ?'); p.push(`%${req.query.q}%`); }
  const [data] = await db.query(
    `SELECT m.*, a.name AS last_seen_area FROM missing_persons m LEFT JOIN areas a ON a.area_id = m.last_seen_area_id ${w.length ? 'WHERE ' + w.join(' AND ') : ''} ORDER BY FIELD(m.status,'missing','located','reunified'), m.missing_id DESC LIMIT 200`, p);
  await audit(db, req.user.id, 'view', 'missing_registry', null, { rows: data.length });
  res.json(data);
}));

router.post('/missing', wrap(async (req, res) => {
  const b = req.body;
  const [r] = await db.query(
    'INSERT INTO missing_persons (full_name, age, description, last_seen_area_id, reporter_name, reporter_contact, reported_by) VALUES (?,?,?,?,?,?,?)',
    [text(b.full_name, 'full_name', 100), age(b.age), text(b.description, 'description', 500, false), optId(b.last_seen_area_id, 'last_seen_area_id'), text(b.reporter_name, 'reporter_name', 100), text(b.reporter_contact, 'reporter_contact', 60), req.user.id]);
  await audit(db, req.user.id, 'create', 'missing_person', r.insertId);
  res.status(201).json({ missing_id: r.insertId });
}));

router.post('/missing/:id/located', wrap(async (req, res) => {
  const id = posInt(req.params.id, 'id');
  const [r] = await db.query("UPDATE missing_persons SET status = 'located', identified = ?, located_note = ? WHERE missing_id = ? AND status = 'missing'",
    [req.body.identified ? 1 : 0, text(req.body.note, 'note', 255, false), id]);
  if (!r.affectedRows) throw new HttpError(409, 'Case is not open');
  await audit(db, req.user.id, 'located', 'missing_person', id);
  res.json({ missing_id: id, status: 'located' });
}));

router.post('/missing/:id/reunify', wrap(async (req, res) => {
  const id = posInt(req.params.id, 'id');
  const handedTo = text(req.body.handed_to, 'handed_to', 100);
  if (!req.body.id_checked) throw bad('Confirm that the receiving person was identity-checked');
  const [r] = await db.query(
    "UPDATE missing_persons SET status = 'reunified', identified = TRUE, handed_to = ?, handover_confirmed_by = ?, reunified_at = NOW() WHERE missing_id = ? AND status = 'located'",
    [handedTo, req.user.id, id]);
  if (!r.affectedRows) throw new HttpError(409, 'Person must be located before handover');
  await audit(db, req.user.id, 'reunify', 'missing_person', id, { handedTo });
  res.json({ missing_id: id, status: 'reunified' });
}));

module.exports = router;
