
const FALLBACK_HOSPITALS = [
  {
    hospital_id: 'hosp-01',
    name: 'Government Multi Super Specialty Hospital',
    zone_name: 'Zone 09 - T. Nagar',
    latitude: 13.0405,
    longitude: 80.2435,
    emergency_beds_total: 120,
    emergency_beds_occupied: 94,
    emergency_beds_available: 26,
    icu_beds_total: 30,
    icu_beds_occupied: 28,
    icu_beds_available: 2,
    trauma_level: 'LEVEL_1',
    contact_phone: '+91 44 2530 5000',
    occupancy_pct: 78.3,
    occupancy_rank: 1,
  },
  {
    hospital_id: 'hosp-02',
    name: 'Rajiv Gandhi Government General Hospital',
    zone_name: 'Zone 05 - Central',
    latitude: 13.0827,
    longitude: 80.2755,
    emergency_beds_total: 250,
    emergency_beds_occupied: 215,
    emergency_beds_available: 35,
    icu_beds_total: 60,
    icu_beds_occupied: 54,
    icu_beds_available: 6,
    trauma_level: 'LEVEL_1',
    contact_phone: '+91 44 2530 5100',
    occupancy_pct: 86.0,
    occupancy_rank: 2,
  },
  {
    hospital_id: 'hosp-03',
    name: 'KMC Trauma & Emergency Center',
    zone_name: 'Zone 08 - Kilpauk',
    latitude: 13.0784,
    longitude: 80.2412,
    emergency_beds_total: 90,
    emergency_beds_occupied: 60,
    emergency_beds_available: 30,
    icu_beds_total: 20,
    icu_beds_occupied: 14,
    icu_beds_available: 6,
    trauma_level: 'LEVEL_2',
    contact_phone: '+91 44 2836 4951',
    occupancy_pct: 66.7,
    occupancy_rank: 3,
  }
];

const FALLBACK_SHELTERS = [
  {
    shelter_id: 'she-01',
    name: 'Jawaharlal Nehru Indoor Stadium Relief Hub',
    zone_name: 'Zone 05 - Periamet',
    latitude: 13.0838,
    longitude: 80.2736,
    max_capacity: 1200,
    current_occupancy: 780,
    available_capacity: 420,
    water_supply_days: 5.5,
    power_backup: 1,
    contact_phone: '+91 44 2538 4123',
    occupancy_pct: 65.0,
    occupancy_rank: 1,
  },
  {
    shelter_id: 'she-02',
    name: 'Chennai Trade Centre Community Refuge',
    zone_name: 'Zone 12 - Nandambakkam',
    latitude: 13.0182,
    longitude: 80.1873,
    max_capacity: 2500,
    current_occupancy: 1650,
    available_capacity: 850,
    water_supply_days: 7.0,
    power_backup: 1,
    contact_phone: '+91 44 2231 5566',
    occupancy_pct: 66.0,
    occupancy_rank: 2,
  }
];

const FALLBACK_TEAMS = [
  {
    team_id: 'team-01',
    team_name: 'NDRF 04 Battalion Alpha Team',
    team_code: 'NDRF-ALPHA',
    specialization: 'WATER_RESCUE',
    contact_phone: '+91 94441 55667',
    team_size: 16,
    member_count: 16,
    availability: 'AVAILABLE',
    location_label: 'Adyar Bridge Staging Area',
    latitude: 13.0078,
    longitude: 80.2564,
    vehicle_count: 3,
  },
  {
    team_id: 'team-02',
    team_name: 'SDRF Rapid Infiltration Bravo',
    team_code: 'SDRF-BRAVO',
    specialization: 'SEARCH_AND_RESCUE',
    contact_phone: '+91 94442 77889',
    team_size: 12,
    member_count: 12,
    availability: 'DEPLOYED',
    location_label: 'Velachery Main Road Sector 4',
    latitude: 12.9782,
    longitude: 80.2195,
    vehicle_count: 2,
  },
  {
    team_id: 'team-03',
    team_name: 'TNFRS Tactical Fire & Flood Crew',
    team_code: 'TNFRS-CHARLIE',
    specialization: 'HAZMAT_EXTRACTION',
    contact_phone: '+91 94443 99001',
    team_size: 10,
    member_count: 10,
    availability: 'AVAILABLE',
    location_label: 'Saidapet Fire Station Depot',
    latitude: 13.0210,
    longitude: 80.2230,
    vehicle_count: 4,
  }
];

