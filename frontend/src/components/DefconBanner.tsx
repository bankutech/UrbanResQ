import React, { useState, useEffect } from 'react';
import { AlertOctagon, ShieldAlert, AlertTriangle, ShieldCheck, Activity, ChevronRight, X } from 'lucide-react';
import { useFetch } from '../hooks/useFetch';
import { useSocket } from '../hooks/useSocket';

export type DefconLevel = 1 | 2 | 3 | 4 | 5;

const DEFCON_CONFIG: Record<DefconLevel, {
  level: DefconLevel;
  code: string;
  label: string;
  description: string;
  bg: string;
  border: string;
  text: string;
  dotBg: string;
  icon: any;
}> = {
  1: {
    level: 1,
    code: 'DEFCON 1',
    label: 'MAXIMUM READINESS / CRITICAL EMERGENCY',
    description: 'Active mass casualty incident or critical multi-zone disaster in progress.',
    bg: 'bg-red-950/80',
    border: 'border-red-500/60',
    text: 'text-red-200',
    dotBg: 'bg-red-500',
    icon: AlertOctagon,
  },
  2: {
    level: 2,
    code: 'DEFCON 2',
    label: 'HIGH ALERT / FAST DISPATCH',
    description: 'Severe weather or disaster declared. All rescue units on standby.',
    bg: 'bg-orange-950/80',
    border: 'border-orange-500/60',
    text: 'text-orange-200',
    dotBg: 'bg-orange-500',
    icon: ShieldAlert,
  },
  3: {
    level: 3,
    code: 'DEFCON 3',
    label: 'ELEVATED READINESS',
    description: 'Multiple pending emergency requests or supply inventory warning.',
    bg: 'bg-amber-950/70',
    border: 'border-amber-500/60',
    text: 'text-amber-200',
    dotBg: 'bg-amber-400',
    icon: AlertTriangle,
  },
  4: {
    level: 4,
    code: 'DEFCON 4',
    label: 'GUARDED WATCH',
    description: 'Nominal city operations with routine telemetry monitoring.',
    bg: 'bg-cyan-950/60',
    border: 'border-cyan-500/50',
    text: 'text-cyan-200',
    dotBg: 'bg-cyan-400',
    icon: Activity,
  },
  5: {
    level: 5,
    code: 'DEFCON 5',
    label: 'NORMAL OPERATIONS',
    description: 'Zero active disaster declarations. Systems 100% nominal.',
    bg: 'bg-emerald-950/60',
    border: 'border-emerald-500/50',
    text: 'text-emerald-200',
    dotBg: 'bg-emerald-400',
    icon: ShieldCheck,
  },
};

export function DefconBanner() {
  const { data: dashboard, reload } = useFetch<any>('/dashboard');
  const [overrideLevel, setOverrideLevel] = useState<DefconLevel | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useSocket('database_updated', reload);

  // Derive level from live operational data
  const status = dashboard?.status || {};
  let calculatedLevel: DefconLevel = 5;
  if ((status.critical_incidents ?? 0) > 0) {
    calculatedLevel = 1;
  } else if ((status.active_disasters ?? 0) > 0) {
    calculatedLevel = 2;
  } else if ((status.unresolved_requests ?? 0) > 5 || (status.critical_shortages ?? 0) > 0) {
    calculatedLevel = 3;
  } else if ((status.unresolved_requests ?? 0) > 0) {
    calculatedLevel = 4;
  } else {
    calculatedLevel = 5;
  }

  const activeLevel = overrideLevel ?? calculatedLevel;
  const cfg = DEFCON_CONFIG[activeLevel];
  const Icon = cfg.icon;

  if (dismissed && activeLevel > 2) return null;

  return (
    <aside 
      className={`relative z-20 flex flex-wrap items-center justify-between border-b px-4 py-1.5 text-xs font-mono transition-colors ${cfg.border} ${cfg.bg} ${cfg.text}`}
      role="region"
      aria-label="EOC DEFCON Alert Status"
      aria-live={activeLevel <= 2 ? "assertive" : "polite"}
    >
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 font-bold tracking-wider">
          <span className={`inline-block h-2 w-2 rounded-full ${cfg.dotBg} ${activeLevel <= 2 ? 'animate-ping' : ''}`} />
          <span className={`px-1.5 py-0.5 rounded font-black tracking-widest text-[10px] text-black ${cfg.dotBg}`}>
            {cfg.code}
          </span>
          <span className="hidden sm:inline font-semibold">{cfg.label}</span>
        </div>
        <span className="hidden md:inline text-eoc-muted">|</span>
        <span className="hidden md:inline text-[11px] opacity-90 truncate max-w-xl">
          {cfg.description}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <label htmlFor="defcon-select" className="text-[10px] text-eoc-muted hidden lg:inline">DRILL OVERRIDE:</label>
        <select
          id="defcon-select"
          value={overrideLevel ?? ''}
          onChange={(e) => setOverrideLevel(e.target.value ? (Number(e.target.value) as DefconLevel) : null)}
          className="rounded border border-eoc-border bg-eoc-panel px-2 py-0.5 text-[10px] text-eoc-text outline-none"
          aria-label="Override DEFCON readiness level for drills"
        >
          <option value="">AUTO (LIVE)</option>
          <option value="1">DEFCON 1 (CRITICAL)</option>
          <option value="2">DEFCON 2 (HIGH)</option>
          <option value="3">DEFCON 3 (ELEVATED)</option>
          <option value="4">DEFCON 4 (GUARDED)</option>
          <option value="5">DEFCON 5 (NOMINAL)</option>
        </select>

        {activeLevel > 2 && (
          <button
            onClick={() => setDismissed(true)}
            className="p-1 text-eoc-muted hover:text-eoc-text"
            aria-label="Dismiss DEFCON banner"
          >
            <X size={13} />
          </button>
        )}
      </div>
    </aside>
  );
}
