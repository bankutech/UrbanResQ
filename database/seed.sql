-- =====================================================================
-- URBANRESQ — seed.sql
-- Realistic fictional data for a Chennai-style metropolitan city.
-- NOTE: `users` + `user_roles` are seeded separately by
-- backend/src/database/seed.ts, because password hashing (bcrypt)
-- needs to happen in application code, not hardcoded in SQL.
-- Run order: schema.sql -> functions.sql -> procedures.sql -> triggers.sql
--            -> views.sql -> seed.sql -> (node) npm run db:seed:users
-- =====================================================================
USE urbanresq;
SET FOREIGN_KEY_CHECKS = 0;

-- ---------------------------------------------------------------------
-- Core System Lookups (Status, Severity, Urgency)
-- ---------------------------------------------------------------------
INSERT IGNORE INTO status_types (status, description) VALUES
('PENDING', 'Pending triage or assignment'),
('APPROVED', 'Approved by operations or coordinator'),
('DISPATCHED', 'In transit / dispatched to site'),
('DELIVERED', 'Delivered to destination'),
('CANCELLED', 'Cancelled or revoked'),
('ACTIVE', 'Active operational status'),
('ASSIGNED', 'Assigned to team or depot'),
('ACKNOWLEDGED', 'Acknowledged by dispatcher'),
('RESOLVED', 'Resolved or mitigated'),
('AVAILABLE', 'Available for deployment'),
('DEPLOYED', 'Deployed in field'),
('MAINTENANCE', 'Under maintenance'),
('OPEN', 'Open incident or shortage'),
('CLOSED', 'Closed case'),
('NORMAL', 'Normal state'),
('WARNING', 'Warning / threshold breach'),
('CRITICAL', 'Critical condition'),
('COMPLETED', 'Mission completed'),
('OCCUPIED', 'Occupied facility/bed'),
('IN_PROGRESS', 'Task in progress'),
('STANDBY', 'Unit on standby'),
('ARCHIVED', 'Archived record'),
('CONTAINED', 'Disaster contained'),
('OFF_DUTY', 'Off duty team'),
('GOOD', 'Good equipment condition'),
('IN_TRANSIT', 'In transit'),
('SCHEDULED', 'Scheduled activity');

INSERT IGNORE INTO severity_levels (severity, description) VALUES
('LOW', 'Low impact / minor advisory'),
('MEDIUM', 'Moderate concern'),
('HIGH', 'High operational threat'),
('CRITICAL', 'Catastrophic / life-threatening'),
('WARNING', 'Warning notice'),
('INFO', 'Informational telemetry'),
('EMERGENCY', 'Immediate emergency'),
('MODERATE', 'Moderate scale'),
('ADEQUATE', 'Adequate supply buffer'),
('SURPLUS', 'Surplus inventory'),
('STABLE', 'Stable medical condition'),
('SERIOUS', 'Serious medical condition');

INSERT IGNORE INTO urgency_levels (urgency, description) VALUES
('LOW', 'Low priority request'),
('MEDIUM', 'Standard priority request'),
('HIGH', 'Urgent priority request'),
('CRITICAL', 'Life-safety emergency request'),
('URGENT', 'Immediate tactical priority');

-- ---------------------------------------------------------------------
-- Roles & permissions
-- ---------------------------------------------------------------------
INSERT INTO roles (role_name, description) VALUES
('ADMIN', 'Full system access'),
('EMERGENCY_MANAGER', 'Manages disasters, incidents, allocation, command center'),
('DISASTER_OFFICER', 'Field reporting and incident management'),
('RESOURCE_MANAGER', 'Inventory and resource allocation'),
('MEDICAL_COORDINATOR', 'Hospitals, patients, medical resources'),
('RESCUE_COORDINATOR', 'Rescue teams and vehicles'),
('VIEWER', 'Read-only dashboards');

INSERT INTO permissions (permission_key, description) VALUES
('disaster.manage','Create/update disasters'),
('request.manage','Create/update emergency requests'),
('allocation.manage','Run and approve allocations'),
('inventory.manage','Manage resource inventory'),
('hospital.manage','Manage hospital data'),
('shelter.manage','Manage shelter data'),
('team.manage','Manage rescue teams and personnel'),
('user.manage','Manage users and roles'),
('report.view','View analytics and reports'),
('audit.view','View audit logs');

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.role_id, p.permission_id FROM roles r JOIN permissions p ON 1=1 WHERE r.role_name = 'ADMIN';
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.role_id, p.permission_id FROM roles r JOIN permissions p ON p.permission_key IN
    ('disaster.manage','request.manage','allocation.manage','report.view')
WHERE r.role_name = 'EMERGENCY_MANAGER';
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.role_id, p.permission_id FROM roles r JOIN permissions p ON p.permission_key IN
    ('request.manage','report.view') WHERE r.role_name = 'DISASTER_OFFICER';
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.role_id, p.permission_id FROM roles r JOIN permissions p ON p.permission_key IN
    ('inventory.manage','allocation.manage','report.view') WHERE r.role_name = 'RESOURCE_MANAGER';
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.role_id, p.permission_id FROM roles r JOIN permissions p ON p.permission_key IN
    ('hospital.manage','report.view') WHERE r.role_name = 'MEDICAL_COORDINATOR';
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.role_id, p.permission_id FROM roles r JOIN permissions p ON p.permission_key IN
    ('team.manage','report.view') WHERE r.role_name = 'RESCUE_COORDINATOR';
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.role_id, p.permission_id FROM roles r JOIN permissions p ON p.permission_key = 'report.view'
WHERE r.role_name = 'VIEWER';

