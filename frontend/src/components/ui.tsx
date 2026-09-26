import React, { memo } from "react";
import { 
  AlertTriangle, 
  AlertOctagon,
  ShieldAlert,
  Clock, 
  CheckCircle2, 
  Info, 
  RefreshCw, 
  InboxIcon,
  Flame,
  Radio,
  Activity,
  Layers
} from "lucide-react";

/* ============================================================
   TACTICAL STATUS BADGE (Never color alone — distinct icon + label)
   ============================================================ */
interface BadgeConfig {
  label: string;
  text: string;
  bg: string;
  border: string;
  icon: any;
  pulse?: boolean;
}

const BADGE_CONFIGS: Record<string, BadgeConfig> = {
  // Incident & Urgency
  CRITICAL: {
    label: "Critical Alert",
    text: "text-red-400",
    bg: "bg-red-950/70",
    border: "border-red-500/50",
    icon: AlertOctagon,
    pulse: true,
  },
  HIGH: {
    label: "High Priority",
    text: "text-orange-400",
    bg: "bg-orange-950/70",
    border: "border-orange-500/50",
    icon: ShieldAlert,
  },
  WARNING: {
    label: "Warning",
    text: "text-amber-400",
    bg: "bg-amber-950/60",
    border: "border-amber-500/50",
    icon: AlertTriangle,
  },
  MODERATE: {
    label: "Moderate",
    text: "text-amber-300",
    bg: "bg-amber-950/50",
    border: "border-amber-500/40",
    icon: AlertTriangle,
  },
  LOW: {
    label: "Low Severity",
    text: "text-emerald-400",
    bg: "bg-emerald-950/60",
    border: "border-emerald-500/40",
    icon: CheckCircle2,
  },
  STABLE: {
    label: "Stable",
    text: "text-emerald-400",
    bg: "bg-emerald-950/60",
    border: "border-emerald-500/40",
    icon: CheckCircle2,
  },
  NORMAL: {
    label: "Nominal",
    text: "text-emerald-400",
    bg: "bg-emerald-950/60",
    border: "border-emerald-500/40",
    icon: CheckCircle2,
  },
  AVAILABLE: {
    label: "Available",
    text: "text-emerald-400",
    bg: "bg-emerald-950/60",
    border: "border-emerald-500/40",
    icon: CheckCircle2,
  },
  RESOLVED: {
    label: "Resolved",
    text: "text-slate-400",
    bg: "bg-slate-900/60",
    border: "border-slate-700/60",
    icon: CheckCircle2,
  },
  ACTIVE: {
    label: "Active Ops",
    text: "text-cyan-400",
    bg: "bg-cyan-950/60",
    border: "border-cyan-500/40",
    icon: Activity,
    pulse: true,
  },
  PENDING: {
    label: "Pending Review",
    text: "text-amber-400",
    bg: "bg-amber-950/60",
    border: "border-amber-500/40",
    icon: Clock,
  },
  IN_PROGRESS: {
    label: "In Progress",
    text: "text-cyan-400",
    bg: "bg-cyan-950/60",
    border: "border-cyan-500/40",
    icon: Radio,
  },
  ASSIGNED: {
    label: "Assigned",
    text: "text-blue-400",
    bg: "bg-blue-950/60",
    border: "border-blue-500/40",
    icon: Layers,
  },
  DISPATCHED: {
    label: "Dispatched",
    text: "text-cyan-300",
    bg: "bg-cyan-950/70",
    border: "border-cyan-500/50",
    icon: Radio,
    pulse: true,
  },
  DELIVERED: {
    label: "Delivered",
    text: "text-emerald-400",
    bg: "bg-emerald-950/60",
    border: "border-emerald-500/40",
    icon: CheckCircle2,
  },
  PROPOSED: {
    label: "Proposed",
    text: "text-indigo-300",
    bg: "bg-indigo-950/60",
    border: "border-indigo-500/40",
    icon: Clock,
  },
  APPROVED: {
    label: "Approved",
    text: "text-emerald-400",
    bg: "bg-emerald-950/60",
    border: "border-emerald-500/40",
    icon: CheckCircle2,
  },
  CANCELLED: {
    label: "Cancelled",
    text: "text-slate-400",
    bg: "bg-slate-900/60",
    border: "border-slate-700/60",
    icon: Info,
  },
  DEPLOYED: {
    label: "Deployed",
    text: "text-cyan-300",
    bg: "bg-cyan-950/70",
    border: "border-cyan-500/50",
    icon: Radio,
  },
  OFF_DUTY: {
    label: "Standby / Off-Duty",
    text: "text-slate-400",
    bg: "bg-slate-900/60",
    border: "border-slate-700/60",
    icon: Clock,
  },
};

