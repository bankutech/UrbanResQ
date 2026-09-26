import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ClipboardList, 
  AlertOctagon, 
  MapPin, 
  Eye, 
  Clock, 
  Users, 
  ShieldAlert, 
  CheckCircle2, 
  Search,
  Filter
} from 'lucide-react';
import { useFetch } from '../hooks/useFetch';
import { DataTable } from '../components/DataTable';
import { Panel, StatusBadge, PageHeader, SelectInput, Button, StatCard } from '../components/ui';

const URGENCIES = ['', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];
const STATUSES = ['', 'PENDING', 'ACKNOWLEDGED', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CANCELLED'];

export default function EmergencyRequestsPage() {
  const [urgency, setUrgency] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const params = new URLSearchParams();
  if (urgency) params.set('urgency', urgency);
  if (status) params.set('status', status);
  params.set('page', String(page));
  params.set('pageSize', '25');

  const { data, loading, error, reload } = useFetch<any>(`/emergency-requests?${params.toString()}`, [urgency, status, page]);

  const rawRequests = data?.data || [];

  const requests = useMemo(() => {
    if (!search) return rawRequests;
    return rawRequests.filter((r: any) => 
      r.description?.toLowerCase().includes(search.toLowerCase()) ||
      r.zone_name?.toLowerCase().includes(search.toLowerCase()) ||
      r.category?.toLowerCase().includes(search.toLowerCase())
    );
  }, [rawRequests, search]);

  const criticalCount = rawRequests.filter((r: any) => r.urgency === 'CRITICAL').length;
  const pendingCount = rawRequests.filter((r: any) => r.status === 'PENDING').length;
  const totalAffected = useMemo(() => rawRequests.reduce((acc: number, r: any) => acc + (Number(r.people_affected) || 0), 0), [rawRequests]);

  return (
    <div className="space-y-4 font-sans">
      <PageHeader
        title="Emergency Request Triage & Intake"
        subtitle="Citizen distress calls and agency resource requests ranked dynamically by multi-factor algorithmic priority scoring"
        freshness="Live Triage Dispatch Stream"
        action={
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={reload}>
              SYNC QUEUE
            </Button>
          </div>
        }
      />

      {/* Top Telemetry KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard 
          label="Pending Triage Queue" 
          value={pendingCount} 
          tone={pendingCount > 0 ? "warning" : "normal"}
          icon={ClipboardList}
          sub="Unallocated distress calls"
        />
        <StatCard 
          label="Critical Severity Calls" 
          value={criticalCount} 
          tone="critical"
          icon={AlertOctagon}
          sub="Immediate life-safety hazard"
        />
        <StatCard 
          label="Citizens In Need" 
          value={totalAffected.toLocaleString()} 
          tone="warning"
          icon={Users}
          sub="Reported casualty headcount"
        />
        <StatCard 
          label="Priority Score Engine" 
          value="DYNAMIC" 
          tone="normal"
          icon={ShieldAlert}
          sub="Urgency + Proximity weighted"
        />
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-2.5 rounded border border-eoc-border bg-eoc-panel font-mono text-xs shadow-tactical">
        <div className="flex items-center gap-2 flex-wrap">
          <SelectInput 
            value={urgency} 
            onChange={(v) => { setUrgency(v); setPage(1); }}
            ariaLabel="Filter by urgency"
          >
            {URGENCIES.map((u) => (
              <option key={u} value={u}>{u || 'All Urgency Levels'}</option>
            ))}
          </SelectInput>

          <SelectInput 
            value={status} 
            onChange={(v) => { setStatus(v); setPage(1); }}
            ariaLabel="Filter by status"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s || 'All Operational Statuses'}</option>
            ))}
          </SelectInput>
        </div>

        <div className="relative flex-1 sm:w-64 max-w-sm">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-eoc-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search descriptions, zones, categories..."
            className="w-full rounded border border-eoc-border bg-eoc-panel2 pl-7 pr-3 py-1.5 text-xs font-mono outline-none text-eoc-text placeholder:text-eoc-subtle focus:border-cyan-400"
          />
        </div>
      </div>

      {/* Main Requests Table */}
      <Panel title="Emergency Requests Dispatch Ledger">
        <DataTable
          loading={loading}
          error={error}
          onRetry={reload}
          rows={requests}
          onRowClick={(r: any) => navigate(`/emergency-requests/${r.request_id}`)}
          emptyMessage="No emergency requests matching criteria."
          columns={[
            { 
              header: 'Request ID', 
              render: (r: any) => (
                <span className="font-mono font-bold text-cyan-400">
                  #{r.request_id}
                </span>
              ) 
            },
            { 
              header: 'Category', 
              render: (r: any) => (
                <span className="font-mono text-xs uppercase px-2 py-0.5 rounded bg-eoc-panel2 border border-eoc-border text-eoc-text">
                  {r.category?.replace(/_/g, ' ')}
                </span>
              ) 
            },
            { 
              header: 'Description & Zone', 
              render: (r: any) => (
                <div className="max-w-md">
                  <div className="font-semibold text-eoc-text line-clamp-1">
                    {r.description}
                  </div>
                  <div className="text-[10px] font-mono text-eoc-muted flex items-center gap-2 mt-0.5">
                    <span className="flex items-center gap-1 text-cyan-300">
                      <MapPin size={10} />
                      {r.zone_name || r.location_label || 'Central Sector'}
                    </span>
                    <span>·</span>
                    <span>{r.people_affected} affected</span>
                  </div>
                </div>
              ) 
            },
            { 
              header: 'Urgency Tier', 
              render: (r: any) => <StatusBadge value={r.urgency} /> 
            },
            { 
              header: 'Priority Score', 
              render: (r: any) => (
                <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-cyan-300 tabular-nums">
                  {Number(r.live_priority_score).toFixed(0)}
                </span>
              ) 
            },
            { 
              header: 'Status', 
              render: (r: any) => <StatusBadge value={r.status} /> 
            },
            {
              header: 'Triage Drilldown',
              render: (r: any) => (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/emergency-requests/${r.request_id}`);
                  }}
                  className="font-mono text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                >
                  <Eye size={12} />
                  <span>Inspect</span>
                </button>
              ),
            },
          ]}
        />

        {data && (
          <div className="mt-3 flex items-center justify-between text-xs font-mono text-eoc-muted border-t border-eoc-border pt-2.5">
            <span>SHOWING {requests.length} OF {data.total} INCIDENT CALLS</span>
            <div className="flex gap-2">
              <Button 
                variant="secondary" 
                size="sm"
                disabled={page <= 1} 
                onClick={() => setPage((p) => p - 1)}
              >
                &larr; PREVIOUS
              </Button>
              <Button 
                variant="secondary" 
                size="sm"
                disabled={rawRequests.length < 25} 
                onClick={() => setPage((p) => p + 1)}
              >
                NEXT &rarr;
              </Button>
            </div>
          </div>
        )}
      </Panel>
    </div>
  );
}
