// SECTION 17: ANTIGRAVITY PROMPT BUILDER
// Role-specific task generator, lifecycle prompt synthesizer, template saving, and clipboard export

import React, { useState } from "react";
import {
  Bot,
  Copy,
  Check,
  Save,
  Sparkles,
  Download,
  Terminal,
  FileCode,
  Shield,
  Layers
} from "lucide-react";
import { useSpecWorkspace } from "../context";
import { PromptTemplate } from "../types";
import { triggerBrowserDownload } from "../storage";

const TARGET_ROLES = [
  "Senior Software Architect",
  "Frontend Engineer",
  "Backend Engineer",
  "Senior Full-Stack Developer",
  "UI/UX Designer",
  "Database Architect",
  "Cybersecurity Engineer",
  "QA Automation Engineer",
  "Performance Engineer",
  "DevOps and Deployment Engineer",
  "Accessibility Specialist",
  "Technical Documentation Specialist",
  "Independent Technical Reviewer"
];

const TASK_CATEGORIES = [
  "Implement a Feature",
  "Fix a Bug / Defect",
  "Review Architecture & Module Boundaries",
  "Improve UI/UX & Responsive Flow",
  "Audit Security & OWASP Defenses",
  "Optimize Performance & Latency",
  "Repair Database Logic & Locking",
  "Add Automated Tests (Jest / Browser)",
  "Improve Documentation & Runbooks",
  "Prepare Production Deployment",
  "Conduct Regression Testing"
];

export default function Section17PromptBuilder() {
  const { state, updateSection, saveNow } = useSpecWorkspace();
  const [copied, setCopied] = useState(false);

  // Form State
  const [targetRole, setTargetRole] = useState(TARGET_ROLES[0]);
  const [taskCategory, setTaskCategory] = useState(TASK_CATEGORIES[0]);
  const [selectedModule, setSelectedModule] = useState(state.overview.majorModules[0] || "Resource Allocation");
  const [problemDesc, setProblemDesc] = useState(
    "Implement an automated inventory reservation check that ensures depot batches with expiry dates within 7 days are flagged for inspection."
  );
  const [requirements, setRequirements] = useState(
    "1. Query inventory_batches where expiry_date <= NOW() + INTERVAL 7 DAY.\n2. Emit a warning badge on the InventoryDepots view.\n3. Log an audit event when inspection is confirmed."
  );
  const [constraints, setConstraints] = useState(
    "Must preserve strict FIFO deduction order. Must not modify existing stored procedures without regression tests."
  );
  const [relevantFiles, setRelevantFiles] = useState(
    "backend/src/services/resourceService.ts, frontend/src/pages/InventoryPage.tsx, database/schema.sql"
  );
  const [acceptanceCriteria, setAcceptanceCriteria] = useState(
    "1. Unit test confirms expiring batches are returned.\n2. UI displays amber warning pill.\n3. TypeScript compiles with 0 errors."
  );
  const [securityRules, setSecurityRules] = useState(
    "Enforce RBAC role RESOURCE_MANAGER or ADMIN. Do not expose internal depot cost metrics to unprivileged roles."
  );
  const [outputFormat, setOutputFormat] = useState("Git diff, test output report, and responsive verification evidence.");

  // Generated Prompt State
  const [generatedPrompt, setGeneratedPrompt] = useState("");

  const handleGenerate = () => {
    const prompt = `# URBANRESQ — PROFESSIONAL ENGINEERING DIRECTIVE
## Targeted Specialist Prompt for Antigravity

**Target Role:** ${targetRole}  
**Subsystem / Module:** ${selectedModule}  
**Category:** ${taskCategory}  
**Date:** ${new Date().toISOString().slice(0, 10)}  
**Platform Baseline:** React 18.3, TypeScript 5.5, Vite 5.4, Express, MySQL 8.4 FIFO ACID

---

### MANDATORY DEVELOPMENT LIFECYCLE
You MUST execute the full engineering sequence:
**AUDIT → RESEARCH → PLAN → IMPLEMENT → BROWSER INSPECTION → TEST → FIX ROOT CAUSES → RETEST → REPORT**

### 1. OBJECTIVE & PROBLEM STATEMENT
${problemDesc}

### 2. CORE REQUIREMENTS
${requirements}

### 3. TECHNICAL & OPERATIONAL CONSTRAINTS
- ${constraints}
- Responsive design is non-negotiable (375px mobile, 768px tablet, 1280px desktop).
- Never replace working code with mock placeholders or fake APIs.
- Do not invent database columns or modify authoritative SQL schemas without explicit approval.

### 4. RELEVANT REPOSITORY FILES
${relevantFiles.split(",").map((f) => `- \`${f.trim()}\``).join("\n")}

### 5. SECURITY & ACCESS CONTROL
${securityRules}

### 6. ACCEPTANCE CRITERIA & EVIDENCE
${acceptanceCriteria}

### 7. REQUIRED DELIVERABLES & OUTPUT FORMAT
${outputFormat}

