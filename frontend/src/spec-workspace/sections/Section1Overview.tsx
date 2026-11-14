// SECTION 1: OVERVIEW
// High-level system architecture, operational scope, live metrics dashboard, and metadata editor

import React, { useState } from "react";
import {
  Compass,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Layers,
  Server,
  Database,
  ShieldCheck,
  Edit3,
  Save,
  RefreshCw,
  GitCommit,
  ExternalLink
} from "lucide-react";
import { useSpecWorkspace } from "../context";
import { ProjectOverview } from "../types";

export default function Section1Overview() {
  const { state, updateSection, saveNow } = useSpecWorkspace();
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<ProjectOverview>(state.overview);

  const handleSave = () => {
    updateSection("overview", formData);
    saveNow();
    setEditing(false);
  };

  // Derived Dashboard Metrics
  const totalSections = 19;
  const totalReqs = state.requirements.length;
  const verifiedReqs = state.requirements.filter((r) => r.status === "Verified").length;
  const openBugs = state.bugs.filter((b) => b.status === "Open" || b.status === "In Progress").length;
  const passedTests = state.testCases.filter((t) => t.status === "Passed").length;
  const totalTests = state.testCases.length;
  const totalDecisions = state.decisions.length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between border-b border-[#1F2937] pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-wider">
            <Compass className="h-4 w-4" />
            <span>Specification Section 01</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white mt-1">
            System Overview & Executive Dashboard
          </h1>
          <p className="text-sm text-gray-400 mt-1 max-w-3xl">
            Central architectural summary and live operational telemetry for the UrbanResQ Emergency Operations Center platform.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {!editing ? (
            <button
              onClick={() => {
                setFormData(state.overview);
                setEditing(true);
              }}
              className="flex items-center gap-2 rounded border border-[#1F2937] bg-[#111827] px-3 py-1.5 text-xs font-semibold text-gray-200 hover:border-cyan-500 hover:text-white transition-colors"
            >
              <Edit3 className="h-3.5 w-3.5 text-cyan-400" />
              <span>Edit Metadata</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setEditing(false)}
                className="rounded border border-gray-700 bg-gray-800 px-3 py-1.5 text-xs text-gray-300 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex items-center gap-1.5 rounded bg-cyan-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-cyan-500"
              >
                <Save className="h-3.5 w-3.5" />
                <span>Save Changes</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* =========================================================================
          LIVE TELEMETRY DASHBOARD METRICS
          ========================================================================= */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <div className="rounded-lg border border-[#1F2937] bg-[#111827] p-3">
          <div className="text-[11px] font-mono uppercase text-gray-400">Total Sections</div>
          <div className="mt-1 text-2xl font-bold text-cyan-400">{totalSections}</div>
          <div className="text-[10px] text-gray-500 mt-0.5">100% Interconnected</div>
        </div>

        <div className="rounded-lg border border-[#1F2937] bg-[#111827] p-3">
          <div className="text-[11px] font-mono uppercase text-gray-400">Verified Reqs</div>
          <div className="mt-1 text-2xl font-bold text-emerald-400">
            {verifiedReqs} <span className="text-xs text-gray-400 font-normal">/ {totalReqs}</span>
          </div>
          <div className="text-[10px] text-emerald-500/80 mt-0.5">Evidence Recorded</div>
        </div>

        <div className="rounded-lg border border-[#1F2937] bg-[#111827] p-3">
          <div className="text-[11px] font-mono uppercase text-gray-400">Active Defects</div>
          <div className={`mt-1 text-2xl font-bold ${openBugs > 0 ? "text-amber-400" : "text-gray-400"}`}>
            {openBugs}
          </div>
          <div className="text-[10px] text-gray-500 mt-0.5">{state.bugs.length} Tracked in Log</div>
        </div>

        <div className="rounded-lg border border-[#1F2937] bg-[#111827] p-3">
          <div className="text-[11px] font-mono uppercase text-gray-400">Automated Tests</div>
          <div className="mt-1 text-2xl font-bold text-emerald-400">
            {passedTests} <span className="text-xs text-gray-400 font-normal">/ {totalTests}</span>
          </div>
          <div className="text-[10px] text-gray-500 mt-0.5">15 Jest + 3 Viewports</div>
        </div>

        <div className="rounded-lg border border-[#1F2937] bg-[#111827] p-3">
          <div className="text-[11px] font-mono uppercase text-gray-400">Architecture ADRs</div>
          <div className="mt-1 text-2xl font-bold text-purple-400">{totalDecisions}</div>
          <div className="text-[10px] text-gray-500 mt-0.5">Recorded Decisions</div>
        </div>

        <div className="rounded-lg border border-[#1F2937] bg-[#111827] p-3">
          <div className="text-[11px] font-mono uppercase text-gray-400">Spec Status</div>
          <div className="mt-1 text-xs font-semibold uppercase text-emerald-400 flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>{state.overview.status}</span>
          </div>
          <div className="text-[10px] font-mono text-gray-500 mt-0.5">{state.overview.version}</div>
        </div>
      </div>

      {/* =========================================================================
          METADATA FORM OR READ-ONLY VIEW
          ========================================================================= */}
      {editing ? (
        <div className="rounded-lg border border-[#1F2937] bg-[#111827] p-5 space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-cyan-400">
            Edit Project Metadata
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Project Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full rounded border border-[#1F2937] bg-[#0B0F19] px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Specification Version</label>
              <input
                type="text"
                value={formData.version}
                onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                className="w-full rounded border border-[#1F2937] bg-[#0B0F19] px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Project Description</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full rounded border border-[#1F2937] bg-[#0B0F19] px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Problem Statement</label>
            <textarea
              rows={3}
              value={formData.problemStatement}
              onChange={(e) => setFormData({ ...formData, problemStatement: e.target.value })}
              className="w-full rounded border border-[#1F2937] bg-[#0B0F19] px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Frontend Architecture</label>
              <input
                type="text"
                value={formData.frontendArch}
                onChange={(e) => setFormData({ ...formData, frontendArch: e.target.value })}
                className="w-full rounded border border-[#1F2937] bg-[#0B0F19] px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Backend Architecture</label>
              <input
                type="text"
                value={formData.backendArch}
                onChange={(e) => setFormData({ ...formData, backendArch: e.target.value })}
                className="w-full rounded border border-[#1F2937] bg-[#0B0F19] px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Database Technology</label>
              <input
                type="text"
                value={formData.databaseTech}
                onChange={(e) => setFormData({ ...formData, databaseTech: e.target.value })}
                className="w-full rounded border border-[#1F2937] bg-[#0B0F19] px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Deployment Status</label>
              <input
                type="text"
                value={formData.deploymentStatus}
                onChange={(e) => setFormData({ ...formData, deploymentStatus: e.target.value })}
                className="w-full rounded border border-[#1F2937] bg-[#0B0F19] px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>
        </div>
      ) : (
        /* READ-ONLY STRUCTURED CARDS */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Core Objectives & Problem Statement */}
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-lg border border-[#1F2937] bg-[#111827] p-5">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-cyan-400 mb-2">
                Executive Problem Statement
              </h2>
              <p className="text-sm text-gray-300 leading-relaxed">
                {state.overview.problemStatement}
              </p>

              <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mt-5 mb-2">
                Primary System Objectives
              </h3>
              <ul className="space-y-2">
                {state.overview.objectives.map((obj, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-xs text-gray-300">
                    <CheckCircle2 className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
                    <span>{obj}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Architecture Matrix */}
            <div className="rounded-lg border border-[#1F2937] bg-[#111827] p-5">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-cyan-400 mb-4">
                Authoritative Tech Stack
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded border border-[#1F2937] bg-[#0B0F19] p-3">
                  <div className="flex items-center gap-2 text-xs font-semibold text-cyan-300 mb-1">
                    <Layers className="h-4 w-4 text-cyan-400" />
                    <span>Frontend Architecture</span>
                  </div>
                  <p className="text-xs text-gray-400">{state.overview.frontendArch}</p>
                </div>

                <div className="rounded border border-[#1F2937] bg-[#0B0F19] p-3">
                  <div className="flex items-center gap-2 text-xs font-semibold text-cyan-300 mb-1">
                    <Server className="h-4 w-4 text-cyan-400" />
                    <span>Backend Architecture</span>
                  </div>
                  <p className="text-xs text-gray-400">{state.overview.backendArch}</p>
                </div>

                <div className="rounded border border-[#1F2937] bg-[#0B0F19] p-3">
                  <div className="flex items-center gap-2 text-xs font-semibold text-cyan-300 mb-1">
                    <Database className="h-4 w-4 text-cyan-400" />
                    <span>Database Engine</span>
                  </div>
                  <p className="text-xs text-gray-400">{state.overview.databaseTech}</p>
                </div>

                <div className="rounded border border-[#1F2937] bg-[#0B0F19] p-3">
                  <div className="flex items-center gap-2 text-xs font-semibold text-cyan-300 mb-1">
                    <ShieldCheck className="h-4 w-4 text-cyan-400" />
                    <span>Authentication & Security</span>
                  </div>
                  <p className="text-xs text-gray-400">{state.overview.authModel}</p>
                </div>
              </div>
            </div>

            {/* Major Application Modules */}
            <div className="rounded-lg border border-[#1F2937] bg-[#111827] p-5">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-cyan-400 mb-3">
                10 Core Operational Modules
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {state.overview.majorModules.map((mod, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 rounded border border-[#1F2937] bg-[#0B0F19] px-3 py-2 text-xs text-gray-300"
                  >
                    <span className="font-mono text-cyan-400 font-bold">0{i + 1}.</span>
                    <span>{mod}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Roles, Limitations, Readiness */}
          <div className="space-y-6">
            {/* Target Personas */}
            <div className="rounded-lg border border-[#1F2937] bg-[#111827] p-5">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-cyan-400 mb-3">
                Command Users & Roles
              </h2>
              <ul className="space-y-2">
                {state.overview.targetUsers.map((u, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-gray-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
                    <span>{u}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Known Limitations (Truth in Engineering) */}
            <div className="rounded-lg border border-amber-900/40 bg-amber-950/10 p-5">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400 mb-2">
                <AlertTriangle className="h-4 w-4 text-amber-400" />
                <span>Known Limitations (Verified)</span>
              </div>
              <ul className="space-y-2">
                {state.overview.knownLimitations.map((lim, i) => (
                  <li key={i} className="text-xs text-gray-300 leading-relaxed border-l border-amber-800/60 pl-2.5">
                    {lim}
                  </li>
                ))}
              </ul>
            </div>

            {/* Deployment & Environment Status */}
            <div className="rounded-lg border border-[#1F2937] bg-[#111827] p-5">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-cyan-400 mb-2">
                Deployment Readiness
              </h2>
              <div className="rounded border border-[#1F2937] bg-[#0B0F19] p-3 text-xs font-mono text-gray-300 space-y-1">
                <div className="text-gray-400">Environment:</div>
                <div className="text-emerald-400 font-semibold">{state.overview.deploymentStatus}</div>
                <div className="text-gray-500 pt-2 text-[10px]">
                  Last Audit: {state.overview.lastUpdated}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
