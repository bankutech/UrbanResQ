const router = require('express').Router();
const db = require('../db');
const { requireRole } = require('../auth');
const { status } = require('../notify');
const { HttpError, bad, wrap, posInt, oneOf, text, audit, timeline } = require('../util');

const coord = n => { const v = Number(n); if (!Number.isFinite(v)) throw bad('coordinates must be numbers'); return v; };
const lat = v => { const n = coord(v); if (n < -90 || n > 90) throw bad('latitude out of range'); return n; };
const lng = v => { const n = coord(v); if (n < -180 || n > 180) throw bad('longitude out of range'); return n; };
const hav = (a, b, c, d) => {
  const r = x => x * Math.PI / 180, h = Math.sin(r(c - a) / 2) ** 2 + Math.cos(r(a)) * Math.cos(r(c)) * Math.sin(r(d - b) / 2) ** 2;
  return 12742 * Math.asin(Math.sqrt(h));
};

router.get('/commanders', wrap(async (_q, res) => {
  const [rows] = await db.query("SELECT u.user_id, u.full_name FROM users u JOIN roles r USING (role_id) WHERE u.is_active AND r.name IN ('admin','coordinator') ORDER BY u.full_name");
  res.json(rows);
}));

router.get('/config', (_q, res) => res.json({
  tileUrl: process.env.TILE_URL || 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
  attribution: process.env.TILE_ATTRIBUTION || '© OpenStreetMap contributors'
}));

router.get('/system/status', (_q, res) => res.json(status()));

router.get('/resource-categories', wrap(async (_q, res) => {
  const [rows] = await db.query('SELECT category_id, name FROM resource_categories ORDER BY name');
  res.json(rows);
}));

router.post('/resources', requireRole('coordinator'), wrap(async (req, res) => {
  const b = req.body;
  try {
    const [r] = await db.query('INSERT INTO resources (category_id, name, unit, is_perishable) VALUES (?,?,?,?)',
      [posInt(b.category_id, 'category_id'), text(b.name, 'name', 80), text(b.unit, 'unit', 20), b.is_perishable ? 1 : 0]);
    await audit(db, req.user.id, 'create', 'resource', r.insertId);
    res.status(201).json({ resource_id: r.insertId });
  } catch (e) { if (e.code === 'ER_DUP_ENTRY') throw new HttpError(409, 'A resource with that name exists'); throw e; }
}));

router.patch('/incidents/:id', requireRole('coordinator'), wrap(async (req, res) => {
  const id = posInt(req.params.id, 'id'), b = req.body, sets = [], p = [], notes = [];
  if (b.commander_id !== undefined) {
    if (b.commander_id === null || b.commander_id === '') { sets.push('commander_id = NULL'); notes.push('Commander cleared'); }
    else {
      const [[u]] = await db.query("SELECT u.full_name FROM users u JOIN roles r USING (role_id) WHERE u.user_id = ? AND u.is_active AND r.name IN ('admin','coordinator')", [posInt(b.commander_id, 'commander_id')]);
      if (!u) throw bad('Commander must be an active coordinator or admin');
      sets.push('commander_id = ?'); p.push(Number(b.commander_id)); notes.push('Commander assigned: ' + u.full_name);
    }
  }
  if (b.respond_by !== undefined) {
    if (b.respond_by && Number.isNaN(Date.parse(b.respond_by))) throw bad('respond_by must be a date-time');
    sets.push('respond_by = ?'); p.push(b.respond_by || null); notes.push('Response deadline set');
  }
  if (b.priority !== undefined) {
    const n = Number(b.priority);
    if (!Number.isInteger(n) || n < 1 || n > 5) throw bad('priority must be 1 to 5');
    sets.push('priority = ?'); p.push(n); notes.push('Priority set to ' + n);
  }
  if (!sets.length) throw bad('Nothing to update');
  const [r] = await db.query(`UPDATE incidents SET ${sets.join(', ')} WHERE incident_id = ?`, [...p, id]);
  if (!r.affectedRows) throw new HttpError(404, 'Incident not found');
  for (const n of notes) await timeline(db, id, req.user.id, n);
  await audit(db, req.user.id, 'update', 'incident', id, b);
  res.json({ incident_id: id });
}));

