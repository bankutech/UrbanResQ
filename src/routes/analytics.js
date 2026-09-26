const router = require('express').Router();
const db = require('../db');
const { requireRole } = require('../auth');
const { wrap, oneOf, audit } = require('../util');

router.get('/', wrap(async (_q, res) => {
  const [byKind] = await db.query('SELECT kind, COUNT(*) AS n FROM incidents GROUP BY kind ORDER BY n DESC');
  const [demand] = await db.query(
    `SELECT r.name AS resource, r.unit,
            COALESCE(SUM(ri.qty_requested), 0) AS requested, COALESCE(SUM(ri.qty_allocated), 0) AS allocated,
            (SELECT COALESCE(SUM(b.qty), 0) FROM stock_batches b WHERE b.resource_id = r.resource_id
               AND (b.expiry_date IS NULL OR b.expiry_date >= CURDATE())) AS in_stock
     FROM resources r
     LEFT JOIN resource_request_items ri ON ri.resource_id = r.resource_id
     LEFT JOIN resource_requests q ON q.request_id = ri.request_id AND q.status NOT IN ('rejected','cancelled')
     GROUP BY r.resource_id, r.name, r.unit ORDER BY requested DESC`);
  const [[times]] = await db.query(
    `SELECT AVG(TIMESTAMPDIFF(MINUTE, created_at, decided_at)) AS approval_min FROM resource_requests WHERE decided_at IS NOT NULL`);
  const [[ful]] = await db.query(
    `SELECT AVG(TIMESTAMPDIFF(MINUTE, q.created_at, f.first_alloc)) AS fulfil_min
     FROM resource_requests q JOIN (SELECT request_id, MIN(created_at) AS first_alloc FROM allocations WHERE status <> 'cancelled' GROUP BY request_id) f USING (request_id)`);
  const [[resp]] = await db.query(
    `SELECT AVG(TIMESTAMPDIFF(MINUTE, i.reported_at, t.first_team)) AS response_min
     FROM incidents i JOIN (SELECT incident_id, MIN(assigned_at) AS first_team FROM team_assignments GROUP BY incident_id) t USING (incident_id)`);
  const [shelters] = await db.query('SELECT name, capacity, occupancy, ROUND(occupancy / capacity * 100) AS pct FROM shelters ORDER BY pct DESC');
  const [shortages] = await db.query(
    `SELECT r.name AS resource, SUM(ri.qty_requested - ri.qty_allocated) AS unmet, COUNT(DISTINCT ri.request_id) AS times_short
     FROM resource_request_items ri JOIN resources r USING (resource_id) JOIN resource_requests q USING (request_id)
     WHERE q.status IN ('approved','partially_fulfilled','pending') AND ri.qty_requested > ri.qty_allocated
     GROUP BY r.resource_id, r.name ORDER BY unmet DESC LIMIT 5`);
  const [trend] = await db.query(
    `SELECT s.name, DATE(h.recorded_at) AS day, MAX(h.occupancy) AS occupancy, s.capacity FROM shelter_history h JOIN shelters s USING (shelter_id)
     WHERE h.recorded_at >= NOW() - INTERVAL 14 DAY GROUP BY s.shelter_id, s.name, s.capacity, DATE(h.recorded_at) ORDER BY day`);
  const n = v => v == null ? null : Math.round(Number(v));
  res.json({
    incidents_by_kind: byKind,
    demand: demand.map(d => ({ ...d, requested: Number(d.requested), allocated: Number(d.allocated), in_stock: Number(d.in_stock) })),
    minutes: { approval: n(times.approval_min), fulfilment: n(ful.fulfil_min), response: n(resp.response_min) },
    shelters, shelter_trend: trend, shortages: shortages.map(s => ({ ...s, unmet: Number(s.unmet), times_short: Number(s.times_short) }))
  });
}));

