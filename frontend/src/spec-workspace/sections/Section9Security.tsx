// SECTION 9: SECURITY REQUIREMENTS
// Threat register, vulnerability tracking, OWASP mitigation evidence, and audit verification

import React, { useState } from "react";
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Lock,
  Search,
  CheckCircle2,
  ExternalLink
} from "lucide-react";
import { useSpecWorkspace } from "../context";
import { SecurityRequirement, SecuritySeverity } from "../types";

export default function Section9Security() {
  const { state } = useSpecWorkspace();
  const securityReqs = state.securityReqs;
  const [selectedSeverity, setSelectedSeverity] = useState<string>("ALL");
  const [search, setSearch] = useState("");

  const filtered = securityReqs.filter((s) => {
    const matchSev = selectedSeverity === "ALL" || s.severity === selectedSeverity;
    const matchSearch =
      !search ||
      s.id.toLowerCase().includes(search.toLowerCase()) ||
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.category.toLowerCase().includes(search.toLowerCase()) ||
      s.affectedComponent.toLowerCase().includes(search.toLowerCase());
    return matchSev && matchSearch;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between border-b border-[#1F2937] pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-wider">
            <ShieldAlert className="h-4 w-4" />
            <span>Specification Section 09</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white mt-1">
            Cybersecurity Requirements & Threat Register
          </h1>
          <p className="text-sm text-gray-400 mt-1 max-w-3xl">
            Vulnerability mitigations covering SQL injection, XSS, JWT secret hygiene, rate limiting, CORS policies, and defensive perimeter checks.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded bg-emerald-950 border border-emerald-800 px-2.5 py-1 text-xs font-mono text-emerald-300">
            {securityReqs.filter((s) => s.status === "Verified").length} / {securityReqs.length} Mitigations Verified
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-lg border border-[#1F2937] bg-[#111827] p-3">
        <div className="flex items-center gap-1.5 text-xs font-mono">
          {["ALL", "Critical", "High", "Medium", "Low"].map((sev) => (
            <button
              key={sev}
              onClick={() => setSelectedSeverity(sev)}
              className={`rounded px-2.5 py-1 text-xs transition-colors ${
                selectedSeverity === sev
                  ? "bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold"
                  : "text-gray-400 hover:bg-[#1F2937]"
              }`}
            >
              {sev}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search security finding..."
            className="rounded border border-[#1F2937] bg-[#0B0F19] pl-8 pr-3 py-1 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 w-full sm:w-64"
          />
        </div>
      </div>

      {/* Security Register Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((sec) => {
          const sevColor =
            sec.severity === "Critical"
              ? "bg-red-950 text-red-300 border-red-800"
              : sec.severity === "High"
              ? "bg-amber-950 text-amber-300 border-amber-800"
              : "bg-blue-950 text-blue-300 border-blue-800";

          return (
            <div
              key={sec.id}
              className="rounded-lg border border-[#1F2937] bg-[#111827] p-4 flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-cyan-400 text-xs">{sec.id}</span>
                    <h3 className="font-semibold text-white text-sm">{sec.title}</h3>
                  </div>

                  <span className={`rounded border px-2 py-0.5 text-[10px] font-mono font-bold ${sevColor}`}>
                    {sec.severity}
                  </span>
                </div>

                <div className="text-[11px] font-mono text-gray-400 mt-1">
                  Category: <span className="text-gray-300">{sec.category}</span>
                </div>

                <div className="mt-2.5 rounded bg-[#0B0F19] border border-[#1F2937] p-2.5 text-xs space-y-1.5 font-mono">
                  <div className="text-gray-400 text-[11px]">
                    <span className="text-cyan-400 font-bold">COMPONENT: </span>
                    {sec.affectedComponent}
                  </div>
                  <div className="text-gray-300 text-[11px] leading-relaxed">
                    <span className="text-emerald-400 font-bold">REMEDIATION: </span>
                    {sec.remediation}
                  </div>
                  <div className="text-gray-400 text-[11px]">
                    <span className="text-gray-500 font-bold">EVIDENCE: </span>
                    {sec.evidence}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[#1F2937] text-xs font-mono">
                <span className="text-gray-500 text-[11px]">{sec.verificationMethod}</span>
                <span className="inline-flex items-center gap-1 text-emerald-400 font-bold text-[11px]">
                  <CheckCircle2 className="h-3 w-3" />
                  <span>{sec.status}</span>
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
