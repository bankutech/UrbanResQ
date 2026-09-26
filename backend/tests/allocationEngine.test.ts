import request from 'supertest';
import app from '../src/index';
import { pool } from '../src/config/db';

// We mock the auth middleware so we can bypass JWT checking in tests
jest.mock('../src/middleware/auth', () => ({
  requireAuth: (req: any, res: any, next: any) => {
    req.user = { userId: 1, roles: ['EMERGENCY_MANAGER'] };
    next();
  },
  requireRole: (...roles: string[]) => {
    return (req: any, res: any, next: any) => next();
  }
}));

afterAll(async () => {
  await pool.end();
});

describe('Allocation Engine API', () => {
  it('should generate an allocation plan (dry run) successfully', async () => {
    // We pass dryRun: true so it doesn't alter database state
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
