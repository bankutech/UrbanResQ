import request from 'supertest';
import app from '../src/index';

jest.mock('../src/middleware/auth', () => ({
  requireAuth: (req: any, _res: any, next: any) => {
    req.user = { userId: 'admin-user-id', roles: ['ADMIN'] };
    next();
  },
  requireRole: (..._roles: string[]) => (_req: any, _res: any, next: any) => next(),
  signToken: () => 'mock-jwt-token',
}));

describe('API Route Validation & Error Handling Suite', () => {
  it('returns 400 VALIDATION_ERROR when POST /api/disasters has invalid payload', async () => {
    const res = await request(app)
      .post('/api/disasters')
      .send({ title: '' }); // too short, missing lat/long

    expect(res.status).toBe(400);
    expect(res.body.error).toHaveProperty('code', 'VALIDATION_ERROR');
  });

  it('returns 400 VALIDATION_ERROR when PATCH /api/disasters/:id/status has invalid status', async () => {
    const res = await request(app)
      .patch('/api/disasters/disaster-123/status')
      .send({ status: 'INVALID_STATUS_VALUE' });

    expect(res.status).toBe(400);
    expect(res.body.error).toHaveProperty('code', 'VALIDATION_ERROR');
  });

  it('returns 404 NOT_FOUND for non-existent API routes', async () => {
    const res = await request(app).get('/api/non-existent-endpoint-xyz');
    expect(res.status).toBe(404);
    expect(res.body.error).toHaveProperty('code', 'NOT_FOUND');
  });

  it('returns empty collections when search query is shorter than 2 characters', async () => {
    const res = await request(app).get('/api/search?q=a');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      disasters: [],
      requests: [],
      hospitals: [],
      shelters: [],
      teams: [],
      vehicles: []
    });
  });

  it('rejects POST /api/auth/login when payload is malformed', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'not-an-email', password: '123' });

    expect(res.status).toBe(400);
    expect(res.body.error).toHaveProperty('code', 'VALIDATION_ERROR');
  });

  it('rejects PATCH /api/vehicles/:id/status when status is invalid', async () => {
    const res = await request(app)
      .patch('/api/vehicles/veh-123/status')
      .send({ status: 'INVALID_STATUS' });

    expect(res.status).toBe(400);
    expect(res.body.error).toHaveProperty('code', 'VALIDATION_ERROR');
  });

  it('allows authenticated access to hospital admissions and shelter residents', async () => {
    const hospRes = await request(app).get('/api/hospitals/admissions');
    expect(hospRes.status).toBe(200);
    expect(Array.isArray(hospRes.body)).toBe(true);

    const shelterRes = await request(app).get('/api/shelters/residents');
    expect(shelterRes.status).toBe(200);
    expect(Array.isArray(shelterRes.body)).toBe(true);
  });
});
