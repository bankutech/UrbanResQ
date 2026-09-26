const router = require('express').Router();
const db = require('../db');
const { requireRole } = require('../auth');
const { HttpError, wrap, posInt, oneOf, text, audit, timeline, bad } = require('../util');
const stream = require('../stream');

router.get('/teams', wrap(async (_q, res) => {
  const [rows] = await db.query(
    `SELECT t.*, a.name AS base_area,
            (SELECT i.code FROM team_assignments x JOIN incidents i USING (incident_id)
              WHERE x.team_id = t.team_id AND x.status IN ('assigned','active') LIMIT 1) AS current_incident,
            (SELECT x.assignment_id FROM team_assignments x
              WHERE x.team_id = t.team_id AND x.status IN ('assigned','active') LIMIT 1) AS assignment_id,
            (SELECT x.status FROM team_assignments x
              WHERE x.team_id = t.team_id AND x.status IN ('assigned','active') LIMIT 1) AS assignment_status,
            (SELECT COUNT(*) FROM team_assignments x WHERE x.team_id = t.team_id AND x.status = 'completed') AS missions_done,
            (SELECT TIMESTAMPDIFF(MINUTE, p.updated_at, NOW()) FROM team_positions p WHERE p.team_id = t.team_id) AS seen_min_ago
     FROM rescue_teams t LEFT JOIN areas a ON a.area_id = t.base_area_id ORDER BY t.name`);
  res.json(rows);
}));

router.get('/teams/positions', wrap(async (_q, res) => {
  const [rows] = await db.query('SELECT t.team_id, t.name, p.lat, p.lng, p.accuracy_m, TIMESTAMPDIFF(MINUTE, p.updated_at, NOW()) AS age_min FROM team_positions p JOIN rescue_teams t USING (team_id)');
  res.json(rows);
}));

router.post('/teams/:id/position', requireRole('coordinator', 'field_team'), wrap(async (req, res) => {
  const id = posInt(req.params.id, 'id'), la = Number(req.body.lat), lo = Number(req.body.lng);
  if (!(la >= -90 && la <= 90) || !(lo >= -180 && lo <= 180) || req.body.lat === '' || req.body.lng === '') throw bad('lat and lng must be valid coordinates');
  const acc = req.body.accuracy == null ? null : Math.max(0, Math.round(Number(req.body.accuracy))) || null;
  const [[t]] = await db.query('SELECT name, status FROM rescue_teams WHERE team_id = ?', [id]);
  if (!t) throw new HttpError(404, 'Team not found');
  if (t.status !== 'deployed') throw new HttpError(409, 'Only deployed teams can share a position');
  await db.query(
    'INSERT INTO team_positions (team_id, lat, lng, accuracy_m, updated_by) VALUES (?,?,?,?,?) ON DUPLICATE KEY UPDATE lat = VALUES(lat), lng = VALUES(lng), accuracy_m = VALUES(accuracy_m), updated_by = VALUES(updated_by), updated_at = NOW()',
    [id, la, lo, acc, req.user.id]);
  stream.emit('team_position', { team_id: id, name: t.name, lat: la, lng: lo, updated_at: new Date().toISOString() });
  res.json({ ok: true });
}));

router.post('/teams', requireRole('coordinator'), wrap(async (req, res) => {
  const b = req.body;
  const members = posInt(b.members, 'members');
  const [r] = await db.query(
    'INSERT INTO rescue_teams (name, specialty, certifications, members, base_area_id) VALUES (?,?,?,?,?)',
    [text(b.name, 'name', 80), text(b.specialty, 'specialty', 80), text(b.certifications, 'certifications', 255, false), members, b.base_area_id ? posInt(b.base_area_id, 'base_area_id') : null]);
  await audit(db, req.user.id, 'create', 'team', r.insertId);
  res.status(201).json({ team_id: r.insertId });
}));

router.post('/teams/:id/assign', requireRole('coordinator'), wrap(async (req, res) => {
  const teamId = posInt(req.params.id, 'id'), incidentId = posInt(req.body.incident_id, 'incident_id');
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const [[t]] = await conn.query('SELECT status FROM rescue_teams WHERE team_id = ? FOR UPDATE', [teamId]);
    if (!t) throw new HttpError(404, 'Team not found');
    if (t.status !== 'available') throw new HttpError(409, `Team is ${t.status.replace('_', ' ')}`);
    const [[i]] = await conn.query('SELECT status FROM incidents WHERE incident_id = ?', [incidentId]);
    if (!i) throw new HttpError(404, 'Incident not found');
    if (i.status === 'resolved') throw new HttpError(409, 'Incident is already resolved');
    const [[busy]] = await conn.query("SELECT COUNT(*) AS n FROM team_assignments WHERE team_id = ? AND status IN ('assigned','active')", [teamId]);
    if (busy.n) throw new HttpError(409, 'Team already has an open assignment');
    const [ins] = await conn.query('INSERT INTO team_assignments (team_id, incident_id, assigned_by) VALUES (?,?,?)', [teamId, incidentId, req.user.id]);
    await conn.query("UPDATE rescue_teams SET status = 'deployed' WHERE team_id = ?", [teamId]);
    await timeline(conn, incidentId, req.user.id, `Rescue team #${teamId} assigned`);
    await audit(conn, req.user.id, 'assign', 'team', teamId, { incidentId });
    await conn.commit();
    res.status(201).json({ assignment_id: ins.insertId });
  } catch (e) { await conn.rollback(); throw e; }
  finally { conn.release(); }
}));

