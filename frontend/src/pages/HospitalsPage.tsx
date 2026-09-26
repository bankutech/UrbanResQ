import React, { useState, useMemo } from 'react';
import { 
  Building2, 
  Activity, 
  HeartPulse, 
  AlertOctagon, 
  UserPlus, 
  CheckCircle2, 
  Plus, 
  ShieldAlert, 
  Syringe,
  Bed
} from 'lucide-react';
import { useFetch } from '../hooks/useFetch';
import { api, apiErrorMessage } from '../api/client';
import { DataTable } from '../components/DataTable';
import { Panel, StatusBadge, Button, ErrorState, PageHeader, StatCard } from '../components/ui';
import { useAuth } from '../hooks/useAuth';

export default function HospitalsPage() {
  const { hasRole } = useAuth();
  const { data, loading, error, reload } = useFetch<any[]>('/hospitals');
  const [admitHospital, setAdmitHospital] = useState<any | null>(null);
  const [patientName, setPatientName] = useState('');
  const [condition, setCondition] = useState<'STABLE' | 'SERIOUS' | 'CRITICAL'>('SERIOUS');
  const [needsIcu, setNeedsIcu] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const hospitals = data || [];
  const canAdmit = hasRole('MEDICAL_COORDINATOR', 'EMERGENCY_MANAGER');

  const totalBeds = useMemo(() => hospitals.reduce((acc, h) => acc + (h.total_beds || 0), 0), [hospitals]);
  const availableBeds = useMemo(() => hospitals.reduce((acc, h) => acc + (h.available_beds || 0), 0), [hospitals]);
  const availableIcu = useMemo(() => hospitals.reduce((acc, h) => acc + (h.available_icu_beds || 0), 0), [hospitals]);
  const totalEdPatients = useMemo(() => hospitals.reduce((acc, h) => acc + (h.current_ed_patients || 0), 0), [hospitals]);

  async function handleAdmitSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!admitHospital) return;
    setActionError(null);
    setIsSubmitting(true);
    try {
      await api.post('/hospitals/admit', {
        hospitalId: String(admitHospital.hospital_id),
        patientName,
        condition,
        needsIcu,
      });
      setAdmitHospital(null);
      setPatientName('');
      reload();
    } catch (err) {
      setActionError(apiErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-4 font-sans">
      <PageHeader
        title="Hospital Facilities & ER Surge Capacity"
        subtitle="Critical care telemetry, ICU bed availability, blood bank reserves, and rapid patient admission triage"
        freshness="Hospital Health Telemetry Active"
        action={
          <Button variant="secondary" size="sm" onClick={reload}>
            SYNC CAPACITY
          </Button>
        }
      />

      {/* Top Telemetry KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard 
          label="Available ER Beds" 
          value={`${availableBeds} / ${totalBeds}`} 
          tone={availableBeds < 30 ? "critical" : "normal"}
          icon={Bed}
          sub="General Ward Beds Open"
        />
        <StatCard 
          label="Available ICU Beds" 
          value={availableIcu} 
          tone={availableIcu < 10 ? "critical" : "normal"}
          icon={HeartPulse}
          sub="Ventilator-Ready Critical Care"
        />
        <StatCard 
          label="Active ER Intake" 
          value={totalEdPatients} 
          tone="warning"
          icon={Activity}
          sub="Patients currently in triage"
        />
        <StatCard 
          label="Blood Bank Reserves" 
          value={hospitals.filter(h => h.blood_supply_level === 'CRITICAL').length > 0 ? 'CRITICAL DEFICIT' : 'STABLE'} 
          tone={hospitals.filter(h => h.blood_supply_level === 'CRITICAL').length > 0 ? 'critical' : 'normal'}
          icon={Syringe}
          sub="City-wide whole blood supply"
        />
      </div>

      {actionError && <ErrorState message={actionError} />}

      {/* Hospital Facility Matrix */}
      <Panel title="Hospital Facility Capacity & Triage Matrix">
        <DataTable
          loading={loading}
          error={error}
          onRetry={reload}
          rows={hospitals}
          emptyMessage="No hospitals found."
          columns={[
            { 
              header: 'Facility Name', 
              render: (h: any) => (
                <div>
                  <div className="font-semibold text-eoc-text flex items-center gap-1.5">
                    <Building2 size={13} className="text-cyan-400" />
                    <span>{h.name}</span>
                  </div>
                  <div className="text-[10px] font-mono text-eoc-muted">
                    CODE: {h.hospital_code} · {h.zone_name}
                  </div>
                </div>
              ) 
            },
            { 
              header: 'General Beds', 
              render: (h: any) => (
                <div className="font-mono text-xs tabular-nums">
                  <span className="font-bold text-eoc-text">{h.available_beds}</span>
                  <span className="text-eoc-muted"> / {h.total_beds}</span>
                </div>
              ) 
            },
            { 
              header: 'Surge Occupancy', 
              render: (h: any) => {
                const pct = h.occupancy_pct || 0;
                return (
                  <div className="w-32 font-mono text-xs">
                    <div className="flex justify-between text-[10px] text-eoc-muted mb-1">
                      <span>{pct}% Load</span>
                      <span className={pct > 85 ? 'text-red-400 font-bold' : ''}>
                        {pct > 85 ? 'SURGE' : 'NOMINAL'}
                      </span>
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
              header: 'ICU Beds', 
              render: (h: any) => (
                <div className="font-mono text-xs tabular-nums">
                  <span className={`font-bold ${h.available_icu_beds === 0 ? 'text-red-400' : 'text-cyan-300'}`}>
                    {h.available_icu_beds}
                  </span>
                  <span className="text-eoc-muted"> / {h.icu_beds}</span>
                </div>
              ) 
            },
            { 
              header: 'ED Patients', 
              render: (h: any) => (
                <span className="font-mono text-xs font-semibold tabular-nums text-eoc-text">
                  {h.current_ed_patients}
                </span>
              ) 
            },
            { 
              header: 'Blood Reserves', 
              render: (h: any) => <StatusBadge value={h.blood_supply_level} /> 
            },
            {
              header: 'Medical Actions',
              render: (h: any) => {
                if (!canAdmit) {
                  return <span className="text-[10px] font-mono text-eoc-subtle">READ-ONLY</span>;
                }
                const hasCapacity = h.available_beds > 0;
                return (
                  <Button 
                    variant="secondary" 
                    size="sm"
                    disabled={!hasCapacity}
                    onClick={() => setAdmitHospital(h)}
                  >
                    <UserPlus size={12} />
                    Admit Patient
                  </Button>
                );
              },
            },
          ]}
        />
      </Panel>

      {/* Rapid Patient Admission Modal */}
      {admitHospital && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="admit-modal-title"
        >
          <div className="w-full max-w-md rounded-md border border-cyan-500/40 bg-eoc-panel p-5 shadow-tactical-accent font-sans">
            <h3 id="admit-modal-title" className="text-base font-bold font-display text-eoc-text flex items-center gap-2">
              <UserPlus size={16} className="text-cyan-400" />
              Emergency Patient Admission
            </h3>
            <p className="mt-1 text-xs text-eoc-muted font-mono">
              Facility: <strong className="text-eoc-text">{admitHospital.name}</strong> ({admitHospital.available_beds} beds free, {admitHospital.available_icu_beds} ICU open)
            </p>

            <form onSubmit={handleAdmitSubmit} className="mt-4 space-y-3 font-mono text-xs">
              <div>
                <label className="block text-[11px] text-eoc-muted mb-1">
                  PATIENT FULL NAME / TRIAGE TAG:
                </label>
                <input
                  type="text"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  placeholder="e.g. John Doe / TAG-RED-442"
                  className="w-full rounded border border-eoc-border bg-eoc-panel2 px-3 py-1.5 text-sm text-eoc-text outline-none focus:border-cyan-400"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] text-eoc-muted mb-1">
                  TRIAGE SEVERITY CONDITION:
                </label>
                <select
                  value={condition}
                  onChange={(e) => setCondition(e.target.value as any)}
                  className="w-full rounded border border-eoc-border bg-eoc-panel2 px-3 py-1.5 text-xs text-eoc-text outline-none focus:border-cyan-400"
                >
                  <option value="STABLE">STABLE (Minor Wounds / Observation)</option>
                  <option value="SERIOUS">SERIOUS (Fractures / Inhalation)</option>
                  <option value="CRITICAL">CRITICAL (Trauma / Cardiac / Hemorrhage)</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="needs-icu-check"
                  checked={needsIcu}
                  onChange={(e) => setNeedsIcu(e.target.checked)}
                  className="h-4 w-4 rounded border-eoc-border bg-eoc-panel text-cyan-600 focus:ring-cyan-500"
                />
                <label htmlFor="needs-icu-check" className="text-xs text-eoc-text cursor-pointer">
                  Requires Immediate ICU Bed Allocation (Ventilator/Life Support)
                </label>
              </div>

              <div className="mt-5 flex justify-end gap-2 border-t border-eoc-border pt-3">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setAdmitHospital(null)}
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
                  {isSubmitting ? 'Admitting Patient...' : 'Authorize Admission'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
