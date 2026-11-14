// SECTION 3: PRODUCT SPECIFICATION
// Detailed product scope, 16 major operational capabilities, user personas, journeys, and constraints

import React, { useState } from "react";
import {
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  Layers,
  Users,
  Compass,
  ArrowRight,
  Sparkles,
  ExternalLink,
  Edit2
} from "lucide-react";
import { useSpecWorkspace } from "../context";
import { CapabilityStatus, ProductCapability } from "../types";

export default function Section3ProductSpec() {
  const { state, updateSection, saveNow } = useSpecWorkspace();
  const productSpec = state.productSpec;
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>("ALL");
  const [editingCapability, setEditingCapability] = useState<ProductCapability | null>(null);

  const filteredCapabilities = productSpec.capabilities.filter((c) => {
    if (selectedStatusFilter === "ALL") return true;
    return c.status === selectedStatusFilter;
  });

  const handleUpdateCapability = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCapability) return;

    const updatedCaps = productSpec.capabilities.map((c) =>
      c.id === editingCapability.id ? editingCapability : c
    );
    updateSection("productSpec", { ...productSpec, capabilities: updatedCaps });
    saveNow();
    setEditingCapability(null);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between border-b border-[#1F2937] pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-wider">
            <FileSpreadsheet className="h-4 w-4" />
            <span>Specification Section 03</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white mt-1">
            Product Specification & Capability Register
          </h1>
          <p className="text-sm text-gray-400 mt-1 max-w-3xl">
            Detailed operational capabilities, user journeys, functional boundaries, and verified implementation status for 16 core subsystems.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded bg-gray-800 px-2.5 py-1 text-xs font-mono text-gray-300">
            16 Subsystems Defined
          </span>
        </div>
      </div>

      {/* Vision & Goals Banner */}
      <div className="rounded-lg border border-[#1F2937] bg-[#111827] p-5 space-y-4">
        <div>
          <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400">
            Product Vision Statement
          </h2>
          <p className="mt-1 text-sm font-medium text-white italic leading-relaxed">
            "{productSpec.vision}"
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-[#1F2937]/60">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
              Product Goals & Metrics
            </h3>
            <ul className="space-y-1.5">
              {productSpec.goals.map((g, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-gray-300">
                  <CheckCircle2 className="h-3.5 w-3.5 text-cyan-400 mt-0.5 shrink-0" />
                  <span>{g}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
              Explicitly Out-of-Scope
            </h3>
            <ul className="space-y-1.5">
              {productSpec.outOfScope.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-gray-400">
                  <span className="text-red-400 font-bold font-mono">✕</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* =========================================================================
          16 MAJOR OPERATIONAL CAPABILITIES
          ========================================================================= */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-cyan-400 font-mono">
            16 Major Operational Capabilities (Live vs Simulated)
          </h2>

          <div className="flex items-center gap-1.5 text-xs font-mono">
            {["ALL", "Implemented", "Simulated", "In Progress", "Planned"].map((st) => (
              <button
                key={st}
                onClick={() => setSelectedStatusFilter(st)}
                className={`rounded px-2.5 py-1 text-xs transition-colors ${
                  selectedStatusFilter === st
                    ? "bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold"
                    : "text-gray-400 hover:bg-[#1F2937] hover:text-white"
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredCapabilities.map((cap) => (
            <div
              key={cap.id}
              className="rounded-lg border border-[#1F2937] bg-[#111827] p-4 flex flex-col justify-between hover:border-gray-700 transition-colors"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded bg-gray-800 text-[10px] font-mono font-bold text-gray-300">
                      {cap.id}
                    </span>
                    <h3 className="font-semibold text-white text-sm">{cap.name}</h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded px-2 py-0.5 text-[10px] font-mono font-semibold ${
                        cap.status === "Implemented"
                          ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                          : cap.status === "Simulated"
                          ? "bg-purple-950 text-purple-300 border border-purple-800"
                          : "bg-blue-950 text-blue-300 border border-blue-800"
                      }`}
                    >
                      {cap.status}
                    </span>
                    <button
                      onClick={() => setEditingCapability(cap)}
                      className="p-1 rounded text-gray-500 hover:text-cyan-400 hover:bg-[#1F2937]"
                      title="Edit Capability Details"
                    >
                      <Edit2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>

                <p className="mt-2 text-xs text-gray-400 leading-relaxed">{cap.description}</p>

                {/* Key Features */}
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {cap.keyFeatures.map((f, idx) => (
                    <span
                      key={idx}
                      className="rounded bg-[#0B0F19] border border-[#1F2937] px-2 py-0.5 text-[10px] text-gray-300"
                    >
                      {f}
                    </span>
                  ))}
                </div>
              </div>

              {/* Bottom Routes & Links */}
              <div className="mt-4 pt-3 border-t border-[#1F2937] flex items-center justify-between text-[11px] font-mono text-gray-400">
                <span className="text-cyan-400 truncate">Route: {cap.uiRoute}</span>
                <span className="text-gray-500 truncate">{cap.backendRoutes.length} APIs linked</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* User Personas & Real User Journeys */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
        {/* Personas */}
        <div className="rounded-lg border border-[#1F2937] bg-[#111827] p-5 space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-cyan-400 font-mono">
            <Users className="h-4 w-4" />
            <span>Target User Personas</span>
          </div>

          <div className="space-y-3">
            {productSpec.personas.map((p, i) => (
              <div key={i} className="rounded border border-[#1F2937] bg-[#0B0F19] p-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-white">{p.name}</span>
                  <span className="text-cyan-400 font-mono text-[10px] uppercase">{p.role}</span>
                </div>
                <div className="mt-1.5 text-gray-300">
                  <span className="text-gray-500 font-mono text-[10px]">NEEDS: </span>
                  {p.needs}
                </div>
                <div className="mt-1 text-gray-400">
                  <span className="text-gray-500 font-mono text-[10px]">PAIN POINTS: </span>
                  {p.painPoints}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* User Journeys */}
        <div className="rounded-lg border border-[#1F2937] bg-[#111827] p-5 space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-cyan-400 font-mono">
            <Compass className="h-4 w-4" />
            <span>Operational User Journey</span>
          </div>

          {productSpec.journeys.map((j, i) => (
            <div key={i} className="rounded border border-[#1F2937] bg-[#0B0F19] p-4 text-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white">{j.title}</span>
                <span className="text-cyan-400 font-mono text-[10px]">{j.actor}</span>
              </div>

              <div className="space-y-2 border-l border-cyan-800/60 pl-3">
                {j.steps.map((st, stepIdx) => (
                  <div key={stepIdx} className="text-gray-300 text-xs flex items-start gap-2">
                    <span className="font-mono text-cyan-400 font-bold shrink-0">{stepIdx + 1}.</span>
                    <span>{st}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Edit Capability Modal */}
      {editingCapability && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <form
            onSubmit={handleUpdateCapability}
            className="w-full max-w-lg rounded-lg border border-[#1F2937] bg-[#111827] p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-[#1F2937] pb-3">
              <h2 className="text-sm font-semibold uppercase text-cyan-400 font-mono">
                Edit Subsystem #{editingCapability.id}
              </h2>
              <span className="text-xs font-mono text-gray-400">{editingCapability.name}</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Subsystem Name</label>
              <input
                type="text"
                value={editingCapability.name}
                onChange={(e) => setEditingCapability({ ...editingCapability, name: e.target.value })}
                className="w-full rounded border border-[#1F2937] bg-[#0B0F19] px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Status</label>
              <select
                value={editingCapability.status}
                onChange={(e) =>
                  setEditingCapability({
                    ...editingCapability,
                    status: e.target.value as CapabilityStatus
                  })
                }
                className="w-full rounded border border-[#1F2937] bg-[#0B0F19] px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="Implemented">Implemented</option>
                <option value="Simulated">Simulated</option>
                <option value="In Progress">In Progress</option>
                <option value="Planned">Planned</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Description</label>
              <textarea
                rows={3}
                value={editingCapability.description}
                onChange={(e) =>
                  setEditingCapability({ ...editingCapability, description: e.target.value })
                }
                className="w-full rounded border border-[#1F2937] bg-[#0B0F19] px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">UI Route</label>
              <input
                type="text"
                value={editingCapability.uiRoute}
                onChange={(e) =>
                  setEditingCapability({ ...editingCapability, uiRoute: e.target.value })
                }
                className="w-full rounded border border-[#1F2937] bg-[#0B0F19] px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-[#1F2937] pt-4">
              <button
                type="button"
                onClick={() => setEditingCapability(null)}
                className="rounded border border-gray-700 bg-gray-800 px-3 py-1.5 text-xs text-gray-300 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded bg-cyan-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-cyan-500"
              >
                Save Subsystem
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