router.get('/incidents/:id/damage', wrap(async (req, res) => {
  const [rows] = await db.query('SELECT d.*, u.full_name AS assessor FROM damage_assessments d JOIN users u ON u.user_id = d.assessed_by WHERE d.incident_id = ? ORDER BY d.assessment_id DESC', [posInt(req.params.id, 'id')]);
  res.json(rows);
}));
router.post('/incidents/:id/damage', requireRole('coordinator', 'field_team'), wrap(async (req, res) => {
  const id = posInt(req.params.id, 'id'), b = req.body;
  const bd = Number(b.buildings_damaged ?? 0);
  if (!Number.isInteger(bd) || bd < 0) throw bad('buildings_damaged must be 0 or more');
  const loss = b.est_loss === undefined || b.est_loss === '' ? null : Number(b.est_loss);
  if (loss !== null && !(loss >= 0)) throw bad('est_loss must be 0 or more');
  const [[i]] = await db.query('SELECT 1 AS ok FROM incidents WHERE incident_id = ?', [id]);
  if (!i) throw new HttpError(404, 'Incident not found');
  const [r] = await db.query('INSERT INTO damage_assessments (incident_id, buildings_damaged, roads_affected, utilities_note, est_loss, assessed_by) VALUES (?,?,?,?,?,?)',
    [id, bd, text(b.roads_affected, 'roads_affected', 200, false), text(b.utilities_note, 'utilities_note', 255, false), loss, req.user.id]);
  await timeline(db, id, req.user.id, `Damage assessment recorded (${bd} buildings)`);
  await audit(db, req.user.id, 'create', 'damage_assessment', r.insertId);
  res.status(201).json({ assessment_id: r.insertId });
}));

router.get('/road-blocks', wrap(async (_q, res) => {
  const [rows] = await db.query('SELECT block_id, lat, lng, description, created_at FROM road_blocks WHERE is_active ORDER BY block_id DESC');
  res.json(rows);
}));
router.post('/road-blocks', requireRole('coordinator', 'field_team'), wrap(async (req, res) => {
  const [r] = await db.query('INSERT INTO road_blocks (lat, lng, description, created_by) VALUES (?,?,?,?)',
    [lat(req.body.lat), lng(req.body.lng), text(req.body.description, 'description', 200), req.user.id]);
  await audit(db, req.user.id, 'create', 'road_block', r.insertId);
  res.status(201).json({ block_id: r.insertId });
}));
router.post('/road-blocks/:id/clear', requireRole('coordinator', 'field_team'), wrap(async (req, res) => {
  const [r] = await db.query('UPDATE road_blocks SET is_active = FALSE, cleared_at = NOW() WHERE block_id = ? AND is_active', [posInt(req.params.id, 'id')]);
  if (!r.affectedRows) throw new HttpError(404, 'Active road block not found');
  await audit(db, req.user.id, 'clear', 'road_block', Number(req.params.id));
  res.json({ ok: true });
}));

router.get('/donations', wrap(async (_q, res) => {
  const [rows] = await db.query(
    `SELECT d.*, r.name AS resource, r.unit, w.name AS warehouse, u.full_name AS received_by_name FROM donations d
     LEFT JOIN resources r USING (resource_id) LEFT JOIN warehouses w USING (warehouse_id) JOIN users u ON u.user_id = d.received_by ORDER BY d.donation_id DESC LIMIT 100`);
  const [[t]] = await db.query("SELECT COALESCE(SUM(amount),0) AS cash FROM donations WHERE kind = 'cash'");
  res.json({ data: rows, cash_total: Number(t.cash) });
}));
router.post('/donations', requireRole('coordinator'), wrap(async (req, res) => {
  const b = req.body, kind = oneOf(b.kind, ['cash', 'goods'], 'kind'), donor = text(b.donor_name, 'donor_name', 100), note = text(b.note, 'note', 255, false);
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    let ins;
    if (kind === 'cash') {
      const amount = Number(b.amount);
      if (!(amount > 0)) throw bad('amount must be above 0');
      [ins] = await conn.query("INSERT INTO donations (donor_name, kind, amount, note, received_by) VALUES (?,?,?,?,?)", [donor, 'cash', amount, note, req.user.id]);
    } else {
      const rid = posInt(b.resource_id, 'resource_id'), wid = posInt(b.warehouse_id, 'warehouse_id'), qty = posInt(b.qty, 'qty');
      const batch = text(b.batch_no, 'batch_no', 30), expiry = b.expiry_date || null;
      if (expiry && !/^\d{4}-\d{2}-\d{2}$/.test(expiry)) throw bad('expiry_date must be YYYY-MM-DD');
      const [[ex]] = await conn.query('SELECT expiry_date FROM stock_batches WHERE warehouse_id = ? AND resource_id = ? AND batch_no = ? FOR UPDATE', [wid, rid, batch]);
      if (ex && (ex.expiry_date || null) !== expiry) throw new HttpError(409, 'Batch exists with a different expiry date');
      await conn.query('INSERT INTO stock_batches (warehouse_id, resource_id, batch_no, expiry_date, qty) VALUES (?,?,?,?,?) ON DUPLICATE KEY UPDATE qty = qty + VALUES(qty)', [wid, rid, batch, expiry, qty]);
      [ins] = await conn.query("INSERT INTO donations (donor_name, kind, resource_id, qty, warehouse_id, batch_no, note, received_by) VALUES (?,?,?,?,?,?,?,?)", [donor, 'goods', rid, qty, wid, batch, note, req.user.id]);
    }
    await audit(conn, req.user.id, 'donation', 'donation', ins.insertId, { kind });
    await conn.commit();
    res.status(201).json({ donation_id: ins.insertId });
  } catch (e) { await conn.rollback(); throw e; }
  finally { conn.release(); }
}));

