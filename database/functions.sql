-- =====================================================================
-- URBANRESQ — functions.sql
-- Reusable scalar functions used by procedures, views, and ad-hoc queries.
-- =====================================================================
USE urbanresq;

DELIMITER $$

-- ---------------------------------------------------------------------
-- fn_haversine_km(lat1, lon1, lat2, lon2)
-- Great-circle distance in kilometres. Used for distance_penalty in the
-- allocation score and for "nearest resource" queries.
-- ---------------------------------------------------------------------
DROP FUNCTION IF EXISTS fn_haversine_km$$
CREATE FUNCTION fn_haversine_km(
    lat1 DECIMAL(9,6), lon1 DECIMAL(9,6),
    lat2 DECIMAL(9,6), lon2 DECIMAL(9,6)
) RETURNS DECIMAL(8,2)
DETERMINISTIC
NO SQL
BEGIN
    DECLARE r DECIMAL(9,4) DEFAULT 6371.0;
    DECLARE dlat DECIMAL(12,8);
    DECLARE dlon DECIMAL(12,8);
    DECLARE a DECIMAL(20,15);
    DECLARE c DECIMAL(20,15);

    SET dlat = RADIANS(lat2 - lat1);
    SET dlon = RADIANS(lon2 - lon1);
    SET a = SIN(dlat/2) * SIN(dlat/2) +
            COS(RADIANS(lat1)) * COS(RADIANS(lat2)) * SIN(dlon/2) * SIN(dlon/2);
    SET c = 2 * ATAN2(SQRT(a), SQRT(1-a));
    RETURN ROUND(r * c, 2);
END$$

-- ---------------------------------------------------------------------
-- fn_request_priority_score(request_id)
-- Recomputes the transparent priority score for a single request.
-- Mirrors the logic in vw_emergency_request_priority so the allocation
-- procedure can call it directly without re-selecting from the view.
-- ---------------------------------------------------------------------
DROP FUNCTION IF EXISTS fn_request_priority_score$$
CREATE FUNCTION fn_request_priority_score(p_request_id VARCHAR(36)) RETURNS DECIMAL(6,2)
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE v_urgency VARCHAR(10);
    DECLARE v_people INT;
    DECLARE v_vulnerable INT;
    DECLARE v_category VARCHAR(20);
    DECLARE v_waiting_minutes INT;
    DECLARE v_score DECIMAL(6,2);

    SELECT urgency, people_affected, vulnerable_count, category,
           TIMESTAMPDIFF(MINUTE, created_at, NOW())
      INTO v_urgency, v_people, v_vulnerable, v_category, v_waiting_minutes
      FROM emergency_requests
     WHERE request_id = p_request_id;

    SET v_score =
        (CASE v_urgency WHEN 'CRITICAL' THEN 40 WHEN 'HIGH' THEN 28 WHEN 'MEDIUM' THEN 14 ELSE 5 END)
        + LEAST(v_people * 1.2, 25)
        + LEAST(v_waiting_minutes * 0.4, 20)
        + LEAST(v_vulnerable * 3, 15)
        + (CASE WHEN v_category IN ('MEDICAL','RESCUE') THEN 10 ELSE 3 END);

    RETURN ROUND(v_score, 2);
END$$

-- ---------------------------------------------------------------------
-- fn_stock_status(available, threshold)
-- Shared thresholding logic used by inventory dashboards.
-- ---------------------------------------------------------------------
DROP FUNCTION IF EXISTS fn_stock_status$$
CREATE FUNCTION fn_stock_status(p_available DECIMAL(12,2), p_threshold DECIMAL(12,2)) RETURNS VARCHAR(10)
DETERMINISTIC
NO SQL
BEGIN
    IF p_threshold <= 0 THEN
        RETURN 'NORMAL';
    ELSEIF p_available <= p_threshold * 0.5 THEN
        RETURN 'CRITICAL';
    ELSEIF p_available <= p_threshold THEN
        RETURN 'WARNING';
    ELSE
        RETURN 'NORMAL';
    END IF;
END$$

DELIMITER ;