-- ---------------------------------------------------------------------
-- Locations (Chennai zones + landmarks) — generated across a grid
-- around central Chennai coordinates for map realism.
-- ---------------------------------------------------------------------
INSERT INTO locations (location_id, label, zone_name, city, latitude, longitude, address) VALUES
(1,'Adyar Depot','Zone 1 - Adyar','Chennai',13.0012,80.2565,'Adyar, Chennai'),
(2,'Velachery Warehouse','Zone 2 - Velachery','Chennai',12.9791,80.2210,'Velachery, Chennai'),
(3,'T Nagar Command Post','Zone 3 - T Nagar','Chennai',13.0418,80.2341,'T Nagar, Chennai'),
(4,'Kotturpuram Relief Camp','Zone 4 - Kotturpuram','Chennai',13.0257,80.2419,'Kotturpuram, Chennai'),
(5,'Mylapore Depot','Zone 5 - Mylapore','Chennai',13.0339,80.2695,'Mylapore, Chennai'),
(6,'Perambur Yard','Zone 6 - Perambur','Chennai',13.1141,80.2340,'Perambur, Chennai'),
(7,'Tambaram Base','Zone 7 - Tambaram','Chennai',12.9249,80.1000,'Tambaram, Chennai'),
(8,'Anna Nagar Station','Zone 8 - Anna Nagar','Chennai',13.0850,80.2101,'Anna Nagar, Chennai'),
(9,'Sholinganallur Hub','Zone 9 - Sholinganallur','Chennai',12.9010,80.2279,'Sholinganallur, Chennai'),
(10,'Egmore Central','Zone 10 - Egmore','Chennai',13.0732,80.2609,'Egmore, Chennai'),
(11,'Kotturpuram Bridge','Zone 4 - Kotturpuram','Chennai',13.0271,80.2432,'Near Kotturpuram Bridge'),
(12,'Saidapet Low-Lying Area','Zone 11 - Saidapet','Chennai',13.0209,80.2229,'Saidapet, Chennai'),
(13,'Marina Beach Road','Zone 12 - Marina','Chennai',13.0500,80.2824,'Marina Beach, Chennai'),
(14,'Guindy Industrial Estate','Zone 13 - Guindy','Chennai',13.0067,80.2206,'Guindy, Chennai'),
(15,'Perungudi Landfill Road','Zone 14 - Perungudi','Chennai',12.9635,80.2415,'Perungudi, Chennai'),
(16,'Chromepet Junction','Zone 15 - Chromepet','Chennai',12.9516,80.1462,'Chromepet, Chennai'),
(17,'Alandur Metro Zone','Zone 16 - Alandur','Chennai',13.0037,80.2065,'Alandur, Chennai'),
(18,'Royapuram Coastal Area','Zone 17 - Royapuram','Chennai',13.1140,80.2946,'Royapuram, Chennai');

-- ---------------------------------------------------------------------
-- Disaster Types
-- ---------------------------------------------------------------------
INSERT INTO disaster_types (disaster_type, description) VALUES
('FLOOD', 'Urban or rural flooding due to heavy rainfall, storm surge, or breached banks'),
('CYCLONE', 'Severe tropical cyclone, hurricane, or typhoon'),
('EARTHQUAKE', 'Seismic activity causing structural collapse'),
('FIRE', 'Large scale industrial, forest, or urban fire'),
('LANDSLIDE', 'Landslide or mudslide in hilly terrain'),
('INDUSTRIAL_ACCIDENT', 'Chemical leak, explosion, or factory accident'),
('BUILDING_COLLAPSE', 'Structural failure of residential or commercial properties'),
('ROAD_ACCIDENT', 'Major multi-vehicle collision or transit disaster'),
('HEAT_EMERGENCY', 'Severe heatwave requiring cooling centers and medical aid'),
('EPIDEMIC', 'Rapid spread of infectious disease');

-- ---------------------------------------------------------------------
-- Flagship demo disaster + 5 secondary disasters
-- ---------------------------------------------------------------------
-- created_by will be user_id 1 (admin) once users are seeded; using 1 directly
-- since seed order guarantees admin gets user_id 1 in seed.ts.
INSERT INTO disasters
(disaster_id, disaster_type, title, description, severity, status, start_time, estimated_end_time,
 affected_population, estimated_damage, latitude, longitude, created_by)
VALUES
(1,'FLOOD','Chennai Metropolitan Flood Emergency - 2026',
 'Sustained heavy rainfall over 36 hours has caused severe urban flooding across southern and central Chennai. Multiple arterial roads are submerged, low-lying residential zones are cut off, and drainage systems are overwhelmed.',
 'CRITICAL','ACTIVE', NOW() - INTERVAL 18 HOUR, NOW() + INTERVAL 30 HOUR,
 42000, 850000000.00, 13.0067, 80.2206,
 1),
(2,'CYCLONE','Cyclone Vardah-II Coastal Warning','Coastal cyclone system approaching with high wind speeds, evacuation advisories issued for coastal wards.',
 'HIGH','ACTIVE', NOW() - INTERVAL 6 HOUR, NOW() + INTERVAL 48 HOUR, 15000, 120000000.00, 13.1140,80.2946,
 1),
