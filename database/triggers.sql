-- =====================================================================
-- URBANRESQ — triggers.sql
-- Small, focused triggers only — each one enforces a rule that would
-- otherwise require every API endpoint to remember to do it manually.
-- =====================================================================
USE urbanresq;

DELIMITER $$

-- Every emergency_requests.status change is recorded automatically.
DROP TRIGGER IF EXISTS trg_request_status_history$$
CREATE TRIGGER trg_request_status_history
AFTER UPDATE ON emergency_requests
FOR EACH ROW
BEGIN
    IF OLD.status <> NEW.status THEN
        INSERT INTO request_status_history (request_id, old_status, new_status)
        VALUES (NEW.request_id, OLD.status, NEW.status);
    END IF;
END$$

-- Every resource_allocations.status change is recorded automatically.
DROP TRIGGER IF EXISTS trg_allocation_status_history$$
CREATE TRIGGER trg_allocation_status_history
AFTER UPDATE ON resource_allocations
FOR EACH ROW
BEGIN
    IF OLD.status <> NEW.status THEN
        INSERT INTO allocation_status_history (allocation_id, old_status, new_status)
        VALUES (NEW.allocation_id, OLD.status, NEW.status);
    END IF;
END$$

-- New allocation -> audit trail (defence in depth alongside app-level audit calls)
DROP TRIGGER IF EXISTS trg_allocation_audit$$
CREATE TRIGGER trg_allocation_audit
AFTER INSERT ON resource_allocations
FOR EACH ROW
BEGIN
    INSERT INTO audit_logs (user_id, action, entity_type, entity_id, new_value)
    VALUES (NEW.allocated_by, 'ALLOCATE', 'resource_allocations', NEW.allocation_id,
            JSON_OBJECT('request_id', NEW.request_id, 'quantity', NEW.quantity_allocated,
                        'score', NEW.allocation_score, 'status', NEW.status));
END$$

-- Hospital admission -> decrement the right bed pool automatically when
-- an admission is inserted WITHOUT going through sp_admit_patient
-- (defensive: keeps the counters correct even for manual/direct inserts).
DROP TRIGGER IF EXISTS trg_hospital_admission_bed_update$$
CREATE TRIGGER trg_hospital_admission_bed_update
AFTER INSERT ON hospital_admissions
FOR EACH ROW
BEGIN
    IF NEW.condition_severity = 'CRITICAL' THEN
        UPDATE hospitals
           SET available_icu_beds = GREATEST(available_icu_beds - 1, 0)
         WHERE hospital_id = NEW.hospital_id;
    ELSE
        UPDATE hospitals
           SET available_beds = GREATEST(available_beds - 1, 0)
         WHERE hospital_id = NEW.hospital_id;
    END IF;
END$$

-- Discharge -> free the bed back up
DROP TRIGGER IF EXISTS trg_hospital_discharge_bed_update$$
CREATE TRIGGER trg_hospital_discharge_bed_update
AFTER UPDATE ON hospital_admissions
FOR EACH ROW
BEGIN
    IF OLD.discharged_at IS NULL AND NEW.discharged_at IS NOT NULL THEN
        IF NEW.condition_severity = 'CRITICAL' THEN
            UPDATE hospitals SET available_icu_beds = LEAST(available_icu_beds + 1, icu_beds) WHERE hospital_id = NEW.hospital_id;
        ELSE
            UPDATE hospitals SET available_beds = LEAST(available_beds + 1, total_beds) WHERE hospital_id = NEW.hospital_id;
        END IF;
    END IF;
END$$

-- Shelter resident check-in -> occupancy up, snapshot into shelter_capacity
DROP TRIGGER IF EXISTS trg_shelter_checkin$$
CREATE TRIGGER trg_shelter_checkin
AFTER INSERT ON shelter_residents
FOR EACH ROW
BEGIN
    UPDATE shelters SET current_occupancy = current_occupancy + 1 WHERE shelter_id = NEW.shelter_id;
    INSERT INTO shelter_capacity (shelter_id, occupancy)
        SELECT shelter_id, current_occupancy FROM shelters WHERE shelter_id = NEW.shelter_id;
