CREATE DATABASE IF NOT EXISTS urbanresq CHARACTER SET utf8mb4;
USE urbanresq;

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS team_positions, shelter_history, road_blocks, damage_assessments, donations, personnel, victims, missing_persons,
  incident_messages, broadcasts, notifications, volunteer_assignments, volunteers, team_assignments, rescue_teams, shelters, hospitals,
  audit_logs, allocation_items, allocations, resource_request_items,
  resource_requests, stock_thresholds, stock_batches, warehouses, resources,
  resource_categories, incident_attachments, incident_timeline, incidents, areas, users, roles;
SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE roles (
  role_id TINYINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(30) NOT NULL UNIQUE
);

CREATE TABLE users (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  role_id TINYINT NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(120) NOT NULL UNIQUE,
  password_hash VARCHAR(100) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (role_id) REFERENCES roles(role_id)
);

CREATE TABLE areas (
  area_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(80) NOT NULL,
  district VARCHAR(80),
  lat DECIMAL(9,6) NOT NULL,
  lng DECIMAL(9,6) NOT NULL,
  population INT NOT NULL DEFAULT 0,
  risk_level ENUM('low','moderate','high') NOT NULL DEFAULT 'moderate'
);

CREATE TABLE incidents (
  incident_id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(20) NOT NULL UNIQUE,
  kind ENUM('flood','fire','earthquake','cyclone','landslide','industrial') NOT NULL,
  severity ENUM('low','moderate','high','critical') NOT NULL,
  status ENUM('reported','verified','responding','contained','resolved') NOT NULL DEFAULT 'reported',
  priority TINYINT NOT NULL DEFAULT 3 CHECK (priority BETWEEN 1 AND 5),
  area_id INT NOT NULL,
  lat DECIMAL(9,6),
  lng DECIMAL(9,6),
  affected_pop INT NOT NULL DEFAULT 0,
  commander_id INT NULL,
  respond_by DATETIME NULL,
  description TEXT,
  reported_by INT NOT NULL,
  reported_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  resolved_at DATETIME NULL,
  FOREIGN KEY (area_id) REFERENCES areas(area_id),
  FOREIGN KEY (commander_id) REFERENCES users(user_id),
  FOREIGN KEY (reported_by) REFERENCES users(user_id),
  INDEX idx_inc_status (status),
  INDEX idx_inc_sev (severity),
  INDEX idx_inc_kind (kind),
  INDEX idx_inc_area (area_id)
);