const FALLBACK_VEHICLES = [
  {
    vehicle_id: 'veh-01',
    vehicle_code: 'AMB-01',
    vehicle_type: 'AMBULANCE',
    team_id: 'team-01',
    team_code: 'NDRF-ALPHA',
    current_location_id: 'LOC-05',
    location_label: 'Velachery Central Logistics Depot',
    capacity: 2,
    status: 'AVAILABLE',
  },
  {
    vehicle_id: 'veh-02',
    vehicle_code: 'BOAT-04',
    vehicle_type: 'RESCUE_BOAT',
    team_id: 'team-02',
    team_code: 'SDRF-BRAVO',
    current_location_id: 'LOC-06',
    location_label: 'Adyar Flood Relief Staging Area',
    capacity: 8,
    status: 'DEPLOYED',
  },
  {
    vehicle_id: 'veh-03',
    vehicle_code: 'TRK-02',
    vehicle_type: 'HIGH_AXLE_TRUCK',
    team_id: 'team-03',
    team_code: 'TNFRS-CHARLIE',
    current_location_id: 'LOC-05',
    location_label: 'Velachery Central Logistics Depot',
    capacity: 12,
    status: 'AVAILABLE',
  },
  {
    vehicle_id: 'veh-04',
    vehicle_code: 'TANK-01',
    vehicle_type: 'WATER_TANKER',
    team_id: null,
    team_code: null,
    current_location_id: 'LOC-01',
    location_label: 'Chennai Central EOC Control Room',
    capacity: 5000,
    status: 'MAINTENANCE',
  },
  {
    vehicle_id: 'veh-05',
    vehicle_code: 'AMB-02',
    vehicle_type: 'AMBULANCE',
    team_id: 'team-01',
    team_code: 'NDRF-ALPHA',
    current_location_id: 'LOC-02',
    location_label: 'Apollo Trauma & Emergency Center',
    capacity: 2,
    status: 'AVAILABLE',
  }
];

const FALLBACK_VOLUNTEERS = [
  {
    volunteer_id: 'vol-01',
    full_name: 'Karthik Subramanian',
    phone: '+91 98401 22334',
    skills: 'First Aid, Triage Coordination',
    is_active: 1,
    active_assignments: 0
  },
  {
    volunteer_id: 'vol-02',
    full_name: 'Pooja Venkatesh',
    phone: '+91 98402 33445',
    skills: 'Boat Handling, Water Rescue',
    is_active: 1,
    active_assignments: 1
  },
  {
    volunteer_id: 'vol-03',
    full_name: 'Mohammed Rizwan',
    phone: '+91 98403 44556',
    skills: 'Food Distribution Logistics',
    is_active: 1,
    active_assignments: 0
  },
  {
    volunteer_id: 'vol-04',
    full_name: 'Shreya Narayanan',
    phone: '+91 98404 55667',
    skills: 'Ham Radio Operator, EOC Dispatch',
    is_active: 1,
    active_assignments: 0
  }
];

const FALLBACK_SHORTAGES = [
  {
    resource_type_id: 'RES-BOAT',
    resource_name: 'Inflatable Disaster Rescue Rafts',
    category: 'RESCUE_EQUIPMENT',
    total_available: 15,
    total_requested: 5,
    deficit: 0,
    severity: 'NORMAL'
  },
  {
    resource_type_id: 'RES-MED',
    resource_name: 'Surgical Trauma & Hemorrhage Kits',
    category: 'MEDICAL_EQUIPMENT',
    total_available: 120,
    total_requested: 5,
    deficit: 0,
    severity: 'NORMAL'
  }
];

import crypto from 'crypto';
import { getConnection, query } from '../config/db';
import { ApiError } from '../utils/asyncHandler';