router.get('/teams/:id/personnel', wrap(async (req, res) => {
  const [rows] = await db.query('SELECT person_id, full_name, role, skills, phone FROM personnel WHERE team_id = ? ORDER BY person_id', [posInt(req.params.id, 'id')]);
  res.json(rows);
}));
router.post('/teams/:id/personnel', requireRole('coordinator'), wrap(async (req, res) => {
  const [r] = await db.query('INSERT INTO personnel (team_id, full_name, role, skills, phone) VALUES (?,?,?,?,?)',
    [posInt(req.params.id, 'id'), text(req.body.full_name, 'full_name', 100), text(req.body.role, 'role', 60), text(req.body.skills, 'skills', 255, false), text(req.body.phone, 'phone', 30, false)]);
  res.status(201).json({ person_id: r.insertId });
}));
router.delete('/personnel/:id', requireRole('coordinator'), wrap(async (req, res) => {
  const [r] = await db.query('DELETE FROM personnel WHERE person_id = ?', [posInt(req.params.id, 'id')]);
  if (!r.affectedRows) throw new HttpError(404, 'Not found');
  res.json({ ok: true });
}));

const weatherCache = new Map();
router.get('/weather', wrap(async (_q, res) => {
  const base = process.env.WEATHER_URL || 'https://api.open-meteo.com';
  const [areas] = await db.query('SELECT area_id, name, lat, lng FROM areas ORDER BY name LIMIT 12');
  const out = await Promise.all(areas.map(async a => {
    const hit = weatherCache.get(a.area_id);
    if (hit && Date.now() - hit.t < 600000) return hit.v;
    try {
      const r = await fetch(`${base}/v1/forecast?latitude=${a.lat}&longitude=${a.lng}&current=temperature_2m,precipitation,wind_speed_10m`, { signal: AbortSignal.timeout(6000) });
      if (!r.ok) return null;
      const c = (await r.json()).current;
      const v = { area: a.name, temp_c: c.temperature_2m, rain_mm: c.precipitation, wind_kmh: c.wind_speed_10m, alert: c.precipitation >= 10 || c.wind_speed_10m >= 60 };
      weatherCache.set(a.area_id, { t: Date.now(), v });
      return v;
    } catch { return null; }
  }));
  const data = out.filter(Boolean);
  res.json({ available: data.length > 0, data });
}));

router.get('/route', wrap(async (req, res) => {
  const base = process.env.ROUTING_URL;
  if (!base) throw new HttpError(501, 'Routing service is not configured. Set ROUTING_URL to an OSRM-compatible server.');
  const pt = s => {
    const m = /^(-?\d{1,3}(?:\.\d+)?),(-?\d{1,3}(?:\.\d+)?)$/.exec(String(s || ''));
    if (!m) throw bad('use lat,lng');
    return { lat: lat(m[1]), lng: lng(m[2]) };
  };
  const a = pt(req.query.from), b = pt(req.query.to);
  const r = await fetch(`${base}/route/v1/driving/${a.lng},${a.lat};${b.lng},${b.lat}?overview=full&geometries=geojson`, { signal: AbortSignal.timeout(8000) });
  if (!r.ok) throw new HttpError(502, 'Routing service error');
  const rt = (await r.json()).routes?.[0];
  if (!rt) throw new HttpError(404, 'No route found');
  const coordinates = rt.geometry.coordinates.map(([x, y]) => [y, x]);
  const [blocks] = await db.query('SELECT block_id, lat, lng, description FROM road_blocks WHERE is_active');
  const blocked = blocks.filter(k => coordinates.some(([y, x]) => hav(y, x, Number(k.lat), Number(k.lng)) < 0.15));
  res.json({ distance_km: +(rt.distance / 1000).toFixed(1), duration_min: Math.round(rt.duration / 60), coordinates, blocked_warning: blocked });
}));

module.exports = router;
