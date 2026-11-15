import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from "recharts";
import { useNavigate } from "react-router-dom";
import { 
  Flame, 
  AlertOctagon, 
  Users, 
  ClipboardList, 
  Truck, 
  Building2, 
  Home, 
  AlertTriangle,
  ChevronRight,
  Activity
} from "lucide-react";
import { useFetch } from "../hooks/useFetch";
import { useSocket } from "../hooks/useSocket";
import {
  Panel,
  StatCard,
  StatusBadge,
  Skeleton,
  ErrorState,
  PageHeader,
  Button
} from "../components/ui";


const TacticalSeverityTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    const count = Number(data.value) || 0;
    const color = data.payload?.fill || SEVERITY_COLORS[data.name] || '#06B6D4';
    return (
      <div className="border border-cyan-500/50 bg-[#0C121E]/95 px-3 py-2 shadow-2xl backdrop-blur-md font-mono text-xs">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full shadow-[0_0_8px]" style={{ backgroundColor: color }} />
          <span className="font-bold tracking-wider text-white uppercase">{data.name} SEVERITY</span>
        </div>
        <div className="mt-1 flex items-baseline gap-2">
          <span className="text-base font-black text-cyan-400 tabular-nums">{count}</span>
          <span className="text-[10px] text-slate-300">Declared Incidents</span>
        </div>
      </div>
    );
  }
  return null;
};

const SEVERITY_COLORS: Record<string, string> = {
  CRITICAL: "#EF4444",
  HIGH: "#F97316",
  MODERATE: "#EAB308",
  LOW: "#10B981",
};