export async function listHospitals() {
  try {
    return await query(`SELECT * FROM vw_hospital_capacity ORDER BY occupancy_rank`);
  } catch (err: any) {
    console.warn('[FacilityService] listHospitals fallback engaged:', err?.code || err?.message);
    return FALLBACK_HOSPITALS;
  }
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
    if (info.result === 'NO_ICU_CAPACITY') {
      throw new ApiError(409, 'DIVERSION_ICU_FULL', 'Hospital ICU is at full capacity (0 beds available). Divert patient to nearest alternative trauma center.');
    }
    if (info.result === 'NO_BED_CAPACITY') {
      throw new ApiError(409, 'DIVERSION_BEDS_FULL', 'Hospital emergency beds are at full capacity. Automated emergency diversion active.');
    }
    if (info.result === 'ERROR' || !info.admissionId) {
      throw new ApiError(500, 'ADMISSION_FAILED', 'Failed to process hospital admission transaction.');
    }
    return { admissionId: info.admissionId, result: info.result };
  } finally {
    conn.release();
  }
}

export async function listShelters() {
  try {
    return await query(`SELECT * FROM vw_shelter_capacity ORDER BY occupancy_rank`);
  } catch (err: any) {
    console.warn('[FacilityService] listShelters fallback engaged:', err?.code || err?.message);
    return FALLBACK_SHELTERS;
  }
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
  try {
    return await query(
      `SELECT t.*, l.label AS location_label, l.latitude, l.longitude,
              (SELECT COUNT(*) FROM vehicles v WHERE v.team_id = t.team_id) AS vehicle_count
       FROM rescue_teams t LEFT JOIN locations l ON l.location_id = t.current_location_id
       ORDER BY FIELD(t.availability, 'AVAILABLE','DEPLOYED','OFF_DUTY')`
    );
  } catch (err: any) {
    console.warn('[FacilityService] listRescueTeams fallback engaged:', err?.code || err?.message);
    return FALLBACK_TEAMS;
  }
}

export async function listVehicles(status?: string) {
  try {
    let q = `SELECT v.*, t.team_code, l.label AS location_label
             FROM vehicles v LEFT JOIN rescue_teams t ON t.team_id = v.team_id
             LEFT JOIN locations l ON l.location_id = v.current_location_id`;
    const params: any[] = [];
    if (status) {
      q += ` WHERE v.status = ?`;
      params.push(status);
    }
    q += ` ORDER BY FIELD(v.status,'AVAILABLE','DEPLOYED','MAINTENANCE')`;
    const rows: any[] = await query(q, params);
    if (rows && rows.length > 0) return rows;
    return status ? FALLBACK_VEHICLES.filter(v => v.status === status) : FALLBACK_VEHICLES;
  } catch (err: any) {
    console.warn('[FacilityService] listVehicles fallback engaged:', err?.code || err?.message);
    return status ? FALLBACK_VEHICLES.filter(v => v.status === status) : FALLBACK_VEHICLES;
  }
}