router.post('/team-assignments/:id/check', requireRole('coordinator', 'field_team'), wrap(async (req, res) => {
  const id = posInt(req.params.id, 'id');
  const dir = oneOf(req.body.direction, ['in', 'out'], 'direction');
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const [[a]] = await conn.query('SELECT team_id, incident_id, status FROM team_assignments WHERE assignment_id = ? FOR UPDATE', [id]);
    if (!a) throw new HttpError(404, 'Assignment not found');
    if (dir === 'in') {
      if (a.status !== 'assigned') throw new HttpError(409, 'Assignment is not waiting for check-in');
      await conn.query("UPDATE team_assignments SET status = 'active', checked_in_at = NOW() WHERE assignment_id = ?", [id]);
      await timeline(conn, a.incident_id, req.user.id, `Team #${a.team_id} checked in`);
    } else {
      if (a.status !== 'active') throw new HttpError(409, 'Team is not checked in');
      await conn.query("UPDATE team_assignments SET status = 'completed', checked_out_at = NOW() WHERE assignment_id = ?", [id]);
      await conn.query("UPDATE rescue_teams SET status = 'available' WHERE team_id = ?", [a.team_id]);
      await conn.query('DELETE FROM team_positions WHERE team_id = ?', [a.team_id]);
      await timeline(conn, a.incident_id, req.user.id, `Team #${a.team_id} checked out`);
    }
    await audit(conn, req.user.id, 'check_' + dir, 'team_assignment', id);
    await conn.commit();
    res.json({ assignment_id: id, status: dir === 'in' ? 'active' : 'completed' });
  } catch (e) { await conn.rollback(); throw e; }
  finally { conn.release(); }
}));

router.patch('/teams/:id/status', requireRole('coordinator'), wrap(async (req, res) => {
  const id = posInt(req.params.id, 'id');
  const status = oneOf(req.body.status, ['available', 'off_duty'], 'status');
  const [r] = await db.query(
    "UPDATE rescue_teams SET status = ? WHERE team_id = ? AND status <> 'deployed'", [status, id]);
  if (!r.affectedRows) throw new HttpError(409, 'Deployed teams must check out first');
  res.json({ team_id: id, status });
}));

router.get('/volunteers', wrap(async (_q, res) => {
  const [rows] = await db.query(
    `SELECT v.*, (SELECT CONCAT(i.code, ': ', x.task) FROM volunteer_assignments x JOIN incidents i USING (incident_id)
       WHERE x.volunteer_id = v.volunteer_id AND x.status = 'assigned' LIMIT 1) AS current_task
     FROM volunteers v ORDER BY v.full_name`);
  res.json(rows);
}));

router.post('/volunteers', requireRole('coordinator', 'field_team'), wrap(async (req, res) => {
  const [r] = await db.query('INSERT INTO volunteers (full_name, phone, skills) VALUES (?,?,?)',
    [text(req.body.full_name, 'full_name', 100), text(req.body.phone, 'phone', 30, false), text(req.body.skills, 'skills', 255, false)]);
  await audit(db, req.user.id, 'register', 'volunteer', r.insertId);
  res.status(201).json({ volunteer_id: r.insertId });
}));

router.post('/volunteers/:id/assign', requireRole('coordinator'), wrap(async (req, res) => {
  const id = posInt(req.params.id, 'id'), incidentId = posInt(req.body.incident_id, 'incident_id');
  const task = text(req.body.task, 'task', 160);
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const [[v]] = await conn.query('SELECT is_available FROM volunteers WHERE volunteer_id = ? FOR UPDATE', [id]);
    if (!v) throw new HttpError(404, 'Volunteer not found');
    if (!v.is_available) throw new HttpError(409, 'Volunteer is not available');
    const [[inc]] = await conn.query('SELECT status FROM incidents WHERE incident_id = ?', [incidentId]);
    if (!inc) throw new HttpError(404, 'Incident not found');
    await conn.query('INSERT INTO volunteer_assignments (volunteer_id, incident_id, task) VALUES (?,?,?)', [id, incidentId, task]);
    await conn.query('UPDATE volunteers SET is_available = FALSE WHERE volunteer_id = ?', [id]);
    await timeline(conn, incidentId, req.user.id, `Volunteer #${id} assigned: ${task}`);
    await audit(conn, req.user.id, 'assign', 'volunteer', id, { incidentId });
    await conn.commit();
    res.status(201).json({ ok: true });
  } catch (e) { await conn.rollback(); throw e; }
  finally { conn.release(); }
}));

router.post('/volunteers/:id/release', requireRole('coordinator', 'field_team'), wrap(async (req, res) => {
  const id = posInt(req.params.id, 'id');
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    await conn.query("UPDATE volunteer_assignments SET status = 'done' WHERE volunteer_id = ? AND status = 'assigned'", [id]);
    const [r] = await conn.query('UPDATE volunteers SET is_available = TRUE WHERE volunteer_id = ?', [id]);
    if (!r.affectedRows) throw new HttpError(404, 'Volunteer not found');
    await conn.commit();
    res.json({ ok: true });
  } catch (e) { await conn.rollback(); throw e; }
  finally { conn.release(); }
}));

module.exports = router;
