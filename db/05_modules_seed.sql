USE urbanresq;

INSERT INTO rescue_teams (team_id, name, specialty, certifications, members, base_area_id, status) VALUES
(1,'Alpha Water Rescue','Flood / swift water','Swift-water rescue, First responder',8,4,'available'),
(2,'Bravo Fire & Collapse','Fire, structural collapse','Fire fighter L2, USAR',10,2,'available'),
(3,'Charlie Medical','Field medicine','Paramedic, Trauma care',6,3,'available'),
(4,'Delta Hazmat','Industrial / gas','Hazmat technician',5,3,'off_duty');

INSERT INTO volunteers (volunteer_id, full_name, phone, skills, is_available) VALUES
(1,'Volunteer One','+91-0000000001','First aid, Marathi',TRUE),
(2,'Volunteer Two','+91-0000000002','Driving, Logistics',TRUE),
(3,'Volunteer Three','+91-0000000003','Cooking, Crowd control',TRUE),
(4,'Volunteer Four','+91-0000000004','Boat handling',FALSE);

INSERT INTO hospitals (hospital_id, name, area_id, lat, lng, beds_total, beds_available, ambulances_available, er_status) VALUES
(1,'Sample General Hospital',3,19.040500,72.863000,400,86,6,'busy'),
(2,'Sample Harbour Clinic',4,19.050000,72.898000,120,40,2,'open'),
(3,'Sample North Medical Centre',1,19.075000,72.880000,250,12,3,'diverted');

INSERT INTO shelters (shelter_id, name, area_id, lat, lng, capacity, occupancy, needs) VALUES
(1,'Municipal School Shelter A',1,19.070000,72.885000,600,540,'Drinking water, blankets'),
(2,'Community Hall Shelter B',4,19.054000,72.903000,300,120,'Food packets'),
(3,'Sports Ground Shelter C',2,19.045000,72.858000,450,430,'Medical supplies, tents');
