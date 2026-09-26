USE urbanresq;

INSERT INTO roles (role_id, name) VALUES (1,'admin'),(2,'coordinator'),(3,'field_team');

INSERT INTO users (user_id, role_id, full_name, email, password_hash) VALUES
(1,1,'Seed Admin','admin@urbanresq.local','!locked'),
(2,2,'Seed Coordinator','coord@urbanresq.local','!locked'),
(3,3,'Seed Field Lead','field@urbanresq.local','!locked');

INSERT INTO areas (area_id, name, district, lat, lng, population, risk_level) VALUES
(1,'Kurla East','Mumbai',19.072800,72.882600,210000,'high'),
(2,'Dharavi Sector 3','Mumbai',19.043000,72.855300,95000,'high'),
(3,'Sion Link','Mumbai',19.039000,72.861900,120000,'moderate'),
(4,'Chembur Docks','Mumbai',19.052200,72.900500,140000,'high'),
(5,'Govandi','Mumbai',19.055300,72.915800,160000,'moderate'),
(6,'Mankhurd','Mumbai',19.048000,72.932000,110000,'moderate');

INSERT INTO incidents (incident_id, code, kind, severity, status, priority, area_id, lat, lng, affected_pop, commander_id, reported_by, description) VALUES
(1,'INC-2026-001','flood','critical','responding',5,1,19.0728,72.8826,12400,2,3,'Creek overflow, low-lying blocks submerged'),
(2,'INC-2026-002','fire','high','responding',4,2,19.0430,72.8553,3100,2,3,'Warehouse cluster fire'),
(3,'INC-2026-003','industrial','moderate','verified',3,3,19.0390,72.8619,6800,NULL,3,'Gas leak at a processing unit'),
(4,'INC-2026-004','flood','high','responding',4,4,19.0522,72.9005,9200,2,3,'Dock-side flooding'),
(5,'INC-2026-005','cyclone','moderate','reported',2,5,19.0553,72.9158,5200,NULL,3,'Cyclone outer band, roof damage'),
(6,'INC-2026-006','landslide','moderate','reported',3,6,19.0480,72.9320,1700,NULL,3,'Hillside slip near a settlement');

INSERT INTO incident_timeline (incident_id, user_id, event) VALUES
(1,3,'Reported by field team'),(1,2,'Commander assigned'),(4,3,'Reported by field team');

INSERT INTO resource_categories (category_id, name) VALUES
(1,'Food'),(2,'Water'),(3,'Medical'),(4,'Vehicles'),(5,'Rescue gear'),(6,'Shelter');

INSERT INTO resources (resource_id, category_id, name, unit, is_perishable) VALUES
(1,1,'Food packets','pack',TRUE),(2,1,'Dry ration kits','kit',FALSE),(3,2,'Drinking water','litre',TRUE),
(4,3,'First-aid kits','kit',FALSE),(5,3,'Essential medicines','box',TRUE),(6,4,'Ambulances','vehicle',FALSE),
(7,5,'Rescue boats','boat',FALSE),(8,5,'Life jackets','piece',FALSE),(9,6,'Tents','tent',FALSE),
(10,6,'Blankets','piece',FALSE),(11,6,'Emergency kits','kit',FALSE);

INSERT INTO warehouses (warehouse_id, name, area_id, lat, lng) VALUES
(1,'Central Depot',3,19.0390,72.8619),(2,'Harbour Depot',4,19.0522,72.9005),(3,'North Depot',2,19.0430,72.8553);

INSERT INTO stock_batches (warehouse_id, resource_id, batch_no, expiry_date, qty) VALUES
(1,3,'W-A','2027-01-15',3000),(1,3,'W-B','2027-06-01',5000),
(1,1,'F-OLD','2026-09-01',500),(1,1,'F-A','2026-12-20',600),(1,1,'F-B','2027-02-10',800),
(1,7,'B-1',NULL,3),(1,8,'LJ-1',NULL,150),(1,10,'BL-1',NULL,300),
(1,4,'FA-1','2028-01-01',60),(1,9,'T-1',NULL,25),(1,5,'M-1','2027-04-01',20),
(2,3,'W-C','2027-03-01',4000),(2,7,'B-2',NULL,5),(2,10,'BL-2',NULL,150),
(2,1,'F-C','2027-01-05',700),(2,8,'LJ-2',NULL,60),
(3,4,'FA-2','2028-02-01',30),(3,5,'M-2','2027-05-01',25),(3,9,'T-2',NULL,15);

INSERT INTO stock_thresholds (warehouse_id, resource_id, min_qty) VALUES
(1,3,2000),(1,1,500),(2,7,3),(3,4,40),(3,9,20);

INSERT INTO resource_requests (request_id, incident_id, area_id, requested_by, priority, status, decided_by, decided_at, decision_note) VALUES
(1,1,1,3,'critical','approved',2,NOW(),'Approved, flood response'),
(2,4,4,3,'high','approved',2,NOW(),'Approved'),
(3,2,2,3,'high','pending',NULL,NULL,NULL),
(4,3,3,3,'medium','pending',NULL,NULL,NULL);

INSERT INTO resource_request_items (request_id, resource_id, qty_requested) VALUES
(1,3,4000),(1,1,800),(1,7,6),(1,8,100),
(2,3,3000),(2,7,5),(2,10,200),
(3,4,40),(3,9,20),
(4,5,30);
