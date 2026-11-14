# Workflow: /learn — Universal Project Intelligence & Autonomous Engineering

This workflow establishes and refreshes the agent's verified understanding of any software repository using local Graphify codebase intelligence, automated tech stack detection, and targeted source inspection.

---

## Step 1 — Detect Project & Environment
1. Identify the project root and current working directory.
2. Read persistent project rules in `.agents/rules/` and `GEMINI.md`.
3. Run project detection to identify languages, manifests, frameworks, entry points, and test commands:
   ```bash
   python scratch/detect_project.py .
   ```
4. Check Git status (`git status --short`) before reading or modifying files.

---

## Step 2 — Inspect Architecture & Data Flows
1. Trace execution flow from entry point to routing, business services, and persistence layer.
2. Identify storage technologies, schema files, migrations, and database connection pools.
3. Inspect authentication and authorization boundaries (RBAC/ABAC middleware).
4. Distinguish verified implemented code from intended/documented designs.

---

## Step 3 — Build or Refresh Graphify Knowledge Graph
1. Check if `graphify-out/graph.json` exists and is current.
2. If missing or stale after structural changes, update:
   ```bash
   python -m graphify update .
   ```
3. Query key concepts, god nodes, and dependency paths:
   ```bash
   python -m graphify query "<concept or question>"
   python -m graphify path "<source_symbol>" "<target_symbol>"
   python -m graphify explain "<symbol>"
   ```
4. Verify important graph findings directly against actual source code files.

---

## Step 4 — Diagnose Defects, Risks, and Functional Gaps
1. Identify compile errors, unhandled null constraints, or broken imports.
2. Detect incomplete operational journeys or disconnected UI/API endpoints.
3. Check responsive design across mobile (375px), tablet (768px), and desktop (1280px).
4. Review security gates, injection vectors, and sensitive data leakage.

---

## Step 5 — Prioritize & Plan Minimal Safe Fixes
1. Select high-impact, safe improvements (P0/P1).
2. Avoid arbitrary architectural rewrites when targeted root-cause fixes suffice.

---

## Step 6 — Establish & Preserve Project Knowledge
1. Update project documentation or `.agents/rules/` with discovered architecture and conventions.
2. Never store secrets, API tokens, or credentials in persistent documentation.

---

## Step 7 — Implement Root-Cause Solutions
1. Fix confirmed defects at their source.
2. Preserve existing working conventions, naming standards, and architectural patterns.
3. Build complete, working functionality with clean maintainable code.

---

## Step 8 — Verify With Real Evidence
1. Run automated test suites (`npm test`, `pytest`, `cargo test`, etc.).
2. Execute production builds (`npm run build`, `cargo build`).
3. Run browser viewport inspection to confirm 0 overflow and 0 console errors.
4. Verify regression safety across adjacent features.

---

## Step 9 — Report Completion
Deliver an evidence-based debriefing:
1. Detected project identity, architecture, and tech stack.
2. Graphify knowledge graph metrics (nodes, edges, communities).
3. Confirmed defects diagnosed and root-cause fixes applied.
4. Feature improvements and operational journeys completed.
5. Verification results from executed tests, builds, and browser QA.
6. Honest disclosure of unverified areas or known limitations.
