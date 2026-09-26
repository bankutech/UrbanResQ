/**
 * Unit tests for the priority-score formula mirrored in
 * fn_request_priority_score / vw_emergency_request_priority.
 * We re-implement the same pure calculation here so the weighting logic
 * is verifiable without a live database connection in CI.
 */

type Urgency = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
type Category = 'MEDICAL' | 'RESCUE' | 'WATER' | 'FOOD' | 'SHELTER' | 'EVACUATION' | 'SUPPLIES' | 'SECURITY' | 'OTHER';

function computePriorityScore(input: {
  urgency: Urgency; peopleAffected: number; waitingMinutes: number;
  vulnerableCount: number; category: Category;
}): number {
  const severityWeight = { CRITICAL: 40, HIGH: 28, MEDIUM: 14, LOW: 5 }[input.urgency];
  const populationWeight = Math.min(input.peopleAffected * 1.2, 25);
  const waitingWeight = Math.min(input.waitingMinutes * 0.4, 20);
  const vulnerableWeight = Math.min(input.vulnerableCount * 3, 15);
  const categoryWeight = ['MEDICAL', 'RESCUE'].includes(input.category) ? 10 : 3;
  return Math.round((severityWeight + populationWeight + waitingWeight + vulnerableWeight + categoryWeight) * 100) / 100;
}

describe('priority score formula', () => {
  it('scores a CRITICAL medical request higher than a LOW food request', () => {
    const critical = computePriorityScore({ urgency: 'CRITICAL', peopleAffected: 10, waitingMinutes: 20, vulnerableCount: 2, category: 'MEDICAL' });
    const low = computePriorityScore({ urgency: 'LOW', peopleAffected: 2, waitingMinutes: 5, vulnerableCount: 0, category: 'FOOD' });
    expect(critical).toBeGreaterThan(low);
  });

  it('caps population weight at 25 so very large groups do not dominate the score', () => {
    const score = computePriorityScore({ urgency: 'LOW', peopleAffected: 1000, waitingMinutes: 0, vulnerableCount: 0, category: 'OTHER' });
    // severity(5) + population(capped 25) + waiting(0) + vulnerable(0) + category(3) = 33
    expect(score).toBe(33);
  });

  it('increases score as waiting time increases, up to the cap', () => {
    const t10 = computePriorityScore({ urgency: 'MEDIUM', peopleAffected: 1, waitingMinutes: 10, vulnerableCount: 0, category: 'OTHER' });
    const t60 = computePriorityScore({ urgency: 'MEDIUM', peopleAffected: 1, waitingMinutes: 60, vulnerableCount: 0, category: 'OTHER' });
    expect(t60).toBeGreaterThan(t10);
  });

  it('gives medical/rescue categories a higher category weight than other categories', () => {
    const medical = computePriorityScore({ urgency: 'MEDIUM', peopleAffected: 1, waitingMinutes: 0, vulnerableCount: 0, category: 'MEDICAL' });
    const other = computePriorityScore({ urgency: 'MEDIUM', peopleAffected: 1, waitingMinutes: 0, vulnerableCount: 0, category: 'OTHER' });
    expect(medical - other).toBe(7); // 10 - 3
  });
});