(3,'FIRE','Guindy Industrial Estate Warehouse Fire','Chemical warehouse fire spreading to adjacent units, hazardous smoke reported.',
 'HIGH','CONTAINED', NOW() - INTERVAL 3 DAY, NOW() - INTERVAL 2 DAY, 800, 45000000.00, 13.0067,80.2206,
 1),
(4,'BUILDING_COLLAPSE','Saidapet Under-Construction Building Collapse','Partial structural collapse of a 4-storey under-construction building following ground subsidence.',
 'CRITICAL','ACTIVE', NOW() - INTERVAL 5 HOUR, NULL, 60, 8000000.00, 13.0209,80.2229,
 1),
(5,'ROAD_ACCIDENT','Tambaram Highway Multi-Vehicle Pileup','Multi-vehicle collision on GST Road during heavy rain and low visibility.',
 'MODERATE','RESOLVED', NOW() - INTERVAL 10 DAY, NOW() - INTERVAL 10 DAY + INTERVAL 6 HOUR, 40, 2000000.00, 12.9249,80.1000,
 1),
(6,'EPIDEMIC','Post-Flood Waterborne Illness Cluster - Velachery','Localized outbreak of waterborne illness linked to contaminated flood water in Velachery ward.',
 'MODERATE','ACTIVE', NOW() - INTERVAL 2 DAY, NULL, 3200, 6000000.00, 12.9791,80.2210,
 1);

-- ---------------------------------------------------------------------
-- Disaster zones (flagship flood gets the most zones)
-- ---------------------------------------------------------------------
INSERT INTO disaster_zones (disaster_id, zone_code, zone_name, location_id, severity, population_estimate, is_accessible) VALUES
(1,'Z-01','Adyar Riverbank',1,'CRITICAL',6200,0),
(1,'Z-02','Velachery Residential Belt',2,'CRITICAL',8100,1),
(1,'Z-03','T Nagar Commercial Core',3,'HIGH',5400,1),
(1,'Z-04','Kotturpuram Low-Lying',4,'CRITICAL',3900,0),
(1,'Z-05','Mylapore Heritage Zone',5,'MODERATE',2600,1),
(1,'Z-06','Saidapet Waterlogged Sector',12,'HIGH',4700,1),
(1,'Z-07','Guindy Industrial Fringe',14,'HIGH',3100,1),
(1,'Z-08','Perungudi Wetlands Overflow',15,'MODERATE',2200,1),
(1,'Z-09','Alandur Metro Corridor',17,'MODERATE',1900,1),
(1,'Z-10','Chromepet Southern Belt',16,'HIGH',3800,1),
(2,'Z-11','Royapuram Coast',18,'HIGH',5200,1),
(2,'Z-12','Marina Coastal Strip',13,'MODERATE',2100,1),
(3,'Z-13','Guindy Industrial Estate',14,'HIGH',800,0),
(4,'Z-14','Saidapet Collapse Site',12,'CRITICAL',60,0),
(6,'Z-15','Velachery Ward 12',2,'MODERATE',3200,1);

-- ---------------------------------------------------------------------
-- Incidents
-- ---------------------------------------------------------------------
INSERT INTO incidents (disaster_id, zone_id, incident_type, description, severity, status, location_id, reported_at) VALUES
(1,1,'Road Submerged','Adyar bridge approach road fully submerged, impassable','CRITICAL','OPEN',1, NOW() - INTERVAL 10 HOUR),
(1,4,'Bridge Access Cut Off','Kotturpuram bridge access road flooded, isolating residential blocks','CRITICAL','IN_PROGRESS',11, NOW() - INTERVAL 8 HOUR),
(1,2,'Power Outage','Transformer flooding causing rolling blackouts in Velachery','HIGH','OPEN',2, NOW() - INTERVAL 6 HOUR),
(1,6,'Building Water Ingress','Ground floor flooding reported in residential complex','HIGH','OPEN',12, NOW() - INTERVAL 4 HOUR),
(4,14,'Structural Collapse','Partial collapse of 4-storey structure, people reported trapped','CRITICAL','IN_PROGRESS',12, NOW() - INTERVAL 5 HOUR),
(3,13,'Warehouse Fire','Chemical warehouse fire, contained to two units','HIGH','RESOLVED',14, NOW() - INTERVAL 3 DAY);

-- ---------------------------------------------------------------------
-- Citizens (fictional)
-- ---------------------------------------------------------------------
INSERT INTO citizens (full_name, phone, vulnerable_group) VALUES
('Karthik Raman','98410XXXXX','NONE'),('Priya Subramaniam','98411XXXXX','PREGNANT'),
('Ganesh Iyer','98412XXXXX','ELDERLY'),('Lakshmi Narayanan','98413XXXXX','NONE'),
('Arjun Kumar','98414XXXXX','CHILD'),('Meena Krishnan','98415XXXXX','DISABLED'),
('Suresh Babu','98416XXXXX','NONE'),('Divya Chandran','98417XXXXX','MEDICAL_DEPENDENT'),
('Ravi Shankar','98418XXXXX','ELDERLY'),('Anitha Selvam','98419XXXXX','NONE'),
('Vignesh Murthy','98420XXXXX','NONE'),('Kavya Ramesh','98421XXXXX','CHILD'),
('Senthil Kumar','98422XXXXX','NONE'),('Deepa Rajan','98423XXXXX','PREGNANT'),
('Manoj Prakash','98424XXXXX','NONE'),('Yamuna Devi','98425XXXXX','ELDERLY'),
('Bala Subramanian','98426XXXXX','DISABLED'),('Nithya Sri','98427XXXXX','NONE'),
('Aravind Swamy','98428XXXXX','NONE'),('Revathi Menon','98429XXXXX','CHILD');

