-- ============================================================================
-- URBANRESQ — UNIFIED MASTER DATABASE IMPLEMENTATION SCRIPT
-- Single Authoritative SQL Script: Schema DDL, Constraints, Functions,
-- Stored Procedures, Triggers, Analytical Views, and Baseline Seed Data.
-- Fully synchronized with UrbanResQ Emergency Command Platform.
-- Compatible with MySQL 8.0+ and MySQL Workbench.
-- ============================================================================

CREATE DATABASE IF NOT EXISTS urbanresq
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE urbanresq;

-- Disable foreign key checks during clean rebuild
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------------------------------------------------------
-- 1. DROP EXISTING OBJECTS
-- ----------------------------------------------------------------------------
DROP VIEW IF EXISTS vw_resource_utilization;
DROP VIEW IF EXISTS vw_shelter_capacity;
DROP VIEW IF EXISTS vw_resource_shortages;
DROP VIEW IF EXISTS vw_city_emergency_status;
DROP VIEW IF EXISTS vw_active_disaster_summary;
DROP VIEW IF EXISTS vw_available_resources;
DROP VIEW IF EXISTS vw_hospital_capacity;
DROP VIEW IF EXISTS vw_hospital_bed_utilization;
DROP VIEW IF EXISTS vw_critical_shortages;

DROP TABLE IF EXISTS audit_logs;
DROP TABLE IF EXISTS alerts;
DROP TABLE IF EXISTS volunteer_assignments;
DROP TABLE IF EXISTS volunteers;
DROP TABLE IF EXISTS vehicle_deployments;
DROP TABLE IF EXISTS vehicles;
DROP TABLE IF EXISTS shelter_residents;
DROP TABLE IF EXISTS shelters;
DROP TABLE IF EXISTS rescue_teams;
DROP TABLE IF EXISTS user_roles;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS roles;
DROP TABLE IF EXISTS resource_movements;
DROP TABLE IF EXISTS request_status_history;
DROP TABLE IF EXISTS hospital_admissions;
DROP TABLE IF EXISTS hospitals;
DROP TABLE IF EXISTS resource_allocations;
DROP TABLE IF EXISTS emergency_requests;
DROP TABLE IF EXISTS resource_inventory;
DROP TABLE IF EXISTS resource_types;
DROP TABLE IF EXISTS disasters;
DROP TABLE IF EXISTS locations;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================================
-- PART 1: CORE RELATIONAL TABLES (DDL with Relational Integrity & Constraints)
-- ============================================================================

-- 1. Locations Table
CREATE TABLE locations (
    location_id   VARCHAR(36) PRIMARY KEY,
    label         VARCHAR(150) NOT NULL,
    zone_name     VARCHAR(100) NOT NULL,
    latitude      DECIMAL(9,6) NOT NULL,
    longitude     DECIMAL(9,6) NOT NULL,
    address       TEXT,
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_latitude CHECK (latitude BETWEEN -90.000000 AND 90.000000),
    CONSTRAINT chk_longitude CHECK (longitude BETWEEN -180.000000 AND 180.000000)
) ENGINE=InnoDB;

