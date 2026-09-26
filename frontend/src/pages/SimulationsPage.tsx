import React, { useState } from 'react';
import { FlaskConical, Play, AlertTriangle, ShieldAlert, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';
import { useFetch } from '../hooks/useFetch';
import { api, apiErrorMessage } from '../api/client';
import { Panel, Button, ErrorState, StatCard, PageHeader, StatusBadge } from '../components/ui';

export default function SimulationsPage() {
  const { data: disasters } = useFetch<any[]>('/disasters');
  const { data: resources } = useFetch<any[]>('/resources');

  const [disasterId, setDisasterId] = useState<string>('');
  const [resourceTypeId, setResourceTypeId] = useState<string>('');
  const [quantityDelta, setQuantityDelta] = useState<number>(-50);
  const [additionalPeople, setAdditionalPeople] = useState<number>(500);

  const [result, setResult] = useState<any | null>(null);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function runSimulation() {
    if (!disasterId) { setError('Select a target disaster incident to simulate against.'); return; }
    setRunning(true);
    setError(null);
    try {
      const res = await api.post('/simulations', {
        disasterId,
        resourceTypeId: resourceTypeId || undefined,
        quantityDelta: resourceTypeId ? quantityDelta : undefined,
        additionalPeopleAffected: additionalPeople || undefined,
      });
      setResult(res.data);
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setRunning(false);
    }
  }

  const uniqueResourceTypes = Array.from(
    new Map((resources || []).map((r: any) => [r.resource_type_id, r])).values()
  );

  return (
    <div className="space-y-4 font-sans">
      <PageHeader
        title="What-If Crisis Simulation & Stress Testing"
        subtitle="Simulate casualty surges, depot supply shortages, and cascade failures in transactional rollback mode (ACID safe)"
        freshness="Simulation Sandbox Mode · Production Safe"
      />

      <Panel 
        title="Scenario Stress Parameters"
        badge={
          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-950 text-amber-300 border border-amber-800">
            TRANSACTION ROLLBACK ASSURED
          </span>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-xs">
          <div>
            <label className="mb-1 block text-[11px] text-eoc-muted uppercase font-bold">Target Disaster Declaration</label>
            <select 
              value={disasterId} 
              onChange={(e) => setDisasterId(e.target.value)} 
              className="w-full rounded border border-eoc-border bg-eoc-panel2 px-3 py-1.5 text-xs text-eoc-text outline-none focus:border-cyan-400"
            >
              <option value="">Select a disaster incident...</option>
              {disasters?.map((d: any) => (
                <option key={d.disaster_id} value={d.disaster_id}>{d.title}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-[11px] text-eoc-muted uppercase font-bold">Additional Evacuee Surge (Headcount)</label>
            <input 
              type="number" 
              value={additionalPeople} 
              onChange={(e) => setAdditionalPeople(Number(e.target.value))} 
              className="w-full rounded border border-eoc-border bg-eoc-panel2 px-3 py-1.5 text-xs text-eoc-text outline-none focus:border-cyan-400" 
            />
          </div>

          <div>
            <label className="mb-1 block text-[11px] text-eoc-muted uppercase font-bold">Depot Supply Disruption Line</label>
            <select 
              value={resourceTypeId} 
              onChange={(e) => setResourceTypeId(e.target.value)} 
              className="w-full rounded border border-eoc-border bg-eoc-panel2 px-3 py-1.5 text-xs text-eoc-text outline-none focus:border-cyan-400"
            >
              <option value="">No disruption (baseline)</option>
              {uniqueResourceTypes.map((r: any) => (
                <option key={r.resource_type_id} value={r.resource_type_id}>{r.resource_type_name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-[11px] text-eoc-muted uppercase font-bold">Stock Delta (Negative = Supply Lost)</label>
            <input 
              type="number" 
              value={quantityDelta} 
              onChange={(e) => setQuantityDelta(Number(e.target.value))} 
              className="w-full rounded border border-eoc-border bg-eoc-panel2 px-3 py-1.5 text-xs text-eoc-text outline-none focus:border-cyan-400" 
            />
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-eoc-border/60 pt-3">
          <span className="text-[11px] font-mono text-eoc-subtle">
            Procedure: <code className="text-cyan-400">CALL sp_generate_resource_allocation_plan(?, 1, ?)</code>
          </span>
          <Button 
            variant="primary" 
            size="sm"
            onClick={runSimulation} 
            disabled={running}
            className="bg-cyan-600 hover:bg-cyan-500 shadow-tactical-accent"
          >
            <Play size={13} />
            <span>{running ? 'COMPUTING SIMULATION...' : 'EXECUTE WHAT-IF SIMULATION'}</span>
          </Button>
        </div>

        {error && <div className="mt-3"><ErrorState message={error} /></div>}
      </Panel>

      {result && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard label="Baseline Unresolved" value={result.baseline.unresolvedRequests} tone="info" />
            <StatCard label="Baseline Shortages" value={result.baseline.shortages.length} tone="warning" />
            <StatCard label="Triggered Deficits" value={result.simulated.newShortages.length} tone="critical" />
            <StatCard label="Additional Distress Calls" value={result.simulated.additionalAffectedRequests} tone="critical" />
          </div>

          <Panel title="Shortages Triggered Under This Scenario">
            {result.simulated.newShortages.length === 0 ? (
              <div className="py-4 text-center text-xs font-mono text-eoc-muted">
                THIS SCENARIO DOES NOT TRIGGER CRITICAL SHORTAGES BEYOND BASELINE
              </div>
            ) : (
              <div className="space-y-2 font-mono text-xs">
                {result.simulated.newShortages.map((s: any, i: number) => (
                  <div key={i} className="flex items-center justify-between rounded border border-red-500/40 bg-red-950/20 p-2.5">
                    <span className="font-semibold text-eoc-text">{s.name}</span>
                    <span className="text-red-400 font-bold tabular-nums">
                      {s.available_quantity} available (min threshold: {s.min_threshold})
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Panel>

          <Panel title="Actionable EOC Mitigation Recommendations">
            <div className="space-y-2 font-mono text-xs">
              {result.recommendedActions?.map((a: string, i: number) => (
                <div key={i} className="flex items-center gap-2 rounded border border-cyan-500/30 bg-cyan-950/20 p-2.5 text-cyan-200">
                  <CheckCircle2 size={14} className="text-cyan-400 shrink-0" />
                  <span>{a}</span>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      )}
    </div>
  );
}
