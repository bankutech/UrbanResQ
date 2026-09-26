import React, { useState, useMemo } from 'react';
import { 
  Package, 
  AlertTriangle, 
  Plus, 
  RefreshCw, 
  Search, 
  ShieldAlert, 
  CheckCircle2,
  TrendingDown,
  Layers,
  Building
} from 'lucide-react';
import { useFetch } from '../hooks/useFetch';
import { api, apiErrorMessage } from '../api/client';
import { DataTable } from '../components/DataTable';
import { Panel, StatusBadge, Button, ErrorState, PageHeader, StatCard, SelectInput } from '../components/ui';
import { useAuth } from '../hooks/useAuth';

export default function InventoryPage() {
  const { hasRole } = useAuth();
  const [category, setCategory] = useState<string>('');
  const { data, loading, error, reload } = useFetch<any[]>(`/inventory${category ? `?category=${category}` : ''}`, [category]);
  const [actionError, setActionError] = useState<string | null>(null);
  const [restockItem, setRestockItem] = useState<any | null>(null);
  const [restockQty, setRestockQty] = useState<number>(250);
  const [restockReason, setRestockReason] = useState<string>('Emergency Supplier Shipment');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const inventory = data || [];
  const canManage = hasRole('RESOURCE_MANAGER', 'ADMIN');

  async function handleRestockSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!restockItem) return;
    setActionError(null);
    setIsSubmitting(true);
    try {
      await api.post(`/inventory/${restockItem.inventory_id}/adjust`, { 
        delta: Number(restockQty), 
        reason: restockReason 
      });
      setRestockItem(null);
      reload();
    } catch (err) {
      setActionError(apiErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  const criticalCount = inventory.filter(i => i.stock_status === 'CRITICAL').length;
  const warningCount = inventory.filter(i => i.stock_status === 'WARNING').length;
  const totalAvailable = inventory.reduce((acc, i) => acc + (Number(i.available_quantity) || 0), 0);

  return (
    <div className="space-y-4 font-sans">
      <PageHeader
        title="Municipal Resource Inventory & Depots"
        subtitle="Stock levels, minimum safety thresholds, and replenishment pipelines across all city depots"
        freshness="Live MySQL Inventory State"
        action={
          <div className="flex items-center gap-2">
            <SelectInput 
              value={category} 
              onChange={setCategory}
              ariaLabel="Filter inventory by category"
            >
              <option value="">All Resource Categories</option>
              <option value="MEDICAL">Medical & Trauma</option>
              <option value="WATER_SANITATION">Water & Sanitation</option>
              <option value="FOOD_NUTRITION">Food & Rations</option>
              <option value="SHELTER_NFI">Shelter & Bedding</option>
              <option value="SEARCH_RESCUE">Search & Rescue Gear</option>
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
          label="Total Units On Hand" 
          value={totalAvailable.toLocaleString()} 
          tone="info"
          icon={Package}
          sub="Across all logistics hubs"
        />
        <StatCard 
          label="Critical Deficits" 
          value={criticalCount} 
          tone={criticalCount > 0 ? "critical" : "normal"}
          icon={AlertTriangle}
          sub="Below safety threshold"
        />
        <StatCard 
          label="Warning Depletion" 
          value={warningCount} 
          tone={warningCount > 0 ? "warning" : "normal"}
          icon={TrendingDown}
          sub="Buffer depletion warning"
        />
        <StatCard 
          label="Nominal Stock Lines" 
          value={inventory.filter(i => i.stock_status === 'NORMAL').length} 
          tone="normal"
          icon={CheckCircle2}
          sub="Fully replenished"
        />
      </div>

      {actionError && <ErrorState message={actionError} />}

      {/* Main Inventory Ledger */}
      <Panel title="Depot Stock Lines & Safety Buffers">
        <DataTable
          loading={loading}
          error={error}
          onRetry={reload}
          rows={inventory}
          emptyMessage="No inventory records found."
          columns={[
            { 
              header: 'Resource Name', 
              render: (i: any) => (
                <div>
                  <div className="font-semibold text-eoc-text">{i.resource_name}</div>
                  <div className="text-[10px] font-mono text-eoc-muted uppercase">
                    {i.category?.replace(/_/g, ' ')}
                  </div>
                </div>
              ) 
            },
            { 
              header: 'Depot Location', 
              render: (i: any) => (
                <div className="font-mono text-xs flex items-center gap-1.5 text-eoc-muted">
                  <Building size={12} className="text-cyan-400" />
                  <span>{i.location_label || 'Central Warehouse'}</span>
                </div>
              ) 
            },
            { 
              header: 'Stock Health Buffer', 
              render: (i: any) => {
                const avail = Number(i.available_quantity) || 0;
                const thresh = Number(i.min_threshold) || 100;
                const pct = Math.min(100, Math.round((avail / (thresh * 2)) * 100));
                return (
                  <div className="w-36 font-mono text-xs">
                    <div className="flex justify-between text-[10px] text-eoc-muted mb-1">
                      <span>{avail.toLocaleString()} {i.unit}</span>
                      <span>Min: {thresh}</span>
                    </div>
                    <div className="h-1.5 w-full bg-eoc-panel2 rounded overflow-hidden border border-eoc-border">
                      <div 
                        className={`h-full transition-all ${
                          i.stock_status === 'CRITICAL' ? 'bg-red-500' :
                          i.stock_status === 'WARNING' ? 'bg-amber-400' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              } 
            },
            { 
              header: 'Allocated', 
              render: (i: any) => (
                <span className="font-mono text-xs text-eoc-muted tabular-nums">
                  {Number(i.allocated_quantity).toLocaleString()} {i.unit}
                </span>
              ) 
            },
            { 
              header: 'Stock Status', 
              render: (i: any) => <StatusBadge value={i.stock_status} /> 
            },
            {
              header: 'Logistics Action',
              render: (i: any) => {
                if (!canManage) {
                  return <span className="text-[10px] font-mono text-eoc-subtle">READ-ONLY</span>;
                }
                return (
                  <Button 
                    variant="secondary" 
                    size="sm"
                    onClick={() => {
                      setRestockItem(i);
                      setRestockQty(100);
                    }}
                  >
                    <Plus size={12} />
                    Restock
                  </Button>
                );
              },
            },
          ]}
        />
      </Panel>

      {/* Restock Batch Injection Modal */}
      {restockItem && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="restock-modal-title"
        >
          <div className="w-full max-w-md rounded-md border border-cyan-500/40 bg-eoc-panel p-5 shadow-tactical-accent">
            <h3 id="restock-modal-title" className="text-base font-bold font-display text-eoc-text flex items-center gap-2">
              <Package size={16} className="text-cyan-400" />
              Restock Inventory Batch
            </h3>
            <p className="mt-1 text-xs text-eoc-muted font-mono">
              Injecting units to: <strong className="text-eoc-text">{restockItem.resource_name}</strong> ({restockItem.location_label})
            </p>

            <form onSubmit={handleRestockSubmit} className="mt-4 space-y-3 font-mono text-xs">
              <div>
                <label className="block text-[11px] text-eoc-muted mb-1">
                  QUANTITY TO ADD ({restockItem.unit}):
                </label>
                <input
                  type="number"
                  min="1"
                  value={restockQty}
                  onChange={(e) => setRestockQty(Number(e.target.value))}
                  className="w-full rounded border border-eoc-border bg-eoc-panel2 px-3 py-1.5 text-sm text-eoc-text outline-none focus:border-cyan-400"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] text-eoc-muted mb-1">
                  SUPPLIER / REASON FOR ADJUSTMENT:
                </label>
                <input
                  type="text"
                  value={restockReason}
                  onChange={(e) => setRestockReason(e.target.value)}
                  className="w-full rounded border border-eoc-border bg-eoc-panel2 px-3 py-1.5 text-xs text-eoc-text outline-none focus:border-cyan-400"
                  required
                />
              </div>

              <div className="mt-5 flex justify-end gap-2 border-t border-eoc-border pt-3">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setRestockItem(null)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button 
                  variant="primary" 
                  size="sm"
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-cyan-600 hover:bg-cyan-500"
                >
                  {isSubmitting ? 'Injecting Stock...' : 'Commit Batch Addition'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
