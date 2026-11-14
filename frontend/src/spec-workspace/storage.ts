// URBANRESQ — Specification Storage Manager
// Provides IndexedDB + LocalStorage persistence, state snapshots, and multi-format exporters

import { FullWorkspaceState, VersionEntry } from "./types";
import { DEFAULT_WORKSPACE_STATE } from "./defaultData";

const DB_NAME = "UrbanResQ_SpecWorkspace_DB";
const STORE_NAME = "workspace_state";
const DB_VERSION = 1;
const LOCAL_STORAGE_KEY = "urbanresq_spec_workspace_v1";

// Helper: Open IndexedDB
function openIndexedDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.indexedDB) {
      return reject(new Error("IndexedDB is not available in this environment."));
    }
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (event: any) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Load state from IndexedDB or LocalStorage
export async function loadWorkspaceState(): Promise<FullWorkspaceState> {
  try {
    const db = await openIndexedDB();
    const state = await new Promise<FullWorkspaceState | null>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const req = store.get("current");
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });

    if (state && state.version && state.overview) {
      return state;
    }
  } catch (err) {
    console.warn("[SpecWorkspace] IndexedDB read failed, falling back to LocalStorage:", err);
  }

  // LocalStorage Fallback
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.overview) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn("[SpecWorkspace] LocalStorage read failed:", err);
  }

  // Initial Seed
  return DEFAULT_WORKSPACE_STATE;
}

// Save state to IndexedDB and LocalStorage
export async function saveWorkspaceState(state: FullWorkspaceState): Promise<void> {
  // Update lastUpdated timestamp
  state.lastUpdated = new Date().toISOString();

  // Try saving to IndexedDB
  try {
    const db = await openIndexedDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(state, "current");
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn("[SpecWorkspace] IndexedDB write failed:", err);
  }

  // Also sync to LocalStorage
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.warn("[SpecWorkspace] LocalStorage write failed (may exceed quota):", err);
  }
}

// Create a new version revision snapshot
export function createVersionRevision(
  state: FullWorkspaceState,
  newVersionNumber: string,
  author: string,
  changeSummary: string,
  modifiedSections: string[],
  reason: string
): FullWorkspaceState {
  const newEntry: VersionEntry = {
    versionId: `VER-${String(state.versionHistory.length + 1).padStart(3, "0")}`,
    versionNumber: newVersionNumber,
    timestamp: new Date().toISOString(),
    author: author || "Staff Engineer",
    changeSummary,
    modifiedSections,
    reason,
    dataSnapshot: JSON.parse(JSON.stringify(state))
  };

  const updatedState = {
    ...state,
    version: newVersionNumber,
    overview: {
      ...state.overview,
      version: newVersionNumber,
      lastUpdated: new Date().toISOString().slice(0, 10)
    },
    versionHistory: [newEntry, ...state.versionHistory]
  };

  return updatedState;
}

// Export Builders
export function exportAsJSON(state: FullWorkspaceState): string {
  // Clean state to ensure no sensitive credentials exist
  const sanitized = JSON.parse(JSON.stringify(state));
  return JSON.stringify(sanitized, null, 2);
}

export function exportRequirementsAsCSV(state: FullWorkspaceState): string {
  const headers = [
    "Requirement ID",
    "Title",
    "Category",
    "Priority",
    "Status",
    "Assigned Role",
    "Acceptance Criteria",
    "Verification Method",
    "Verification Evidence",
    "Related Tests",
    "Related Bugs",
    "Created Date"
  ];

  const escapeCSV = (val: any) => `"${String(val || "").replace(/"/g, '""')}"`;

  const rows = state.requirements.map(r => [
    escapeCSV(r.id),
    escapeCSV(r.title),
    escapeCSV(r.category),
    escapeCSV(r.priority),
    escapeCSV(r.status),
    escapeCSV(r.assignedRole),
    escapeCSV(r.acceptanceCriteria),
    escapeCSV(r.verificationMethod),
    escapeCSV(r.verificationEvidence),
    escapeCSV(r.relatedTestIds.join(", ")),
    escapeCSV(r.relatedBugIds.join(", ")),
    escapeCSV(r.createdAt)
  ].join(","));

  return [headers.join(","), ...rows].join("\n");
}

