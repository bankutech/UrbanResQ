// SECTION 16: BUGS & LIMITATIONS
// Defect register, root cause analysis, verification evidence, and priority triage (P0-P3)

import React, { useState } from "react";
import {
  Bug,
  AlertCircle,
  CheckCircle2,
  Clock,
  Plus,
  Edit2,
  Search,
  Filter,
  ExternalLink
} from "lucide-react";
import { useSpecWorkspace } from "../context";
import { BugDefect, DefectPriority, DefectSeverity, DefectStatus } from "../types";

export default function Section16Bugs() {
  const { state, updateSection, saveNow } = useSpecWorkspace();
  const bugs = state.bugs;
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [selectedPriority, setSelectedPriority] = useState<string>("ALL");
  const [search, setSearch] = useState("");
  const [editingBug, setEditingBug] = useState<BugDefect | null>(null);
  const [isNew, setIsNew] = useState(false);

  const filteredBugs = bugs.filter((b) => {
    const matchStatus = selectedStatus === "ALL" || b.status === selectedStatus;
    const matchPriority = selectedPriority === "ALL" || b.priority === selectedPriority;
    const matchSearch =
      !search ||
      b.id.toLowerCase().includes(search.toLowerCase()) ||
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.affectedModule.toLowerCase().includes(search.toLowerCase()) ||
      b.rootCause.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchPriority && matchSearch;
  });

  const handleCreateNew = () => {
    const nextId = `BUG-${String(bugs.length + 1).padStart(3, "0")}`;
    const newBug: BugDefect = {
      id: nextId,
      title: "",
      description: "",
      severity: "Medium",
      priority: "P2",
      affectedModule: "",
      reproductionSteps: "",
      expectedResult: "",
      actualResult: "",
      evidence: "",
      rootCause: "",
      proposedFix: "",
      assignedTo: "Staff Engineer",
      status: "Open"
    };
    setEditingBug(newBug);
    setIsNew(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBug) return;

    let updated: BugDefect[];
    if (isNew) {
      updated = [editingBug, ...bugs];
    } else {
      updated = bugs.map((b) => (b.id === editingBug.id ? editingBug : b));
    }

    updateSection("bugs", updated);
    saveNow();
    setEditingBug(null);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between border-b border-[#1F2937] pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-wider">
            <Bug className="h-4 w-4" />
            <span>Specification Section 16</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white mt-1">
            Defect Tracker, Root Cause Analysis & Known Limitations
          </h1>
          <p className="text-sm text-gray-400 mt-1 max-w-3xl">
            Audit-verified defects, regression tests, prioritized triage (P0-P3), and technical debt registry.
          </p>
        </div>

        <button
          onClick={handleCreateNew}
          className="flex items-center gap-1.5 rounded bg-red-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-600 shadow-sm transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Report Defect</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-lg border border-[#1F2937] bg-[#111827] p-3">
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="rounded border border-[#1F2937] bg-[#0B0F19] px-2.5 py-1 text-xs text-gray-300 focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Fixed">Fixed</option>
            <option value="Verified">Verified</option>
          </select>

          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="rounded border border-[#1F2937] bg-[#0B0F19] px-2.5 py-1 text-xs text-gray-300 focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">All Priorities</option>
            <option value="P0">P0 (Critical Blocker)</option>
            <option value="P1">P1 (High)</option>
            <option value="P2">P2 (Medium)</option>
            <option value="P3">P3 (Low)</option>
          </select>
        </div>

        <div className="relative">
          <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search defect title or root cause..."
            className="rounded border border-[#1F2937] bg-[#0B0F19] pl-8 pr-3 py-1 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 w-full sm:w-64"
          />
        </div>
      </div>

      {/* Bugs List */}
      <div className="space-y-4">
        {filteredBugs.map((bug) => {
          const priorityBadge =
            bug.priority === "P0"
              ? "bg-red-950 text-red-300 border-red-800"
              : bug.priority === "P1"
              ? "bg-amber-950 text-amber-300 border-amber-800"
              : "bg-blue-950 text-blue-300 border-blue-800";

          return (
            <div
              key={bug.id}
              className="rounded-lg border border-[#1F2937] bg-[#111827] p-5 space-y-3 hover:border-gray-700 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-[#1F2937] pb-3 gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-cyan-400 text-xs">{bug.id}</span>
                    <h2 className="text-base font-bold text-white">{bug.title}</h2>
                  </div>
                  <div className="text-[11px] text-gray-500 font-mono mt-0.5">
                    Module: <span className="text-gray-300">{bug.affectedModule}</span> • Assigned to {bug.assignedTo}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`rounded border px-2 py-0.5 text-[10px] font-mono font-bold ${priorityBadge}`}>
                    {bug.priority}
                  </span>

                  <span
                    className={`rounded px-2.5 py-0.5 text-[10px] font-mono font-bold ${
                      bug.status === "Verified"
                        ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                        : bug.status === "Fixed"
                        ? "bg-cyan-950 text-cyan-300 border border-cyan-800"
                        : "bg-red-950 text-red-300 border border-red-800"
                    }`}
                  >
                    {bug.status}
                  </span>

                  <button
                    onClick={() => {
                      setEditingBug(bug);
                      setIsNew(false);
                    }}
                    className="rounded p-1 text-gray-400 hover:text-white hover:bg-[#1F2937]"
                    title="Edit Defect"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <p className="text-xs text-gray-300 leading-relaxed">{bug.description}</p>

              {/* Root Cause & Fix */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
                <div className="rounded border border-[#1F2937] bg-[#0B0F19] p-3 text-[11px] space-y-1">
                  <span className="text-red-400 font-bold block uppercase text-[10px]">Root Cause</span>
                  <p className="text-gray-300">{bug.rootCause}</p>
                </div>

                <div className="rounded border border-[#1F2937] bg-[#0B0F19] p-3 text-[11px] space-y-1">
                  <span className="text-emerald-400 font-bold block uppercase text-[10px]">Proposed Fix</span>
                  <p className="text-gray-300">{bug.proposedFix}</p>
                </div>
              </div>

              {/* Traceability & Evidence */}
              <div className="pt-2 border-t border-[#1F2937] flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs font-mono text-gray-400 gap-2">
                <div className="flex items-center gap-3">
                  {bug.relatedReqId && (
                    <span>
                      Req: <strong className="text-purple-300">{bug.relatedReqId}</strong>
                    </span>
                  )}
                  {bug.relatedTestId && (
                    <span>
                      Test: <strong className="text-cyan-300">{bug.relatedTestId}</strong>
                    </span>
                  )}
                </div>
                {bug.evidence && (
                  <div className="text-[11px] text-emerald-400 truncate">
                    Evidence: {bug.evidence}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Bug Modal */}
      {editingBug && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <form
            onSubmit={handleSave}
            className="w-full max-w-2xl rounded-lg border border-[#1F2937] bg-[#111827] p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-[#1F2937] pb-3">
              <h2 className="text-sm font-semibold uppercase text-cyan-400 font-mono">
                {isNew ? "Report New Defect" : `Edit ${editingBug.id}`}
              </h2>
              <span className="text-xs font-mono text-gray-400">{editingBug.id}</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Title</label>
              <input
                type="text"
                required
                value={editingBug.title}
                onChange={(e) => setEditingBug({ ...editingBug, title: e.target.value })}
                className="w-full rounded border border-[#1F2937] bg-[#0B0F19] px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Priority</label>
                <select
                  value={editingBug.priority}
                  onChange={(e) =>
                    setEditingBug({ ...editingBug, priority: e.target.value as DefectPriority })
                  }
                  className="w-full rounded border border-[#1F2937] bg-[#0B0F19] px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="P0">P0 - Critical</option>
                  <option value="P1">P1 - High</option>
                  <option value="P2">P2 - Medium</option>
                  <option value="P3">P3 - Low</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Severity</label>
                <select
                  value={editingBug.severity}
                  onChange={(e) =>
                    setEditingBug({ ...editingBug, severity: e.target.value as DefectSeverity })
                  }
                  className="w-full rounded border border-[#1F2937] bg-[#0B0F19] px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="Critical">Critical</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Status</label>
                <select
                  value={editingBug.status}
                  onChange={(e) =>
                    setEditingBug({ ...editingBug, status: e.target.value as DefectStatus })
                  }
                  className="w-full rounded border border-[#1F2937] bg-[#0B0F19] px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Fixed">Fixed</option>
                  <option value="Verified">Verified</option>
                  <option value="Won't Fix">Won't Fix</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Affected Module</label>
              <input
                type="text"
                value={editingBug.affectedModule}
                onChange={(e) => setEditingBug({ ...editingBug, affectedModule: e.target.value })}
                className="w-full rounded border border-[#1F2937] bg-[#0B0F19] px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Description</label>
              <textarea
                rows={2}
                value={editingBug.description}
                onChange={(e) => setEditingBug({ ...editingBug, description: e.target.value })}
                className="w-full rounded border border-[#1F2937] bg-[#0B0F19] px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Root Cause</label>
              <textarea
                rows={2}
                value={editingBug.rootCause}
                onChange={(e) => setEditingBug({ ...editingBug, rootCause: e.target.value })}
                className="w-full rounded border border-[#1F2937] bg-[#0B0F19] px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Proposed Fix</label>
              <textarea
                rows={2}
                value={editingBug.proposedFix}
                onChange={(e) => setEditingBug({ ...editingBug, proposedFix: e.target.value })}
                className="w-full rounded border border-[#1F2937] bg-[#0B0F19] px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-[#1F2937] pt-4">
              <button
                type="button"
                onClick={() => setEditingBug(null)}
                className="rounded border border-gray-700 bg-gray-800 px-3 py-1.5 text-xs text-gray-300 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded bg-cyan-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-cyan-500"
              >
                Save Defect
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
