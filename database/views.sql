-- =====================================================================
-- URBANRESQ — views.sql
-- Analytical views backing the dashboard, command center, and reports.
-- Every dashboard number in the frontend traces back to one of these.
-- =====================================================================
USE urbanresq;

-- ---------------------------------------------------------------------
-- vw_active_disaster_summary
-- One row per active/reported disaster with live derived counts.
-- ---------------------------------------------------------------------
CREATE OR REPLACE VIEW vw_active_disaster_summary AS
SELECT
    d.disaster_id,
    d.title,
    d.disaster_type,
    d.severity,
    d.status,
    d.affected_population,
    d.latitude,
    d.longitude,
    d.start_time,
    COUNT(DISTINCT z.zone_id)                                            AS zone_count,
    COUNT(DISTINCT er.request_id)                                        AS total_requests,
    COUNT(DISTINCT CASE WHEN er.status NOT IN ('RESOLVED','CANCELLED') THEN er.request_id END) AS unresolved_requests,
    COUNT(DISTINCT CASE WHEN er.urgency = 'CRITICAL' AND er.status NOT IN ('RESOLVED','CANCELLED') THEN er.request_id END) AS critical_requests
FROM disasters d
LEFT JOIN disaster_zones z ON z.disaster_id = d.disaster_id
LEFT JOIN emergency_requests er ON er.disaster_id = d.disaster_id
WHERE d.status IN ('REPORTED','ACTIVE','CONTAINED')
GROUP BY d.disaster_id, d.title, d.disaster_type, d.severity, d.status,
         d.affected_population, d.latitude, d.longitude, d.start_time;

-- ---------------------------------------------------------------------
-- vw_emergency_request_priority
-- Live, transparent priority score with the ranking of each request
-- WITHIN its own disaster zone (window function), plus explanation
-- fields the UI reads directly to show "why this score".
-- ---------------------------------------------------------------------
CREATE OR REPLACE VIEW vw_emergency_request_priority AS
SELECT
    er.request_id,
    er.disaster_id,
    er.zone_id,
    er.category,
    er.urgency,
    er.status,
    er.people_affected,
    er.vulnerable_count,
    er.created_at,
    TIMESTAMPDIFF(MINUTE, er.created_at, NOW())                           AS waiting_minutes,
    -- component weights, transparent and documented:
    (CASE er.urgency WHEN 'CRITICAL' THEN 40 WHEN 'HIGH' THEN 28 WHEN 'MEDIUM' THEN 14 ELSE 5 END) AS severity_weight,
    LEAST(er.people_affected * 1.2, 25)                                    AS population_weight,
    LEAST(TIMESTAMPDIFF(MINUTE, er.created_at, NOW()) * 0.4, 20)            AS waiting_weight,
    LEAST(er.vulnerable_count * 3, 15)                                       AS vulnerable_weight,
    (CASE WHEN er.category IN ('MEDICAL','RESCUE') THEN 10 ELSE 3 END)        AS category_criticality_weight,
    ROUND(
        (CASE er.urgency WHEN 'CRITICAL' THEN 40 WHEN 'HIGH' THEN 28 WHEN 'MEDIUM' THEN 14 ELSE 5 END)
        + LEAST(er.people_affected * 1.2, 25)
        + LEAST(TIMESTAMPDIFF(MINUTE, er.created_at, NOW()) * 0.4, 20)
        + LEAST(er.vulnerable_count * 3, 15)
        + (CASE WHEN er.category IN ('MEDICAL','RESCUE') THEN 10 ELSE 3 END)
    , 2) AS computed_priority_score,
    RANK() OVER (
        PARTITION BY er.zone_id
        ORDER BY (
            (CASE er.urgency WHEN 'CRITICAL' THEN 40 WHEN 'HIGH' THEN 28 WHEN 'MEDIUM' THEN 14 ELSE 5 END)
            + LEAST(er.people_affected * 1.2, 25)
            + LEAST(TIMESTAMPDIFF(MINUTE, er.created_at, NOW()) * 0.4, 20)
            + LEAST(er.vulnerable_count * 3, 15)
            + (CASE WHEN er.category IN ('MEDICAL','RESCUE') THEN 10 ELSE 3 END)
        ) DESC
    ) AS rank_in_zone,
    (SELECT COUNT(*) FROM resource_allocations ra WHERE ra.request_id = er.request_id
        AND ra.status NOT IN ('CANCELLED')) AS allocation_count
FROM emergency_requests er
WHERE er.status NOT IN ('RESOLVED','CANCELLED');