export const StatusBadge = memo(function StatusBadge({ 
  value,
  customLabel,
  className = "" 
}: { 
  value: string; 
  customLabel?: string;
  className?: string;
}) {
  const normKey = (value || "").toUpperCase().trim();
  const cfg = BADGE_CONFIGS[normKey] || {
    label: value?.replace(/_/g, " ") || "UNKNOWN",
    text: "text-slate-300",
    bg: "bg-slate-800/80",
    border: "border-slate-700",
    icon: Info,
  };

  const Icon = cfg.icon;

  return (
    <span 
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono font-medium tracking-tight border ${cfg.border} ${cfg.bg} ${cfg.text} ${className}`}
      role="status"
    >
      <Icon size={12} className={`shrink-0 ${cfg.pulse ? "animate-pulse" : ""}`} />
      <span className="uppercase">{customLabel || cfg.label}</span>
    </span>
  );
});

/* ============================================================
   PAGE HEADER (Tactical, scannable, compact)
   ============================================================ */
export function PageHeader({
  title,
  subtitle,
  badge,
  action,
  freshness,
}: {
  title: string;
  subtitle?: string;
  badge?: React.ReactNode;
  action?: React.ReactNode;
  freshness?: string;
}) {
  return (
    <header className="mb-5 flex flex-wrap items-center justify-between gap-4 border-b border-eoc-border pb-3.5">
      <div className="min-w-0">
        <div className="flex items-center gap-2.5">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-eoc-text font-display">
            {title}
          </h1>
          {badge}
        </div>
        {(subtitle || freshness) && (
          <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-eoc-muted">
            {subtitle && <span>{subtitle}</span>}
            {freshness && (
              <span className="flex items-center gap-1 text-[11px] font-mono text-cyan-400/90" aria-live="polite">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
                {freshness}
              </span>
            )}
          </div>
        )}
      </div>
      {action && <div className="flex items-center gap-2 shrink-0">{action}</div>}
    </header>
  );
}

/* ============================================================
   PANEL (Tactical Dark Container with Hairline Border)
   ============================================================ */
export function Panel({
  title,
  badge,
  action,
  children,
  className = "",
  noPadding = false,
}: {
  title?: string;
  badge?: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
}) {
  return (
    <section
      className={`rounded-md border border-eoc-border bg-eoc-panel shadow-tactical overflow-hidden ${className}`}
    >
      {title && (
        <div className="flex items-center justify-between border-b border-eoc-border px-4 py-2.5 bg-eoc-panel2/60">
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-bold uppercase tracking-tactical text-eoc-muted font-mono">
              {title}
            </h2>
            {badge}
          </div>
          {action && <div className="text-xs flex items-center gap-2">{action}</div>}
        </div>
      )}
      <div className={noPadding ? "" : "p-4"}>{children}</div>
    </section>
  );
}

/* ============================================================
   STAT CARD (High-contrast, zero-jitter telemetry)
   ============================================================ */
const STAT_TONES = {
  default:  "border-eoc-border text-eoc-text",
  critical: "border-red-500/40 text-red-400 bg-red-950/20",
  warning:  "border-orange-500/40 text-orange-400 bg-orange-950/20",
  moderate: "border-amber-500/40 text-amber-300 bg-amber-950/20",
  normal:   "border-emerald-500/40 text-emerald-400 bg-emerald-950/20",
  info:     "border-cyan-500/40 text-cyan-400 bg-cyan-950/20",
} as const;

export const StatCard = memo(function StatCard({
  label,
  value,
  sub,
  tone = "default",
  icon: Icon,
  unit,
}: {
  label: string;
  value: React.ReactNode;
  sub?: string;
  tone?: keyof typeof STAT_TONES;
  icon?: any;
  unit?: string;
}) {
  const toneCls = STAT_TONES[tone] || STAT_TONES.default;
  return (
    <div
      className={`group relative rounded-md border bg-eoc-panel p-3.5 flex flex-col justify-between transition-colors shadow-tactical hover:border-eoc-border2 ${toneCls}`}
    >
      <div className="flex items-center justify-between text-xs text-eoc-muted mb-2 font-mono uppercase tracking-wider font-semibold">
        <span className="truncate">{label}</span>
        {Icon && <Icon size={14} className="shrink-0 opacity-70 group-hover:opacity-100 transition-opacity" />}
      </div>
      <div className="flex items-baseline gap-1.5 font-mono text-2xl sm:text-3xl font-bold tabular-nums tracking-tight">
        <span>{value ?? "0"}</span>
        {unit && <span className="text-xs font-normal text-eoc-muted">{unit}</span>}
      </div>
      {sub && (
        <div className="mt-2 text-[11px] text-eoc-subtle font-mono truncate">
          {sub}
        </div>
      )}
    </div>
  );
});

/* ============================================================
   SKELETON (Fixed-dimension, zero layout shift)
   ============================================================ */
export function Skeleton({ className = "h-4 w-full" }: { className?: string }) {
  return (
    <div 
      className={`rounded bg-eoc-panel2/80 animate-pulse border border-eoc-border/40 ${className}`} 
      aria-hidden="true" 
    />
  );
}

/* ============================================================
   EMPTY & ERROR STATES
   ============================================================ */
export function EmptyState({ 
  message, 
  title = "No Operational Records Found" 
}: { 
  message: string;
  title?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-md bg-eoc-panel2 text-eoc-muted border border-eoc-border">
        <InboxIcon size={20} />
      </div>
      <h3 className="text-sm font-semibold text-eoc-text">{title}</h3>
      <p className="mt-1 text-xs text-eoc-muted max-w-sm">{message}</p>
    </div>
  );
}

export function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div 
      className="flex items-center justify-between gap-4 rounded-md border border-red-500/50 bg-red-950/40 p-4 text-red-200"
      role="alert"
      aria-live="assertive"
    >
      <div className="flex items-center gap-3">
        <AlertTriangle size={18} className="text-red-400 shrink-0" />
        <div className="text-xs font-mono">
          <strong className="font-semibold block text-red-300">SYSTEM TELEMETRY FAULT:</strong>
          <span>{message}</span>
        </div>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-1.5 rounded border border-red-500/40 bg-red-900/60 px-3 py-1.5 text-xs font-mono text-white hover:bg-red-800 transition-colors shrink-0"
        >
          <RefreshCw size={12} />
          RETRY
        </button>
      )}
    </div>
  );
}

/* ============================================================
   TACTICAL BUTTON (ISO 11064 Touch & Keyboard Compliant)
   ============================================================ */
const BUTTON_VARIANTS = {
  primary:
    "bg-cyan-600 hover:bg-cyan-500 text-white font-semibold border border-cyan-400/50 shadow-tactical-accent",
  secondary:
    "bg-eoc-panel2 hover:bg-eoc-surface text-eoc-text border border-eoc-border2 hover:border-eoc-accent/50",
  danger:
    "bg-red-700 hover:bg-red-600 text-white font-semibold border border-red-400/50 shadow-tactical-crit",
  ghost:
    "text-eoc-muted hover:text-eoc-text hover:bg-eoc-panel2 border border-transparent",
  outline:
    "border border-eoc-border text-eoc-muted hover:text-eoc-text hover:border-eoc-border2",
} as const;

export const Button = memo(function Button({
  children,
  onClick,
  variant = "primary",
  disabled,
  title,
  type = "button",
  className = "",
  size = "md",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: keyof typeof BUTTON_VARIANTS;
  disabled?: boolean;
  title?: string;
  type?: "button" | "submit";
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const sizeClasses = {
    sm: "px-2.5 py-1 text-xs min-h-[30px]",
    md: "px-3.5 py-1.5 text-xs sm:text-sm min-h-[36px]",
    lg: "px-5 py-2.5 text-sm sm:text-base min-h-[44px]",
  }[size];

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`inline-flex items-center justify-center gap-1.5 rounded font-mono transition-all select-none disabled:cursor-not-allowed disabled:opacity-40 active:translate-y-px ${sizeClasses} ${BUTTON_VARIANTS[variant]} ${className}`}
    >
      {children}
    </button>
  );
});

/* ============================================================
   SELECT INPUT (Accessible with clear focus ring)
   ============================================================ */
export function SelectInput({
  value,
  onChange,
  children,
  className = "",
  id,
  ariaLabel,
}: {
  value: string;
  onChange: (v: string) => void;
  children: React.ReactNode;
  className?: string;
  id?: string;
  ariaLabel?: string;
}) {
  return (
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-label={ariaLabel}
      className={`rounded border border-eoc-border2 bg-eoc-panel px-3 py-1.5 text-xs font-mono text-eoc-text transition-colors hover:border-eoc-accent focus:outline-none focus:ring-1 focus:ring-cyan-400 ${className}`}
    >
      {children}
    </select>
  );
}
