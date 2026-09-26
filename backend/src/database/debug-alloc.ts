import fs from 'fs';
import path from 'path';

async function runSeed() {
  const mysql = require('mysql2/promise');
  require('dotenv').config();

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    multipleStatements: true
  });

  try {
    await connection.query(`
      DROP TABLE IF EXISTS debug_log;
      CREATE TABLE debug_log (msg VARCHAR(1000));
      
      DROP PROCEDURE IF EXISTS sp_debug_allocation;
      CREATE PROCEDURE sp_debug_allocation(IN p_disaster_id INT)
      BEGIN
          DECLARE v_done INT DEFAULT 0;
          DECLARE v_request_id INT;
          DECLARE v_required_json JSON;
          DECLARE v_idx INT DEFAULT 0;
          DECLARE v_len INT;
          
          DECLARE v_resource_type_id INT;
          DECLARE v_needed_qty DECIMAL(12,2);
          DECLARE v_inventory_id INT;
          DECLARE v_available DECIMAL(12,2);
          DECLARE v_grant_qty DECIMAL(12,2);

          DECLARE req_cursor CURSOR FOR
              SELECT er.request_id, er.required_resources_json
              FROM emergency_requests er
              WHERE er.status NOT IN ('RESOLVED','CANCELLED')
                AND er.disaster_id = p_disaster_id
              ORDER BY fn_request_priority_score(er.request_id) DESC;

          DECLARE CONTINUE HANDLER FOR NOT FOUND SET v_done = 1;
          
          OPEN req_cursor;
          request_loop: LOOP
              FETCH req_cursor INTO v_request_id, v_required_json;
              IF v_done = 1 THEN LEAVE request_loop; END IF;

              IF v_required_json IS NOT NULL THEN
                  SET v_len = JSON_LENGTH(v_required_json);
                  SET v_idx = 0;
                  WHILE v_idx < v_len DO
                      SET v_resource_type_id = JSON_EXTRACT(v_required_json, CONCAT('$[', v_idx, '].resource_type_id'));
                      SET v_needed_qty = JSON_EXTRACT(v_required_json, CONCAT('$[', v_idx, '].quantity'));

                      SELECT ri.inventory_id, ri.available_quantity
                        INTO v_inventory_id, v_available
                        FROM resource_inventory ri
                        JOIN resources r ON r.resource_id = ri.resource_id
                       WHERE r.resource_type_id = v_resource_type_id
                         AND ri.available_quantity > 0
                       ORDER BY ri.available_quantity DESC
                       LIMIT 1;

                      IF v_inventory_id IS NOT NULL THEN
                          SET v_grant_qty = LEAST(v_available, v_needed_qty);
                          
                          INSERT INTO debug_log VALUES (CONCAT('req: ', v_request_id, ', res_type: ', v_resource_type_id, ', inv: ', v_inventory_id, ', avail: ', v_available, ', need: ', v_needed_qty, ', grant: ', v_grant_qty));
                          
                          UPDATE resource_inventory
                             SET available_quantity = available_quantity - v_grant_qty,
                                 allocated_quantity  = allocated_quantity + v_grant_qty
                           WHERE inventory_id = v_inventory_id;
                           
                      END IF;

                      SET v_idx = v_idx + 1;
                  END WHILE;
              END IF;
          END LOOP;
          CLOSE req_cursor;
      END;
    `);

    try {
      await connection.query(`CALL sp_debug_allocation(1);`);
    } catch (err: any) {
      console.log('Error occurred:', err.message);
    }
    
    const [logs] = await connection.query(`SELECT * FROM debug_log`);
    console.log('--- DEBUG LOGS ---');
    console.log(logs);

  } catch (error) {
    console.error('Fatal error:', error);
  } finally {
    await connection.end();
  }
}

runSeed();
