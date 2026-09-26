import React from 'react';
import { Truck, CheckCircle2, Radio, Wrench, ShieldCheck } from 'lucide-react';
import { useFetch } from '../hooks/useFetch';
import { DataTable } from '../components/DataTable';
import { Panel, StatusBadge, PageHeader, StatCard, Button } from '../components/ui';

export default function VehiclesPage() {
  const { data, loading, error, reload } = useFetch<any[]>('/vehicles');

  const vehicles = data || [];
  const available = vehicles.filter((v) => v.status === 'AVAILABLE').length;
  const deployed = vehicles.filter((v) => v.status === 'DEPLOYED' || v.status === 'ASSIGNED').length;
  const maintenance = vehicles.filter((v) => v.status === 'MAINTENANCE').length;

  return (
    <div className="space-y-4 font-sans">
      <PageHeader
        title="Emergency Vehicle Fleet & Mobile Units"
        subtitle="Operational status of ambulances, heavy fire tenders, flood evacuation boats, and logistical haulers"
        freshness="Fleet Telemetry Active"
        action={
          <Button variant="secondary" size="sm" onClick={reload}>
            SYNC FLEET
          </Button>
        }
      />

      {/* Top Telemetry KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard 
          label="Total Fleet Units" 
          value={vehicles.length} 
          tone="info"
          icon={Truck}
          sub="Registered mobile assets"
        />
        <StatCard 
          label="Available For Callout" 
          value={available} 
          tone={available > 0 ? "normal" : "critical"}
          icon={CheckCircle2}
          sub="In station ready"
        />
        <StatCard 
          label="Active In Mission" 
          value={deployed} 
          tone={deployed > 0 ? "warning" : "normal"}
          icon={Radio}
          sub="Dispatched to emergency calls"
        />
        <StatCard 
          label="In Maintenance" 
          value={maintenance} 
          tone={maintenance > 0 ? "warning" : "normal"}
          icon={Wrench}
          sub="Undergoing service"
        />
      </div>

      <Panel title="Municipal Fleet Registry">
        <DataTable
          loading={loading}
          error={error}
          onRetry={reload}
          rows={vehicles}
          emptyMessage="No vehicles found."
          columns={[
            { 
              header: 'Unit Code', 
              render: (v: any) => (
                <div className="font-mono text-xs font-bold text-cyan-400">
                  {v.vehicle_code}
                </div>
              ) 
            },
            { 
              header: 'Vehicle Class', 
              render: (v: any) => (
                <span className="font-mono text-xs uppercase text-eoc-text font-semibold">
                  {v.vehicle_type?.replace(/_/g, ' ')}
                </span>
              ) 
            },
            { 
              header: 'Assigned Squad', 
              render: (v: any) => (
                <span className="font-mono text-xs text-eoc-muted">
                  {v.team_code ? `Task Force ${v.team_code}` : '— UNASSIGNED —'}
                </span>
              ) 
            },
            { 
              header: 'Depot / Station', 
              render: (v: any) => (
                <span className="font-mono text-xs text-eoc-muted">
                  {v.location_label || 'Central Station'}
                </span>
              ) 
            },
            { 
              header: 'Payload Capacity', 
              render: (v: any) => (
                <span className="font-mono text-xs tabular-nums text-eoc-text">
                  {v.capacity ? `${v.capacity} pax/tons` : '—'}
                </span>
              ) 
            },
            { 
              header: 'Operational Status', 
              render: (v: any) => <StatusBadge value={v.status} /> 
            },
          ]}
        />
      </Panel>
    </div>
  );
}