CREATE TABLE incident_timeline (
  entry_id INT AUTO_INCREMENT PRIMARY KEY,
  incident_id INT NOT NULL,
  user_id INT NULL,
  event VARCHAR(255) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (incident_id) REFERENCES incidents(incident_id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(user_id),
  INDEX idx_tl_inc (incident_id, created_at)
);

CREATE TABLE incident_attachments (
  attachment_id INT AUTO_INCREMENT PRIMARY KEY,
  incident_id INT NOT NULL,
  file_name VARCHAR(160) NOT NULL,
  file_path VARCHAR(255) NOT NULL,
  uploaded_by INT NOT NULL,
  uploaded_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (incident_id) REFERENCES incidents(incident_id) ON DELETE CASCADE,
  FOREIGN KEY (uploaded_by) REFERENCES users(user_id)
);

CREATE TABLE resource_categories (
  category_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE resources (
  resource_id INT AUTO_INCREMENT PRIMARY KEY,
  category_id INT NOT NULL,
  name VARCHAR(80) NOT NULL UNIQUE,
  unit VARCHAR(20) NOT NULL,
  is_perishable BOOLEAN NOT NULL DEFAULT FALSE,
  FOREIGN KEY (category_id) REFERENCES resource_categories(category_id)
);

CREATE TABLE warehouses (
  warehouse_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(80) NOT NULL,
  area_id INT NOT NULL,
  lat DECIMAL(9,6),
  lng DECIMAL(9,6),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  FOREIGN KEY (area_id) REFERENCES areas(area_id)
);

CREATE TABLE stock_batches (
  batch_id INT AUTO_INCREMENT PRIMARY KEY,
  warehouse_id INT NOT NULL,
  resource_id INT NOT NULL,
  batch_no VARCHAR(30) NOT NULL,
  expiry_date DATE NULL,
  qty INT NOT NULL CHECK (qty >= 0),
  UNIQUE KEY uq_batch (warehouse_id, resource_id, batch_no),
  FOREIGN KEY (warehouse_id) REFERENCES warehouses(warehouse_id),
  FOREIGN KEY (resource_id) REFERENCES resources(resource_id)
);

CREATE TABLE stock_thresholds (
  warehouse_id INT NOT NULL,
  resource_id INT NOT NULL,
  min_qty INT NOT NULL CHECK (min_qty >= 0),
  PRIMARY KEY (warehouse_id, resource_id),
  FOREIGN KEY (warehouse_id) REFERENCES warehouses(warehouse_id),
  FOREIGN KEY (resource_id) REFERENCES resources(resource_id)
);

CREATE TABLE resource_requests (
  request_id INT AUTO_INCREMENT PRIMARY KEY,
  incident_id INT NOT NULL,
  area_id INT NOT NULL,
  requested_by INT NOT NULL,
  priority ENUM('low','medium','high','critical') NOT NULL DEFAULT 'medium',
  status ENUM('pending','approved','rejected','partially_fulfilled','fulfilled','cancelled') NOT NULL DEFAULT 'pending',
  decided_by INT NULL,
  decided_at DATETIME NULL,
  decision_note VARCHAR(255),
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (incident_id) REFERENCES incidents(incident_id),
  FOREIGN KEY (area_id) REFERENCES areas(area_id),
  FOREIGN KEY (requested_by) REFERENCES users(user_id),
  FOREIGN KEY (decided_by) REFERENCES users(user_id),
  INDEX idx_req_status (status, priority)
);

CREATE TABLE resource_request_items (
  request_id INT NOT NULL,
  resource_id INT NOT NULL,
  qty_requested INT NOT NULL CHECK (qty_requested > 0),
  qty_allocated INT NOT NULL DEFAULT 0 CHECK (qty_allocated >= 0),
  PRIMARY KEY (request_id, resource_id),
  FOREIGN KEY (request_id) REFERENCES resource_requests(request_id) ON DELETE CASCADE,
  FOREIGN KEY (resource_id) REFERENCES resources(resource_id)
);

CREATE TABLE allocations (
  allocation_id INT AUTO_INCREMENT PRIMARY KEY,
  request_id INT NOT NULL,
  incident_id INT NOT NULL,
  area_id INT NOT NULL,
  warehouse_id INT NOT NULL,
  status ENUM('allocated','in_transit','delivered','cancelled') NOT NULL DEFAULT 'allocated',
  recipient_name VARCHAR(100) NULL,
  delivered_at DATETIME NULL,
  created_by INT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (request_id) REFERENCES resource_requests(request_id),
  FOREIGN KEY (incident_id) REFERENCES incidents(incident_id),
  FOREIGN KEY (area_id) REFERENCES areas(area_id),
  FOREIGN KEY (warehouse_id) REFERENCES warehouses(warehouse_id),
  FOREIGN KEY (created_by) REFERENCES users(user_id),
  INDEX idx_alloc_req (request_id)
);

CREATE TABLE allocation_items (
  allocation_id INT NOT NULL,
  batch_id INT NOT NULL,
  resource_id INT NOT NULL,
  qty INT NOT NULL CHECK (qty > 0),
  PRIMARY KEY (allocation_id, batch_id),
  FOREIGN KEY (allocation_id) REFERENCES allocations(allocation_id) ON DELETE CASCADE,
  FOREIGN KEY (batch_id) REFERENCES stock_batches(batch_id),
  FOREIGN KEY (resource_id) REFERENCES resources(resource_id)
);

CREATE TABLE audit_logs (
  log_id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NULL,
  action VARCHAR(60) NOT NULL,
  entity VARCHAR(40) NOT NULL,
  entity_id INT NULL,
  details TEXT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_audit_user (user_id, created_at),
  INDEX idx_audit_entity (entity, entity_id)
);
