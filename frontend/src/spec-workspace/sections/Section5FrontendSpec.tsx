// SECTION 5: FRONTEND SPECIFICATION
// React 18 / Vite architecture, routing tree, technology inventory, and page feature matrix

import React, { useState } from "react";
import {
  Layout,
  Layers,
  Code2,
  CheckCircle2,
  ExternalLink,
  ShieldAlert,
  Search
} from "lucide-react";
import { useSpecWorkspace } from "../context";

export default function Section5FrontendSpec() {
  const { state } = useSpecWorkspace();
  const frontend = state.frontendSpec;
  const [searchTerm, setSearchTerm] = useState("");

  const filteredFeatures = frontend.featureMatrix.filter(
    (f) =>
      !searchTerm ||
      f.page.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.route.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.purpose.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between border-b border-[#1F2937] pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-wider">
            <Layout className="h-4 w-4" />
            <span>Specification Section 05</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white mt-1">
            Frontend Architecture & Feature Matrix
          </h1>
          <p className="text-sm text-gray-400 mt-1 max-w-3xl">
            Detailed breakdown of React 18.3, Vite 5.4, TypeScript, Tailwind CSS, WebGL Three.js, Leaflet mapping layers, and client-side route guards.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded bg-cyan-950 border border-cyan-800 px-2.5 py-1 text-xs font-mono text-cyan-300">
            React 18.3 + TypeScript 5.5
          </span>
        </div>
      </div>

      {/* Technology Inventory */}
      <div className="rounded-lg border border-[#1F2937] bg-[#111827] p-5 space-y-3">
        <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400">
          Installed Frontend Technologies
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {frontend.technologies.map((tech) => (
            <div
              key={tech.name}
              className="rounded border border-[#1F2937] bg-[#0B0F19] p-3 text-xs"
            >
              <div className="flex items-center justify-between font-mono">
                <span className="font-bold text-white">{tech.name}</span>
                <span className="text-cyan-400 text-[10px] bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-900">
                  {tech.version}
                </span>
              </div>
              <p className="text-gray-400 mt-1.5 text-[11px] leading-relaxed">{tech.role}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Architecture Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-lg border border-[#1F2937] bg-[#111827] p-5 space-y-2 text-xs">
          <h3 className="text-xs font-mono font-bold uppercase text-cyan-400">
            Routing & Lazy Loading Architecture
          </h3>
          <p className="text-gray-300 leading-relaxed">
            {frontend.routingArchitecture}
          </p>
          <div className="pt-2 text-[11px] font-mono text-gray-400">
            Entry Points: {frontend.entryPoints.join(", ")}
          </div>
        </div>

        <div className="rounded-lg border border-[#1F2937] bg-[#111827] p-5 space-y-2 text-xs">
          <h3 className="text-xs font-mono font-bold uppercase text-cyan-400">
            API Client & Token Interception
          </h3>
          <p className="text-gray-300 leading-relaxed">
            {frontend.apiClient}
          </p>
          <div className="pt-2 text-[11px] font-mono text-gray-400">
            State: {frontend.stateManagement}
          </div>
        </div>
      </div>

      {/* Feature Matrix Table */}
      <div className="rounded-lg border border-[#1F2937] bg-[#111827] overflow-hidden space-y-3 p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400">
            Frontend Page Feature Matrix
          </h2>

          <div className="relative">
            <Search className="absolute left-3 top-2 h-3.5 w-3.5 text-gray-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filter routes and pages..."
              className="rounded border border-[#1F2937] bg-[#0B0F19] pl-8 pr-3 py-1 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#1F2937] bg-[#0B0F19] text-gray-400 font-mono text-[11px] uppercase">
                <th className="py-2.5 px-3">Route</th>
                <th className="py-2.5 px-3">Page Component</th>
                <th className="py-2.5 px-3">Purpose</th>
                <th className="py-2.5 px-3">Role Guard</th>
                <th className="py-2.5 px-3">API Endpoints</th>
                <th className="py-2.5 px-3">Mobile Behavior</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1F2937]/60">
              {filteredFeatures.map((f) => (
                <tr key={f.route} className="hover:bg-[#1a2333] transition-colors">
                  <td className="py-2.5 px-3 font-mono font-bold text-cyan-400 whitespace-nowrap">
                    {f.route}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-white whitespace-nowrap">{f.page}</td>
                  <td className="py-2.5 px-3 text-gray-300">{f.purpose}</td>
                  <td className="py-2.5 px-3 font-mono text-[11px] text-gray-400 whitespace-nowrap">
                    {f.role}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-[11px] text-gray-400">{f.apiEndpoints}</td>
                  <td className="py-2.5 px-3 text-gray-400 text-[11px]">{f.mobileBehavior}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
