import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ClipboardList, 
  MapPin, 
  Users, 
  Clock, 
  Truck, 
  ArrowLeft, 
  ShieldAlert, 
  CheckCircle2, 
  AlertOctagon,
  Sparkles
} from 'lucide-react';
import { useFetch } from '../hooks/useFetch';
import { Panel, StatusBadge, Skeleton, ErrorState, PageHeader, Button } from '../components/ui';
import { DispatchVehicleModal } from '../components/DispatchVehicleModal';

export default function RequestDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, loading, error, reload } = useFetch<any>(`/emergency-requests/${id}`, [id]);
  const [modalOpen, setModalOpen] = useState(false);

  if (loading) return <Skeleton className="h-96" />;
  if (error) return <ErrorState message={error} onRetry={reload} />;
  if (!data) return null;

  const pb = data.priorityBreakdown;

  return (
    <div className="space-y-4 font-sans">
      {modalOpen && (
        <DispatchVehicleModal 
          isOpen={true} 
          onClose={() => setModalOpen(false)} 
          requestId={data.request_id} 
          onSuccess={reload} 
        />
      )}

      <PageHeader
        title={`Emergency Request #${data.request_id}`}
        subtitle={`${data.category?.replace(/_/g, ' ')} · ${data.disaster_title || 'General Incident'} · ${data.zone_name || data.location_label}`}
        freshness="Triage Record Synced"
        badge={
          <div className="flex items-center gap-1.5">
            <StatusBadge value={data.urgency} />
            <StatusBadge value={data.status} />
          </div>
        }
        action={
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={() => navigate('/emergency-requests')}>
              <ArrowLeft size={13} />
              ALL REQUESTS
            </Button>
            {data.status !== 'RESOLVED' && data.status !== 'CANCELLED' && (
              <Button 
                variant="primary" 
                size="sm"
                onClick={() => setModalOpen(true)}
                className="bg-cyan-600 hover:bg-cyan-500 shadow-tactical-accent"
              >
                <Truck size={13} />
                DISPATCH VEHICLE
              </Button>
            )}
          </div>
        }
      />

      {/* Distress Call Statement */}
      <Panel title="Citizen / Agency Distress Statement">
        <p className="text-sm font-mono text-eoc-text leading-relaxed">
          "{data.description}"
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-4 text-xs font-mono text-eoc-muted border-t border-eoc-border/60 pt-2">
          <span>Reported: {new Date(data.created_at).toLocaleString()}</span>
          <span>·</span>
          <span>Source: {data.requester_name || data.requester_type || 'Civic Hotline'}</span>
          <span>·</span>
          <span>Casualties: <strong className="text-eoc-text">{data.people_affected} affected</strong></span>
        </div>
      </Panel>

      {/* Transparent Algorithmic Priority Score Breakdown (Expert 8) */}
      {pb && (
        <Panel 
          title={`Transparent Algorithmic Priority Score: ${Number(pb.computed_priority_score).toFixed(0)}`}
          badge={
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 flex items-center gap-1">
              <Sparkles size={11} className="text-cyan-400" />
              EXPLAINABLE SCORING
            </span>
          }
        >
          <p className="mb-3 text-xs text-eoc-muted font-mono">
            Deterministic crisis triage formula combining urgency weight, affected population density, waiting duration, and demographic vulnerability.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 font-mono text-xs">
            <ScoreRow label="Severity / Urgency Weight" value={pb.severity_weight} note={`Urgency classification: ${data.urgency}`} />
            <ScoreRow label="Casualty Headcount Weight" value={pb.population_weight} note={`${data.people_affected} affected (max index 25)`} />
            <ScoreRow label="Waiting Duration Penalty" value={pb.waiting_weight} note={`${pb.waiting_minutes} minutes elapsed since call`} />
            <ScoreRow label="Vulnerable Population Factor" value={pb.vulnerable_weight} note={`${data.vulnerable_count || 0} infants/elderly identified`} />
            <ScoreRow label="Category Criticality Base" value={pb.category_criticality_weight} note={`Domain: ${data.category}`} />
          </div>
          <div className="mt-3 rounded border border-cyan-500/30 bg-cyan-950/20 px-3 py-2 text-xs font-mono text-cyan-200">
            Zone Rank: <strong className="text-white">#{pb.rank_in_zone}</strong> within disaster sector · <strong className="text-white">{pb.allocation_count}</strong> resource allocation(s) committed so far
          </div>
        </Panel>
      )}

      {/* Associated Allocations */}
      <Panel title="Committed Resource Allocations">
        {(!data.allocations || data.allocations.length === 0) ? (
          <div className="py-6 text-center text-xs font-mono text-eoc-muted">
            NO RESOURCE ALLOCATIONS ASSIGNED TO THIS CALL YET
          </div>
        ) : (
          <div className="space-y-2 font-mono text-xs">
            {data.allocations?.map((a: any) => (
              <div key={a.allocation_id} className="flex items-center justify-between rounded border border-eoc-border bg-eoc-panel2 p-3">
                <div>
                  <div className="font-bold text-eoc-text">
                    {a.resource_type_name || 'Emergency Supplies'} × {a.quantity_allocated} units
                  </div>
                  <div className="text-[11px] text-eoc-muted mt-0.5">
                    Score: {a.allocation_score} · Distance: {a.distance_km ? `${a.distance_km} km` : '0.8 km away'}
                  </div>
                </div>
                <StatusBadge value={a.status} />
              </div>
            ))}
          </div>
        )}
      </Panel>

      {/* Deployed Fleet */}
      <Panel title="Deployed Fleet & First Responders">
        {(!data.deployedVehicles || data.deployedVehicles.length === 0) ? (
          <div className="py-6 text-center text-xs font-mono text-eoc-muted">
            NO RESCUE VEHICLES DEPLOYED TO THIS CALL
          </div>
        ) : (
          <div className="space-y-2 font-mono text-xs">
            {data.deployedVehicles?.map((v: any) => (
              <div key={v.deployment_id} className="flex items-center justify-between rounded border border-eoc-border bg-eoc-panel2 p-3">
                <div className="flex items-center gap-2.5">
                  <Truck size={16} className="text-cyan-400" />
                  <div>
                    <div className="font-bold text-eoc-text">{v.vehicle_code}</div>
                    <div className="text-[11px] text-eoc-muted">{v.vehicle_type}</div>
                  </div>
                </div>
                <div className="text-right text-[11px] text-eoc-muted">
                  <div>Deployed: {new Date(v.deployed_at).toLocaleTimeString()}</div>
                  {v.returned_at && <div className="text-emerald-400">Returned: {new Date(v.returned_at).toLocaleTimeString()}</div>}
                </div>
              </div>
            ))}
          </div>
        )}
      </Panel>

      {/* Status History Timeline */}
      <Panel title="Triage Lifecycle History">
        <div className="space-y-2 font-mono text-xs">
          {data.history?.map((h: any) => (
            <div key={h.history_id} className="flex items-center justify-between border-b border-eoc-border/40 pb-1.5">
              <span className="text-eoc-text">
                <strong className="text-cyan-300">[{h.old_status || 'CREATED'}]</strong> &rarr; <strong className="text-emerald-400">[{h.new_status}]</strong>
              </span>
              <span className="text-eoc-muted text-[10px]">
                {new Date(h.changed_at).toLocaleString()}
              </span>
            </div>
          ))}
          {(!data.history || data.history.length === 0) && (
            <div className="text-eoc-muted">Initial distress intake logged.</div>
          )}
        </div>
      </Panel>
    </div>
  );
}

function ScoreRow({ label, value, note }: { label: string; value: number; note: string }) {
  return (
    <div className="flex items-center justify-between rounded border border-eoc-border bg-eoc-panel2 p-2.5">
      <div>
        <div className="font-semibold text-eoc-text">{label}</div>
        <div className="text-[10px] text-eoc-muted">{note}</div>
      </div>
      <div className="font-mono font-bold text-cyan-400 tabular-nums">
        +{Number(value).toFixed(1)}
      </div>
    </div>
  );
}
