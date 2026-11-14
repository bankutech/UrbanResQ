# Graph Report - URBAN  (2026-11-14)

## Corpus Check
- 218 files · ~125,281 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 16 file(s) not represented in the graph (top: (none) 7, .css 3, .example 2)

## Summary
- 1451 nodes · 3555 edges · 104 communities (79 shown, 25 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 55 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- react
- api
- types.ts
- query
- environment
- SpecApp.tsx
- db.ts
- leaflet.js
- src/index.ts
- frontend/package.json
- auth.ts
- src/auth.js
- lib.js
- scripts
- dependencies
- bad
- UrbanResQ — Emergency Operations Center & Disaster Allocation System
- devDependencies
- 4. Quality Assurance, Security & Operations
- ref_path
- util.js
- compilerOptions
- ref_path
- dependencies
- DisasterMap.tsx
- storage.ts
- compilerOptions
- backup.js
- ApiError
- context.tsx
- devDependencies
- setup.js
- allocations.js
- UrbanResQ Project Analysis & Redesign Strategy
- backend/package.json
- docker-compose.prod.yml
- jsdom
- F
- docker-init.js
- attachments.js
- Workflow: /learn — Universal Project Intelligence & Autonomous Engineering
- publicRoutes.ts
- environment
- mysql
- e
- backend
- frontend
- Section2Requirements.tsx
- p
- routes/admin.js
- mock-services.js
- stream.js
- scripts
- requestService.ts
- UrbanResQ — Database Documentation
- resources
- healthcheck
- Jt
- smoke-gap.js
- SpecLayout.tsx
- d
- routes/incidents.js
- smoke-live.js
- urbanresq_master.sql
- 2. Universal 9-Step Development Lifecycle
- supertest
- UrbanResQ — Backend Services & Database Engine
- 01_schema.sql
- vite
- UrbanResQ — Frontend Operations Cockpit
- i
- priorityScore.test.ts
- generate_pdf.js
- scripts
- Section9Security.tsx
- bi
- oi
- UrbanResQ — Entity Relationship Diagram
- express@^4.19.2
- @types/cors@^2.8.17
- @types/jsonwebtoken@^9.0.6
- @types/supertest@^7.2.1
- typescript@^5.5.3
- dependencies
- ui3.test.js
- scripts/detect_project.py
- Technology-Specific Diagnostic Checklists
- test_sync.js
- setup-db.sh
- run-full.sh
- run.sh
- exceljs
- pdfkit
- verify-end-to-end-login.js

## God Nodes (most connected - your core abstractions)
1. `react` - 70 edges
2. `query()` - 60 edges
3. `lucide-react` - 56 edges
4. `api()` - 54 edges
5. `esc()` - 53 edges
6. `$$` - 51 edges
7. `useFetch()` - 48 edges
8. `toast()` - 47 edges
9. `PageHeader()` - 46 edges
10. `Panel()` - 46 edges

## Surprising Connections (you probably didn't know these)
- `listAllocations()` --calls--> `query()`  [EXTRACTED]
  backend/src/services/allocationService.ts → backend/src/config/db.ts
- `listDisasters()` --calls--> `query()`  [EXTRACTED]
  backend/src/services/disasterService.ts → backend/src/config/db.ts
- `listRequests()` --calls--> `query()`  [EXTRACTED]
  backend/src/services/requestService.ts → backend/src/config/db.ts
- `upload` --calls--> `bad()`  [EXTRACTED]
  src/routes/attachments.js → src/util.js
- `updateAllocationStatus()` --calls--> `query()`  [EXTRACTED]
  backend/src/services/allocationService.ts → backend/src/config/db.ts

## Import Cycles
- None detected.

## Communities (104 total, 25 thin omitted)

### Community 0 - "react"
Cohesion: 0.05
Nodes (135): api, apiErrorMessage(), AllocationsPage, AnalyticsDashboard, AnalyticsPage, App(), AuditLogsPage, CitizenReportApp (+127 more)

### Community 1 - "api"
Cohesion: 0.11
Nodes (77): api(), apiBlob(), apiUpload(), can(), clearSession(), openStream(), setSession(), stopStream() (+69 more)

### Community 2 - "types.ts"
Cohesion: 0.06
Nodes (36): Section13Testing(), Section15Decisions(), Section16Bugs(), ArchitectureDoc, AuthSpec, BackendSpec, BugDefect, DatabaseSpec (+28 more)

### Community 3 - "query"
Cohesion: 0.08
Nodes (38): query(), getRequestsByCategory(), getRequestsBySeverity(), getRequestsByZone(), getResolutionRate(), getResourceConsumptionTrend(), getResponsePerformance(), listAuditLogs() (+30 more)

### Community 4 - "environment"
Cohesion: 0.06
Nodes (32): build, depends_on, environment, ports, restart, volumes, condition, environment (+24 more)

### Community 5 - "SpecApp.tsx"
Cohesion: 0.16
Nodes (19): useSpecWorkspace(), Section10Integrations(), Section11Workflows(), Section12Architecture(), Section14Deployment(), Section19VersionHistory(), Section1Overview(), Section3ProductSpec() (+11 more)

### Community 6 - "db.ts"
Cohesion: 0.15
Nodes (11): pool, DEMO_USERS, runAllocationPlan(), buildRecommendations(), getBaselineState(), runWhatIf(), SimulationScenario, test() (+3 more)

### Community 7 - "leaflet.js"
Cohesion: 0.09
Nodes (4): a(), Ci(), l(), x()

### Community 8 - "src/index.ts"
Cohesion: 0.12
Nodes (28): server, requireAuth(), errorHandler(), notFoundHandler(), generateSchema, router, loginLimiter, loginSchema (+20 more)

### Community 9 - "frontend/package.json"
Cohesion: 0.12
Nodes (23): devDependencies, autoprefixer@^10.4.20, postcss@^8.4.41, tailwindcss@^3.4.10, @types/leaflet@^1.9.12, @types/leaflet.heat@^0.2.5, @types/react@^18.3.3, @types/react-dom@^18.3.0 (+15 more)

### Community 10 - "auth.ts"
Cohesion: 0.20
Nodes (9): requireRole(), signToken(), DEMO_OPERATORS, login(), UserRow, AuthUser, Express, Request (+1 more)

### Community 11 - "src/auth.js"
Cohesion: 0.11
Nodes (16): app, cors, express, helmet, path, rateLimit, tileSrc, jwt (+8 more)

### Community 12 - "lib.js"
Cohesion: 0.18
Nodes (12): api(), tok(), until(), go(), launch(), login(), open(), os (+4 more)

### Community 13 - "scripts"
Cohesion: 0.10
Nodes (21): scripts, backup, backup:verify, build, build:backend, build:frontend, db:init, db:init:bare (+13 more)

### Community 14 - "dependencies"
Cohesion: 0.10
Nodes (20): dependencies, bcryptjs@^2.4.3, dotenv@^16.4.5, express-rate-limit@^7.4.0, helmet@^7.1.0, jsonwebtoken@^9.0.2, multer@^2.2.0, mysql2@^3.11.0 (+12 more)

### Community 15 - "bad"
Cohesion: 0.18
Nodes (15): status(), geo(), nonNeg(), router, coord(), lat(), lng(), router (+7 more)

### Community 16 - "UrbanResQ — Emergency Operations Center & Disaster Allocation System"
Cohesion: 0.11
Nodes (17): 1. Clone the Repository, 2. Environment Configuration, 3. Database Initialization, 4. Install Dependencies & Start Services, Architectural Diagram, Backend Services, Core Operational Modules, Design System & Accessibility (+9 more)

### Community 17 - "devDependencies"
Cohesion: 0.12
Nodes (17): devDependencies, jest@^29.7.0, ts-jest@^29.4.12, ts-node-dev@^2.0.0, @types/bcryptjs@^2.4.6, @types/jest@^30.0.0, @types/multer@^2.2.0, @types/node@^20.14.9 (+9 more)

### Community 18 - "4. Quality Assurance, Security & Operations"
Cohesion: 0.11
Nodes (18): 1. Software Architecture & Systems Design, 2. Full-Stack Development, 3. Product, UX & Design Standards, 4. Quality Assurance, Security & Operations, Accessibility Specialist, Application Security Engineer, Codebase Analyst, Database Architect (+10 more)

### Community 19 - "ref_path"
Cohesion: 0.20
Nodes (7): getUsers(), runSeed(), reloadProcs(), files, fs, mysql, path

### Community 20 - "util.js"
Cohesion: 0.23
Nodes (11): router, router, PRIORITY, router, STATUS, router, dateStr(), paging() (+3 more)

### Community 21 - "compilerOptions"
Cohesion: 0.13
Nodes (14): compilerOptions, declaration, esModuleInterop, forceConsistentCasingInFileNames, lib, module, outDir, resolveJsonModule (+6 more)

### Community 22 - "ref_path"
Cohesion: 0.19
Nodes (7): runSeed(), fs, path, puppeteer, fs, path, puppeteer

### Community 23 - "dependencies"
Cohesion: 0.12
Nodes (17): dependencies, axios@^1.7.4, leaflet@^1.9.4, leaflet.heat@^0.2.0, lucide-react@^0.436.0, react@^18.3.1, react-dom@^18.3.1, react-router-dom@^6.26.1 (+9 more)

### Community 24 - "DisasterMap.tsx"
Cohesion: 0.23
Nodes (11): react-leaflet@^4.2.1, createTacticalIcon(), DisasterMap(), getGlyphSvg(), MapFocusController(), MapMarker, MARKER_COLORS, HeatmapLayer() (+3 more)

### Community 25 - "storage.ts"
Cohesion: 0.32
Nodes (11): Section17PromptBuilder(), TARGET_ROLES, TASK_CATEGORIES, Section18ExportCenter(), exportAsJSON(), exportAsMarkdown(), exportBugsAsCSV(), exportDecisionsAsCSV() (+3 more)

### Community 26 - "compilerOptions"
Cohesion: 0.14
Nodes (13): compilerOptions, isolatedModules, jsx, lib, module, moduleResolution, noEmit, resolveJsonModule (+5 more)

### Community 27 - "backup.js"
Cohesion: 0.24
Nodes (10): conn(), DIR, dump(), env(), fs, mysqlRun(), path, restore() (+2 more)

### Community 28 - "ApiError"
Cohesion: 0.16
Nodes (15): getConnection(), listAllocations(), updateAllocationStatus(), createDisaster(), getDisasterById(), listDisasters(), updateDisasterStatus(), initTransporter() (+7 more)

### Community 29 - "context.tsx"
Cohesion: 0.24
Nodes (11): SaveStatus, SearchResultItem, SpecContext, SpecContextType, SpecWorkspaceProvider(), DEFAULT_WORKSPACE_STATE, createVersionRevision(), loadWorkspaceState() (+3 more)

### Community 30 - "devDependencies"
Cohesion: 0.29
Nodes (7): devDependencies, esbuild@^0.28.2, jsdom@^30.1.3, puppeteer-core@^25.16.0, @sparticuz/chromium@^153.0.0, esbuild, @sparticuz/chromium

### Community 31 - "setup.js"
Cohesion: 0.15
Nodes (9): args, crypto, ENV, fs, mysql, path, readline, root (+1 more)

### Community 32 - "allocations.js"
Cohesion: 0.27
Nodes (10): nodemailer, notify(), notifyLowStock(), sendExternal(), NEXT, router, STATUS, tell() (+2 more)

### Community 33 - "UrbanResQ Project Analysis & Redesign Strategy"
Cohesion: 0.17
Nodes (11): 10. Proposed Implementation Phases, 1. What the Product Does, 2. Who the Intended Users Are, 3. The Most Important User Journeys, 4. Existing Strengths, 5. Major UX Problems, 6. Major Visual Problems, 7. Technical Limitations (+3 more)

### Community 34 - "backend/package.json"
Cohesion: 0.18
Nodes (10): cors@^2.8.5, ts-node@^10.9.2, @types/express@^4.17.21, cors, name, private, type, version (+2 more)

### Community 35 - "docker-compose.prod.yml"
Cohesion: 0.18
Nodes (10): internal, driver, driver, networks, backend_internal, frontend_edge, services, version (+2 more)

### Community 36 - "jsdom"
Cohesion: 0.13
Nodes (9): jsdom, fs, { JSDOM }, session(), sleep(), fs, { JSDOM }, fs (+1 more)

### Community 37 - "F"
Cohesion: 0.24
Nodes (11): F(), G(), h(), j(), k(), ke(), me(), Oe() (+3 more)

### Community 38 - "docker-init.js"
Cohesion: 0.18
Nodes (7): mysql, path, { spawnSync }, { execFileSync }, files, path, root

### Community 39 - "attachments.js"
Cohesion: 0.18
Nodes (9): crypto, DIR, EXT, fs, multer, path, router, SIG (+1 more)

### Community 40 - "Workflow: /learn — Universal Project Intelligence & Autonomous Engineering"
Cohesion: 0.18
Nodes (10): Step 1 — Detect Project & Environment, Step 2 — Inspect Architecture & Data Flows, Step 3 — Build or Refresh Graphify Knowledge Graph, Step 4 — Diagnose Defects, Risks, and Functional Gaps, Step 5 — Prioritize & Plan Minimal Safe Fixes, Step 6 — Establish & Preserve Project Knowledge, Step 7 — Implement Root-Cause Solutions, Step 8 — Verify With Real Evidence (+2 more)

### Community 41 - "publicRoutes.ts"
Cohesion: 0.16
Nodes (12): publicCreateSchema, router, upload, createSchema, router, AIAssessmentResult, analyzeEmergencyImage(), emitUpdate() (+4 more)

### Community 42 - "environment"
Cohesion: 0.20
Nodes (10): environment, CLIENT_URL, DB_HOST, DB_NAME, DB_PASSWORD, DB_PORT, DB_USER, JWT_SECRET (+2 more)

### Community 43 - "mysql"
Cohesion: 0.20
Nodes (10): MYSQL_DATABASE, MYSQL_PASSWORD, MYSQL_ROOT_PASSWORD, MYSQL_USER, environment, image, networks, restart (+2 more)

### Community 44 - "e"
Cohesion: 0.27
Nodes (10): c(), e(), hi(), m(), q(), Qe(), ve(), xe() (+2 more)

### Community 45 - "backend"
Cohesion: 0.22
Nodes (9): build, depends_on, networks, restart, context, dockerfile, mysql, condition (+1 more)

### Community 46 - "frontend"
Cohesion: 0.22
Nodes (9): condition, backend, depends_on, image, networks, ports, restart, volumes (+1 more)

### Community 47 - "Section2Requirements.tsx"
Cohesion: 0.22
Nodes (8): ALL_CATEGORIES, ALL_PRIORITIES, ALL_STATUSES, Section2Requirements(), Requirement, RequirementCategory, RequirementPriority, RequirementStatus

### Community 48 - "p"
Cohesion: 0.22
Nodes (9): Ae(), be(), De(), ei(), Ie(), ii(), p(), pe() (+1 more)

### Community 49 - "routes/admin.js"
Cohesion: 0.25
Nodes (6): requireRole(), bcrypt, router, REPORTS, router, oneOf()

### Community 50 - "mock-services.js"
Cohesion: 0.20
Nodes (7): smtp-server@^3.19.22, smtp-server, http, mail, sms, { SMTPServer }, twilio

### Community 51 - "stream.js"
Cohesion: 0.32
Nodes (5): clients, emit(), refresh(), send(), topics

### Community 52 - "scripts"
Cohesion: 0.29
Nodes (7): scripts, build, db:seed:users, dev, start, test, test:integration

### Community 53 - "requestService.ts"
Cohesion: 0.38
Nodes (6): createRequest(), FALLBACK_REQUESTS, getRequestById(), listRequests(), RequestFilters, updateRequestStatus()

### Community 54 - "UrbanResQ — Database Documentation"
Cohesion: 0.29
Nodes (6): Files & run order, Indexing rationale, Known simplifications (documented, not hidden), Transaction isolation, UrbanResQ — Database Documentation, Why each advanced feature exists

### Community 55 - "resources"
Cohesion: 0.29
Nodes (7): deploy, resources, deploy, cpus, memory, deploy, limits

### Community 56 - "healthcheck"
Cohesion: 0.48
Nodes (7): healthcheck, interval, retries, start_period, test, timeout, healthcheck

### Community 57 - "Jt"
Cohesion: 0.29
Nodes (7): Jt(), Le(), O(), Qt(), Re(), $t(), te()

### Community 58 - "smoke-gap.js"
Cohesion: 0.33
Nodes (4): file(), PNG, sleep(), until()

### Community 59 - "SpecLayout.tsx"
Cohesion: 0.40
Nodes (4): SPEC_SECTIONS, ICON_MAP, SpecLayout(), SectionMeta

### Community 60 - "d"
Cohesion: 0.33
Nodes (6): at(), d(), ht(), Li(), v(), W()

### Community 61 - "routes/incidents.js"
Cohesion: 0.33
Nodes (5): KINDS, router, SEV, SORT, STATUS

### Community 63 - "urbanresq_master.sql"
Cohesion: 0.10
Nodes (39): alerts, audit_logs, disasters, emergency_requests, fn_request_priority_score(), hospital_admissions, hospitals, locations (+31 more)

### Community 64 - "2. Universal 9-Step Development Lifecycle"
Cohesion: 0.14
Nodes (13): 1. Professional Organization & Specialist Roles, 2. Universal 9-Step Development Lifecycle, 3. Persistent Rules for Every Future Request, STEP 1 — DETECT, STEP 2 — INSPECT, STEP 3 — ANALYZE (GRAPHIFY CODEBASE INTELLIGENCE), STEP 4 — DIAGNOSE, STEP 5 — PRIORITIZE (+5 more)

### Community 65 - "supertest"
Cohesion: 0.50
Nodes (3): supertest@^7.2.2, app, supertest

### Community 66 - "UrbanResQ — Backend Services & Database Engine"
Cohesion: 0.40
Nodes (4): Architecture, Directory Structure, Setup & Running, UrbanResQ — Backend Services & Database Engine

### Community 67 - "01_schema.sql"
Cohesion: 0.10
Nodes (38): allocation_items, allocations, areas, audit_logs, incident_attachments, incident_timeline, incidents, resource_categories (+30 more)

### Community 68 - "vite"
Cohesion: 0.40
Nodes (4): vite@^5.4.1, @vitejs/plugin-react@^4.3.1, vite, @vitejs/plugin-react

### Community 69 - "UrbanResQ — Frontend Operations Cockpit"
Cohesion: 0.40
Nodes (4): Architecture, Directory Structure, Setup & Running, UrbanResQ — Frontend Operations Cockpit

### Community 70 - "i"
Cohesion: 0.50
Nodes (5): i(), Mi(), ne(), e(), zi()

### Community 73 - "scripts"
Cohesion: 0.50
Nodes (4): scripts, build, dev, preview

### Community 74 - "Section9Security.tsx"
Cohesion: 0.50
Nodes (3): Section9Security(), SecurityRequirement, SecuritySeverity

### Community 75 - "bi"
Cohesion: 0.50
Nodes (4): bi(), Pi(), Ti(), u()

### Community 76 - "oi"
Cohesion: 0.67
Nodes (4): Je(), ni(), oi(), si()

### Community 86 - "dependencies"
Cohesion: 0.09
Nodes (30): dependencies, bcryptjs@^2.4.3, cors@^2.8.5, dotenv@^16.4.5, express@^4.19.2, express-rate-limit@^7.4.0, helmet@^7.1.0, jsonwebtoken@^9.0.2 (+22 more)

### Community 87 - "ui3.test.js"
Cohesion: 0.40
Nodes (4): fs, { JSDOM }, session(), sleep()

### Community 88 - "scripts/detect_project.py"
Cohesion: 0.32
Nodes (4): detect_project(), run_cmd(), detect_project(), run_cmd()

### Community 89 - "Technology-Specific Diagnostic Checklists"
Cohesion: 0.25
Nodes (7): 1. Web & Full-Stack Applications, 2. Backend APIs & Microservices, 3. Database & Persistence Layer, 4. CLI & Command-Line Tools, 5. AI / ML & Data Engineering Projects, 6. Systems & Compiled Software (Rust / Go / C++), Technology-Specific Diagnostic Checklists

### Community 103 - "verify-end-to-end-login.js"
Cohesion: 0.14
Nodes (8): puppeteer-core, SCREENSHOT_DIR, VIEWPORTS, edgePaths, executablePath, fs, path, puppeteer

## Knowledge Gaps
- **25 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `zod` connect `src/index.ts` to `publicRoutes.ts`, `backend/package.json`, `dependencies`?**
  _High betweenness centrality (0.024) - this node is a cross-community bridge._
- **Should `react` be split into smaller, more focused modules?**
  _Cohesion score 0.05256593014967926 - nodes in this community are weakly interconnected._
- **Why does `react` connect `react` to `types.ts`, `SpecApp.tsx`, `frontend/package.json`, `Section9Security.tsx`, `Section2Requirements.tsx`, `dependencies`, `DisasterMap.tsx`, `storage.ts`, `SpecLayout.tsx`, `context.tsx`?**
  _High betweenness centrality (0.023) - this node is a cross-community bridge._
- **Should `api` be split into smaller, more focused modules?**
  _Cohesion score 0.10835261939827477 - nodes in this community are weakly interconnected._
- **Why does `query()` connect `query` to `db.ts`, `src/index.ts`, `publicRoutes.ts`, `auth.ts`, `requestService.ts`, `ApiError`?**
  _High betweenness centrality (0.022) - this node is a cross-community bridge._
- **Should `types.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06153846153846154 - nodes in this community are weakly interconnected._
- **Should `query` be split into smaller, more focused modules?**
  _Cohesion score 0.07973421926910298 - nodes in this community are weakly interconnected._