-- ---------------------------------------------------------------------
-- Emergency requests — bulk-generated across the flood disaster zones
-- using a recursive CTE as a row-number generator (documented pattern,
-- reused in sample_queries.sql for gap-filling time series).
-- ---------------------------------------------------------------------
INSERT INTO emergency_requests
(disaster_id, zone_id, location_id, requester_type, citizen_id, requester_name, requester_contact,
 category, description, people_affected, vulnerable_count, urgency, status, required_resources_json, created_at)
WITH RECURSIVE seq AS (
    SELECT 1 AS n
    UNION ALL
    SELECT n + 1 FROM seq WHERE n < 55
)
SELECT
    1,
    (n % 10) + 1,
    ((n % 18) + 1),
    ELT((n % 5) + 1, 'CITIZEN','OFFICER','CITIZEN','CITIZEN','HOSPITAL'),
    ((n % 20) + 1),
    ELT((n % 4)+1,'Karthik R.','Priya S.','Ganesh I.','Lakshmi N.'),
    '9840XXXXXX',
    ELT((n % 8) + 1, 'MEDICAL','RESCUE','WATER','FOOD','SHELTER','EVACUATION','SUPPLIES','MEDICAL'),
    ELT((n % 10) + 1,
        'Family of 4 trapped on rooftop, water rising rapidly',
        'Elderly resident needs urgent medical evacuation',
        'No drinking water available for 30+ hours',
        'Building ground floor flooded, need evacuation',
        'Child with fever, roads impassable to reach hospital',
        'Shelter request for displaced family of 6',
        'Need medical supplies - diabetic patient out of insulin',
        'Boat rescue needed, 8 people stranded',
        'Food supplies exhausted in relief camp',
        'Pregnant woman needs urgent transport to hospital'
    ),
    1 + (n % 12),
    (n % 4),
    ELT((n % 4) + 1, 'CRITICAL','HIGH','MEDIUM','LOW'),
    ELT((n % 6) + 1, 'PENDING','PENDING','ACKNOWLEDGED','ASSIGNED','IN_PROGRESS','RESOLVED'),
    JSON_ARRAY(JSON_OBJECT('resource_type_id', (n % 12) + 1, 'quantity', 1 + (n % 5))),
    NOW() - INTERVAL (n * 17) MINUTE
FROM seq;

-- A handful of hand-authored, narratively rich flagship requests for the demo walkthrough
INSERT INTO emergency_requests
(disaster_id, zone_id, location_id, requester_type, citizen_id, requester_name, requester_contact,
 category, description, people_affected, vulnerable_count, urgency, status, required_resources_json, created_at)
VALUES
(1,4,11,'CITIZEN',5,'Arjun Kumar','9841400000','RESCUE',
 '10 people trapped on second floor near Kotturpuram bridge, water still rising, includes 2 children',
 10,2,'CRITICAL','PENDING', JSON_ARRAY(JSON_OBJECT('resource_type_id',3,'quantity',2)),
 NOW() - INTERVAL 21 MINUTE),
(4,14,12,'OFFICER',NULL,'Duty Officer - Saidapet','9841800000','RESCUE',
 'Building collapse: 6 people confirmed trapped under debris, structural engineers required',
 6,1,'CRITICAL','ACKNOWLEDGED', JSON_ARRAY(JSON_OBJECT('resource_type_id',7,'quantity',2)),
 NOW() - INTERVAL 55 MINUTE),
(1,2,2,'HOSPITAL',NULL,'Velachery Community Hospital','9841900000','SUPPLIES',
 'Hospital blood supply critical, requesting emergency O-negative units and IV fluids',
 0,0,'CRITICAL','PENDING', JSON_ARRAY(JSON_OBJECT('resource_type_id',1,'quantity',20)),
 NOW() - INTERVAL 12 MINUTE);

SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================================
-- Part 2: Resources, hospitals, shelters, teams, vehicles, personnel
-- =====================================================================
USE urbanresq;
SET FOREIGN_KEY_CHECKS = 0;