---
*Notice: Antigravity will NOT execute destructive schema changes automatically and must verify all changes against active tests before declaring completion.*
`;

    setGeneratedPrompt(prompt);
  };

  const handleCopy = () => {
    if (!generatedPrompt) handleGenerate();
    const textToCopy = generatedPrompt || "Please generate prompt first.";
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSaveTemplate = () => {
    if (!generatedPrompt) handleGenerate();
    const newTemplate: PromptTemplate = {
      id: `PROMPT-${String(state.promptTemplates.length + 1).padStart(3, "0")}`,
      title: `${targetRole}: ${taskCategory}`,
      targetRole,
      module: selectedModule,
      category: taskCategory,
      problemDescription: problemDesc,
      requirements,
      constraints,
      relevantFiles,
      expectedBehavior: "",
      acceptanceCriteria,
      testingRequirements: "",
      securityConsiderations: securityRules,
      outputFormat,
      generatedPrompt,
      createdAt: new Date().toISOString().slice(0, 10),
      updatedAt: new Date().toISOString().slice(0, 10)
    };

    updateSection("promptTemplates", [newTemplate, ...state.promptTemplates]);
    saveNow();
    alert("Prompt template saved to workspace storage.");
  };

  const handleDownload = () => {
    if (!generatedPrompt) handleGenerate();
    triggerBrowserDownload("antigravity-engineering-prompt.md", generatedPrompt, "text/markdown");
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between border-b border-[#1F2937] pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-wider">
            <Bot className="h-4 w-4" />
            <span>Specification Section 17</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white mt-1">
            Antigravity Prompt Builder & Engineering Dispatcher
          </h1>
          <p className="text-sm text-gray-400 mt-1 max-w-3xl">
            Synthesize highly structured, role-specific prompts enforcing the mandatory development lifecycle for autonomous agent execution.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded bg-cyan-950 border border-cyan-800 px-2.5 py-1 text-xs font-mono text-cyan-300">
            Lifecycle Enforced
          </span>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Form: Parameters */}
        <div className="rounded-lg border border-[#1F2937] bg-[#111827] p-5 space-y-4">
          <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400">
            Prompt Parameters & Context Injection
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Target Role</label>
              <select
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="w-full rounded border border-[#1F2937] bg-[#0B0F19] px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
              >
                {TARGET_ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Task Category</label>
              <select
                value={taskCategory}
                onChange={(e) => setTaskCategory(e.target.value)}
                className="w-full rounded border border-[#1F2937] bg-[#0B0F19] px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
              >
                {TASK_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Subsystem Module</label>
            <select
              value={selectedModule}
              onChange={(e) => setSelectedModule(e.target.value)}
              className="w-full rounded border border-[#1F2937] bg-[#0B0F19] px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
            >
              {state.overview.majorModules.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Task & Problem Description</label>
            <textarea
              rows={3}
              value={problemDesc}
              onChange={(e) => setProblemDesc(e.target.value)}
              className="w-full rounded border border-[#1F2937] bg-[#0B0F19] px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Core Requirements</label>
            <textarea
              rows={3}
              value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
              className="w-full rounded border border-[#1F2937] bg-[#0B0F19] px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono text-[11px]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Technical Constraints</label>
            <input
              type="text"
              value={constraints}
              onChange={(e) => setConstraints(e.target.value)}
              className="w-full rounded border border-[#1F2937] bg-[#0B0F19] px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Relevant Repository Files</label>
            <input
              type="text"
              value={relevantFiles}
              onChange={(e) => setRelevantFiles(e.target.value)}
              className="w-full rounded border border-[#1F2937] bg-[#0B0F19] px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono text-[11px]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Acceptance Criteria</label>
            <textarea
              rows={2}
              value={acceptanceCriteria}
              onChange={(e) => setAcceptanceCriteria(e.target.value)}
              className="w-full rounded border border-[#1F2937] bg-[#0B0F19] px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono text-[11px]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Security Considerations</label>
            <input
              type="text"
              value={securityRules}
              onChange={(e) => setSecurityRules(e.target.value)}
              className="w-full rounded border border-[#1F2937] bg-[#0B0F19] px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <button
            onClick={handleGenerate}
            className="w-full rounded bg-cyan-600 py-2 text-xs font-bold text-white hover:bg-cyan-500 shadow transition-colors flex items-center justify-center gap-2"
          >
            <Sparkles className="h-4 w-4" />
            <span>Generate Antigravity Master Prompt</span>
          </button>
        </div>

        {/* Right Column: Output Prompt Preview & Actions */}
        <div className="rounded-lg border border-[#1F2937] bg-[#111827] p-5 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between border-b border-[#1F2937] pb-3">
              <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400">
                Generated Markdown Directive
              </h2>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 rounded border border-[#1F2937] bg-[#0B0F19] px-2.5 py-1 text-xs text-gray-300 hover:text-white hover:border-cyan-500 transition-colors font-mono"
                  title="Copy to Clipboard"
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                      <span className="text-emerald-400 font-bold">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5 text-cyan-400" />
                      <span>Copy</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleSaveTemplate}
                  className="flex items-center gap-1 rounded border border-[#1F2937] bg-[#0B0F19] px-2.5 py-1 text-xs text-gray-300 hover:text-white hover:border-cyan-500 font-mono"
                  title="Save to Templates"
                >
                  <Save className="h-3.5 w-3.5 text-purple-400" />
                  <span>Save</span>
                </button>

                <button
                  onClick={handleDownload}
                  className="flex items-center gap-1 rounded border border-[#1F2937] bg-[#0B0F19] px-2.5 py-1 text-xs text-gray-300 hover:text-white hover:border-cyan-500 font-mono"
                  title="Export Markdown File"
                >
                  <Download className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Export</span>
                </button>
              </div>
            </div>

            <textarea
              rows={22}
              value={generatedPrompt || "Click 'Generate Antigravity Master Prompt' to compile structured instructions..."}
              onChange={(e) => setGeneratedPrompt(e.target.value)}
              className="mt-3 w-full rounded border border-[#1F2937] bg-[#0B0F19] p-3 text-xs text-cyan-300 font-mono leading-relaxed focus:outline-none focus:border-cyan-500 resize-none"
            />
          </div>

          <div className="border-t border-[#1F2937] pt-3 text-[11px] font-mono text-gray-500 flex items-center justify-between">
            <span>Safety Rule: Prompts require manual review before invocation.</span>
            <span>{generatedPrompt ? `${generatedPrompt.length} chars` : "Ready"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
