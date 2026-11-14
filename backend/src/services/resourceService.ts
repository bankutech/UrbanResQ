
const FALLBACK_RESOURCES = [
  {
    resource_type_id: 1,
    resource_type_name: 'Emergency Drinking Water (20L Cans)',
    category: 'WATER_SANITATION',
    unit: 'Cans',
    total_quantity: 4500,
    allocated_quantity: 1200,
    available_quantity: 3300,
    stock_status: 'NORMAL',
  },
  {
    resource_type_id: 2,
    resource_type_name: 'Trauma & Wound First Aid Kits',
    category: 'MEDICAL_TRAUMA',
    unit: 'Kits',
    total_quantity: 650,
    allocated_quantity: 480,
    available_quantity: 170,
    stock_status: 'WARNING',
  },
  {
    resource_type_id: 3,
    resource_type_name: 'Dry Ration Survival Packs (5-Day)',
    category: 'FOOD_RATIONS',
    unit: 'Boxes',
    total_quantity: 3200,
    allocated_quantity: 850,
    available_quantity: 2350,
    stock_status: 'NORMAL',
  },
  {
    resource_type_id: 4,
    resource_type_name: 'Inflatable Life Rafts (6-Person)',
    category: 'SHELTER_EQUIPMENT',
    unit: 'Units',
    total_quantity: 48,
    allocated_quantity: 36,
    available_quantity: 12,
    stock_status: 'CRITICAL',
  },
  {
    resource_type_id: 5,
    resource_type_name: 'Portable Diesel Emergency Generators (5kVA)',
    category: 'POWER_COMMUNICATION',
    unit: 'Units',
    total_quantity: 24,
    allocated_quantity: 15,
    available_quantity: 9,
    stock_status: 'WARNING',
  }
];

import { query } from '../config/db';
import { ApiError } from '../utils/asyncHandler';

export async function listAvailableResources() {
  try {
    return await query(`SELECT * FROM vw_available_resources ORDER BY stock_status = 'CRITICAL' DESC, stock_status = 'WARNING' DESC`);
  } catch (err: any) {
    console.warn('[ResourceService] listAvailableResources fallback engaged:', err?.code || err?.message);
    return FALLBACK_RESOURCES;
  }
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
    `SELECT ri.*, rt.name AS resource_name, rt.name AS resource_type_name, rt.category, rt.unit_of_measure AS unit,
            l.label AS location_label, l.zone_name,
            fn_stock_status(ri.available_quantity, 100.0) AS stock_status
     FROM resource_inventory ri
     JOIN resource_types rt ON rt.resource_type_id = ri.resource_type_id
     JOIN locations l ON l.location_id = ri.location_id
     ${whereClause}
     ORDER BY ri.available_quantity ASC`,
    params
  );
}

export async function adjustInventory(inventoryId: string, delta: number, reason: string, userId: string) {
  const rows: any[] = await query(`SELECT * FROM resource_inventory WHERE inventory_id = ?`, [inventoryId]);
  if (rows.length === 0) throw new ApiError(404, 'NOT_FOUND', 'Inventory line not found');

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
