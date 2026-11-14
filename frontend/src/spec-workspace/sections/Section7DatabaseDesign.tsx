// SECTION 7: DATABASE DESIGN
// MySQL 8.4 DDL, 45 tables, stored procedures with row-locking FIFO mechanics, views, and ERD

import React, { useState } from "react";
import {
  Database,
  Lock,
  GitBranch,
  Table,
  CheckCircle2,
  Code2,
  Layers,
  Search,
  ExternalLink
} from "lucide-react";
import { useSpecWorkspace } from "../context";

export default function Section7DatabaseDesign() {
  const { state } = useSpecWorkspace();
  const db = state.databaseSpec;
  const [selectedTable, setSelectedTable] = useState<string>(db.tables[0]?.name || "disasters");
  const [searchTable, setSearchTable] = useState("");

  const activeTableDoc = db.tables.find((t) => t.name === selectedTable) || db.tables[0];

  const filteredTables = db.tables.filter((t) =>
    t.name.toLowerCase().includes(searchTable.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between border-b border-[#1F2937] pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-wider">
            <Database className="h-4 w-4" />
            <span>Specification Section 07</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white mt-1">
            Database Design & ACID Allocation Mechanics
          </h1>
          <p className="text-sm text-gray-400 mt-1 max-w-3xl">
            Authoritative MySQL 8.4 relational schema, stored procedures with row-level exclusive locks (`FOR UPDATE`), FIFO deduction guarantees, and views.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded bg-cyan-950 border border-cyan-800 px-2.5 py-1 text-xs font-mono text-cyan-300">
            {db.engine} {db.version}
          </span>
        </div>
      </div>

      {/* Schema KPI Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-lg border border-[#1F2937] bg-[#111827] p-3">
          <div className="text-[11px] font-mono uppercase text-gray-400">Total Tables</div>
          <div className="mt-1 text-2xl font-bold text-cyan-400">{db.tablesCount}</div>
          <div className="text-[10px] text-gray-500">InnoDB ACID Engine</div>
        </div>

        <div className="rounded-lg border border-[#1F2937] bg-[#111827] p-3">
          <div className="text-[11px] font-mono uppercase text-gray-400">Stored Procedures</div>
          <div className="mt-1 text-2xl font-bold text-purple-400">{db.proceduresCount}</div>
          <div className="text-[10px] text-gray-500">FIFO Allocation Logic</div>
        </div>

        <div className="rounded-lg border border-[#1F2937] bg-[#111827] p-3">
          <div className="text-[11px] font-mono uppercase text-gray-400">Database Triggers</div>
          <div className="mt-1 text-2xl font-bold text-amber-400">{db.triggersCount}</div>
          <div className="text-[10px] text-gray-500">Audit & Priority Calc</div>
        </div>

        <div className="rounded-lg border border-[#1F2937] bg-[#111827] p-3">
          <div className="text-[11px] font-mono uppercase text-gray-400">Analytical Views</div>
          <div className="mt-1 text-2xl font-bold text-emerald-400">{db.viewsCount}</div>
          <div className="text-[10px] text-gray-500">Fast Tactical Queries</div>
        </div>
      </div>

      {/* FIFO vs FEFO Allocation Mechanics Banner */}
      <div className="rounded-lg border border-cyan-900/40 bg-cyan-950/20 p-5 space-y-3">
        <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-cyan-400">
          <Lock className="h-4 w-4" />
          <span>FIFO Allocation Mechanics & Concurrency Control</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
          <div className="rounded border border-[#1F2937] bg-[#0B0F19] p-3 text-xs">
            <span className="font-semibold text-white block mb-1">Algorithm</span>
            <p className="text-gray-300 text-[11px] leading-relaxed">
              {db.allocationMechanics.algorithm}
            </p>
          </div>

          <div className="rounded border border-[#1F2937] bg-[#0B0F19] p-3 text-xs">
            <span className="font-semibold text-white block mb-1">Locking Strategy</span>
            <p className="text-gray-300 text-[11px] leading-relaxed">
              {db.allocationMechanics.lockingStrategy}
            </p>
          </div>

          <div className="rounded border border-[#1F2937] bg-[#0B0F19] p-3 text-xs">
            <span className="font-semibold text-white block mb-1">Rollback Behavior</span>
            <p className="text-gray-300 text-[11px] leading-relaxed">
              {db.allocationMechanics.rollbackBehavior}
            </p>
          </div>

          <div className="rounded border border-[#1F2937] bg-[#0B0F19] p-3 text-xs">
            <span className="font-semibold text-white block mb-1">Concurrency Isolation</span>
            <p className="text-gray-300 text-[11px] leading-relaxed">
              {db.allocationMechanics.concurrencyHandling}
            </p>
          </div>
        </div>
      </div>

      {/* Table Browser & Schema Column Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Table List */}
        <div className="rounded-lg border border-[#1F2937] bg-[#111827] p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400">
              Tables Directory
            </h2>
            <span className="text-[11px] font-mono text-gray-500">
              {filteredTables.length} Tables
            </span>
          </div>

          <div className="relative">
            <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-gray-500" />
            <input
              type="text"
              value={searchTable}
              onChange={(e) => setSearchTable(e.target.value)}
              placeholder="Search table name..."
              className="w-full rounded border border-[#1F2937] bg-[#0B0F19] pl-8 pr-3 py-1 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="space-y-1 max-h-96 overflow-y-auto pr-1">
            {filteredTables.map((t) => (
              <button
                key={t.name}
                onClick={() => setSelectedTable(t.name)}
                className={`flex w-full items-center justify-between rounded px-3 py-2 text-xs font-mono transition-colors text-left ${
                  selectedTable === t.name
                    ? "bg-cyan-950 text-cyan-300 border-l-2 border-cyan-400 font-bold"
                    : "text-gray-300 hover:bg-[#1F2937] hover:text-white"
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <Table className="h-3.5 w-3.5 shrink-0 text-cyan-400" />
                  <span className="truncate">{t.name}</span>
                </div>
                <span className="text-[10px] text-gray-500 font-normal">
                  {t.columns.length} cols
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Right: Selected Table Column Definitions */}
        <div className="lg:col-span-2 rounded-lg border border-[#1F2937] bg-[#111827] p-5 space-y-4">
          {activeTableDoc ? (
            <>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-[#1F2937] pb-3 gap-2">
                <div>
                  <h3 className="text-base font-bold text-white font-mono flex items-center gap-2">
                    <Table className="h-4 w-4 text-cyan-400" />
                    <span>Table: {activeTableDoc.name}</span>
                  </h3>
                  <p className="text-xs text-gray-400 mt-1">{activeTableDoc.purpose}</p>
                </div>

                <div className="flex items-center gap-2 font-mono text-[11px]">
                  <span className="rounded bg-gray-800 px-2 py-0.5 text-gray-300">
                    {activeTableDoc.sensitivity} Data
                  </span>
                </div>
              </div>

              {/* Columns Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse font-mono">
                  <thead>
                    <tr className="border-b border-[#1F2937] bg-[#0B0F19] text-gray-400 text-[11px] uppercase">
                      <th className="py-2 px-3">Column Name</th>
                      <th className="py-2 px-3">Data Type</th>
                      <th className="py-2 px-3">Constraints & Keys</th>
                      <th className="py-2 px-3">Default</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1F2937]/60">
                    {activeTableDoc.columns.map((col) => (
                      <tr key={col.name} className="hover:bg-[#1a2333]">
                        <td className="py-2 px-3 font-bold text-white whitespace-nowrap">
                          {col.name}
                        </td>
                        <td className="py-2 px-3 text-cyan-300 text-[11px] whitespace-nowrap">
                          {col.type}
                        </td>
                        <td className="py-2 px-3 text-[11px]">
                          {col.pk && (
                            <span className="rounded bg-amber-950 border border-amber-800 px-1.5 py-0.2 text-[10px] text-amber-300 font-bold mr-1">
                              PRIMARY KEY
                            </span>
                          )}
                          {col.fk && (
                            <span className="rounded bg-purple-950 border border-purple-800 px-1.5 py-0.2 text-[10px] text-purple-300 mr-1">
                              FK → {col.fk}
                            </span>
                          )}
                          {!col.nullable && !col.pk && (
                            <span className="text-gray-500 text-[10px]">NOT NULL</span>
                          )}
                        </td>
                        <td className="py-2 px-3 text-gray-500 text-[11px]">
                          {col.defaultVal || "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Indexes & Retention */}
              <div className="pt-2 border-t border-[#1F2937] flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs text-gray-400 gap-2">
                <div>
                  <span className="font-semibold text-gray-300">Indexes: </span>
                  <span className="font-mono text-[11px] text-cyan-400">
                    {activeTableDoc.indexes.join(", ")}
                  </span>
                </div>
                <div className="text-[11px] text-gray-500 font-mono">
                  Retention: {activeTableDoc.retention}
                </div>
              </div>
            </>
          ) : (
            <div className="py-8 text-center text-gray-500">Select a table to inspect columns.</div>
          )}
        </div>
      </div>

      {/* Stored Procedures Section */}
      <div className="rounded-lg border border-[#1F2937] bg-[#111827] p-5 space-y-4">
        <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400">
          Stored Procedures (ACID Transactions)
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {db.storedProcedures.map((proc) => (
            <div key={proc.name} className="rounded border border-[#1F2937] bg-[#0B0F19] p-4 text-xs space-y-2">
              <div className="flex items-center justify-between font-mono">
                <span className="font-bold text-white text-sm">{proc.name}</span>
                <span className="text-purple-400 text-[10px] bg-purple-950/60 px-2 py-0.5 rounded border border-purple-900">
                  PROCEDURE
                </span>
              </div>
              <p className="text-gray-300 text-xs">{proc.purpose}</p>

              <div className="rounded bg-[#111827] p-2 font-mono text-[11px] text-cyan-300 break-all">
                {proc.parameters}
              </div>

              <div className="text-[11px] text-gray-400 leading-relaxed pt-1">
                <span className="text-gray-300 font-semibold">Row Locking: </span>
                {proc.lockingMechanisms}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
