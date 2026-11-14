// SECTION 15: DEVELOPMENT NOTES & DECISIONS (ADRs)
// Architectural decision records, trade-off evaluations, superseded revision chains, and module linkages

import React, { useState } from "react";
import {
  Lightbulb,
  CheckCircle2,
  Clock,
  Plus,
  Edit2,
  Layers,
  ArrowRight
} from "lucide-react";
import { useSpecWorkspace } from "../context";
import { DecisionRecord, DecisionStatus } from "../types";

export default function Section15Decisions() {
  const { state, updateSection, saveNow } = useSpecWorkspace();
  const decisions = state.decisions;
  const [editingDecision, setEditingDecision] = useState<DecisionRecord | null>(null);
  const [isNew, setIsNew] = useState(false);

  const handleCreateNew = () => {
    const nextId = `ADR-${String(decisions.length + 1).padStart(3, "0")}`;
    const newRecord: DecisionRecord = {
      id: nextId,
      title: "",
      context: "",
      problem: "",
      optionsConsidered: [],
      selectedOption: "",
      rationale: "",
      tradeOffs: "",
      affectedModules: [],
      date: new Date().toISOString().slice(0, 10),
      author: "Senior Software Architect",
      status: "Accepted"
    };
    setEditingDecision(newRecord);
    setIsNew(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDecision) return;

    let updated: DecisionRecord[];
    if (isNew) {
      updated = [editingDecision, ...decisions];
    } else {
      updated = decisions.map((d) => (d.id === editingDecision.id ? editingDecision : d));
    }

    updateSection("decisions", updated);
    saveNow();
    setEditingDecision(null);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between border-b border-[#1F2937] pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-wider">
            <Lightbulb className="h-4 w-4" />
            <span>Specification Section 15</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white mt-1">
            Development Notes & Architecture Decision Records (ADRs)
          </h1>
          <p className="text-sm text-gray-400 mt-1 max-w-3xl">
            Immutable log of architectural crossroads, technology trade-offs, rationale, and superseded technical choices.
          </p>
        </div>

        <button
          onClick={handleCreateNew}
          className="flex items-center gap-1.5 rounded bg-cyan-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-cyan-500 shadow-sm transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Record New Decision</span>
        </button>
      </div>

      {/* Decisions List */}
      <div className="space-y-4">
        {decisions.map((d) => (
          <div
            key={d.id}
            className="rounded-lg border border-[#1F2937] bg-[#111827] p-5 space-y-4 hover:border-gray-700 transition-colors"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-[#1F2937] pb-3 gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-cyan-400 text-xs">{d.id}</span>
                  <h2 className="text-base font-bold text-white">{d.title}</h2>
                </div>
                <div className="text-[11px] text-gray-500 font-mono mt-0.5">
                  Authored by {d.author} on {d.date}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`rounded px-2.5 py-0.5 text-[10px] font-mono font-bold ${
                    d.status === "Accepted"
                      ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                      : "bg-gray-800 text-gray-400"
                  }`}
                >
                  {d.status}
                </span>
                <button
                  onClick={() => {
                    setEditingDecision(d);
                    setIsNew(false);
                  }}
                  className="rounded p-1 text-gray-400 hover:text-white hover:bg-[#1F2937]"
                  title="Edit ADR"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Context & Problem */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="rounded border border-[#1F2937] bg-[#0B0F19] p-3 space-y-1">
                <span className="font-mono text-gray-400 text-[10px] uppercase font-bold">
                  Context & Background
                </span>
                <p className="text-gray-300 leading-relaxed text-[11px]">{d.context}</p>
              </div>

              <div className="rounded border border-[#1F2937] bg-[#0B0F19] p-3 space-y-1">
                <span className="font-mono text-amber-400 text-[10px] uppercase font-bold">
                  Problem Statement
                </span>
                <p className="text-gray-300 leading-relaxed text-[11px]">{d.problem}</p>
              </div>
            </div>

            {/* Selected Option & Rationale */}
            <div className="rounded border border-cyan-900/40 bg-cyan-950/10 p-4 text-xs space-y-2">
              <div className="flex items-center gap-2 font-mono">
                <span className="text-gray-400 text-[10px] uppercase font-bold">Selected Choice:</span>
                <span className="text-cyan-300 font-bold text-sm">{d.selectedOption}</span>
              </div>
              <div className="text-gray-300 text-[11px] leading-relaxed">
                <strong className="text-gray-200">Rationale: </strong>
                {d.rationale}
              </div>
              <div className="text-gray-400 text-[11px] leading-relaxed">
                <strong className="text-amber-400/90">Trade-Offs: </strong>
                {d.tradeOffs}
              </div>
            </div>

            {/* Affected Modules */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono text-gray-400 pt-1">
              <span className="text-[10px] text-gray-500 uppercase">Affected Modules:</span>
              {d.affectedModules.map((mod) => (
                <span
                  key={mod}
                  className="rounded bg-[#0B0F19] border border-[#1F2937] px-2 py-0.5 text-[10px] text-gray-300"
                >
                  {mod}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Edit ADR Modal */}
      {editingDecision && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <form
            onSubmit={handleSave}
            className="w-full max-w-2xl rounded-lg border border-[#1F2937] bg-[#111827] p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-[#1F2937] pb-3">
              <h2 className="text-sm font-semibold uppercase text-cyan-400 font-mono">
                {isNew ? "Record New Architecture Decision" : `Edit ${editingDecision.id}`}
              </h2>
              <span className="text-xs font-mono text-gray-400">{editingDecision.id}</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Decision Title</label>
              <input
                type="text"
                required
                value={editingDecision.title}
                onChange={(e) => setEditingDecision({ ...editingDecision, title: e.target.value })}
                className="w-full rounded border border-[#1F2937] bg-[#0B0F19] px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Status</label>
                <select
                  value={editingDecision.status}
                  onChange={(e) =>
                    setEditingDecision({ ...editingDecision, status: e.target.value as DecisionStatus })
                  }
                  className="w-full rounded border border-[#1F2937] bg-[#0B0F19] px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="Accepted">Accepted</option>
                  <option value="Proposed">Proposed</option>
                  <option value="Superseded">Superseded</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Author</label>
                <input
                  type="text"
                  value={editingDecision.author}
                  onChange={(e) => setEditingDecision({ ...editingDecision, author: e.target.value })}
                  className="w-full rounded border border-[#1F2937] bg-[#0B0F19] px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Context</label>
              <textarea
                rows={2}
                value={editingDecision.context}
                onChange={(e) => setEditingDecision({ ...editingDecision, context: e.target.value })}
                className="w-full rounded border border-[#1F2937] bg-[#0B0F19] px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Problem</label>
              <textarea
                rows={2}
                value={editingDecision.problem}
                onChange={(e) => setEditingDecision({ ...editingDecision, problem: e.target.value })}
                className="w-full rounded border border-[#1F2937] bg-[#0B0F19] px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Selected Option</label>
              <input
                type="text"
                required
                value={editingDecision.selectedOption}
                onChange={(e) =>
                  setEditingDecision({ ...editingDecision, selectedOption: e.target.value })
                }
                className="w-full rounded border border-[#1F2937] bg-[#0B0F19] px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Rationale</label>
              <textarea
                rows={2}
                value={editingDecision.rationale}
                onChange={(e) => setEditingDecision({ ...editingDecision, rationale: e.target.value })}
                className="w-full rounded border border-[#1F2937] bg-[#0B0F19] px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Trade-Offs</label>
              <textarea
                rows={2}
                value={editingDecision.tradeOffs}
                onChange={(e) => setEditingDecision({ ...editingDecision, tradeOffs: e.target.value })}
                className="w-full rounded border border-[#1F2937] bg-[#0B0F19] px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-[#1F2937] pt-4">
              <button
                type="button"
                onClick={() => setEditingDecision(null)}
                className="rounded border border-gray-700 bg-gray-800 px-3 py-1.5 text-xs text-gray-300 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded bg-cyan-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-cyan-500"
              >
                Save Decision Record
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
