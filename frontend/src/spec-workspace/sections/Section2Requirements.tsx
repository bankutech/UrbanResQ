// SECTION 2: REQUIREMENTS CHECKLIST
// Full CRUD, status transitions, evidence enforcement for 'Verified', and traceability links

import React, { useState, useMemo } from "react";
import {
  CheckSquare,
  Plus,
  Filter,
  Search,
  CheckCircle2,
  AlertCircle,
  Copy,
  Trash2,
  Edit2,
  ExternalLink,
  ShieldCheck,
  ChevronDown
} from "lucide-react";
import { useSpecWorkspace } from "../context";
import {
  Requirement,
  RequirementCategory,
  RequirementPriority,
  RequirementStatus
} from "../types";

const ALL_CATEGORIES: RequirementCategory[] = [
  "Functional",
  "Non-functional",
  "UI/UX",
  "Security",
  "Performance",
  "Database",
  "Integration",
  "Accessibility",
  "Testing",
  "Deployment",
  "Disaster-recovery"
];

const ALL_STATUSES: RequirementStatus[] = [
  "Not Started",
  "In Progress",
  "Implemented",
  "Verified",
  "Blocked",
  "Rejected",
  "Deferred"
];

const ALL_PRIORITIES: RequirementPriority[] = ["Critical", "High", "Medium", "Low"];

