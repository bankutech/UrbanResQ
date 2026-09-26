import { requireRole } from '../src/middleware/auth';
import { ApiError } from '../src/utils/asyncHandler';

function mockReqRes(roles: string[]) {
  const req: any = { user: { userId: 1, email: 'x@x.com', fullName: 'X', roles } };
  const res: any = {};
  const next = jest.fn();
  return { req, res, next };
}

describe('requireRole middleware', () => {
  it('allows a user whose role is in the allowed list', () => {
    const { req, res, next } = mockReqRes(['RESOURCE_MANAGER']);
    const middleware = requireRole('RESOURCE_MANAGER', 'EMERGENCY_MANAGER');
    middleware(req, res, next);
    expect(next).toHaveBeenCalledWith(); // called with no error
  });

  it('always allows ADMIN regardless of the required role list', () => {
    const { req, res, next } = mockReqRes(['ADMIN']);
    const middleware = requireRole('MEDICAL_COORDINATOR');
    middleware(req, res, next);
    expect(next).toHaveBeenCalledWith();
  });

  it('rejects a user whose role is not in the allowed list', () => {
    const { req, res, next } = mockReqRes(['VIEWER']);
    const middleware = requireRole('RESOURCE_MANAGER');
    expect(() => middleware(req, res, next)).toThrow(ApiError);
  });

  it('rejects when there is no authenticated user at all', () => {
    const req: any = {};
    const res: any = {};
    const next = jest.fn();
    const middleware = requireRole('VIEWER');
    expect(() => middleware(req, res, next)).toThrow(ApiError);
  });
});
