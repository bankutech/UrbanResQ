import { query } from '../config/db';

export async function listAvailableResources() {
  return query(`SELECT * FROM vw_available_resources ORDER BY stock_status = 'CRITICAL' DESC, stock_status = 'WARNING' DESC`);
}

export async function listResourceUtilization() {
  return query(`SELECT * FROM vw_resource_utilization ORDER BY utilization_rank`);
}

export async function listInventory(filters: { category?: string; locationId?: string }) {
  const where: string[] = [];
  const params: any[] = [];
  if (filters.category) { where.push('rt.category = ?'); params.push(filters.category); }
  if (filters.locationId) { where.push('ri.location_id = ?'); params.push(filters.locationId); }
  const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';

  return query(
    `SELECT ri.*, r.resource_code, r.name AS resource_name, rt.name AS resource_type_name, rt.category, rt.unit,
            l.label AS location_label, l.zone_name,
            fn_stock_status(ri.available_quantity, ri.min_threshold) AS stock_status
     FROM resource_inventory ri
     JOIN resources r ON r.resource_id = ri.resource_id
     JOIN resource_types rt ON rt.resource_type_id = r.resource_type_id
     JOIN locations l ON l.location_id = ri.location_id
     ${whereClause}
     ORDER BY ri.is_below_threshold DESC, ri.available_quantity ASC`,
    params
  );
}

export async function adjustInventory(inventoryId: string, delta: number, reason: string, userId: string) {
  const rows: any[] = await query(`SELECT * FROM resource_inventory WHERE inventory_id = ?`, [inventoryId]);
  if (rows.length === 0) throw new Error('Inventory line not found');

  await query(
    `UPDATE resource_inventory
     SET available_quantity = GREATEST(available_quantity + ?, 0),
         total_quantity = GREATEST(total_quantity + ?, 0)
     WHERE inventory_id = ?`,
    [delta, delta, inventoryId]
  );
  await query(
    `INSERT INTO resource_movements (inventory_id, movement_type, quantity, reference_type, performed_by)
     VALUES (?, 'ADJUSTMENT', ?, ?, ?)`,
    [inventoryId, Math.abs(delta), reason, userId]
  );
  return (await query(`SELECT * FROM resource_inventory WHERE inventory_id = ?`, [inventoryId]))[0];
}
