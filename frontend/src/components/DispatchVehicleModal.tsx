import React, { useState } from 'react';
import { useFetch } from '../hooks/useFetch';
import { api, apiErrorMessage } from '../api/client';
import { X, Truck, Loader2 } from 'lucide-react';

export function DispatchVehicleModal({ 
  isOpen, 
  onClose, 
  requestId, 
  onSuccess 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  requestId: string; 
  onSuccess: () => void;
}) {
  const { data: availableVehicles, loading: fetchingVehicles } = useFetch<any[]>('/vehicles?status=AVAILABLE');
  const [selectedVehicleId, setSelectedVehicleId] = useState<number | null>(null);
  const [deploying, setDeploying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleDeploy = async () => {
    if (!selectedVehicleId) return;
    setDeploying(true);
    setError(null);
    try {
      await api.post(`/vehicles/${selectedVehicleId}/deploy`, { requestId });
      onSuccess();
      onClose();
    } catch (err) {
      setError(apiErrorMessage(err));
      setDeploying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-lg rounded-md border border-eoc-border bg-eoc-panel shadow-md overflow-hidden flex flex-col max-h-[85vh]">
        <div className="flex items-center justify-between border-b border-eoc-border bg-eoc-panel2 px-4 py-3">
          <h2 className="font-display text-lg font-bold tracking-wide flex items-center gap-2">
            <Truck size={18} className="text-eoc-accent" /> Dispatch Vehicle
          </h2>
          <button onClick={onClose} className="text-eoc-muted hover:text-eoc-text transition">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 min-h-0">
          <p className="mb-4 text-sm text-eoc-muted">Select an available vehicle to dispatch to Request #{requestId}.</p>
          
          {error && (
            <div className="mb-4 rounded bg-eoc-critical/10 border border-eoc-critical/40 p-3 text-sm text-eoc-critical">
              {error}
            </div>
          )}

          {fetchingVehicles ? (
            <div className="flex justify-center py-8"><Loader2 className="animate-spin text-eoc-muted" /></div>
          ) : availableVehicles?.length === 0 ? (
            <div className="py-8 text-center text-eoc-muted border border-dashed border-eoc-border rounded">
              No vehicles currently available.
            </div>
          ) : (
            <div className="space-y-2">
              {availableVehicles?.map(v => (
                <div 
                  key={v.vehicle_id}
                  onClick={() => setSelectedVehicleId(v.vehicle_id)}
                  className={`cursor-pointer rounded border p-3 transition ${
                    selectedVehicleId === v.vehicle_id 
                      ? 'border-eoc-accent bg-eoc-accent/10' 
                      : 'border-eoc-border hover:border-eoc-muted bg-eoc-bg'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold">{v.vehicle_code}</span>
                    <span className="text-xs px-2 py-0.5 rounded-sm bg-eoc-panel2 text-eoc-muted">{v.vehicle_type}</span>
                  </div>
                  {v.team_code && <div className="mt-1 text-xs text-eoc-muted">Team: {v.team_code}</div>}
                  {v.location_label && <div className="text-xs text-eoc-muted">Location: {v.location_label}</div>}
                </div>
              ))}
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
            onClick={handleDeploy}
            disabled={!selectedVehicleId || deploying}
            className="flex items-center gap-2 rounded bg-eoc-accent px-4 py-2 text-sm font-bold text-eoc-bg hover:opacity-90 disabled:opacity-50 transition"
          >
            {deploying && <Loader2 size={16} className="animate-spin" />}
            Deploy Vehicle
          </button>
        </div>
      </div>
    </div>
  );
}
