import React from 'react';
import { Boxes, Package, CheckCircle2, AlertTriangle, Layers } from 'lucide-react';
import { useFetch } from '../hooks/useFetch';
import { DataTable } from '../components/DataTable';
import { Panel, StatusBadge, PageHeader, StatCard, Button } from '../components/ui';

export default function ResourcesPage() {
  const { data, loading, error, reload } = useFetch<any[]>('/resources');

  const resources = data || [];
  const totalUnits = resources.reduce((acc, r) => acc + (Number(r.total_quantity) || 0), 0);
  const allocatedUnits = resources.reduce((acc, r) => acc + (Number(r.allocated_quantity) || 0), 0);
  const criticalCount = resources.filter((r) => r.stock_status === 'CRITICAL').length;

  return (
    <div className="space-y-4 font-sans">
      <PageHeader
        title="Municipal Resource Catalog & Aggregated Stock"
        subtitle="Catalog classification, depot distribution, and gross inventory allocation ratios"
        freshness="Resource Registry Active"
        action={
          <Button variant="secondary" size="sm" onClick={reload}>
            SYNC REGISTRY
          </Button>
        }
      />

      {/* Top Telemetry KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard 
          label="Catalog Resource Lines" 
          value={resources.length} 
          tone="info"
          icon={Boxes}
          sub="Tracked inventory categories"
        />
        <StatCard 
          label="Gross Units In System" 
          value={totalUnits.toLocaleString()} 
          tone="normal"
          icon={Package}
          sub="Total procurement quantity"
        />
        <StatCard 
          label="Active Committed Units" 
          value={allocatedUnits.toLocaleString()} 
          tone="warning"
          icon={Layers}
          sub="Reserved or in delivery"
        />
        <StatCard 
          label="Critical Deficit Lines" 
          value={criticalCount} 
          tone={criticalCount > 0 ? "critical" : "normal"}
          icon={AlertTriangle}
          sub="Depots requiring restocking"
        />
      </div>

      <Panel title="Resource Catalog Master Index">
        <DataTable
          loading={loading}
          error={error}
          onRetry={reload}
          rows={resources}
          emptyMessage="No resources catalogued."
          columns={[
            { 
              header: 'Resource Name', 
              render: (r: any) => (
                <div className="font-semibold text-eoc-text font-mono text-xs">
                  {r.resource_type_name}
                </div>
              ) 
            },
            { 
              header: 'Category', 
              render: (r: any) => (
                <span className="font-mono text-xs uppercase px-2 py-0.5 rounded bg-eoc-panel2 border border-eoc-border text-cyan-300">
                  {r.category?.replace(/_/g, ' ')}
                </span>
              ) 
            },
            { 
              header: 'Depot Location', 
              render: (r: any) => (
                <span className="font-mono text-xs text-eoc-muted">
                  {r.location_label} ({r.zone_name})
                </span>
              ) 
            },
            { 
              header: 'Available On Hand', 
              render: (r: any) => (
                <span className="font-mono text-xs font-bold text-eoc-text tabular-nums">
                  {Number(r.available_quantity).toLocaleString()} {r.unit}
                </span>
              ) 
            },
            { 
              header: 'Committed', 
              render: (r: any) => (
                <span className="font-mono text-xs text-eoc-muted tabular-nums">
                  {Number(r.allocated_quantity).toLocaleString()} {r.unit}
                </span>
              ) 
            },
            { 
              header: 'Total Gross Units', 
              render: (r: any) => (
                <span className="font-mono text-xs font-semibold tabular-nums text-eoc-text">
                  {Number(r.total_quantity).toLocaleString()} {r.unit}
                </span>
              ) 
            },
            { 
              header: 'Stock Status', 
              render: (r: any) => <StatusBadge value={r.stock_status} /> 
            },
          ]}
        />
      </Panel>
    </div>
  );
}
