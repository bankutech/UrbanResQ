import { query } from "../config/db";
import { ApiError } from "../utils/asyncHandler";
import crypto from 'crypto';

export async function listDisasters(status?: string) {
  if (status) {
    return query(
      `SELECT * FROM disasters WHERE status = ? ORDER BY start_time DESC`,
      [status],
    );
  }
  return query(`SELECT * FROM disasters ORDER BY start_time DESC`);
}

export async function getDisasterById(id: string) {
  const rows = await query(`SELECT * FROM disasters WHERE disaster_id = ?`, [
    id,
  ]);
  if (rows.length === 0)
    throw new ApiError(404, "NOT_FOUND", "Disaster not found");

  const [zones, impact, performance] = await Promise.all([
    query(`SELECT * FROM disaster_zones WHERE disaster_id = ?`, [id]),
    query(`SELECT * FROM vw_disaster_impact WHERE disaster_id = ?`, [id]),
    query(`SELECT * FROM vw_response_performance WHERE disaster_id = ?`, [id]),
  ]);

  return {
    ...rows[0],
    zones,
    impact: impact[0] || null,
    performance: performance[0] || null,
  };
}

export async function createDisaster(input: any, createdBy: string) {
  const insertId = crypto.randomUUID();
  await query(
    `INSERT INTO disasters
      (disaster_id, disaster_type, title, description, severity, status, start_time, estimated_end_time,
       affected_population, estimated_damage, latitude, longitude, created_by)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [
      insertId,
      input.disasterType,
      input.title,
      input.description || null,
      input.severity,
      input.status || "REPORTED",
      input.startTime,
      input.estimatedEndTime || null,
      input.affectedPopulation || 0,
      input.estimatedDamage || 0,
      input.latitude,
      input.longitude,
      createdBy,
    ],
  );
  
  if (input.metadata && Object.keys(input.metadata).length > 0) {
    for (const [key, value] of Object.entries(input.metadata)) {
      await query(
        `INSERT INTO disaster_metrics (metric_id, disaster_id, metric_key, metric_value, created_at) VALUES (UUID(), ?, ?, ?, NOW())`,
        [insertId, key, String(value)]
      );
    }
  }

  await query(
    `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, new_value) VALUES (?,?,?,?,?)`,
    [createdBy, "CREATE", "disasters", insertId, JSON.stringify(input)],
  );
  return getDisasterById(insertId);
}

export async function updateDisasterStatus(
  id: string,
  status: string,
  userId: string,
) {
  const before = await query(
    `SELECT status FROM disasters WHERE disaster_id = ?`,
    [id],
  );
  if (before.length === 0)
    throw new ApiError(404, "NOT_FOUND", "Disaster not found");
  await query(`UPDATE disasters SET status = ? WHERE disaster_id = ?`, [
    status,
    id,
  ]);
  await query(
    `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, old_value, new_value) VALUES (?,?,?,?,?,?)`,
    [
      userId,
      "UPDATE",
      "disasters",
      id,
      JSON.stringify(before[0]),
      JSON.stringify({ status }),
    ],
  );
  return getDisasterById(id);
}