export default function Section2Requirements() {
  const { state, updateSection, saveNow } = useSpecWorkspace();
  const requirements = state.requirements;

  // Filter States
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [selectedPriority, setSelectedPriority] = useState<string>("ALL");

  // Modal / Editor States
  const [editingReq, setEditingReq] = useState<Requirement | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [verificationModalReq, setVerificationModalReq] = useState<Requirement | null>(null);
  const [evidenceInput, setEvidenceInput] = useState("");

  // Filtered List
  const filtered = useMemo(() => {
    return requirements.filter((r) => {
      const matchSearch =
        !search ||
        r.id.toLowerCase().includes(search.toLowerCase()) ||
        r.title.toLowerCase().includes(search.toLowerCase()) ||
        r.description.toLowerCase().includes(search.toLowerCase()) ||
        r.acceptanceCriteria.toLowerCase().includes(search.toLowerCase());

      const matchCat = selectedCategory === "ALL" || r.category === selectedCategory;
      const matchStatus = selectedStatus === "ALL" || r.status === selectedStatus;
      const matchPriority = selectedPriority === "ALL" || r.priority === selectedPriority;

      return matchSearch && matchCat && matchStatus && matchPriority;
    });
  }, [requirements, search, selectedCategory, selectedStatus, selectedPriority]);

  // Handlers
  const handleCreateNew = () => {
    const nextNum = requirements.length + 1;
    const newReq: Requirement = {
      id: `REQ-${String(nextNum).padStart(3, "0")}`,
      title: "",
      description: "",
      category: "Functional",
      priority: "High",
      source: "Project Requirements",
      acceptanceCriteria: "",
      dependencies: [],
      assignedRole: "EMERGENCY_MANAGER",
      status: "Not Started",
      verificationMethod: "Automated Test / Manual Inspection",
      verificationEvidence: "",
      relatedTestIds: [],
      relatedBugIds: [],
      createdAt: new Date().toISOString().slice(0, 10),
      updatedAt: new Date().toISOString().slice(0, 10)
    };
    setEditingReq(newReq);
    setIsNew(true);
  };

  const handleDuplicate = (req: Requirement) => {
    const nextNum = requirements.length + 1;
    const duplicated: Requirement = {
      ...req,
      id: `REQ-${String(nextNum).padStart(3, "0")}`,
      title: `${req.title} (Copy)`,
      status: "Not Started",
      verificationEvidence: "",
      createdAt: new Date().toISOString().slice(0, 10),
      updatedAt: new Date().toISOString().slice(0, 10)
    };
    const updated = [duplicated, ...requirements];
    updateSection("requirements", updated);
    saveNow();
  };

  const handleDelete = (id: string) => {
    if (window.confirm(`Are you sure you want to delete requirement ${id}?`)) {
      const updated = requirements.filter((r) => r.id !== id);
      updateSection("requirements", updated);
      saveNow();
    }
  };

  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReq) return;

    if (!editingReq.title.trim() || !editingReq.acceptanceCriteria.trim()) {
      alert("Please provide requirement title and acceptance criteria.");
      return;
    }

    let updated: Requirement[];
    if (isNew) {
      updated = [editingReq, ...requirements];
    } else {
      updated = requirements.map((r) => (r.id === editingReq.id ? editingReq : r));
    }

    updateSection("requirements", updated);
    saveNow();
    setEditingReq(null);
  };

  const handleOpenVerifyModal = (req: Requirement) => {
    setVerificationModalReq(req);
    setEvidenceInput(req.verificationEvidence || "");
  };

  const handleConfirmVerification = () => {
    if (!verificationModalReq) return;
    if (!evidenceInput.trim()) {
      alert("Verification evidence is strictly mandatory before marking a requirement as Verified.");
      return;
    }

    const updated = requirements.map((r) => {
      if (r.id === verificationModalReq.id) {
        return {
          ...r,
          status: "Verified" as RequirementStatus,
          verificationEvidence: evidenceInput.trim(),
          updatedAt: new Date().toISOString().slice(0, 10)
        };
      }
      return r;
    });

    updateSection("requirements", updated);
    saveNow();
    setVerificationModalReq(null);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between border-b border-[#1F2937] pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-wider">
            <CheckSquare className="h-4 w-4" />
            <span>Specification Section 02</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white mt-1">
            Requirements Checklist & Traceability Matrix
          </h1>
          <p className="text-sm text-gray-400 mt-1 max-w-3xl">
            Centralized registry for functional, security, performance, and accessibility requirements with strict verification evidence tracking.
          </p>
        </div>

        <button
          onClick={handleCreateNew}
          className="flex items-center gap-1.5 rounded bg-cyan-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-cyan-500 shadow-sm transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Add Requirement</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5 rounded-lg border border-[#1F2937] bg-[#111827] p-3">
        {/* Search */}
        <div className="relative lg:col-span-2">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by ID, keyword, or criteria..."
            className="w-full rounded border border-[#1F2937] bg-[#0B0F19] pl-9 pr-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Category Filter */}
        <div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full rounded border border-[#1F2937] bg-[#0B0F19] px-2.5 py-1.5 text-xs text-gray-300 focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">All Categories ({requirements.length})</option>
            {ALL_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat} ({requirements.filter((r) => r.category === cat).length})
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full rounded border border-[#1F2937] bg-[#0B0F19] px-2.5 py-1.5 text-xs text-gray-300 focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">All Statuses</option>
            {ALL_STATUSES.map((st) => (
              <option key={st} value={st}>
                {st} ({requirements.filter((r) => r.status === st).length})
              </option>
            ))}
          </select>
        </div>

        {/* Priority Filter */}
        <div>
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="w-full rounded border border-[#1F2937] bg-[#0B0F19] px-2.5 py-1.5 text-xs text-gray-300 focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">All Priorities</option>
            {ALL_PRIORITIES.map((pr) => (
              <option key={pr} value={pr}>
                {pr}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Requirements Table */}
      <div className="overflow-hidden rounded-lg border border-[#1F2937] bg-[#111827]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#1F2937] bg-[#0B0F19] text-gray-400 font-mono text-[11px] uppercase">
                <th className="py-3 px-4">ID</th>
                <th className="py-3 px-4">Title & Description</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Priority</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Assigned Role</th>
                <th className="py-3 px-4">Traceability</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1F2937]/60">
              {filtered.length > 0 ? (
                filtered.map((r) => {
                  return (
                    <tr key={r.id} className="hover:bg-[#1a2333] transition-colors group">
                      <td className="py-3 px-4 font-mono font-bold text-cyan-400 align-top">
                        {r.id}
                      </td>

                      <td className="py-3 px-4 max-w-sm align-top">
                        <div className="font-semibold text-white">{r.title}</div>
                        <p className="text-gray-400 mt-1 line-clamp-2 leading-relaxed text-[11px]">
                          {r.description}
                        </p>
                        {r.verificationEvidence && (
                          <div className="mt-1.5 flex items-start gap-1 text-[11px] text-emerald-400 font-mono">
                            <CheckCircle2 className="h-3 w-3 shrink-0 mt-0.5" />
                            <span className="line-clamp-1">{r.verificationEvidence}</span>
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-3 align-top whitespace-nowrap">
                        <span className="rounded bg-gray-800 px-2 py-0.5 text-[10px] text-gray-300 font-mono">
                          {r.category}
                        </span>
                      </td>

                      <td className="py-3 px-3 align-top whitespace-nowrap">
                        <span
                          className={`rounded px-2 py-0.5 text-[10px] font-mono font-semibold ${
                            r.priority === "Critical"
                              ? "bg-red-950 text-red-300 border border-red-800"
                              : r.priority === "High"
                              ? "bg-amber-950 text-amber-300 border border-amber-800"
                              : "bg-gray-800 text-gray-300"
                          }`}
                        >
                          {r.priority}
                        </span>
                      </td>

                      <td className="py-3 px-3 align-top whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-semibold ${
                            r.status === "Verified"
                              ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                              : r.status === "Implemented"
                              ? "bg-cyan-950 text-cyan-300 border border-cyan-800"
                              : r.status === "In Progress"
                              ? "bg-blue-950 text-blue-300 border border-blue-800"
                              : "bg-gray-800 text-gray-400"
                          }`}
                        >
                          {r.status === "Verified" && <CheckCircle2 className="h-3 w-3" />}
                          <span>{r.status}</span>
                        </span>
                      </td>

                      <td className="py-3 px-3 align-top whitespace-nowrap text-gray-400 font-mono text-[11px]">
                        {r.assignedRole}
                      </td>

                      {/* Traceability Badges (Tests / Bugs) */}
                      <td className="py-3 px-4 align-top whitespace-nowrap space-y-1">
                        {r.relatedTestIds.length > 0 && (
                          <div className="flex items-center gap-1">
                            <span className="text-[10px] text-gray-500 font-mono">Tests:</span>
                            {r.relatedTestIds.map((tid) => (
                              <span
                                key={tid}
                                className="rounded bg-purple-950 border border-purple-800 px-1.5 py-0.2 text-[10px] font-mono text-purple-300"
                              >
                                {tid}
                              </span>
                            ))}
                          </div>
                        )}
                        {r.relatedBugIds.length > 0 && (
                          <div className="flex items-center gap-1">
                            <span className="text-[10px] text-gray-500 font-mono">Bugs:</span>
                            {r.relatedBugIds.map((bid) => (
                              <span
                                key={bid}
                                className="rounded bg-red-950 border border-red-800 px-1.5 py-0.2 text-[10px] font-mono text-red-300"
                              >
                                {bid}
                              </span>
                            ))}
                          </div>
                        )}
                        {r.relatedTestIds.length === 0 && r.relatedBugIds.length === 0 && (
                          <span className="text-gray-600 text-[11px]">—</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right align-top whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          {r.status !== "Verified" && (
                            <button
                              onClick={() => handleOpenVerifyModal(r)}
                              className="rounded p-1 text-gray-400 hover:text-emerald-400 hover:bg-emerald-950"
                              title="Record Evidence & Verify Requirement"
                            >
                              <CheckCircle2 className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setEditingReq(r);
                              setIsNew(false);
                            }}
                            className="rounded p-1 text-gray-400 hover:text-white hover:bg-[#1F2937]"
                            title="Edit Requirement"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDuplicate(r)}
                            className="rounded p-1 text-gray-400 hover:text-cyan-400 hover:bg-[#1F2937]"
                            title="Duplicate Requirement"
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(r.id)}
                            className="rounded p-1 text-gray-400 hover:text-red-400 hover:bg-[#1F2937]"
                            title="Delete Requirement"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-gray-500">
                    No requirements match the selected filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* =========================================================================
          REQUIREMENT EDIT / CREATE MODAL
          ========================================================================= */}
      {editingReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <form
            onSubmit={handleSaveModal}
            className="w-full max-w-2xl rounded-lg border border-[#1F2937] bg-[#111827] p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-[#1F2937] pb-3">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-cyan-400 font-mono">
                {isNew ? "Create Requirement" : `Edit ${editingReq.id}`}
              </h2>
              <span className="text-xs font-mono text-gray-400">{editingReq.id}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-gray-300 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={editingReq.title}
                  onChange={(e) => setEditingReq({ ...editingReq, title: e.target.value })}
                  className="w-full rounded border border-[#1F2937] bg-[#0B0F19] px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Category</label>
                <select
                  value={editingReq.category}
                  onChange={(e) => setEditingReq({ ...editingReq, category: e.target.value as any })}
                  className="w-full rounded border border-[#1F2937] bg-[#0B0F19] px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                >
                  {ALL_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Priority</label>
                <select
                  value={editingReq.priority}
                  onChange={(e) => setEditingReq({ ...editingReq, priority: e.target.value as any })}
                  className="w-full rounded border border-[#1F2937] bg-[#0B0F19] px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                >
                  {ALL_PRIORITIES.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Status</label>
                <select
                  value={editingReq.status}
                  onChange={(e) => setEditingReq({ ...editingReq, status: e.target.value as any })}
                  className="w-full rounded border border-[#1F2937] bg-[#0B0F19] px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                >
                  {ALL_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Assigned Role</label>
                <input
                  type="text"
                  value={editingReq.assignedRole}
                  onChange={(e) => setEditingReq({ ...editingReq, assignedRole: e.target.value })}
                  className="w-full rounded border border-[#1F2937] bg-[#0B0F19] px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-gray-300 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={editingReq.description}
                  onChange={(e) => setEditingReq({ ...editingReq, description: e.target.value })}
                  className="w-full rounded border border-[#1F2937] bg-[#0B0F19] px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-gray-300 mb-1">Acceptance Criteria</label>
                <textarea
                  rows={3}
                  required
                  value={editingReq.acceptanceCriteria}
                  onChange={(e) => setEditingReq({ ...editingReq, acceptanceCriteria: e.target.value })}
                  className="w-full rounded border border-[#1F2937] bg-[#0B0F19] px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-gray-300 mb-1">Verification Method</label>
                <input
                  type="text"
                  value={editingReq.verificationMethod}
                  onChange={(e) => setEditingReq({ ...editingReq, verificationMethod: e.target.value })}
                  className="w-full rounded border border-[#1F2937] bg-[#0B0F19] px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-[#1F2937] pt-4">
              <button
                type="button"
                onClick={() => setEditingReq(null)}
                className="rounded border border-gray-700 bg-gray-800 px-3 py-1.5 text-xs text-gray-300 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded bg-cyan-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-cyan-500"
              >
                Save Requirement
              </button>
            </div>
          </form>
        </div>
      )}

      {/* =========================================================================
          VERIFICATION EVIDENCE MODAL (Mandatory for 'Verified' status)
          ========================================================================= */}
      {verificationModalReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-lg border border-emerald-800 bg-[#111827] p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
              <ShieldCheck className="h-5 w-5" />
              <span>Record Verification Evidence</span>
            </div>

            <p className="text-xs text-gray-300">
              Per engineering standards, a requirement cannot be marked <strong>Verified</strong> without demonstrable execution evidence (e.g. test logs, file locations, test IDs).
            </p>

            <div className="rounded border border-[#1F2937] bg-[#0B0F19] p-3 text-xs font-mono text-cyan-300">
              {verificationModalReq.id}: {verificationModalReq.title}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">
                Verification Evidence & Test Output <span className="text-red-400">*</span>
              </label>
              <textarea
                rows={4}
                value={evidenceInput}
                onChange={(e) => setEvidenceInput(e.target.value)}
                placeholder="e.g. Verified by PASS tests/allocationEngine.test.ts (15 tests passing, zero race conditions)"
                className="w-full rounded border border-[#1F2937] bg-[#0B0F19] px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setVerificationModalReq(null)}
                className="rounded border border-gray-700 bg-gray-800 px-3 py-1.5 text-xs text-gray-300 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmVerification}
                className="rounded bg-emerald-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500"
              >
                Confirm Verification
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
