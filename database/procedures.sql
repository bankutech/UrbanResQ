USE urbanresq;

DELIMITER $$

DROP PROCEDURE IF EXISTS sp_generate_resource_allocation_plan$$
CREATE PROCEDURE sp_generate_resource_allocation_plan(
    IN p_disaster_id VARCHAR(36),
    IN p_dry_run TINYINT,
    IN p_run_by VARCHAR(36)
)
proc_body: BEGIN
    DECLARE v_done INT DEFAULT 0;
    DECLARE v_request_id VARCHAR(36);
    DECLARE v_zone_id VARCHAR(36);
    DECLARE v_location_id VARCHAR(36);
    DECLARE v_category VARCHAR(20);
    DECLARE v_priority DECIMAL(6,2);
    DECLARE v_required_json JSON;

    DECLARE v_inventory_id VARCHAR(36);
    DECLARE v_resource_type_id VARCHAR(36);
    DECLARE v_res_location_id VARCHAR(36);
    DECLARE v_available DECIMAL(12,2);
    DECLARE v_is_critical TINYINT;
    DECLARE v_distance DECIMAL(8,2);
    DECLARE v_alloc_score DECIMAL(8,2);
    DECLARE v_needed_qty DECIMAL(12,2);
    DECLARE v_grant_qty DECIMAL(12,2);

    DECLARE v_req_lat DECIMAL(9,6);
    DECLARE v_req_lon DECIMAL(9,6);

    DECLARE v_lock_status INT;

    DECLARE req_cursor CURSOR FOR
        SELECT er.request_id, er.zone_id, er.location_id, er.category,
               fn_request_priority_score(er.request_id) AS score,
               er.required_resources_json,
               l.latitude, l.longitude
        FROM emergency_requests er
        JOIN locations l ON l.location_id = er.location_id
        WHERE er.status IN ('PENDING', 'SUBMITTED', 'ACKNOWLEDGED')
          AND (p_disaster_id IS NULL OR er.disaster_id = p_disaster_id)
        ORDER BY score DESC;

    DECLARE CONTINUE HANDLER FOR NOT FOUND SET v_done = 1;
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        DO RELEASE_LOCK('allocation_engine_lock');
        DROP TEMPORARY TABLE IF EXISTS tmp_plan;
        DROP TEMPORARY TABLE IF EXISTS tmp_shortage;
        RESIGNAL;
    END;

    SELECT GET_LOCK('allocation_engine_lock', 20) INTO v_lock_status;
    IF v_lock_status != 1 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Could not acquire lock for allocation engine';
    END IF;

    DROP TEMPORARY TABLE IF EXISTS tmp_plan;
    CREATE TEMPORARY TABLE tmp_plan (
        request_id VARCHAR(36),
        resource_type_id VARCHAR(36),
        inventory_id VARCHAR(36),
        quantity_allocated DECIMAL(12,2),
        allocation_score DECIMAL(8,2),
        distance_km DECIMAL(8,2),
        estimated_response_minutes INT,
        fulfilled TINYINT
    );

    DROP TEMPORARY TABLE IF EXISTS tmp_shortage;
    CREATE TEMPORARY TABLE tmp_shortage (
        resource_type_id VARCHAR(36),
        location_id VARCHAR(36),
        required_quantity DECIMAL(12,2),
        available_quantity DECIMAL(12,2)
    );

    START TRANSACTION;

    OPEN req_cursor;
    request_loop: LOOP
        SET v_done = 0;
        FETCH req_cursor INTO v_request_id, v_zone_id, v_location_id, v_category,
                              v_priority, v_required_json, v_req_lat, v_req_lon;
        IF v_done = 1 THEN
            LEAVE request_loop;
        END IF;

        IF v_required_json IS NOT NULL THEN
            block_reqs: BEGIN
                DECLARE v_idx INT DEFAULT 0;
                DECLARE v_len INT;
                DECLARE v_not_found INT DEFAULT 0;
                DECLARE CONTINUE HANDLER FOR NOT FOUND SET v_not_found = 1;
                SET v_len = JSON_LENGTH(v_required_json);

                WHILE v_idx < v_len DO
                    SET v_resource_type_id = JSON_UNQUOTE(JSON_EXTRACT(v_required_json, CONCAT('$[', v_idx, '].resource_type_id')));
                    SET v_needed_qty = CAST(JSON_UNQUOTE(JSON_EXTRACT(v_required_json, CONCAT('$[', v_idx, '].quantity'))) AS DECIMAL(12,2));

                    SET v_inventory_id = NULL;
                    SELECT ri.inventory_id, ri.location_id, ri.available_quantity,
                           rt.is_critical, l.latitude, l.longitude
                      INTO v_inventory_id, v_res_location_id, v_available, v_is_critical, @rlat, @rlon
                      FROM resource_inventory ri
                      JOIN resources r ON r.resource_id = ri.resource_id
                      JOIN resource_types rt ON rt.resource_type_id = r.resource_type_id
                      JOIN locations l ON l.location_id = ri.location_id
                     WHERE r.resource_type_id = v_resource_type_id
                       AND ri.available_quantity > 0
                     ORDER BY (CASE WHEN ri.expiration_date IS NOT NULL THEN 0 ELSE 1 END) ASC,
                              ri.expiration_date ASC,
                              ri.available_quantity DESC
                     LIMIT 1
                     FOR UPDATE;

                    IF v_inventory_id IS NOT NULL THEN
                        SET v_distance = COALESCE(fn_haversine_km(v_req_lat, v_req_lon, @rlat, @rlon), 0);
                        SET v_grant_qty = LEAST(v_available, v_needed_qty);

                        SET v_alloc_score = ROUND(
                            v_priority
                            + (CASE WHEN v_is_critical = 1 THEN 10 ELSE 0 END)
                            - LEAST(v_distance * 0.5, 20)
                        , 2);

                        INSERT INTO tmp_plan
                            (request_id, resource_type_id, inventory_id, quantity_allocated,
                             allocation_score, distance_km, estimated_response_minutes, fulfilled)
                        VALUES
                            (v_request_id, v_resource_type_id, v_inventory_id, v_grant_qty,
                             v_alloc_score, v_distance, CEIL(v_distance / 0.5),
                             IF(v_grant_qty >= v_needed_qty, 1, 0));

                        IF p_dry_run = 0 THEN
                            UPDATE resource_inventory
                               SET available_quantity = available_quantity - v_grant_qty,
                                   allocated_quantity  = allocated_quantity + v_grant_qty
                             WHERE inventory_id = v_inventory_id;

                            INSERT INTO resource_movements
                                 (inventory_id, movement_type, quantity, reference_type, reference_id, performed_by)
                            VALUES
                                 (v_inventory_id, 'ALLOCATION', v_grant_qty, 'REQUEST', v_request_id, p_run_by);

                            INSERT INTO resource_allocations
                                 (request_id, inventory_id, quantity_allocated, allocation_score,
                                  status, distance_km, estimated_response_minutes, allocated_by)
                            VALUES
                                 (v_request_id, v_inventory_id, v_grant_qty, v_alloc_score,
                                  'APPROVED', v_distance, CEIL(v_distance / 0.5), p_run_by);
                        END IF;

                        IF v_grant_qty < v_needed_qty THEN
                            INSERT INTO tmp_shortage VALUES
                                (v_resource_type_id, v_location_id, v_needed_qty - v_grant_qty, 0);
                        END IF;
                    ELSE
                        INSERT INTO tmp_plan
                            (request_id, resource_type_id, inventory_id, quantity_allocated,
                             allocation_score, distance_km, estimated_response_minutes, fulfilled)
                        VALUES
                            (v_request_id, v_resource_type_id, NULL, 0, 0, NULL, NULL, 0);

                        INSERT INTO tmp_shortage VALUES
                            (v_resource_type_id, v_location_id, v_needed_qty, 0);
                    END IF;

                    SET v_idx = v_idx + 1;
                END WHILE;
            END block_reqs;

            IF p_dry_run = 0 THEN
                IF NOT EXISTS (SELECT 1 FROM tmp_plan WHERE request_id = v_request_id AND fulfilled = 0) THEN
                    UPDATE emergency_requests
                       SET status = 'ASSIGNED', priority_score = v_priority
                     WHERE request_id = v_request_id AND status IN ('PENDING', 'SUBMITTED', 'ACKNOWLEDGED');
                ELSE
                    UPDATE emergency_requests
                       SET priority_score = v_priority
                     WHERE request_id = v_request_id;
                END IF;
            END IF;
        END IF;
    END LOOP;
    CLOSE req_cursor;

    IF p_dry_run = 0 THEN
        UPDATE resource_shortages rs
        JOIN (
            SELECT resource_type_id, location_id, SUM(required_quantity) AS sum_req
            FROM tmp_shortage
            GROUP BY resource_type_id, location_id
        ) ts ON ts.resource_type_id = rs.resource_type_id
             AND ((ts.location_id IS NULL AND rs.location_id IS NULL) OR ts.location_id = rs.location_id)
        SET rs.required_quantity = ts.sum_req,
            rs.available_quantity = COALESCE((SELECT SUM(ri.available_quantity) FROM resource_inventory ri JOIN resources r ON r.resource_id = ri.resource_id WHERE r.resource_type_id = ts.resource_type_id), 0),
            rs.severity = IF(ts.sum_req > 20, 'CRITICAL', 'WARNING'),
            rs.detected_at = NOW()
        WHERE rs.status = 'OPEN';

        INSERT INTO resource_shortages (resource_type_id, location_id, required_quantity, available_quantity, severity, status)
        SELECT ts.resource_type_id, ts.location_id, SUM(ts.required_quantity),
               COALESCE((SELECT SUM(ri.available_quantity) FROM resource_inventory ri
                         JOIN resources r ON r.resource_id = ri.resource_id
                         WHERE r.resource_type_id = ts.resource_type_id), 0),
               IF(SUM(ts.required_quantity) > 20, 'CRITICAL', 'WARNING'),
               'OPEN'
        FROM tmp_shortage ts
        WHERE NOT EXISTS (
            SELECT 1 FROM resource_shortages rs
            WHERE rs.resource_type_id = ts.resource_type_id
              AND ((ts.location_id IS NULL AND rs.location_id IS NULL) OR ts.location_id = rs.location_id)
              AND rs.status = 'OPEN'
        )
        GROUP BY ts.resource_type_id, ts.location_id;

        INSERT INTO alerts (alert_type, severity, message, entity_type, entity_id)
        SELECT 'CRITICAL_REQUEST', 'CRITICAL',
               CONCAT('Critical request #', er.request_id, ' remains unresolved after allocation pass'),
               'emergency_requests', er.request_id
        FROM emergency_requests er
        WHERE er.urgency = 'CRITICAL'
          AND er.status NOT IN ('RESOLVED','CANCELLED','ASSIGNED')
          AND (p_disaster_id IS NULL OR er.disaster_id = p_disaster_id);

        INSERT INTO audit_logs (user_id, action, entity_type, entity_id, new_value)
        VALUES (p_run_by, 'ALLOCATE', 'allocation_plan', p_disaster_id,
                JSON_OBJECT('disaster_id', p_disaster_id, 'dry_run', p_dry_run));

        COMMIT;
    ELSE
        ROLLBACK;
    END IF;

    SELECT * FROM tmp_plan;
    SELECT resource_type_id, location_id, SUM(required_quantity) AS total_required
      FROM tmp_shortage GROUP BY resource_type_id, location_id;
    
    DO RELEASE_LOCK('allocation_engine_lock');

    DROP TEMPORARY TABLE IF EXISTS tmp_plan;
    DROP TEMPORARY TABLE IF EXISTS tmp_shortage;
