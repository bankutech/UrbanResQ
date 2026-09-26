import React, { useState, useMemo, useCallback, useEffect, useRef, memo } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Radio,
  Flame,
  ClipboardList,
  Boxes,
  Package,
  Send,
  AlertTriangle,
  Users,
  Truck,
  Building2,
  Home,
  HeartHandshake,
  FlaskConical,
  BarChart3,
  FileText,
  ScrollText,
  Settings,
  LogOut,
  Search,
  Database,
  Sun,
  Moon,
  Menu,
  X,
  Bell,
  Camera,
  Activity,
  Shield,
  UserCheck,
  ChevronDown
} from "lucide-react";
import { useAuth, DEMO_ACCOUNTS } from "../hooks/useAuth";
import { useTheme } from "../hooks/useTheme";
import { useNotifications } from "../contexts/NotificationContext";
import { useSocketStatus } from "../hooks/useSocket";
import { LiveTicker } from "../components/LiveTicker";
import { CommandPalette } from "../components/CommandPalette";
import { AIDispatchAssistant } from "../components/AIDispatchAssistant";
import { DefconBanner } from "../components/DefconBanner";

type NavItem = {
  section?: string;
  to?: string;
  label?: string;
  icon?: any;
  roles?: string[];
  badge?: string;
};

const NAV: NavItem[] = [
  { section: "Operations" },
  {
    to: "/command-center",
    label: "Command Center",
    icon: Radio,
    badge: "COCKPIT",
  },
  { to: "/dashboard", label: "Overview", icon: LayoutDashboard },
  {
    to: "/drone-feed",
    label: "UAV Live Feed",
    icon: Camera,
    roles: ["EMERGENCY_MANAGER", "RESCUE_COORDINATOR"],
  },
  { section: "Incidents" },
  {
    to: "/disasters",
    label: "Disasters",
    icon: Flame,
    roles: ["EMERGENCY_MANAGER", "DISASTER_OFFICER"],
  },
  {
    to: "/emergency-requests",
    label: "Emergency Requests",
    icon: ClipboardList,
    roles: ["EMERGENCY_MANAGER", "DISASTER_OFFICER", "MEDICAL_COORDINATOR"],
  },
  {
    to: "/allocations",
    label: "Resource Allocation",
    icon: Send,
    roles: ["EMERGENCY_MANAGER", "RESOURCE_MANAGER"],
    badge: "FIFO",
  },
  { section: "Logistics" },
  {
    to: "/inventory",
    label: "Inventory Depots",
    icon: Package,
    roles: ["RESOURCE_MANAGER"],
  },
  {
    to: "/shortages",
    label: "Critical Shortages",
    icon: AlertTriangle,
    roles: ["RESOURCE_MANAGER"],
  },
  {
    to: "/resources",
    label: "Resource Catalog",
    icon: Boxes,
    roles: ["RESOURCE_MANAGER"],
  },
  {
    to: "/vehicles",
    label: "Vehicle Fleet",
    icon: Truck,
    roles: ["RESCUE_COORDINATOR", "RESOURCE_MANAGER"],
  },
  { section: "Facilities" },
  {
    to: "/hospitals",
    label: "Hospitals & ER",
    icon: Building2,
    roles: ["MEDICAL_COORDINATOR", "EMERGENCY_MANAGER"],
  },
  {
    to: "/shelters",
    label: "Relief Shelters",
    icon: Home,
    roles: ["MEDICAL_COORDINATOR", "EMERGENCY_MANAGER"],
  },
  {
    to: "/rescue-teams",
    label: "Rescue Teams",
    icon: Users,
    roles: ["RESCUE_COORDINATOR", "EMERGENCY_MANAGER"],
  },
  {
    to: "/volunteers",
    label: "Volunteers Roster",
    icon: HeartHandshake,
    roles: ["RESCUE_COORDINATOR", "EMERGENCY_MANAGER"],
  },
  { section: "Intelligence" },
  {
    to: "/analytics",
    label: "Predictive Analytics",
    icon: BarChart3,
    roles: ["VIEWER", "EMERGENCY_MANAGER"],
  },
  {
    to: "/simulations",
    label: "What-If Simulation",
    icon: FlaskConical,
    roles: ["EMERGENCY_MANAGER"],
  },
  {
    to: "/database-intelligence",
    label: "DB Intelligence",
    icon: Database,
    roles: ["VIEWER", "EMERGENCY_MANAGER", "ADMIN"],
  },
  {
    to: "/reports",
    label: "Operations Reports",
    icon: FileText,
    roles: ["VIEWER", "EMERGENCY_MANAGER"],
  },
  { section: "System" },
  {
    to: "/audit-logs",
    label: "Audit Logs",
    icon: ScrollText,
    roles: ["VIEWER", "ADMIN", "EMERGENCY_MANAGER"],
  },
  {
    to: "/settings",
    label: "System Settings",
    icon: Settings,
    roles: ["EMERGENCY_MANAGER"],
  },
];