-- ---------------------------------------------------------------------
-- Resource types (12 categories represented)
-- ---------------------------------------------------------------------
INSERT INTO resource_types (resource_type_id, category, name, unit, is_critical, default_min_threshold) VALUES
(1,'MEDICAL','Blood Units (O-Negative)','units',1,50),
(2,'MEDICAL','IV Fluid Packs','packs',1,200),
(3,'MEDICAL','First Aid Kits','kits',1,100),
(4,'MEDICAL','Insulin Vials','vials',1,80),
(5,'FOOD','Ready-to-Eat Meal Packs','packs',0,2000),
(6,'FOOD','Dry Ration Kits','kits',0,500),
(7,'WATER','Drinking Water (Bottled)','L',1,5000),
(8,'WATER','Water Purification Tablets','packs',0,1000),
(9,'RESCUE_EQUIPMENT','Rescue Boats','units',1,10),
(10,'RESCUE_EQUIPMENT','Life Jackets','units',0,300),
(11,'RESCUE_EQUIPMENT','Rope & Rigging Kits','kits',0,80),
(12,'RESCUE_EQUIPMENT','Hydraulic Cutters','units',1,15),
(13,'VEHICLE','Ambulances','units',1,10),
(14,'VEHICLE','Fire Trucks','units',1,8),
(15,'VEHICLE','Evacuation Buses','units',0,10),
(16,'FUEL','Diesel','L',1,3000),
(17,'SHELTER_SUPPLIES','Blankets','units',0,1000),
(18,'SHELTER_SUPPLIES','Tents','units',0,150),
(19,'COMMUNICATION_EQUIPMENT','Satellite Phones','units',1,20),
(20,'POWER_EQUIPMENT','Portable Generators','units',1,25),
(21,'PROTECTIVE_EQUIPMENT','PPE Kits','kits',0,500);

-- ---------------------------------------------------------------------
-- Resources (specific assets/lines under each type)
-- ---------------------------------------------------------------------
INSERT INTO resources (resource_type_id, resource_code, name, is_consumable) VALUES
(1,'BLD-ON-01','O-Negative Blood Stock',1),(2,'IVF-01','IV Fluid Stock',1),
(3,'FAK-01','First Aid Kit Stock',1),(4,'INS-01','Insulin Stock',1),
(5,'MEAL-01','RTE Meal Stock',1),(6,'RATION-01','Dry Ration Stock',1),
(7,'WTR-01','Bottled Water Stock',1),(8,'WPT-01','Purification Tablet Stock',1),
(9,'BOAT-01','Rescue Boat Fleet A',0),(9,'BOAT-02','Rescue Boat Fleet B',0),
(10,'LJ-01','Life Jacket Stock',1),(11,'ROPE-01','Rope Kit Stock',1),
(12,'CUT-01','Hydraulic Cutter Set A',0),
(13,'AMB-01','Ambulance Fleet Central',0),(13,'AMB-02','Ambulance Fleet South',0),
(14,'FT-01','Fire Truck Fleet',0),(15,'BUS-01','Evacuation Bus Fleet',0),
(16,'FUEL-01','Diesel Reserve',1),(17,'BLK-01','Blanket Stock',1),
(18,'TENT-01','Tent Stock',1),(19,'SAT-01','Satellite Phone Pool',0),
(20,'GEN-01','Generator Pool',0),(21,'PPE-01','PPE Kit Stock',1);

