import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Flame, 
  MapPin, 
  Users, 
  Clock, 
  ArrowLeft, 
  ShieldCheck, 
  AlertOctagon,
  Activity
} from 'lucide-react';
import { useFetch } from '../hooks/useFetch';
import { Panel, StatCard, StatusBadge, Skeleton, ErrorState, PageHeader, Button } from '../components/ui';
import DisasterMap from '../maps/DisasterMap';

export default function DisasterDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, loading, error, reload } = useFetch<any>(`/disasters/${id}`, [id]);

  if (loading) return <Skeleton className="h-96" />;
  if (error) return <ErrorState message={error} onRetry={reload} />;
  if (!data) return null;

  const markers = (data.zones || []).map((z: any) => ({
    id: z.zone_id,
    lat: z.latitude ?? data.latitude,
    lng: z.longitude ?? data.longitude,
    label: z.zone_name,
    type: 'disaster' as const,
    severity: z.severity,
    meta: `Zone ${z.zone_code} · Severity: ${z.severity} · Pop: ${z.population_estimate}`,
  }));

  return (
    <div className="space-y-4 font-sans">
      <PageHeader
        title={data.title}
        subtitle={`${data.disaster_type?.replace(/_/g, ' ')} · Initiated ${new Date(data.start_time).toLocaleString()}`}
        freshness="Disaster Telemetry Active"
        badge={
          <div className="flex items-center gap-1.5">
            <StatusBadge value={data.severity} />
            <StatusBadge value={data.status} />
          </div>
        }
        action={
          <Button variant="secondary" size="sm" onClick={() => navigate('/disasters')}>
            <ArrowLeft size={13} />
            ALL INCIDENTS
          </Button>
        }
      />

      <div className="p-3.5 rounded border border-eoc-border bg-eoc-panel2/60 text-xs text-eoc-text font-mono leading-relaxed">
        <strong className="text-cyan-400">INCIDENT OVERVIEW:</strong> {data.description}
      </div>

      {/* Telemetry KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard 
          label="Affected Population" 
          value={Number(data.affected_population).toLocaleString()} 
          tone="warning"
          icon={Users}
          sub="Inside evacuation sector"
        />
        <StatCard 
          label="Municipal Zones" 
          value={data.zones?.length ?? 0} 
          tone="info"
          icon={MapPin}
          sub="Impacted administrative wards"
        />
        <StatCard 
          label="Total Distress Calls" 
          value={data.impact?.total_requests ?? 0} 
          tone="warning"
          icon={Activity}
          sub="Filed across disaster lifecycle"
        />
        <StatCard 
          label="Resolved Requests" 
          value={data.impact?.resolved_requests ?? 0} 
          tone="normal"
          icon={ShieldCheck}
          sub="Aid packages delivered"
        />
      </div>

      {data.performance && (
        <Panel title="Response Time Performance Telemetry">
          <div className="grid grid-cols-3 gap-3">
            <StatCard label="Avg Response Latency" value={`${data.performance.avg_response_minutes ?? '—'} min`} tone="info" />
            <StatCard label="Median Latency" value={`${data.performance.median_response_minutes ?? '—'} min`} tone="normal" />
            <StatCard label="P90 Latency" value={`${data.performance.p90_response_minutes ?? '—'} min`} tone="warning" />
          </div>
        </Panel>
      )}

      {/* GIS Impact Map & Zones Grid */}
      <Panel title="Hazard Perimeter & Municipal Zones">
        <DisasterMap
          center={[data.latitude, data.longitude]}
          markers={markers}
          height={380}
        />
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 font-mono text-xs">
          {(data.zones || []).map((z: any) => (
            <div key={z.zone_id} className="rounded border border-eoc-border bg-eoc-panel2 p-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-eoc-text">Zone {z.zone_code}</span>
                <StatusBadge value={z.severity} />
              </div>
              <div className="mt-1 text-[11px] text-eoc-muted">{z.zone_name}</div>
              <div className="mt-2 flex items-center justify-between text-[10px] text-eoc-subtle border-t border-eoc-border/60 pt-1.5">
                <span>Pop: {Number(z.population_estimate).toLocaleString()}</span>
                <span className={z.is_accessible ? 'text-emerald-400' : 'text-red-400 font-bold'}>
                  {z.is_accessible ? 'ACCESSIBLE' : 'ACCESS RESTRICTED'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