END$$

DROP PROCEDURE IF EXISTS sp_admit_patient$$
CREATE PROCEDURE sp_admit_patient(
    IN p_hospital_id VARCHAR(36),
    IN p_request_id VARCHAR(36),
    IN p_patient_name VARCHAR(120),
    IN p_condition ENUM('STABLE','SERIOUS','CRITICAL'),
    IN p_needs_icu TINYINT,
    OUT p_admission_id VARCHAR(36),
    OUT p_result VARCHAR(50)
)
BEGIN
    DECLARE v_avail_beds INT;
    DECLARE v_avail_icu INT;
    DECLARE v_condition VARCHAR(50);
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SET p_result = 'ERROR';
    END;

    START TRANSACTION;

    SELECT available_beds, available_icu_beds INTO v_avail_beds, v_avail_icu
      FROM hospitals WHERE hospital_id = p_hospital_id FOR UPDATE;

    IF p_needs_icu = 1 AND v_avail_icu <= 0 THEN
        SET p_result = 'NO_ICU_CAPACITY';
        ROLLBACK;
    ELSEIF p_needs_icu = 0 AND v_avail_beds <= 0 THEN
        SET p_result = 'NO_BED_CAPACITY';
        ROLLBACK;
    ELSE
        SET p_admission_id = UUID();
        SET v_condition = IF(p_needs_icu = 1, 'CRITICAL', p_condition);

        INSERT INTO hospital_admissions (admission_id, hospital_id, request_id, patient_name, condition_severity, admitted_at)
        VALUES (p_admission_id, p_hospital_id, p_request_id, p_patient_name, v_condition, NOW());

        SET p_result = 'ADMITTED';
        COMMIT;
    END IF;
END$$

DELIMITER ;