-- ---------------------------------------------------------------------
-- vw_available_resources
-- Aggregated available inventory per resource type + location.
-- ---------------------------------------------------------------------
CREATE OR REPLACE VIEW vw_available_resources AS
SELECT
    rt.resource_type_id,
    rt.category,
    rt.name              AS resource_type_name,
    rt.unit,
    rt.is_critical,
    ri.location_id,
    l.zone_name,
    l.label               AS location_label,
    SUM(ri.available_quantity) AS available_quantity,
    SUM(ri.allocated_quantity) AS allocated_quantity,
    SUM(ri.total_quantity)     AS total_quantity,
    SUM(ri.min_threshold)      AS min_threshold,
    CASE
        WHEN SUM(ri.available_quantity) <= SUM(ri.min_threshold) * 0.5 THEN 'CRITICAL'
        WHEN SUM(ri.available_quantity) <= SUM(ri.min_threshold) THEN 'WARNING'
        ELSE 'NORMAL'
    END AS stock_status
FROM resource_types rt
JOIN resources r ON r.resource_type_id = rt.resource_type_id
JOIN resource_inventory ri ON ri.resource_id = r.resource_id
JOIN locations l ON l.location_id = ri.location_id
GROUP BY rt.resource_type_id, rt.category, rt.name, rt.unit, rt.is_critical,
         ri.location_id, l.zone_name, l.label;

-- ---------------------------------------------------------------------
-- vw_resource_utilization
-- Utilization % per resource type across the whole city, ranked.
-- ---------------------------------------------------------------------
CREATE OR REPLACE VIEW vw_resource_utilization AS
SELECT
    rt.resource_type_id,
    rt.category,
    rt.name AS resource_type_name,
    SUM(ri.total_quantity)     AS total_quantity,
    SUM(ri.allocated_quantity) AS allocated_quantity,
    ROUND(100 * SUM(ri.allocated_quantity) / NULLIF(SUM(ri.total_quantity),0), 1) AS utilization_pct,
    RANK() OVER (ORDER BY SUM(ri.allocated_quantity) / NULLIF(SUM(ri.total_quantity),0) DESC) AS utilization_rank
FROM resource_types rt
JOIN resources r ON r.resource_type_id = rt.resource_type_id
JOIN resource_inventory ri ON ri.resource_id = r.resource_id
GROUP BY rt.resource_type_id, rt.category, rt.name;

-- ---------------------------------------------------------------------
-- vw_hospital_capacity
-- ---------------------------------------------------------------------
CREATE OR REPLACE VIEW vw_hospital_capacity AS
SELECT
    h.hospital_id, h.hospital_code, h.name, l.zone_name,
    h.total_beds, h.available_beds,
    ROUND(100 * (h.total_beds - h.available_beds) / NULLIF(h.total_beds,0), 1) AS occupancy_pct,
    h.icu_beds, h.available_icu_beds,
    ROUND(100 * (h.icu_beds - h.available_icu_beds) / NULLIF(h.icu_beds,0), 1)  AS icu_occupancy_pct,
    h.emergency_capacity, h.current_ed_patients,
    h.blood_supply_level, h.medical_supply_level,
    RANK() OVER (ORDER BY (h.total_beds - h.available_beds) / NULLIF(h.total_beds,0) DESC) AS occupancy_rank
FROM hospitals h
JOIN locations l ON l.location_id = h.location_id;

-- ---------------------------------------------------------------------
-- vw_shelter_capacity
-- ---------------------------------------------------------------------
CREATE OR REPLACE VIEW vw_shelter_capacity AS
SELECT
    s.shelter_id, s.shelter_code, s.name, l.zone_name,
    s.max_capacity, s.current_occupancy,
    (s.max_capacity - s.current_occupancy) AS available_capacity,
    ROUND(100 * s.current_occupancy / NULLIF(s.max_capacity,0), 1) AS occupancy_pct,
    s.food_supply_level, s.water_supply_level, s.has_medical_support,
    RANK() OVER (ORDER BY s.current_occupancy / NULLIF(s.max_capacity,0) DESC) AS occupancy_rank
FROM shelters s
JOIN locations l ON l.location_id = s.location_id;

-- ---------------------------------------------------------------------
-- vw_resource_shortages — open shortages joined to human-readable names
-- ---------------------------------------------------------------------
CREATE OR REPLACE VIEW vw_resource_shortages AS
SELECT
    rs.shortage_id, rt.category, rt.name AS resource_type_name,
    l.zone_name, l.label AS location_label,
    rs.required_quantity, rs.available_quantity, rs.deficit,
    rs.severity, rs.status, rs.detected_at,
    (SELECT COUNT(*) FROM emergency_requests er
        WHERE er.status NOT IN ('RESOLVED','CANCELLED')
        AND JSON_CONTAINS(er.required_resources_json, JSON_OBJECT('resource_type_id', rt.resource_type_id), '$')
    ) AS affected_requests
