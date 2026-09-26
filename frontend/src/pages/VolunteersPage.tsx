import React, { useState, useMemo } from 'react';
import { 
  HeartHandshake, 
  Users, 
  CheckCircle2, 
  Clock, 
  Phone, 
  ShieldCheck, 
  UserCheck, 
  UserX 
} from 'lucide-react';
import { useFetch } from '../hooks/useFetch';
import { api, apiErrorMessage } from '../api/client';
import { DataTable } from '../components/DataTable';
import { Panel, StatusBadge, Button, ErrorState, PageHeader, StatCard } from '../components/ui';
import { AssignVolunteerModal } from '../components/AssignVolunteerModal';
import { useAuth } from '../hooks/useAuth';

export default function VolunteersPage() {
  const { hasRole } = useAuth();
  const { data, loading, error, reload } = useFetch<any[]>('/volunteers');
  const [selectedVolunteer, setSelectedVolunteer] = useState<any | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const volunteers = data || [];
  const canManage = hasRole('EMERGENCY_MANAGER', 'DISASTER_OFFICER', 'RESCUE_COORDINATOR');

  const availableCount = volunteers.filter(v => v.is_active && v.active_assignments === 0).length;
  const deployedCount = volunteers.filter(v => v.active_assignments > 0).length;

  const handleRelease = async (volunteerId: string) => {
    setActionError(null);
    try {
      await api.post(`/volunteers/${volunteerId}/release`);
      reload();
    } catch (err) {
      setActionError(apiErrorMessage(err));
    }
  };

  return (
    <div className="space-y-4 font-sans">
      <PageHeader
        title="Volunteer Auxiliary Operations Roster"
        subtitle="Civilian volunteer corps, specialized medical/logistical skills, and active emergency assignments"
        freshness="Volunteer Roster Synchronized"
        action={
          <Button variant="secondary" size="sm" onClick={reload}>
            SYNC VOLUNTEERS
          </Button>
        }
      />

      {/* Top Telemetry KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard 
          label="Total Registered" 
          value={volunteers.length} 
          tone="info"
          icon={Users}
          sub="Verified auxiliary personnel"
        />
        <StatCard 
          label="Standby / Ready" 
          value={availableCount} 
          tone="normal"
          icon={CheckCircle2}
          sub="Available for rapid callout"
        />
        <StatCard 
          label="Active Deployments" 
          value={deployedCount} 
          tone={deployedCount > 0 ? "warning" : "normal"}
          icon={Clock}
          sub="Dispatched to shelters/sites"
        />
        <StatCard 
          label="Auxiliary Readiness" 
          value={`${volunteers.length > 0 ? Math.round((availableCount / volunteers.length) * 100) : 0}%`} 
          tone="normal"
          icon={HeartHandshake}
          sub="Surge capacity buffer"
        />
      </div>

      {actionError && <ErrorState message={actionError} />}

      {selectedVolunteer && (
        <AssignVolunteerModal 
          isOpen={true}
          volunteer={selectedVolunteer}
          onClose={() => setSelectedVolunteer(null)}
          onSuccess={reload}
        />
      )}

      {/* Volunteers Table */}
      <Panel title="Auxiliary Personnel Roster">
        <DataTable
          loading={loading}
          error={error}
          onRetry={reload}
          rows={volunteers}
          emptyMessage="No volunteers registered."
          columns={[
            { 
              header: 'Volunteer Name', 
              render: (v: any) => (
                <div>
                  <div className="font-semibold text-eoc-text">{v.full_name}</div>
                  <div className="text-[10px] font-mono text-eoc-muted flex items-center gap-1">
                    <Phone size={10} />
                    <span>{v.phone || '+1 (555) 019-2831'}</span>
                  </div>
                </div>
              ) 
            },
            { 
              header: 'Certified Skills', 
              render: (v: any) => (
                <div className="flex flex-wrap gap-1 max-w-xs">
                  {(v.skills || 'Emergency First Aid, Logistics').split(',').map((skill: string, idx: number) => (
                    <span 
                      key={idx} 
                      className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-eoc-panel2 border border-eoc-border text-cyan-300"
                    >
                      {skill.trim()}
                    </span>
                  ))}
                </div>
              ) 
            },
            { 
              header: 'Active Tasks', 
              render: (v: any) => (
                <span className="font-mono text-xs tabular-nums text-eoc-text font-bold">
                  {v.active_assignments} missions
                </span>
              ) 
            },
            { 
              header: 'Duty Status', 
              render: (v: any) => (
                <StatusBadge 
                  value={v.active_assignments > 0 ? 'ASSIGNED' : v.is_active ? 'AVAILABLE' : 'OFF_DUTY'} 
                />
              ) 
            },
            { 
              header: 'Triage Actions', 
              render: (v: any) => {
                if (!canManage) {
                  return <span className="text-[10px] font-mono text-eoc-subtle">READ-ONLY</span>;
                }
                
                if (v.active_assignments > 0) {
                  return (
                    <Button 
                      variant="danger" 
                      size="sm"
                      onClick={() => handleRelease(v.volunteer_id)}
                    >
                      <UserX size={12} />
                      Release
                    </Button>
                  );
                } else if (v.is_active) {
                  return (
                    <Button 
                      variant="secondary" 
                      size="sm"
                      onClick={() => setSelectedVolunteer(v)}
                    >
                      <UserCheck size={12} />
                      Assign Task
                    </Button>
                  );
                }
                return null;
              }
            },
          ]}
        />
      </Panel>
    </div>
  );
}
