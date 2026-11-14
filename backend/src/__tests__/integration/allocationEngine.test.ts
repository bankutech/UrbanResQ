import crypto from 'crypto';
import { runAllocationPlan } from '../../services/allocationService';
import { query, pool } from '../../config/db';

jest.setTimeout(60000);

describe('Allocation Engine Concurrency', () => {
  let disasterId: string;
  let resourceTypeId: string;
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

    disasterId = `TEST-DIS-${ts}`;
    resourceTypeId = `TEST-RES-${ts}`;
    locationId = `TEST-LOC-${ts}`;
    inventoryId = `TEST-INV-${ts}`;

    // 1. Create a dummy location (Depot / Epicenter)
    await query(
      `INSERT INTO locations (location_id, label, zone_name, latitude, longitude, address)
       VALUES (?, ?, 'Zone 01 - Test', 13.0827, 80.2707, 'Test Staging Address')`,
      [locationId, `Test Location ${ts}`]
    );

    // 2. Create a dummy disaster
    await query(
      `INSERT INTO disasters (disaster_id, title, disaster_type, severity, epicenter_location_id, status, affected_population)
       VALUES (?, ?, 'FLOOD', 'CRITICAL', ?, 'ACTIVE', 500)`,
      [disasterId, `Test Disaster ${ts}`, locationId]
    );

    // 3. Create a dummy resource type
    await query(
      `INSERT INTO resource_types (resource_type_id, name, category, unit_of_measure, is_critical)
       VALUES (?, ?, 'POTABLE_WATER', 'Canisters', 1)`,
      [resourceTypeId, `Test Water ${ts}`]
    );

    // 4. Insert constrained inventory: only 500 canisters available
    await query(
      `INSERT INTO resource_inventory (inventory_id, resource_type_id, location_id, batch_lot_number, available_quantity, allocated_quantity)
       VALUES (?, ?, ?, 'BATCH-TEST-01', 500.00, 0.00)`,
      [inventoryId, resourceTypeId, locationId]
    );

    // 5. Create 10 emergency requests that each need 100 canisters (1000 total demand)
    for (let i = 0; i < 10; i++) {
      const reqId = `TEST-REQ-${ts}-${i}`;
      const resourcesReq = JSON.stringify([{ resource_type_id: resourceTypeId, quantity: 100 }]);
      await query(
        `INSERT INTO emergency_requests (request_id, disaster_id, location_id, requester_name, category, urgency, status, people_affected, description, required_resources_json) 
         VALUES (?, ?, ?, 'Test Citizen', 'WATER', 'CRITICAL', 'PENDING', 10, 'Test Need Water', ?)`,
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
    await query(`DELETE FROM resource_inventory WHERE inventory_id = ?`, [inventoryId]).catch(() => {});
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

    // Wait for all concurrent executions to finish
    await Promise.allSettled(promises);

    // Verify the inventory state
    const [inv]: any = await query(`SELECT * FROM resource_inventory WHERE inventory_id = ?`, [inventoryId]);
    
    // The total requested was 1000, but we only had 500.
    // The engine should have allocated exactly 500 and stopped.
    expect(Number(inv.allocated_quantity)).toBe(500);
    expect(Number(inv.available_quantity)).toBe(0);

    // Verify the allocations table
    const allocations: any[] = await query(
      `SELECT SUM(quantity_allocated) as total FROM resource_allocations WHERE request_id IN (?)`,
      [requestIds]
    );
    expect(Number(allocations[0].total)).toBe(500); 
  }, 60000);
});
