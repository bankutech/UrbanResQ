import React, { useState } from 'react';
import { useFetch } from '../hooks/useFetch';
import { api, apiErrorMessage } from '../api/client';
import { X, UserPlus, Loader2, MapPin, AlertTriangle } from 'lucide-react';

export function AssignVolunteerModal({
  isOpen,
  onClose,
  volunteer,
  onSuccess
}: {
  isOpen: boolean;
  onClose: () => void;
  volunteer: any;
  onSuccess: () => void;
}) {
  const { data: shelters, loading: loadingShelters } = useFetch<any[]>('/shelters');
  const { data: requestsData, loading: loadingRequests } = useFetch<any>('/emergency-requests?status=PENDING&pageSize=100');
  
  const [activeTab, setActiveTab] = useState<'SHELTER' | 'REQUEST'>('SHELTER');
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !volunteer) return null;

  const handleAssign = async () => {
    if (!selectedId) return;
    setSubmitting(true);
    setError(null);
    try {
      const payload = activeTab === 'SHELTER' ? { shelterId: selectedId } : { requestId: selectedId };
      await api.post(`/volunteers/${volunteer.volunteer_id}/assign`, payload);
      onSuccess();
      onClose();
    } catch (err) {
      setError(apiErrorMessage(err));
      setSubmitting(false);
    }
  };

  const requests = requestsData?.data || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-2xl rounded-md border border-eoc-border bg-eoc-panel shadow-md overflow-hidden flex flex-col max-h-[85vh]">
        <div className="flex items-center justify-between border-b border-eoc-border bg-eoc-panel2 px-4 py-3">
          <h2 className="font-display text-lg font-bold tracking-wide flex items-center gap-2">
            <UserPlus size={18} className="text-eoc-accent" /> Dispatch {volunteer.full_name}
          </h2>
          <button onClick={onClose} className="text-eoc-muted hover:text-eoc-text transition">
            <X size={20} />
          </button>
        </div>

        <div className="border-b border-eoc-border px-4 py-2 flex gap-4">
          <button 
            className={`text-sm font-medium pb-2 border-b-2 transition ${activeTab === 'SHELTER' ? 'border-eoc-accent text-eoc-text' : 'border-transparent text-eoc-muted hover:text-eoc-text'}`}
            onClick={() => { setActiveTab('SHELTER'); setSelectedId(null); }}
          >
            Assign to Shelter
          </button>
          <button 
            className={`text-sm font-medium pb-2 border-b-2 transition ${activeTab === 'REQUEST' ? 'border-eoc-accent text-eoc-text' : 'border-transparent text-eoc-muted hover:text-eoc-text'}`}
            onClick={() => { setActiveTab('REQUEST'); setSelectedId(null); }}
          >
            Assign to Emergency Request
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 min-h-0">
          {error && (
            <div className="mb-4 rounded bg-eoc-critical/10 border border-eoc-critical/40 p-3 text-sm text-eoc-critical">
              {error}
            </div>
          )}

          {activeTab === 'SHELTER' && (
            <div className="space-y-2">
              {loadingShelters ? (
                <div className="flex justify-center py-8"><Loader2 className="animate-spin text-eoc-muted" /></div>
              ) : shelters?.length === 0 ? (
                <div className="py-8 text-center text-eoc-muted">No shelters available.</div>
              ) : (
                shelters?.map(s => (
                  <div 
                    key={s.shelter_id}
                    onClick={() => setSelectedId(s.shelter_id)}
                    className={`cursor-pointer rounded border p-3 transition ${
                      selectedId === s.shelter_id 
                        ? 'border-eoc-accent bg-eoc-accent/10' 
                        : 'border-eoc-border hover:border-eoc-muted bg-eoc-bg'
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold">
                      {s.name}
                      <span className="text-xs font-normal text-eoc-muted font-mono">{s.current_occupancy}/{s.max_capacity} occupancy</span>
                    </div>
                    <div className="text-xs text-eoc-muted flex items-center gap-1 mt-1"><MapPin size={12} /> {s.location_label}</div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'REQUEST' && (
            <div className="space-y-2">
              {loadingRequests ? (
                <div className="flex justify-center py-8"><Loader2 className="animate-spin text-eoc-muted" /></div>
              ) : requests.length === 0 ? (
                <div className="py-8 text-center text-eoc-muted">No pending requests.</div>
              ) : (
                requests.map((r: any) => (
                  <div 
                    key={r.request_id}
                    onClick={() => setSelectedId(r.request_id)}
                    className={`cursor-pointer rounded border p-3 transition ${
                      selectedId === r.request_id 
                        ? 'border-eoc-accent bg-eoc-accent/10' 
                        : 'border-eoc-border hover:border-eoc-muted bg-eoc-bg'
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold">
                      <span>#{r.request_id} — {r.category}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded border ${
                        r.urgency === 'CRITICAL' ? 'border-eoc-critical text-eoc-critical' :
                        r.urgency === 'HIGH' ? 'border-eoc-warning text-eoc-warning' :
                        'border-eoc-muted text-eoc-muted'
                      }`}>{r.urgency}</span>
                    </div>
                    <div className="text-xs text-eoc-text mt-1">{r.description}</div>
                    <div className="text-[10px] text-eoc-muted flex items-center gap-1 mt-2">
                      <AlertTriangle size={10} /> {r.disaster_title} · {r.zone_name || r.location_label}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-eoc-border bg-eoc-panel2 px-4 py-3 shrink-0">
          <button 
            onClick={onClose}
            className="rounded px-4 py-2 text-sm font-medium hover:bg-eoc-bg transition"
          >
            Cancel
          </button>
          <button 
            onClick={handleAssign}
            disabled={!selectedId || submitting}
            className="flex items-center gap-2 rounded bg-eoc-accent px-4 py-2 text-sm font-bold text-eoc-bg hover:opacity-90 disabled:opacity-50 transition"
          >
            {submitting && <Loader2 size={16} className="animate-spin" />}
            Confirm Assignment
          </button>
        </div>
      </div>
    </div>
  );
}