export default function DashboardPage() {
  const { data, loading, error, reload } = useFetch<any>("/dashboard");
  const navigate = useNavigate();

  useSocket("database_updated", reload);

  if (error) return <ErrorState message={error} onRetry={reload} />;

  const status = data?.status || {};
  const trend = (Array.isArray(data?.trend) ? data.trend : []).map((t: any) => ({ ...t, request_count: Number(t.request_count) }));
  const severity = (Array.isArray(data?.severity) ? data.severity : []).map((s: any) => ({ ...s, disaster_count: Number(s.disaster_count) }));
  const disasters = Array.isArray(data?.disasters) ? data.disasters : [];
  const utilization = (Array.isArray(data?.utilization) ? data.utilization : []).map((u: any) => ({ ...u, utilization_pct: Number(u.utilization_pct) }));
  const activity = Array.isArray(data?.activity) ? data.activity : [];

  return (
    <div className="space-y-4 font-sans">
      <PageHeader 
        title="Municipal Emergency Overview" 
        subtitle="Real-time multi-agency operations dashboard and resource readiness telemetry"
        freshness="Live EOC Database Mirror Synchronized"
        action={
          <div className="flex items-center gap-2">
            <Button variant="primary" size="sm" onClick={() => navigate('/command-center')}>
              <Activity size={13} />
              OPEN COCKPIT
            </Button>
            <Button variant="secondary" size="sm" onClick={reload}>
              SYNC
            </Button>
          </div>
        }
      />

      {/* 8-Card Telemetry Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {loading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))
        ) : (
          <>
            <StatCard
              label="Active Disasters"
              value={status.active_disasters ?? "0"}
              tone={(status.active_disasters ?? 0) > 0 ? "critical" : "normal"}
              icon={Flame}
              sub="Jurisdictional declarations"
            />
            <StatCard
              label="Critical Incidents"
              value={status.critical_incidents ?? "0"}
              tone="critical"
              icon={AlertOctagon}
              sub="Immediate life-threat events"
            />
            <StatCard
              label="Citizens Affected"
              value={status.people_affected?.toLocaleString?.() ?? status.people_affected ?? "0"}
              tone="warning"
              icon={Users}
              sub="In declared impact zones"
            />
            <StatCard
              label="Unresolved Requests"
              value={status.unresolved_requests ?? "0"}
              tone="warning"
              icon={ClipboardList}
              sub="Pending triage dispatch"
            />
            <StatCard
              label="Available Rescue Squads"
              value={status.available_rescue_teams ?? "0"}
              sub={`${status.deployed_rescue_teams ?? 0} units active in field`}
              tone="normal"
              icon={Truck}
            />
            <StatCard
              label="Hospital Bed Load"
              value={`${status.hospital_occupancy_pct ?? 0}%`}
              tone={(status.hospital_occupancy_pct ?? 0) > 80 ? "critical" : "normal"}
              icon={Building2}
              sub="Overall ER & ICU occupancy"
            />
            <StatCard
              label="Shelter Capacity Load"
              value={`${status.shelter_occupancy_pct ?? 0}%`}
              tone={(status.shelter_occupancy_pct ?? 0) > 80 ? "warning" : "normal"}
              icon={Home}
              sub="Evacuee intake density"
            />
            <StatCard
              label="Critical Supply Deficits"
              value={status.critical_shortages ?? "0"}
              tone={(status.critical_shortages ?? 0) > 0 ? "critical" : "normal"}
              icon={AlertTriangle}
              sub="Depot lines below min buffer"
            />
          </>
        )}
      </div>

      {/* Visual Analytics Split Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <Panel
          title="Emergency Request Trajectory (14-Day Velocity)"
          className="lg:col-span-2"
        >
          {loading ? (
            <Skeleton className="h-64" />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={trend}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(148, 163, 184, 0.1)"
                />
                <XAxis
                  dataKey="day"
                  tick={{ fill: "#94A3B8", fontSize: 10, fontFamily: 'monospace' }}
                  tickFormatter={(d) =>
                    new Date(d).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                    })
                  }
                />
                <YAxis
                  tick={{ fill: "#94A3B8", fontSize: 10, fontFamily: 'monospace' }}
                />
                <Tooltip
                  contentStyle={{
                    background: "#0F1623",
                    border: "1px solid rgba(148, 163, 184, 0.2)",
                    borderRadius: 4,
                    fontSize: 11,
                    color: "#F8FAFC",
                    fontFamily: 'monospace'
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="request_count"
                  name="Gross Requests"
                  stroke="#06B6D4"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="critical_count"
                  name="Tier-1 Critical"
                  stroke="#EF4444"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </Panel>

        <Panel title="Incident Severity Breakdown">
          {loading ? (
            <Skeleton className="h-64" />
          ) : (
            <div className="flex flex-col">
              <div className="relative flex items-center justify-center">
                <ResponsiveContainer width="100%" height={210}>
                  <PieChart>
                    <Pie
                      data={severity}
                      dataKey="disaster_count"
                      nameKey="severity"
                      innerRadius={55}
                      outerRadius={82}
                      paddingAngle={4}
                    >
                      {severity.map((s: any, i: number) => (
                        <Cell
                          key={i}
                          fill={SEVERITY_COLORS[s.severity] || "#94A3B8"}
                          stroke="#090D16"
                          strokeWidth={2}
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<TacticalSeverityTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-2xl font-black font-mono text-white tabular-nums tracking-tight">
                    {(severity || []).reduce((acc: number, curr: any) => acc + (Number(curr.disaster_count) || 0), 0)}
                  </span>
                  <span className="text-[9px] font-mono uppercase tracking-wider text-cyan-400 font-semibold">
                    Incidents
                  </span>
                </div>
              </div>

              <div className="mt-2 flex flex-wrap items-center justify-center gap-2 font-mono text-[11px] pt-2 border-t border-slate-800/60">
                {(severity || []).map((s: any) => (
                  <div key={s.severity} className="flex items-center gap-1.5 px-2 py-0.5 border border-slate-800/80 bg-[#0A0E17]/80">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: SEVERITY_COLORS[s.severity] || '#94A3B8' }} />
                    <span className="text-slate-300 font-medium text-[10px]">{s.severity}</span>
                    <span className="text-white font-bold text-[10px] tabular-nums">({s.disaster_count})</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Panel>
      </div>

      {/* Active Disasters & Resource Utilization */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <Panel title="Active Incident Declarations" className="lg:col-span-2">
          {loading ? (
            <Skeleton className="h-48" />
          ) : (
            <div className="space-y-2">
              {disasters.map((d: any) => (
                <div
                  key={d.disaster_id}
                  onClick={() => navigate(`/disasters/${d.disaster_id}`)}
                  className="flex cursor-pointer items-center justify-between rounded border border-eoc-border bg-eoc-panel2/50 p-3 hover:border-cyan-500/40 hover:bg-eoc-surface transition-colors gap-3"
                >
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-eoc-text truncate">{d.title}</div>
                    <div className="text-[11px] font-mono text-eoc-muted mt-0.5">
                      {d.zone_count} municipal zones · {d.unresolved_requests} unresolved calls · {d.critical_requests} critical
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge value={d.severity} />
                    <ChevronRight size={14} className="text-eoc-muted" />
                  </div>
                </div>
              ))}
              {disasters.length === 0 && (
                <div className="py-6 text-center text-xs font-mono text-eoc-muted">
                  ZERO ACTIVE DISASTER DECLARATIONS
                </div>
              )}
            </div>
          )}
        </Panel>

        <Panel title="Critical Logistics Utilization">
          {loading ? (
            <Skeleton className="h-48" />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                data={utilization}
                layout="vertical"
                margin={{ left: 10 }}
              >
                <XAxis
                  type="number"
                  tick={{ fill: "#94A3B8", fontSize: 10, fontFamily: 'monospace' }}
                  domain={[0, 100]}
                />
                <YAxis
                  dataKey="resource_type_name"
                  type="category"
                  width={110}
                  tick={{ fill: "#94A3B8", fontSize: 10, fontFamily: 'monospace' }}
                />
                <Tooltip
                  contentStyle={{
                    background: "#0F1623",
                    border: "1px solid rgba(148, 163, 184, 0.2)",
                    borderRadius: 4,
                    fontSize: 11,
                    color: "#F8FAFC",
                    fontFamily: 'monospace'
                  }}
                />
                <Bar
                  dataKey="utilization_pct"
                  fill="#06B6D4"
                  radius={[0, 3, 3, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Panel>
      </div>

      {/* Recent Activity Audit Log Snippet */}
      <Panel title="Recent EOC Operations Journal" className="font-mono text-xs">
        {loading ? (
          <Skeleton className="h-32" />
        ) : (
          <div className="space-y-1 text-xs">
            {activity.slice(0, 6).map((a: any) => (
              <div
                key={a.audit_id}
                className="flex items-center justify-between border-b border-eoc-border/40 py-1.5"
              >
                <span className="text-eoc-text">
                  <strong className="text-cyan-300">[{a.action}]</strong> {a.entity_type?.replace(/_/g, " ")} #{a.entity_id}
                </span>
                <span className="text-eoc-muted text-[10px] tabular-nums">
                  {new Date(a.created_at).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
}
