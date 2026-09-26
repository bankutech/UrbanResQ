import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Zap, 
  MapPin, 
  Send, 
  Eye, 
  ArrowUpCircle, 
  Video, 
  Radio, 
  ShieldAlert, 
  CheckCircle2, 
  Layers, 
  Crosshair,
  Clock,
  Sparkles
} from 'lucide-react';
import { useFetch } from '../hooks/useFetch';
import { useSocket } from '../hooks/useSocket';
import { api, apiErrorMessage } from '../api/client';
import { Panel, StatusBadge, Skeleton, Button, ErrorState, PageHeader } from '../components/ui';
import DisasterMap, { MapMarker, MARKER_COLORS } from '../maps/DisasterMap';
import { HeatmapPoint } from '../maps/HeatmapLayer';
import { DroneFeedPiP } from '../components/DroneFeedPiP';
import { useAuth } from '../hooks/useAuth';

export default function CommandCenterPage() {
  const { hasRole } = useAuth();
  const navigate = useNavigate();
  const { data: dashboard, loading: dashLoading, reload: reloadDashboard } = useFetch<any>('/dashboard');
  const { data: requests, loading: reqLoading, reload: reloadRequests } = useFetch<any>(
    '/emergency-requests?status=PENDING&pageSize=12'
  );
  const { data: allRequests, reload: reloadAllRequests } = useFetch<any>(
    '/emergency-requests?status=PENDING&pageSize=500'
  );
  const { data: resources, loading: resLoading, reload: reloadResources } = useFetch<any>('/resources');
  const { data: teams, reload: reloadTeams } = useFetch<any>('/rescue-teams');
  const { data: hospitals, reload: reloadHospitals } = useFetch<any>('/hospitals');
  const { data: shelters, reload: reloadShelters } = useFetch<any>('/shelters');

  useSocket('database_updated', () => {
    reloadDashboard();
    reloadRequests();
    reloadAllRequests();
    reloadResources();
    reloadTeams();
    reloadHospitals();
    reloadShelters();
  });

  const [generating, setGenerating] = useState(false);
  const [planResult, setPlanResult] = useState<any | null>(null);
  const [genError, setGenError] = useState<string | null>(null);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [showDroneFeed, setShowDroneFeed] = useState(false);
  const [selectedMarkerId, setSelectedMarkerId] = useState<string | number | null>(null);
  const [filterLayer, setFilterLayer] = useState<'all' | 'disaster' | 'hospital' | 'shelter' | 'team'>('all');

  const flagship = dashboard?.disasters?.[0];

  const resourceTypeNames: Record<number, string> = useMemo(() => {
    const map: Record<number, string> = {};
    (resources || []).forEach((r: any) => { 
      map[r.resource_type_id] = r.resource_type_name; 
    });
    return map;
  }, [resources]);

  async function handleGeneratePlan() {
    const confirmed = window.confirm(
      'EXECUTE ATOMIC FIFO ALLOCATION DISPATCH?\n\n' +
      'This procedure calculates priority-weighted proximity scores and atomically commits ' +
      'FIFO batch reservations against available depot inventory. Proceed with live dispatch?'
    );
    if (!confirmed) return;

    setGenerating(true);
    setGenError(null);
    try {
      const res = await api.post('/allocations/generate', { 
        disasterId: flagship?.disaster_id ?? null, 
        dryRun: false 
      });
      setPlanResult(res.data);
      reloadRequests();
      reloadResources();
    } catch (err) {
      setGenError(apiErrorMessage(err));
    } finally {
      setGenerating(false);
    }
  }

  const allMarkers: MapMarker[] = useMemo(() => {
    const list: MapMarker[] = [];
    if (dashboard?.disasters) {
      dashboard.disasters.forEach((d: any) => 
        list.push({ 
          id: d.disaster_id, 
          lat: d.latitude, 
          lng: d.longitude, 
          label: d.title, 
          type: 'disaster', 
          severity: d.severity,
          meta: `${d.severity} · ${d.unresolved_requests} unresolved requests`,
          radiusMeters: 2400
        })
      );
    }
    if (teams) {
      teams.forEach((t: any) => 
        t.latitude && list.push({ 
          id: `team-${t.team_id}`, 
          lat: t.latitude, 
          lng: t.longitude, 
          label: t.team_name, 
          type: 'team', 
          meta: `Specialization: ${t.specialization} · ${t.availability}` 
        })
      );
    }
    if (hospitals) {
      hospitals.forEach((h: any) => 
        h.latitude && list.push({ 
          id: `hosp-${h.hospital_id}`, 
          lat: h.latitude, 
          lng: h.longitude, 
          label: h.name, 
          type: 'hospital', 
          meta: `ER Capacity: ${h.available_beds}/${h.total_beds} beds · ICU: ${h.available_icu_beds}` 
        })
      );
    }
    if (shelters) {
      shelters.forEach((s: any) => 
        s.latitude && list.push({ 
          id: `shelter-${s.shelter_id}`, 
          lat: s.latitude, 
          lng: s.longitude, 
          label: s.name, 
          type: 'shelter', 
          meta: `Shelter: ${s.available_capacity} capacity remaining` 
        })
      );
    }
    return list;
  }, [dashboard?.disasters, teams, hospitals, shelters]);

  const filteredMarkers = useMemo(() => {
    if (filterLayer === 'all') return allMarkers;
    return allMarkers.filter((m) => m.type === filterLayer);
  }, [allMarkers, filterLayer]);

  const heatmapPoints: HeatmapPoint[] = useMemo(() => {
    if (!allRequests?.data) return [];
    return allRequests.data
      .filter((r: any) => r.latitude && r.longitude)
      .map((r: any) => [
        r.latitude, 
        r.longitude, 
        Math.min(1.0, (Number(r.live_priority_score) || 50) / 100)
      ] as HeatmapPoint);
  }, [allRequests?.data]);

  return (
    <div className="flex flex-col gap-3 font-sans" role="region" aria-label="EOC Command Center Cockpit">
      <div className="flex flex-wrap items-center justify-between gap-3 bg-eoc-panel border border-eoc-border px-4 py-2.5 shadow-tactical">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center border border-cyan-500/40 bg-cyan-950/80 text-cyan-400">
            <Radio size={16} className="animate-pulse" />
          </div>
          <div>
            <div className="text-sm font-bold font-display tracking-tight text-eoc-text flex items-center gap-2">
              <span>EOC Central Cockpit</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 bg-eoc-panel2 border border-eoc-border text-cyan-400">
                DEFCON WATCH ACTIVE
              </span>
            </div>
            <div className="text-[11px] font-mono text-eoc-muted">
              Primary Focus: <strong className="text-eoc-text">{flagship ? flagship.title : 'City-wide Surveillance'}</strong>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            variant="secondary" 
            size="sm"
            onClick={() => setShowDroneFeed(true)}
            className="border-cyan-500/40 text-cyan-300 hover:bg-cyan-950/40"
          >
            <Video size={13} className="text-red-400 animate-pulse" />
            <span>UAV DRONE FEED</span>
          </Button>

          {hasRole('EMERGENCY_MANAGER', 'RESOURCE_MANAGER') && (
            <Button 
              variant="primary" 
              size="sm"
              onClick={handleGeneratePlan} 
              disabled={generating}
              className="bg-cyan-600 hover:bg-cyan-500 shadow-tactical-accent"
            >
              <Send size={13} />
              <span>{generating ? 'COMPUTING FIFO...' : 'DISPATCH FIFO ALLOCATIONS'}</span>
            </Button>
          )}
        </div>
      </div>

      {genError && <ErrorState message={genError} />}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 min-h-[520px]">
        <div className="lg:col-span-7 flex flex-col gap-2">
          <Panel 
            title="Geospatial Telemetry & Threat Radius" 
            noPadding
            action={
              <div className="flex items-center gap-2 font-mono text-[11px]">
                <select
                  value={filterLayer}
                  onChange={(e) => setFilterLayer(e.target.value as any)}
                  className="border border-eoc-border bg-eoc-panel px-2 py-0.5 text-[10px] text-eoc-text outline-none"
                  aria-label="Filter GIS map layers"
                >
                  <option value="all">ALL ASSETS ({allMarkers.length})</option>
                  <option value="disaster">DISASTERS ONLY</option>
                  <option value="hospital">HOSPITALS</option>
                  <option value="shelter">SHELTERS</option>
                  <option value="team">RESCUE TEAMS</option>
                </select>

                <div className="h-3 w-px bg-eoc-border" />

                <button
                  onClick={() => setShowHeatmap(!showHeatmap)}
                  className={`px-2 py-0.5 text-[10px] font-mono border transition-colors ${
                    showHeatmap 
                      ? 'bg-amber-950 border-amber-500/50 text-amber-300' 
                      : 'border-eoc-border text-eoc-muted hover:text-eoc-text'
                  }`}
                  aria-pressed={showHeatmap}
                >
                  HEATMAP {showHeatmap ? 'ON' : 'OFF'}
                </button>
              </div>
            }
          >
            {dashLoading ? (
              <Skeleton className="h-[480px]" />
            ) : (
              <DisasterMap 
                markers={filteredMarkers} 
                showHeatmap={showHeatmap} 
                heatmapPoints={heatmapPoints}
                height={500}
                selectedId={selectedMarkerId}
                onSelectMarker={(m) => setSelectedMarkerId(m.id)}
              />
            )}
          </Panel>

          <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-1.5 border border-eoc-border bg-eoc-panel font-mono text-[11px] text-eoc-muted">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 bg-red-500 animate-pulse" />
                <span className="text-red-300">Disaster Epicenter</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 bg-cyan-400" />
                <span>Hospital ER</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 bg-emerald-400" />
                <span>Relief Shelter</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 bg-amber-400" />
                <span>Field Rescue Team</span>
              </span>
            </div>
            <span className="text-[10px] text-eoc-subtle">Click marker for tactical drilldown</span>
          </div>
        </div>

        <div className="lg:col-span-5 flex flex-col gap-3">
          <Panel 
            title="High-Priority Triage Queue" 
            badge={
              <span className="text-[10px] font-mono px-1.5 py-0.2 bg-amber-950/70 text-amber-300 border border-amber-500/40">
                {requests?.data?.length || 0} PENDING
              </span>
            }
            action={
              <button 
                onClick={() => navigate('/emergency-requests')}
                className="text-[11px] font-mono text-cyan-400 hover:underline flex items-center gap-1"
              >
                <span>VIEW ALL</span> &rarr;
              </button>
            }
          >
            {reqLoading ? (
              <Skeleton className="h-60" />
            ) : (
              <div className="space-y-2 max-h-[240px] overflow-y-auto pr-1">
                {requests?.data?.length === 0 && (
                  <div className="py-8 text-center text-xs font-mono text-eoc-muted">
                    ZERO PENDING EMERGENCY REQUESTS
                  </div>
                )}
                {requests?.data?.map((r: any) => (
                  <div 
                    key={r.request_id} 
                    className="border border-eoc-border bg-eoc-panel2/60 p-2.5 hover:border-cyan-500/40 hover:bg-eoc-surface transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <StatusBadge value={r.urgency} />
                      <span className="font-mono text-[10px] px-1.5 py-0.5 bg-eoc-panel border border-eoc-border text-cyan-300 font-bold">
                        SCORE {Number(r.live_priority_score).toFixed(0)}
                      </span>
                    </div>
                    <div className="mt-1.5 text-xs font-medium text-eoc-text line-clamp-1">
                      #{r.request_id} — {r.description}
                    </div>
                    <div className="mt-1 flex items-center justify-between text-[11px] font-mono text-eoc-muted">
                      <span className="flex items-center gap-1 truncate max-w-[180px]">
                        <MapPin size={11} className="text-cyan-400 shrink-0" />
                        {r.zone_name || r.location_label}
                      </span>
                      <span>{r.people_affected} affected</span>
                    </div>
                    <div className="mt-2 flex items-center justify-end gap-2 border-t border-eoc-border/60 pt-1.5">
                      <button 
                        onClick={() => navigate(`/emergency-requests/${r.request_id}`)}
                        className="text-[11px] font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                      >
                        <Eye size={12} />
                        <span>Triage Details</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Panel>

          <Panel 
            title="Depot Stock Health & Critical Thresholds" 
            badge={
              <span className="text-[10px] font-mono px-1.5 py-0.2 bg-cyan-950 text-cyan-300 border border-cyan-800">
                DEPOTS ONLINE
              </span>
            }
            action={
              <button 
                onClick={() => navigate('/inventory')}
                className="text-[11px] font-mono text-cyan-400 hover:underline flex items-center gap-1"
              >
                <span>INVENTORY</span> &rarr;
              </button>
            }
          >
            {resLoading ? (
              <Skeleton className="h-52" />
            ) : (
              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                {resources?.slice(0, 8).map((r: any, i: number) => {
                  const available = Number(r.available_quantity) || 0;
                  const threshold = Number(r.min_threshold) || 100;
                  const pct = Math.min(100, Math.round((available / (threshold * 2)) * 100));
                  return (
                    <div key={i} className="border border-eoc-border bg-eoc-panel2/50 p-2 text-xs font-mono">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-eoc-text">{r.resource_type_name}</span>
                        <StatusBadge value={r.stock_status} />
                      </div>
                      <div className="mt-1 flex items-center justify-between text-[11px] text-eoc-muted">
                        <span>{r.location_label || 'Central Logistics Hub'}</span>
                        <span className="text-eoc-text font-bold tabular-nums">
                          {available.toLocaleString()} {r.unit}
                        </span>
                      </div>
                      <div className="mt-1.5 h-1.5 w-full bg-eoc-panel overflow-hidden border border-eoc-border">
                        <div 
                          className={`h-full transition-all ${
                            r.stock_status === 'CRITICAL' ? 'bg-red-500' :
                            r.stock_status === 'WARNING' ? 'bg-amber-400' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Panel>
        </div>
      </div>

      {planResult && (
        <Panel 
          title="Live FIFO Allocation Execution Matrix"
          badge={
            <span className="text-[10px] font-mono px-1.5 py-0.2 bg-emerald-950 text-emerald-300 border border-emerald-500/40">
              {planResult.dryRun ? 'SIMULATION' : 'COMMITTED TO DATABASE (ACID FIFO)'}
            </span>
          }
          action={
            <Button size="sm" variant="secondary" onClick={() => setPlanResult(null)}>
              DISMISS MATRIX
            </Button>
          }
        >
          <div className="space-y-3 font-mono text-xs">
            <div className="overflow-x-auto">
              <table className="eoc-table">
                <thead>
                  <tr>
                    <th>Request ID</th>
                    <th>Resource Type</th>
                    <th>Units Allocated</th>
                    <th>Depot Distance</th>
                    <th>Estimated Response</th>
                    <th>Priority Score</th>
                    <th>FIFO Status</th>
                  </tr>
                </thead>
                <tbody>
                  {planResult.plan?.map((p: any, i: number) => (
                    <tr key={i}>
                      <td className="font-bold text-cyan-400">#{p.request_id}</td>
                      <td>{resourceTypeNames[p.resource_type_id] || `Resource #${p.resource_type_id}`}</td>
                      <td className="tabular-nums font-bold">{p.quantity_allocated}</td>
                      <td className="tabular-nums">{p.distance_km ? `${p.distance_km} km` : '0.8 km'}</td>
                      <td className="tabular-nums text-emerald-400">{p.estimated_response_minutes ? `${p.estimated_response_minutes} min` : '12 min'}</td>
                      <td className="tabular-nums font-semibold">{p.allocation_score}</td>
                      <td>
                        <StatusBadge value={p.fulfilled ? "APPROVED" : "CRITICAL"} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {planResult.shortages?.length > 0 && (
              <div className="border border-red-500/50 bg-red-950/40 p-3">
                <div className="flex items-center gap-2 font-bold text-red-400 text-xs">
                  <ArrowUpCircle size={14} />
                  CRITICAL DEFICIT SHORTAGES DETECTED:
                </div>
                <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-red-200">
                  {planResult.shortages.map((s: any, i: number) => (
                    <div key={i} className="flex justify-between border-b border-red-900/60 pb-1">
                      <span>{resourceTypeNames[s.resource_type_id] || `Resource #${s.resource_type_id}`}:</span>
                      <strong className="text-red-300 tabular-nums">+{s.total_required} units needed</strong>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Panel>
      )}

      {showDroneFeed && <DroneFeedPiP onClose={() => setShowDroneFeed(false)} />}
    </div>
  );
}
