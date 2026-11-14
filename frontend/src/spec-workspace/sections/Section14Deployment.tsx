// SECTION 14: DEPLOYMENT INSTRUCTIONS
// Environment runbooks, production checklist, MySQL provisioning commands, and port conflict resolution

import React from "react";
import {
  Rocket,
  Terminal,
  CheckSquare,
  AlertTriangle,
  Server,
  Database,
  ExternalLink,
  ShieldCheck
} from "lucide-react";
import { useSpecWorkspace } from "../context";

export default function Section14Deployment() {
  const { state } = useSpecWorkspace();
  const deployment = state.deployment;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between border-b border-[#1F2937] pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-wider">
            <Rocket className="h-4 w-4" />
            <span>Specification Section 14</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white mt-1">
            Deployment Instructions & Production Runbooks
          </h1>
          <p className="text-sm text-gray-400 mt-1 max-w-3xl">
            Environment-specific build commands, MySQL 8.4 initialization procedures, container staging directives, and operational runbooks.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded bg-cyan-950 border border-cyan-800 px-2.5 py-1 text-xs font-mono text-cyan-300">
            Node 24 + MySQL 8.4
          </span>
        </div>
      </div>

      {/* Environments Configuration */}
      <div className="space-y-4">
        <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400">
          Target Deployment Environments
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {deployment.environments.map((env) => (
            <div key={env.name} className="rounded-lg border border-[#1F2937] bg-[#111827] p-5 space-y-3">
              <div className="flex items-center justify-between font-mono">
                <span className="font-bold text-white text-sm">{env.name}</span>
                <span className="text-[10px] text-gray-400 bg-gray-800 px-2 py-0.5 rounded">
                  {env.hostPlatform}
                </span>
              </div>
              <p className="text-xs text-gray-300">{env.purpose}</p>

              {/* Commands */}
              <div>
                <span className="text-[10px] font-mono text-gray-400 uppercase block mb-1">
                  Build & Startup Commands:
                </span>
                <pre className="rounded bg-[#0B0F19] border border-[#1F2937] p-3 text-cyan-300 font-mono text-xs overflow-x-auto space-y-1">
                  {env.commands.map((cmd, i) => (
                    <div key={i}>{cmd}</div>
                  ))}
                </pre>
              </div>

              {/* Environment Variables */}
              <div className="pt-1 text-xs">
                <span className="text-[10px] font-mono text-gray-400 uppercase block mb-1">
                  Required Environment Variables:
                </span>
                <div className="flex flex-wrap gap-1">
                  {env.envVars.map((v) => (
                    <span
                      key={v}
                      className="rounded bg-[#0B0F19] border border-[#1F2937] px-2 py-0.5 text-[10px] font-mono text-gray-300"
                    >
                      {v}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Production Deployment Checklist */}
      <div className="rounded-lg border border-[#1F2937] bg-[#111827] p-5 space-y-3">
        <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400">
          Production Security & Readiness Checklist
        </h2>

        <div className="space-y-2">
          {deployment.checklist.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between rounded border border-[#1F2937] bg-[#0B0F19] p-3 text-xs"
            >
              <div className="flex items-center gap-2.5">
                <span
                  className={`h-4 w-4 rounded flex items-center justify-center font-mono text-[10px] font-bold ${
                    item.verified
                      ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                      : "bg-amber-950 text-amber-400 border border-amber-800"
                  }`}
                >
                  {item.verified ? "✓" : "!"}
                </span>
                <span className="text-gray-200">{item.item}</span>
              </div>

              <div className="flex items-center gap-2 font-mono text-[11px]">
                <span className="text-gray-500">{item.category}</span>
                <span
                  className={`rounded px-2 py-0.5 text-[10px] font-semibold ${
                    item.verified
                      ? "text-emerald-400 bg-emerald-950/60"
                      : "text-amber-400 bg-amber-950/60"
                  }`}
                >
                  {item.verified ? "Verified" : "Pending Production"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Operational Runbooks */}
      <div className="rounded-lg border border-[#1F2937] bg-[#111827] p-5 space-y-3">
        <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400">
          Operational Troubleshooting Runbooks
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {deployment.runbooks.map((rb) => (
            <div key={rb.title} className="rounded border border-[#1F2937] bg-[#0B0F19] p-4 text-xs space-y-2">
              <span className="font-bold text-white text-sm block">{rb.title}</span>
              <p className="text-amber-400 text-[11px] font-mono">Trigger: {rb.trigger}</p>

              <ol className="space-y-1.5 pt-2 text-gray-300 text-[11px] border-t border-[#1F2937]">
                {rb.steps.map((st, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="font-mono text-cyan-400 font-bold shrink-0">{i + 1}.</span>
                    <span>{st}</span>
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
