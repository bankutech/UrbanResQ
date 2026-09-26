USE urbanresq;

CREATE OR REPLACE VIEW v_stock AS
SELECT w.warehouse_id, w.name AS warehouse, r.resource_id, r.name AS resource, r.unit,
       COALESCE(SUM(CASE WHEN b.expiry_date IS NULL OR b.expiry_date >= CURDATE() THEN b.qty END), 0) AS qty,
       COALESCE(t.min_qty, 0) AS min_qty
FROM warehouses w
CROSS JOIN resources r
LEFT JOIN stock_batches b ON b.warehouse_id = w.warehouse_id AND b.resource_id = r.resource_id
LEFT JOIN stock_thresholds t ON t.warehouse_id = w.warehouse_id AND t.resource_id = r.resource_id
GROUP BY w.warehouse_id, w.name, r.resource_id, r.name, r.unit, t.min_qty;

CREATE OR REPLACE VIEW v_low_stock AS
SELECT * FROM v_stock WHERE min_qty > 0 AND qty < min_qty;

CREATE OR REPLACE VIEW v_dashboard AS
SELECT
  (SELECT COUNT(*) FROM incidents WHERE status <> 'resolved') AS active_incidents,
  (SELECT COUNT(*) FROM incidents WHERE status <> 'resolved' AND severity = 'critical') AS critical_incidents,
  (SELECT COALESCE(SUM(affected_pop), 0) FROM incidents WHERE status <> 'resolved') AS affected_population,
  (SELECT COUNT(*) FROM resource_requests WHERE status = 'pending') AS pending_requests,
  (SELECT COUNT(*) FROM v_low_stock) AS low_stock_items,
  (SELECT COALESCE(SUM(qty), 0) FROM stock_batches WHERE expiry_date IS NULL OR expiry_date >= CURDATE()) AS units_available;

DROP PROCEDURE IF EXISTS sp_allocate;
CREATE PROCEDURE sp_allocate(IN p_request INT, IN p_warehouse INT, IN p_user INT)
BEGIN
  DECLARE done INT DEFAULT 0;
  DECLARE v_batch, v_res, v_qty, v_need, v_last, v_rem, v_take, v_alloc, v_total INT DEFAULT 0;
  DECLARE cur CURSOR FOR
    SELECT b.batch_id, b.resource_id, b.qty, ri.qty_requested - ri.qty_allocated
    FROM stock_batches b
    JOIN resource_request_items ri ON ri.request_id = p_request AND ri.resource_id = b.resource_id
    WHERE b.warehouse_id = p_warehouse AND b.qty > 0
      AND (b.expiry_date IS NULL OR b.expiry_date >= CURDATE())
      AND ri.qty_requested > ri.qty_allocated
    ORDER BY b.resource_id, b.expiry_date IS NULL, b.expiry_date
    FOR UPDATE;
  DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = 1;
  DECLARE EXIT HANDLER FOR SQLEXCEPTION BEGIN ROLLBACK; RESIGNAL; END;

  START TRANSACTION;
  IF NOT EXISTS (SELECT 1 FROM resource_requests
                 WHERE request_id = p_request AND status IN ('approved','partially_fulfilled')) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Request is not approved';
  END IF;

  INSERT INTO allocations (request_id, incident_id, area_id, warehouse_id, created_by)
  SELECT request_id, incident_id, area_id, p_warehouse, p_user
  FROM resource_requests WHERE request_id = p_request;
  SET v_alloc = LAST_INSERT_ID();

  OPEN cur;
  pick: LOOP
    FETCH cur INTO v_batch, v_res, v_qty, v_need;
    IF done = 1 THEN LEAVE pick; END IF;
    IF v_res <> v_last THEN SET v_last = v_res; SET v_rem = v_need; END IF;
    IF v_rem > 0 THEN
      SET v_take = LEAST(v_rem, v_qty);
      INSERT INTO allocation_items (allocation_id, batch_id, resource_id, qty)
      VALUES (v_alloc, v_batch, v_res, v_take);
      SET v_rem = v_rem - v_take;
      SET v_total = v_total + v_take;
    END IF;
  END LOOP;
  CLOSE cur;

  IF v_total = 0 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'No usable stock in this warehouse';
  END IF;

  UPDATE stock_batches b
  JOIN allocation_items ai ON ai.batch_id = b.batch_id
  SET b.qty = b.qty - ai.qty
  WHERE ai.allocation_id = v_alloc;

  UPDATE resource_request_items ri
  JOIN (SELECT resource_id, SUM(qty) AS q FROM allocation_items
        WHERE allocation_id = v_alloc GROUP BY resource_id) t ON t.resource_id = ri.resource_id
  SET ri.qty_allocated = ri.qty_allocated + t.q
  WHERE ri.request_id = p_request;

  UPDATE resource_requests
  SET status = IF(EXISTS (SELECT 1 FROM resource_request_items
                          WHERE request_id = p_request AND qty_allocated < qty_requested),
                  'partially_fulfilled', 'fulfilled')
  WHERE request_id = p_request;

  INSERT INTO incident_timeline (incident_id, user_id, event)
  SELECT incident_id, p_user, CONCAT('Dispatch #', v_alloc, ' allocated for request #', p_request)
  FROM resource_requests WHERE request_id = p_request;

  INSERT INTO audit_logs (user_id, action, entity, entity_id)
  VALUES (p_user, 'allocate', 'allocation', v_alloc);

  COMMIT;
  SELECT v_alloc AS allocation_id, v_total AS units;
END;

DROP PROCEDURE IF EXISTS sp_cancel_allocation;
CREATE PROCEDURE sp_cancel_allocation(IN p_alloc INT, IN p_user INT)
BEGIN
  DECLARE v_req INT;
  DECLARE EXIT HANDLER FOR SQLEXCEPTION BEGIN ROLLBACK; RESIGNAL; END;

  START TRANSACTION;
  SELECT request_id INTO v_req FROM allocations
  WHERE allocation_id = p_alloc AND status IN ('allocated','in_transit') FOR UPDATE;
  IF v_req IS NULL THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Allocation cannot be cancelled';
  END IF;

  UPDATE stock_batches b
  JOIN allocation_items ai ON ai.batch_id = b.batch_id
  SET b.qty = b.qty + ai.qty
  WHERE ai.allocation_id = p_alloc;

  UPDATE resource_request_items ri
  JOIN (SELECT resource_id, SUM(qty) AS q FROM allocation_items
        WHERE allocation_id = p_alloc GROUP BY resource_id) t ON t.resource_id = ri.resource_id
  SET ri.qty_allocated = ri.qty_allocated - t.q
  WHERE ri.request_id = v_req;

  UPDATE allocations SET status = 'cancelled' WHERE allocation_id = p_alloc;

  UPDATE resource_requests
  SET status = IF(EXISTS (SELECT 1 FROM resource_request_items WHERE request_id = v_req AND qty_allocated > 0),
                  'partially_fulfilled', 'approved')
  WHERE request_id = v_req;

  INSERT INTO audit_logs (user_id, action, entity, entity_id)
  VALUES (p_user, 'cancel_allocation', 'allocation', p_alloc);
  COMMIT;
END;
