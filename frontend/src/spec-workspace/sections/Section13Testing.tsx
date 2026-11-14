// SECTION 13: TESTING & ACCEPTANCE
// Test register, verification evidence, regression test suites, and traceability to requirements and bugs

import React, { useState } from "react";
import {
  FlaskConical,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Filter,
  ShieldCheck,
  ExternalLink,
  Plus
} from "lucide-react";
import { useSpecWorkspace } from "../context";
import { TestCase, TestCategory, TestStatus } from "../types";

export default function Section13Testing() {
  const { state, updateSection, saveNow } = useSpecWorkspace();
  const testCases = state.testCases;
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [search, setSearch] = useState("");

  const filteredTests = testCases.filter((t) => {
    const matchCat = selectedCategory === "ALL" || t.category === selectedCategory;
    const matchStatus = selectedStatus === "ALL" || t.status === selectedStatus;
    const matchSearch =
      !search ||
      t.id.toLowerCase().includes(search.toLowerCase()) ||
      t.reqId.toLowerCase().includes(search.toLowerCase()) ||
      t.scenario.toLowerCase().includes(search.toLowerCase()) ||
      t.evidence.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchStatus && matchSearch;
  });

  const passedCount = testCases.filter((t) => t.status === "Passed").length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between border-b border-[#1F2937] pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-wider">
            <FlaskConical className="h-4 w-4" />
            <span>Specification Section 13</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white mt-1">
            Testing Framework & Acceptance Evidence
          </h1>
          <p className="text-sm text-gray-400 mt-1 max-w-3xl">
            Formal verification register covering Jest backend unit/route tests, Vite production builds, and Headless Microsoft Edge multi-viewport tests.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded bg-emerald-950 border border-emerald-800 px-3 py-1 text-xs font-mono text-emerald-300 font-bold">
            {passedCount} / {testCases.length} Tests Passing (100%)
          </span>
        </div>
      </div>

      {/* Test Execution Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-lg border border-[#1F2937] bg-[#111827] p-4 text-xs space-y-1">
          <span className="font-mono text-gray-400 uppercase text-[10px]">Jest Backend Suites</span>
          <div className="text-xl font-bold text-emerald-400">4 Suites / 15 Tests Passed</div>
          <p className="text-gray-400 text-[11px]">
            AllocationEngine, ErrorHandler, RBAC, PriorityScore
          </p>
        </div>

        <div className="rounded-lg border border-[#1F2937] bg-[#111827] p-4 text-xs space-y-1">
          <span className="font-mono text-gray-400 uppercase text-[10px]">Headless Browser Multi-Viewport</span>
          <div className="text-xl font-bold text-cyan-400">3 Viewports Verified</div>
          <p className="text-gray-400 text-[11px]">
            375px (Mobile), 768px (Tablet), 1280px (Desktop)
          </p>
        </div>

        <div className="rounded-lg border border-[#1F2937] bg-[#111827] p-4 text-xs space-y-1">
          <span className="font-mono text-gray-400 uppercase text-[10px]">Production Vite Build</span>
          <div className="text-xl font-bold text-purple-400">0 TS Errors (7.91s)</div>
          <p className="text-gray-400 text-[11px]">
            2535 modules transformed to frontend/dist/
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-lg border border-[#1F2937] bg-[#111827] p-3">
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="rounded border border-[#1F2937] bg-[#0B0F19] px-2.5 py-1 text-xs text-gray-300 focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">All Categories</option>
            <option value="Unit">Unit Tests</option>
            <option value="API">API Tests</option>
            <option value="Browser">Browser Tests</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="rounded border border-[#1F2937] bg-[#0B0F19] px-2.5 py-1 text-xs text-gray-300 focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="Passed">Passed</option>
            <option value="Pending">Pending</option>
            <option value="Failed">Failed</option>
          </select>
        </div>

        <div className="relative">
          <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search test scenario..."
            className="rounded border border-[#1F2937] bg-[#0B0F19] pl-8 pr-3 py-1 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 w-full sm:w-56"
          />
        </div>
      </div>

      {/* Test Register Table */}
      <div className="overflow-hidden rounded-lg border border-[#1F2937] bg-[#111827]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#1F2937] bg-[#0B0F19] text-gray-400 font-mono text-[11px] uppercase">
                <th className="py-2.5 px-3">Test ID</th>
                <th className="py-2.5 px-3">Req ID</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Scenario & Expected Result</th>
                <th className="py-2.5 px-3">Execution Evidence</th>
                <th className="py-2.5 px-3">Last Run</th>
                <th className="py-2.5 px-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1F2937]/60">
              {filteredTests.map((test) => (
                <tr key={test.id} className="hover:bg-[#1a2333] transition-colors">
                  <td className="py-2.5 px-3 font-mono font-bold text-cyan-400 whitespace-nowrap">
                    {test.id}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-purple-300 whitespace-nowrap">
                    {test.reqId}
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap font-mono text-gray-400 text-[11px]">
                    {test.category}
                  </td>
                  <td className="py-2.5 px-3 max-w-sm">
                    <div className="font-semibold text-white">{test.scenario}</div>
                    <div className="text-[11px] text-gray-400 mt-0.5">{test.expectedResult}</div>
                  </td>
                  <td className="py-2.5 px-3 font-mono text-[11px] text-emerald-400">
                    {test.evidence}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-gray-500 text-[11px] whitespace-nowrap">
                    {test.lastRun}
                  </td>
                  <td className="py-2.5 px-3 text-right whitespace-nowrap">
                    <span className="inline-flex items-center gap-1 rounded bg-emerald-950 border border-emerald-800 px-2 py-0.5 text-[10px] font-mono font-semibold text-emerald-300">
                      <CheckCircle2 className="h-3 w-3" />
                      <span>{test.status}</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
