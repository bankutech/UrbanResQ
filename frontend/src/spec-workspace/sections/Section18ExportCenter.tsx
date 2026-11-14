// SECTION 18: EXPORT CENTER
// Multi-format exporter: Markdown specification, structured JSON, CSV tables, and developer handoff packages

import React, { useState } from "react";
import {
  Download,
  FileText,
  FileCode,
  Table,
  CheckCircle2,
  Package,
  Layers,
  ShieldCheck
} from "lucide-react";
import { useSpecWorkspace } from "../context";
import {
  exportAsMarkdown,
  exportAsJSON,
  exportRequirementsAsCSV,
  exportBugsAsCSV,
  exportTestsAsCSV,
  exportDecisionsAsCSV,
  triggerBrowserDownload
} from "../storage";
import { SPEC_SECTIONS } from "../constants";

export default function Section18ExportCenter() {
  const { state } = useSpecWorkspace();
  const [selectedSections, setSelectedSections] = useState<string[]>(
    SPEC_SECTIONS.map((s) => s.id)
  );

  const handleToggleSection = (id: string) => {
    setSelectedSections((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    setSelectedSections(SPEC_SECTIONS.map((s) => s.id));
  };

  const handleDeselectAll = () => {
    setSelectedSections([]);
  };

  // Download Handlers
  const handleDownloadFullMarkdown = () => {
    const md = exportAsMarkdown(state, selectedSections);
    triggerBrowserDownload(
      `UrbanResQ-Specification-${state.version}.md`,
      md,
      "text/markdown"
    );
  };

  const handleDownloadJSON = () => {
    const json = exportAsJSON(state);
    triggerBrowserDownload(
      `UrbanResQ-Specification-${state.version}.json`,
      json,
      "application/json"
    );
  };

  const handleDownloadReqsCSV = () => {
    const csv = exportRequirementsAsCSV(state);
    triggerBrowserDownload("UrbanResQ-Requirements.csv", csv, "text/csv");
  };

  const handleDownloadBugsCSV = () => {
    const csv = exportBugsAsCSV(state);
    triggerBrowserDownload("UrbanResQ-Defect-Log.csv", csv, "text/csv");
  };

  const handleDownloadTestsCSV = () => {
    const csv = exportTestsAsCSV(state);
    triggerBrowserDownload("UrbanResQ-Test-Register.csv", csv, "text/csv");
  };

  const handleDownloadDecisionsCSV = () => {
    const csv = exportDecisionsAsCSV(state);
    triggerBrowserDownload("UrbanResQ-Decisions-ADR.csv", csv, "text/csv");
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between border-b border-[#1F2937] pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-wider">
            <Download className="h-4 w-4" />
            <span>Specification Section 18</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white mt-1">
            Export Center & Multi-Format Dispatcher
          </h1>
          <p className="text-sm text-gray-400 mt-1 max-w-3xl">
            Export the complete saved specification or individual data domains into GitHub-flavored Markdown, JSON backups, and tabular CSV spreadsheets.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded bg-cyan-950 border border-cyan-800 px-2.5 py-1 text-xs font-mono text-cyan-300">
            Version {state.version}
          </span>
        </div>
      </div>

      {/* Quick Action Export Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Full Markdown */}
        <div className="rounded-lg border border-[#1F2937] bg-[#111827] p-5 flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 font-mono font-bold text-xs uppercase">
              <FileText className="h-4 w-4" />
              <span>Full Markdown Spec</span>
            </div>
            <p className="text-xs text-gray-400 mt-2 leading-relaxed">
              Complete 19-section specification in GitHub Flavored Markdown with tables and diagrams.
            </p>
          </div>
          <button
            onClick={handleDownloadFullMarkdown}
            className="w-full rounded bg-cyan-600 py-1.5 text-xs font-bold text-white hover:bg-cyan-500 transition-colors flex items-center justify-center gap-1.5"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Download .MD ({selectedSections.length} Sec)</span>
          </button>
        </div>

        {/* JSON Backup */}
        <div className="rounded-lg border border-[#1F2937] bg-[#111827] p-5 flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center gap-2 text-purple-400 font-mono font-bold text-xs uppercase">
              <FileCode className="h-4 w-4" />
              <span>Raw JSON Data Backup</span>
            </div>
            <p className="text-xs text-gray-400 mt-2 leading-relaxed">
              Complete machine-readable JSON structure suitable for version control and state restore.
            </p>
          </div>
          <button
            onClick={handleDownloadJSON}
            className="w-full rounded bg-purple-600 py-1.5 text-xs font-bold text-white hover:bg-purple-500 transition-colors flex items-center justify-center gap-1.5"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Download .JSON</span>
          </button>
        </div>

        {/* CSV Requirements */}
        <div className="rounded-lg border border-[#1F2937] bg-[#111827] p-5 flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 font-mono font-bold text-xs uppercase">
              <Table className="h-4 w-4" />
              <span>Requirements CSV</span>
            </div>
            <p className="text-xs text-gray-400 mt-2 leading-relaxed">
              Spreadsheet of all requirements, verification evidence, status, and acceptance criteria.
            </p>
          </div>
          <button
            onClick={handleDownloadReqsCSV}
            className="w-full rounded border border-[#1F2937] bg-[#0B0F19] py-1.5 text-xs font-bold text-emerald-300 hover:border-emerald-500 transition-colors flex items-center justify-center gap-1.5"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Download Reqs .CSV</span>
          </button>
        </div>

        {/* CSV Defect Register */}
        <div className="rounded-lg border border-[#1F2937] bg-[#111827] p-5 flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center gap-2 text-red-400 font-mono font-bold text-xs uppercase">
              <Table className="h-4 w-4" />
              <span>Bugs & Defect CSV</span>
            </div>
            <p className="text-xs text-gray-400 mt-2 leading-relaxed">
              Tabular export of tracked defects, priority triage (P0-P3), root causes, and fixes.
            </p>
          </div>
          <button
            onClick={handleDownloadBugsCSV}
            className="w-full rounded border border-[#1F2937] bg-[#0B0F19] py-1.5 text-xs font-bold text-red-300 hover:border-red-500 transition-colors flex items-center justify-center gap-1.5"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Download Bugs .CSV</span>
          </button>
        </div>
      </div>

      {/* Granular Section Selector Matrix */}
      <div className="rounded-lg border border-[#1F2937] bg-[#111827] p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-[#1F2937] pb-3 gap-2">
          <div>
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400">
              Customize Markdown Export Scope
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Select specific sections to include in the generated specification document.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            <button
              onClick={handleSelectAll}
              className="rounded bg-gray-800 px-2.5 py-1 text-gray-300 hover:text-white"
            >
              Select All (19)
            </button>
            <button
              onClick={handleDeselectAll}
              className="rounded bg-gray-800 px-2.5 py-1 text-gray-400 hover:text-white"
            >
              Clear All
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
          {SPEC_SECTIONS.map((sec) => {
            const isChecked = selectedSections.includes(sec.id);
            return (
              <label
                key={sec.id}
                className={`flex items-center gap-2.5 rounded border p-2.5 text-xs cursor-pointer transition-colors ${
                  isChecked
                    ? "border-cyan-800 bg-cyan-950/40 text-white"
                    : "border-[#1F2937] bg-[#0B0F19] text-gray-400 hover:border-gray-700"
                }`}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => handleToggleSection(sec.id)}
                  className="rounded border-gray-700 bg-gray-800 text-cyan-500 focus:ring-0"
                />
                <span className="truncate font-mono">{sec.title}</span>
              </label>
            );
          })}
        </div>
      </div>
    </div>
  );
}