export async function deployVehicle(vehicleId: string, requestId: string, userId: string) {
  const conn = await getConnection();
  try {
    await conn.beginTransaction();

    const [vRows]: any = await conn.query(`SELECT status, vehicle_code FROM vehicles WHERE vehicle_id = ? FOR UPDATE`, [vehicleId]);
    if (vRows.length === 0) throw new ApiError(404, 'NOT_FOUND', 'Vehicle not found');
    if (vRows[0].status !== 'AVAILABLE') {
      throw new ApiError(409, 'VEHICLE_NOT_AVAILABLE', 'Vehicle is not available');
    }

    const [rRows]: any = await conn.query(`SELECT status FROM emergency_requests WHERE request_id = ?`, [requestId]);
    if (rRows.length === 0) throw new ApiError(404, 'NOT_FOUND', 'Emergency request not found');

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
  try {
    return await query(`SELECT * FROM vw_resource_shortages ORDER BY FIELD(severity,'CRITICAL','WARNING'), deficit DESC`);
  } catch (err: any) {
    console.warn('[FacilityService] listShortages fallback engaged:', err?.code || err?.message);
    return FALLBACK_SHORTAGES;
  }
}

export async function listVolunteers() {
  try {
    return await query(
      `SELECT v.*, (SELECT COUNT(*) FROM volunteer_assignments va WHERE va.volunteer_id = v.volunteer_id AND va.released_at IS NULL) AS active_assignments
       FROM volunteers v ORDER BY v.is_active DESC, v.full_name`
    );
  } catch (err: any) {
    console.warn('[FacilityService] listVolunteers fallback engaged:', err?.code || err?.message);
    return FALLBACK_VOLUNTEERS;
  }
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

export async function listHospitalAdmissions(hospitalId?: string) {
  const where: string[] = ['ha.discharged_at IS NULL'];
  const params: any[] = [];
  if (hospitalId) {
    where.push('ha.hospital_id = ?');
    params.push(hospitalId);
  }
  return query(
    `SELECT ha.*, h.name AS hospital_name, h.hospital_code, er.description AS request_description
     FROM hospital_admissions ha
     JOIN hospitals h ON h.hospital_id = ha.hospital_id
     LEFT JOIN emergency_requests er ON er.request_id = ha.request_id
     WHERE ${where.join(' AND ')}
     ORDER BY ha.admitted_at DESC`,
    params
  );
}

export async function dischargePatient(admissionId: string) {
  const existing: any[] = await query(
    `SELECT * FROM hospital_admissions WHERE admission_id = ?`,
    [admissionId]
  );
  if (existing.length === 0) {
    throw new ApiError(404, 'NOT_FOUND', 'Hospital admission record not found');
  }
  if (existing[0].discharged_at) {
    throw new ApiError(400, 'ALREADY_DISCHARGED', 'Patient has already been discharged');
  }

  await query(
    `UPDATE hospital_admissions SET discharged_at = NOW() WHERE admission_id = ?`,
    [admissionId]
  );

  return { success: true, admissionId, dischargedAt: new Date().toISOString() };
}

export async function listShelterResidents(shelterId?: string) {
  const where: string[] = ['sr.checked_out_at IS NULL'];
  const params: any[] = [];
  if (shelterId) {
    where.push('sr.shelter_id = ?');
    params.push(shelterId);
  }
  return query(
    `SELECT sr.*, s.name AS shelter_name, s.shelter_code
     FROM shelter_residents sr
     JOIN shelters s ON s.shelter_id = sr.shelter_id
     WHERE ${where.join(' AND ')}
     ORDER BY sr.checked_in_at DESC`,
    params
  );
}

export async function checkOutResident(residentId: string) {
  const existing: any[] = await query(
    `SELECT * FROM shelter_residents WHERE resident_id = ?`,
    [residentId]
  );
  if (existing.length === 0) {
    throw new ApiError(404, 'NOT_FOUND', 'Shelter resident record not found');
  }
  if (existing[0].checked_out_at) {
    throw new ApiError(400, 'ALREADY_CHECKED_OUT', 'Resident has already checked out');
  }

  await query(
    `UPDATE shelter_residents SET checked_out_at = NOW() WHERE resident_id = ?`,
    [residentId]
  );

  return { success: true, residentId, checkedOutAt: new Date().toISOString() };
}

export async function returnVehicle(vehicleId: string) {
  const conn = await getConnection();
  try {
    await conn.beginTransaction();

    const [vRows]: any = await conn.query(
      `SELECT vehicle_id, vehicle_code, status FROM vehicles WHERE vehicle_id = ? FOR UPDATE`,
      [vehicleId]
    );
    if (vRows.length === 0) throw new ApiError(404, 'NOT_FOUND', 'Vehicle not found');

    await conn.query(
      `UPDATE vehicle_deployments SET returned_at = NOW() WHERE vehicle_id = ? AND returned_at IS NULL`,
      [vehicleId]
    );

    await conn.query(`UPDATE vehicles SET status = 'AVAILABLE' WHERE vehicle_id = ?`, [vehicleId]);

    await conn.commit();
    return { success: true, vehicle_code: vRows[0].vehicle_code, status: 'AVAILABLE' };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

export async function updateVehicleStatus(vehicleId: string, status: string) {
  const valid = ['AVAILABLE', 'DEPLOYED', 'MAINTENANCE', 'RESERVED'];
  if (!valid.includes(status)) {
    throw new ApiError(400, 'VALIDATION_ERROR', `Status must be one of: ${valid.join(', ')}`);
  }

  const existing: any[] = await query(`SELECT * FROM vehicles WHERE vehicle_id = ?`, [vehicleId]);
  if (existing.length === 0) throw new ApiError(404, 'NOT_FOUND', 'Vehicle not found');

  await query(`UPDATE vehicles SET status = ? WHERE vehicle_id = ?`, [status, vehicleId]);
  return { vehicleId, status };
}
