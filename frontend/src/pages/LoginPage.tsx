import React, { useState, useEffect, memo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  ArrowRight,
  Radio,
  Users,
  Building2,
  Package,
  Activity,
  Compass,
  AlertTriangle,
  Flame,
  Shield,
  Layers,
  Loader2,
} from "lucide-react";
import { useAuth, DEMO_ACCOUNTS } from "../hooks/useAuth";
import { apiErrorMessage } from "../api/client";
import { Disaster3DCanvas } from "../components/Disaster3DCanvas";

const LiveClock = memo(function LiveClock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex items-center gap-2 font-mono text-[11px]">
      <div className="flex items-center gap-1.5 px-2 py-0.5 border border-slate-700/60 bg-slate-900/70 text-slate-300">
        <span className="h-1.5 w-1.5 bg-emerald-400 animate-pulse" />
        <span className="font-semibold text-white tracking-wide">
          {time.toLocaleTimeString("en-IN", { hour12: false })}
        </span>
        <span className="text-[9px] text-slate-400">IST</span>
      </div>
    </div>
  );
});

const ROLE_METADATA: Record<
  string,
  {
    title: string;
    subtitle: string;
    icon: React.ComponentType<{ size?: number | string; className?: string }>;
  }
> = {
  ADMIN: {
    title: "System Admin",
    subtitle: "Security & audit",
    icon: Shield,
  },
  EMERGENCY_MANAGER: {
    title: "EOC Manager",
    subtitle: "Crisis command",
    icon: Flame,
  },
  RESOURCE_MANAGER: {
    title: "Logistics Chief",
    subtitle: "FIFO stock & depots",
    icon: Package,
  },
  MEDICAL_COORDINATOR: {
    title: "Medical Lead",
    subtitle: "Hospitals & ICU",
    icon: Activity,
  },
  RESCUE_COORDINATOR: {
    title: "Rescue Lead",
    subtitle: "Field crews",
    icon: Users,
  },
  DISASTER_OFFICER: {
    title: "Disaster Officer",
    subtitle: "Damage reports",
    icon: Compass,
  },
  VIEWER: {
    title: "Civic Observer",
    subtitle: "Telemetry & charts",
    icon: Building2,
  },
};

