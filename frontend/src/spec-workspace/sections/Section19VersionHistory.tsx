// SECTION 19: VERSION HISTORY
// Revision snapshots, restoration without history loss, audit trail, and change reason log

import React, { useState } from "react";
import {
  History,
  RotateCcw,
  Plus,
  CheckCircle2,
  GitCommit,
  Clock,
  User,
  ShieldCheck,
  AlertCircle
} from "lucide-react";
import { useSpecWorkspace } from "../context";
import { VersionEntry } from "../types";

export default function Section19VersionHistory() {
  const { state, createRevision, restoreRevision } = useSpecWorkspace();
  const history = state.versionHistory;

  // New Revision Form State
  const [showModal, setShowModal] = useState(false);
  const [versionNumber, setVersionNumber] = useState(`v1.${history.length}.0`);
  const [author, setAuthor] = useState("Staff Systems Architect");
  const [changeSummary, setChangeSummary] = useState("");
  const [reason, setReason] = useState("");

  const handleCreateNewRevision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!versionNumber.trim() || !changeSummary.trim()) {
      alert("Please provide version number and change summary.");
      return;
    }

    await createRevision(
      versionNumber.trim(),
      author.trim(),
      changeSummary.trim(),
      ["All Sections"],
      reason.trim() || "Milestone specification snapshot."
    );

    setShowModal(false);
    setChangeSummary("");
    setReason("");
  };

  const handleRestore = async (versionId: string) => {
    try {
      await restoreRevision(versionId);
      alert("Specification successfully reverted. A new restoration revision has been recorded.");
    } catch (err: any) {
      alert(err.message || "Failed to restore version.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between border-b border-[#1F2937] pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-wider">
            <History className="h-4 w-4" />
            <span>Specification Section 19</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white mt-1">
            Specification Version History & Change Log
          </h1>
          <p className="text-sm text-gray-400 mt-1 max-w-3xl">
            Audit-grade revision ledger recording full snapshots, rationale for modifications, and non-destructive version rollback.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 rounded bg-cyan-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-cyan-500 shadow-sm transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Snapshot New Revision</span>
        </button>
      </div>

      {/* Version History Timeline Cards */}
      <div className="space-y-4">
        {history.map((ver, idx) => {
          const isLatest = idx === 0;

          return (
            <div
              key={ver.versionId}
              className={`rounded-lg border p-5 transition-colors ${
                isLatest
                  ? "border-cyan-800 bg-cyan-950/20"
                  : "border-[#1F2937] bg-[#111827] hover:border-gray-700"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-[#1F2937] pb-3 gap-2">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded bg-gray-800 text-xs font-mono font-bold text-cyan-400 border border-gray-700">
                    <GitCommit className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-base font-mono">
                        {ver.versionNumber}
                      </span>
                      {isLatest && (
                        <span className="rounded bg-emerald-950 border border-emerald-800 px-2 py-0.2 text-[10px] font-mono text-emerald-300 font-bold">
                          ACTIVE REVISION
                        </span>
                      )}
                      <span className="text-xs font-mono text-gray-500">{ver.versionId}</span>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-gray-400 font-mono mt-0.5">
                      <span>{new Date(ver.timestamp).toLocaleString()}</span>
                      <span>•</span>
                      <span>Author: {ver.author}</span>
                    </div>
                  </div>
                </div>

                {!isLatest && ver.dataSnapshot && (
                  <button
                    onClick={() => handleRestore(ver.versionId)}
                    className="flex items-center gap-1.5 rounded border border-[#1F2937] bg-[#0B0F19] px-3 py-1.5 text-xs font-mono text-gray-300 hover:border-cyan-500 hover:text-cyan-300 transition-colors"
                    title="Revert to this snapshot while preserving history"
                  >
                    <RotateCcw className="h-3.5 w-3.5 text-cyan-400" />
                    <span>Restore Revision</span>
                  </button>
                )}
              </div>

              {/* Summary & Reason */}
              <div className="mt-3 space-y-2 text-xs">
                <div className="text-gray-200 leading-relaxed">
                  <strong className="text-cyan-400 font-mono uppercase text-[10px] block mb-0.5">
                    Summary of Changes
                  </strong>
                  {ver.changeSummary}
                </div>

                {ver.reason && (
                  <div className="text-gray-400 leading-relaxed pt-1">
                    <strong className="text-gray-500 font-mono uppercase text-[10px] block mb-0.5">
                      Reason for Modification
                    </strong>
                    {ver.reason}
                  </div>
                )}

                {/* Modified Sections Badges */}
                <div className="flex flex-wrap items-center gap-1 pt-2">
                  <span className="text-[10px] font-mono text-gray-500 mr-1">Scope:</span>
                  {ver.modifiedSections.map((sec, i) => (
                    <span
                      key={i}
                      className="rounded bg-[#0B0F19] border border-[#1F2937] px-2 py-0.5 text-[10px] font-mono text-gray-400"
                    >
                      {sec}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Snapshot Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <form
            onSubmit={handleCreateNewRevision}
            className="w-full max-w-lg rounded-lg border border-[#1F2937] bg-[#111827] p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-[#1F2937] pb-3">
              <h2 className="text-sm font-semibold uppercase text-cyan-400 font-mono">
                Create Specification Revision Snapshot
              </h2>
              <span className="text-xs font-mono text-gray-400">{versionNumber}</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Version Number</label>
                <input
                  type="text"
                  required
                  value={versionNumber}
                  onChange={(e) => setVersionNumber(e.target.value)}
                  className="w-full rounded border border-[#1F2937] bg-[#0B0F19] px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Author</label>
                <input
                  type="text"
                  required
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  className="w-full rounded border border-[#1F2937] bg-[#0B0F19] px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Change Summary</label>
              <textarea
                rows={3}
                required
                value={changeSummary}
                onChange={(e) => setChangeSummary(e.target.value)}
                placeholder="Describe changes across requirements, schemas, and architecture..."
                className="w-full rounded border border-[#1F2937] bg-[#0B0F19] px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Reason for Revision</label>
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. Audit milestone sign-off; release cutover"
                className="w-full rounded border border-[#1F2937] bg-[#0B0F19] px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-[#1F2937] pt-4">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="rounded border border-gray-700 bg-gray-800 px-3 py-1.5 text-xs text-gray-300 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded bg-cyan-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-cyan-500"
              >
                Snapshot Version
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
