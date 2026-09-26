import React, { useState, useEffect } from 'react';
import { 
  Video, 
  Battery, 
  Wifi, 
  AlertTriangle, 
  Eye, 
  Crosshair, 
  Compass, 
  Wind, 
  ShieldAlert, 
  Radio, 
  Layers, 
  Camera,
  Maximize2
} from 'lucide-react';
import { Panel, Button, StatusBadge, PageHeader } from '../components/ui';

export default function DroneSurveillancePage() {
  const [time, setTime] = useState(new Date());
  const [thermalMode, setThermalMode] = useState(false);
  const [alt, setAlt] = useState(442);
  const [heading, setHeading] = useState(187);
  const [selectedDetection, setSelectedDetection] = useState<string | null>('target-1');

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
      setAlt((prev) => prev + (Math.random() > 0.5 ? 1 : -1));
      setHeading((prev) => (prev + (Math.random() > 0.6 ? 1 : 0)) % 360);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const detections = [
    {
      id: 'target-1',
      title: 'Structural Fire Flashover',
      confidence: '99.4%',
      severity: 'CRITICAL',
      coords: '13.0827° N, 80.2707° E',
      zone: 'Saidapet Collapse Sector',
      details: 'Active flame breach on 3rd floor commercial roof. Rapid oxygen propagation.',
      action: 'Dispatch Aerial Water Tender',
    },
    {
      id: 'target-2',
      title: 'Secondary Façade Collapse',
      confidence: '92.1%',
      severity: 'HIGH',
      coords: '13.0845° N, 80.2715° E',
      zone: 'Adyar Flood Inundation Belt',
      details: 'Unreinforced masonry debris blocking street artery. Trapped vehicle detected.',
      action: 'Deploy Heavy Rescue Unit RT-07',
    },
    {
      id: 'target-3',
      title: 'First Responder Team In-Transit',
      confidence: '98.0%',
      severity: 'NORMAL',
      coords: '13.0810° N, 80.2690° E',
      zone: 'Guindy Industrial Sector',
      details: 'RT-07 and AMB-12 entering outer perimeter cordon.',
      action: 'Maintain Escort Watch',
    },
  ];

  const activeTarget = detections.find(d => d.id === selectedDetection);

  return (
    <div className="space-y-3 font-sans h-full flex flex-col">
      <PageHeader
        title="UAV Aerial Surveillance & AI Recon"
        subtitle="High-altitude drone telemetry with real-time computer vision incident identification"
        freshness="Telemetry Uplink 100% nominal · 1080p 60fps"
        action={
          <div className="flex items-center gap-2">
            <Button
              variant={thermalMode ? "primary" : "secondary"}
              size="sm"
              onClick={() => setThermalMode(!thermalMode)}
              className={thermalMode ? "bg-amber-600 text-black font-bold" : ""}
            >
              <Eye size={13} />
              <span>{thermalMode ? "THERMAL IR (ACTIVE)" : "ENABLE FLIR THERMAL"}</span>
            </Button>
          </div>
        }
      />

      {/* Main HUD Viewport Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 flex-1 min-h-[480px]">
        {/* Cockpit HUD Video Screen */}
        <div className="lg:col-span-8 flex flex-col">
          <div className={`relative flex-1 rounded border border-cyan-500/50 overflow-hidden shadow-tactical-accent flex flex-col ${
            thermalMode ? 'bg-[#1a0033]' : 'bg-black'
          }`}>
            {/* Background Feed Imagery */}
            <div 
              className={`absolute inset-0 bg-cover bg-center transition-all duration-300 ${
                thermalMode ? 'contrast-200 hue-rotate-180 brightness-125' : 'opacity-85'
              }`}
              style={{ backgroundImage: "url('/drone_bg.jpg')" }}
            />
            
            {/* Tactical Scanlines & Vignette */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/60 pointer-events-none" />
            <div className="absolute inset-0 tactical-grid pointer-events-none opacity-40" />

            {/* Tactical HUD Overlay Elements */}
            <div className="absolute inset-0 pointer-events-none p-4 flex flex-col justify-between font-mono text-[11px] text-white">
              
              {/* Top HUD Telemetry Bar */}
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-red-600 animate-ping" />
                    <span className="text-red-400 font-bold tracking-widest uppercase">LIVE STREAM · REC</span>
                    <span className="text-cyan-400 font-mono ml-2">UAV-HAWK-04</span>
                  </div>
                  <div className="text-[10px] text-slate-300">
                    GPS: 40°42'46"N 74°00'21"W · HDOP: 0.8
                  </div>
                </div>

                <div className="text-right space-y-1 text-slate-200">
                  <div className="flex items-center justify-end gap-1.5 font-bold">
                    <Battery size={14} className="text-emerald-400" />
                    <span className="text-emerald-400">87% (46 MINS)</span>
                  </div>
                  <div className="text-[10px] text-cyan-300">
                    ALT: <span className="text-white font-bold tabular-nums">{alt}m</span> AGL · SPD: 78 km/h
                  </div>
                </div>
              </div>

              {/* Center Crosshairs & AI Detections */}
              <div className="relative flex-1 flex items-center justify-center pointer-events-auto">
                {/* Center Pitch Ladder Reticle */}
                <div className="absolute pointer-events-none flex flex-col items-center opacity-40">
                  <div className="w-20 h-px bg-cyan-400" />
                  <div className="w-12 h-px bg-cyan-400 my-4" />
                  <Crosshair size={28} className="text-cyan-400" />
                  <div className="w-12 h-px bg-cyan-400 my-4" />
                  <div className="w-20 h-px bg-cyan-400" />
                </div>

                {/* AI Detection Bounding Box 1: Structural Fire */}
                <div 
                  onClick={() => setSelectedDetection('target-1')}
                  className={`absolute top-[32%] left-[44%] w-36 h-28 border-2 border-red-500 bg-red-500/20 rounded-xs flex flex-col justify-between p-1 cursor-pointer transition-transform hover:scale-105 ${
                    selectedDetection === 'target-1' ? 'ring-2 ring-white ring-offset-1 shadow-[0_0_15px_rgba(239,68,68,0.8)]' : 'animate-pulse'
                  }`}
                >
                  <div className="bg-red-600 text-white text-[9px] font-bold px-1 py-0.5 inline-flex items-center gap-1 self-start rounded-xs">
                    <AlertTriangle size={10} />
                    <span>TARGET A · FIRE 99%</span>
                  </div>
                  <div className="text-[8px] text-red-200 self-end font-mono">
                    DELTA T: +340°C
                  </div>
                </div>

                {/* AI Detection Bounding Box 2: Collapse Debris */}
                <div 
                  onClick={() => setSelectedDetection('target-2')}
                  className={`absolute top-[60%] left-[22%] w-44 h-24 border-2 border-orange-500 bg-orange-500/15 rounded-xs flex flex-col justify-between p-1 cursor-pointer transition-transform hover:scale-105 ${
                    selectedDetection === 'target-2' ? 'ring-2 ring-white ring-offset-1 shadow-[0_0_15px_rgba(249,115,22,0.8)]' : ''
                  }`}
                >
                  <div className="bg-orange-600 text-white text-[9px] font-bold px-1 py-0.5 inline-flex items-center gap-1 self-start rounded-xs">
                    <AlertTriangle size={10} />
                    <span>TARGET B · COLLAPSE 92%</span>
                  </div>
                  <div className="text-[8px] text-orange-200 self-end font-mono">
                    OCCUPIED HAZARD
                  </div>
                </div>

                {/* AI Detection Bounding Box 3: Rescue Team */}
                <div 
                  onClick={() => setSelectedDetection('target-3')}
                  className={`absolute top-[42%] right-[24%] w-24 h-16 border-2 border-cyan-400 bg-cyan-500/10 rounded-xs flex flex-col justify-between p-1 cursor-pointer transition-transform hover:scale-105 ${
                    selectedDetection === 'target-3' ? 'ring-2 ring-white ring-offset-1 shadow-[0_0_15px_rgba(6,182,212,0.8)]' : ''
                  }`}
                >
                  <div className="bg-cyan-600 text-white text-[9px] font-bold px-1 py-0.5 self-start rounded-xs">
                    RT-07 (FRIENDLY)
                  </div>
                  <div className="text-[8px] text-cyan-200 self-end font-mono">
                    ETA: 3 MINS
                  </div>
                </div>
              </div>

              {/* Bottom HUD Telemetry Bar */}
              <div className="flex justify-between items-end border-t border-cyan-500/30 pt-2 bg-black/40 backdrop-blur-sm -mx-4 -mb-4 px-4 pb-2">
                <div className="flex items-center gap-4 text-xs">
                  <div>HEADING: <strong className="text-cyan-400 tabular-nums">{heading}° NNE</strong></div>
                  <div>GIMBAL PITCH: <strong className="text-cyan-400">-42.5°</strong></div>
                  <div>OPTICAL ZOOM: <strong className="text-amber-400">4.2x</strong></div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 text-emerald-400 text-xs">
                    <Wifi size={13} />
                    <span>UPLINK 98% (-64 dBm)</span>
                  </div>
                  <span className="text-slate-400 text-[10px]">
                    UTC {time.toISOString().slice(11, 19)}
                  </span>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Right Tactical Target Analysis Drawer */}
        <div className="lg:col-span-4 flex flex-col gap-3">
          <Panel 
            title="Target Telemetry Dossier"
            badge={
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                ACTIVE TARGET
              </span>
            }
          >
            {activeTarget ? (
              <div className="space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-eoc-text">{activeTarget.title}</h3>
                  <StatusBadge value={activeTarget.severity} />
                </div>

                <div className="rounded border border-eoc-border bg-eoc-panel2 p-2.5 space-y-1.5 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-eoc-muted">AI Neural Confidence:</span>
                    <strong className="text-cyan-400">{activeTarget.confidence}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-eoc-muted">Coordinates:</span>
                    <strong className="text-eoc-text">{activeTarget.coords}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-eoc-muted">Zone Sector:</span>
                    <strong className="text-eoc-text">{activeTarget.zone}</strong>
                  </div>
                </div>

                <div className="text-xs text-eoc-muted leading-relaxed">
                  {activeTarget.details}
                </div>

                <div className="border-t border-eoc-border pt-3">
                  <div className="text-[10px] text-eoc-subtle uppercase mb-1">Recommended Response:</div>
                  <div className="p-2 rounded border border-cyan-500/40 bg-cyan-950/40 text-cyan-300 font-semibold text-xs">
                    {activeTarget.action}
                  </div>
                </div>

                <Button 
                  variant="primary" 
                  className="w-full mt-2"
                  onClick={() => alert(`DISPATCH AUTHORIZED: Dispatched tactical responders to target ${activeTarget.id}`)}
                >
                  <Radio size={13} />
                  <span>AUTHORIZE RAPID DISPATCH</span>
                </Button>
              </div>
            ) : (
              <div className="py-12 text-center text-xs font-mono text-eoc-muted">
                SELECT A BOUNDING BOX TARGET IN VIEWPORT
              </div>
            )}
          </Panel>

          {/* Air Asset Flight Readiness Panel */}
          <Panel title="Air Fleet Readiness Status">
            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between items-center border-b border-eoc-border/60 pb-1.5">
                <span className="text-eoc-text font-bold">UAV-HAWK-04 (Airborne)</span>
                <span className="text-emerald-400 font-semibold">ON STATION</span>
              </div>
              <div className="flex justify-between items-center border-b border-eoc-border/60 pb-1.5">
                <span className="text-eoc-muted">UAV-FALCON-02</span>
                <span className="text-cyan-400">STANDBY (PAD 3)</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-eoc-muted">UAV-TITAN-01 (Cargo Lift)</span>
                <span className="text-amber-400">CHARGING (42%)</span>
              </div>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
