import React, { useState, useEffect } from 'react';
import { Bot, X, CheckCircle, BrainCircuit, Sparkles, Send, ShieldCheck } from 'lucide-react';
import { useSocket } from '../hooks/useSocket';
import { useNavigate } from 'react-router-dom';

export function AIDispatchAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ id: string; text: string; time: string; typing: boolean }[]>([]);
  const navigate = useNavigate();

  useSocket('NEW_EMERGENCY_REQUEST', (data: any) => {
    if (!isOpen) setIsOpen(true);
    const id = Math.random().toString(36).substring(2, 9);
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    
    setMessages(prev => [...prev, { 
      id, 
      text: `PRIORITY INTAKE: Request #${data.request_id || 'CALL-09'} detected in ${data.zone_name || 'Central Ward'}.\nUrgency: ${data.urgency || 'HIGH'}.\nRecommendation: Pre-stage ${data.category || 'Medical'} assets from nearest available depot.`, 
      time, 
      typing: true 
    }]);

    setTimeout(() => {
      setMessages(prev => prev.map(m => m.id === id ? { ...m, typing: false } : m));
    }, 1800);
  });

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-10 right-5 z-40 flex h-10 w-10 items-center justify-center rounded border border-cyan-500/50 bg-cyan-950/90 text-cyan-400 shadow-tactical-accent hover:bg-cyan-900 transition-colors"
        title="Open AI Dispatch Assistant"
        aria-label="Open AI Dispatch Assistant"
      >
        <BrainCircuit size={18} className="animate-pulse" />
      </button>
    );
  }

  return (
    <div 
      className="fixed bottom-10 right-5 z-40 w-84 max-w-[90vw] overflow-hidden rounded border border-cyan-500/50 bg-eoc-panel shadow-tactical-accent flex flex-col font-mono text-xs"
      role="region"
      aria-label="AI Dispatch Assistant"
    >
      <div className="flex items-center justify-between border-b border-eoc-border bg-eoc-panel2 px-3 py-2">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded border border-cyan-500/40 bg-cyan-950 text-cyan-400">
            <BrainCircuit size={13} />
          </div>
          <div>
            <h3 className="font-display text-xs font-bold text-eoc-text flex items-center gap-1.5">
              <span>AI Dispatch Engine</span>
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
            </h3>
            <p className="text-[9px] text-cyan-400/80">INFERENCE MODEL v4.1 ACTIVE</p>
          </div>
        </div>
        <button 
          onClick={() => setIsOpen(false)} 
          className="rounded p-1 text-eoc-muted hover:bg-eoc-panel hover:text-eoc-text transition-colors"
          aria-label="Close assistant"
        >
          <X size={14} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3 max-h-[360px] min-h-[180px]">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center p-4">
            <Sparkles size={24} className="mb-2 text-cyan-400/60" />
            <p className="text-[11px] text-eoc-muted">Monitoring telemetry channels for incoming emergency requests...</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className="space-y-1">
              <div className="flex items-center gap-1.5 text-[9px] text-eoc-muted">
                <span className="text-cyan-400">{msg.time}</span>
                <span>·</span>
                <span>NEURAL TRIAGE ADVICE</span>
              </div>
              <div className="rounded border border-eoc-border bg-eoc-panel2 p-2.5 text-[11px] text-eoc-text shadow-sm relative overflow-hidden">
                <div className="flex items-start gap-2">
                  {!msg.typing && <ShieldCheck size={13} className="mt-0.5 shrink-0 text-cyan-400" />}
                  <p className="whitespace-pre-wrap leading-relaxed">
                    {msg.text}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="border-t border-eoc-border bg-eoc-panel2 p-2.5">
        <button 
          onClick={() => {
            navigate('/allocations');
            setIsOpen(false);
          }}
          className="w-full rounded border border-cyan-500/50 bg-cyan-950/80 py-1.5 text-[11px] font-bold text-cyan-300 hover:bg-cyan-900 transition-colors flex items-center justify-center gap-1.5 shadow-tactical-accent"
        >
          <Send size={12} />
          <span>Launch FIFO Allocation Engine</span>
        </button>
      </div>
    </div>
  );
}
