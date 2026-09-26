import crypto from 'crypto';
import { runAllocationPlan } from '../../services/allocationService';
import { query, pool } from '../../config/db';

jest.setTimeout(60000);

describe('Allocation Engine Concurrency', () => {
  let disasterId: string;
  let resourceTypeId: string;
  let resourceId: string;
  let locationId: string;
  let inventoryId: string;
  let adminUserId: string;
  let requestIds: string[] = [];

  afterAll(async () => {
    await pool.end();
  });

  beforeEach(async () => {
    const ts = Date.now();
    // Get existing admin user for FK
    const users: any = await query(`SELECT user_id FROM users LIMIT 1`);
    adminUserId = users[0].user_id;

    disasterId = crypto.randomUUID();
    resourceTypeId = crypto.randomUUID();
    resourceId = crypto.randomUUID();
    locationId = crypto.randomUUID();
    inventoryId = crypto.randomUUID();

    // 1. Create a dummy disaster
    await query(
      `INSERT INTO disasters (disaster_id, disaster_type, title, severity, latitude, longitude, description, status, start_time, created_by)
       VALUES (?, 'FLOOD', ?, 'CRITICAL', 13.0827, 80.2707, 'Test Concurrency Disaster', 'ACTIVE', NOW(), ?)`,
      [disasterId, `Test Disaster ${ts}`, adminUserId]
    );

    // 2. Create a dummy resource type
    await query(
      `INSERT INTO resource_types (resource_type_id, name, category, unit, is_critical)
       VALUES (?, ?, 'WATER', 'Bottles', 1)`,
      [resourceTypeId, `Test Water ${ts}`]
    );

    // 3. Create a dummy resource
    await query(
      `INSERT INTO resources (resource_id, resource_code, name, resource_type_id, is_consumable)
       VALUES (?, ?, 'Test Water Brand', ?, 1)`,
      [resourceId, `TEST-WTR-${ts}`, resourceTypeId]
    );

    // 4. Create a dummy location (Depot)
    await query(
      `INSERT INTO locations (location_id, label, latitude, longitude)
       VALUES (?, ?, 13.0827, 80.2707)`,
      [locationId, `Test Depot ${ts}`]
    );

    // 5. Insert constrained inventory: only 500 bottles available
    await query(
      `INSERT INTO resource_inventory (inventory_id, resource_id, location_id, total_quantity, available_quantity, allocated_quantity)
       VALUES (?, ?, ?, 500, 500, 0)`,
      [inventoryId, resourceId, locationId]
    );

    // 6. Create 10 emergency requests that each need 100 bottles (1000 total demand)
    for (let i = 0; i < 10; i++) {
      const reqId = crypto.randomUUID();
      const resourcesReq = JSON.stringify([{ resource_type_id: resourceTypeId, quantity: 100 }]);
      await query(
        `INSERT INTO emergency_requests (request_id, disaster_id, location_id, requester_type, description, category, urgency, status, people_affected, required_resources_json) 
         VALUES (?, ?, ?, 'OFFICER', 'Test Need Water', 'SUPPLIES', 'CRITICAL', 'PENDING', 100, ?)`,
        [reqId, disasterId, locationId, resourcesReq]
      );
      requestIds.push(reqId);
    }
  });

  afterEach(async () => {
    if (requestIds.length) {
      await query(`DELETE FROM resource_allocations WHERE request_id IN (?)`, [requestIds]).catch(() => {});
      await query(`DELETE FROM emergency_requests WHERE request_id IN (?)`, [requestIds]).catch(() => {});
    }
    await query(`DELETE FROM resource_shortages WHERE resource_type_id = ?`, [resourceTypeId]).catch(() => {});
    await query(`DELETE FROM resource_movements WHERE inventory_id = ?`, [inventoryId]).catch(() => {});
    await query(`DELETE FROM resource_inventory WHERE inventory_id = ?`, [inventoryId]).catch(() => {});
    await query(`DELETE FROM resources WHERE resource_type_id = ?`, [resourceTypeId]).catch(() => {});
    await query(`DELETE FROM resource_types WHERE resource_type_id = ?`, [resourceTypeId]).catch(() => {});
    await query(`DELETE FROM disasters WHERE disaster_id = ?`, [disasterId]).catch(() => {});
    await query(`DELETE FROM locations WHERE location_id = ?`, [locationId]).catch(() => {});
    requestIds = [];
  });

  it('should not over-allocate resources when the engine is run concurrently', async () => {
    // Fire the allocation engine 3 times simultaneously (race condition attempt)
    const promises = [];
    for (let i = 0; i < 3; i++) {
      // dryRun = false means it will commit the allocations
      promises.push(runAllocationPlan(disasterId, false, adminUserId));
    }

    // Wait for all concurrent executions to finish (some might fail with check constraint violations, which is fine)
    await Promise.allSettled(promises);

    // Verify the inventory state
    const [inv]: any = await query(`SELECT * FROM resource_inventory WHERE inventory_id = ?`, [inventoryId]);
    
    // The total requested was 1000, but we only had 500.
    // The engine should have allocated exactly 500 and stopped.
    expect(inv.allocated_quantity).toBe(500);
    expect(inv.available_quantity).toBe(0);
    expect(inv.total_quantity).toBe(500); // Should remain unchanged

    // Verify the allocations table
    const allocations: any[] = await query(
      `SELECT SUM(quantity_allocated) as total FROM resource_allocations WHERE request_id IN (?)`,
      [requestIds]
    );
    expect(Number(allocations[0].total)).toBe(500); 
  }, 60000);
});