export default function LoginPage() {
  const { login, user } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("admin@urbanresq.city");
  const [password, setPassword] = useState("UrbanResQ@2026");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>("ADMIN");

  useEffect(() => {
    if (user) navigate("/");
  }, [user, navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!email.trim()) {
      setError("Please provide an authorized operator email.");
      return;
    }
    if (!password) {
      setError("Please enter your password.");
      return;
    }
    setLoading(true);
    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  function handleSelectRole(roleKey: string, roleEmail: string) {
    setSelectedRole(roleKey);
    setEmail(roleEmail);
    setPassword("UrbanResQ@2026");
    setError(null);
  }

  return (
    <div className="relative h-screen h-[100dvh] max-h-screen w-full bg-[#080C14] text-slate-100 overflow-hidden flex flex-col justify-between font-sans select-none selection:bg-cyan-500/30 selection:text-cyan-200">
      <Disaster3DCanvas />

      <div className="fixed inset-0 bg-gradient-to-b from-[#080C14]/70 via-transparent to-[#080C14]/85 pointer-events-none z-10" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-[#080C14]/20 to-[#080C14]/80 pointer-events-none z-10" />

      <header className="relative z-20 w-full flex items-center justify-between px-3 sm:px-6 py-2 border-b border-slate-800/60 bg-[#090D16]/80 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center border border-cyan-500/40 bg-cyan-950/70 text-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.25)]">
            <Radio size={15} className="animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display text-base font-bold tracking-tight text-white">
                UrbanResQ
              </span>
              <span className="text-[9px] font-mono font-semibold px-1.5 py-0.5 border border-cyan-800/80 bg-cyan-950/80 text-cyan-300">
                3D EOC v2.5
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 border border-amber-500/30 bg-amber-950/30 text-amber-300 text-[10px] font-mono">
            <AlertTriangle size={11} className="text-amber-400" />
            <span>DEFCON 2 · FLOOD SURGE</span>
          </div>

          <div className="hidden md:flex items-center gap-1.5 px-2 py-0.5 border border-slate-800 bg-slate-900/60 text-slate-400 text-[10px] font-mono">
            <Compass size={11} className="text-cyan-400" />
            <span>CHENNAI REGION</span>
          </div>

          <LiveClock />
        </div>
      </header>

      <main className="relative z-20 flex-1 min-h-0 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-10 py-2 sm:py-3 overflow-hidden">
        <div className="hidden lg:flex flex-1 max-w-lg xl:max-w-xl flex-col justify-center space-y-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-mono font-bold tracking-wider uppercase border border-cyan-500/40 bg-cyan-950/60 text-cyan-300">
              <Radio size={11} className="text-cyan-400 animate-pulse" />
              DISASTER RESILIENCE ENGINE
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono text-amber-400 border border-amber-500/30 bg-amber-950/40">
              <Flame size={11} className="text-amber-400" />
              DEFCON 2
            </span>
          </div>

          <div>
            <h1 className="font-display text-2xl xl:text-3xl font-black tracking-tight text-white leading-[1.15]">
              CRISIS COMMAND &amp; <br />
              <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500 bg-clip-text text-transparent">
                TACTICAL TELEMETRY
              </span>
            </h1>
            <p className="mt-2 text-xs text-slate-300/90 leading-relaxed font-sans max-w-lg">
              Enterprise multi-agency operations console orchestrating automated FIFO medical inventory allocation, acute hospital surge triage, and field rescue telemetry across disaster zones.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-0.5">
            <div className="border border-slate-800 bg-[#0C121E]/80 backdrop-blur-md p-2 flex flex-col">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wide">Incidents</span>
              <span className="text-base font-mono font-bold text-red-400 tabular-nums">08 Active</span>
              <span className="text-[9px] font-mono text-slate-400">Flood Surge</span>
            </div>

            <div className="border border-slate-800 bg-[#0C121E]/80 backdrop-blur-md p-2 flex flex-col">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wide">Depots</span>
              <span className="text-base font-mono font-bold text-cyan-400 tabular-nums">14 Hubs</span>
              <span className="text-[9px] font-mono text-slate-400">FIFO Stock Ready</span>
            </div>

            <div className="border border-slate-800 bg-[#0C121E]/80 backdrop-blur-md p-2 flex flex-col">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wide">Responders</span>
              <span className="text-base font-mono font-bold text-emerald-400 tabular-nums">142 Units</span>
              <span className="text-[9px] font-mono text-slate-400">GPS Monitored</span>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1 text-[10px] font-mono text-slate-400">
            <div className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 bg-cyan-500" />
            </div>
            <span>3D Relief Medkit &amp; Topography · Interactive Mouse Gyroscope</span>
          </div>
        </div>

        <div className="w-full max-w-[380px] xl:max-w-[395px] shrink-0">
          <div className="border border-slate-750/90 bg-[#0C121E]/95 backdrop-blur-2xl shadow-[0_20px_50px_-10px_rgba(0,0,0,0.9)] relative overflow-hidden">
            <div className="h-1 w-full bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500" />

            <div className="p-3 sm:p-3.5">
              <div className="mb-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 text-[9px] font-mono font-bold uppercase tracking-wider bg-cyan-950/80 text-cyan-300 border border-cyan-800/70">
                    <Shield size={10} className="text-cyan-400" />
                    RESTRICTED CONSOLE
                  </span>
                  <span className="text-[9px] font-mono text-emerald-400 flex items-center gap-1">
                    <span className="h-1.5 w-1.5 bg-emerald-400 animate-pulse" />
                    PORT 4000 SECURE
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-base sm:text-lg font-bold text-white tracking-tight">
                    Sign in to Operations
                  </h2>
                  <span className="text-[10px] font-mono text-cyan-400/90">
                    UrbanResQ@2026
                  </span>
                </div>
              </div>

              {error && (
                <div
                  className="mb-2 border border-red-500/40 bg-red-950/60 p-2 text-[11px] text-red-200 flex items-start gap-2"
                  role="alert"
                >
                  <AlertTriangle size={14} className="text-red-400 shrink-0 mt-0.5" />
                  <div className="flex-1 font-mono leading-tight">
                    <span className="font-bold">Error:</span> {error}
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-2">
                <div>
                  <div className="relative">
                    <Mail
                      size={14}
                      className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                    />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="operator@urbanresq.city"
                      required
                      autoComplete="username"
                      className="w-full border border-slate-700/80 bg-[#141C2B] pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-slate-500 outline-none transition-all focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/20"
                    />
                  </div>
                </div>

                <div>
                  <div className="relative">
                    <Lock
                      size={14}
                      className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                    />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter password"
                      required
                      autoComplete="current-password"
                      className="w-full border border-slate-700/80 bg-[#141C2B] pl-8 pr-8 py-1.5 text-xs text-white placeholder:text-slate-500 outline-none transition-all focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/20 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-1 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 active:scale-[0.99] py-1.5 sm:py-2 px-3 text-xs font-semibold text-white shadow-md shadow-cyan-600/20 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 tracking-wide uppercase"
                >
                  {loading ? (
                    <>
                      <Loader2 size={14} className="animate-spin text-white" />
                      <span>Authenticating…</span>
                    </>
                  ) : (
                    <>
                      <span>Enter Command Center</span>
                      <ArrowRight size={14} />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-2 pt-2 border-t border-slate-800/80">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wide">
                    Authorized Presets
                  </span>
                  <span className="text-[9px] font-mono text-cyan-400 font-semibold">
                    1-Click Select
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-1 max-h-[100px] overflow-y-auto pr-0.5">
                  {Object.entries(DEMO_ACCOUNTS).map(([roleKey, acc]) => {
                    const isSelected = selectedRole === roleKey || email === acc.email;
                    const meta = ROLE_METADATA[roleKey] || {
                      title: acc.label,
                      subtitle: roleKey,
                      icon: Users,
                    };
                    const Icon = meta.icon;

                    return (
                      <button
                        key={roleKey}
                        type="button"
                        onClick={() => handleSelectRole(roleKey, acc.email)}
                        className={`text-left p-1.5 border transition-all flex flex-col justify-between ${
                          isSelected
                            ? "border-cyan-500/70 bg-cyan-950/50 text-cyan-100 shadow-[0_0_10px_rgba(6,182,212,0.15)] ring-1 ring-cyan-500/30"
                            : "border-slate-800/90 bg-[#101726]/80 text-slate-300 hover:border-slate-700 hover:bg-[#141C2B]"
                        }`}
                      >
                        <div className="flex items-center gap-1 min-w-0">
                          <Icon
                            size={11}
                            className={`shrink-0 ${
                              isSelected ? "text-cyan-400" : "text-slate-400"
                            }`}
                          />
                          <span className="text-[11px] font-semibold truncate leading-tight">
                            {meta.title}
                          </span>
                        </div>
                        <div className="text-[9px] font-mono text-slate-400 truncate mt-0.5">
                          {roleKey}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-1.5 pt-1 border-t border-slate-800/50 flex items-center justify-between text-[9px] text-slate-400 font-mono">
                <span>Pass: UrbanResQ@2026</span>
                <span>Audited Session</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="relative z-20 w-full flex items-center justify-between px-3 sm:px-6 py-1.5 text-[10px] font-mono text-slate-400 border-t border-slate-800/60 bg-[#090D16]/80 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-2">
          <Layers size={11} className="text-cyan-400" />
          <span className="hidden sm:inline">Tactical 3D Engine:</span>
          <span className="text-slate-300">Three.js WebGL · Relief Medkit &amp; Topography</span>
        </div>

        <div className="flex items-center gap-3 text-[9px]">
          <span className="hidden md:inline text-slate-400">
            60 FPS · Hardware Accelerated
          </span>
          <span className="text-cyan-400 font-semibold">URBANRESQ EOC NODE 01</span>
        </div>
      </footer>
    </div>
  );
}
