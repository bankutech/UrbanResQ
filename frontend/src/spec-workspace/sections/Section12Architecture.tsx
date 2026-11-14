// SECTION 12: ARCHITECTURE & FILE STRUCTURE
// Dual-app analysis (Root CommonJS vs Backend TypeScript), repository file classification, and migration guidance

import React, { useState } from "react";
import {
  FolderTree,
  FileCode,
  AlertTriangle,
  CheckCircle2,
  GitBranch,
  Layers,
  Search
} from "lucide-react";
import { useSpecWorkspace } from "../context";

export default function Section12Architecture() {
  const { state } = useSpecWorkspace();
  const arch = state.architecture;
  const [fileFilter, setFileFilter] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredFiles = arch.fileMap.filter((f) => {
    const matchType = fileFilter === "ALL" || f.type === fileFilter;
    const matchSearch =
      !searchTerm ||
      f.path.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.module.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchType && matchSearch;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between border-b border-[#1F2937] pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-wider">
            <FolderTree className="h-4 w-4" />
            <span>Specification Section 12</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white mt-1">
            Repository Architecture & File System Map
          </h1>
          <p className="text-sm text-gray-400 mt-1 max-w-3xl">
            In-depth evaluation of the dual application structure (Root CommonJS vs Backend TypeScript), file classifications, and target architecture recommendations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded bg-purple-950 border border-purple-800 px-2.5 py-1 text-xs font-mono text-purple-300">
            Authoritative: backend/ & frontend/
          </span>
        </div>
      </div>

      {/* Dual Application Analysis Cards */}
      <div className="rounded-lg border border-[#1F2937] bg-[#111827] p-5 space-y-4">
        <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400">
          Dual Application Structure Investigation (Audit Findings)
        </h2>

        <div className="space-y-3">
          {arch.rootVsBackendAnalysis.map((item, idx) => (
            <div key={idx} className="rounded border border-[#1F2937] bg-[#0B0F19] p-4 text-xs space-y-2">
              <div className="font-bold text-white text-sm">{item.question}</div>
              <div className="text-gray-300 leading-relaxed text-[11px]">
                <strong className="text-cyan-400 font-mono">FINDING: </strong>
                {item.finding}
              </div>
              <div className="text-emerald-400 leading-relaxed text-[11px] font-mono">
                <strong>RECOMMENDATION: </strong>
                {item.recommendation}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recommended Target Architecture Banner */}
      <div className="rounded-lg border border-emerald-800/40 bg-emerald-950/10 p-5 space-y-2">
        <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400">
          Target System Architecture
        </h2>
        <p className="text-xs text-gray-300 leading-relaxed">
          {arch.recommendedArchitecture}
        </p>
      </div>

      {/* File Classification Matrix */}
      <div className="rounded-lg border border-[#1F2937] bg-[#111827] p-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400">
            Repository File Classification ({filteredFiles.length} files)
          </h2>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={fileFilter}
              onChange={(e) => setFileFilter(e.target.value)}
              className="rounded border border-[#1F2937] bg-[#0B0F19] px-2.5 py-1 text-xs text-gray-300 focus:outline-none focus:border-cyan-500"
            >
              <option value="ALL">All File Types</option>
              <option value="Active source">Active Source</option>
              <option value="Configuration">Configuration</option>
              <option value="Tests">Tests</option>
              <option value="Legacy or potentially redundant">Legacy / Redundant</option>
            </select>

            <div className="relative">
              <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-gray-500" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search file path..."
                className="rounded border border-[#1F2937] bg-[#0B0F19] pl-8 pr-3 py-1 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 w-full sm:w-48"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#1F2937] bg-[#0B0F19] text-gray-400 font-mono text-[11px] uppercase">
                <th className="py-2.5 px-3">File Path</th>
                <th className="py-2.5 px-3">Classification</th>
                <th className="py-2.5 px-3">Module</th>
                <th className="py-2.5 px-3">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1F2937]/60">
              {filteredFiles.map((file) => {
                const typeBadge =
                  file.type === "Active source"
                    ? "bg-emerald-950 text-emerald-300 border-emerald-800"
                    : file.type === "Legacy or potentially redundant"
                    ? "bg-amber-950 text-amber-300 border-amber-800"
                    : "bg-blue-950 text-blue-300 border-blue-800";

                return (
                  <tr key={file.path} className="hover:bg-[#1a2333] transition-colors">
                    <td className="py-2.5 px-3 font-mono font-bold text-cyan-400 whitespace-nowrap">
                      {file.path}
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span className={`rounded border px-2 py-0.5 text-[10px] font-mono ${typeBadge}`}>
                        {file.type}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-gray-300 text-[11px] whitespace-nowrap">
                      {file.module}
                    </td>
                    <td className="py-2.5 px-3 text-gray-400 text-[11px]">{file.description}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
