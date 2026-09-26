USE urbanresq;

DROP TABLE IF EXISTS team_positions, shelter_history, road_blocks, damage_assessments, donations, personnel, victims, missing_persons,
  incident_messages, broadcasts, notifications;

ALTER TABLE users ADD COLUMN phone VARCHAR(30) NULL;
ALTER TABLE incident_attachments ADD COLUMN mime VARCHAR(60) NULL, ADD COLUMN size_bytes INT NULL;

CREATE TABLE notifications (
  notification_id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  kind VARCHAR(40) NOT NULL,
  title VARCHAR(160) NOT NULL,
  body VARCHAR(1000),
  incident_id INT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  read_at DATETIME NULL,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  INDEX idx_notif_user (user_id, read_at, notification_id)
);

CREATE TABLE broadcasts (
  broadcast_id INT AUTO_INCREMENT PRIMARY KEY,
  sender_id INT NOT NULL,
  audience ENUM('all','admin','coordinator','field_team') NOT NULL,
  incident_id INT NULL,
  message VARCHAR(1000) NOT NULL,
  sent_external BOOLEAN NOT NULL DEFAULT FALSE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sender_id) REFERENCES users(user_id)
);

CREATE TABLE incident_messages (
  message_id INT AUTO_INCREMENT PRIMARY KEY,
  incident_id INT NOT NULL,
  user_id INT NOT NULL,
  message VARCHAR(1000) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (incident_id) REFERENCES incidents(incident_id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(user_id),
  INDEX idx_msg_inc (incident_id, message_id)
);

CREATE TABLE personnel (
  person_id INT AUTO_INCREMENT PRIMARY KEY,
  team_id INT NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  role VARCHAR(60) NOT NULL,
  skills VARCHAR(255),
  phone VARCHAR(30),
  FOREIGN KEY (team_id) REFERENCES rescue_teams(team_id) ON DELETE CASCADE
);

CREATE TABLE victims (
  victim_id INT AUTO_INCREMENT PRIMARY KEY,
  incident_id INT NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  age SMALLINT NULL CHECK (age BETWEEN 0 AND 120),
  condition_note VARCHAR(255),
  status ENUM('registered','sheltered','hospitalised','discharged') NOT NULL DEFAULT 'registered',
  shelter_id INT NULL,
  hospital_id INT NULL,
  registered_by INT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (incident_id) REFERENCES incidents(incident_id),
  FOREIGN KEY (shelter_id) REFERENCES shelters(shelter_id),
  FOREIGN KEY (hospital_id) REFERENCES hospitals(hospital_id),
  FOREIGN KEY (registered_by) REFERENCES users(user_id),
  INDEX idx_vic_name (full_name)
);

CREATE TABLE missing_persons (
  missing_id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(100) NOT NULL,
  age SMALLINT NULL CHECK (age BETWEEN 0 AND 120),
  description VARCHAR(500),
  last_seen_area_id INT NULL,
  reporter_name VARCHAR(100) NOT NULL,
  reporter_contact VARCHAR(60) NOT NULL,
  status ENUM('missing','located','reunified') NOT NULL DEFAULT 'missing',
  identified BOOLEAN NOT NULL DEFAULT FALSE,
  located_note VARCHAR(255),
  handed_to VARCHAR(100) NULL,
  handover_confirmed_by INT NULL,
  reported_by INT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  reunified_at DATETIME NULL,
  FOREIGN KEY (last_seen_area_id) REFERENCES areas(area_id),
  FOREIGN KEY (handover_confirmed_by) REFERENCES users(user_id),
  FOREIGN KEY (reported_by) REFERENCES users(user_id),
  INDEX idx_mp_status (status)
);

CREATE TABLE road_blocks (
  block_id INT AUTO_INCREMENT PRIMARY KEY,
  lat DECIMAL(9,6) NOT NULL,
  lng DECIMAL(9,6) NOT NULL,
  description VARCHAR(200) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_by INT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  cleared_at DATETIME NULL,
  FOREIGN KEY (created_by) REFERENCES users(user_id)
);

CREATE TABLE damage_assessments (
  assessment_id INT AUTO_INCREMENT PRIMARY KEY,
  incident_id INT NOT NULL,
  buildings_damaged INT NOT NULL DEFAULT 0 CHECK (buildings_damaged >= 0),
  roads_affected VARCHAR(200),
  utilities_note VARCHAR(255),
  est_loss DECIMAL(14,2) NULL CHECK (est_loss >= 0),
  assessed_by INT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (incident_id) REFERENCES incidents(incident_id) ON DELETE CASCADE,
  FOREIGN KEY (assessed_by) REFERENCES users(user_id)
);

CREATE TABLE donations (
  donation_id INT AUTO_INCREMENT PRIMARY KEY,
  donor_name VARCHAR(100) NOT NULL,
  kind ENUM('cash','goods') NOT NULL,
  amount DECIMAL(14,2) NULL CHECK (amount > 0),
  resource_id INT NULL,
  qty INT NULL CHECK (qty > 0),
  warehouse_id INT NULL,
  batch_no VARCHAR(30) NULL,
  note VARCHAR(255),
  received_by INT NOT NULL,
  received_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (resource_id) REFERENCES resources(resource_id),
  FOREIGN KEY (warehouse_id) REFERENCES warehouses(warehouse_id),
  FOREIGN KEY (received_by) REFERENCES users(user_id)
);

CREATE TABLE shelter_history (
  entry_id INT AUTO_INCREMENT PRIMARY KEY,
  shelter_id INT NOT NULL,
  occupancy INT NOT NULL,
  recorded_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (shelter_id) REFERENCES shelters(shelter_id) ON DELETE CASCADE,
  INDEX idx_sh_time (shelter_id, recorded_at)
);

CREATE TABLE team_positions (
  team_id INT PRIMARY KEY,
  lat DECIMAL(9,6) NOT NULL,
  lng DECIMAL(9,6) NOT NULL,
  accuracy_m INT NULL,
  updated_by INT NOT NULL,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (team_id) REFERENCES rescue_teams(team_id) ON DELETE CASCADE,
  FOREIGN KEY (updated_by) REFERENCES users(user_id)
);
