import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, ChevronRight } from 'lucide-react';
import { useFetch } from '../hooks/useFetch';
import { Panel, Skeleton, EmptyState, PageHeader, Button } from '../components/ui';

export default function SearchResultsPage() {
  const [params] = useSearchParams();
  const q = params.get('q') || '';
  const navigate = useNavigate();
  const { data, loading } = useFetch<any>(`/search?q=${encodeURIComponent(q)}`, [q]);

  const sections = [
    { key: 'disasters', label: 'Disaster Incidents', linkFn: (r: any) => `/disasters/${r.disaster_id}`, render: (r: any) => r.title },
    { key: 'requests', label: 'Emergency Requests', linkFn: (r: any) => `/emergency-requests/${r.request_id}`, render: (r: any) => `#${r.request_id} — ${r.description}` },
    { key: 'hospitals', label: 'Hospital ERs', linkFn: () => '/hospitals', render: (r: any) => `${r.hospital_code} — ${r.name}` },
    { key: 'shelters', label: 'Relief Shelters', linkFn: () => '/shelters', render: (r: any) => `${r.shelter_code} — ${r.name}` },
    { key: 'teams', label: 'Rescue Squads', linkFn: () => '/rescue-teams', render: (r: any) => `${r.team_code} — ${r.team_name}` },
    { key: 'vehicles', label: 'Fleet Vehicles', linkFn: () => '/vehicles', render: (r: any) => `${r.vehicle_code} (${r.vehicle_type})` },
  ];

  const totalResults = data ? sections.reduce((sum, s) => sum + (data[s.key]?.length || 0), 0) : 0;

  return (
    <div className="space-y-4 font-sans">
      <PageHeader
        title={`Search Telemetry Query: "${q}"`}
        subtitle={`${loading ? 'Querying relational indices...' : `${totalResults} matched database records found`}`}
        freshness="Full-text Search Index Active"
      />

      {loading ? (
        <Skeleton className="h-64" />
      ) : totalResults === 0 ? (
        <EmptyState message={`Zero operational records matching "${q}". Try searching for disaster titles, zones, or vehicle codes.`} />
      ) : (
        <div className="space-y-3 font-mono text-xs">
          {sections.filter((s) => data[s.key]?.length > 0).map((s) => (
            <Panel key={s.key} title={`${s.label} (${data[s.key].length})`}>
              <div className="space-y-1.5">
                {data[s.key].map((r: any, i: number) => (
                  <div 
                    key={i} 
                    onClick={() => navigate(s.linkFn(r))} 
                    className="cursor-pointer rounded border border-eoc-border bg-eoc-panel2 p-2.5 hover:border-cyan-500/50 hover:bg-eoc-surface transition-colors flex items-center justify-between"
                  >
                    <span className="text-eoc-text font-semibold">{s.render(r)}</span>
                    <ChevronRight size={13} className="text-cyan-400" />
                  </div>
                ))}
              </div>
            </Panel>
          ))}
        </div>
      )}
    </div>
  );
}
