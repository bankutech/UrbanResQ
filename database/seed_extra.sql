USE urbanresq;
SET FOREIGN_KEY_CHECKS = 0;

-- 1. Hospital Beds and Admissions
-- H-01 (hospital_id 1)
INSERT IGNORE INTO hospital_beds (hospital_id, bed_type, bed_number, status)
VALUES
(1, 'GENERAL', 'G-101', 'OCCUPIED'),
(1, 'GENERAL', 'G-102', 'AVAILABLE'),
(1, 'ICU', 'I-201', 'OCCUPIED'),
(1, 'EMERGENCY', 'E-301', 'OCCUPIED');

INSERT IGNORE INTO hospital_admissions (hospital_id, request_id, patient_name, condition_severity, bed_id, admitted_at)
VALUES
(1, 1, 'Marcus Sterling', 'STABLE', 1, NOW() - INTERVAL 12 HOUR),
(1, 2, 'Elena Rostova', 'CRITICAL', 3, NOW() - INTERVAL 4 HOUR),
(1, NULL, 'Tariq Al-Hassan', 'SERIOUS', 4, NOW() - INTERVAL 2 HOUR);

-- H-02 (hospital_id 2)
INSERT IGNORE INTO hospital_beds (hospital_id, bed_type, bed_number, status)
VALUES
(2, 'GENERAL', 'G-101', 'OCCUPIED'),
(2, 'ICU', 'I-201', 'OCCUPIED');

INSERT IGNORE INTO hospital_admissions (hospital_id, request_id, patient_name, condition_severity, bed_id, admitted_at)
VALUES
(2, 3, 'Mei Lin', 'STABLE', 1, NOW() - INTERVAL 1 DAY),
(2, 4, 'Julian Vance', 'CRITICAL', 2, NOW() - INTERVAL 6 HOUR);

-- 2. Shelter Residents
-- S-01 (shelter_id 1)
INSERT IGNORE INTO shelter_residents (shelter_id, citizen_id, full_name, checked_in_at)
VALUES
(1, 1, 'Karthik Raman', NOW() - INTERVAL 12 HOUR),
(1, 2, 'Priya Subramaniam', NOW() - INTERVAL 10 HOUR),
(1, NULL, 'Unidentified Citizen 08', NOW() - INTERVAL 5 HOUR);

-- S-02 (shelter_id 2)
INSERT IGNORE INTO shelter_residents (shelter_id, citizen_id, full_name, checked_in_at)
VALUES
(2, 3, 'Ganesh Iyer', NOW() - INTERVAL 1 DAY),
(2, 4, 'Lakshmi Narayanan', NOW() - INTERVAL 8 HOUR);

-- 3. Volunteer Assignments
-- Assign a few volunteers (volunteer_id 1 to 5)
INSERT IGNORE INTO volunteer_assignments (volunteer_id, request_id, shelter_id, assigned_at)
VALUES
(1, 1, NULL, NOW() - INTERVAL 5 HOUR),
(2, NULL, 1, NOW() - INTERVAL 1 DAY),
(3, 2, NULL, NOW() - INTERVAL 2 HOUR),
(4, NULL, 2, NOW() - INTERVAL 12 HOUR),
(5, 3, NULL, NOW() - INTERVAL 1 HOUR);

-- 4. Emergency Tasks and Assignments
INSERT IGNORE INTO emergency_tasks (request_id, title, status, created_at)
VALUES
(1, 'Struct. Assessment: Grid 4A (High Rise)', 'PENDING', NOW() - INTERVAL 1 HOUR),
(2, 'Logistics: Pallet Airdrop (Water)', 'IN_PROGRESS', NOW() - INTERVAL 2 HOUR),
(3, 'Debris Clearance: I-95 Southbound Corridor', 'DONE', NOW() - INTERVAL 1 DAY);

INSERT IGNORE INTO task_assignments (task_id, assignee_type, assignee_id, assigned_at)
VALUES
(1, 'TEAM', 6, NOW()),
(2, 'VOLUNTEER', 1, NOW()),
(3, 'PERSONNEL', 1, NOW() - INTERVAL 1 DAY);

-- 5. Vehicle Deployments
-- The vehicles with status 'DEPLOYED' in seed.sql:
-- vehicle 2 ('AMB-12', team 2)
-- vehicle 5 ('AMB-21', team 6)
-- vehicle 7 ('FT-02', team 5)
-- vehicle 8 ('BOAT-03', team 1)
-- vehicle 10 ('BOAT-05', team 4)
INSERT IGNORE INTO vehicle_deployments (vehicle_id, request_id, deployed_at, destination_location_id)
VALUES
(2, 1, NOW() - INTERVAL 3 HOUR, 2),
(5, 2, NOW() - INTERVAL 1 HOUR, 12),
(7, 3, NOW() - INTERVAL 2 HOUR, 14),
(8, 4, NOW() - INTERVAL 5 HOUR, 1),
(10, 5, NOW() - INTERVAL 4 HOUR, 4);

-- 6. Call the Allocation Engine
-- Run for each active/reported disaster so that resource_allocations, resource_movements, 
-- and resource_shortages are populated nicely. User 1 (Admin) is the runner.
CALL sp_generate_resource_allocation_plan(1, 0, 1);
CALL sp_generate_resource_allocation_plan(2, 0, 1);
CALL sp_generate_resource_allocation_plan(3, 0, 1);
CALL sp_generate_resource_allocation_plan(4, 0, 1);
CALL sp_generate_resource_allocation_plan(6, 0, 1);

-- 7. System Settings
INSERT IGNORE INTO system_settings (setting_key, setting_value, description)
VALUES
('MAINTENANCE_MODE', 'false', 'Is the system currently under maintenance?'),
('MAX_ALLOCATION_DISTANCE_KM', '50.0', 'Maximum distance in km for resource allocation'),
('AUTO_APPROVE_CRITICAL', 'true', 'Auto approve allocations for critical requests');

SET FOREIGN_KEY_CHECKS = 1;
