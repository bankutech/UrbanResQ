class HttpError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}
const bad = m => new HttpError(400, m);
const wrap = fn => (req, res, next) => fn(req, res, next).catch(next);

function posInt(v, name) {
  const n = Number(v);
  if (!Number.isInteger(n) || n <= 0) throw bad(`${name} must be a positive integer`);
  return n;
}
function oneOf(v, list, name) {
  if (!list.includes(v)) throw bad(`${name} must be one of: ${list.join(', ')}`);
  return v;
}
function text(v, name, max, required = true) {
  if (v == null || v === '') { if (required) throw bad(`${name} is required`); return null; }
  if (typeof v !== 'string' || v.length > max) throw bad(`${name} must be text up to ${max} characters`);
  return v.trim();
}
function dateStr(v, name) {
  if (v == null || v === '') return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) throw bad(`${name} must be YYYY-MM-DD`);
  return v;
}
function paging(q) {
  const limit = Math.min(100, Math.max(1, parseInt(q.limit) || 20));
  const page = Math.max(1, parseInt(q.page) || 1);
  return { limit, page, offset: (page - 1) * limit };
}
function audit(db, userId, action, entity, entityId, details) {
  return db.query(
    'INSERT INTO audit_logs (user_id, action, entity, entity_id, details) VALUES (?,?,?,?,?)',
    [userId, action, entity, entityId || null, details ? JSON.stringify(details) : null]);
}
function timeline(db, incidentId, userId, event) {
  return db.query('INSERT INTO incident_timeline (incident_id, user_id, event) VALUES (?,?,?)', [incidentId, userId, event]);
}
module.exports = { HttpError, bad, wrap, posInt, oneOf, text, dateStr, paging, audit, timeline };
