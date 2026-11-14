// SECTION 6: BACKEND SPECIFICATION
// Express TypeScript architecture, middleware pipeline, service layer, and verified REST API inventory

import React, { useState } from "react";
import {
  Server,
  Layers,
  Shield,
  Database,
  Search,
  Filter,
  CheckCircle2,
  Code
} from "lucide-react";
import { useSpecWorkspace } from "../context";
import { ApiEndpointDoc } from "../types";

export default function Section6BackendSpec() {
  const { state } = useSpecWorkspace();
  const backend = state.backendSpec;
  const [filterMethod, setFilterMethod] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredApis = backend.apiInventory.filter((api) => {
    const matchMethod = filterMethod === "ALL" || api.method === filterMethod;
    const matchSearch =
      !searchTerm ||
      api.route.toLowerCase().includes(searchTerm.toLowerCase()) ||
      api.purpose.toLowerCase().includes(searchTerm.toLowerCase()) ||
      api.role.toLowerCase().includes(searchTerm.toLowerCase());
    return matchMethod && matchSearch;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between border-b border-[#1F2937] pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-wider">
            <Server className="h-4 w-4" />
            <span>Specification Section 06</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white mt-1">
            Backend Architecture & Verified API Inventory
          </h1>
          <p className="text-sm text-gray-400 mt-1 max-w-3xl">
            Authoritative Node.js / Express TypeScript service architecture, middleware pipeline, Zod schema validation, and complete REST endpoint inventory.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded bg-emerald-950 border border-emerald-800 px-2.5 py-1 text-xs font-mono text-emerald-300">
            TypeScript 5.5 Express
          </span>
        </div>
      </div>

      {/* Architecture & Middleware Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Middleware Stack */}
        <div className="rounded-lg border border-[#1F2937] bg-[#111827] p-5 space-y-3">
          <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400">
            Middleware Pipeline
          </h2>
          <div className="space-y-2">
            {backend.middleware.map((m) => (
              <div key={m.name} className="rounded border border-[#1F2937] bg-[#0B0F19] p-3 text-xs">
                <div className="flex items-center justify-between font-mono">
                  <span className="font-bold text-white">{m.name}</span>
                  <span className="text-gray-500 text-[10px]">{m.file}</span>
                </div>
                <p className="text-gray-400 mt-1 text-[11px] leading-relaxed">{m.purpose}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Service Layer */}
        <div className="rounded-lg border border-[#1F2937] bg-[#111827] p-5 space-y-3">
          <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400">
            Modular Service Layer
          </h2>
          <div className="space-y-2">
            {backend.services.map((s) => (
              <div key={s.name} className="rounded border border-[#1F2937] bg-[#0B0F19] p-3 text-xs">
                <span className="font-bold text-white font-mono block mb-1">{s.name}</span>
                <p className="text-gray-400 text-[11px] mb-2">{s.purpose}</p>
                <div className="flex flex-wrap gap-1">
                  {s.methods.map((method) => (
                    <span
                      key={method}
                      className="rounded bg-cyan-950/60 border border-cyan-900 px-1.5 py-0.5 text-[10px] font-mono text-cyan-300"
                    >
                      .{method}()
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* API Inventory Table */}
      <div className="rounded-lg border border-[#1F2937] bg-[#111827] p-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400">
            REST API Endpoint Inventory ({filteredApis.length})
          </h2>

          <div className="flex flex-wrap items-center gap-2">
            {/* Method Filter */}
            <div className="flex items-center gap-1 text-xs font-mono">
              {["ALL", "GET", "POST", "PUT", "DELETE"].map((m) => (
                <button
                  key={m}
                  onClick={() => setFilterMethod(m)}
                  className={`rounded px-2 py-1 text-xs transition-colors ${
                    filterMethod === m
                      ? "bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold"
                      : "text-gray-400 hover:bg-[#1F2937]"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-gray-500" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search route or role..."
                className="rounded border border-[#1F2937] bg-[#0B0F19] pl-8 pr-3 py-1 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#1F2937] bg-[#0B0F19] text-gray-400 font-mono text-[11px] uppercase">
                <th className="py-2.5 px-3">Method & Route</th>
                <th className="py-2.5 px-3">Purpose</th>
                <th className="py-2.5 px-3">Auth & Role</th>
                <th className="py-2.5 px-3">Validation Rules</th>
                <th className="py-2.5 px-3">Database Effects</th>
                <th className="py-2.5 px-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1F2937]/60">
              {filteredApis.map((api) => {
                const methodColor =
                  api.method === "GET"
                    ? "text-blue-400 bg-blue-950 border-blue-800"
                    : api.method === "POST"
                    ? "text-emerald-400 bg-emerald-950 border-emerald-800"
                    : api.method === "PUT"
                    ? "text-amber-400 bg-amber-950 border-amber-800"
                    : "text-red-400 bg-red-950 border-red-800";

                return (
                  <tr key={`${api.method}-${api.route}`} className="hover:bg-[#1a2333] transition-colors">
                    <td className="py-2.5 px-3 font-mono align-top whitespace-nowrap">
                      <span className={`rounded border px-1.5 py-0.5 text-[10px] font-bold mr-2 ${methodColor}`}>
                        {api.method}
                      </span>
                      <span className="font-bold text-white">{api.route}</span>
                    </td>

                    <td className="py-2.5 px-3 text-gray-300 align-top max-w-xs">{api.purpose}</td>

                    <td className="py-2.5 px-3 font-mono text-[11px] align-top whitespace-nowrap">
                      <div className="text-gray-300">{api.role}</div>
                      <div className="text-[10px] text-gray-500">
                        {api.authRequired ? "Bearer JWT" : "Public Access"}
                      </div>
                    </td>

                    <td className="py-2.5 px-3 font-mono text-[11px] text-gray-400 align-top">
                      {api.validationRules}
                    </td>

                    <td className="py-2.5 px-3 font-mono text-[11px] text-gray-400 align-top">
                      {api.dbEffects}
                    </td>

                    <td className="py-2.5 px-3 text-right align-top whitespace-nowrap">
                      <span className="rounded bg-emerald-950/80 border border-emerald-800 px-2 py-0.5 text-[10px] font-mono text-emerald-300 font-semibold">
                        {api.status}
                      </span>
                    </td>
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
