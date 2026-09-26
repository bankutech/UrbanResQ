-- =====================================================================
-- URBANRESQ — Intelligent Urban Disaster Resource Allocation Platform
-- schema.sql — Core relational schema (MySQL 8.0+)
-- =====================================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

DROP DATABASE IF EXISTS urbanresq;
CREATE DATABASE urbanresq CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
USE urbanresq;

-- ---------------------------------------------------------------------
-- 0. LOOKUP TABLES (New for Enums)
-- ---------------------------------------------------------------------

CREATE TABLE severity_levels (
    severity   VARCHAR(50) PRIMARY KEY,
    description VARCHAR(255),
    created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE status_types (
    status      VARCHAR(50) PRIMARY KEY,
    description VARCHAR(255),
    created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE urgency_levels (
    urgency     VARCHAR(50) PRIMARY KEY,
    description VARCHAR(255),
    created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 1. IDENTITY & ACCESS
-- ---------------------------------------------------------------------

CREATE TABLE roles (
    role_id         VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    role_name       VARCHAR(50) NOT NULL UNIQUE,     -- ADMIN, EMERGENCY_MANAGER, ...
    description     VARCHAR(255),
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE permissions (
    permission_id   VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    permission_key  VARCHAR(100) NOT NULL UNIQUE,    -- e.g. 'allocation.create'
    description     VARCHAR(255)
) ENGINE=InnoDB;

CREATE TABLE role_permissions (
    role_id         VARCHAR(36) NOT NULL,
    permission_id   VARCHAR(36) NOT NULL,
    PRIMARY KEY (role_id, permission_id),
    FOREIGN KEY (role_id) REFERENCES roles(role_id) ON DELETE CASCADE,
    FOREIGN KEY (permission_id) REFERENCES permissions(permission_id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE users (
    user_id         VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    full_name       VARCHAR(120) NOT NULL,
    email           VARCHAR(160) NOT NULL UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,
    phone           VARCHAR(20),
    designation     VARCHAR(120),
    is_active       TINYINT(1) NOT NULL DEFAULT 1,
    last_login_at   DATETIME NULL,
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at      DATETIME NULL
) ENGINE=InnoDB;

CREATE TABLE user_roles (
    user_id         VARCHAR(36) NOT NULL,
    role_id         VARCHAR(36) NOT NULL,
    assigned_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(role_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 2. GEOGRAPHY
-- ---------------------------------------------------------------------

CREATE TABLE locations (
    location_id     VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    label           VARCHAR(150) NOT NULL,
    zone_name       VARCHAR(100),
    city            VARCHAR(100) NOT NULL DEFAULT 'Chennai',
    latitude        DECIMAL(9,6) NOT NULL,
    longitude       DECIMAL(9,6) NOT NULL,
    address         VARCHAR(255),
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at      DATETIME NULL,
    INDEX idx_location_coords (latitude, longitude)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 3. DISASTERS / ZONES / INCIDENTS
-- ---------------------------------------------------------------------

CREATE TABLE disaster_types (
    disaster_type   VARCHAR(50) PRIMARY KEY,
    description     VARCHAR(255),
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE disasters (
    disaster_id          VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    disaster_type        VARCHAR(50) NOT NULL,
    title                VARCHAR(180) NOT NULL,
    description          TEXT,
    severity             VARCHAR(50) NOT NULL DEFAULT 'MODERATE',
    status               VARCHAR(50) NOT NULL DEFAULT 'REPORTED',
    start_time           DATETIME NOT NULL,
    estimated_end_time   DATETIME NULL,
    affected_population  INT NOT NULL DEFAULT 0,
    estimated_damage      DECIMAL(15,2) DEFAULT 0,
    latitude             DECIMAL(9,6) NOT NULL,
    longitude            DECIMAL(9,6) NOT NULL,
    created_by           VARCHAR(36) NOT NULL,
    created_at           DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at           DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at           DATETIME NULL,
    FOREIGN KEY (created_by) REFERENCES users(user_id),
    FOREIGN KEY (disaster_type) REFERENCES disaster_types(disaster_type) ON UPDATE CASCADE,
    FOREIGN KEY (severity) REFERENCES severity_levels(severity),
    FOREIGN KEY (status) REFERENCES status_types(status),
    INDEX idx_disaster_status (status),
    INDEX idx_disaster_severity (severity),
    INDEX idx_disaster_status_severity (status, severity),
    FULLTEXT INDEX ftx_disaster_text (title, description)
) ENGINE=InnoDB;

CREATE TABLE disaster_metrics (
    metric_id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    disaster_id VARCHAR(36),
    metric_key VARCHAR(100),
    metric_value VARCHAR(255),
    created_at DATETIME,
    FOREIGN KEY (disaster_id) REFERENCES disasters(disaster_id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE disaster_zones (
    zone_id             VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    disaster_id         VARCHAR(36) NOT NULL,
    zone_code           VARCHAR(20) NOT NULL,        -- e.g. 'Z-04'
    zone_name           VARCHAR(120) NOT NULL,
    location_id         VARCHAR(36) NOT NULL,
    severity            VARCHAR(50) NOT NULL DEFAULT 'MODERATE',
    population_estimate INT NOT NULL DEFAULT 0,
    is_accessible        TINYINT(1) NOT NULL DEFAULT 1,
    created_at           DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at           DATETIME NULL,
    UNIQUE KEY uq_disaster_zone_code (disaster_id, zone_code),
    FOREIGN KEY (disaster_id) REFERENCES disasters(disaster_id) ON DELETE CASCADE,
    FOREIGN KEY (location_id) REFERENCES locations(location_id),
    FOREIGN KEY (severity) REFERENCES severity_levels(severity),
    INDEX idx_zone_severity (severity)
) ENGINE=InnoDB;

CREATE TABLE incidents (
    incident_id         VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    disaster_id         VARCHAR(36) NOT NULL,
    zone_id             VARCHAR(36) NULL,
    incident_type        VARCHAR(100) NOT NULL,
    description          TEXT,
    severity             VARCHAR(50) NOT NULL,
    status               VARCHAR(50) NOT NULL DEFAULT 'OPEN',
    location_id          VARCHAR(36) NOT NULL,
    reported_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    resolved_at          DATETIME NULL,
    deleted_at           DATETIME NULL,
    FOREIGN KEY (disaster_id) REFERENCES disasters(disaster_id) ON DELETE CASCADE,
    FOREIGN KEY (zone_id) REFERENCES disaster_zones(zone_id) ON DELETE SET NULL,
    FOREIGN KEY (location_id) REFERENCES locations(location_id),
    FOREIGN KEY (severity) REFERENCES severity_levels(severity),
    FOREIGN KEY (status) REFERENCES status_types(status),
    INDEX idx_incident_status (status),
    INDEX idx_incident_location (location_id)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 4. CITIZENS & EMERGENCY REQUESTS
-- ---------------------------------------------------------------------

CREATE TABLE citizens (
    citizen_id      VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    full_name       VARCHAR(120) NOT NULL,
    phone           VARCHAR(20),
    vulnerable_group ENUM('NONE','CHILD','ELDERLY','DISABLED','PREGNANT','MEDICAL_DEPENDENT') NOT NULL DEFAULT 'NONE',
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at      DATETIME NULL
) ENGINE=InnoDB;

CREATE TABLE emergency_requests (
    request_id          VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    disaster_id         VARCHAR(36) NOT NULL,
    zone_id             VARCHAR(36) NULL,
    location_id         VARCHAR(36) NOT NULL,
    requester_type       ENUM('CITIZEN','OFFICER','HOSPITAL','SHELTER','RESCUE_TEAM') NOT NULL,
    citizen_id           VARCHAR(36) NULL,
    requester_name        VARCHAR(120),
    requester_contact      VARCHAR(30),
    category             ENUM('MEDICAL','RESCUE','WATER','FOOD','SHELTER','EVACUATION',
                               'SUPPLIES','SECURITY','OTHER') NOT NULL,
    description           TEXT NOT NULL,
    people_affected        INT NOT NULL DEFAULT 1,
    vulnerable_count       INT NOT NULL DEFAULT 0,
    urgency               VARCHAR(50) NOT NULL DEFAULT 'MEDIUM',
    status                VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    priority_score        DECIMAL(6,2) NULL,
    required_resources_json JSON NULL,
    assigned_team_id       VARCHAR(36) NULL,
    image_url VARCHAR(512),
    ai_assessed BOOLEAN DEFAULT FALSE,
    ai_notes TEXT,
    created_at             DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at             DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    resolved_at             DATETIME NULL,
    deleted_at             DATETIME NULL,
    FOREIGN KEY (disaster_id) REFERENCES disasters(disaster_id) ON DELETE CASCADE,
    FOREIGN KEY (zone_id) REFERENCES disaster_zones(zone_id) ON DELETE SET NULL,
    FOREIGN KEY (location_id) REFERENCES locations(location_id),
    FOREIGN KEY (citizen_id) REFERENCES citizens(citizen_id) ON DELETE SET NULL,
    FOREIGN KEY (urgency) REFERENCES urgency_levels(urgency),
    FOREIGN KEY (status) REFERENCES status_types(status),
    CHECK (people_affected >= 0 AND vulnerable_count >= 0 AND vulnerable_count <= people_affected),
    INDEX idx_request_status (status),
    INDEX idx_request_urgency (urgency),
    INDEX idx_request_disaster_status (disaster_id, status),
    INDEX idx_request_priority (priority_score),
    INDEX idx_request_created (created_at),
    FULLTEXT INDEX ftx_request_desc (description)
) ENGINE=InnoDB;

CREATE TABLE request_status_history (
    history_id      VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    request_id      VARCHAR(36) NOT NULL,
    old_status      VARCHAR(50),
    new_status      VARCHAR(50) NOT NULL,
    changed_by      VARCHAR(36) NULL,
    changed_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    note            VARCHAR(255),
    FOREIGN KEY (request_id) REFERENCES emergency_requests(request_id) ON DELETE CASCADE,
    FOREIGN KEY (changed_by) REFERENCES users(user_id) ON DELETE SET NULL,
    FOREIGN KEY (old_status) REFERENCES status_types(status),
    FOREIGN KEY (new_status) REFERENCES status_types(status),
    INDEX idx_rsh_request (request_id)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 5. RESOURCES / INVENTORY / MOVEMENTS
-- ---------------------------------------------------------------------

CREATE TABLE resource_types (
    resource_type_id   VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    category            ENUM('MEDICAL','FOOD','WATER','RESCUE_EQUIPMENT','VEHICLE','FUEL',
                              'SHELTER_SUPPLIES','COMMUNICATION_EQUIPMENT','POWER_EQUIPMENT',
                              'PROTECTIVE_EQUIPMENT') NOT NULL,
    name                VARCHAR(120) NOT NULL,
    unit                VARCHAR(20) NOT NULL,
    is_critical          TINYINT(1) NOT NULL DEFAULT 0,
    default_min_threshold DECIMAL(12,2) NOT NULL DEFAULT 0,
    UNIQUE KEY uq_resource_type (category, name)
) ENGINE=InnoDB;

CREATE TABLE resources (
    resource_id         VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    resource_type_id    VARCHAR(36) NOT NULL,
    resource_code        VARCHAR(30) NOT NULL UNIQUE,
    name                 VARCHAR(150) NOT NULL,
    is_consumable         TINYINT(1) NOT NULL DEFAULT 1,
    created_at            DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at            DATETIME NULL,
    FOREIGN KEY (resource_type_id) REFERENCES resource_types(resource_type_id)
) ENGINE=InnoDB;

CREATE TABLE resource_inventory (
    inventory_id        VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    resource_id         VARCHAR(36) NOT NULL,
    location_id          VARCHAR(36) NOT NULL,
    total_quantity        DECIMAL(12,2) NOT NULL DEFAULT 0,
    available_quantity     DECIMAL(12,2) NOT NULL DEFAULT 0,
    allocated_quantity      DECIMAL(12,2) NOT NULL DEFAULT 0,
    damaged_quantity         DECIMAL(12,2) NOT NULL DEFAULT 0,
    min_threshold             DECIMAL(12,2) NOT NULL DEFAULT 0,
    condition_status           VARCHAR(50) NOT NULL DEFAULT 'GOOD',
    expiration_date              DATE NULL,
    updated_at                    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at                    DATETIME NULL,
    is_below_threshold TINYINT(1) GENERATED ALWAYS AS (available_quantity <= min_threshold) STORED,
    FOREIGN KEY (resource_id) REFERENCES resources(resource_id) ON DELETE CASCADE,
    FOREIGN KEY (location_id) REFERENCES locations(location_id),
    FOREIGN KEY (condition_status) REFERENCES status_types(status),
    CHECK (total_quantity >= 0 AND available_quantity >= 0 AND allocated_quantity >= 0 AND damaged_quantity >= 0),
    CHECK (available_quantity + allocated_quantity + damaged_quantity <= total_quantity + 0.001),
    UNIQUE KEY uq_resource_location (resource_id, location_id),
    INDEX idx_inventory_available (available_quantity),
    INDEX idx_inventory_below_threshold (is_below_threshold)
) ENGINE=InnoDB;

CREATE TABLE resource_movements (
    movement_id       VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    inventory_id      VARCHAR(36) NOT NULL,
    movement_type      ENUM('INBOUND','ALLOCATION','RETURN','DAMAGE','TRANSFER','ADJUSTMENT') NOT NULL,
    quantity            DECIMAL(12,2) NOT NULL,
    reference_type       VARCHAR(40),
    reference_id          VARCHAR(36) NULL,
    performed_by            VARCHAR(36) NULL,
    created_at               DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (inventory_id) REFERENCES resource_inventory(inventory_id) ON DELETE CASCADE,
    FOREIGN KEY (performed_by) REFERENCES users(user_id) ON DELETE SET NULL,
    INDEX idx_movement_inventory (inventory_id),
    INDEX idx_movement_created (created_at)
) ENGINE=InnoDB;

CREATE TABLE resource_shortages (
    shortage_id       VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    resource_type_id  VARCHAR(36) NOT NULL,
    location_id        VARCHAR(36) NULL,
    required_quantity   DECIMAL(12,2) NOT NULL,
    available_quantity   DECIMAL(12,2) NOT NULL,
    deficit               DECIMAL(12,2) GENERATED ALWAYS AS (GREATEST(required_quantity - available_quantity, 0)) STORED,
    severity              VARCHAR(50) NOT NULL DEFAULT 'WARNING',
    status                VARCHAR(50) NOT NULL DEFAULT 'OPEN',
    detected_at             DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    resolved_at              DATETIME NULL,
    deleted_at               DATETIME NULL,
    FOREIGN KEY (resource_type_id) REFERENCES resource_types(resource_type_id),
    FOREIGN KEY (location_id) REFERENCES locations(location_id),
    FOREIGN KEY (severity) REFERENCES severity_levels(severity),
    FOREIGN KEY (status) REFERENCES status_types(status),
    INDEX idx_shortage_status (status)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 6. ALLOCATIONS
-- ---------------------------------------------------------------------

CREATE TABLE resource_allocations (
    allocation_id       VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    request_id           VARCHAR(36) NOT NULL,
    resource_id           VARCHAR(36) NULL,
    inventory_id            VARCHAR(36) NULL,
    quantity_allocated        DECIMAL(12,2) NOT NULL DEFAULT 1,
    allocation_score            DECIMAL(6,2) NOT NULL,
    status                       VARCHAR(50) NOT NULL DEFAULT 'PROPOSED',
    distance_km                    DECIMAL(6,2) NULL,
    estimated_response_minutes      INT NULL,
    allocated_by                       VARCHAR(36) NULL,
    created_at                          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at                          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at                          DATETIME NULL,
    FOREIGN KEY (request_id) REFERENCES emergency_requests(request_id) ON DELETE CASCADE,
    FOREIGN KEY (resource_id) REFERENCES resources(resource_id) ON DELETE SET NULL,
    FOREIGN KEY (inventory_id) REFERENCES resource_inventory(inventory_id) ON DELETE SET NULL,
    FOREIGN KEY (allocated_by) REFERENCES users(user_id) ON DELETE SET NULL,
    FOREIGN KEY (status) REFERENCES status_types(status),
    CHECK (quantity_allocated > 0),
    INDEX idx_allocation_status (status),
    INDEX idx_allocation_request (request_id)
) ENGINE=InnoDB;

CREATE TABLE allocation_status_history (
    history_id      VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    allocation_id   VARCHAR(36) NOT NULL,
    old_status      VARCHAR(50),
    new_status      VARCHAR(50) NOT NULL,
    changed_by      VARCHAR(36) NULL,
    changed_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (allocation_id) REFERENCES resource_allocations(allocation_id) ON DELETE CASCADE,
    FOREIGN KEY (changed_by) REFERENCES users(user_id) ON DELETE SET NULL,
    FOREIGN KEY (old_status) REFERENCES status_types(status),
    FOREIGN KEY (new_status) REFERENCES status_types(status)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 7. RESCUE TEAMS / PERSONNEL / VEHICLES
-- ---------------------------------------------------------------------

CREATE TABLE personnel (
    personnel_id     VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    full_name        VARCHAR(120) NOT NULL,
    role             VARCHAR(80) NOT NULL,
    phone            VARCHAR(20),
    is_active         TINYINT(1) NOT NULL DEFAULT 1,
    created_at         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at         DATETIME NULL
) ENGINE=InnoDB;

CREATE TABLE rescue_teams (
    team_id             VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    team_code            VARCHAR(20) NOT NULL UNIQUE,
    team_name             VARCHAR(120) NOT NULL,
    specialization         ENUM('FIRE_RESCUE','MEDICAL','SEARCH_AND_RESCUE','FLOOD_RESCUE',
                                 'ENGINEERING','POLICE','EVACUATION') NOT NULL,
    member_count            INT NOT NULL DEFAULT 0,
    current_location_id       VARCHAR(36) NULL,
    availability                VARCHAR(50) NOT NULL DEFAULT 'AVAILABLE',
    avg_response_minutes          DECIMAL(5,1) NULL,
    equipment_json                  JSON NULL,
    created_at                        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at                        DATETIME NULL,
    FOREIGN KEY (current_location_id) REFERENCES locations(location_id) ON DELETE SET NULL,
    FOREIGN KEY (availability) REFERENCES status_types(status),
    INDEX idx_team_availability (availability),
    INDEX idx_team_specialization (specialization)
) ENGINE=InnoDB;

CREATE TABLE team_members (
    team_id         VARCHAR(36) NOT NULL,
    personnel_id    VARCHAR(36) NOT NULL,
    joined_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (team_id, personnel_id),
    FOREIGN KEY (team_id) REFERENCES rescue_teams(team_id) ON DELETE CASCADE,
    FOREIGN KEY (personnel_id) REFERENCES personnel(personnel_id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE vehicles (
    vehicle_id        VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    vehicle_code        VARCHAR(20) NOT NULL UNIQUE,
    vehicle_type          ENUM('AMBULANCE','FIRE_TRUCK','BOAT','TRUCK','POLICE_VAN','EVACUATION_BUS') NOT NULL,
    team_id                 VARCHAR(36) NULL,
    status                   VARCHAR(50) NOT NULL DEFAULT 'AVAILABLE',
    current_location_id       VARCHAR(36) NULL,
    capacity                    INT NULL,
    created_at                   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at                   DATETIME NULL,
    FOREIGN KEY (team_id) REFERENCES rescue_teams(team_id) ON DELETE SET NULL,
    FOREIGN KEY (current_location_id) REFERENCES locations(location_id) ON DELETE SET NULL,
    FOREIGN KEY (status) REFERENCES status_types(status),
    INDEX idx_vehicle_status (status),
    INDEX idx_vehicle_type (vehicle_type)
) ENGINE=InnoDB;

CREATE TABLE vehicle_deployments (
    deployment_id      VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    vehicle_id          VARCHAR(36) NOT NULL,
    request_id            VARCHAR(36) NULL,
    deployed_at             DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    returned_at               DATETIME NULL,
    destination_location_id    VARCHAR(36) NULL,
    deleted_at                 DATETIME NULL,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(vehicle_id) ON DELETE CASCADE,
    FOREIGN KEY (request_id) REFERENCES emergency_requests(request_id) ON DELETE SET NULL,
    FOREIGN KEY (destination_location_id) REFERENCES locations(location_id) ON DELETE SET NULL,
    INDEX idx_deployment_vehicle (vehicle_id)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 8. HOSPITALS
-- ---------------------------------------------------------------------

CREATE TABLE hospitals (
    hospital_id           VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    hospital_code          VARCHAR(20) NOT NULL UNIQUE,
    name                     VARCHAR(150) NOT NULL,
    location_id                VARCHAR(36) NOT NULL,
    emergency_contact            VARCHAR(30),
    total_beds                    INT NOT NULL DEFAULT 0,
    available_beds                   INT NOT NULL DEFAULT 0,
    icu_beds                          INT NOT NULL DEFAULT 0,
    available_icu_beds                  INT NOT NULL DEFAULT 0,
    emergency_capacity                    INT NOT NULL DEFAULT 0,
    current_ed_patients                     INT NOT NULL DEFAULT 0,
    blood_supply_level                        VARCHAR(50) NOT NULL DEFAULT 'ADEQUATE',
    medical_supply_level                        VARCHAR(50) NOT NULL DEFAULT 'ADEQUATE',
    created_at                                    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at                                    DATETIME NULL,
    FOREIGN KEY (location_id) REFERENCES locations(location_id),
    FOREIGN KEY (blood_supply_level) REFERENCES severity_levels(severity),
    FOREIGN KEY (medical_supply_level) REFERENCES severity_levels(severity),
    CHECK (available_beds >= 0 AND available_beds <= total_beds),
    CHECK (available_icu_beds >= 0 AND available_icu_beds <= icu_beds),
    INDEX idx_hospital_available_beds (available_beds)
) ENGINE=InnoDB;

CREATE TABLE hospital_beds (
    bed_id         VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    hospital_id    VARCHAR(36) NOT NULL,
    bed_type       ENUM('GENERAL','ICU','EMERGENCY') NOT NULL,
    bed_number     VARCHAR(20) NOT NULL,
    status         VARCHAR(50) NOT NULL DEFAULT 'AVAILABLE',
    FOREIGN KEY (hospital_id) REFERENCES hospitals(hospital_id) ON DELETE CASCADE,
    FOREIGN KEY (status) REFERENCES status_types(status),
    UNIQUE KEY uq_hospital_bed (hospital_id, bed_number)
) ENGINE=InnoDB;

CREATE TABLE hospital_admissions (
    admission_id      VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    hospital_id        VARCHAR(36) NOT NULL,
    request_id            VARCHAR(36) NULL,
    patient_name             VARCHAR(120),
    condition_severity        VARCHAR(50) NOT NULL DEFAULT 'STABLE',
    bed_id                       VARCHAR(36) NULL,
    admitted_at                    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    discharged_at                    DATETIME NULL,
    deleted_at                       DATETIME NULL,
    FOREIGN KEY (hospital_id) REFERENCES hospitals(hospital_id) ON DELETE CASCADE,
    FOREIGN KEY (request_id) REFERENCES emergency_requests(request_id) ON DELETE SET NULL,
    FOREIGN KEY (bed_id) REFERENCES hospital_beds(bed_id) ON DELETE SET NULL,
    FOREIGN KEY (condition_severity) REFERENCES severity_levels(severity),
    INDEX idx_admission_hospital (hospital_id)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 9. SHELTERS
-- ---------------------------------------------------------------------

CREATE TABLE shelters (
    shelter_id         VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    shelter_code          VARCHAR(20) NOT NULL UNIQUE,
    name                     VARCHAR(150) NOT NULL,
    location_id                VARCHAR(36) NOT NULL,
    max_capacity                  INT NOT NULL DEFAULT 0,
    current_occupancy                INT NOT NULL DEFAULT 0,
    food_supply_level                   VARCHAR(50) NOT NULL DEFAULT 'ADEQUATE',
    water_supply_level                     VARCHAR(50) NOT NULL DEFAULT 'ADEQUATE',
    has_medical_support                       TINYINT(1) NOT NULL DEFAULT 0,
    is_accessible                                TINYINT(1) NOT NULL DEFAULT 1,
    emergency_contact                              VARCHAR(30),
    created_at                                       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at                                       DATETIME NULL,
    FOREIGN KEY (location_id) REFERENCES locations(location_id),
    FOREIGN KEY (food_supply_level) REFERENCES severity_levels(severity),
    FOREIGN KEY (water_supply_level) REFERENCES severity_levels(severity),
    CHECK (current_occupancy >= 0 AND current_occupancy <= max_capacity),
    INDEX idx_shelter_capacity (max_capacity, current_occupancy)
) ENGINE=InnoDB;

CREATE TABLE shelter_capacity (
    capacity_id      VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    shelter_id       VARCHAR(36) NOT NULL,
    recorded_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    occupancy        INT NOT NULL,
    FOREIGN KEY (shelter_id) REFERENCES shelters(shelter_id) ON DELETE CASCADE,
    INDEX idx_shelter_cap_shelter (shelter_id, recorded_at)
) ENGINE=InnoDB;

CREATE TABLE shelter_residents (
    resident_id       VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    shelter_id         VARCHAR(36) NOT NULL,
    citizen_id            VARCHAR(36) NULL,
    full_name                VARCHAR(120) NOT NULL,
    checked_in_at               DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    checked_out_at                 DATETIME NULL,
    deleted_at                     DATETIME NULL,
    FOREIGN KEY (shelter_id) REFERENCES shelters(shelter_id) ON DELETE CASCADE,
    FOREIGN KEY (citizen_id) REFERENCES citizens(citizen_id) ON DELETE SET NULL,
    INDEX idx_resident_shelter (shelter_id)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 10. SUPPLIERS / VOLUNTEERS / TASKS
-- ---------------------------------------------------------------------

CREATE TABLE suppliers (
    supplier_id      VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name             VARCHAR(150) NOT NULL,
    contact_phone    VARCHAR(30),
    category         ENUM('MEDICAL','FOOD','WATER','EQUIPMENT','FUEL','OTHER') NOT NULL,
    created_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at       DATETIME NULL
) ENGINE=InnoDB;

CREATE TABLE supply_deliveries (
    delivery_id       VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    supplier_id        VARCHAR(36) NOT NULL,
    inventory_id          VARCHAR(36) NOT NULL,
    quantity                DECIMAL(12,2) NOT NULL,
    status                    VARCHAR(50) NOT NULL DEFAULT 'SCHEDULED',
    scheduled_at                 DATETIME NULL,
    delivered_at                   DATETIME NULL,
    deleted_at                     DATETIME NULL,
    FOREIGN KEY (supplier_id) REFERENCES suppliers(supplier_id) ON DELETE CASCADE,
    FOREIGN KEY (inventory_id) REFERENCES resource_inventory(inventory_id) ON DELETE CASCADE,
    FOREIGN KEY (status) REFERENCES status_types(status),
    INDEX idx_delivery_status (status)
) ENGINE=InnoDB;

CREATE TABLE volunteers (
    volunteer_id      VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    full_name          VARCHAR(120) NOT NULL,
    phone                VARCHAR(20),
    skills                 VARCHAR(255),
    is_active                TINYINT(1) NOT NULL DEFAULT 1,
    created_at                 DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at                 DATETIME NULL
) ENGINE=InnoDB;

CREATE TABLE volunteer_assignments (
    assignment_id      VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    volunteer_id         VARCHAR(36) NOT NULL,
    request_id              VARCHAR(36) NULL,
    shelter_id                 VARCHAR(36) NULL,
    assigned_at                   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    released_at                     DATETIME NULL,
    deleted_at                      DATETIME NULL,
    FOREIGN KEY (volunteer_id) REFERENCES volunteers(volunteer_id) ON DELETE CASCADE,
    FOREIGN KEY (request_id) REFERENCES emergency_requests(request_id) ON DELETE SET NULL,
    FOREIGN KEY (shelter_id) REFERENCES shelters(shelter_id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE emergency_tasks (
    task_id          VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    request_id         VARCHAR(36) NOT NULL,
    title                 VARCHAR(180) NOT NULL,
    status                  VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    created_at                DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at                DATETIME NULL,
    FOREIGN KEY (request_id) REFERENCES emergency_requests(request_id) ON DELETE CASCADE,
    FOREIGN KEY (status) REFERENCES status_types(status)
) ENGINE=InnoDB;

CREATE TABLE task_assignments (
    task_id         VARCHAR(36) NOT NULL,
    assignee_type   ENUM('PERSONNEL','VOLUNTEER','TEAM') NOT NULL,
    assignee_id     VARCHAR(36) NOT NULL,
    assigned_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (task_id, assignee_type, assignee_id),
    FOREIGN KEY (task_id) REFERENCES emergency_tasks(task_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 11. NOTIFICATIONS / ALERTS / AUDIT / SETTINGS
-- ---------------------------------------------------------------------

CREATE TABLE alerts (
    alert_id         VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    alert_type        VARCHAR(60) NOT NULL,
    severity            VARCHAR(50) NOT NULL DEFAULT 'INFO',
    message                VARCHAR(255) NOT NULL,
    entity_type              VARCHAR(60),
    entity_id                  VARCHAR(36),
    is_acknowledged               TINYINT(1) NOT NULL DEFAULT 0,
    created_at                     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at                     DATETIME NULL,
    FOREIGN KEY (severity) REFERENCES severity_levels(severity),
    INDEX idx_alert_ack (is_acknowledged),
    INDEX idx_alert_created (created_at)
) ENGINE=InnoDB;

CREATE TABLE notifications (
    notification_id   VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id             VARCHAR(36) NULL,
    title                  VARCHAR(150) NOT NULL,
    message                  VARCHAR(255) NOT NULL,
    is_read                    TINYINT(1) NOT NULL DEFAULT 0,
    created_at                   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_notification_user (user_id, is_read)
) ENGINE=InnoDB;

CREATE TABLE audit_logs (
    audit_id        VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id         VARCHAR(36) NULL,
    action          VARCHAR(80) NOT NULL,
    entity_type     VARCHAR(60) NOT NULL,
    entity_id       VARCHAR(36) NULL,
    old_value       JSON NULL,
    new_value       JSON NULL,
    ip_address      VARCHAR(45),
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL,
    INDEX idx_audit_entity (entity_type, entity_id),
    INDEX idx_audit_created (created_at),
    INDEX idx_audit_user (user_id)
) ENGINE=InnoDB;

CREATE TABLE system_settings (
    setting_key     VARCHAR(80) PRIMARY KEY,
    setting_value   VARCHAR(255) NOT NULL,
    description     VARCHAR(255),
    updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

SET FOREIGN_KEY_CHECKS = 1;