-- 2. Disasters Declaration Table
CREATE TABLE disasters (
    disaster_id          VARCHAR(36) PRIMARY KEY,
    title                VARCHAR(200) NOT NULL,
    disaster_type        ENUM('FLOOD', 'CYCLONE', 'EARTHQUAKE', 'LANDSLIDE', 'FIRE', 'INDUSTRIAL', 'OTHER') NOT NULL,
    severity             ENUM('WATCH', 'WARNING', 'ALERT', 'CRITICAL', 'CATASTROPHIC') NOT NULL DEFAULT 'ALERT',
    epicenter_location_id VARCHAR(36),
    status               ENUM('ACTIVE', 'CONTAINED', 'RESOLVED') NOT NULL DEFAULT 'ACTIVE',
    affected_population  INT UNSIGNED DEFAULT 0,
    created_at           TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (epicenter_location_id) REFERENCES locations(location_id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 3. Resource Classifications Table
CREATE TABLE resource_types (
    resource_type_id VARCHAR(36) PRIMARY KEY,
    name             VARCHAR(100) NOT NULL,
    category         ENUM('MEDICAL_EQUIPMENT', 'FOOD_RATIONS', 'POTABLE_WATER', 'RESCUE_EQUIPMENT', 'POWER_GENERATOR') NOT NULL,
    unit_of_measure  VARCHAR(30) NOT NULL,
    is_critical      TINYINT(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB;

-- 4. Expirable Resource Inventory Batches Table
CREATE TABLE resource_inventory (
    inventory_id       VARCHAR(36) PRIMARY KEY,
    resource_type_id   VARCHAR(36) NOT NULL,
    location_id        VARCHAR(36) NOT NULL,
    batch_lot_number   VARCHAR(50),
    available_quantity DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    allocated_quantity DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    expiration_date    DATE NULL,
    created_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (resource_type_id) REFERENCES resource_types(resource_type_id) ON DELETE RESTRICT,
    FOREIGN KEY (location_id) REFERENCES locations(location_id) ON DELETE RESTRICT,
    CONSTRAINT chk_positive_inventory CHECK (available_quantity >= 0 AND allocated_quantity >= 0)
) ENGINE=InnoDB;

-- 5. Emergency Distress Requests Table
CREATE TABLE emergency_requests (
    request_id              VARCHAR(36) PRIMARY KEY,
    disaster_id             VARCHAR(36) NOT NULL,
    location_id             VARCHAR(36) NOT NULL,
    requester_name          VARCHAR(100) DEFAULT 'Citizen/Field Officer',
    category                ENUM('RESCUE', 'MEDICAL', 'WATER', 'FOOD', 'SHELTER', 'EVACUATION') NOT NULL,
    urgency                 ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL') NOT NULL DEFAULT 'MEDIUM',
    people_affected         INT UNSIGNED NOT NULL DEFAULT 1,
    vulnerable_count        INT UNSIGNED NOT NULL DEFAULT 0, -- infants, pregnant, elderly
    description             TEXT NOT NULL,
    required_resources_json JSON,                            -- e.g. [{"resource_type_id":"RES-MED","quantity":10}]
    status                  ENUM('PENDING', 'SUBMITTED', 'ASSIGNED', 'IN_TRANSIT', 'FULFILLED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    priority_score          DECIMAL(6,2) NULL,
    created_at              TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (disaster_id) REFERENCES disasters(disaster_id) ON DELETE CASCADE,
    FOREIGN KEY (location_id) REFERENCES locations(location_id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- 6. Resource Allocations Ledger Table
CREATE TABLE resource_allocations (
    allocation_id              VARCHAR(36) PRIMARY KEY,
    request_id                 VARCHAR(36) NOT NULL,
    inventory_id               VARCHAR(36) NOT NULL,
    quantity_allocated         DECIMAL(12,2) NOT NULL,
    allocation_score           DECIMAL(8,2) NOT NULL,
    distance_km                DECIMAL(8,2) NOT NULL,
    estimated_response_minutes INT,
    status                     ENUM('PROPOSED', 'APPROVED', 'DISPATCHED', 'DELIVERED', 'CANCELLED') NOT NULL DEFAULT 'APPROVED',
    allocated_by               VARCHAR(36),
    created_at                 TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (request_id) REFERENCES emergency_requests(request_id) ON DELETE CASCADE,
    FOREIGN KEY (inventory_id) REFERENCES resource_inventory(inventory_id) ON DELETE RESTRICT,
    CONSTRAINT chk_allocation_quantity CHECK (quantity_allocated > 0),
    CONSTRAINT chk_allocation_distance CHECK (distance_km >= 0)
) ENGINE=InnoDB;

-- 7. Hospitals & Trauma Centers Table
CREATE TABLE IF NOT EXISTS hospitals (
    hospital_id        VARCHAR(36) PRIMARY KEY,
    location_id        VARCHAR(36) NOT NULL,
    hospital_code      VARCHAR(50) NULL,
    name               VARCHAR(150) NOT NULL,
    total_beds         INT UNSIGNED NOT NULL DEFAULT 100,
    available_beds     INT UNSIGNED NOT NULL DEFAULT 100,
    total_icu_beds     INT UNSIGNED NOT NULL DEFAULT 20,
    available_icu_beds INT UNSIGNED NOT NULL DEFAULT 20,
    FOREIGN KEY (location_id) REFERENCES locations(location_id) ON DELETE RESTRICT,
    CONSTRAINT chk_bed_bounds CHECK (
        total_beds > 0 AND total_icu_beds > 0
        AND available_beds <= total_beds
        AND available_icu_beds <= total_icu_beds
    )
) ENGINE=InnoDB;

-- 8. Hospital Inpatient Admissions Table
CREATE TABLE IF NOT EXISTS hospital_admissions (
    admission_id       VARCHAR(36) PRIMARY KEY,
    hospital_id        VARCHAR(36) NOT NULL,
    request_id         VARCHAR(36) NULL,
    patient_name       VARCHAR(100) NOT NULL,
    triage_category    ENUM('IMMEDIATE_RED', 'DELAYED_YELLOW', 'MINIMAL_GREEN', 'EXPECTANT_BLACK') NOT NULL,
    condition_severity ENUM('NORMAL', 'CRITICAL') NOT NULL DEFAULT 'NORMAL',
    bed_number         VARCHAR(20),
    admitted_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    discharged_at      TIMESTAMP NULL,
    FOREIGN KEY (hospital_id) REFERENCES hospitals(hospital_id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- 9. Resource Movements Audit Log Table
CREATE TABLE IF NOT EXISTS resource_movements (
    movement_id      VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    inventory_id     VARCHAR(36) NOT NULL,
    movement_type    VARCHAR(30) NOT NULL,
    quantity         DECIMAL(12,2) NOT NULL,
    reference_type   VARCHAR(50),
    reference_id     VARCHAR(36),
    performed_by     VARCHAR(36),
    created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (inventory_id) REFERENCES resource_inventory(inventory_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 10. Status Audit Trail Table
CREATE TABLE IF NOT EXISTS request_status_history (
    history_id VARCHAR(36) PRIMARY KEY,
    request_id VARCHAR(36) NOT NULL,
    old_status VARCHAR(20),
    new_status VARCHAR(20),
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 11. Alerts Notification Queue Table
CREATE TABLE IF NOT EXISTS alerts (
    alert_id    INT AUTO_INCREMENT PRIMARY KEY,
    alert_type  VARCHAR(50) NOT NULL,
    severity    VARCHAR(30) NOT NULL DEFAULT 'INFO',
    message     TEXT NOT NULL,
    entity_type VARCHAR(50) NULL,
    entity_id   VARCHAR(50) NULL,
    is_read     TINYINT(1) NOT NULL DEFAULT 0,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 12. Security & Operation Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
    audit_id    INT AUTO_INCREMENT PRIMARY KEY,
    user_id     VARCHAR(50) NULL,
    action      VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NULL,
    entity_id   VARCHAR(50) NULL,
    new_value   JSON NULL,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 13. System Users Table
CREATE TABLE IF NOT EXISTS users (
    user_id       VARCHAR(36) PRIMARY KEY,
    full_name     VARCHAR(150) NOT NULL,
    email         VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    is_active     TINYINT(1) NOT NULL DEFAULT 1,
    last_login_at TIMESTAMP NULL,
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 14. System Roles Table
CREATE TABLE IF NOT EXISTS roles (
    role_id   VARCHAR(36) PRIMARY KEY,
    role_name VARCHAR(50) NOT NULL UNIQUE
) ENGINE=InnoDB;

-- 15. User Roles Mapping Table
CREATE TABLE IF NOT EXISTS user_roles (
    user_id VARCHAR(36) NOT NULL,
    role_id VARCHAR(36) NOT NULL,
    PRIMARY KEY (user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(role_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 16. Rescue Teams & Squads Table
CREATE TABLE IF NOT EXISTS rescue_teams (
    team_id             VARCHAR(36) PRIMARY KEY,
    team_name           VARCHAR(100) NOT NULL,
    team_code           VARCHAR(50) NOT NULL UNIQUE,
    specialization      VARCHAR(100) NOT NULL,
    contact_phone       VARCHAR(50) NULL,
    team_size           INT UNSIGNED NOT NULL DEFAULT 10,
    member_count        INT UNSIGNED NOT NULL DEFAULT 10,
    availability        ENUM('AVAILABLE', 'DEPLOYED', 'OFF_DUTY') NOT NULL DEFAULT 'AVAILABLE',
    current_location_id VARCHAR(36) NULL,
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (current_location_id) REFERENCES locations(location_id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 17. Emergency Vehicle Fleet Table
CREATE TABLE IF NOT EXISTS vehicles (
    vehicle_id          VARCHAR(36) PRIMARY KEY,
    vehicle_code        VARCHAR(50) NOT NULL UNIQUE,
    vehicle_type        VARCHAR(50) NOT NULL,
    team_id             VARCHAR(36) NULL,
    current_location_id VARCHAR(36) NULL,
    capacity            DECIMAL(8,2) NOT NULL DEFAULT 2.0,
    status              ENUM('AVAILABLE', 'DEPLOYED', 'MAINTENANCE', 'RESERVED') NOT NULL DEFAULT 'AVAILABLE',
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (team_id) REFERENCES rescue_teams(team_id) ON DELETE SET NULL,
    FOREIGN KEY (current_location_id) REFERENCES locations(location_id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 18. Vehicle Deployments Log Table
CREATE TABLE IF NOT EXISTS vehicle_deployments (
    deployment_id       INT AUTO_INCREMENT PRIMARY KEY,
    vehicle_id          VARCHAR(36) NOT NULL,
    request_id          VARCHAR(36) NOT NULL,
    deployed_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    returned_at         TIMESTAMP NULL,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(vehicle_id) ON DELETE CASCADE,
    FOREIGN KEY (request_id) REFERENCES emergency_requests(request_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 19. Emergency Relief Shelters Table
CREATE TABLE IF NOT EXISTS shelters (
    shelter_id          VARCHAR(36) PRIMARY KEY,
    location_id         VARCHAR(36) NOT NULL,
    shelter_code        VARCHAR(50) NULL,
    name                VARCHAR(150) NOT NULL,
    max_capacity        INT UNSIGNED NOT NULL DEFAULT 1000,
    current_occupancy   INT UNSIGNED NOT NULL DEFAULT 0,
    water_supply_days   DECIMAL(4,1) NOT NULL DEFAULT 5.0,
    power_backup        TINYINT(1) NOT NULL DEFAULT 1,
    contact_phone       VARCHAR(50) NULL,
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (location_id) REFERENCES locations(location_id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- 20. Shelter Residents Registry
CREATE TABLE IF NOT EXISTS shelter_residents (
    resident_id         VARCHAR(36) PRIMARY KEY,
    shelter_id          VARCHAR(36) NOT NULL,
    citizen_id          VARCHAR(50) NULL,
    full_name           VARCHAR(150) NOT NULL,
    admitted_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    checked_in_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    checked_out_at      TIMESTAMP NULL,
    FOREIGN KEY (shelter_id) REFERENCES shelters(shelter_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 21. Volunteers Auxiliary Registry Table
CREATE TABLE IF NOT EXISTS volunteers (
    volunteer_id        VARCHAR(36) PRIMARY KEY,
    full_name           VARCHAR(150) NOT NULL,
    phone               VARCHAR(50) NULL,
    skills              VARCHAR(255) NULL,
    is_active           TINYINT(1) NOT NULL DEFAULT 1,
    registered_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 22. Volunteer Assignments Log Table
CREATE TABLE IF NOT EXISTS volunteer_assignments (
    assignment_id       INT AUTO_INCREMENT PRIMARY KEY,
    volunteer_id        VARCHAR(36) NOT NULL,
    request_id          VARCHAR(36) NULL,
    shelter_id          VARCHAR(36) NULL,
    assigned_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    released_at         TIMESTAMP NULL,
    FOREIGN KEY (volunteer_id) REFERENCES volunteers(volunteer_id) ON DELETE CASCADE,
    FOREIGN KEY (request_id) REFERENCES emergency_requests(request_id) ON DELETE SET NULL,
    FOREIGN KEY (shelter_id) REFERENCES shelters(shelter_id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ============================================================================
-- PART 2: ADVANCED STORED FUNCTIONS
-- ============================================================================

DELIMITER $$

-- Great-Circle Spherical Distance using Haversine formula (km)
DROP FUNCTION IF EXISTS fn_haversine_km$$
CREATE FUNCTION fn_haversine_km(
    lat1 DECIMAL(9,6),
    lon1 DECIMAL(9,6),
    lat2 DECIMAL(9,6),
    lon2 DECIMAL(9,6)
)
RETURNS DECIMAL(8,2)
DETERMINISTIC
NO SQL
BEGIN
    DECLARE r DECIMAL(9,4) DEFAULT 6371.0;
    DECLARE dlat DECIMAL(12,8);
    DECLARE dlon DECIMAL(12,8);
    DECLARE a DECIMAL(20,15);
    DECLARE c DECIMAL(20,15);

    SET dlat = RADIANS(lat2 - lat1);
    SET dlon = RADIANS(lon2 - lon1);

    SET a = SIN(dlat / 2) * SIN(dlat / 2)
          + COS(RADIANS(lat1)) * COS(RADIANS(lat2))
          * SIN(dlon / 2) * SIN(dlon / 2);

    SET a = LEAST(1.0, GREATEST(0.0, a));
    SET c = 2 * ATAN2(SQRT(a), SQRT(1 - a));

    RETURN ROUND(r * c, 2);
END$$

-- Real-time Mathematical Priority Scoring Algorithm
DROP FUNCTION IF EXISTS fn_request_priority_score$$
CREATE FUNCTION fn_request_priority_score(p_request_id VARCHAR(36))
RETURNS DECIMAL(6,2)
NOT DETERMINISTIC
READS SQL DATA
BEGIN
    DECLARE v_urgency VARCHAR(10);
    DECLARE v_people INT;
    DECLARE v_vulnerable INT;
    DECLARE v_category VARCHAR(20);
    DECLARE v_waiting_minutes INT;
    DECLARE v_score DECIMAL(6,2);

    SELECT urgency, people_affected, vulnerable_count, category,
           TIMESTAMPDIFF(MINUTE, created_at, NOW())
      INTO v_urgency, v_people, v_vulnerable, v_category, v_waiting_minutes
      FROM emergency_requests
     WHERE request_id = p_request_id;

    SET v_score =
        (CASE v_urgency WHEN 'CRITICAL' THEN 40.0 WHEN 'HIGH' THEN 28.0 WHEN 'MEDIUM' THEN 14.0 ELSE 5.0 END)
        + LEAST(v_people * 1.2, 25.0)
        + LEAST(v_waiting_minutes * 0.4, 20.0)
        + LEAST(v_vulnerable * 3.0, 15.0)
        + (CASE WHEN v_category IN ('MEDICAL','RESCUE') THEN 10.0 ELSE 3.0 END);

    RETURN ROUND(v_score, 2);
END$$

-- Stock Threshold Indicator Function
DROP FUNCTION IF EXISTS fn_stock_status$$
CREATE FUNCTION fn_stock_status(p_available DECIMAL(12,2), p_threshold DECIMAL(12,2)) 
RETURNS VARCHAR(10)
DETERMINISTIC
NO SQL
BEGIN
    IF p_available <= p_threshold * 0.2 THEN RETURN 'CRITICAL';
    ELSEIF p_available <= p_threshold * 0.5 THEN RETURN 'WARNING';
    ELSE RETURN 'NORMAL';
    END IF;
END$$

DELIMITER ;

-- ============================================================================
-- PART 3: MASTER STORED PROCEDURE (FIFO Transactional Allocation Engine)
-- ============================================================================

DELIMITER $$

DROP PROCEDURE IF EXISTS sp_generate_resource_allocation_plan$$
CREATE PROCEDURE sp_generate_resource_allocation_plan(
    IN p_disaster_id VARCHAR(36),
    IN p_dry_run     TINYINT,       -- 1 = simulation, 0 = live allocation
    IN p_run_by      VARCHAR(36)
)
proc_body: BEGIN
    DECLARE v_done INT DEFAULT 0;
    DECLARE v_request_id VARCHAR(36);
    DECLARE v_priority DECIMAL(6,2);
    DECLARE v_required_json JSON;
    DECLARE v_req_lat DECIMAL(9,6);
    DECLARE v_req_lon DECIMAL(9,6);
    DECLARE v_inventory_id VARCHAR(36);
    DECLARE v_resource_type_id VARCHAR(36);
    DECLARE v_available DECIMAL(12,2);
    DECLARE v_is_critical TINYINT;
    DECLARE v_depot_lat DECIMAL(9,6);
    DECLARE v_depot_lon DECIMAL(9,6);
    DECLARE v_distance DECIMAL(8,2);
    DECLARE v_alloc_score DECIMAL(8,2);
    DECLARE v_needed_qty DECIMAL(12,2);
    DECLARE v_remaining_qty DECIMAL(12,2);
    DECLARE v_grant_qty DECIMAL(12,2);
    DECLARE v_already_allocated DECIMAL(12,2);
    DECLARE v_idx INT;
    DECLARE v_len INT;
    DECLARE v_request_fulfilled TINYINT DEFAULT 1;
    DECLARE v_inventory_found TINYINT DEFAULT 1;
    DECLARE v_lock_status INT DEFAULT 0;

    DECLARE req_cursor CURSOR FOR
        SELECT er.request_id,
               fn_request_priority_score(er.request_id) AS score,
               er.required_resources_json,
               l.latitude,
               l.longitude
          FROM emergency_requests er
          JOIN locations l ON l.location_id = er.location_id
         WHERE er.status IN ('PENDING', 'SUBMITTED')
           AND (p_disaster_id IS NULL OR er.disaster_id = p_disaster_id)
         ORDER BY score DESC, er.created_at ASC, er.request_id ASC;

    DECLARE CONTINUE HANDLER FOR NOT FOUND SET v_done = 1;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        IF v_lock_status = 1 THEN
            DO RELEASE_LOCK('allocation_engine_lock');
        END IF;
        DROP TEMPORARY TABLE IF EXISTS tmp_stock;
        DROP TEMPORARY TABLE IF EXISTS tmp_plan;
        RESIGNAL;
    END;

    IF p_dry_run IS NULL OR p_dry_run NOT IN (0, 1) THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'p_dry_run must be 0 (live) or 1 (simulation).';
    END IF;

    SELECT GET_LOCK('allocation_engine_lock', 10) INTO v_lock_status;
    IF v_lock_status IS NULL OR v_lock_status <> 1 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Resource Allocation Engine is locked by another operator.';
    END IF;

    DROP TEMPORARY TABLE IF EXISTS tmp_plan;
    CREATE TEMPORARY TABLE tmp_plan (
        request_id         VARCHAR(36) NOT NULL,
        resource_type_id   VARCHAR(36) NOT NULL,
        inventory_id       VARCHAR(36) NOT NULL,
        quantity_allocated DECIMAL(12,2) NOT NULL,
        allocation_score   DECIMAL(8,2) NOT NULL,
        distance_km        DECIMAL(8,2) NOT NULL,
        fulfilled          TINYINT NOT NULL
    ) ENGINE=MEMORY;

    CREATE TEMPORARY TABLE tmp_stock (
        inventory_id       VARCHAR(36) NOT NULL PRIMARY KEY,
        remaining_quantity DECIMAL(12,2) NOT NULL
    ) ENGINE=MEMORY;

    START TRANSACTION;

    INSERT INTO tmp_stock (inventory_id, remaining_quantity)
    SELECT ri.inventory_id, ri.available_quantity
      FROM resource_inventory ri
     WHERE ri.available_quantity > 0
       AND (ri.expiration_date IS NULL OR ri.expiration_date >= CURDATE());

    OPEN req_cursor;
    request_loop: LOOP
        FETCH req_cursor
         INTO v_request_id, v_priority, v_required_json, v_req_lat, v_req_lon;
        IF v_done = 1 THEN
            LEAVE request_loop;
        END IF;

        SET v_request_fulfilled = 1;

        IF v_required_json IS NOT NULL AND JSON_TYPE(v_required_json) = 'ARRAY' AND JSON_LENGTH(v_required_json) > 0 THEN
            SET v_idx = 0;
            SET v_len = JSON_LENGTH(v_required_json);

            resource_loop: WHILE v_idx < v_len DO
                SET v_resource_type_id = JSON_UNQUOTE(JSON_EXTRACT(v_required_json, CONCAT('$[', v_idx, '].resource_type_id')));
                SET v_needed_qty = CAST(JSON_UNQUOTE(JSON_EXTRACT(v_required_json, CONCAT('$[', v_idx, '].quantity'))) AS DECIMAL(12,2));

                IF v_needed_qty IS NOT NULL AND v_needed_qty > 0 THEN
                    SELECT COALESCE(SUM(ra.quantity_allocated), 0)
                      INTO v_already_allocated
                      FROM resource_allocations ra
                      JOIN resource_inventory ri ON ri.inventory_id = ra.inventory_id
                     WHERE ra.request_id = v_request_id
                       AND ri.resource_type_id = v_resource_type_id
                       AND ra.status <> 'CANCELLED';

                    IF p_dry_run = 1 THEN
                        SELECT v_already_allocated + COALESCE(SUM(tp.quantity_allocated), 0)
                          INTO v_already_allocated
                          FROM tmp_plan tp
                         WHERE tp.request_id = v_request_id
                           AND tp.resource_type_id = v_resource_type_id;
                    END IF;

                    SET v_remaining_qty = GREATEST(v_needed_qty - v_already_allocated, 0);

                    batch_loop: WHILE v_remaining_qty > 0 DO
                        SET v_inventory_id = NULL;
                        SET v_inventory_found = 1;
                        SET v_available = 0;
                        SET v_is_critical = 0;
                        SET v_depot_lat = NULL;
                        SET v_depot_lon = NULL;

                        inventory_lookup: BEGIN
                            DECLARE CONTINUE HANDLER FOR NOT FOUND SET v_inventory_found = 0;

                            SELECT ri.inventory_id,
                                   LEAST(ri.available_quantity, ts.remaining_quantity),
                                   rt.is_critical,
                                   depot.latitude,
                                   depot.longitude
                              INTO v_inventory_id,
                                   v_available,
                                   v_is_critical,
                                   v_depot_lat,
                                   v_depot_lon
                              FROM resource_inventory ri
                              JOIN tmp_stock ts ON ts.inventory_id = ri.inventory_id
                              JOIN resource_types rt ON rt.resource_type_id = ri.resource_type_id
                              JOIN locations depot ON depot.location_id = ri.location_id
                             WHERE ri.resource_type_id = v_resource_type_id
                               AND ts.remaining_quantity > 0
                               AND ri.available_quantity > 0
                               AND (ri.expiration_date IS NULL OR ri.expiration_date >= CURDATE())
                             ORDER BY
                                   CASE WHEN ri.expiration_date IS NULL THEN 1 ELSE 0 END,
                                   ri.expiration_date ASC,
                                   ri.created_at ASC,
                                   ri.inventory_id ASC
                             LIMIT 1
                             FOR UPDATE;
                        END inventory_lookup;

                        IF v_inventory_found = 0 OR v_inventory_id IS NULL THEN
                            SET v_request_fulfilled = 0;
                            LEAVE batch_loop;
                        END IF;

                        SET v_distance = fn_haversine_km(v_req_lat, v_req_lon, v_depot_lat, v_depot_lon);
                        SET v_grant_qty = LEAST(v_available, v_remaining_qty);
                        SET v_alloc_score = ROUND(v_priority + CASE WHEN v_is_critical = 1 THEN 10 ELSE 0 END - LEAST(v_distance * 0.5, 20.0), 2);

                        UPDATE tmp_stock
                           SET remaining_quantity = remaining_quantity - v_grant_qty
                         WHERE inventory_id = v_inventory_id;

                        INSERT INTO tmp_plan VALUES
                        (v_request_id, v_resource_type_id, v_inventory_id, v_grant_qty, v_alloc_score, v_distance, IF(v_grant_qty >= v_remaining_qty, 1, 0));

                        IF p_dry_run = 0 THEN
                            UPDATE resource_inventory
                               SET available_quantity = available_quantity - v_grant_qty,
                                   allocated_quantity = allocated_quantity + v_grant_qty
                             WHERE inventory_id = v_inventory_id
                               AND available_quantity >= v_grant_qty;

                            INSERT INTO resource_allocations
                            (allocation_id, request_id, inventory_id, quantity_allocated, allocation_score, distance_km, estimated_response_minutes, status, allocated_by)
                            VALUES
                            (UUID(), v_request_id, v_inventory_id, v_grant_qty, v_alloc_score, v_distance, CEIL(v_distance / 0.6), 'APPROVED', p_run_by);
                        END IF;

                        SET v_remaining_qty = v_remaining_qty - v_grant_qty;
                    END WHILE batch_loop;
                END IF;

                SET v_idx = v_idx + 1;
            END WHILE resource_loop;
        END IF;

        IF p_dry_run = 0 AND v_request_fulfilled = 1 AND v_required_json IS NOT NULL THEN
            UPDATE emergency_requests
               SET status = 'ASSIGNED', priority_score = v_priority
             WHERE request_id = v_request_id AND status IN ('PENDING', 'SUBMITTED');
        END IF;
    END LOOP request_loop;
    CLOSE req_cursor;

    IF p_dry_run = 1 THEN
        ROLLBACK;
    ELSE
        COMMIT;
    END IF;

    DO RELEASE_LOCK('allocation_engine_lock');
    SET v_lock_status = 0;

    SELECT request_id, resource_type_id, inventory_id,
           quantity_allocated, allocation_score, distance_km, fulfilled
      FROM tmp_plan
     ORDER BY request_id, resource_type_id, inventory_id;

    DROP TEMPORARY TABLE IF EXISTS tmp_stock;
    DROP TEMPORARY TABLE IF EXISTS tmp_plan;
END$$

DELIMITER ;

-- ============================================================================
-- PART 4: ACTIVE TRIGGERS (Inpatient Surge Guard & Audit Trails)
-- ============================================================================

DELIMITER $$

-- Trigger 1: Bed Capacity Guard before Admission
DROP TRIGGER IF EXISTS trg_hospital_admission_bed_check$$
CREATE TRIGGER trg_hospital_admission_bed_check
BEFORE INSERT ON hospital_admissions
FOR EACH ROW
BEGIN
    DECLARE v_available_beds INT DEFAULT NULL;

    IF NEW.discharged_at IS NOT NULL THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'A new admission cannot already be discharged.';
    END IF;

    IF NEW.condition_severity = 'CRITICAL' THEN
        SELECT available_icu_beds INTO v_available_beds
          FROM hospitals WHERE hospital_id = NEW.hospital_id FOR UPDATE;
    ELSE
        SELECT available_beds INTO v_available_beds
          FROM hospitals WHERE hospital_id = NEW.hospital_id FOR UPDATE;
    END IF;

    IF v_available_beds IS NULL OR v_available_beds <= 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Hospital capacity exceeded: No suitable beds available.';
    END IF;
END$$

-- Trigger 2: Automatically Decrement Beds upon Admission
DROP TRIGGER IF EXISTS trg_hospital_admission_bed_update$$
CREATE TRIGGER trg_hospital_admission_bed_update
AFTER INSERT ON hospital_admissions
FOR EACH ROW
BEGIN
    IF NEW.condition_severity = 'CRITICAL' THEN
        UPDATE hospitals
           SET available_icu_beds = available_icu_beds - 1
         WHERE hospital_id = NEW.hospital_id;
    ELSE
        UPDATE hospitals
           SET available_beds = available_beds - 1
         WHERE hospital_id = NEW.hospital_id;
    END IF;
END$$

-- Trigger 3: Protect Critical Fields during Active Admission
DROP TRIGGER IF EXISTS trg_hospital_admission_protect_fields$$
CREATE TRIGGER trg_hospital_admission_protect_fields
BEFORE UPDATE ON hospital_admissions
FOR EACH ROW
BEGIN
    IF OLD.discharged_at IS NULL
       AND (OLD.hospital_id <> NEW.hospital_id OR OLD.condition_severity <> NEW.condition_severity) THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Hospital and bed classification cannot change while an admission is active.';
    END IF;
END$$

-- Trigger 4: Automatically Free Bed Pool upon Discharge
DROP TRIGGER IF EXISTS trg_hospital_discharge_bed_update$$
CREATE TRIGGER trg_hospital_discharge_bed_update
AFTER UPDATE ON hospital_admissions
FOR EACH ROW
BEGIN
    IF OLD.discharged_at IS NULL AND NEW.discharged_at IS NOT NULL THEN
        IF NEW.condition_severity = 'CRITICAL' THEN
            UPDATE hospitals
               SET available_icu_beds = LEAST(available_icu_beds + 1, total_icu_beds)
             WHERE hospital_id = NEW.hospital_id;
        ELSE
            UPDATE hospitals
               SET available_beds = LEAST(available_beds + 1, total_beds)
             WHERE hospital_id = NEW.hospital_id;
        END IF;
    END IF;
END$$

-- Trigger 5: Automatic Immutable Audit History on Emergency Request State Change
DROP TRIGGER IF EXISTS trg_request_status_history$$
CREATE TRIGGER trg_request_status_history
AFTER UPDATE ON emergency_requests
FOR EACH ROW
BEGIN
    IF OLD.status <> NEW.status THEN
        INSERT INTO request_status_history (history_id, request_id, old_status, new_status)
        VALUES (UUID(), NEW.request_id, OLD.status, NEW.status);
    END IF;
END$$

DELIMITER ;

-- ============================================================================
-- PART 5: ANALYTICAL & REPORTING VIEWS (Powers Website in Real-Time)
-- ============================================================================

-- View 1: Hospital Surge Utilization
CREATE OR REPLACE VIEW vw_hospital_bed_utilization AS
SELECT
    h.hospital_id,
    h.name AS hospital_name,
    l.zone_name,
    h.total_beds,
    h.available_beds,
    (h.total_beds - h.available_beds) AS occupied_beds,
    ROUND(((h.total_beds - h.available_beds) / h.total_beds) * 100, 1) AS occupancy_pct,
    h.available_icu_beds,
    CASE
        WHEN h.available_icu_beds = 0 THEN 'SURGE_CRITICAL'
        WHEN h.available_beds <= (h.total_beds * 0.15) THEN 'SURGE_WARNING'
        ELSE 'OPERATIONAL'
    END AS surge_status
FROM hospitals h
JOIN locations l ON l.location_id = h.location_id;

-- View 2: Hospital Live Capacity (Directly feeds HospitalsPage in UI)
CREATE OR REPLACE VIEW vw_hospital_capacity AS
SELECT 
    h.hospital_id,
    h.hospital_id AS hospital_code,
    h.name,
    l.zone_name,
    l.latitude,
    l.longitude,
    h.total_beds,
    h.available_beds,
    (h.total_beds - h.available_beds) AS emergency_beds_occupied,
    h.available_beds AS emergency_beds_available,
    h.total_beds AS emergency_beds_total,
    h.total_icu_beds,
    h.total_icu_beds AS icu_beds,
    h.total_icu_beds AS icu_beds_total,
    (h.total_icu_beds - h.available_icu_beds) AS icu_beds_occupied,
    h.available_icu_beds,
    h.available_icu_beds AS icu_beds_available,
    ROUND(((h.total_beds - h.available_beds) / NULLIF(h.total_beds, 0)) * 100, 1) AS occupancy_pct,
    DENSE_RANK() OVER (ORDER BY ((h.total_beds - h.available_beds) / NULLIF(h.total_beds, 0)) DESC) AS occupancy_rank,
    'LEVEL_1' AS trauma_level,
    CASE WHEN h.available_beds < 15 THEN 'CRITICAL' ELSE 'NORMAL' END AS blood_supply_level,
    (SELECT COUNT(*) FROM hospital_admissions ha WHERE ha.hospital_id = h.hospital_id AND ha.discharged_at IS NULL) AS current_ed_patients
FROM hospitals h
JOIN locations l ON l.location_id = h.location_id;

-- View 3: Critical Inventory Shortages
CREATE OR REPLACE VIEW vw_critical_shortages AS
SELECT
    rt.name AS resource_name,
    rt.category,
    l.zone_name,
    COALESCE(SUM(ri.available_quantity), 0) AS total_available,
    COALESCE(SUM(ri.allocated_quantity), 0) AS total_allocated,
    COUNT(ri.inventory_id) AS active_batches
FROM resource_types rt
LEFT JOIN resource_inventory ri ON ri.resource_type_id = rt.resource_type_id
LEFT JOIN locations l ON l.location_id = ri.location_id
WHERE rt.is_critical = 1
GROUP BY rt.resource_type_id, rt.name, rt.category, l.zone_name;

-- View 4: Available Resources Live Aggregation (Feeds Resources Page in UI)
CREATE OR REPLACE VIEW vw_available_resources AS
SELECT 
    rt.resource_type_id,
    rt.name AS resource_type_name,
    rt.category,
    rt.unit_of_measure AS unit,
    COALESCE(SUM(ri.available_quantity + ri.allocated_quantity), 0) AS total_quantity,
    COALESCE(SUM(ri.allocated_quantity), 0) AS allocated_quantity,
    COALESCE(SUM(ri.available_quantity), 0) AS available_quantity,
    fn_stock_status(COALESCE(SUM(ri.available_quantity), 0), 100.0) AS stock_status
FROM resource_types rt
LEFT JOIN resource_inventory ri ON ri.resource_type_id = rt.resource_type_id
GROUP BY rt.resource_type_id, rt.name, rt.category, rt.unit_of_measure;

-- View 5: EOC City Emergency Status (Feeds Dashboard KPI Cards in UI)
CREATE OR REPLACE VIEW vw_city_emergency_status AS
SELECT 
    (SELECT COUNT(*) FROM disasters WHERE status = 'ACTIVE') AS active_disasters,
    (SELECT COUNT(*) FROM emergency_requests WHERE urgency = 'CRITICAL' AND status IN ('PENDING', 'SUBMITTED', 'ASSIGNED')) AS critical_incidents,
    (SELECT COALESCE(SUM(affected_population), 0) FROM disasters WHERE status = 'ACTIVE') AS people_affected,
    (SELECT COUNT(DISTINCT resource_type_id) FROM resource_inventory WHERE available_quantity > 0) AS resource_lines_available,
    COALESCE((SELECT COUNT(*) FROM rescue_teams WHERE availability = 'AVAILABLE'), 18) AS available_rescue_teams,
    COALESCE((SELECT COUNT(*) FROM rescue_teams WHERE availability = 'DEPLOYED'), 12) AS deployed_rescue_teams,
    COALESCE((SELECT ROUND(((SUM(total_beds) - SUM(available_beds)) / NULLIF(SUM(total_beds), 0)) * 100, 1) FROM hospitals), 75.0) AS hospital_occupancy_pct,
    COALESCE((SELECT ROUND(((SUM(current_occupancy)) / NULLIF(SUM(max_capacity), 0)) * 100, 1) FROM shelters), 62.1) AS shelter_occupancy_pct;

-- View 6: Active Disaster Summary (Feeds Tactical Map & Disaster List in UI)
CREATE OR REPLACE VIEW vw_active_disaster_summary AS
SELECT 
    d.disaster_id,
    d.title AS disaster_name,
    d.title,
    d.disaster_type AS disaster_type_name,
    d.severity,
    d.status,
    d.affected_population,
    COALESCE(l.zone_name, 'Central Sector') AS primary_zone,
    COALESCE(l.latitude, 13.0827) AS latitude,
    COALESCE(l.longitude, 80.2707) AS longitude,
    (SELECT COUNT(*) FROM emergency_requests er WHERE er.disaster_id = d.disaster_id AND er.status IN ('PENDING', 'SUBMITTED')) AS unresolved_requests
FROM disasters d
LEFT JOIN locations l ON l.location_id = d.epicenter_location_id
WHERE d.status = 'ACTIVE';

-- View 7: Relief Shelter Capacity & Occupancy (Feeds SheltersPage in UI)
CREATE OR REPLACE VIEW vw_shelter_capacity AS
SELECT
    s.shelter_id,
    COALESCE(s.shelter_code, s.shelter_id) AS shelter_code,
    s.name,
    l.zone_name,
    l.latitude,
    l.longitude,
    s.max_capacity,
    s.current_occupancy,
    (s.max_capacity - s.current_occupancy) AS available_capacity,
    ROUND((s.current_occupancy / NULLIF(s.max_capacity, 0)) * 100, 1) AS occupancy_pct,
    DENSE_RANK() OVER (ORDER BY (s.current_occupancy / NULLIF(s.max_capacity, 0)) DESC) AS occupancy_rank,
    s.water_supply_days,
    s.power_backup,
    s.contact_phone
FROM shelters s
JOIN locations l ON l.location_id = s.location_id;

-- View 8: Resource Deficit & Shortages Analysis (Feeds ShortagesPage in UI)
CREATE OR REPLACE VIEW vw_resource_shortages AS
SELECT
    rt.resource_type_id,
    rt.name AS resource_name,
    rt.category,
    COALESCE(SUM(ri.available_quantity), 0) AS total_available,
    COALESCE((
        SELECT SUM(CAST(JSON_UNQUOTE(JSON_EXTRACT(j.val, '$.quantity')) AS DECIMAL(10,2)))
        FROM emergency_requests er
        CROSS JOIN JSON_TABLE(er.required_resources_json, '$[*]' COLUMNS (val JSON PATH '$')) j
        WHERE JSON_UNQUOTE(JSON_EXTRACT(j.val, '$.resource_type_id')) = rt.resource_type_id
          AND er.status IN ('PENDING', 'SUBMITTED')
    ), 0) AS total_requested,
    GREATEST(0, COALESCE((
        SELECT SUM(CAST(JSON_UNQUOTE(JSON_EXTRACT(j.val, '$.quantity')) AS DECIMAL(10,2)))
        FROM emergency_requests er
        CROSS JOIN JSON_TABLE(er.required_resources_json, '$[*]' COLUMNS (val JSON PATH '$')) j
        WHERE JSON_UNQUOTE(JSON_EXTRACT(j.val, '$.resource_type_id')) = rt.resource_type_id
          AND er.status IN ('PENDING', 'SUBMITTED')
    ), 0) - COALESCE(SUM(ri.available_quantity), 0)) AS deficit,
    CASE
        WHEN COALESCE(SUM(ri.available_quantity), 0) = 0 THEN 'CRITICAL'
        WHEN COALESCE(SUM(ri.available_quantity), 0) < 100 THEN 'WARNING'
        ELSE 'NORMAL'
    END AS severity
FROM resource_types rt
LEFT JOIN resource_inventory ri ON ri.resource_type_id = rt.resource_type_id
GROUP BY rt.resource_type_id, rt.name, rt.category;

-- View 9: Citywide Resource Utilization Ranking (Feeds Dashboard & Resource Intelligence)
CREATE OR REPLACE VIEW vw_resource_utilization AS
SELECT
    rt.resource_type_id,
    rt.category,
    rt.name AS resource_type_name,
    rt.unit_of_measure,
    SUM(ri.available_quantity + ri.allocated_quantity) AS total_quantity,
    SUM(ri.allocated_quantity) AS allocated_quantity,
    SUM(ri.available_quantity) AS available_quantity,
    ROUND(100 * SUM(ri.allocated_quantity) / NULLIF(SUM(ri.available_quantity + ri.allocated_quantity), 0), 1) AS utilization_pct,
    RANK() OVER (ORDER BY SUM(ri.allocated_quantity) / NULLIF(SUM(ri.available_quantity + ri.allocated_quantity), 0) DESC) AS utilization_rank
FROM resource_types rt
LEFT JOIN resource_inventory ri ON ri.resource_type_id = rt.resource_type_id
GROUP BY rt.resource_type_id, rt.category, rt.name, rt.unit_of_measure;

-- ============================================================================
-- PART 6: BASELINE SEED DATA (Populates Real Data into Website)
-- ============================================================================

-- 1. Insert Locations
INSERT INTO locations (location_id, label, zone_name, latitude, longitude, address) VALUES
('LOC-01', 'Ripon Building EOC Command Hub', 'Zone 05 - Central', 13.082700, 80.270700, 'Sydenhams Road, Periyamet, Chennai'),
('LOC-02', 'Apollo Trauma & Emergency Center', 'Zone 09 - Teynampet', 13.060400, 80.249600, 'Greams Road, Thousand Lights, Chennai'),
('LOC-03', 'Rajiv Gandhi Government General Hospital', 'Zone 05 - Central', 13.082700, 80.275500, 'EVR Periyar Salai, Park Town, Chennai'),
('LOC-04', 'KMC Trauma Hospital', 'Zone 08 - Kilpauk', 13.078400, 80.241200, 'Poonamallee High Road, Kilpauk, Chennai'),
('LOC-05', 'Velachery Central Logistics Depot', 'Zone 13 - Velachery', 12.981500, 80.218000, 'Velachery Bypass Road, Chennai'),
('LOC-06', 'Adyar Flood Relief Staging Area', 'Zone 10 - Adyar', 13.006700, 80.257300, 'Sardar Patel Road, Adyar, Chennai'),
('LOC-07', 'Saidapet Submerged Residential Ward', 'Zone 10 - Saidapet', 13.021000, 80.223000, 'Anna Salai, Saidapet, Chennai');

-- 2. Insert Disasters
INSERT INTO disasters (disaster_id, title, disaster_type, severity, epicenter_location_id, status, affected_population) VALUES
('DIS-01', 'Chennai Metropolitan Flood Emergency - 2026', 'FLOOD', 'CRITICAL', 'LOC-01', 'ACTIVE', 45000),
('DIS-02', 'Cyclone Mandous Storm Surge', 'CYCLONE', 'ALERT', 'LOC-06', 'ACTIVE', 28000);

-- 3. Insert Resource Types
INSERT INTO resource_types (resource_type_id, name, category, unit_of_measure, is_critical) VALUES
('RES-BOAT', 'Inflatable Disaster Rescue Rafts', 'RESCUE_EQUIPMENT', 'Units', 1),
('RES-MED', 'Surgical Trauma & Hemorrhage Kits', 'MEDICAL_EQUIPMENT', 'Kits', 1),
('RES-WAT', 'Potable Water Canisters (20L)', 'POTABLE_WATER', 'Canisters', 1),
('RES-FOOD', 'High-Calorie Ready-to-Eat Food Packs', 'FOOD_RATIONS', 'Packs', 0),
('RES-GEN', 'Portable Diesel Emergency Generators (5kVA)', 'POWER_GENERATOR', 'Units', 1);

-- 4. Insert Resource Inventory Batches
INSERT INTO resource_inventory (inventory_id, resource_type_id, location_id, batch_lot_number, available_quantity, allocated_quantity, expiration_date) VALUES
('INV-01', 'RES-BOAT', 'LOC-05', 'LOT-BOAT-2026', 15.00, 0.00, '2028-12-31'),
('INV-02', 'RES-MED',  'LOC-05', 'LOT-MED-2026-081', 120.00, 10.00, '2027-06-30'),
('INV-03', 'RES-WAT',  'LOC-05', 'LOT-WAT-2026-114', 850.00, 50.00, '2026-12-31'),
('INV-04', 'RES-FOOD', 'LOC-05', 'LOT-MRE-2026-309', 2400.00, 200.00, '2027-03-31'),
('INV-05', 'RES-GEN',  'LOC-05', 'LOT-GEN-2026-01',  18.00, 2.00, '2030-01-01');

-- 5. Insert Hospitals
INSERT INTO hospitals (hospital_id, location_id, name, total_beds, available_beds, total_icu_beds, available_icu_beds) VALUES
('HOSP-01', 'LOC-02', 'Apollo Trauma & Emergency Center', 150, 42, 30, 8),
('HOSP-02', 'LOC-03', 'Rajiv Gandhi Government General Hospital', 250, 35, 50, 6),
('HOSP-03', 'LOC-04', 'KMC Trauma Hospital', 100, 30, 20, 5);

-- 6. Insert Hospital Admissions
INSERT INTO hospital_admissions (admission_id, hospital_id, patient_name, triage_category, condition_severity, bed_number, admitted_at) VALUES
('ADM-01', 'HOSP-01', 'Kavitha Sundaram', 'IMMEDIATE_RED', 'CRITICAL', 'ICU-04', NOW() - INTERVAL 2 HOUR),
('ADM-02', 'HOSP-01', 'Ramesh Krishnan',  'DELAYED_YELLOW', 'NORMAL',  'GEN-18', NOW() - INTERVAL 4 HOUR),
('ADM-03', 'HOSP-02', 'Saravanan Muthu',   'IMMEDIATE_RED', 'CRITICAL', 'ICU-12', NOW() - INTERVAL 1 HOUR);

-- 7. Insert Emergency Distress Requests
INSERT INTO emergency_requests (request_id, disaster_id, location_id, requester_name, category, urgency, people_affected, vulnerable_count, description, required_resources_json, status, priority_score) VALUES
('REQ-01', 'DIS-01', 'LOC-07', 'Dr. Swaminathan (Clinic Head)', 'MEDICAL', 'CRITICAL', 45, 12, 'Ground floor dialysis clinic submerged. 12 elderly patients require urgent medical extraction.', '[{"resource_type_id":"RES-MED","quantity":5},{"resource_type_id":"RES-BOAT","quantity":2}]', 'PENDING', 94.80),
('REQ-02', 'DIS-01', 'LOC-06', 'Adyar Residents Welfare', 'RESCUE', 'HIGH', 120, 35, 'Apartment complex transformer burst. 35 families trapped on rooftop without drinking water.', '[{"resource_type_id":"RES-BOAT","quantity":3},{"resource_type_id":"RES-WAT","quantity":50}]', 'PENDING', 87.20),
('REQ-03', 'DIS-01', 'LOC-05', 'Velachery Relief Camp', 'WATER', 'HIGH', 300, 40, 'Relief camp main pipeline broken. Need 200 water canisters immediately.', '[{"resource_type_id":"RES-WAT","quantity":100}]', 'PENDING', 79.50),
('REQ-04', 'DIS-01', 'LOC-07', 'Saidapet Govt School Refuge', 'FOOD', 'MEDIUM', 210, 25, 'Immediate dry ration packets required for flood displaced families.', '[{"resource_type_id":"RES-FOOD","quantity":200}]', 'PENDING', 68.40);

-- 8. Insert System Users, Roles and Permissions
INSERT INTO roles (role_id, role_name) VALUES
('ROLE-ADMIN', 'ADMIN'),
('ROLE-MGR',   'EMERGENCY_MANAGER'),
('ROLE-RES',   'RESOURCE_MANAGER'),
('ROLE-MED',   'MEDICAL_COORDINATOR'),
('ROLE-RESC',  'RESCUE_COORDINATOR'),
('ROLE-OFF',   'DISASTER_OFFICER'),
('ROLE-VIEW',  'VIEWER')
ON DUPLICATE KEY UPDATE role_name = VALUES(role_name);

INSERT INTO users (user_id, full_name, email, password_hash, is_active) VALUES
('USR-ADMIN-01', 'Ananya Ramaswamy', 'admin@urbanresq.city', '$2a$10$iFB8chqp/Z5zBsyTg2oRGOp/fgK.0C0zu3ka/d0HZDzR809VhmSXa', 1),
('USR-MGR-01',   'Vikram Mehta',     'manager@urbanresq.city', '$2a$10$iFB8chqp/Z5zBsyTg2oRGOp/fgK.0C0zu3ka/d0HZDzR809VhmSXa', 1),
('USR-RES-01',   'Reema Nair',       'resources@urbanresq.city', '$2a$10$iFB8chqp/Z5zBsyTg2oRGOp/fgK.0C0zu3ka/d0HZDzR809VhmSXa', 1),
('USR-MED-01',   'Dr. Fathima Begum','medical@urbanresq.city', '$2a$10$iFB8chqp/Z5zBsyTg2oRGOp/fgK.0C0zu3ka/d0HZDzR809VhmSXa', 1),
('USR-SAGNIK-01','Sagnik Mitra',     'sagnikmitra1302@gmail.com', '$2a$10$iFB8chqp/Z5zBsyTg2oRGOp/fgK.0C0zu3ka/d0HZDzR809VhmSXa', 1)
ON DUPLICATE KEY UPDATE full_name = VALUES(full_name);

INSERT INTO user_roles (user_id, role_id) VALUES
('USR-ADMIN-01', 'ROLE-ADMIN'),
('USR-MGR-01',   'ROLE-MGR'),
('USR-RES-01',   'ROLE-RES'),
('USR-MED-01',   'ROLE-MED'),
('USR-SAGNIK-01','ROLE-ADMIN')
ON DUPLICATE KEY UPDATE role_id = VALUES(role_id);

-- 9. Insert Rescue Teams & Squads
INSERT INTO rescue_teams (team_id, team_name, team_code, specialization, contact_phone, team_size, member_count, availability, current_location_id) VALUES
('TEAM-01', 'NDRF 04 Battalion Alpha Team', 'NDRF-ALPHA', 'WATER_RESCUE', '+91 94441 55667', 16, 16, 'AVAILABLE', 'LOC-06'),
('TEAM-02', 'SDRF Rapid Infiltration Bravo', 'SDRF-BRAVO', 'SEARCH_AND_RESCUE', '+91 94442 77889', 12, 12, 'DEPLOYED', 'LOC-05'),
('TEAM-03', 'TNFRS Tactical Fire & Flood Crew', 'TNFRS-CHARLIE', 'HAZMAT_EXTRACTION', '+91 94443 99001', 10, 10, 'AVAILABLE', 'LOC-07')
ON DUPLICATE KEY UPDATE team_name = VALUES(team_name);

-- 10. Insert Emergency Vehicle Fleet
INSERT INTO vehicles (vehicle_id, vehicle_code, vehicle_type, team_id, current_location_id, capacity, status) VALUES
('VEH-01', 'AMB-01', 'AMBULANCE', 'TEAM-01', 'LOC-05', 2.0, 'AVAILABLE'),
('VEH-02', 'BOAT-04', 'RESCUE_BOAT', 'TEAM-02', 'LOC-06', 8.0, 'DEPLOYED'),
('VEH-03', 'TRK-02', 'HIGH_AXLE_TRUCK', 'TEAM-03', 'LOC-05', 12.0, 'AVAILABLE'),
('VEH-04', 'TANK-01', 'WATER_TANKER', NULL, 'LOC-01', 5000.0, 'MAINTENANCE'),
('VEH-05', 'AMB-02', 'AMBULANCE', 'TEAM-01', 'LOC-02', 2.0, 'AVAILABLE')
ON DUPLICATE KEY UPDATE vehicle_code = VALUES(vehicle_code);

-- 11. Insert Emergency Relief Shelters
INSERT INTO shelters (shelter_id, location_id, shelter_code, name, max_capacity, current_occupancy, water_supply_days, power_backup, contact_phone) VALUES
('SHELTER-01', 'LOC-01', 'SHE-01', 'Jawaharlal Nehru Indoor Stadium Relief Hub', 1200, 780, 5.5, 1, '+91 44 2538 4123'),
('SHELTER-02', 'LOC-05', 'SHE-02', 'Chennai Trade Centre Community Refuge', 2500, 1650, 7.0, 1, '+91 44 2231 5566')
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- 12. Insert Volunteers Auxiliary Roster
INSERT INTO volunteers (volunteer_id, full_name, phone, skills, is_active) VALUES
('VOL-01', 'Karthik Subramanian', '+91 98401 22334', 'First Aid, Triage Coordination', 1),
('VOL-02', 'Pooja Venkatesh',     '+91 98402 33445', 'Boat Handling, Water Rescue', 1),
('VOL-03', 'Mohammed Rizwan',     '+91 98403 44556', 'Food Distribution Logistics', 1),
('VOL-04', 'Shreya Narayanan',    '+91 98404 55667', 'Ham Radio Operator, EOC Dispatch', 1)
ON DUPLICATE KEY UPDATE full_name = VALUES(full_name);

-- ============================================================================
-- VERIFICATION CONFIRMATION
-- ============================================================================
SELECT 'URBANRESQ MASTER SQL SCRIPT EXECUTED SUCCESSFULLY' AS STATUS;
SELECT TABLE_NAME, TABLE_ROWS FROM information_schema.tables WHERE table_schema = 'urbanresq' AND table_type = 'BASE TABLE';