FROM resource_shortages rs
JOIN resource_types rt ON rt.resource_type_id = rs.resource_type_id
LEFT JOIN locations l ON l.location_id = rs.location_id
WHERE rs.status = 'OPEN';

-- ---------------------------------------------------------------------
-- vw_disaster_impact — combined human + resource impact per disaster
-- ---------------------------------------------------------------------
CREATE OR REPLACE VIEW vw_disaster_impact AS
SELECT
    d.disaster_id, d.title, d.disaster_type, d.severity, d.status,
    d.affected_population, d.estimated_damage,
    (SELECT COUNT(*) FROM emergency_requests er
       WHERE er.disaster_id = d.disaster_id) AS total_requests,
    (SELECT COUNT(*) FROM emergency_requests er
       WHERE er.disaster_id = d.disaster_id AND er.status = 'RESOLVED') AS resolved_requests,
    (SELECT COUNT(*) FROM resource_allocations ra
       JOIN emergency_requests er ON er.request_id = ra.request_id
       WHERE er.disaster_id = d.disaster_id) AS total_allocations,
    (SELECT COUNT(*) FROM hospital_admissions ha
       JOIN emergency_requests er ON er.request_id = ha.request_id
       WHERE er.disaster_id = d.disaster_id) AS hospital_admissions,
    (SELECT COUNT(*) FROM shelter_residents sr
       JOIN shelters s ON s.shelter_id = sr.shelter_id
       JOIN disaster_zones dz ON dz.location_id = s.location_id
       WHERE dz.disaster_id = d.disaster_id) AS shelter_residents
FROM disasters d;

-- ---------------------------------------------------------------------
-- vw_response_performance — response time percentiles per disaster
-- Uses first allocation timestamp as "response time" proxy.
-- ---------------------------------------------------------------------
CREATE OR REPLACE VIEW vw_response_performance AS
WITH first_allocation AS (
    SELECT
        er.request_id,
        er.disaster_id,
        er.created_at AS requested_at,
        MIN(ra.created_at) AS first_allocated_at
    FROM emergency_requests er
    JOIN resource_allocations ra ON ra.request_id = er.request_id
    GROUP BY er.request_id, er.disaster_id, er.created_at
),
response_times AS (
    SELECT
        disaster_id,
        request_id,
        TIMESTAMPDIFF(MINUTE, requested_at, first_allocated_at) AS response_minutes,
        PERCENT_RANK() OVER (PARTITION BY disaster_id ORDER BY TIMESTAMPDIFF(MINUTE, requested_at, first_allocated_at)) AS pctile
    FROM first_allocation
)
SELECT
    disaster_id,
    COUNT(*) AS measured_requests,
    ROUND(AVG(response_minutes), 1) AS avg_response_minutes,
    MAX(CASE WHEN pctile <= 0.5 THEN response_minutes END) AS median_response_minutes,
    MAX(CASE WHEN pctile <= 0.9 THEN response_minutes END) AS p90_response_minutes
FROM response_times
GROUP BY disaster_id;

-- ---------------------------------------------------------------------
-- vw_city_emergency_status — single-row "state of the city" summary
-- for the top dashboard stat cards.
-- ---------------------------------------------------------------------
CREATE OR REPLACE VIEW vw_city_emergency_status AS
SELECT
    (SELECT COUNT(*) FROM disasters WHERE status IN ('REPORTED','ACTIVE')) AS active_disasters,
    (SELECT COUNT(*) FROM emergency_requests WHERE urgency = 'CRITICAL' AND status NOT IN ('RESOLVED','CANCELLED')) AS critical_incidents,
    (SELECT COALESCE(SUM(affected_population),0) FROM disasters WHERE status IN ('REPORTED','ACTIVE')) AS people_affected,
    (SELECT COUNT(*) FROM resource_inventory WHERE available_quantity > 0) AS resource_lines_available,
    (SELECT COUNT(*) FROM rescue_teams WHERE availability = 'AVAILABLE') AS available_rescue_teams,
    (SELECT COUNT(*) FROM rescue_teams WHERE availability = 'DEPLOYED') AS deployed_rescue_teams,
    (SELECT ROUND(100 * SUM(total_beds - available_beds) / NULLIF(SUM(total_beds),0),1) FROM hospitals) AS hospital_occupancy_pct,
    (SELECT ROUND(100 * SUM(current_occupancy) / NULLIF(SUM(max_capacity),0),1) FROM shelters) AS shelter_occupancy_pct,
    (SELECT COUNT(*) FROM emergency_requests WHERE status NOT IN ('RESOLVED','CANCELLED')) AS unresolved_requests,
    (SELECT COUNT(*) FROM resource_shortages WHERE status = 'OPEN' AND severity = 'CRITICAL') AS critical_shortages;
