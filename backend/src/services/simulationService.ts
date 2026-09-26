import { query } from '../config/db';
import { runAllocationPlan } from './allocationService';

export interface SimulationScenario {
  disasterId: string;
  // e.g. reduce ambulance availability, increase severity, add shelter demand
  resourceTypeId?: string;
  quantityDelta?: number;      // negative = resources become unavailable
  additionalPeopleAffected?: number;
  hospitalIdAtCapacity?: string;
}

/**
 * Computes a "current state vs simulated state" comparison WITHOUT writing
 * anything to the database. Two safeguards:
 *   1. It reads current shortages/capacity first (baseline).
 *   2. It calls the allocation procedure in dry-run mode (which itself
 *      ROLLBACKs), then layers the manual scenario delta on top in memory.
 */
export async function runWhatIf(scenario: SimulationScenario, runBy: string) {
  const baseline = await getBaselineState(scenario.disasterId);

  // Baseline dry-run allocation plan (real scoring logic, no writes)
  const baselinePlan = await runAllocationPlan(scenario.disasterId, true, runBy);

  // Apply the scenario deltas to an in-memory copy of resource availability
  let simulatedAvailable = baseline.resourceAvailability;
  if (scenario.resourceTypeId && scenario.quantityDelta) {
    simulatedAvailable = baseline.resourceAvailability.map((r: any) =>
      r.resource_type_id === scenario.resourceTypeId
        ? { ...r, available_quantity: Math.max(0, Number(r.available_quantity) + scenario.quantityDelta!) }
        : r
    );
  }

  const newShortages = simulatedAvailable.filter((r: any) => {
    const original = baseline.resourceAvailability.find((o: any) => o.resource_type_id === r.resource_type_id);
    const wasOk = original && Number(original.available_quantity) > Number(original.min_threshold);
    const nowLow = Number(r.available_quantity) <= Number(r.min_threshold);
    return wasOk && nowLow;
  });

  let additionalAffectedRequests = 0;
  if (scenario.additionalPeopleAffected) {
    // Estimate how many additional CRITICAL/HIGH requests this population increase
    // would statistically generate, based on the disaster's current ratio.
    const ratioRows: any[] = await query(
      `SELECT COUNT(*) AS request_count, SUM(people_affected) AS total_people
       FROM emergency_requests WHERE disaster_id = ?`,
      [scenario.disasterId]
    );
    const ratio = ratioRows[0].total_people > 0 ? ratioRows[0].request_count / ratioRows[0].total_people : 0.02;
    additionalAffectedRequests = Math.ceil(scenario.additionalPeopleAffected * ratio);
  }

  let hospitalImpact: any = null;
  if (scenario.hospitalIdAtCapacity) {
    const rows: any[] = await query(`SELECT * FROM vw_hospital_capacity WHERE hospital_id = ?`, [scenario.hospitalIdAtCapacity]);
    hospitalImpact = rows[0]
      ? { ...rows[0], simulated_available_beds: 0, note: 'Simulated as fully occupied — incoming patients would need diversion to nearest hospital with capacity.' }
      : null;
  }

  return {
    baseline: {
      shortages: baseline.shortages,
      unresolvedRequests: baseline.unresolvedRequests,
    },
    simulated: {
      newShortages,
      additionalAffectedRequests,
      hospitalImpact,
    },
    allocationPreview: baselinePlan.plan,
    recommendedActions: buildRecommendations(newShortages, additionalAffectedRequests, hospitalImpact),
  };
}

async function getBaselineState(disasterId: string) {
  const resourceAvailability = await query(
    `SELECT rt.resource_type_id, rt.name, SUM(ri.available_quantity) AS available_quantity, SUM(ri.min_threshold) AS min_threshold
     FROM resource_types rt JOIN resources r ON r.resource_type_id = rt.resource_type_id
     JOIN resource_inventory ri ON ri.resource_id = r.resource_id
     GROUP BY rt.resource_type_id, rt.name`
  );
  const shortages = await query(`SELECT * FROM vw_resource_shortages`);
  const unresolvedRows: any[] = await query(
    `SELECT COUNT(*) AS c FROM emergency_requests WHERE disaster_id = ? AND status NOT IN ('RESOLVED','CANCELLED')`,
    [disasterId]
  );
  return { resourceAvailability, shortages, unresolvedRequests: unresolvedRows[0].c };
}

function buildRecommendations(newShortages: any[], additionalRequests: number, hospitalImpact: any) {
  const actions: string[] = [];
  if (newShortages.length > 0) {
    actions.push(`Pre-position additional stock for: ${newShortages.map((s) => s.name).join(', ')}`);
  }
  if (additionalRequests > 0) {
    actions.push(`Prepare capacity for an estimated ${additionalRequests} additional emergency requests`);
  }
  if (hospitalImpact) {
    actions.push(`Identify overflow hospital capacity near ${hospitalImpact.name} for patient diversion`);
  }
  if (actions.length === 0) {
    actions.push('Current resource levels appear sufficient to absorb this scenario.');
  }
  return actions;
}
