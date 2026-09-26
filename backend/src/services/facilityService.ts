import crypto from 'crypto';
import { getConnection, query } from '../config/db';
import { ApiError } from '../utils/asyncHandler';

export async function listHospitals() {
  return query(`SELECT * FROM vw_hospital_capacity ORDER BY occupancy_rank`);
}

export async function admitPatient(input: {
  hospitalId: string; requestId?: string; patientName: string;
  condition: 'STABLE' | 'SERIOUS' | 'CRITICAL'; needsIcu: boolean;
}) {
  const conn = await getConnection();
  try {
    await conn.query(
      `CALL sp_admit_patient(?, ?, ?, ?, ?, @admission_id, @result)`,
      [input.hospitalId, input.requestId || null, input.patientName, input.condition, input.needsIcu ? 1 : 0]
    );
    const [rows]: any = await conn.query(`SELECT @admission_id AS admissionId, @result AS result`);
    const info = rows[0];
    return { admissionId: info.admissionId, result: info.result };
  } finally {
    conn.release();
  }
}

export async function listShelters() {
  return query(`SELECT * FROM vw_shelter_capacity ORDER BY occupancy_rank`);
}

export async function checkInResident(shelterId: string, fullName: string, citizenId?: string) {
  const conn = await getConnection();
  try {
    await conn.beginTransaction();

    const [rows]: any = await conn.query(
      `SELECT max_capacity, current_occupancy FROM shelters WHERE shelter_id = ? FOR UPDATE`,
      [shelterId]
    );
    if (rows.length === 0) throw new ApiError(404, 'NOT_FOUND', 'Shelter not found');
    if (rows[0].current_occupancy >= rows[0].max_capacity) {
      throw new ApiError(409, 'SHELTER_FULL', 'Shelter is at full capacity');
    }
    const residentId = crypto.randomUUID();
    await conn.query(
      `INSERT INTO shelter_residents (resident_id, shelter_id, citizen_id, full_name) VALUES (?,?,?,?)`,
      [residentId, shelterId, citizenId || null, fullName]
    );

    await conn.commit();
    return { residentId };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

export async function listRescueTeams() {
  return query(
    `SELECT t.*, l.label AS location_label, l.latitude, l.longitude,
            (SELECT COUNT(*) FROM vehicles v WHERE v.team_id = t.team_id) AS vehicle_count
     FROM rescue_teams t LEFT JOIN locations l ON l.location_id = t.current_location_id
     ORDER BY FIELD(t.availability, 'AVAILABLE','DEPLOYED','OFF_DUTY')`
  );
}

export async function listVehicles(status?: string) {
  let q = `SELECT v.*, t.team_code, l.label AS location_label
           FROM vehicles v LEFT JOIN rescue_teams t ON t.team_id = v.team_id
           LEFT JOIN locations l ON l.location_id = v.current_location_id`;
  const params: any[] = [];
  if (status) {
    q += ` WHERE v.status = ?`;
    params.push(status);
  }
  q += ` ORDER BY FIELD(v.status,'AVAILABLE','DEPLOYED','MAINTENANCE')`;
  return query(q, params);
}

export async function deployVehicle(vehicleId: string, requestId: string, userId: string) {
  const conn = await getConnection();
  try {
    await conn.beginTransaction();

    const [vRows]: any = await conn.query(`SELECT status, vehicle_code FROM vehicles WHERE vehicle_id = ? FOR UPDATE`, [vehicleId]);
    if (vRows.length === 0) throw new Error('Vehicle not found');
    if (vRows[0].status !== 'AVAILABLE') {
      const err: any = new Error('Vehicle is not available');
      err.status = 409;
      throw err;
    }

    const [rRows]: any = await conn.query(`SELECT status FROM emergency_requests WHERE request_id = ?`, [requestId]);
    if (rRows.length === 0) throw new Error('Emergency request not found');

    await conn.query(
      `INSERT INTO vehicle_deployments (vehicle_id, request_id) VALUES (?, ?)`,
      [vehicleId, requestId]
    );

    await conn.query(`UPDATE vehicles SET status = 'DEPLOYED' WHERE vehicle_id = ?`, [vehicleId]);

    if (rRows[0].status === 'PENDING' || rRows[0].status === 'ACKNOWLEDGED') {
      await conn.query(`UPDATE emergency_requests SET status = 'IN_PROGRESS' WHERE request_id = ?`, [requestId]);
      await conn.query(
        `UPDATE request_status_history SET changed_by = ?, note = ?
         WHERE history_id = (SELECT history_id FROM (SELECT history_id FROM request_status_history WHERE request_id = ? ORDER BY changed_at DESC LIMIT 1) t)`,
        [userId, `Dispatched vehicle ${vRows[0].vehicle_code}`, requestId]
      );
    } else {
      await conn.query(
        `INSERT INTO request_status_history (request_id, old_status, new_status, changed_by, note)
         VALUES (?, ?, ?, ?, ?)`,
        [requestId, rRows[0].status, rRows[0].status, userId, `Dispatched vehicle ${vRows[0].vehicle_code}`]
      );
    }

    await conn.commit();
    return { success: true, vehicle_code: vRows[0].vehicle_code };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

export async function listShortages() {
  return query(`SELECT * FROM vw_resource_shortages ORDER BY FIELD(severity,'CRITICAL','WARNING'), deficit DESC`);
}

export async function listVolunteers() {
  return query(
    `SELECT v.*, (SELECT COUNT(*) FROM volunteer_assignments va WHERE va.volunteer_id = v.volunteer_id AND va.released_at IS NULL) AS active_assignments
     FROM volunteers v ORDER BY v.is_active DESC, v.full_name`
  );
}

export async function assignVolunteer(volunteerId: string, requestId?: string, shelterId?: string) {
  if (!requestId && !shelterId) throw new ApiError(400, 'VALIDATION_ERROR', 'Must provide either requestId or shelterId');
  if (requestId && shelterId) throw new ApiError(400, 'VALIDATION_ERROR', 'Cannot assign to both request and shelter simultaneously');

  const conn = await getConnection();
  try {
    await conn.beginTransaction();

    const [vRows]: any = await conn.query(`SELECT is_active FROM volunteers WHERE volunteer_id = ? FOR UPDATE`, [volunteerId]);
    if (vRows.length === 0) throw new ApiError(404, 'NOT_FOUND', 'Volunteer not found');
    if (!vRows[0].is_active) throw new ApiError(409, 'VOLUNTEER_INACTIVE', 'Volunteer is not active');

    const [aRows]: any = await conn.query(`SELECT COUNT(*) as count FROM volunteer_assignments WHERE volunteer_id = ? AND released_at IS NULL`, [volunteerId]);
    if (aRows[0].count > 0) {
      throw new ApiError(409, 'ALREADY_ASSIGNED', 'Volunteer already has an active assignment');
    }

    await conn.query(
      `INSERT INTO volunteer_assignments (volunteer_id, request_id, shelter_id) VALUES (?, ?, ?)`,
      [volunteerId, requestId || null, shelterId || null]
    );

    await conn.commit();
    return { success: true };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

export async function releaseVolunteer(volunteerId: string) {
  const result: any = await query(
    `UPDATE volunteer_assignments SET released_at = NOW() WHERE volunteer_id = ? AND released_at IS NULL`,
    [volunteerId]
  );
  if (result.affectedRows === 0) {
    throw new ApiError(404, 'NOT_FOUND', 'No active assignments found for this volunteer');
  }
  return { success: true, releasedCount: result.affectedRows };
}

export async function listSuppliers() {
  return query(
    `SELECT s.*, (SELECT COUNT(*) FROM supply_deliveries d WHERE d.supplier_id = s.supplier_id AND d.status <> 'DELIVERED') AS pending_deliveries
     FROM suppliers s ORDER BY s.name`
  );
}
