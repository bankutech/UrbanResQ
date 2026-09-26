-- =====================================================================
-- URBANRESQ — sample_queries.sql
-- Reference queries used by the "Database Intelligence" page and by
-- analytics endpoints. Each is a real, runnable query against the seeded
-- schema — nothing here is illustrative pseudocode.
-- =====================================================================
USE urbanresq;

-- 1. Top unresolved emergency requests by disaster zone (window function: RANK)
SELECT request_id, zone_id, category, urgency, computed_priority_score, rank_in_zone
FROM vw_emergency_request_priority
WHERE rank_in_zone <= 3
ORDER BY zone_id, rank_in_zone;

-- 2. Most heavily utilized resources (ranked)
SELECT resource_type_name, category, utilization_pct, utilization_rank
FROM vw_resource_utilization
ORDER BY utilization_rank
LIMIT 10;

-- 3. Hospital occupancy ranking
SELECT hospital_code, name, occupancy_pct, icu_occupancy_pct, occupancy_rank
FROM vw_hospital_capacity
ORDER BY occupancy_rank;

-- 4. Shelter capacity ranking
SELECT shelter_code, name, occupancy_pct, available_capacity, occupancy_rank
FROM vw_shelter_capacity
ORDER BY occupancy_rank;

-- 5. Average / median / p90 response time by disaster
SELECT d.title, rp.avg_response_minutes, rp.median_response_minutes, rp.p90_response_minutes
FROM vw_response_performance rp
JOIN disasters d ON d.disaster_id = rp.disaster_id;

-- 6. Resource shortages by category, with affected request counts
SELECT category, resource_type_name, deficit, severity, affected_requests
FROM vw_resource_shortages
ORDER BY deficit DESC;

-- 7. Top critical incidents (city-wide, across all active disasters)
SELECT er.request_id, d.title AS disaster, er.category, er.people_affected,
       fn_request_priority_score(er.request_id) AS priority_score
FROM emergency_requests er
JOIN disasters d ON d.disaster_id = er.disaster_id
WHERE er.urgency = 'CRITICAL' AND er.status NOT IN ('RESOLVED','CANCELLED')
ORDER BY priority_score DESC
LIMIT 10;

-- 8. Resource utilization percentage per depot location
SELECT location_label, resource_type_name,
       ROUND(100 * allocated_quantity / NULLIF(total_quantity,0), 1) AS utilization_pct
FROM vw_available_resources
ORDER BY utilization_pct DESC
LIMIT 15;

-- 9. Daily emergency volume — CTE + recursive date spine so days with
--    ZERO requests still show up as 0 (not missing) on the trend chart.
WITH RECURSIVE date_spine AS (
    SELECT CURDATE() - INTERVAL 13 DAY AS d
    UNION ALL
    SELECT d + INTERVAL 1 DAY FROM date_spine WHERE d < CURDATE()
),
daily_counts AS (
    SELECT DATE(created_at) AS d, COUNT(*) AS request_count
    FROM emergency_requests
    GROUP BY DATE(created_at)
)
SELECT ds.d AS day, COALESCE(dc.request_count, 0) AS request_count
FROM date_spine ds
LEFT JOIN daily_counts dc ON dc.d = ds.d
ORDER BY ds.d;

-- 10. Ranked resource allocation candidates for a given request (example: request 1)
--     Demonstrates the same scoring logic used inside sp_generate_resource_allocation_plan,
--     exposed read-only for the Allocation screen's "recommendation" preview.
SELECT
    ri.inventory_id,
    rt.name AS resource_type_name,
    l.label AS depot,
    ri.available_quantity,
    fn_haversine_km(er.latitude_lookup, er.longitude_lookup, l.latitude, l.longitude) AS distance_km,
    ROUND(
        fn_request_priority_score(er.request_id)
        + (CASE WHEN rt.is_critical THEN 10 ELSE 0 END)
        - LEAST(fn_haversine_km(er.latitude_lookup, er.longitude_lookup, l.latitude, l.longitude) * 0.5, 20)
    , 2) AS allocation_score
FROM (
    SELECT er.request_id, loc.latitude AS latitude_lookup, loc.longitude AS longitude_lookup
    FROM emergency_requests er JOIN locations loc ON loc.location_id = er.location_id
    WHERE er.request_id = 1
) er
JOIN resource_inventory ri ON ri.available_quantity > 0
JOIN resources r ON r.resource_id = ri.resource_id
JOIN resource_types rt ON rt.resource_type_id = r.resource_type_id
JOIN locations l ON l.location_id = ri.location_id
ORDER BY allocation_score DESC
LIMIT 5;

-- 11. Correlated subquery example: requests that have NO allocation yet
--     despite being CRITICAL and older than 15 minutes (used by alerting).
SELECT er.request_id, er.category, er.people_affected, er.created_at
FROM emergency_requests er
WHERE er.urgency = 'CRITICAL'
  AND er.status NOT IN ('RESOLVED','CANCELLED')
  AND er.created_at < NOW() - INTERVAL 15 MINUTE
  AND NOT EXISTS (
      SELECT 1 FROM resource_allocations ra
      WHERE ra.request_id = er.request_id AND ra.status <> 'CANCELLED'
  );

-- 12. Disaster severity distribution (GROUP BY + CASE)
SELECT
    severity,
    COUNT(*) AS disaster_count,
    SUM(affected_population) AS total_affected,
    SUM(CASE WHEN status = 'ACTIVE' THEN 1 ELSE 0 END) AS active_count
FROM disasters
GROUP BY severity
ORDER BY FIELD(severity, 'CRITICAL','HIGH','MODERATE','LOW');

-- 13. Requests by geographic zone with HAVING (zones with >5 unresolved requests)
SELECT zone_id, COUNT(*) AS unresolved_count
FROM emergency_requests
WHERE status NOT IN ('RESOLVED','CANCELLED')
GROUP BY zone_id
HAVING COUNT(*) > 5
ORDER BY unresolved_count DESC;

-- 14. FULLTEXT search example — search requests + disasters by keyword
SELECT request_id, description, MATCH(description) AGAINST ('rescue trapped water' IN NATURAL LANGUAGE MODE) AS relevance
FROM emergency_requests
WHERE MATCH(description) AGAINST ('rescue trapped water' IN NATURAL LANGUAGE MODE)
ORDER BY relevance DESC;

-- 15. Transaction example (also implemented in sp_admit_patient):
-- START TRANSACTION;
--   SELECT available_beds FROM hospitals WHERE hospital_id = 3 FOR UPDATE;
--   UPDATE hospitals SET available_beds = available_beds - 1 WHERE hospital_id = 3;
--   INSERT INTO hospital_admissions (...) VALUES (...);
-- COMMIT;