END$$

-- Shelter resident check-out -> occupancy down, snapshot
DROP TRIGGER IF EXISTS trg_shelter_checkout$$
CREATE TRIGGER trg_shelter_checkout
AFTER UPDATE ON shelter_residents
FOR EACH ROW
BEGIN
    IF OLD.checked_out_at IS NULL AND NEW.checked_out_at IS NOT NULL THEN
        UPDATE shelters SET current_occupancy = GREATEST(current_occupancy - 1, 0) WHERE shelter_id = NEW.shelter_id;
        INSERT INTO shelter_capacity (shelter_id, occupancy)
            SELECT shelter_id, current_occupancy FROM shelters WHERE shelter_id = NEW.shelter_id;
    END IF;
END$$

-- Inventory drops at/below threshold -> auto-create an OPEN shortage record
-- (idempotent: only inserts if there isn't already an open one for this type+location)
DROP TRIGGER IF EXISTS trg_inventory_shortage_detect$$
CREATE TRIGGER trg_inventory_shortage_detect
AFTER UPDATE ON resource_inventory
FOR EACH ROW
BEGIN
    DECLARE v_resource_type_id VARCHAR(36);
    IF NEW.available_quantity <= NEW.min_threshold AND
       (OLD.available_quantity > OLD.min_threshold OR OLD.available_quantity IS NULL) THEN

        SELECT resource_type_id INTO v_resource_type_id FROM resources WHERE resource_id = NEW.resource_id;

        IF NOT EXISTS (
            SELECT 1 FROM resource_shortages
             WHERE resource_type_id = v_resource_type_id
               AND location_id = NEW.location_id
               AND status = 'OPEN'
        ) THEN
            INSERT INTO resource_shortages (resource_type_id, location_id, required_quantity, available_quantity, severity, status)
            VALUES (v_resource_type_id, NEW.location_id, NEW.min_threshold, NEW.available_quantity,
                    IF(NEW.available_quantity <= NEW.min_threshold * 0.5, 'CRITICAL', 'WARNING'), 'OPEN');

            INSERT INTO alerts (alert_type, severity, message, entity_type, entity_id)
            VALUES ('SHORTAGE',
                    IF(NEW.available_quantity <= NEW.min_threshold * 0.5, 'CRITICAL', 'WARNING'),
                    CONCAT('Inventory #', NEW.inventory_id, ' fell to or below threshold'),
                    'resource_inventory', NEW.inventory_id);
        END IF;
    END IF;

    -- auto-resolve shortage once restocked comfortably above threshold
    IF NEW.available_quantity > NEW.min_threshold * 1.2 AND OLD.available_quantity <= OLD.min_threshold THEN
        UPDATE resource_shortages rs
           JOIN resources r ON r.resource_id = NEW.resource_id
           SET rs.status = 'RESOLVED', rs.resolved_at = NOW()
         WHERE rs.resource_type_id = r.resource_type_id
           AND rs.location_id = NEW.location_id
           AND rs.status = 'OPEN';
    END IF;
END$$

-- Generic audit log for user table changes (demonstrates audit-on-sensitive-table pattern)
DROP TRIGGER IF EXISTS trg_users_audit_update$$
CREATE TRIGGER trg_users_audit_update
AFTER UPDATE ON users
FOR EACH ROW
BEGIN
    INSERT INTO audit_logs (user_id, action, entity_type, entity_id, old_value, new_value)
    VALUES (NEW.user_id, 'UPDATE', 'users', NEW.user_id,
            JSON_OBJECT('email', OLD.email, 'is_active', OLD.is_active),
            JSON_OBJECT('email', NEW.email, 'is_active', NEW.is_active));
END$$

DELIMITER ;