export function exportBugsAsCSV(state: FullWorkspaceState): string {
  const headers = [
    "Bug ID",
    "Title",
    "Severity",
    "Priority",
    "Status",
    "Affected Module",
    "Root Cause",
    "Assigned To",
    "Related Requirement",
    "Related Test"
  ];

  const escapeCSV = (val: any) => `"${String(val || "").replace(/"/g, '""')}"`;

  const rows = state.bugs.map(b => [
    escapeCSV(b.id),
    escapeCSV(b.title),
    escapeCSV(b.severity),
    escapeCSV(b.priority),
    escapeCSV(b.status),
    escapeCSV(b.affectedModule),
    escapeCSV(b.rootCause),
    escapeCSV(b.assignedTo),
    escapeCSV(b.relatedReqId || ""),
    escapeCSV(b.relatedTestId || "")
  ].join(","));

  return [headers.join(","), ...rows].join("\n");
}

export function exportTestsAsCSV(state: FullWorkspaceState): string {
  const headers = [
    "Test ID",
    "Requirement ID",
    "Category",
    "Scenario",
    "Status",
    "Expected Result",
    "Actual Result",
    "Evidence",
    "Last Run"
  ];

  const escapeCSV = (val: any) => `"${String(val || "").replace(/"/g, '""')}"`;

  const rows = state.testCases.map(t => [
    escapeCSV(t.id),
    escapeCSV(t.reqId),
    escapeCSV(t.category),
    escapeCSV(t.scenario),
    escapeCSV(t.status),
    escapeCSV(t.expectedResult),
    escapeCSV(t.actualResult),
    escapeCSV(t.evidence),
    escapeCSV(t.lastRun)
  ].join(","));

  return [headers.join(","), ...rows].join("\n");
}

export function exportDecisionsAsCSV(state: FullWorkspaceState): string {
  const headers = [
    "Decision ID",
    "Title",
    "Status",
    "Selected Option",
    "Rationale",
    "Trade-Offs",
    "Affected Modules",
    "Date",
    "Author"
  ];

  const escapeCSV = (val: any) => `"${String(val || "").replace(/"/g, '""')}"`;

  const rows = state.decisions.map(d => [
    escapeCSV(d.id),
    escapeCSV(d.title),
    escapeCSV(d.status),
    escapeCSV(d.selectedOption),
    escapeCSV(d.rationale),
    escapeCSV(d.tradeOffs),
    escapeCSV(d.affectedModules.join(", ")),
    escapeCSV(d.date),
    escapeCSV(d.author)
  ].join(","));

  return [headers.join(","), ...rows].join("\n");
}

