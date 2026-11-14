// SECTION 10: INTEGRATIONS & APIS
// External service inventory, communication protocols, failure fallback mechanisms, and cost boundaries

import React from "react";
import {
  Plug,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Radio,
  ExternalLink,
  DollarSign
} from "lucide-react";
import { useSpecWorkspace } from "../context";

export default function Section10Integrations() {
  const { state } = useSpecWorkspace();
  const integrations = state.integrations;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between border-b border-[#1F2937] pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-wider">
            <Plug className="h-4 w-4" />
            <span>Specification Section 10</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white mt-1">
            External Integrations & Third-Party APIs
          </h1>
          <p className="text-sm text-gray-400 mt-1 max-w-3xl">
            Technical inventory of geospatial tile providers, WebSockets, notification transports, and hardware simulation boundaries.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded bg-cyan-950 border border-cyan-800 px-2.5 py-1 text-xs font-mono text-cyan-300">
            {integrations.length} Services Documented
          </span>
        </div>
      </div>

      {/* Integration Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {integrations.map((item) => {
          const statusBadge =
            item.status === "Live Integration"
              ? "bg-emerald-950 text-emerald-300 border-emerald-800"
              : item.status === "Simulated / Local"
              ? "bg-purple-950 text-purple-300 border-purple-800"
              : "bg-blue-950 text-blue-300 border-blue-800";

          return (
            <div
              key={item.id}
              className="rounded-lg border border-[#1F2937] bg-[#111827] p-5 flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-mono text-cyan-400 font-bold text-xs">{item.id}</span>
                    <h2 className="text-base font-bold text-white mt-0.5">{item.name}</h2>
                    <span className="text-xs text-gray-400 font-mono">Provider: {item.provider}</span>
                  </div>

                  <span className={`rounded border px-2 py-0.5 text-[10px] font-mono font-bold whitespace-nowrap ${statusBadge}`}>
                    {item.status}
                  </span>
                </div>

                <p className="text-xs text-gray-300 mt-3 leading-relaxed">{item.purpose}</p>

                {/* Configuration Variables */}
                {item.configVariables.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {item.configVariables.map((v) => (
                      <span
                        key={v}
                        className="rounded bg-[#0B0F19] border border-[#1F2937] px-2 py-0.5 text-[10px] font-mono text-cyan-300"
                      >
                        {v}
                      </span>
                    ))}
                  </div>
                )}

                {/* Endpoints */}
                <div className="mt-3 rounded bg-[#0B0F19] border border-[#1F2937] p-2.5 text-xs font-mono space-y-1">
                  <div className="text-gray-500 text-[10px] uppercase">Endpoints:</div>
                  {item.endpoints.map((ep, i) => (
                    <div key={i} className="text-gray-300 text-[11px] truncate">
                      {ep}
                    </div>
                  ))}
                </div>
              </div>

              {/* Failure Handling & Costs */}
              <div className="border-t border-[#1F2937] pt-3 text-xs space-y-1 font-mono">
                <div className="text-gray-400 text-[11px]">
                  <span className="text-amber-400 font-bold">FAILURE RECOVERY: </span>
                  {item.failureHandling}
                </div>
                <div className="flex items-center justify-between text-[11px] text-gray-500 pt-1">
                  <span>Timeout: {item.timeoutBehavior}</span>
                  <span className="text-emerald-400 font-bold">{item.cost}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
