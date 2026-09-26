import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Flame, 
  AlertOctagon, 
  Users, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  ChevronRight, 
  Plus, 
  Search,
  Activity,
  Layers
} from 'lucide-react';
import { useFetch } from '../hooks/useFetch';
import { Panel, StatusBadge, StatCard, Button, PageHeader, Skeleton } from '../components/ui';

export default function DisastersPage() {
  const { data, loading, error, reload } = useFetch<any[]>('/disasters');
  const navigate = useNavigate();
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');
  const [search, setSearch] = useState<string>('');

  const disasters = data || [];

  const filtered = useMemo(() => {
    return disasters.filter((d: any) => {
      const matchSev = filterSeverity === 'ALL' || d.severity === filterSeverity || d.status === filterSeverity;
      const matchSearch = !search || 
        d.title?.toLowerCase().includes(search.toLowerCase()) || 
        d.disaster_type?.toLowerCase().includes(search.toLowerCase());
      return matchSev && matchSearch;
    });
  }, [disasters, filterSeverity, search]);

  const activeCount = disasters.filter((d) => d.status !== 'RESOLVED').length;
  const criticalCount = disasters.filter((d) => d.severity === 'CRITICAL').length;
  const totalAffected = disasters.reduce((acc, d) => acc + (Number(d.affected_population) || 0), 0);

  return (
    <div className="space-y-4 font-sans">
      <PageHeader 
        title="Disaster Incident Tracking" 
        subtitle="Active and historic catastrophe declarations across municipal sectors"
        freshness="Live GIS feed synchronized"
        action={
          <div className="flex items-center gap-2">
            <Button 
              variant="secondary" 
              size="sm"
              onClick={reload}
            >
              SYNC FEED
            </Button>
          </div>
        }
      />

      {/* Top Incident Telemetry Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard 
          label="Active Incidents" 
          value={activeCount} 
          tone={activeCount > 0 ? "critical" : "normal"}
          icon={Flame}
          sub="Under EOC Jurisdiction"
        />
        <StatCard 
          label="Critical Tier-1" 
          value={criticalCount} 
          tone="critical"
          icon={AlertOctagon}
          sub="Immediate Life Threat"
        />
        <StatCard 
          label="Citizens Affected" 
          value={totalAffected.toLocaleString()} 
          tone="warning"
          icon={Users}
          sub="Within Evacuation Radius"
        />
        <StatCard 
          label="Contained Incidents" 
          value={disasters.filter((d) => d.status === 'CONTAINED' || d.status === 'RESOLVED').length} 
          tone="normal"
          icon={ShieldCheck}
          sub="Stable Containment Lines"
        />
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-2.5 rounded border border-eoc-border bg-eoc-panel font-mono text-xs shadow-tactical">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-eoc-muted mr-1 uppercase text-[10px] font-bold">Severity Filter:</span>
          {['ALL', 'CRITICAL', 'HIGH', 'MODERATE', 'LOW', 'ACTIVE', 'RESOLVED'].map((sev) => (
            <button
              key={sev}
              onClick={() => setFilterSeverity(sev)}
              className={`px-2 py-0.5 rounded text-[11px] font-mono border transition-colors ${
                filterSeverity === sev 
                  ? 'bg-cyan-950 border-cyan-500/60 text-cyan-300 font-bold' 
                  : 'border-eoc-border text-eoc-muted hover:text-eoc-text hover:bg-eoc-panel2'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-56">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-eoc-muted" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search incidents or type..."
              className="w-full rounded border border-eoc-border bg-eoc-panel2 pl-7 pr-3 py-1 text-xs font-mono outline-none text-eoc-text placeholder:text-eoc-subtle focus:border-cyan-400"
            />
          </div>
        </div>
      </div>

      {/* Incident Dossier Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-48" />
          ))
        ) : filtered.length === 0 ? (
          <div className="col-span-full py-16 text-center text-xs font-mono text-eoc-muted bg-eoc-panel rounded border border-eoc-border">
            NO INCIDENTS MATCHING SEARCH CRITERIA
          </div>
        ) : (
          filtered.map((d: any) => {
            const startDate = new Date(d.start_time);
            const elapsedHours = Math.max(1, Math.round((Date.now() - startDate.getTime()) / (1000 * 60 * 60)));

            return (
              <div
                key={d.disaster_id}
                onClick={() => navigate(`/disasters/${d.disaster_id}`)}
                className="group relative cursor-pointer rounded-md border border-eoc-border bg-eoc-panel p-4 shadow-tactical hover:border-cyan-500/50 hover:bg-eoc-panel2 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <StatusBadge value={d.severity} />
                    <span className="font-mono text-[10px] text-eoc-muted border border-eoc-border px-1.5 py-0.5 rounded">
                      #{d.disaster_id}
                    </span>
                  </div>

                  <h3 className="mt-2.5 font-bold font-display text-sm text-eoc-text group-hover:text-cyan-300 transition-colors line-clamp-1">
                    {d.title}
                  </h3>
                  <div className="mt-1 text-[11px] font-mono text-eoc-muted uppercase">
                    TYPE: <strong className="text-eoc-text">{d.disaster_type?.replace(/_/g, ' ')}</strong>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs font-mono border-t border-eoc-border/60 pt-2.5">
                    <div>
                      <div className="text-[10px] text-eoc-subtle uppercase">Affected Pop.</div>
                      <div className="text-eoc-text font-bold tabular-nums">
                        {Number(d.affected_population).toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-eoc-subtle uppercase">Mission Elapsed</div>
                      <div className="text-cyan-400 font-bold tabular-nums flex items-center gap-1">
                        <Clock size={11} /> {elapsedHours}h ago
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-eoc-border/60 pt-2 text-xs font-mono">
                  <span className="text-[10px] text-eoc-muted flex items-center gap-1">
                    <StatusBadge value={d.status} />
                  </span>
                  <span className="text-cyan-400 font-semibold group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                    <span>Incident Dossier</span>
                    <ChevronRight size={13} />
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
