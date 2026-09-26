import React, { useMemo } from 'react';
import { 
  Users, 
  Truck, 
  MapPin, 
  Clock, 
  Radio, 
  ShieldCheck, 
  Flame, 
  HeartHandshake,
  Activity
} from 'lucide-react';
import { useFetch } from '../hooks/useFetch';
import { DataTable } from '../components/DataTable';
import { Panel, StatusBadge, Button, PageHeader, StatCard } from '../components/ui';

export default function RescueTeamsPage() {
  const { data, loading, error, reload } = useFetch<any[]>('/rescue-teams');

  const teams = data || [];

  const availableCount = teams.filter((t) => t.availability === 'AVAILABLE').length;
  const deployedCount = teams.filter((t) => t.availability === 'DEPLOYED' || t.availability === 'ASSIGNED').length;
  const totalPersonnel = useMemo(() => teams.reduce((acc, t) => acc + (t.member_count || 0), 0), [teams]);
  const totalVehicles = useMemo(() => teams.reduce((acc, t) => acc + (t.vehicle_count || 0), 0), [teams]);

  return (
    <div className="space-y-4 font-sans">
      <PageHeader
        title="Field Rescue Teams & Task Forces"
        subtitle="Tactical search & rescue squads, specialized extraction units, and rapid disaster deployment rosters"
        freshness="GPS Telemetry Active"
        action={
          <Button variant="secondary" size="sm" onClick={reload}>
            SYNC ROSTER
          </Button>
        }
      />

      {/* Top Telemetry KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard 
          label="Available Units" 
          value={availableCount} 
          tone={availableCount > 0 ? "normal" : "critical"}
          icon={ShieldCheck}
          sub="Immediate deployment ready"
        />
        <StatCard 
          label="Deployed In Field" 
          value={deployedCount} 
          tone={deployedCount > 0 ? "warning" : "normal"}
          icon={Radio}
          sub="Active mission operations"
        />
        <StatCard 
          label="Field Responders" 
          value={totalPersonnel} 
          tone="info"
          icon={Users}
          sub="Sworn rescue specialists"
        />
        <StatCard 
          label="Assigned Vehicles" 
          value={totalVehicles} 
          tone="normal"
          icon={Truck}
          sub="Heavy tenders & ambulances"
        />
      </div>

      {/* Rescue Teams Table */}
      <Panel title="Tactical Field Units Roster">
        <DataTable
          loading={loading}
          error={error}
          onRetry={reload}
          rows={teams}
          emptyMessage="No rescue teams found."
          columns={[
            { 
              header: 'Task Force / Unit', 
              render: (t: any) => (
                <div>
                  <div className="font-semibold text-eoc-text flex items-center gap-1.5">
                    <Users size={13} className="text-cyan-400" />
                    <span>{t.team_name}</span>
                  </div>
                  <div className="text-[10px] font-mono text-eoc-muted">
                    CODE: {t.team_code} · {t.location_label || 'Central Station'}
                  </div>
                </div>
              ) 
            },
            { 
              header: 'Specialization', 
              render: (t: any) => (
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-eoc-panel2 border border-eoc-border text-cyan-300 font-medium">
                  {t.specialization?.replace(/_/g, ' ')}
                </span>
              ) 
            },
            { 
              header: 'Personnel', 
              render: (t: any) => (
                <span className="font-mono text-xs font-semibold tabular-nums text-eoc-text">
                  {t.member_count} responders
                </span>
              ) 
            },
            { 
              header: 'Vehicles', 
              render: (t: any) => (
                <span className="font-mono text-xs tabular-nums text-eoc-muted">
                  {t.vehicle_count} units
                </span>
              ) 
            },
            { 
              header: 'Avg Response Time', 
              render: (t: any) => (
                <span className="font-mono text-xs text-emerald-400 tabular-nums">
                  {t.avg_response_minutes ?? '8'} mins
                </span>
              ) 
            },
            { 
              header: 'Readiness Status', 
              render: (t: any) => <StatusBadge value={t.availability} /> 
            },
          ]}
        />
      </Panel>
    </div>
  );
}
