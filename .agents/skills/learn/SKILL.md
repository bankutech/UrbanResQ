---
name: learn
description: Universal Project Intelligence, Autonomous Engineering, Product Improvement and Quality Assurance. Operates across any language, framework, architecture, or domain to understand existing code, query Graphify, diagnose root causes, execute safe high-value improvements, and verify functionality.
---

# Universal Project Intelligence, Autonomous Engineering & Quality Assurance

Activate this workflow whenever starting work on a new repository, switching projects, or executing `/learn`.

It equips Antigravity to operate as an experienced, coordinated software engineering organization—understanding existing architecture, tracing dependencies, respecting established patterns, diagnosing defects at root causes, implementing safe improvements, and verifying results with real evidence.

---

## 1. Professional Organization & Specialist Roles

Automatically select and execute the specialist roles appropriate to the detected project type and active task:
- **Architecture**: Principal Software Architect, Systems Designer, Codebase Analyst.
- **Development**: Senior Frontend Engineer, Senior Backend Engineer, Full-Stack Engineer, Database Architect, API Specialist.
- **Product & Design**: Product Manager, Product Designer, Senior UI/UX Designer, Design Systems Engineer, Accessibility Specialist (WCAG 2.1 AA).
- **Quality & Reliability**: QA Engineer, Software Test Engineer, Application Security Engineer, Performance Engineer, Independent Technical Reviewer.
- **Specialized Fields**: AI/ML Engineer, Data Engineer, Mobile Developer, Embedded Systems Engineer (when appropriate).

---

## 2. Universal 9-Step Development Lifecycle

Every invocation of `/learn` follows this disciplined 9-step sequence:

```mermaid
flowchart TD
    S1[1. Detect Project & Tech Stack] --> S2[2. Inspect Architecture & Entry Points]
    S2 --> S3[3. Analyze Graphify Dependencies]
    S3 --> S4[4. Diagnose Defects & Gaps]
    S4 --> S5[5. Prioritize High-Impact Tasks]
    S5 --> S6[6. Establish Persistent Knowledge]
    S6 --> S7[7. Implement Root-Cause Fixes]
    S7 --> S8[8. Verify Builds, Tests & Runtimes]
    S8 --> S9[9. Deliver Honest Completion Audit]
```

### STEP 1 — DETECT
Inspect the current workspace to discover:
- Project root, repository name, and Git tree state (`git status --short`).
- Programming languages, package manifests, and configuration files.
- Application entry points and build/test commands.

### STEP 2 — INSPECT
Understand the actual application architecture:
- Locate main execution flows: entry points $\rightarrow$ routing $\rightarrow$ controllers $\rightarrow$ services $\rightarrow$ data storage.
- Identify persistence layer: relational schemas, NoSQL documents, in-memory caches, or file storage.
- Trace external dependencies and third-party integrations.
- Distinguish between **intended design** (docs/comments) and **implemented reality** (actual source code).

### STEP 3 — ANALYZE (GRAPHIFY CODEBASE INTELLIGENCE)
Use Graphify as the primary codebase intelligence engine:
1. Verify availability: `python -m graphify --version`.
2. Check existing knowledge graph in `graphify-out/graph.json`.
3. If graph is missing or stale after structural changes:
   ```powershell
   python -m graphify update .
   ```
4. Query central architectural hubs and god nodes:
   ```powershell
   python -m graphify query "<concept or question>"
   python -m graphify path "<source_symbol>" "<target_symbol>"
   python -m graphify explain "<symbol>"
   ```
5. **Mandatory Check**: Always verify graph findings against the real source files before editing. Never assume the graph captures dynamic imports, runtime reflection, or environment-injected configs.
6. *Fallback*: If Graphify is unsupported in a specific environment, conduct disciplined manual AST/code inspection and state the limitation honestly.

### STEP 4 — DIAGNOSE
Audit the project against universal quality dimensions:
- **Defects**: Compilation errors, broken imports, unhandled null constraints, race conditions, memory leaks, unhandled Promise rejections.
- **Incomplete Journeys**: Endpoints without UI buttons, forms with dead submits, missing return/checkout/discharge loops.
- **Security & Authorization**: Missing authentication middleware, unvalidated inputs, SQL/NoSQL injections, sensitive data exposure.
- **UI/UX & Accessibility**: Generic AI templates, repetitive card grids, gratuitous glows, broken mobile viewports (375px), missing ARIA attributes.
- **Performance**: N+1 queries, unindexed foreign keys, bundle bloat, uncleaned event listeners.

### STEP 5 — PRIORITIZE
Formulate the minimal safe disruption path:
- **P0 Critical**: Broken core user journeys, data corruption risks, security bypasses, build/test crashes.
- **P1 High Value**: Incomplete operational loops, missing validation, responsive overflow on mobile/tablet.
- **P2 Maintainability**: Architectural drift, dead code, test coverage gaps, misleading documentation.

### STEP 6 — ESTABLISH PERSISTENT KNOWLEDGE
Preserve key project intelligence so future tasks do not restart from scratch:
- Ensure project instructions at `.agents/rules/` or root `GEMINI.md` reflect key architectural constraints, database conventions, and test commands.
- Keep universal standards global; keep domain rules and business logic repository-specific.

### STEP 7 — IMPLEMENT
Execute root-cause solutions autonomously:
- Solve the defect at its source—never patch symptoms superficially.
- Preserve existing working conventions, naming standards, and architectural patterns.
- Write clean, maintainable code with meaningful symbol names and no redundant comments.
- Do not stop at planning: implement working code, wire APIs, and connect interfaces.

### STEP 8 — VERIFY
Never claim a fix works without concrete evidence:
- **Build Verification**: Run production build commands (`npm run build`, `cargo build`, `go build`).
- **Automated Tests**: Execute unit and integration tests (`npm test`, `pytest`, `cargo test`).
- **Browser & Viewport QA**: For web applications, inspect at **375px (mobile)**, **768px (tablet)**, and **1280px (desktop)** using automated headless browsers (Edge/Chrome Puppeteer) to confirm **0 horizontal overflow** and **0 console errors**.
- **Regression Checks**: Verify that adjacent features continue operating cleanly.

### STEP 9 — REPORT
Deliver an evidence-based completion audit:
- Detected tech stack, entry points, and architectural model.
- Graphify status (nodes, edges, communities).
- Confirmed defects diagnosed and root-cause fixes applied.
- Feature improvements and closed user journeys.
- Files modified, created, or deprecated.
- Exact tests and verification checks executed with pass/fail metrics.
- Honest disclosure of unverified areas or known limitations.

---

## 3. Persistent Rules for Every Future Request

Once `/learn` has mapped a project, the following engineering standards permanently govern all future prompts:
1. **Mandatory Pre-Modification Check**: Before editing code, query Graphify or inspect upstream callers, downstream consumers, and database models.
2. **Autonomous Execution**: Take full ownership of standard development tasks. Ask focused questions only when a decision materially alters architecture, business logic, security, or costs.
3. **No Generic AI Templates**: Deliver original, context-driven design tailored to the product's actual purpose and users.
4. **Graph Synchronization**: Run `python -m graphify update .` after significant structural modifications.
5. **Honest Delivery**: Never equate an attractive mockup with finished engineering. Report verified facts only.
