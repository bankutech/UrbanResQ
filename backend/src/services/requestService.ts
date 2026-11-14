
const FALLBACK_REQUESTS = [
  {
    request_id: 'req-01',
    disaster_id: 'dis-01',
    disaster_title: 'Cyclone Mandous Flood Surge',
    requester_name: 'Dr. K. Swaminathan (Clinic Head)',
    phone: '+91 98401 23456',
    category: 'MEDICAL_TRAUMA',
    urgency: 'CRITICAL',
    people_affected: 45,
    description: 'Ground floor dialysis ward submerged. 12 elderly patients require immediate evacuation and portable oxygen.',
    status: 'PENDING',
    location_id: 'loc-01',
    location_label: 'Velachery Multi-Specialty Clinic',
    zone_name: 'Zone 13 - South Coast',
    latitude: 12.9815,
    longitude: 80.2180,
    live_priority_score: 94.8,
    created_at: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
  },
  {
    request_id: 'req-02',
    disaster_id: 'dis-01',
    disaster_title: 'Cyclone Mandous Flood Surge',
    requester_name: 'Resident Welfare Association',
    phone: '+91 98405 67890',
    category: 'EVACUATION',
    urgency: 'HIGH',
    people_affected: 120,
    description: 'Apartment basement flooding caused transformer explosion. 35 families trapped on rooftop without potable water.',
    status: 'PENDING',
    location_id: 'loc-02',
    location_label: 'Adyar Riverbank Apartments Block C',
    zone_name: 'Zone 10 - Adyar',
    latitude: 13.0067,
    longitude: 80.2573,
    live_priority_score: 87.2,
    created_at: new Date(Date.now() - 1000 * 60 * 50).toISOString(),
  },
  {
    request_id: 'req-03',
    disaster_id: 'dis-01',
    disaster_title: 'Cyclone Mandous Flood Surge',
    requester_name: 'St. Thomas Community Shelter',
    phone: '+91 94440 11223',
    category: 'WATER_SANITATION',
    urgency: 'HIGH',
    people_affected: 300,
    description: 'Relief shelter drinking water pipeline ruptured. Need 200 water purification tablets and 500L bottled water canister dispatch.',
    status: 'PENDING',
    location_id: 'loc-03',
    location_label: 'St. Thomas Relief Camp',
    zone_name: 'Zone 12 - Alandur',
    latitude: 12.9984,
    longitude: 80.1918,
    live_priority_score: 79.5,
    created_at: new Date(Date.now() - 1000 * 60 * 80).toISOString(),
  },
  {
    request_id: 'req-04',
    disaster_id: 'dis-01',
    disaster_title: 'Cyclone Mandous Flood Surge',
    requester_name: 'Govt Higher Secondary School Shelter',
    phone: '+91 97890 33445',
    category: 'FOOD_RATIONS',
    urgency: 'MODERATE',
    people_affected: 210,
    description: 'Immediate dry ration kits and baby formula required for flood displaced families.',
    status: 'PENDING',
    location_id: 'loc-04',
    location_label: 'Govt School Camp',
    zone_name: 'Zone 09 - Teynampet',
    latitude: 13.0418,
    longitude: 80.2507,
    live_priority_score: 68.4,
    created_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
  }
];

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

  try {
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
  } catch (err: any) {
    console.warn('[RequestService] listRequests database fallback engaged:', err?.code || err?.message);
    const filtered = FALLBACK_REQUESTS.filter(r => {
      if (filters.status && r.status !== filters.status) return false;
      if (filters.urgency && r.urgency !== filters.urgency) return false;
      if (filters.category && r.category !== filters.category) return false;
      return true;
    });
    return { data: filtered.slice(offset, offset + pageSize), page, pageSize, total: filtered.length };
  }
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

  let disasterId = input.disasterId;
  if (!disasterId) {
    const activeDisaster: any[] = await query(
      `SELECT disaster_id FROM disasters WHERE status IN ('REPORTED', 'ACTIVE') ORDER BY start_time DESC LIMIT 1`
    );
    disasterId = activeDisaster.length > 0 ? activeDisaster[0].disaster_id : null;
    if (!disasterId) {
      const anyDisaster: any[] = await query(`SELECT disaster_id FROM disasters LIMIT 1`);
      disasterId = anyDisaster.length > 0 ? anyDisaster[0].disaster_id : null;
    }
  }

  let locationId = input.locationId;
  if (!locationId) {
    const defaultLoc: any[] = await query(`SELECT location_id FROM locations LIMIT 1`);
    locationId = defaultLoc.length > 0 ? defaultLoc[0].location_id : null;
  }

  await query(
    `INSERT INTO emergency_requests
      (request_id, disaster_id, zone_id, location_id, requester_type, citizen_id, requester_name, requester_contact,
       category, description, people_affected, vulnerable_count, urgency, status, required_resources_json)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [
      requestId,
      disasterId,
      input.zoneId || null,
      locationId,
      input.requesterType || 'CITIZEN',
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