-- ---------------------------------------------------------------------
-- Resource inventory (distributed across depot locations 1,2,3,4,5,6,7,8)
-- Uses subqueries to resolve resource_id by resource_code, immune to UUID ordering
-- ---------------------------------------------------------------------
INSERT INTO resource_inventory (resource_id, location_id, total_quantity, available_quantity, allocated_quantity, damaged_quantity, min_threshold, condition_status)
SELECT r.resource_id,1,300,180,100,20,50,'GOOD' FROM resources r WHERE r.resource_code='BLD-ON-01';
INSERT INTO resource_inventory (resource_id, location_id, total_quantity, available_quantity, allocated_quantity, damaged_quantity, min_threshold, condition_status)
SELECT r.resource_id,2,150,40,90,20,50,'GOOD' FROM resources r WHERE r.resource_code='BLD-ON-01';
INSERT INTO resource_inventory (resource_id, location_id, total_quantity, available_quantity, allocated_quantity, damaged_quantity, min_threshold, condition_status)
SELECT r.resource_id,1,1200,700,450,50,200,'GOOD' FROM resources r WHERE r.resource_code='IVF-01';
INSERT INTO resource_inventory (resource_id, location_id, total_quantity, available_quantity, allocated_quantity, damaged_quantity, min_threshold, condition_status)
SELECT r.resource_id,2,600,150,400,50,200,'GOOD' FROM resources r WHERE r.resource_code='IVF-01';
INSERT INTO resource_inventory (resource_id, location_id, total_quantity, available_quantity, allocated_quantity, damaged_quantity, min_threshold, condition_status)
SELECT r.resource_id,1,400,250,120,30,100,'GOOD' FROM resources r WHERE r.resource_code='FAK-01';
INSERT INTO resource_inventory (resource_id, location_id, total_quantity, available_quantity, allocated_quantity, damaged_quantity, min_threshold, condition_status)
SELECT r.resource_id,4,300,90,180,30,100,'GOOD' FROM resources r WHERE r.resource_code='FAK-01';
INSERT INTO resource_inventory (resource_id, location_id, total_quantity, available_quantity, allocated_quantity, damaged_quantity, min_threshold, condition_status)
SELECT r.resource_id,1,200,60,120,20,80,'GOOD' FROM resources r WHERE r.resource_code='INS-01';
INSERT INTO resource_inventory (resource_id, location_id, total_quantity, available_quantity, allocated_quantity, damaged_quantity, min_threshold, condition_status)
SELECT r.resource_id,2,8000,5200,2600,200,2000,'GOOD' FROM resources r WHERE r.resource_code='MEAL-01';
INSERT INTO resource_inventory (resource_id, location_id, total_quantity, available_quantity, allocated_quantity, damaged_quantity, min_threshold, condition_status)
SELECT r.resource_id,6,3000,1200,1700,100,2000,'GOOD' FROM resources r WHERE r.resource_code='MEAL-01';
INSERT INTO resource_inventory (resource_id, location_id, total_quantity, available_quantity, allocated_quantity, damaged_quantity, min_threshold, condition_status)
SELECT r.resource_id,2,1500,900,550,50,500,'GOOD' FROM resources r WHERE r.resource_code='RATION-01';
INSERT INTO resource_inventory (resource_id, location_id, total_quantity, available_quantity, allocated_quantity, damaged_quantity, min_threshold, condition_status)
SELECT r.resource_id,1,20000,12500,7000,500,5000,'GOOD' FROM resources r WHERE r.resource_code='WTR-01';
INSERT INTO resource_inventory (resource_id, location_id, total_quantity, available_quantity, allocated_quantity, damaged_quantity, min_threshold, condition_status)
SELECT r.resource_id,2,15000,3200,11500,300,5000,'GOOD' FROM resources r WHERE r.resource_code='WTR-01';
INSERT INTO resource_inventory (resource_id, location_id, total_quantity, available_quantity, allocated_quantity, damaged_quantity, min_threshold, condition_status)
SELECT r.resource_id,1,3000,1800,1100,100,1000,'GOOD' FROM resources r WHERE r.resource_code='WPT-01';
INSERT INTO resource_inventory (resource_id, location_id, total_quantity, available_quantity, allocated_quantity, damaged_quantity, min_threshold, condition_status)
SELECT r.resource_id,1,18,6,10,2,10,'GOOD' FROM resources r WHERE r.resource_code='BOAT-01';
INSERT INTO resource_inventory (resource_id, location_id, total_quantity, available_quantity, allocated_quantity, damaged_quantity, min_threshold, condition_status)
SELECT r.resource_id,2,14,4,9,1,10,'GOOD' FROM resources r WHERE r.resource_code='BOAT-02';
INSERT INTO resource_inventory (resource_id, location_id, total_quantity, available_quantity, allocated_quantity, damaged_quantity, min_threshold, condition_status)
SELECT r.resource_id,1,500,220,260,20,300,'GOOD' FROM resources r WHERE r.resource_code='LJ-01';
INSERT INTO resource_inventory (resource_id, location_id, total_quantity, available_quantity, allocated_quantity, damaged_quantity, min_threshold, condition_status)
SELECT r.resource_id,1,150,70,70,10,80,'GOOD' FROM resources r WHERE r.resource_code='ROPE-01';
INSERT INTO resource_inventory (resource_id, location_id, total_quantity, available_quantity, allocated_quantity, damaged_quantity, min_threshold, condition_status)
SELECT r.resource_id,1,20,7,11,2,15,'GOOD' FROM resources r WHERE r.resource_code='CUT-01';
INSERT INTO resource_inventory (resource_id, location_id, total_quantity, available_quantity, allocated_quantity, damaged_quantity, min_threshold, condition_status)
SELECT r.resource_id,1,25,8,15,2,10,'GOOD' FROM resources r WHERE r.resource_code='AMB-01';
INSERT INTO resource_inventory (resource_id, location_id, total_quantity, available_quantity, allocated_quantity, damaged_quantity, min_threshold, condition_status)
SELECT r.resource_id,2,18,6,11,1,10,'GOOD' FROM resources r WHERE r.resource_code='AMB-02';
INSERT INTO resource_inventory (resource_id, location_id, total_quantity, available_quantity, allocated_quantity, damaged_quantity, min_threshold, condition_status)
SELECT r.resource_id,3,12,5,6,1,8,'GOOD' FROM resources r WHERE r.resource_code='FT-01';
INSERT INTO resource_inventory (resource_id, location_id, total_quantity, available_quantity, allocated_quantity, damaged_quantity, min_threshold, condition_status)
SELECT r.resource_id,4,14,5,8,1,10,'GOOD' FROM resources r WHERE r.resource_code='BUS-01';
INSERT INTO resource_inventory (resource_id, location_id, total_quantity, available_quantity, allocated_quantity, damaged_quantity, min_threshold, condition_status)
SELECT r.resource_id,1,8000,2100,5600,300,3000,'GOOD' FROM resources r WHERE r.resource_code='FUEL-01';
INSERT INTO resource_inventory (resource_id, location_id, total_quantity, available_quantity, allocated_quantity, damaged_quantity, min_threshold, condition_status)
SELECT r.resource_id,4,2000,900,1050,50,1000,'GOOD' FROM resources r WHERE r.resource_code='BLK-01';
INSERT INTO resource_inventory (resource_id, location_id, total_quantity, available_quantity, allocated_quantity, damaged_quantity, min_threshold, condition_status)
SELECT r.resource_id,4,220,80,130,10,150,'GOOD' FROM resources r WHERE r.resource_code='TENT-01';
INSERT INTO resource_inventory (resource_id, location_id, total_quantity, available_quantity, allocated_quantity, damaged_quantity, min_threshold, condition_status)
SELECT r.resource_id,3,35,14,19,2,20,'GOOD' FROM resources r WHERE r.resource_code='SAT-01';
INSERT INTO resource_inventory (resource_id, location_id, total_quantity, available_quantity, allocated_quantity, damaged_quantity, min_threshold, condition_status)
SELECT r.resource_id,3,40,12,26,2,25,'GOOD' FROM resources r WHERE r.resource_code='GEN-01';
INSERT INTO resource_inventory (resource_id, location_id, total_quantity, available_quantity, allocated_quantity, damaged_quantity, min_threshold, condition_status)
SELECT r.resource_id,1,800,350,430,20,500,'GOOD' FROM resources r WHERE r.resource_code='PPE-01';

