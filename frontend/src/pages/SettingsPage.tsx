import React from 'react';
import { Sun, Moon, Shield, UserCheck, Terminal, Settings } from 'lucide-react';
import { useAuth, DEMO_ACCOUNTS } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import { Panel, StatusBadge, Button, PageHeader } from '../components/ui';

export default function SettingsPage() {
  const { user, switchRole } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  return (
    <div className="space-y-4 font-sans">
      <PageHeader
        title="EOC Console System Settings & RBAC Governance"
        subtitle="Active operator session credentials, visual telemetry modes, and role-based access control governance"
        freshness="RBAC Governance Engine Active"
      />

      {/* Account Info */}
      <Panel title="Active Operator Credentials">
        <div className="space-y-2 font-mono text-xs">
          <div className="flex justify-between border-b border-eoc-border/40 py-2">
            <span className="text-eoc-muted">OPERATOR ID:</span>
            <span className="text-cyan-400 font-bold">{user?.userId ?? '—'}</span>
          </div>
          <div className="flex justify-between border-b border-eoc-border/40 py-2">
            <span className="text-eoc-muted">OFFICER NAME:</span>
            <span className="text-eoc-text font-semibold">{user?.fullName ?? '—'}</span>
          </div>
          <div className="flex justify-between border-b border-eoc-border/40 py-2">
            <span className="text-eoc-muted">CREDENTIAL EMAIL:</span>
            <span className="text-eoc-text">{user?.email ?? '—'}</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-eoc-muted">ASSIGNED RBAC ROLES:</span>
            <div className="flex gap-1.5 flex-wrap">
              {user?.roles?.map((r) => (
                <StatusBadge key={r} value={r} />
              ))}
            </div>
          </div>
        </div>
      </Panel>

      {/* RBAC Quick Role Switcher for Council Evaluation / Drills */}
      <Panel 
        title="Emergency Operations Drill: Role Switcher"
        badge={
          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
            7 RBAC ROLES
          </span>
        }
      >
        <p className="text-xs text-eoc-muted font-mono mb-3">
          Instant session elevation across the 7 verified RBAC emergency coordinator accounts:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 font-mono text-xs">
          {Object.entries(DEMO_ACCOUNTS).map(([roleKey, acc]) => {
            const isCurrent = user?.roles?.includes(roleKey) || (roleKey === 'ADMIN' && user?.roles?.includes('ADMIN'));
            return (
              <div 
                key={roleKey}
                className={`p-3 rounded border flex flex-col justify-between transition-colors ${
                  isCurrent 
                    ? 'border-cyan-500/60 bg-cyan-950/40 text-cyan-200' 
                    : 'border-eoc-border bg-eoc-panel2 hover:border-eoc-border2 text-eoc-muted'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-[11px] text-eoc-text">{acc.label}</span>
                    {isCurrent && <UserCheck size={13} className="text-cyan-400" />}
                  </div>
                  <div className="text-[10px] text-eoc-subtle truncate">{acc.email}</div>
                </div>
                <button
                  disabled={isCurrent}
                  onClick={() => switchRole(roleKey)}
                  className={`mt-2.5 w-full py-1 rounded text-[10px] font-bold border transition-colors ${
                    isCurrent 
                      ? 'border-cyan-500/30 bg-cyan-900/40 text-cyan-300 cursor-default' 
                      : 'border-eoc-border bg-eoc-panel hover:bg-eoc-panel3 text-eoc-text'
                  }`}
                >
                  {isCurrent ? 'ACTIVE ROLE' : 'SWITCH TO ROLE'}
                </button>
              </div>
            );
          })}
        </div>
      </Panel>

      {/* Console Display Preferences */}
      <Panel title="Console Display & Ergonomic Preferences">
        <div className="space-y-2 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-eoc-border/40 py-2">
            <div>
              <span className="text-eoc-text font-semibold block">VISUAL ERGONOMICS MODE:</span>
              <span className="text-[11px] text-eoc-muted">Tactical Dark (EOC control room) vs Field Daylight (rugged tablet)</span>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={toggleTheme}
            >
              {theme === 'dark' ? <Sun size={13} /> : <Moon size={13} />}
              <span>{theme === 'dark' ? 'FIELD DAYLIGHT' : 'TACTICAL DARK'}</span>
            </Button>
          </div>
          <div className="flex justify-between border-b border-eoc-border/40 py-2">
            <span className="text-eoc-muted">LOCAL TIMEZONE:</span>
            <span className="text-eoc-text">{timezone}</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-eoc-muted">TELEMETRY DIGIT SPACING:</span>
            <span className="text-cyan-400 font-bold">MANDATORY TABULAR-NUMS (ACTIVE)</span>
          </div>
        </div>
      </Panel>
    </div>
  );
}
