const router = require('express').Router();
const db = require('../db');
const { wrap } = require('../util');

router.get('/', wrap(async (_req, res) => {
  const [[counters]] = await db.query('SELECT * FROM v_dashboard');
  const [bySeverity] = await db.query("SELECT severity, COUNT(*) AS n FROM incidents WHERE status <> 'resolved' GROUP BY severity");
  const [byRequest] = await db.query('SELECT status, COUNT(*) AS n FROM resource_requests GROUP BY status');
  const [recent] = await db.query(
    'SELECT i.code, t.event, t.created_at FROM incident_timeline t JOIN incidents i USING (incident_id) ORDER BY t.created_at DESC, t.entry_id DESC LIMIT 10');
  const [[u]] = await db.query("SELECT COALESCE(SUM(ai.qty), 0) AS used FROM allocation_items ai JOIN allocations a USING (allocation_id) WHERE a.status <> 'cancelled'");
  const num = Object.fromEntries(Object.entries(counters).map(([k, v]) => [k, Number(v)]));
  const used = Number(u.used);
  num.utilization_pct = used + num.units_available ? Math.round(used / (used + num.units_available) * 100) : 0;
  res.json({ counters: num, severity: bySeverity, requests: byRequest, recent });
}));

module.exports = router;