-- ---------------------------------------------------------------------
-- Rescue teams + personnel + team membership
-- ---------------------------------------------------------------------
INSERT INTO rescue_teams (team_id, team_code, team_name, specialization, member_count, current_location_id, availability, avg_response_minutes, equipment_json) VALUES
(1,'RT-01','Adyar Flood Response Unit','FLOOD_RESCUE',8,1,'DEPLOYED',14.5,JSON_ARRAY('boat','life jackets')),
(2,'RT-02','Velachery Medical First Response','MEDICAL',6,2,'AVAILABLE',9.2,JSON_ARRAY('first aid','stretcher')),
(3,'RT-03','T Nagar Search & Rescue','SEARCH_AND_RESCUE',10,3,'AVAILABLE',11.0,JSON_ARRAY('rope kit','thermal imaging')),
(4,'RT-04','Kotturpuram Flood Unit','FLOOD_RESCUE',7,4,'DEPLOYED',13.8,JSON_ARRAY('boat')),
(5,'RT-05','Guindy Fire & Hazmat','FIRE_RESCUE',9,14,'AVAILABLE',10.5,JSON_ARRAY('fire truck','hazmat suits')),
(6,'RT-06','Saidapet Structural Engineering Team','ENGINEERING',5,12,'DEPLOYED',16.0,JSON_ARRAY('hydraulic cutters','shoring')),
(7,'RT-07','Chromepet Flood & Evacuation','EVACUATION',8,16,'AVAILABLE',12.3,JSON_ARRAY('evacuation bus')),
(8,'RT-08','Royapuram Coastal Police Unit','POLICE',12,18,'AVAILABLE',8.7,JSON_ARRAY('patrol vehicles')),
(9,'RT-09','Anna Nagar Medical Response','MEDICAL',6,8,'AVAILABLE',9.9,JSON_ARRAY('ambulance support')),
(10,'RT-10','Tambaram Search & Rescue','SEARCH_AND_RESCUE',9,7,'OFF_DUTY',15.1,JSON_ARRAY('rope kit'));

INSERT INTO personnel (personnel_id, full_name, role, phone, is_active)
WITH RECURSIVE seq AS (SELECT 1 n UNION ALL SELECT n+1 FROM seq WHERE n < 60)
SELECT n,
    ELT((n % 12)+1,'Rajesh Kumar','Sundari Priya','Mohan Das','Kavitha Rani','Suresh Kannan','Anitha Bala',
        'Vijay Anand','Deepika Rao','Prakash Raj','Shanthi Devi','Gopal Krishnan','Uma Maheswari'),
    ELT((n % 6)+1,'Paramedic','Firefighter','Search & Rescue Specialist','Engineer','Boat Operator','Field Coordinator'),
    CONCAT('98', LPAD(n*137 % 100000, 8, '0')),
    1
FROM seq;

INSERT INTO team_members (team_id, personnel_id)
SELECT ((n-1) % 10) + 1, n FROM (
    WITH RECURSIVE seq AS (SELECT 1 n UNION ALL SELECT n+1 FROM seq WHERE n < 60) SELECT n FROM seq
) t;

-- ---------------------------------------------------------------------
-- Vehicles
-- ---------------------------------------------------------------------
INSERT INTO vehicles (vehicle_code, vehicle_type, team_id, status, current_location_id, capacity) VALUES
('AMB-11','AMBULANCE',2,'AVAILABLE',2,2),('AMB-12','AMBULANCE',2,'DEPLOYED',2,2),
('AMB-19','AMBULANCE',9,'AVAILABLE',8,2),('AMB-20','AMBULANCE',9,'AVAILABLE',8,2),
('AMB-21','AMBULANCE',6,'DEPLOYED',12,2),
('FT-01','FIRE_TRUCK',5,'AVAILABLE',14,NULL),('FT-02','FIRE_TRUCK',5,'DEPLOYED',14,NULL),
('BOAT-03','BOAT',1,'DEPLOYED',1,6),('BOAT-04','BOAT',1,'AVAILABLE',1,6),
('BOAT-05','BOAT',4,'DEPLOYED',4,6),('BOAT-06','BOAT',4,'AVAILABLE',4,6),
('TRK-01','TRUCK',7,'AVAILABLE',16,20),('TRK-02','TRUCK',7,'AVAILABLE',16,20),
('PV-01','POLICE_VAN',8,'AVAILABLE',18,8),
('BUS-07','EVACUATION_BUS',7,'AVAILABLE',16,40);

