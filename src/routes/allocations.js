const router = require('express').Router();
const db = require('../db');
const { requireRole } = require('../auth');
const { notify, notifyLowStock } = require('../notify');
const { wrap, posInt, oneOf, text, paging, audit, timeline } = require('../util');

const STATUS = ['allocated', 'in_transit', 'delivered', 'cancelled'];
const NEXT = { allocated: 'in_transit', in_transit: 'delivered' };

async function tell(allocationId, title) {
  const [[a]] = await db.query('SELECT a.request_id, a.incident_id, r.requested_by FROM allocations a JOIN resource_requests r USING (request_id) WHERE a.allocation_id = ?', [allocationId]);
  if (a) await notify({ userIds: [a.requested_by], kind: 'dispatch_update', title, body: `Request #${a.request_id}`, incidentId: a.incident_id });
}

router.get('/', wrap(async (req, res) => {
  const w = [], p = [];
  if (req.query.status) { w.push('a.status = ?'); p.push(oneOf(req.query.status, STATUS, 'status')); }
  if (req.query.request_id) { w.push('a.request_id = ?'); p.push(posInt(req.query.request_id, 'request_id')); }
  const where = w.length ? 'WHERE ' + w.join(' AND ') : '';
  const { limit, page, offset } = paging(req.query);
  const [[{ total }]] = await db.query(`SELECT COUNT(*) AS total FROM allocations a ${where}`, p);
  const [data] = await db.query(
    `SELECT a.allocation_id, a.request_id, a.status, a.recipient_name, a.delivered_at, a.created_at, w.name AS warehouse, ar.name AS area
     FROM allocations a JOIN warehouses w USING (warehouse_id) JOIN areas ar ON ar.area_id = a.area_id
     ${where} ORDER BY a.created_at DESC, a.allocation_id DESC LIMIT ? OFFSET ?`, [...p, limit, offset]);
  res.json({ data, page, limit, total });
}));

router.get('/:id', wrap(async (req, res) => {
  const id = posInt(req.params.id, 'id');
  const [[a]] = await db.query('SELECT * FROM allocations WHERE allocation_id = ?', [id]);
  if (!a) return res.status(404).json({ error: 'Allocation not found' });
  const [items] = await db.query(
    `SELECT r.name AS resource, r.unit, b.batch_no, b.expiry_date, ai.qty
     FROM allocation_items ai JOIN resources r USING (resource_id) JOIN stock_batches b USING (batch_id) WHERE ai.allocation_id = ?`, [id]);
  res.json({ ...a, items });
}));

router.post('/', requireRole('coordinator'), wrap(async (req, res) => {
  const requestId = posInt(req.body.request_id, 'request_id');
  const warehouseId = posInt(req.body.warehouse_id, 'warehouse_id');
  const [[w]] = await db.query('SELECT is_active FROM warehouses WHERE warehouse_id = ?', [warehouseId]);
  if (!w || !w.is_active) return res.status(404).json({ error: 'Warehouse not found or inactive' });
  const [out] = await db.query('CALL sp_allocate(?,?,?)', [requestId, warehouseId, req.user.id]);
  await tell(out[0][0].allocation_id, `Dispatch #${out[0][0].allocation_id} allocated`);
  await notifyLowStock();
  res.status(201).json(out[0][0]);
}));

router.patch('/:id/status', requireRole('coordinator', 'field_team'), wrap(async (req, res) => {
  const id = posInt(req.params.id, 'id');
  const status = oneOf(req.body.status, ['in_transit', 'delivered'], 'status');
  const recipient = status === 'delivered' ? text(req.body.recipient_name, 'recipient_name', 100) : null;
  const from = Object.keys(NEXT).find(k => NEXT[k] === status);
  const [r] = await db.query(
    `UPDATE allocations SET status = ?, recipient_name = COALESCE(?, recipient_name),
       delivered_at = IF(? = 'delivered', NOW(), delivered_at) WHERE allocation_id = ? AND status = ?`,
    [status, recipient, status, id, from]);
  if (!r.affectedRows) return res.status(409).json({ error: `Allocation must be ${from} to become ${status}` });
  const [[a]] = await db.query('SELECT incident_id FROM allocations WHERE allocation_id = ?', [id]);
  await timeline(db, a.incident_id, req.user.id, `Dispatch #${id} ${status.replace('_', ' ')}`);
  await audit(db, req.user.id, status, 'allocation', id, recipient ? { recipient } : null);
  await tell(id, `Dispatch #${id} ${status.replace('_', ' ')}`);
  res.json({ allocation_id: id, status });
}));

router.post('/:id/cancel', requireRole('coordinator'), wrap(async (req, res) => {
  const cid = posInt(req.params.id, 'id');
  await db.query('CALL sp_cancel_allocation(?,?)', [cid, req.user.id]);
  await tell(cid, `Dispatch #${cid} cancelled`);
  res.json({ allocation_id: Number(req.params.id), status: 'cancelled' });
}));

module.exports = router;
