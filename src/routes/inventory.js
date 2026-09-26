const router = require('express').Router();
const db = require('../db');
const { requireRole } = require('../auth');
const { wrap, posInt, text, dateStr, paging, audit } = require('../util');

router.get('/areas', wrap(async (_q, res) => {
  const [rows] = await db.query('SELECT area_id, name, district, lat, lng, population, risk_level FROM areas ORDER BY name');
  res.json(rows);
}));
router.get('/resources', wrap(async (_q, res) => {
  const [rows] = await db.query('SELECT r.resource_id, r.name, r.unit, r.is_perishable, c.name AS category FROM resources r JOIN resource_categories c USING (category_id) ORDER BY c.name, r.name');
  res.json(rows);
}));
router.get('/warehouses', wrap(async (_q, res) => {
  const [rows] = await db.query('SELECT warehouse_id, name, area_id, lat, lng, is_active FROM warehouses ORDER BY name');
  res.json(rows);
}));

router.get('/stock', wrap(async (req, res) => {
  const w = req.query.warehouse_id ? posInt(req.query.warehouse_id, 'warehouse_id') : null;
  const [rows] = await db.query(`SELECT * FROM v_stock ${w ? 'WHERE warehouse_id = ?' : ''} ORDER BY warehouse, resource`, w ? [w] : []);
  res.json(rows.map(r => ({ ...r, qty: Number(r.qty) })));
}));
router.get('/stock/low', wrap(async (_q, res) => {
  const [rows] = await db.query('SELECT * FROM v_low_stock ORDER BY warehouse, resource');
  res.json(rows.map(r => ({ ...r, qty: Number(r.qty) })));
}));

router.get('/stock/batches', wrap(async (req, res) => {
  const { limit, page, offset } = paging(req.query);
  const w = req.query.warehouse_id ? posInt(req.query.warehouse_id, 'warehouse_id') : null;
  const where = w ? 'WHERE b.warehouse_id = ?' : '';
  const p = w ? [w] : [];
  const [[{ total }]] = await db.query(`SELECT COUNT(*) AS total FROM stock_batches b ${where}`, p);
  const [data] = await db.query(
    `SELECT b.batch_id, b.batch_no, b.expiry_date, b.qty, w.name AS warehouse, r.name AS resource, r.unit
     FROM stock_batches b JOIN warehouses w USING (warehouse_id) JOIN resources r USING (resource_id)
     ${where} ORDER BY b.expiry_date IS NULL, b.expiry_date, b.batch_id LIMIT ? OFFSET ?`, [...p, limit, offset]);
  res.json({ data, page, limit, total });
}));

router.post('/stock/batches', requireRole('coordinator'), wrap(async (req, res) => {
  const b = req.body;
  const warehouse = posInt(b.warehouse_id, 'warehouse_id'), resource = posInt(b.resource_id, 'resource_id');
  const qty = posInt(b.qty, 'qty');
  const batchNo = text(b.batch_no, 'batch_no', 30);
  const expiry = dateStr(b.expiry_date, 'expiry_date');
  const [[ex]] = await db.query('SELECT expiry_date FROM stock_batches WHERE warehouse_id = ? AND resource_id = ? AND batch_no = ?', [warehouse, resource, batchNo]);
  if (ex && (ex.expiry_date || null) !== expiry) return res.status(409).json({ error: 'That batch already exists with a different expiry date' });
  await db.query(
    `INSERT INTO stock_batches (warehouse_id, resource_id, batch_no, expiry_date, qty) VALUES (?,?,?,?,?)
     ON DUPLICATE KEY UPDATE qty = qty + VALUES(qty)`, [warehouse, resource, batchNo, expiry, qty]);
  await audit(db, req.user.id, 'restock', 'stock_batch', null, { warehouse, resource, batchNo, qty });
  res.status(201).json({ ok: true });
}));

router.put('/stock/thresholds', requireRole('coordinator'), wrap(async (req, res) => {
  const warehouse = posInt(req.body.warehouse_id, 'warehouse_id'), resource = posInt(req.body.resource_id, 'resource_id');
  const min = Number(req.body.min_qty);
  if (!Number.isInteger(min) || min < 0) return res.status(400).json({ error: 'min_qty must be 0 or more' });
  await db.query(
    'INSERT INTO stock_thresholds (warehouse_id, resource_id, min_qty) VALUES (?,?,?) ON DUPLICATE KEY UPDATE min_qty = VALUES(min_qty)',
    [warehouse, resource, min]);
  await audit(db, req.user.id, 'threshold', 'stock_threshold', null, { warehouse, resource, min });
  res.json({ ok: true });
}));

module.exports = router;
