USE urbanresq;

UPDATE users SET phone = '+910000000099' WHERE email = 'coord@urbanresq.local';

INSERT INTO personnel (team_id, full_name, role, skills, phone) VALUES
(1,'Crew Member A1','Team lead','Swift-water rescue','+910000000011'),
(1,'Crew Member A2','Boat operator','Boat handling','+910000000012'),
(2,'Crew Member B1','Team lead','USAR, Fire fighting','+910000000021');

INSERT INTO shelter_history (shelter_id, occupancy, recorded_at) VALUES
(1,300,NOW() - INTERVAL 4 DAY),(1,420,NOW() - INTERVAL 3 DAY),(1,500,NOW() - INTERVAL 2 DAY),(1,540,NOW() - INTERVAL 1 DAY),
(2,40,NOW() - INTERVAL 4 DAY),(2,80,NOW() - INTERVAL 2 DAY),(2,120,NOW() - INTERVAL 1 DAY),
(3,200,NOW() - INTERVAL 4 DAY),(3,380,NOW() - INTERVAL 2 DAY),(3,430,NOW() - INTERVAL 1 DAY);
