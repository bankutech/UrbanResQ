import { query } from "../config/db";
import { ApiError } from "../utils/asyncHandler";
import crypto from "crypto";

export interface RequestFilters {
  disasterId?: string;
  status?: string;
  urgency?: string;
  category?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

export async function listRequests(filters: RequestFilters) {
  const page = filters.page && filters.page > 0 ? filters.page : 1;
  const pageSize =
    filters.pageSize && filters.pageSize > 0 && filters.pageSize <= 100
      ? filters.pageSize
      : 20;
  const offset = (page - 1) * pageSize;

  const where: string[] = [];
  const params: any[] = [];
  if (filters.disasterId) {
    where.push("er.disaster_id = ?");
    params.push(filters.disasterId);
  }
  if (filters.status) {
    where.push("er.status = ?");
    params.push(filters.status);
  }
  if (filters.urgency) {
    where.push("er.urgency = ?");
    params.push(filters.urgency);
  }
  if (filters.category) {
    where.push("er.category = ?");
    params.push(filters.category);
  }
  if (filters.search) {
    where.push("MATCH(er.description) AGAINST (? IN NATURAL LANGUAGE MODE)");
    params.push(filters.search);
  }

  const whereClause = where.length ? `WHERE ${where.join(" AND ")}` : "";

  const [rows, countRows] = await Promise.all([
    query(
      `SELECT er.*, fn_request_priority_score(er.request_id) AS live_priority_score,
              l.label AS location_label, l.zone_name, l.latitude, l.longitude, d.title AS disaster_title
       FROM emergency_requests er
       JOIN locations l ON l.location_id = er.location_id
       JOIN disasters d ON d.disaster_id = er.disaster_id
       ${whereClause}
       ORDER BY live_priority_score DESC
       LIMIT ? OFFSET ?`,
      [...params, pageSize, offset],
    ),
    query(
      `SELECT COUNT(*) AS total FROM emergency_requests er ${whereClause}`,
      params,
    ),
  ]);

  return { data: rows, page, pageSize, total: countRows[0].total };
}

export async function getRequestById(id: string) {
  const rows: any[] = await query(
    `SELECT er.*, fn_request_priority_score(er.request_id) AS live_priority_score,
            l.label AS location_label, l.zone_name, l.latitude, l.longitude, d.title AS disaster_title
     FROM emergency_requests er
     JOIN locations l ON l.location_id = er.location_id
     JOIN disasters d ON d.disaster_id = er.disaster_id
     WHERE er.request_id = ?`,
    [id],
  );
  if (rows.length === 0)
    throw new ApiError(404, "NOT_FOUND", "Emergency request not found");

  const [priorityBreakdown, history, allocations, deployedVehicles] =
    await Promise.all([
      query(
        `SELECT * FROM vw_emergency_request_priority WHERE request_id = ?`,
        [id],
      ),
      query(
        `SELECT * FROM request_status_history WHERE request_id = ? ORDER BY changed_at DESC`,
        [id],
      ),
      query(
        `SELECT ra.*, rt.name AS resource_type_name
       FROM resource_allocations ra
       LEFT JOIN resource_inventory ri ON ri.inventory_id = ra.inventory_id
       LEFT JOIN resources r ON r.resource_id = ri.resource_id
       LEFT JOIN resource_types rt ON rt.resource_type_id = r.resource_type_id
       WHERE ra.request_id = ? ORDER BY ra.created_at DESC`,
        [id],
      ),
      query(
        `SELECT vd.*, v.vehicle_code, v.vehicle_type
       FROM vehicle_deployments vd
       JOIN vehicles v ON v.vehicle_id = vd.vehicle_id
       WHERE vd.request_id = ? ORDER BY vd.deployed_at DESC`,
        [id],
      ),
    ]);

  return {
    ...rows[0],
    priorityBreakdown: priorityBreakdown[0] || null,
    history,
    allocations,
    deployedVehicles,
  };
}

export async function createRequest(input: any) {
  const requestId = crypto.randomUUID();

  await query(
    `INSERT INTO emergency_requests
      (request_id, disaster_id, zone_id, location_id, requester_type, citizen_id, requester_name, requester_contact,
       category, description, people_affected, vulnerable_count, urgency, status, required_resources_json)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [
      requestId,
      input.disasterId,
      input.zoneId || null,
      input.locationId,
      input.requesterType,
      input.citizenId || null,
      input.requesterName || null,
      input.requesterContact || null,
      input.category,
      input.description,
      input.peopleAffected ?? 1,
      input.vulnerableCount ?? 0,
      input.urgency || "MEDIUM",
      "PENDING",
      JSON.stringify(input.requiredResources || []),
    ],
  );

  await query(
    `INSERT INTO alerts (alert_type, severity, message, entity_type, entity_id)
     SELECT 'NEW_REQUEST', IF(urgency='CRITICAL','CRITICAL','INFO'),
            CONCAT('New ', category, ' request: ', LEFT(description, 80)), 'emergency_requests', request_id
     FROM emergency_requests WHERE request_id = ?`,
    [requestId],
  );

  return getRequestById(requestId);
}

export async function updateRequestStatus(
  id: string,
  status: string,
  userId: string,
  note?: string,
) {
  const existing = await query(
    `SELECT status FROM emergency_requests WHERE request_id = ?`,
    [id],
  );
  if (existing.length === 0)
    throw new ApiError(404, "NOT_FOUND", "Emergency request not found");

  await query(
    `UPDATE emergency_requests SET status = ?, resolved_at = IF(? IN ('RESOLVED','CANCELLED'), NOW(), resolved_at) WHERE request_id = ?`,
    [status, status, id],
  );
  await query(
    `UPDATE request_status_history SET changed_by = ?, note = ?
     WHERE history_id = (SELECT history_id FROM (SELECT history_id FROM request_status_history WHERE request_id = ? ORDER BY changed_at DESC LIMIT 1) t)`,
    [userId, note || null, id],
  );
  return getRequestById(id);
}
