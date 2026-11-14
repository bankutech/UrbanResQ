import request from 'supertest';
import app from '../src/index';

// Mock auth middleware for unit testing
jest.mock('../src/middleware/auth', () => ({
  requireAuth: (req: any, _res: any, next: any) => {
    req.user = { userId: 'test-user-id', roles: ['EMERGENCY_MANAGER'] };
    next();
  },
  requireRole: (..._roles: string[]) => {
    return (_req: any, _res: any, next: any) => next();
  }
}));

// Mock allocationService so unit tests can verify routing & schema validation in isolation
jest.mock('../src/services/allocationService', () => ({
  runAllocationPlan: jest.fn().mockImplementation(async (_disasterId, dryRun, _runBy) => {
    return {
      plan: [{ allocation_id: 'alloc-01', quantity_allocated: 100 }],
      shortages: [],
      dryRun: Boolean(dryRun),
    };
  }),
  listAllocations: jest.fn().mockResolvedValue([]),
  updateAllocationStatus: jest.fn().mockResolvedValue({ allocation_id: 'alloc-01', status: 'APPROVED' }),
}));

describe('Allocation Engine API Unit Tests', () => {
  it('should generate an allocation plan (dry run) successfully', async () => {
    const response = await request(app)
      .post('/api/allocations/generate')
      .send({ dryRun: true });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('dryRun');
    expect(response.body.dryRun).toBe(true);
    expect(Array.isArray(response.body.plan)).toBe(true);
    expect(Array.isArray(response.body.shortages)).toBe(true);
  });

  it('should validate the request body correctly', async () => {
    const response = await request(app)
      .post('/api/allocations/generate')
      .send({ disasterId: 123 }); // Send a number instead of string to trigger validation error

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });
});