export function exportAsMarkdown(state: FullWorkspaceState, sectionFilter?: string[]): string {
  let md = `# URBANRESQ — MASTER PROJECT SPECIFICATION WORKSPACE
**Specification Version:** ${state.version}  
**Last Updated:** ${state.lastUpdated}  
**Status:** ${state.overview.status}  
**Deployment Status:** ${state.overview.deploymentStatus}  

---

`;

  const shouldInclude = (secName: string) => !sectionFilter || sectionFilter.includes(secName);

  if (shouldInclude("overview")) {
    md += `## 1. OVERVIEW

### 1.1 Project Summary
${state.overview.description}

### 1.2 Problem Statement
${state.overview.problemStatement}

### 1.3 Core Objectives
${state.overview.objectives.map(o => `- ${o}`).join("\n")}

### 1.4 Architecture Summary
- **Frontend Architecture:** ${state.overview.frontendArch}
- **Backend Architecture:** ${state.overview.backendArch}
- **Database Engine:** ${state.overview.databaseTech}
- **Authentication Model:** ${state.overview.authModel}
- **Security Architecture:** ${state.overview.securityArch}

### 1.5 Target Users
${state.overview.targetUsers.map(u => `- ${u}`).join("\n")}

### 1.6 Major Modules
${state.overview.majorModules.map(m => `- ${m}`).join("\n")}

### 1.7 Known Limitations
${state.overview.knownLimitations.map(l => `- ${l}`).join("\n")}

---

`;
  }

  if (shouldInclude("requirements")) {
    md += `## 2. REQUIREMENTS CHECKLIST

| ID | Title | Category | Priority | Status | Assigned Role | Acceptance Criteria |
|---|---|---|---|---|---|---|
`;
    state.requirements.forEach(r => {
      md += `| **${r.id}** | ${r.title.replace(/\|/g, "-")} | ${r.category} | \`${r.priority}\` | **${r.status}** | ${r.assignedRole} | ${r.acceptanceCriteria.replace(/\|/g, "-")} |\n`;
    });
    md += "\n---\n\n";
  }

  if (shouldInclude("product-spec")) {
    md += `## 3. PRODUCT SPECIFICATION

### 3.1 Vision
${state.productSpec.vision}

### 3.2 Product Goals
${state.productSpec.goals.map(g => `- ${g}`).join("\n")}

### 3.3 Major Operational Capabilities (16 Total)

`;
    state.productSpec.capabilities.forEach(c => {
      md += `#### ${c.id}. ${c.name} [Status: ${c.status}]
- **Description:** ${c.description}
- **Key Features:** ${c.keyFeatures.join(", ")}
- **UI Route:** \`${c.uiRoute}\`
- **Backend Endpoints:** ${c.backendRoutes.map(b => `\`${b}\``).join(", ")}

`;
    });
    md += "---\n\n";
  }

  if (shouldInclude("ui-ux")) {
    md += `## 4. UI/UX REQUIREMENTS

### 4.1 Design Principles
${state.uiuxSpec.designPrinciples.map(p => `- ${p}`).join("\n")}

### 4.2 Color Palette
| Token | Hex | Role | Contrast Ratio |
|---|---|---|---|
${state.uiuxSpec.colorPalette.map(c => `| \`${c.token}\` | \`${c.hex}\` | ${c.role} | ${c.contrastRatio} |`).join("\n")}

### 4.3 Responsive Breakpoints
${state.uiuxSpec.responsiveBreakpoints.map(b => `- **${b.name} (${b.width}):** ${b.rules}`).join("\n")}

---

`;
  }

  if (shouldInclude("frontend-spec")) {
    md += `## 5. FRONTEND SPECIFICATION

### 5.1 Technology Stack
${state.frontendSpec.technologies.map(t => `- **${t.name} (${t.version}):** ${t.role}`).join("\n")}

### 5.2 Frontend Feature Matrix
| Route | Page | Purpose | Required Role | API Endpoints | Mobile Behavior |
|---|---|---|---|---|---|
${state.frontendSpec.featureMatrix.map(f => `| \`${f.route}\` | \`${f.page}\` | ${f.purpose} | \`${f.role}\` | \`${f.apiEndpoints}\` | ${f.mobileBehavior} |`).join("\n")}

---

`;
  }

  if (shouldInclude("backend-spec")) {
    md += `## 6. BACKEND SPECIFICATION

### 6.1 Architecture Summary
${state.backendSpec.architectureSummary}

### 6.2 API Inventory (Verified in Source)
| Method | Route | Purpose | Auth | Role | Validation | DB Effects |
|---|---|---|---|---|---|---|
${state.backendSpec.apiInventory.map(a => `| \`${a.method}\` | \`${a.route}\` | ${a.purpose} | ${a.authRequired ? "Yes" : "No"} | \`${a.role}\` | ${a.validationRules} | ${a.dbEffects} |`).join("\n")}

---

`;
  }

  if (shouldInclude("database-design")) {
    md += `## 7. DATABASE DESIGN

**Engine:** ${state.databaseSpec.engine} ${state.databaseSpec.version}  
**Total Tables:** ${state.databaseSpec.tablesCount} | **Views:** ${state.databaseSpec.viewsCount} | **Stored Procedures:** ${state.databaseSpec.proceduresCount} | **Triggers:** ${state.databaseSpec.triggersCount}

### 7.1 FIFO Allocation Mechanics
- **Algorithm:** ${state.databaseSpec.allocationMechanics.algorithm}
- **Locking Strategy:** ${state.databaseSpec.allocationMechanics.lockingStrategy}
- **Rollback Behavior:** ${state.databaseSpec.allocationMechanics.rollbackBehavior}
- **Concurrency Handling:** ${state.databaseSpec.allocationMechanics.concurrencyHandling}

### 7.2 Stored Procedures
${state.databaseSpec.storedProcedures.map(p => `#### \`${p.name}\`
- **Purpose:** ${p.purpose}
- **Parameters:** \`${p.parameters}\`
- **Locking:** ${p.lockingMechanisms}
- **Logic:** ${p.logic}
`).join("\n")}

---

`;
  }

  if (shouldInclude("auth")) {
    md += `## 8. AUTHENTICATION & AUTHORIZATION

### 8.1 Strategy
- **Token Type:** ${state.authSpec.strategy}
- **Lifetime:** ${state.authSpec.tokenLifetime}
- **Password Hash:** ${state.authSpec.passwordHashing}

### 8.2 Role-Permission Matrix
| Module | Sensitive Action | Allowed Roles | Backend Enforced |
|---|---|---|---|
${state.authSpec.permissionMatrix.map(p => `| ${p.module} | ${p.action} | ${p.allowedRoles.map(r => `\`${r}\``).join(", ")} | ${p.backendEnforced ? "✅ Enforced" : "❌ Frontend Only"} |`).join("\n")}

---

`;
  }

  if (shouldInclude("security")) {
    md += `## 9. SECURITY REQUIREMENTS

| ID | Title | Severity | Category | Affected Component | Status | Remediation |
|---|---|---|---|---|---|---|
${state.securityReqs.map(s => `| **${s.id}** | ${s.title} | \`${s.severity}\` | ${s.category} | \`${s.affectedComponent}\` | **${s.status}** | ${s.remediation} |`).join("\n")}

