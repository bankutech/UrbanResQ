export type Role =
  | 'ADMIN'
  | 'EMERGENCY_MANAGER'
  | 'DISASTER_OFFICER'
  | 'RESOURCE_MANAGER'
  | 'MEDICAL_COORDINATOR'
  | 'RESCUE_COORDINATOR'
  | 'VIEWER';

export interface AuthUser {
  userId: string;
  email: string;
  fullName: string;
  roles: Role[];
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}
