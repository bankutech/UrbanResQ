const router = require('express').Router();
const db = require('../db');
const { requireRole } = require('../auth');
const { HttpError, wrap, posInt, oneOf, text, audit, bad } = require('../util');

const nonNeg = (v, name) => { const n = Number(v); if (!Number.isInteger(n) || n < 0) throw bad(`${name} must be 0 or more`); return n; };

router.get('/hospitals', wrap(async (_q, res) => {
  const [rows] = await db.query('SELECT h.*, a.name AS area FROM hospitals h JOIN areas a USING (area_id) ORDER BY h.name');
  res.json(rows);
}));

router.patch('/hospitals/:id', requireRole('coordinator'), wrap(async (req, res) => {
  const id = posInt(req.params.id, 'id');
  const beds = nonNeg(req.body.beds_available, 'beds_available');
  const amb = nonNeg(req.body.ambulances_available, 'ambulances_available');
  const er = oneOf(req.body.er_status, ['open', 'busy', 'diverted'], 'er_status');
  const [[h]] = await db.query('SELECT beds_total FROM hospitals WHERE hospital_id = ?', [id]);
  if (!h) throw new HttpError(404, 'Hospital not found');
  if (beds > h.beds_total) throw bad('beds_available cannot exceed total beds');
  await db.query('UPDATE hospitals SET beds_available = ?, ambulances_available = ?, er_status = ? WHERE hospital_id = ?', [beds, amb, er, id]);
  await audit(db, req.user.id, 'update', 'hospital', id, { beds, amb, er });
  res.json({ hospital_id: id });
}));

router.get('/shelters', wrap(async (_q, res) => {
  const [rows] = await db.query('SELECT s.*, a.name AS area FROM shelters s JOIN areas a USING (area_id) ORDER BY s.name');
  res.json(rows);
}));

router.patch('/shelters/:id', requireRole('coordinator', 'field_team'), wrap(async (req, res) => {
  const id = posInt(req.params.id, 'id');
  const occ = nonNeg(req.body.occupancy, 'occupancy');
  const needs = text(req.body.needs, 'needs', 255, false);
  const [[s]] = await db.query('SELECT capacity FROM shelters WHERE shelter_id = ?', [id]);
  if (!s) throw new HttpError(404, 'Shelter not found');
  if (occ > s.capacity) throw bad('occupancy cannot exceed capacity');
  await db.query('UPDATE shelters SET occupancy = ?, needs = ? WHERE shelter_id = ?', [occ, needs, id]);
  await db.query('INSERT INTO shelter_history (shelter_id, occupancy) VALUES (?,?)', [id, occ]);
  await audit(db, req.user.id, 'update', 'shelter', id, { occ });
  res.json({ shelter_id: id });
}));

const geo = b => {
  const la = Number(b.lat), lo = Number(b.lng);
  if (!(la >= -90 && la <= 90) || !(lo >= -180 && lo <= 180) || b.lat === '' || b.lng === '') throw bad('lat and lng are required and must be valid');
  return [la, lo];
};
router.post('/hospitals', requireRole('coordinator'), wrap(async (req, res) => {
  const b = req.body, [la, lo] = geo(b);
  const total = nonNeg(b.beds_total, 'beds_total'), free = nonNeg(b.beds_available ?? b.beds_total, 'beds_available');
  if (free > total) throw bad('beds_available cannot exceed total beds');
  const [r] = await db.query('INSERT INTO hospitals (name, area_id, lat, lng, beds_total, beds_available, ambulances_available, er_status) VALUES (?,?,?,?,?,?,?,?)',
    [text(b.name, 'name', 100), posInt(b.area_id, 'area_id'), la, lo, total, free, nonNeg(b.ambulances_available ?? 0, 'ambulances_available'), oneOf(b.er_status || 'open', ['open', 'busy', 'diverted'], 'er_status')]);
  await audit(db, req.user.id, 'create', 'hospital', r.insertId);
  res.status(201).json({ hospital_id: r.insertId });
}));
router.post('/shelters', requireRole('coordinator'), wrap(async (req, res) => {
  const b = req.body, [la, lo] = geo(b);
  const cap = posInt(b.capacity, 'capacity'), occ = nonNeg(b.occupancy ?? 0, 'occupancy');
  if (occ > cap) throw bad('occupancy cannot exceed capacity');
  const [r] = await db.query('INSERT INTO shelters (name, area_id, lat, lng, capacity, occupancy, needs) VALUES (?,?,?,?,?,?,?)',
    [text(b.name, 'name', 100), posInt(b.area_id, 'area_id'), la, lo, cap, occ, text(b.needs, 'needs', 255, false)]);
  await db.query('INSERT INTO shelter_history (shelter_id, occupancy) VALUES (?,?)', [r.insertId, occ]);
  await audit(db, req.user.id, 'create', 'shelter', r.insertId);
  res.status(201).json({ shelter_id: r.insertId });
}));

router.get('/map', wrap(async (_q, res) => {
  const [incidents] = await db.query(
    `SELECT i.incident_id, i.code, i.kind, i.severity, i.status, i.affected_pop, COALESCE(i.lat, a.lat) AS lat, COALESCE(i.lng, a.lng) AS lng, a.name AS area
     FROM incidents i JOIN areas a USING (area_id) WHERE i.status <> 'resolved'`);
  const [warehouses] = await db.query('SELECT warehouse_id, name, lat, lng FROM warehouses WHERE is_active AND lat IS NOT NULL');
  const [hospitals] = await db.query('SELECT hospital_id, name, lat, lng, beds_available, er_status FROM hospitals');
  const [shelters] = await db.query('SELECT shelter_id, name, lat, lng, capacity, occupancy FROM shelters');
  const [areas] = await db.query('SELECT area_id, name, lat, lng, risk_level FROM areas');
  const [teams] = await db.query('SELECT t.team_id, t.name, p.lat, p.lng, TIMESTAMPDIFF(MINUTE, p.updated_at, NOW()) AS age_min FROM team_positions p JOIN rescue_teams t USING (team_id)');
  res.json({ incidents, warehouses, hospitals, shelters, areas, teams });
}));

module.exports = router;