---

`;
  }

  if (shouldInclude("integrations")) {
    md += `## 10. INTEGRATIONS & APIS

${state.integrations.map(i => `### ${i.name} [Status: ${i.status}]
- **Purpose:** ${i.purpose}
- **Provider:** ${i.provider}
- **Failure Handling:** ${i.failureHandling}
- **Cost:** ${i.cost}
`).join("\n")}

---

`;
  }

  if (shouldInclude("workflows")) {
    md += `## 11. BUSINESS LOGIC & WORKFLOWS

${state.workflows.map(w => `### ${w.name} (${w.category})
**Starting Conditions:** ${w.startingConditions}  
**Actors:** ${w.actors.join(", ")}  
**Required Permissions:** ${w.requiredPermissions.join(", ")}  

\`\`\`mermaid
${w.mermaidDiagram}
\`\`\`

**Steps:**
${w.steps.map(s => `${s.stepNumber}. **${s.title}** (${s.actor}): ${s.action} -> *${s.outcome}*`).join("\n")}

**Rollback Behavior:** ${w.rollbackBehavior}
`).join("\n")}

---

`;
  }

  if (shouldInclude("architecture")) {
    md += `## 12. ARCHITECTURE & FILE STRUCTURE

### 12.1 Root vs Backend Dual Implementation Analysis
${state.architecture.rootVsBackendAnalysis.map(a => `#### Q: ${a.question}
- **Finding:** ${a.finding}
- **Recommendation:** ${a.recommendation}
`).join("\n")}

### 12.2 File Classification
| Path | Type | Module | Description |
|---|---|---|---|
${state.architecture.fileMap.map(f => `| \`${f.path}\` | \`${f.type}\` | ${f.module} | ${f.description} |`).join("\n")}

---

`;
  }

  if (shouldInclude("testing")) {
    md += `## 13. TESTING & ACCEPTANCE

| Test ID | Req ID | Category | Scenario | Status | Evidence | Last Run |
|---|---|---|---|---|---|---|
${state.testCases.map(t => `| **${t.id}** | \`${t.reqId}\` | ${t.category} | ${t.scenario} | **${t.status}** | \`${t.evidence}\` | ${t.lastRun} |`).join("\n")}

---

`;
  }

  if (shouldInclude("deployment")) {
    md += `## 14. DEPLOYMENT INSTRUCTIONS

${state.deployment.environments.map(e => `### Environment: ${e.name}
- **Host Platform:** ${e.hostPlatform}
- **Commands:**
\`\`\`bash
${e.commands.join("\n")}
\`\`\`
- **Environment Variables:** \`${e.envVars.join("`, `")}\`
- **Notes:** ${e.notes}
`).join("\n")}

---

`;
  }

  if (shouldInclude("decisions")) {
    md += `## 15. DEVELOPMENT NOTES & DECISIONS (ADRs)

${state.decisions.map(d => `### ${d.id}: ${d.title} [Status: ${d.status}]
**Date:** ${d.date} | **Author:** ${d.author}  
**Context:** ${d.context}  
**Problem:** ${d.problem}  
**Selected Option:** **${d.selectedOption}**  
**Rationale:** ${d.rationale}  
**Trade-Offs:** ${d.tradeOffs}  
**Affected Modules:** ${d.affectedModules.join(", ")}  
`).join("\n")}

---

`;
  }

  if (shouldInclude("bugs")) {
    md += `## 16. BUGS & LIMITATIONS

| Defect ID | Title | Severity | Priority | Status | Root Cause | Proposed Fix |
|---|---|---|---|---|---|---|
${state.bugs.map(b => `| **${b.id}** | ${b.title} | \`${b.severity}\` | \`${b.priority}\` | **${b.status}** | ${b.rootCause} | ${b.proposedFix} |`).join("\n")}

---

`;
  }

  if (shouldInclude("version-history")) {
    md += `## 19. VERSION HISTORY

| Version | Date | Author | Summary | Reason |
|---|---|---|---|---|
${state.versionHistory.map(v => `| **${v.versionNumber}** | ${v.timestamp.slice(0, 10)} | ${v.author} | ${v.changeSummary} | ${v.reason} |`).join("\n")}

`;
  }

  return md;
}

// Download file helper for browser
export function triggerBrowserDownload(filename: string, content: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
