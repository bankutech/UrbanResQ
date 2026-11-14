// SECTION 11: BUSINESS LOGIC & WORKFLOWS
// Operational sequence diagrams, state machine transitions, ACID rollback guarantees, and business rules

import React, { useState } from "react";
import {
  GitMerge,
  ArrowRight,
  ShieldAlert,
  RotateCcw,
  Bell,
  ScrollText,
  CheckCircle2,
  Lock
} from "lucide-react";
import { useSpecWorkspace } from "../context";

export default function Section11Workflows() {
  const { state } = useSpecWorkspace();
  const workflows = state.workflows;
  const [selectedWorkflowId, setSelectedWorkflowId] = useState(workflows[0]?.id || "WF-01");

  const activeWorkflow = workflows.find((w) => w.id === selectedWorkflowId) || workflows[0];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between border-b border-[#1F2937] pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-wider">
            <GitMerge className="h-4 w-4" />
            <span>Specification Section 11</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white mt-1">
            Business Logic, State Transitions & Operational Workflows
          </h1>
          <p className="text-sm text-gray-400 mt-1 max-w-3xl">
            Formal state machine rules, multi-actor coordination workflows, and deterministic rollback behavior across disaster lifecycles.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded bg-cyan-950 border border-cyan-800 px-2.5 py-1 text-xs font-mono text-cyan-300">
            {workflows.length} Core Workflows
          </span>
        </div>
      </div>

      {/* Workflow Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[#1F2937] pb-3">
        {workflows.map((wf) => (
          <button
            key={wf.id}
            onClick={() => setSelectedWorkflowId(wf.id)}
            className={`rounded px-3 py-1.5 text-xs font-mono transition-colors ${
              selectedWorkflowId === wf.id
                ? "bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold"
                : "text-gray-400 hover:bg-[#111827] hover:text-white"
            }`}
          >
            {wf.id}: {wf.name}
          </button>
        ))}
      </div>

      {/* Active Workflow Details */}
      {activeWorkflow && (
        <div className="rounded-lg border border-[#1F2937] bg-[#111827] p-6 space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-[#1F2937] pb-4 gap-2">
            <div>
              <div className="text-xs font-mono text-cyan-400 font-bold">
                {activeWorkflow.id} • {activeWorkflow.category}
              </div>
              <h2 className="text-xl font-bold text-white mt-1">{activeWorkflow.name}</h2>
              <p className="text-xs text-gray-400 mt-1">
                <strong>Prerequisites:</strong> {activeWorkflow.startingConditions}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-gray-300">
              <span className="text-gray-500">Actors:</span>
              {activeWorkflow.actors.map((actor) => (
                <span key={actor} className="rounded bg-gray-800 px-2 py-0.5 text-[11px] text-gray-200">
                  {actor}
                </span>
              ))}
            </div>
          </div>

          {/* Workflow Steps */}
          <div className="space-y-3">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400">
              Execution Sequence Steps
            </h3>

            <div className="space-y-2">
              {activeWorkflow.steps.map((st) => (
                <div
                  key={st.stepNumber}
                  className="rounded border border-[#1F2937] bg-[#0B0F19] p-3 text-xs flex flex-col md:flex-row md:items-center justify-between gap-2"
                >
                  <div className="flex items-start gap-3">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-cyan-950 border border-cyan-800 font-mono text-cyan-300 text-xs font-bold">
                      {st.stepNumber}
                    </span>
                    <div>
                      <div className="font-semibold text-white">
                        {st.title} <span className="text-cyan-400 font-mono text-[10px]">({st.actor})</span>
                      </div>
                      <p className="text-gray-400 text-[11px] mt-0.5">{st.action}</p>
                    </div>
                  </div>

                  <div className="text-[11px] font-mono text-emerald-400 pl-8 md:pl-0">
                    → {st.outcome}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Business Rules & Failure / Rollback */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="rounded border border-[#1F2937] bg-[#0B0F19] p-4 text-xs space-y-2">
              <span className="font-semibold text-white font-mono block text-xs text-cyan-400">
                Business Invariants & Rules
              </span>
              <ul className="space-y-1.5 text-gray-300 text-[11px]">
                {activeWorkflow.businessRules.map((rule, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-cyan-400 mt-0.5 shrink-0" />
                    <span>{rule}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded border border-[#1F2937] bg-[#0B0F19] p-4 text-xs space-y-2">
              <span className="font-semibold text-white font-mono block text-xs text-amber-400">
                Failure Cases & Rollback Behavior
              </span>
              <div className="space-y-2 text-[11px] text-gray-300">
                <div className="text-gray-400">
                  <span className="font-bold text-gray-300">Failure Handling: </span>
                  {activeWorkflow.failureCases.join(" ")}
                </div>
                <div className="text-amber-400/90 font-mono">
                  <span className="font-bold">Rollback: </span>
                  {activeWorkflow.rollbackBehavior}
                </div>
              </div>
            </div>
          </div>

          {/* Workflow Diagram Preview */}
          <div className="rounded border border-[#1F2937] bg-[#0B0F19] p-4 space-y-2">
            <span className="font-mono text-xs font-bold uppercase text-gray-400">
              Workflow State Machine Diagram
            </span>
            <pre className="p-3 rounded bg-[#111827] text-cyan-300 font-mono text-xs overflow-x-auto">
              {activeWorkflow.mermaidDiagram}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
