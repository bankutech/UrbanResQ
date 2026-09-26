import React, { createContext, useContext, useState, useCallback } from 'react';
import { api } from '../api/client';
import { disconnectSocket } from './useSocket';

export interface AuthUser {
  userId: string;
  email: string;
  fullName: string;
  roles: string[];
}

export const DEMO_ACCOUNTS: Record<string, { email: string; label: string; role: string }> = {
  ADMIN: { email: 'admin@urbanresq.city', label: 'EOC Commander (Admin)', role: 'ADMIN' },
  EMERGENCY_MANAGER: { email: 'manager@urbanresq.city', label: 'Emergency Manager', role: 'EMERGENCY_MANAGER' },
  RESOURCE_MANAGER: { email: 'resources@urbanresq.city', label: 'Resource Logistics Chief', role: 'RESOURCE_MANAGER' },
  MEDICAL_COORDINATOR: { email: 'medical@urbanresq.city', label: 'Medical Operations Lead', role: 'MEDICAL_COORDINATOR' },
  RESCUE_COORDINATOR: { email: 'rescue@urbanresq.city', label: 'Field Rescue Coordinator', role: 'RESCUE_COORDINATOR' },
  DISASTER_OFFICER: { email: 'officer@urbanresq.city', label: 'Disaster Assessment Officer', role: 'DISASTER_OFFICER' },
  VIEWER: { email: 'viewer@urbanresq.city', label: 'Civic / Press Observer', role: 'VIEWER' },
};

interface AuthContextValue {
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  hasRole: (...roles: string[]) => boolean;
  switchRole: (roleKey: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const raw = localStorage.getItem('urbanresq_user');
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  });

  const login = useCallback(async (email: string, password: string) => {
    const res = await api.post('/auth/login', { email, password });
    localStorage.setItem('urbanresq_token', res.data.token);
    localStorage.setItem('urbanresq_user', JSON.stringify(res.data.user));
    setUser(res.data.user);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('urbanresq_token');
    localStorage.removeItem('urbanresq_user');
    disconnectSocket();
    setUser(null);
  }, []);

  const hasRole = useCallback((...roles: string[]) => {
    if (!user) return false;
    return user.roles.includes('ADMIN') || user.roles.some((r) => roles.includes(r));
  }, [user]);

  const switchRole = useCallback(async (roleKey: string) => {
    const target = DEMO_ACCOUNTS[roleKey];
    if (!target) return;
    await login(target.email, 'UrbanResQ@2026');
  }, [login]);

  return (
    <AuthContext.Provider value={{ user, login, logout, hasRole, switchRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