-- ---------------------------------------------------------------------
-- Hospitals
-- ---------------------------------------------------------------------
INSERT INTO hospitals (hospital_code, name, location_id, emergency_contact, total_beds, available_beds, icu_beds, available_icu_beds, emergency_capacity, current_ed_patients, blood_supply_level, medical_supply_level) VALUES
('H-01','Adyar General Hospital',1,'044-24400001',220,38,24,3,30,22,'LOW','ADEQUATE'),
('H-02','Velachery Community Hospital',2,'044-24400002',180,12,18,1,25,24,'CRITICAL','LOW'),
('H-03','T Nagar Multi-Specialty Hospital',3,'044-24400003',350,64,40,8,45,30,'ADEQUATE','ADEQUATE'),
('H-04','Kotturpuram Government Hospital',4,'044-24400004',260,20,22,2,35,33,'LOW','LOW'),
('H-05','Mylapore Medical Centre',5,'044-24400005',150,55,12,6,20,10,'ADEQUATE','ADEQUATE'),
('H-06','Perambur District Hospital',6,'044-24400006',200,80,16,9,28,12,'SURPLUS','ADEQUATE'),
('H-07','Tambaram General Hospital',7,'044-24400007',240,95,20,11,30,9,'ADEQUATE','ADEQUATE'),
('H-08','Anna Nagar Speciality Hospital',8,'044-24400008',300,110,26,14,40,15,'ADEQUATE','SURPLUS'),
('H-09','Sholinganallur Trauma Centre',9,'044-24400009',170,25,15,2,22,20,'LOW','ADEQUATE'),
('H-10','Guindy ESI Hospital',14,'044-24400010',210,70,18,7,26,14,'ADEQUATE','ADEQUATE');

-- ---------------------------------------------------------------------
-- Shelters
-- ---------------------------------------------------------------------
INSERT INTO shelters (shelter_code, name, location_id, max_capacity, current_occupancy, food_supply_level, water_supply_level, has_medical_support, is_accessible, emergency_contact) VALUES
('S-01','Adyar Government School Relief Camp',1,600,540,'LOW','LOW',1,1,'044-25500001'),
('S-02','Velachery Community Hall Shelter',2,800,623,'ADEQUATE','ADEQUATE',1,1,'044-25500002'),
('S-03','T Nagar Marriage Hall Shelter',3,500,180,'SURPLUS','ADEQUATE',0,1,'044-25500003'),
('S-04','Kotturpuram Municipal Shelter',4,450,410,'CRITICAL','LOW',1,0,'044-25500004'),
('S-05','Mylapore Temple Grounds Camp',5,350,120,'ADEQUATE','ADEQUATE',0,1,'044-25500005'),
('S-06','Perambur Sports Complex Shelter',6,700,90,'SURPLUS','SURPLUS',1,1,'044-25500006'),
('S-07','Tambaram College Shelter',7,900,780,'LOW','ADEQUATE',1,1,'044-25500007'),
('S-08','Anna Nagar Stadium Shelter',8,1000,260,'ADEQUATE','ADEQUATE',1,1,'044-25500008'),
('S-09','Chromepet Community Centre',16,400,150,'ADEQUATE','LOW',0,1,'044-25500009'),
('S-10','Saidapet Relief Shelter',12,300,285,'CRITICAL','CRITICAL',1,0,'044-25500010');

-- ---------------------------------------------------------------------
-- Suppliers + a few scheduled deliveries
-- ---------------------------------------------------------------------
INSERT INTO suppliers (supplier_id, name, contact_phone, category) VALUES
(1,'TN Medical Supplies Co.','044-28800001','MEDICAL'),
(2,'Chennai Bottled Water Ltd','044-28800002','WATER'),
(3,'Southern Rations Distributors','044-28800003','FOOD'),
(4,'CoastalGear Rescue Equipment','044-28800004','EQUIPMENT'),
(5,'IOC Fuel Depot - Guindy','044-28800005','FUEL'),
(6,'Metro Emergency Equipment Pvt Ltd','044-28800006','EQUIPMENT'),
(7,'RedCross Regional Medical Bank','044-28800007','MEDICAL'),
(8,'Chennai Municipal Ration Stores','044-28800008','FOOD');

INSERT INTO supply_deliveries (supplier_id, inventory_id, quantity, status, scheduled_at, delivered_at) VALUES
(1,1,80,'DELIVERED', NOW() - INTERVAL 2 DAY, NOW() - INTERVAL 2 DAY + INTERVAL 3 HOUR),
(2,11,5000,'IN_TRANSIT', NOW() + INTERVAL 4 HOUR, NULL),
(3,8,1500,'SCHEDULED', NOW() + INTERVAL 8 HOUR, NULL),
(7,1,60,'IN_TRANSIT', NOW() + INTERVAL 2 HOUR, NULL),
(5,22,4000,'SCHEDULED', NOW() + INTERVAL 6 HOUR, NULL);

-- ---------------------------------------------------------------------
-- Volunteers
-- ---------------------------------------------------------------------
INSERT INTO volunteers (full_name, phone, skills, is_active)
WITH RECURSIVE seq AS (SELECT 1 n UNION ALL SELECT n+1 FROM seq WHERE n < 40)
SELECT
    ELT((n % 10)+1,'Harini S','Bala Murugan','Swetha R','Dinesh Kumar','Pavithra M','Naveen S',
        'Keerthana V','Arun Prasad','Sowmya K','Vishal Raghavan'),
    CONCAT('97',LPAD(n*271 % 100000,8,'0')),
    ELT((n % 5)+1,'First Aid','Cooking','Logistics','Translation','Boat Handling'),
    1
FROM seq;

SET FOREIGN_KEY_CHECKS = 1;
