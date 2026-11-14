import React, { useState } from 'react';
import { Truck, CheckCircle2, Radio, Wrench, RotateCcw, AlertCircle } from 'lucide-react';
import { useFetch } from '../hooks/useFetch';
import { api, apiErrorMessage } from '../api/client';
import { DataTable } from '../components/DataTable';
import { Panel, StatusBadge, PageHeader, StatCard, Button, ErrorState } from '../components/ui';
import { useAuth } from '../hooks/useAuth';

export default function VehiclesPage() {
  const { hasRole } = useAuth();
  const { data, loading, error, reload } = useFetch<any[]>('/vehicles');
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const canManage = hasRole('EMERGENCY_MANAGER', 'RESCUE_COORDINATOR', 'ADMIN');
  const vehicles = data || [];
  const available = vehicles.filter((v) => v.status === 'AVAILABLE').length;
  const deployed = vehicles.filter((v) => v.status === 'DEPLOYED' || v.status === 'ASSIGNED').length;
  const maintenance = vehicles.filter((v) => v.status === 'MAINTENANCE').length;

  async function handleReturn(vehicleId: string) {
    setActionError(null);
    setActionSuccess(null);
    setUpdatingId(vehicleId);
    try {
      await api.post(`/vehicles/${vehicleId}/return`);
      setActionSuccess(`Vehicle ${vehicleId} recalled to depot successfully.`);
      setTimeout(() => setActionSuccess(null), 4000);
      reload();
    } catch (err) {
      setActionError(apiErrorMessage(err));
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleSetStatus(vehicleId: string, status: string) {
    setActionError(null);
    setActionSuccess(null);
    setUpdatingId(vehicleId);
    try {
      await api.patch(`/vehicles/${vehicleId}/status`, { status });
      setActionSuccess(`Vehicle ${vehicleId} transitioned to ${status}.`);
      setTimeout(() => setActionSuccess(null), 4000);
      reload();
    } catch (err) {
      setActionError(apiErrorMessage(err));
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div className="space-y-4 font-sans">
      <PageHeader
        title="Emergency Vehicle Fleet & Mobile Units"
        subtitle="Fleet operational availability, mission deployments, and depot recovery"
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

      {actionError && <ErrorState message={actionError} />}
      {actionSuccess && (
        <div 
          role="status" 
          aria-live="polite"
          className="flex items-center gap-2 rounded-md border border-emerald-500/40 bg-emerald-950/40 px-3.5 py-2.5 text-xs font-mono text-emerald-300 shadow-tactical animate-fade-in"
        >
          <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

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
            {
              header: 'Fleet Command Actions',
              render: (v: any) => {
                if (!canManage) {
                  return <span className="text-[10px] font-mono text-eoc-subtle">—</span>;
                }
                const isBusy = updatingId === v.vehicle_id;
                if (v.status === 'DEPLOYED' || v.status === 'ASSIGNED') {
                  return (
                    <Button
                      variant="secondary"
                      size="sm"
                      disabled={isBusy}
                      onClick={() => handleReturn(v.vehicle_id)}
                      className="text-cyan-400 hover:text-cyan-300"
                    >
                      <RotateCcw size={12} />
                      Recall to Depot
                    </Button>
                  );
                }
                if (v.status === 'MAINTENANCE') {
                  return (
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={isBusy}
                      onClick={() => handleSetStatus(v.vehicle_id, 'AVAILABLE')}
                      className="text-emerald-400 hover:text-emerald-300 border border-emerald-500/30"
                    >
                      <CheckCircle2 size={12} />
                      Return to Service
                    </Button>
                  );
                }
                return (
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={isBusy}
                    onClick={() => handleSetStatus(v.vehicle_id, 'MAINTENANCE')}
                    className="text-amber-400 hover:text-amber-300 border border-amber-500/30"
                  >
                    <Wrench size={12} />
                    Service Bay
                  </Button>
                );
              }
            }
          ]}
        />
      </Panel>
    </div>
  );
}
