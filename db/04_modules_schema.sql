USE urbanresq;

DROP TABLE IF EXISTS volunteer_assignments, volunteers, team_assignments, rescue_teams, shelters, hospitals;

CREATE TABLE rescue_teams (
  team_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(80) NOT NULL UNIQUE,
  specialty VARCHAR(80) NOT NULL,
  certifications VARCHAR(255),
  members INT NOT NULL DEFAULT 1 CHECK (members > 0),
  base_area_id INT NULL,
  status ENUM('available','deployed','off_duty') NOT NULL DEFAULT 'available',
  FOREIGN KEY (base_area_id) REFERENCES areas(area_id)
);

CREATE TABLE team_assignments (
  assignment_id INT AUTO_INCREMENT PRIMARY KEY,
  team_id INT NOT NULL,
  incident_id INT NOT NULL,
  assigned_by INT NOT NULL,
  status ENUM('assigned','active','completed') NOT NULL DEFAULT 'assigned',
  assigned_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  checked_in_at DATETIME NULL,
  checked_out_at DATETIME NULL,
  FOREIGN KEY (team_id) REFERENCES rescue_teams(team_id),
  FOREIGN KEY (incident_id) REFERENCES incidents(incident_id),
  FOREIGN KEY (assigned_by) REFERENCES users(user_id),
  INDEX idx_ta_team (team_id, status)
);

CREATE TABLE volunteers (
  volunteer_id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(100) NOT NULL,
  phone VARCHAR(30),
  skills VARCHAR(255),
  is_available BOOLEAN NOT NULL DEFAULT TRUE,
  registered_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE volunteer_assignments (
  assignment_id INT AUTO_INCREMENT PRIMARY KEY,
  volunteer_id INT NOT NULL,
  incident_id INT NOT NULL,
  task VARCHAR(160) NOT NULL,
  status ENUM('assigned','done') NOT NULL DEFAULT 'assigned',
  assigned_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (volunteer_id) REFERENCES volunteers(volunteer_id),
  FOREIGN KEY (incident_id) REFERENCES incidents(incident_id)
);

CREATE TABLE hospitals (
  hospital_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  area_id INT NOT NULL,
  lat DECIMAL(9,6) NOT NULL,
  lng DECIMAL(9,6) NOT NULL,
  beds_total INT NOT NULL CHECK (beds_total >= 0),
  beds_available INT NOT NULL CHECK (beds_available >= 0),
  ambulances_available INT NOT NULL DEFAULT 0 CHECK (ambulances_available >= 0),
  er_status ENUM('open','busy','diverted') NOT NULL DEFAULT 'open',
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (area_id) REFERENCES areas(area_id),
  CHECK (beds_available <= beds_total)
);

CREATE TABLE shelters (
  shelter_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  area_id INT NOT NULL,
  lat DECIMAL(9,6) NOT NULL,
  lng DECIMAL(9,6) NOT NULL,
  capacity INT NOT NULL CHECK (capacity > 0),
  occupancy INT NOT NULL DEFAULT 0 CHECK (occupancy >= 0),
  needs VARCHAR(255),
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (area_id) REFERENCES areas(area_id),
  CHECK (occupancy <= capacity)
);
