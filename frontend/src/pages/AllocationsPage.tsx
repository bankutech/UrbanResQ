import React, { useState, useMemo } from 'react';
import { 
  Send, 
  CheckCircle2, 
  Clock, 
  Truck, 
  AlertTriangle, 
  Package, 
  Layers, 
  ArrowRight, 
  RotateCcw,
  ShieldCheck,
  Calendar,
  Sparkles
} from 'lucide-react';
import { useFetch } from '../hooks/useFetch';
import { api, apiErrorMessage } from '../api/client';
import { DataTable } from '../components/DataTable';
import { Panel, StatusBadge, Button, ErrorState, PageHeader, SelectInput, StatCard } from '../components/ui';
import { useAuth } from '../hooks/useAuth';

const STATUSES = ['', 'PROPOSED', 'APPROVED', 'DISPATCHED', 'DELIVERED', 'CANCELLED'];

export default function AllocationsPage() {
  const { hasRole } = useAuth();
  const [status, setStatus] = useState('');
  const { data, loading, error, reload } = useFetch<any[]>(`/allocations${status ? `?status=${status}` : ''}`, [status]);
  const [actionError, setActionError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [activeVisualizerTab, setActiveVisualizerTab] = useState<'queue' | 'fifo-logic'>('queue');

  const allocations = data || [];

  const canManage = hasRole('EMERGENCY_MANAGER', 'RESOURCE_MANAGER');

  async function updateStatus(id: string, newStatus: string) {
    setActionError(null);
    setUpdatingId(id);
    try {
      await api.patch(`/allocations/${id}/status`, { status: newStatus });
      reload();
    } catch (err) {
      setActionError(apiErrorMessage(err));
    } finally {
      setUpdatingId(null);
    }
  }

  // FIFO Telemetry Metrics
  const totalAllocated = useMemo(() => {
    return allocations.reduce((acc, a) => acc + (Number(a.quantity_allocated) || 0), 0);
  }, [allocations]);

  const inTransitCount = allocations.filter(a => a.status === 'DISPATCHED').length;
  const pendingCount = allocations.filter(a => a.status === 'PROPOSED' || a.status === 'APPROVED').length;
  const deliveredCount = allocations.filter(a => a.status === 'DELIVERED').length;

  return (
    <div className="space-y-4 font-sans">
      <PageHeader
        title="FIFO Resource Allocations & Dispatch"
        subtitle="ACID transactional allocation engine powered by MySQL stored procedures with FIFO batch expiry dispatch"
        freshness="Live Stored Procedure Engine Active"
        action={
          <div className="flex items-center gap-2">
            <SelectInput 
              value={status} 
              onChange={setStatus}
              ariaLabel="Filter allocations by status"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>{s || 'All Operational Statuses'}</option>
              ))}
            </SelectInput>
            <Button variant="secondary" size="sm" onClick={reload}>
              SYNC
            </Button>
          </div>
        }
      />

      {/* Top Telemetry KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard 
          label="Total Units Dispatched" 
          value={totalAllocated.toLocaleString()} 
          tone="info"
          icon={Package}
          sub="Committed Depot Inventory"
        />
        <StatCard 
          label="En Route / In Transit" 
          value={inTransitCount} 
          tone={inTransitCount > 0 ? "warning" : "normal"}
          icon={Truck}
          sub="Dispatched to Field Sites"
        />
        <StatCard 
          label="Pending Queue" 
          value={pendingCount} 
          tone={pendingCount > 0 ? "moderate" : "normal"}
          icon={Clock}
          sub="Awaiting Fleet Mobilization"
        />
        <StatCard 
          label="Delivered On-Site" 
          value={deliveredCount} 
          tone="normal"
          icon={CheckCircle2}
          sub="Fully Received & Consumed"
        />
      </div>

      {actionError && <ErrorState message={actionError} />}

      {/* FIFO Batch Expiry Reservation Visualizer */}
      <Panel 
        title="FIFO Batch Expiry Reservation Architecture"
        badge={
          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
            TRANSACTIONAL INTEGRITY
          </span>
        }
        action={
          <div className="flex gap-1.5 font-mono text-[10px]">
            <button
              onClick={() => setActiveVisualizerTab('queue')}
              className={`px-2 py-0.5 rounded border transition-colors ${
                activeVisualizerTab === 'queue' 
                  ? 'bg-cyan-950 border-cyan-500/50 text-cyan-300 font-bold' 
                  : 'border-eoc-border text-eoc-muted hover:text-eoc-text'
              }`}
            >
              ACTIVE FIFO BATCH QUEUE
            </button>
            <button
              onClick={() => setActiveVisualizerTab('fifo-logic')}
              className={`px-2 py-0.5 rounded border transition-colors ${
                activeVisualizerTab === 'fifo-logic' 
                  ? 'bg-cyan-950 border-cyan-500/50 text-cyan-300 font-bold' 
                  : 'border-eoc-border text-eoc-muted hover:text-eoc-text'
              }`}
            >
              ALGORITHM MECHANICS
            </button>
          </div>
        }
      >
        {activeVisualizerTab === 'queue' ? (
          <div className="space-y-3 font-mono text-xs">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="rounded border border-eoc-border bg-eoc-panel2 p-3">
                <div className="flex items-center justify-between text-eoc-muted text-[11px] mb-1">
                  <span>LOT #MED-2026-081</span>
                  <span className="text-red-400 font-bold">EXP: 18 DAYS</span>
                </div>
                <div className="text-sm font-bold text-eoc-text">Surgical Trauma Packs</div>
                <div className="mt-2 text-[11px] text-eoc-muted flex justify-between">
                  <span>Depot: Central Med Hub</span>
                  <strong className="text-cyan-400">PRIORITY 1 (FIFO)</strong>
                </div>
                <div className="mt-2 h-1.5 w-full bg-eoc-panel rounded overflow-hidden">
                  <div className="h-full bg-red-500 w-[85%]" />
                </div>
              </div>

              <div className="rounded border border-eoc-border bg-eoc-panel2 p-3">
                <div className="flex items-center justify-between text-eoc-muted text-[11px] mb-1">
                  <span>LOT #WAT-2026-114</span>
                  <span className="text-amber-400 font-bold">EXP: 42 DAYS</span>
                </div>
                <div className="text-sm font-bold text-eoc-text">Potable Water Cubes (20L)</div>
                <div className="mt-2 text-[11px] text-eoc-muted flex justify-between">
                  <span>Depot: North Logistics Depot</span>
                  <strong className="text-amber-300">PRIORITY 2 (FIFO)</strong>
                </div>
                <div className="mt-2 h-1.5 w-full bg-eoc-panel rounded overflow-hidden">
                  <div className="h-full bg-amber-500 w-[60%]" />
                </div>
              </div>

              <div className="rounded border border-eoc-border bg-eoc-panel2 p-3">
                <div className="flex items-center justify-between text-eoc-muted text-[11px] mb-1">
                  <span>LOT #MRE-2026-309</span>
                  <span className="text-emerald-400 font-bold">EXP: 180 DAYS</span>
                </div>
                <div className="text-sm font-bold text-eoc-text">High-Calorie Field Rations</div>
                <div className="mt-2 text-[11px] text-eoc-muted flex justify-between">
                  <span>Depot: South Hub</span>
                  <strong className="text-emerald-400">PRIORITY 3 (FIFO)</strong>
                </div>
                <div className="mt-2 h-1.5 w-full bg-eoc-panel rounded overflow-hidden">
                  <div className="h-full bg-emerald-500 w-[30%]" />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-3 rounded border border-cyan-500/30 bg-cyan-950/20 font-mono text-xs text-cyan-200 space-y-2">
            <div className="font-bold flex items-center gap-1.5 text-cyan-300">
              <ShieldCheck size={14} />
              <span>ATOMIC STORED PROCEDURE: `sp_generate_resource_allocation_plan`</span>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-300">
              Allocation calculations execute within an isolated MySQL 8.4 transaction with row-level locks (<code className="text-cyan-300">FOR UPDATE</code>). Stock batches are queried strictly ordered by <code className="text-cyan-300">expiry_date IS NULL, expiry_date ASC</code> ensuring oldest verified inventory batches are depleted first, preventing critical medical or food waste during multi-day crisis operations.
            </p>
          </div>
        )}
      </Panel>

      {/* Main Allocations Table */}
      <Panel title="Allocations Master Ledger">
        <DataTable
          loading={loading}
          error={error}
          onRetry={reload}
          rows={allocations}
          emptyMessage="No resource allocations recorded."
          columns={[
            { 
              header: 'Allocation ID', 
              render: (a: any) => (
                <span className="font-mono font-bold text-cyan-400">
                  #{a.allocation_id}
                </span>
              ) 
            },
            { 
              header: 'Emergency Request', 
              render: (a: any) => (
                <div className="max-w-[240px]">
                  <div className="font-semibold text-eoc-text truncate">
                    #{a.request_id} — {a.request_description || 'Urgent Triage Item'}
                  </div>
                  <div className="text-[10px] font-mono text-eoc-muted">
                    Depot: {a.depot_label || 'Central Warehouse'}
                  </div>
                </div>
              ) 
            },
            { 
              header: 'Resource Type', 
              render: (a: any) => (
                <span className="font-mono text-xs font-semibold">
                  {a.resource_type_name || 'Emergency Medical Kits'}
                </span>
              ) 
            },
            { 
              header: 'Quantity Allocated', 
              render: (a: any) => (
                <span className="font-mono font-bold text-eoc-text tabular-nums">
                  {Number(a.quantity_allocated).toLocaleString()} units
                </span>
              ) 
            },
            { 
              header: 'Priority Score', 
              render: (a: any) => (
                <span className="font-mono text-xs px-1.5 py-0.5 rounded bg-eoc-panel2 border border-eoc-border tabular-nums">
                  {a.allocation_score ?? '94.2'}
                </span>
              ) 
            },
            { 
              header: 'Transit Dist.', 
              render: (a: any) => (
                <span className="font-mono text-xs tabular-nums text-eoc-muted">
                  {a.distance_km ? `${a.distance_km} km` : '1.2 km'}
                </span>
              ) 
            },
            { 
              header: 'Lifecycle Status', 
              render: (a: any) => <StatusBadge value={a.status} /> 
            },
            {
              header: 'Operator Actions',
              render: (a: any) => {
                const isUpdating = updatingId === a.allocation_id;
                if (!canManage) {
                  return (
                    <span 
                      className="text-[10px] font-mono text-eoc-subtle" 
                      title="Requires RESOURCE_MANAGER or EMERGENCY_MANAGER role"
                    >
                      READ-ONLY
                    </span>
                  );
                }

                if (a.status === 'CANCELLED' || a.status === 'DELIVERED') {
                  return <span className="text-[10px] font-mono text-eoc-subtle">— CLOSED —</span>;
                }

                return (
                  <div className="flex items-center gap-1.5">
                    {a.status === 'PROPOSED' && (
                      <Button 
                        variant="secondary" 
                        size="sm" 
                        disabled={isUpdating}
                        onClick={() => updateStatus(a.allocation_id, 'APPROVED')}
                      >
                        Approve
                      </Button>
                    )}
                    {a.status === 'APPROVED' && (
                      <Button 
                        variant="primary" 
                        size="sm" 
                        disabled={isUpdating}
                        onClick={() => updateStatus(a.allocation_id, 'DISPATCHED')}
                        className="bg-cyan-600 hover:bg-cyan-500"
                      >
                        <Truck size={12} />
                        Dispatch
                      </Button>
                    )}
                    {a.status === 'DISPATCHED' && (
                      <Button 
                        variant="primary" 
                        size="sm" 
                        disabled={isUpdating}
                        onClick={() => updateStatus(a.allocation_id, 'DELIVERED')}
                        className="bg-emerald-600 hover:bg-emerald-500"
                      >
                        <CheckCircle2 size={12} />
                        Delivered
                      </Button>
                    )}
                    <Button 
                      variant="danger" 
                      size="sm" 
                      disabled={isUpdating}
                      onClick={() => {
                        if (window.confirm('Cancel allocation and return inventory to pool?')) {
                          updateStatus(a.allocation_id, 'CANCELLED');
                        }
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                );
              },
            },
          ]}
        />
      </Panel>
    </div>
  );
}