const REPORTS = {
  incidents: 'SELECT i.code, i.kind, i.severity, i.status, i.priority, a.name AS area, i.affected_pop, i.reported_at, i.resolved_at FROM incidents i JOIN areas a USING (area_id) ORDER BY i.incident_id',
  requests: 'SELECT q.request_id, i.code AS incident, q.priority, q.status, q.created_at, q.decided_at FROM resource_requests q JOIN incidents i USING (incident_id) ORDER BY q.request_id',
  stock: 'SELECT warehouse, resource, unit, qty, min_qty FROM v_stock ORDER BY warehouse, resource'
};
const cell = v => {
  let s = v == null ? '' : String(v);
  if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;
  return /[",\n\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
};

router.get('/risk', wrap(async (_q, res) => {
  const [rows] = await db.query(
    `SELECT a.area_id, a.name, a.risk_level, COUNT(i.incident_id) AS incidents,
            COALESCE(SUM(CASE i.severity WHEN 'low' THEN 1 WHEN 'moderate' THEN 2 WHEN 'high' THEN 3 ELSE 5 END), 0) AS weight
     FROM areas a LEFT JOIN incidents i ON i.area_id = a.area_id AND i.reported_at >= NOW() - INTERVAL 365 DAY
     GROUP BY a.area_id, a.name, a.risk_level`);
  const base = { low: 1, moderate: 2, high: 3 };
  const data = rows.map(r => {
    const score = base[r.risk_level] * 2 + Number(r.weight);
    return { area: r.name, baseline: r.risk_level, incidents_12m: Number(r.incidents), score, band: score >= 12 ? 'high' : score >= 6 ? 'moderate' : 'low' };
  }).sort((a, b) => b.score - a.score);
  res.json({ method: 'Heuristic: 2 x baseline risk level + severity-weighted incidents in the last 12 months. Not a predictive model.', data });
}));

router.get('/forecast', wrap(async (_q, res) => {
  const [rows] = await db.query(
    `SELECT r.name AS resource, r.unit, COALESCE(u.q, 0) AS used, u.first_at,
            (SELECT COALESCE(SUM(b.qty), 0) FROM stock_batches b WHERE b.resource_id = r.resource_id AND (b.expiry_date IS NULL OR b.expiry_date >= CURDATE())) AS in_stock
     FROM resources r LEFT JOIN (
       SELECT ai.resource_id, SUM(ai.qty) AS q, MIN(a.created_at) AS first_at FROM allocation_items ai JOIN allocations a USING (allocation_id)
       WHERE a.status <> 'cancelled' AND a.created_at >= NOW() - INTERVAL 30 DAY GROUP BY ai.resource_id) u ON u.resource_id = r.resource_id
     ORDER BY r.name`);
  const data = rows.map(r => {
    const used = Number(r.used), stock = Number(r.in_stock);
    const days = r.first_at ? Math.min(30, Math.max(1, Math.ceil((Date.now() - new Date(String(r.first_at).replace(' ', 'T')).getTime()) / 864e5))) : 0;
    const daily = days ? used / days : 0;
    return { resource: r.resource, unit: r.unit, used_30d: used, daily_avg: +daily.toFixed(1), next_7d: Math.round(daily * 7), in_stock: stock,
      days_of_cover: daily > 0 ? Math.floor(stock / daily) : null, confidence: !days ? 'no history' : days >= 14 ? 'medium' : 'low' };
  });
  res.json({ method: 'Average daily dispatch over the last 30 days, projected 7 days. Treat as a rough guide until there is more history.', data });
}));

router.get('/export/:report', requireRole('coordinator'), wrap(async (req, res) => {
  const name = oneOf(req.params.report, Object.keys(REPORTS), 'report');
  const fmt = oneOf(req.query.format || 'csv', ['csv', 'xlsx', 'pdf'], 'format');
  const [rows] = await db.query(REPORTS[name]);
  const head = rows.length ? Object.keys(rows[0]) : [];
  await audit(db, req.user.id, 'export', 'report', null, { name, fmt });
  const file = `urbanresq-${name}.${fmt}`;
  if (fmt === 'csv') {
    const csv = [head.join(','), ...rows.map(r => head.map(h => cell(r[h])).join(','))].join('\n');
    return res.set({ 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': `attachment; filename="${file}"` }).send(csv);
  }
  if (fmt === 'xlsx') {
    const ExcelJS = require('exceljs');
    const wb = new ExcelJS.Workbook(), ws = wb.addWorksheet(name);
    ws.addRow(head).font = { bold: true };
    rows.forEach(r => ws.addRow(head.map(h => (r[h] == null ? '' : String(r[h])))));
    ws.columns.forEach(c => { c.width = 18; });
    res.set({ 'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'Content-Disposition': `attachment; filename="${file}"` });
    await wb.xlsx.write(res);
    return res.end();
  }
  const PDF = require('pdfkit');
  const doc = new PDF({ margin: 36, size: 'A4', layout: 'landscape' });
  res.set({ 'Content-Type': 'application/pdf', 'Content-Disposition': `attachment; filename="${file}"` });
  doc.pipe(res);
  doc.fontSize(14).text(`UrbanResQ: ${name} report`).fontSize(8).fillColor('#666').text(new Date().toISOString()).moveDown();
  doc.fillColor('#000').font('Helvetica-Bold').text(head.join('  |  ')).font('Helvetica');
  rows.forEach(r => doc.text(head.map(h => (r[h] == null ? '' : String(r[h]))).join('  |  '), { lineBreak: false }).moveDown(0.2));
  doc.end();
}));

module.exports = router;
