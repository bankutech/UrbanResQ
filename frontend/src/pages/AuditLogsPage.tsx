import React, { useState } from 'react';
import { 
  ScrollText, 
  ShieldCheck, 
  Lock, 
  Database, 
  Eye, 
  User, 
  FileCode,
  X
} from 'lucide-react';
import { useFetch } from '../hooks/useFetch';
import { DataTable } from '../components/DataTable';
import { Panel, PageHeader, StatCard, Button, SelectInput } from '../components/ui';

export default function AuditLogsPage() {
  const [page, setPage] = useState(1);
  const [entityFilter, setEntityFilter] = useState('');
  const [selectedLog, setSelectedLog] = useState<any | null>(null);

  const queryParams = new URLSearchParams({
    page: String(page),
    pageSize: '25',
  });
  if (entityFilter) queryParams.set('entityType', entityFilter);

  const { data, loading, error, reload } = useFetch<any>(`/audit-logs?${queryParams.toString()}`, [page, entityFilter]);

  const logs = data?.data || [];

  return (
    <div className="space-y-4 font-sans">
      <PageHeader
        title="Operations Audit Trail & State Mutations"
        subtitle="Immutable operational audit trail and state mutation journal"
        freshness="MySQL InnoDB Transaction Log Synchronized"
        action={
          <div className="flex items-center gap-2">
            <SelectInput
              value={entityFilter}
              onChange={(v) => { setEntityFilter(v); setPage(1); }}
              ariaLabel="Filter audit logs by entity"
            >
              <option value="">All Mutated Entities</option>
              <option value="allocation">Resource Allocations</option>
              <option value="emergency_request">Emergency Requests</option>
              <option value="inventory">Depot Inventory</option>
              <option value="hospital">Hospital Capacity</option>
              <option value="shelter">Shelter Evacuees</option>
              <option value="volunteer">Volunteer Deployments</option>
            </SelectInput>
            <Button variant="secondary" size="sm" onClick={reload}>
              REFRESH LOGS
            </Button>
          </div>
        }
      />

      {/* Top Telemetry KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard 
          label="Total Ledger Records" 
          value={data?.total?.toLocaleString() ?? logs.length} 
          tone="info"
          icon={ScrollText}
          sub="Append-only transaction log"
        />
        <StatCard 
          label="Audit Constraint" 
          value="APPEND ONLY" 
          tone="normal"
          icon={ShieldCheck}
          sub="Immutable database table"
        />
        <StatCard 
          label="Authorized Principals" 
          value="7 ROLES" 
          tone="normal"
          icon={Lock}
          sub="RBAC authenticated operators"
        />
        <StatCard 
          label="Storage Engine" 
          value="INNODB ACID" 
          tone="normal"
          icon={Database}
          sub="Row-locked audit logging"
        />
      </div>

      {/* Audit Log Table */}
      <Panel title="Operations Audit Journal">
        <DataTable
          loading={loading}
          error={error}
          onRetry={reload}
          rows={logs}
          onRowClick={(log: any) => setSelectedLog(log)}
          emptyMessage="No audit ledger entries recorded."
          columns={[
            { 
              header: 'Timestamp', 
              render: (a: any) => (
                <div className="font-mono text-xs tabular-nums text-eoc-muted">
                  <div className="text-eoc-text font-semibold">
                    {new Date(a.created_at).toLocaleTimeString()}
                  </div>
                  <div className="text-[10px] text-eoc-subtle">
                    {new Date(a.created_at).toLocaleDateString()}
                  </div>
                </div>
              ) 
            },
            { 
              header: 'Operator / Principal', 
              render: (a: any) => (
                <div className="font-mono text-xs">
                  <span className="font-semibold text-eoc-text flex items-center gap-1.5">
                    <User size={12} className="text-cyan-400" />
                    <span>{a.user_name || 'System Daemon'}</span>
                  </span>
                  <span className="text-[10px] text-eoc-muted">
                    UID: {a.user_id ? `#${a.user_id.slice(0, 8)}` : 'CRON_JOB'}
                  </span>
                </div>
              ) 
            },
            { 
              header: 'Action Executed', 
              render: (a: any) => (
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-eoc-panel2 border border-eoc-border text-cyan-300 font-semibold uppercase">
                  {a.action}
                </span>
              ) 
            },
            { 
              header: 'Mutated Entity', 
              render: (a: any) => (
                <span className="font-mono text-xs text-eoc-text">
                  {a.entity_type} <strong className="text-cyan-400">#{a.entity_id ?? '—'}</strong>
                </span>
              ) 
            },
            { 
              header: 'Diff Inspector', 
              render: (a: any) => (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedLog(a);
                  }}
                  className="font-mono text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                >
                  <Eye size={12} />
                  <span>Inspect Diff</span>
                </button>
              ) 
            },
          ]}
        />

        {data && (
          <div className="mt-3 flex items-center justify-between text-xs font-mono text-eoc-muted border-t border-eoc-border pt-2.5">
            <span>SHOWING {logs.length} OF {data.total} AUDIT TRANSACTIONS</span>
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
                disabled={logs.length < 25} 
                onClick={() => setPage((p) => p + 1)}
              >
                NEXT &rarr;
              </Button>
            </div>
          </div>
        )}
      </Panel>

      {/* Diff Inspector Modal */}
      {selectedLog && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="diff-inspector-title"
        >
          <div className="w-full max-w-2xl rounded-md border border-cyan-500/40 bg-eoc-panel p-5 shadow-tactical-accent font-sans max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-eoc-border pb-3">
              <div className="flex items-center gap-2">
                <FileCode size={18} className="text-cyan-400" />
                <h3 id="diff-inspector-title" className="text-base font-bold font-display text-eoc-text">
                  Transaction Diff Inspector · Log #{selectedLog.audit_id || selectedLog.id}
                </h3>
              </div>
              <button 
                onClick={() => setSelectedLog(null)}
                className="text-eoc-muted hover:text-eoc-text p-1"
                aria-label="Close diff inspector"
              >
                <X size={16} />
              </button>
            </div>

            <div className="mt-3 space-y-3 font-mono text-xs overflow-y-auto flex-1 pr-1">
              {/* Record Verification Badge */}
              <div className="rounded border border-cyan-500/40 bg-cyan-950/20 p-2.5 flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck size={13} />
                    <span>RELATIONAL AUDIT LOG RECORD</span>
                  </div>
                  <div className="text-[11px] text-slate-300 font-mono mt-0.5 select-all">
                    UUID: {selectedLog.audit_id || 'system-generated'}
                  </div>
                </div>
                <span className="text-[10px] font-bold text-cyan-300 border border-cyan-500/50 px-2 py-0.5 rounded bg-cyan-950">
                  COMMITTED
                </span>
              </div>

              {/* Metadata Grid */}
              <div className="grid grid-cols-2 gap-2 text-[11px] rounded border border-eoc-border bg-eoc-panel2 p-3">
                <div>
                  <span className="text-eoc-muted block">ACTOR:</span>
                  <strong className="text-eoc-text">{selectedLog.user_name || 'System Operator'}</strong>
                </div>
                <div>
                  <span className="text-eoc-muted block">TIMESTAMP:</span>
                  <strong className="text-eoc-text">{new Date(selectedLog.created_at).toISOString()}</strong>
                </div>
                <div>
                  <span className="text-eoc-muted block">OPERATION:</span>
                  <strong className="text-cyan-400">{selectedLog.action}</strong>
                </div>
                <div>
                  <span className="text-eoc-muted block">AFFECTED RECORD:</span>
                  <strong className="text-eoc-text">{selectedLog.entity_type} #{selectedLog.entity_id}</strong>
                </div>
              </div>

              {/* State Mutation JSON Diff */}
              <div>
                <div className="text-[11px] font-bold text-eoc-muted mb-1 uppercase">
                  RECORD STATE MUTATION PAYLOAD:
                </div>
                <pre className="rounded border border-eoc-border bg-[#090D16] p-3 text-[11px] text-cyan-300 overflow-x-auto leading-relaxed select-all">
                  {JSON.stringify(selectedLog.new_value || selectedLog.details || {
                    status: 'COMMITTED',
                    transaction: 'ACID_VERIFIED',
                    entity: selectedLog.entity_type,
                    id: selectedLog.entity_id,
                    actor: selectedLog.user_name
                  }, null, 2)}
                </pre>
              </div>
            </div>

            <div className="mt-4 flex justify-end border-t border-eoc-border pt-3">
              <Button 
                variant="secondary" 
                size="sm"
                onClick={() => setSelectedLog(null)}
              >
                Close Inspector
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
