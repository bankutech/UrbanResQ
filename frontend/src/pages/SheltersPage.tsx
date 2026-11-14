import React, { useState, useMemo } from 'react';
import { 
  Home, 
  Users, 
  ShieldCheck, 
  UserPlus, 
  CheckCircle2, 
  UserMinus
} from 'lucide-react';
import { useFetch } from '../hooks/useFetch';
import { api, apiErrorMessage } from '../api/client';
import { DataTable } from '../components/DataTable';
import { Panel, StatusBadge, Button, ErrorState, PageHeader, StatCard } from '../components/ui';
import { useAuth } from '../hooks/useAuth';

export default function SheltersPage() {
  const { hasRole } = useAuth();
  const { data, loading, error, reload } = useFetch<any[]>('/shelters');
  const { data: residents, loading: resLoading, reload: reloadResidents } = useFetch<any[]>('/shelters/residents');
  const [checkInShelter, setCheckInShelter] = useState<any | null>(null);
  const [residentName, setResidentName] = useState('');
  const [citizenId, setCitizenId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const shelters = data || [];
  const activeResidents = residents || [];
  const canManage = hasRole('EMERGENCY_MANAGER', 'DISASTER_OFFICER', 'ADMIN');

  const totalMax = useMemo(() => shelters.reduce((acc, s) => acc + (s.max_capacity || 0), 0), [shelters]);
  const totalOccupied = useMemo(() => shelters.reduce((acc, s) => acc + (s.current_occupancy || 0), 0), [shelters]);
  const totalAvailable = useMemo(() => shelters.reduce((acc, s) => acc + (s.available_capacity || 0), 0), [shelters]);
  const avgOccupancy = totalMax > 0 ? Math.round((totalOccupied / totalMax) * 100) : 0;

  async function handleCheckInSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!checkInShelter) return;
    setActionError(null);
    setIsSubmitting(true);
    try {
      await api.post(`/shelters/${checkInShelter.shelter_id}/check-in`, {
        fullName: residentName,
        citizenId: citizenId || undefined,
      });
      setCheckInShelter(null);
      setResidentName('');
      setCitizenId('');
      reload();
      reloadResidents();
    } catch (err) {
      setActionError(apiErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleCheckOut(residentId: string) {
    setActionError(null);
    try {
      await api.post(`/shelters/residents/${residentId}/checkout`);
      reload();
      reloadResidents();
    } catch (err) {
      setActionError(apiErrorMessage(err));
    }
  }

  return (
    <div className="space-y-4 font-sans">
      <PageHeader
        title="Relief Shelters & Evacuee Logistics"
        subtitle="Evacuee intake, remaining capacity, and utility reserves"
        freshness="Shelter Telemetry Active"
        action={
          <Button variant="secondary" size="sm" onClick={() => { reload(); reloadResidents(); }}>
            SYNC SHELTERS
          </Button>
        }
      />

      {/* Top Telemetry KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard 
          label="Total Shelter Capacity" 
          value={totalMax.toLocaleString()} 
          tone="info"
          icon={Home}
          sub="Authorized civilian beds"
        />
        <StatCard 
          label="Current Evacuees" 
          value={totalOccupied.toLocaleString()} 
          tone={avgOccupancy > 80 ? "warning" : "normal"}
          icon={Users}
          sub={`Overall Load: ${avgOccupancy}%`}
        />
        <StatCard 
          label="Remaining Capacity" 
          value={totalAvailable.toLocaleString()} 
          tone={totalAvailable < 200 ? "critical" : "normal"}
          icon={CheckCircle2}
          sub="Available for intake"
        />
        <StatCard 
          label="Medical Stations" 
          value={`${shelters.filter(s => s.has_medical_support).length} / ${shelters.length}`} 
          tone="normal"
          icon={ShieldCheck}
          sub="On-site clinical triage"
        />
      </div>

      {actionError && <ErrorState message={actionError} />}

      {/* Shelter Facility Matrix */}
      <Panel title="Municipal Relief Shelter Facilities">
        <DataTable
          loading={loading}
          error={error}
          onRetry={reload}
          rows={shelters}
          emptyMessage="No shelters found."
          columns={[
            { 
              header: 'Shelter Facility', 
              render: (s: any) => (
                <div>
                  <div className="font-semibold text-eoc-text flex items-center gap-1.5">
                    <Home size={13} className="text-cyan-400" />
                    <span>{s.name}</span>
                  </div>
                  <div className="text-[10px] font-mono text-eoc-muted">
                    CODE: {s.shelter_code} · {s.zone_name}
                  </div>
                </div>
              ) 
            },
            { 
              header: 'Intake / Max', 
              render: (s: any) => (
                <span className="font-mono text-xs tabular-nums">
                  <strong className="text-eoc-text">{s.current_occupancy}</strong>
                  <span className="text-eoc-muted"> / {s.max_capacity}</span>
                </span>
              ) 
            },
            { 
              header: 'Occupancy Meter', 
              render: (s: any) => {
                const pct = s.occupancy_pct || 0;
                return (
                  <div className="w-28 font-mono text-xs">
                    <div className="flex justify-between text-[10px] text-eoc-muted mb-1">
                      <span>{pct}%</span>
                      <span>{s.available_capacity} free</span>
                    </div>
                    <div className="h-1.5 w-full bg-eoc-panel2 rounded overflow-hidden border border-eoc-border">
                      <div 
                        className={`h-full transition-all ${
                          pct > 85 ? 'bg-red-500' : pct > 65 ? 'bg-amber-400' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min(100, pct)}%` }}
                      />
                    </div>
                  </div>
                );
              } 
            },
            { 
              header: 'Food Reserve', 
              render: (s: any) => <StatusBadge value={s.food_supply_level} /> 
            },
            { 
              header: 'Water Reserve', 
              render: (s: any) => <StatusBadge value={s.water_supply_level} /> 
            },
            { 
              header: 'Clinic Support', 
              render: (s: any) => s.has_medical_support ? (
                <StatusBadge value="AVAILABLE" customLabel="ON-SITE CLINIC" />
              ) : (
                <span className="text-[10px] font-mono text-eoc-muted">—</span>
              ) 
            },
            {
              header: 'Intake Action',
              render: (s: any) => {
                if (!canManage) {
                  return <span className="text-[10px] font-mono text-eoc-subtle">READ-ONLY</span>;
                }
                const hasCapacity = s.available_capacity > 0;
                return (
                  <Button 
                    variant="secondary" 
                    size="sm"
                    disabled={!hasCapacity}
                    onClick={() => setCheckInShelter(s)}
                  >
                    <UserPlus size={12} />
                    Check-In
                  </Button>
                );
              },
            },
          ]}
        />
      </Panel>

      {/* Active Evacuee Residents Registry */}
      <Panel title={`Active Evacuee Residents Registry (${activeResidents.length} checked in)`}>
        <DataTable
          loading={resLoading}
          rows={activeResidents}
          emptyMessage="No residents currently logged in shelter network."
          columns={[
            {
              header: 'Resident Name',
              render: (r: any) => (
                <div className="font-mono text-xs font-semibold text-eoc-text">
                  {r.full_name}
                </div>
              )
            },
            {
              header: 'Shelter Hub',
              render: (r: any) => (
                <div>
                  <div className="text-xs font-semibold text-eoc-text">{r.shelter_name}</div>
                  <div className="text-[10px] font-mono text-eoc-muted">{r.shelter_code}</div>
                </div>
              )
            },
            {
              header: 'Check-In Timestamp',
              render: (r: any) => (
                <div className="font-mono text-xs text-eoc-muted">
                  {r.checked_in_at ? new Date(r.checked_in_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) : '—'}
                </div>
              )
            },
            {
              header: 'Checkout Action',
              render: (r: any) => {
                if (!canManage) {
                  return <span className="text-[10px] font-mono text-eoc-subtle">—</span>;
                }
                return (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCheckOut(r.resident_id)}
                    className="text-amber-400 hover:text-amber-300 border border-amber-500/30 hover:border-amber-500/60"
                  >
                    <UserMinus size={12} />
                    Check-Out & Free Bed
                  </Button>
                );
              }
            }
          ]}
        />
      </Panel>

      {/* Evacuee Check-In Modal */}
      {checkInShelter && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="checkin-modal-title"
        >
          <div className="w-full max-w-md rounded-md border border-cyan-500/40 bg-eoc-panel p-5 shadow-tactical-accent font-sans">
            <h3 id="checkin-modal-title" className="text-base font-bold font-display text-eoc-text flex items-center gap-2">
              <UserPlus size={16} className="text-cyan-400" />
              Shelter Evacuee Intake
            </h3>
            <p className="mt-1 text-xs text-eoc-muted font-mono">
              Target Shelter: <strong className="text-eoc-text">{checkInShelter.name}</strong> ({checkInShelter.available_capacity} free beds)
            </p>

            <form onSubmit={handleCheckInSubmit} className="mt-4 space-y-3 font-mono text-xs">
              <div>
                <label className="block text-[11px] text-eoc-muted mb-1">
                  EVACUEE FULL NAME:
                </label>
                <input
                  type="text"
                  value={residentName}
                  onChange={(e) => setResidentName(e.target.value)}
                  placeholder="e.g. Priya Sundaram"
                  className="w-full rounded border border-eoc-border bg-eoc-panel2 px-3 py-1.5 text-sm text-eoc-text outline-none focus:border-cyan-400"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] text-eoc-muted mb-1">
                  CITIZEN IDENTIFIER (OPTIONAL):
                </label>
                <input
                  type="text"
                  value={citizenId}
                  onChange={(e) => setCitizenId(e.target.value)}
                  placeholder="e.g. CIT-4029"
                  className="w-full rounded border border-eoc-border bg-eoc-panel2 px-3 py-1.5 text-xs text-eoc-text outline-none focus:border-cyan-400"
                />
              </div>

              <div className="mt-5 flex justify-end gap-2 border-t border-eoc-border pt-3">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setCheckInShelter(null)}
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
                  {isSubmitting ? 'Registering...' : 'Confirm Evacuee Intake'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
