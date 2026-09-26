import React, { useState, useEffect } from 'react';
import { Crosshair, Video, X, Maximize2, Radio } from 'lucide-react';

export function DroneFeedPiP({ onClose }: { onClose: () => void }) {
  const [time, setTime] = useState(new Date().toISOString());

  useEffect(() => {
    const t = setInterval(() => setTime(new Date().toISOString()), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="fixed bottom-16 right-16 z-50 w-96 overflow-hidden rounded-md border border-eoc-accent bg-black shadow-md animate-scale-in cursor-move">
      {/* Header */}
      <div className="flex items-center justify-between bg-eoc-accent/20 px-3 py-2 border-b border-eoc-accent/40">
        <div className="flex items-center gap-2">
          <Video size={14} className="text-eoc-accent" />
          <span className="font-mono text-xs font-bold text-white tracking-widest">DRONE FEED // UAV-04</span>
        </div>
        <div className="flex items-center gap-2">
          <button className="text-eoc-muted hover:text-white transition-colors"><Maximize2 size={12} /></button>
          <button onClick={onClose} className="text-eoc-muted hover:text-eoc-critical transition-colors"><X size={14} /></button>
        </div>
      </div>

      {/* Video Simulation Area */}
      <div className="relative aspect-video w-full bg-slate-900 overflow-hidden group">
        {/* Synthetic "Video" Pattern */}
        <div className="absolute inset-0 opacity-40 mix-blend-screen" style={{ backgroundImage: 'radial-gradient(#1e293b 1px, transparent 1px)', backgroundSize: '4px 4px' }} />
        
        {/* Scanning effect */}
        <div className="absolute inset-x-0 top-0 h-1 bg-eoc-accent/50 blur-[2px] animate-sweep" />

        {/* HUD Elements */}
        <div className="absolute inset-0 pointer-events-none p-4 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div className="font-mono text-[10px] text-eoc-accent">
              <div>LAT: 13.0245 N</div>
              <div>LNG: 80.2212 E</div>
              <div>ALT: 400M</div>
            </div>
            <div className="flex items-center gap-1 font-mono text-[10px] text-red-500 bg-red-500/10 px-1.5 py-0.5 rounded">
              <span className="h-1.5 w-1.5 rounded-sm bg-red-500 animate-pulse" />
              REC
            </div>
          </div>

          {/* Crosshair */}
          <div className="absolute inset-0 flex items-center justify-center opacity-30">
            <Crosshair size={120} className="text-eoc-accent" strokeWidth={1} />
          </div>

          <div className="flex justify-between items-end">
            <div className="font-mono text-[10px] text-white/70">
              {time}
            </div>
            <div className="flex flex-col items-end gap-1">
              <div className="flex items-center gap-1 font-mono text-[10px] text-eoc-accent">
                <Radio size={10} className="animate-pulse" /> SIGNAL: STRONG
              </div>
              <div className="font-mono text-[10px] text-white/50">THERMAL: OFF</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
