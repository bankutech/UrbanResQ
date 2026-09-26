import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ApiError } from '../utils/asyncHandler';
import { AuthUser, Role } from '../types';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';

/** Verifies the Bearer JWT and attaches the decoded user to req.user. */
export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    throw new ApiError(401, 'UNAUTHORIZED', 'Missing or invalid Authorization header');
  }
  const token = header.slice('Bearer '.length);
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthUser;
    req.user = decoded;
    next();
  } catch {
    throw new ApiError(401, 'UNAUTHORIZED', 'Invalid or expired token');
  }
}

/**
 * Restricts a route to one of the given roles. Always used server-side —
 * the frontend may also hide buttons, but authorization is enforced here,
 * not trusted from the client.
 */
export function requireRole(...roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) throw new ApiError(401, 'UNAUTHORIZED', 'Not authenticated');
    const allowed = req.user.roles.some((r) => roles.includes(r) || r === 'ADMIN');
    if (!allowed) {
      throw new ApiError(403, 'FORBIDDEN', `Requires one of roles: ${roles.join(', ')}`);
    }
    next();
  };
}

export function signToken(user: AuthUser): string {
  return jwt.sign(user, JWT_SECRET, { expiresIn: (process.env.JWT_EXPIRES_IN || '8h') as any });
}
