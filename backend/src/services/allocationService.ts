import { getConnection, query } from '../config/db';
import { ApiError } from '../utils/asyncHandler';

import { sendAlertEmail } from './emailService';

/**
 * Runs the MySQL allocation engine (sp_generate_resource_allocation_plan).
 * dryRun=true is used by the What-If Simulation feature — the procedure
 * itself guarantees a ROLLBACK in that mode so production data is never
 * touched, even though we compute the exact same scoring logic.
 */
export async function runAllocationPlan(disasterId: string | null, dryRun: boolean, runBy: string) {
  const conn = await getConnection();
  try {
    // CALL returns multiple result sets: [planRows, shortageRows, ...OkPacket for the CALL itself]
    const [results]: any = await conn.query('CALL sp_generate_resource_allocation_plan(?, ?, ?)', [
      disasterId, dryRun ? 1 : 0, runBy,
    ]);
    const plan = results[0] || [];
    const shortages = results[1] || [];
    
    // Fire off automated alerts (in background, intentionally not awaited)
    if (!dryRun && plan.length > 0 && process.env.NODE_ENV !== 'test') {
      sendAlertEmail(
        'commander@urbanresq.local',
        `New Resource Allocations Generated`,
        `${plan.length} new resource allocations were just processed by the engine.`
      ).catch((e) => console.error('[email] Alert email failed:', e));
    }
    
    return { plan, shortages, dryRun };
  } finally {
    // Always release the lock on this specific connection if it was acquired by the stored procedure,
    // to prevent deadlocks when the connection is reused by the pool.
    await conn.query("DO RELEASE_LOCK('allocation_engine_lock')");
    conn.release();
  }
}

export async function listAllocations(filters: { status?: string; requestId?: string }) {
  const where: string[] = [];
  const params: any[] = [];
  if (filters.status) { where.push('ra.status = ?'); params.push(filters.status); }
  if (filters.requestId) { where.push('ra.request_id = ?'); params.push(filters.requestId); }
  const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';

  return query(
    `SELECT ra.*, er.category, er.description AS request_description, er.urgency,
            rt.name AS resource_type_name, rt.category AS resource_category, l.label AS depot_label
     FROM resource_allocations ra
     JOIN emergency_requests er ON er.request_id = ra.request_id
     LEFT JOIN resource_inventory ri ON ri.inventory_id = ra.inventory_id
     LEFT JOIN resources r ON r.resource_id = ri.resource_id
     LEFT JOIN resource_types rt ON rt.resource_type_id = r.resource_type_id
     LEFT JOIN locations l ON l.location_id = ri.location_id
     ${whereClause}
     ORDER BY ra.created_at DESC`,
    params
  );
}

export async function updateAllocationStatus(id: string, status: string, userId: string) {
  const existing = await query(`SELECT * FROM resource_allocations WHERE allocation_id = ?`, [id]);
  if (existing.length === 0) throw new ApiError(404, 'NOT_FOUND', 'Allocation not found');
  const alloc: any = existing[0];

  const conn = await getConnection();
  try {
    await conn.beginTransaction();

    if (status === 'CANCELLED' && alloc.status !== 'CANCELLED' && alloc.inventory_id) {
      // returning resource to available pool
      await conn.query(
        `UPDATE resource_inventory SET available_quantity = available_quantity + ?, allocated_quantity = allocated_quantity - ?
         WHERE inventory_id = ?`,
        [alloc.quantity_allocated, alloc.quantity_allocated, alloc.inventory_id]
      );
      await conn.query(
        `INSERT INTO resource_movements (inventory_id, movement_type, quantity, reference_type, reference_id, performed_by)
         VALUES (?, 'RETURN', ?, 'ALLOCATION', ?, ?)`,
        [alloc.inventory_id, alloc.quantity_allocated, id, userId]
      );
    }

    await conn.query(`UPDATE resource_allocations SET status = ? WHERE allocation_id = ?`, [status, id]);
    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }

  return (await query(`SELECT * FROM resource_allocations WHERE allocation_id = ?`, [id]))[0];
}
