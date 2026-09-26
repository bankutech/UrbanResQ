import React from 'react';
import { Activity, AlertOctagon, AlertTriangle, ShieldCheck, Zap } from 'lucide-react';
import { useNotifications } from '../contexts/NotificationContext';
import { useSocketStatus } from '../hooks/useSocket';

export function LiveTicker() {
  const { alerts } = useNotifications();
  const { status, latencyMs } = useSocketStatus();

  // Mix live server alerts with telemetry status
  const items = React.useMemo(() => {
    if (alerts && alerts.length > 0) {
      return alerts.slice(0, 10).map((a) => ({
        id: a.alert_id,
        severity: a.severity.toLowerCase(),
        text: `[${a.alert_type}] ${a.message} (${new Date(a.created_at).toLocaleTimeString()})`,
      }));
    }

    return [
      { id: '1', severity: 'critical', text: 'MONITORING: Incident priority score algorithms active across all city sectors.' },
      { id: '2', severity: 'info', text: `TELEMETRY: Socket.IO cluster synchronized · Latency: ${latencyMs}ms · Heartbeat nominal.` },
      { id: '3', severity: 'action', text: 'LOGISTICS: Automated FIFO batch expiry dispatch active on all pending requests.' },
      { id: '4', severity: 'warning', text: 'WEATHER ADVISORY: Monitoring peripheral flood zones for surge thresholds.' },
    ];
  }, [alerts, latencyMs]);

  return (
    <div 
      className="fixed bottom-0 left-0 right-0 z-40 flex h-7 w-full items-center border-t border-eoc-border bg-eoc-panel2 font-mono text-[10px] uppercase tracking-wider text-eoc-muted overflow-hidden select-none"
      role="region"
      aria-label="Real-time incident ticker"
      aria-live="polite"
    >
      <div className="flex h-full items-center bg-eoc-panel3 px-3 font-bold text-eoc-text border-r border-eoc-border z-10 shrink-0">
        <Activity size={12} className="mr-1.5 text-cyan-400 animate-pulse" />
        <span className="tracking-widest">EOC TAPE</span>
        <span className={`ml-2 h-1.5 w-1.5 rounded-full ${status === 'CONNECTED' ? 'bg-emerald-400' : 'bg-amber-400 animate-ping'}`} />
      </div>
      
      <div className="flex flex-1 overflow-hidden whitespace-nowrap relative">
        <div className="animate-marquee inline-block">
          {items.map((item) => (
            <span key={item.id} className="inline-flex items-center mx-6">
              {item.severity === 'critical' ? (
                <AlertOctagon size={11} className="mr-1.5 text-red-400" />
              ) : item.severity === 'warning' ? (
                <AlertTriangle size={11} className="mr-1.5 text-amber-400" />
              ) : item.severity === 'action' ? (
                <Zap size={11} className="mr-1.5 text-cyan-400" />
              ) : (
                <ShieldCheck size={11} className="mr-1.5 text-emerald-400" />
              )}
              <span className={
                item.severity === 'critical' ? 'text-red-400 font-semibold' :
                item.severity === 'warning' ? 'text-amber-300 font-medium' :
                item.severity === 'action' ? 'text-cyan-300 font-medium' : 'text-slate-300'
              }>
                {item.text}
              </span>
              <span className="mx-6 text-eoc-border2 opacity-40">///</span>
            </span>
          ))}
          {/* Loop repeat */}
          {items.map((item) => (
            <span key={`${item.id}-dup`} className="inline-flex items-center mx-6">
              {item.severity === 'critical' ? (
                <AlertOctagon size={11} className="mr-1.5 text-red-400" />
              ) : item.severity === 'warning' ? (
                <AlertTriangle size={11} className="mr-1.5 text-amber-400" />
              ) : item.severity === 'action' ? (
                <Zap size={11} className="mr-1.5 text-cyan-400" />
              ) : (
                <ShieldCheck size={11} className="mr-1.5 text-emerald-400" />
              )}
              <span className={
                item.severity === 'critical' ? 'text-red-400 font-semibold' :
                item.severity === 'warning' ? 'text-amber-300 font-medium' :
                item.severity === 'action' ? 'text-cyan-300 font-medium' : 'text-slate-300'
              }>
                {item.text}
              </span>
              <span className="mx-6 text-eoc-border2 opacity-40">///</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