const MissionClock = memo(function MissionClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const utcTime = now.toUTCString().slice(17, 25);
  const localTime = now.toLocaleTimeString(undefined, { hour12: false });

  return (
    <div className="hidden xl:flex items-center gap-3 border-l border-eoc-border pl-3 text-xs font-mono">
      <div className="flex flex-col leading-none">
        <span className="font-semibold text-eoc-text tabular-nums">{localTime} <span className="text-[10px] text-eoc-muted">LOC</span></span>
        <span className="text-[10px] text-cyan-400 tabular-nums mt-0.5">{utcTime} <span className="text-[9px] text-eoc-muted">UTC</span></span>
      </div>
    </div>
  );
});

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, logout, switchRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { status: socketStatus, latencyMs } = useSocketStatus();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [roleSwitcherOpen, setRoleSwitcherOpen] = useState(false);
  const { alerts, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const notifRef = useRef<HTMLDivElement>(null);
  const roleRef = useRef<HTMLDivElement>(null);

  const isCockpit = location.pathname === "/command-center" || location.pathname === "/";

  const visibleNav = useMemo(
    () =>
      NAV.filter((item: NavItem) => {
        if (item.section) return true;
        if (!item.roles || item.roles.length === 0) return true;
        return user?.roles?.some(
          (r: string) => item.roles!.includes(r) || r === "ADMIN",
        );
      }).filter((item: NavItem, index: number, arr: NavItem[]) => {
        if (item.section) {
          const nextItem = arr[index + 1];
          return nextItem && !nextItem.section;
        }
        return true;
      }),
    [user?.roles],
  );

  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
      setNotificationsOpen(false);
    }
    if (roleRef.current && !roleRef.current.contains(event.target as Node)) {
      setRoleSwitcherOpen(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [handleClickOutside]);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = useCallback(() => {
    logout();
    navigate("/login");
  }, [logout, navigate]);

  return (
    <div className="flex h-screen flex-col bg-eoc-bg text-eoc-text font-sans overflow-hidden">
      {/* Top Incident Defcon Banner */}
      <DefconBanner />

      <div className="flex flex-1 overflow-hidden relative">
        {/* Mobile Backdrop */}
        {mobileMenuOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm md:hidden"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* Tactical EOC Sidebar */}
        <aside
          className={`
            fixed inset-y-0 left-0 z-50 flex w-60 flex-col
            border-r border-eoc-border bg-eoc-panel shadow-tactical
            transition-transform duration-200 ease-in-out
            md:static md:translate-x-0
            ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
          `}
          aria-label="Operations Navigation"
        >
          {/* Brand & Defcon Title */}
          <div className="flex items-center justify-between border-b border-eoc-border px-3.5 py-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded border border-cyan-500/40 bg-cyan-950/80 text-cyan-400 font-mono font-bold text-xs shadow-tactical-accent">
                UQ
              </div>
              <div>
                <div className="text-sm font-bold tracking-tight text-eoc-text font-display flex items-center gap-1.5">
                  UrbanResQ
                  <span className="text-[9px] font-mono px-1 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/60">
                    EOC v3.2
                  </span>
                </div>
                <div className="text-[10px] font-mono text-eoc-muted tracking-wider">
                  TACTICAL CRISIS DESK
                </div>
              </div>
            </div>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="md:hidden p-1 text-eoc-muted hover:text-eoc-text"
              aria-label="Close menu"
            >
              <X size={16} />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 overflow-y-auto px-2 py-2 space-y-0.5 text-xs">
            {visibleNav.map((item: NavItem, index: number) => {
              if (item.section) {
                return (
                  <div
                    key={`section-${index}`}
                    className="mt-3.5 mb-1 px-2 text-[10px] font-mono font-bold uppercase tracking-tactical text-eoc-muted"
                  >
                    {item.section}
                  </div>
                );
              }
              const { to, label, icon: Icon, badge } = item;
              if (!to) return null;
              return (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    `group flex items-center justify-between px-2.5 py-1.5 rounded font-mono text-xs transition-colors ${
                      isActive
                        ? "bg-cyan-950/70 border border-cyan-500/50 text-cyan-300 font-semibold shadow-tactical-accent"
                        : "text-eoc-muted hover:bg-eoc-panel2 hover:text-eoc-text border border-transparent"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <div className="flex items-center gap-2 truncate">
                        <Icon size={14} className={isActive ? "text-cyan-400 shrink-0" : "text-eoc-subtle group-hover:text-eoc-text shrink-0"} />
                        <span className="truncate">{label}</span>
                      </div>
                      {badge && (
                        <span className="text-[9px] font-mono px-1 rounded bg-eoc-panel3 border border-eoc-border text-eoc-muted">
                          {badge}
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>

          {/* Operator Status & Role Switcher Footer */}
          <div className="border-t border-eoc-border p-2.5 bg-eoc-panel2/50">
            <div className="relative" ref={roleRef}>
              <button
                onClick={() => setRoleSwitcherOpen(!roleSwitcherOpen)}
                className="w-full flex items-center justify-between gap-2 p-1.5 rounded border border-eoc-border hover:border-cyan-500/40 bg-eoc-panel text-left transition-colors"
                title="Switch EOC Operator Role (Quick Drill Switcher)"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                    <span className="truncate text-xs font-semibold text-eoc-text">
                      {user?.fullName || "Operator"}
                    </span>
                  </div>
                  <div className="truncate text-[10px] font-mono text-cyan-400 uppercase tracking-tight">
                    {user?.roles?.[0]?.replace(/_/g, " ") || "OPERATOR"}
                  </div>
                </div>
                <ChevronDown size={13} className="text-eoc-muted" />
              </button>

              {roleSwitcherOpen && (
                <div className="absolute bottom-full left-0 mb-1 w-full rounded border border-cyan-500/40 bg-eoc-panel p-1 shadow-tactical-accent z-50">
                  <div className="px-2 py-1 text-[10px] font-mono font-bold text-eoc-muted border-b border-eoc-border mb-1 uppercase">
                    EOC Operator Drill Role
                  </div>
                  {Object.entries(DEMO_ACCOUNTS).map(([roleKey, acc]) => {
                    const isCurrent = user?.roles?.includes(roleKey) || (roleKey === 'ADMIN' && user?.roles?.includes('ADMIN'));
                    return (
                      <button
                        key={roleKey}
                        onClick={async () => {
                          setRoleSwitcherOpen(false);
                          await switchRole(roleKey);
                        }}
                        className={`w-full text-left px-2 py-1 rounded text-[11px] font-mono flex items-center justify-between transition-colors ${
                          isCurrent ? "bg-cyan-950/80 text-cyan-300 font-bold" : "text-eoc-muted hover:bg-eoc-panel2 hover:text-eoc-text"
                        }`}
                      >
                        <span className="truncate">{acc.label}</span>
                        {isCurrent && <UserCheck size={12} className="text-cyan-400 shrink-0 ml-1" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <button
              onClick={handleLogout}
              className="mt-2 flex w-full items-center justify-center gap-1.5 rounded border border-eoc-border py-1 text-[11px] font-mono text-eoc-muted hover:text-red-400 hover:border-red-500/40 hover:bg-red-950/20 transition-colors"
            >
              <LogOut size={12} />
              DISCONNECT SESSION
            </button>
          </div>
        </aside>

        {/* Cockpit & Main Workspace */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Tactical Command Header */}
          <header className="flex h-12 shrink-0 items-center justify-between border-b border-eoc-border bg-eoc-panel px-3 sm:px-4 z-10">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="md:hidden text-eoc-muted hover:text-eoc-text p-1"
                aria-label="Open navigation drawer"
              >
                <Menu size={18} />
              </button>

              {/* Quick Command Palette Button */}
              <button
                onClick={() => {
                  window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }));
                }}
                className="flex items-center gap-2 rounded border border-eoc-border bg-eoc-panel2 px-2.5 py-1 text-xs font-mono text-eoc-muted hover:text-cyan-400 hover:border-cyan-500/40 transition-colors"
                title="Open Tactical Command Palette (Cmd+K)"
              >
                <Search size={13} className="text-cyan-400" />
                <span className="hidden sm:inline">Tactical Dispatch...</span>
                <kbd className="hidden sm:inline rounded bg-eoc-panel px-1 text-[10px] border border-eoc-border text-eoc-subtle">
                  ⌘K
                </kbd>
              </button>
            </div>

            {/* Right Telemetry Controls */}
            <div className="flex items-center gap-2.5">
              {/* Live Socket.IO Status Pill */}
              <div 
                className={`flex items-center gap-1.5 px-2 py-0.5 rounded border text-[11px] font-mono ${
                  socketStatus === 'CONNECTED'
                    ? 'border-emerald-500/40 bg-emerald-950/40 text-emerald-400'
                    : socketStatus === 'RECONNECTING'
                    ? 'border-amber-500/40 bg-amber-950/40 text-amber-300 animate-pulse'
                    : 'border-red-500/40 bg-red-950/40 text-red-400'
                }`}
                title={`Socket Telemetry: ${socketStatus} (${latencyMs}ms latency)`}
                role="status"
              >
                <span className={`h-1.5 w-1.5 rounded-full ${
                  socketStatus === 'CONNECTED' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                }`} />
                <span className="hidden md:inline font-semibold">{socketStatus}</span>
                <span className="text-[10px] text-eoc-muted tabular-nums">{latencyMs}ms</span>
              </div>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                title={theme === "dark" ? "Switch to Field Daylight Mode" : "Switch to Tactical Dark Mode"}
                className="rounded border border-eoc-border p-1.5 text-eoc-muted hover:text-eoc-text hover:bg-eoc-panel2 transition-colors"
                aria-label="Toggle visual mode"
              >
                {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
              </button>

              {/* Notifications Center */}
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  className="relative rounded border border-eoc-border p-1.5 text-eoc-muted hover:text-eoc-text hover:bg-eoc-panel2 transition-colors"
                  aria-label="Incident Notifications"
                >
                  <Bell size={15} />
                  {unreadCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[9px] font-bold text-white shadow-tactical-crit font-mono">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </button>

                {notificationsOpen && (
                  <div className="absolute right-0 mt-2 w-80 rounded border border-cyan-500/40 bg-eoc-panel shadow-tactical-accent z-50 flex flex-col max-h-[75vh] overflow-hidden">
                    <div className="flex items-center justify-between border-b border-eoc-border bg-eoc-panel2 px-3 py-2">
                      <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-eoc-text">
                        <Activity size={13} className="text-cyan-400" />
                        INCIDENT ALERTS
                      </div>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllAsRead}
                          className="text-[10px] font-mono text-cyan-400 hover:underline"
                        >
                          ACKNOWLEDGE ALL
                        </button>
                      )}
                    </div>
                    <div className="flex-1 overflow-y-auto">
                      {alerts.length === 0 ? (
                        <div className="p-4 text-center text-xs font-mono text-eoc-muted">
                          ZERO ACTIVE TELEMETRY ALERTS
                        </div>
                      ) : (
                        alerts.map((alert) => (
                          <div
                            key={alert.alert_id}
                            className={`flex gap-2.5 border-b border-eoc-border px-3 py-2.5 hover:bg-eoc-panel2 cursor-pointer font-mono ${
                              !alert.is_acknowledged ? "bg-cyan-950/20" : ""
                            }`}
                            onClick={() => !alert.is_acknowledged && markAsRead(alert.alert_id)}
                          >
                            <span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${
                              alert.severity === "CRITICAL" ? "bg-red-500 animate-ping" 
                              : alert.severity === "WARNING" ? "bg-orange-500" 
                              : "bg-cyan-400"
                            }`} />
                            <div className="flex-1 min-w-0">
                              <div className="text-xs font-semibold text-eoc-text truncate">
                                {alert.alert_type}
                              </div>
                              <div className="mt-0.5 text-[11px] text-eoc-muted line-clamp-2">
                                {alert.message}
                              </div>
                              <div className="mt-1 text-[9px] text-eoc-subtle">
                                {new Date(alert.created_at).toLocaleTimeString()}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Tabular Mission Clock */}
              <MissionClock />
            </div>
          </header>

          {/* Main Content Area */}
          <main 
            className={`flex-1 overflow-y-auto pb-9 ${
              isCockpit 
                ? "p-2 sm:p-3" 
                : "p-4 sm:p-6 lg:p-7 max-w-7xl mx-auto w-full"
            }`}
          >
            {children}
          </main>
        </div>
      </div>

      {/* Global Interactive Elements */}
      <LiveTicker />
      <CommandPalette />
      <AIDispatchAssistant />
    </div>
  );
}
