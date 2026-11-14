// URBANRESQ — Authoritative Default Specification Data
// Derived from comprehensive source code audit, tests, SQL schemas, and architecture review

import { FullWorkspaceState } from "./types";

export const DEFAULT_WORKSPACE_STATE: FullWorkspaceState = {
  version: "1.0.0",
  lastUpdated: "2026-10-30T13:30:00Z",
  overview: {
    name: "UrbanResQ",
    description: "Enterprise Emergency Operations Center (EOC) & Real-Time Disaster Resource Allocation Platform featuring React 18, Three.js 3D WebGL, Node.js TypeScript, and MySQL 8.4 FIFO ACID allocation engine.",
    version: "v1.0.0",
    status: "Verified Active",
    deploymentStatus: "Local Development Verified (Node 24, Vite 5.4, Express TS, Jest 4 suites passing)",
    lastUpdated: "2026-10-30",
    objectives: [
      "Sub-second dispatch and allocation of critical emergency supplies (water, medical, food, fuel) during natural and human-induced disasters.",
      "Strict FIFO and ACID-guaranteed inventory reservation preventing double-allocation and orphaned supply requests.",
      "Real-time situational awareness across 7 command-and-control roles with live Leaflet geospatial mapping and Three.js 3D UAV reconnaissance.",
      "Cross-facility coordination spanning hospitals, emergency relief shelters, rescue squads, and volunteer fleets."
    ],
    problemStatement: "During catastrophic urban disasters (earthquakes, flash floods, industrial chemical releases), emergency response is crippled by fragmented spreadsheets, phantom inventory, double-allocated resources, and lack of verified field telemetry. UrbanResQ centralizes operational intelligence into a synchronized operations cockpit.",
    targetUsers: [
      "Emergency Operations Center (EOC) Directors & Command Staff",
      "Field Disaster Response Officers & Incident Commanders",
      "Logistics & Depots Resource Managers",
      "Medical Facility Triage Coordinators & Hospital Admins",
      "Search & Rescue (SAR) Squad Leaders",
      "Disaster Volunteers & Relief Organizations",
      "Public Citizens submitting emergency distress reports"
    ],
    useCases: [
      "Rapid triage and severity grading of mass-casualty disaster incidents",
      "Automated and manual algorithmic resource allocation using row-locked FIFO database procedures",
      "Live hospital emergency bed and ICU capacity tracking with diversion threshold alerts",
      "Emergency relief shelter occupancy management with strict overcapacity guards",
      "Dynamic rescue team dispatch with specialized skill matching (HAZMAT, water rescue, high-angle)",
      "Public distress beacon submission with automated geolocation capture and offline queueing"
    ],
    majorModules: [
      "Tactical Command Center (Cockpit)",
      "Incident & Disaster Lifecycle Tracker",
      "Emergency Request Intake & Triage",
      "FIFO Resource Allocation Engine",
      "Depot Inventory & Shortage Analytics",
      "Facility Capacity Monitor (Hospitals & Shelters)",
      "Personnel Coordination (Rescue Squads & Volunteers)",
      "UAV Drone Surveillance & 3D WebGL Reconnaissance",
      "Database Intelligence & Cryptographic Audit Ledger",
      "System Configuration & RBAC Management"
    ],
    frontendArch: "React 18.3, TypeScript 5.5, Vite 5.4, Tailwind CSS 3.4, React Router v6, Leaflet/React-Leaflet, Three.js WebGL, Recharts, Socket.IO Client.",
    backendArch: "Node.js 24, Express 4.x, TypeScript 5.5, Zod Schema Validation, JWT Authentication, Bcrypt Password Hashing, MySQL2 Connection Pool, Socket.IO Real-time Engine.",
    databaseTech: "MySQL 8.4 with InnoDB ACID storage, row-level locking (`FOR UPDATE`), 45 tables, 2 stored procedures, 9 triggers, and 10 analytical views.",
    externalIntegrations: [
      "OpenStreetMap & CartoDB Dark Matter tile services (Live)",
      "Socket.IO bi-directional WebSocket event stream (Live)",
      "Nodemailer with graceful offline fallback (Configured)",
      "Twilio SMS gateway (Simulated / Staged)",
      "OpenWeatherMap meteorological API (Configured)",
      "Three.js synthetic UAV sensor simulation (Live)"
    ],
    authModel: "Stateless JWT Bearer token with 24-hour expiration, bcrypt-hashed passwords (10 rounds), and role-based access control across 7 hierarchical roles.",
    securityArch: "Defensive perimeter featuring CORS whitelisting, HTTP security headers, Zod payload validation, parameterized SQL queries, and zero production credential leaks.",
    knownLimitations: [
      "Local MySQL service credentials require automated provisioning environment variable injection (.env).",
      "Root-level legacy JavaScript prototype (`server.js`) remains in repository alongside authoritative `backend/` TypeScript app.",
      "Drone WebGL feed currently uses synthetic procedural terrain simulation rather than live RTSP video stream.",
      "Audit log Merkle tree verification is simulated in frontend rather than computed via on-chain smart contract."
    ]
  },
  requirements: [
    {
      id: "REQ-001",
      title: "Strict FIFO Resource Allocation with Row-Level Locking",
      description: "Emergency inventory deductions must strictly follow First-In-First-Out by batch received date. Concurrent allocation requests for the same depot item must lock candidate rows using `SELECT ... FOR UPDATE` inside an ACID transaction to prevent negative stock and double-booking.",
      category: "Functional",
      priority: "Critical",
      source: "Core Architectural Goal & Stored Procedure sp_allocate_emergency_resources",
      acceptanceCriteria: "Concurrent threads requesting identical stock must either receive allocated batch IDs or fail with HTTP 409 / Stored Procedure error without partial commits.",
      dependencies: ["REQ-006", "REQ-012"],
      assignedRole: "RESOURCE_MANAGER",
      status: "Verified",
      verificationMethod: "Automated Jest unit and mocked transaction test in `backend/tests/allocationEngine.test.ts`",
      verificationEvidence: "PASS tests/allocationEngine.test.ts (15 tests passing, zero lock contention failures)",
      relatedFeature: "Resource Allocation Engine",
      relatedTestIds: ["TEST-001", "TEST-002"],
      relatedBugIds: [],
      createdAt: "2026-10-30",
      updatedAt: "2026-10-30"
    },
    {
      id: "REQ-002",
      title: "Role-Based Access Control (RBAC) Across 7 Defined Roles",
      description: "The system must restrict API routes and frontend views according to 7 user roles: ADMIN, EMERGENCY_MANAGER, RESOURCE_MANAGER, MEDICAL_COORDINATOR, RESCUE_COORDINATOR, DISASTER_OFFICER, and VIEWER.",
      category: "Security",
      priority: "Critical",
      source: "Security Policy & backend/src/middleware/auth.ts",
      acceptanceCriteria: "Users with insufficient roles must receive HTTP 403 Forbidden on the backend and an Access Denied barrier on the frontend.",
      dependencies: ["REQ-007"],
      assignedRole: "ADMIN",
      status: "Verified",
      verificationMethod: "Jest RBAC unit tests in `backend/tests/rbac.test.ts`",
      verificationEvidence: "PASS tests/rbac.test.ts (RBAC middleware rejects non-matching roles and permits matching roles)",
      relatedFeature: "User and Role Management",
      relatedTestIds: ["TEST-003", "TEST-004"],
      relatedBugIds: [],
      createdAt: "2026-10-30",
      updatedAt: "2026-10-30"
    },
    {
      id: "REQ-003",
      title: "Public Distress Beacon Submission Without Prior Login",
      description: "Citizens must be able to report emergency incidents anonymously or with basic contact details, automatically capturing geographic coordinates and photo uploads with size limits.",
      category: "Functional",
      priority: "High",
      source: "Citizen Emergency Portal & backend/src/routes/publicRoutes.ts",
      acceptanceCriteria: "Public requests must validate payload, restrict photo uploads to under 10MB, and return a unique tracking request number.",
      dependencies: [],
      assignedRole: "DISASTER_OFFICER",
      status: "Verified",
      verificationMethod: "Route validation tests in `backend/tests/errorHandlerAndRoutes.test.ts`",
      verificationEvidence: "PASS tests/errorHandlerAndRoutes.test.ts (Public distress report rejects invalid location coordinates and empty descriptions)",
      relatedFeature: "Citizen Report App",
      relatedTestIds: ["TEST-005"],
      relatedBugIds: ["BUG-005"],
      createdAt: "2026-10-30",
      updatedAt: "2026-10-30"
    },
    {
      id: "REQ-004",
      title: "Mobile-First Responsive Command Interface (375px to 1280px+)",
      description: "All tactical views, forms, data tables, and modal dialogs must render seamlessly on 375px mobile phones, 768px tablets, and 1280px+ desktop monitors without horizontal overflow or clipped controls.",
      category: "UI/UX",
      priority: "Critical",
      source: "Global Development Standards",
      acceptanceCriteria: "Viewport tests at 375x667, 768x1024, and 1280x800 must pass with zero horizontal scrollbar and minimum 44px touch targets.",
      dependencies: [],
      assignedRole: "UI/UX Designer",
      status: "Verified",
      verificationMethod: "Headless Microsoft Edge automated viewport test suite `test/browser/verify-viewports.js`",
      verificationEvidence: "Zero page errors, all 3 viewports rendered cleanly and captured to artifacts screenshot-mobile-375.png, screenshot-tablet-768.png, screenshot-desktop-1280.png",
      relatedFeature: "All Primary Views",
      relatedTestIds: ["TEST-006", "TEST-007"],
      relatedBugIds: ["BUG-004"],
      createdAt: "2026-10-30",
      updatedAt: "2026-10-30"
    },
    {
      id: "REQ-005",
      title: "Hospital & ICU Bed Capacity Overflow Prevention",
      description: "Hospital management module must track total operational beds vs available ICU and emergency beds. Admissions exceeding 100% capacity must trigger visual amber/red triage warnings and route alerts.",
      category: "Functional",
      priority: "High",
      source: "Facility Operations Spec",
      acceptanceCriteria: "Hospital records with available_beds <= 0 must display critical diversion badges and block uncoordinated patient transfers.",
      dependencies: ["REQ-002"],
      assignedRole: "MEDICAL_COORDINATOR",
      status: "Implemented",
      verificationMethod: "Frontend component inspection and backend facilityService unit check",
      verificationEvidence: "Verified in `frontend/src/pages/HospitalsPage.tsx` and `backend/src/services/facilityService.ts`",
      relatedFeature: "Hospital and ER Capacity",
      relatedTestIds: ["TEST-008"],
      relatedBugIds: [],
      createdAt: "2026-10-30",
      updatedAt: "2026-10-30"
    },
    {
      id: "REQ-006",
      title: "ACID Database Transactional Integrity",
      description: "All multi-table mutations (such as creating an allocation, decrementing depot batches, and updating request status) must execute within an explicit MySQL transaction with immediate rollback on any error.",
      category: "Database",
      priority: "Critical",
      source: "Database Engineering Standard",
      acceptanceCriteria: "If an allocation step fails midway, no rows in `allocation_batches` may be created and depot inventory count must remain unaltered.",
      dependencies: [],
      assignedRole: "Database Architect",
      status: "Verified",
      verificationMethod: "Transaction failure and rollback test in `backend/tests/allocationEngine.test.ts`",
      verificationEvidence: "Verified: Mock transaction rollback invoked properly upon simulated DB insertion exception.",
      relatedFeature: "Database Layer",
      relatedTestIds: ["TEST-002"],
      relatedBugIds: [],
      createdAt: "2026-10-30",
      updatedAt: "2026-10-30"
    },
    {
      id: "REQ-007",
      title: "Standardized Error Handling with Typed ApiError Class",
      description: "Backend controllers and services must not throw raw untyped Error objects. All errors must use `ApiError` with appropriate HTTP status codes and Zod validation error formatting.",
      category: "Non-functional",
      priority: "Medium",
      source: "Codebase Reliability Audit",
      acceptanceCriteria: "Invalid requests return standardized JSON payload `{ success: false, error: string, statusCode: number, details?: any }` with appropriate status code.",
      dependencies: [],
      assignedRole: "Backend Engineer",
      status: "Verified",
      verificationMethod: "Automated route and middleware tests in `backend/tests/errorHandlerAndRoutes.test.ts`",
      verificationEvidence: "Verified: errorHandler middleware transforms ZodError to HTTP 400 and unhandled errors to HTTP 500.",
      relatedFeature: "Error Handling Middleware",
      relatedTestIds: ["TEST-009"],
      relatedBugIds: ["BUG-001", "BUG-002"],
      createdAt: "2026-10-30",
      updatedAt: "2026-10-30"
    },
    {
      id: "REQ-008",
      title: "Real-Time WebSocket Incident & Allocation Broadcasting",
      description: "When a new disaster is declared or emergency supplies are allocated, the backend must emit real-time Socket.IO events to connected EOC operator browsers without polling.",
      category: "Integration",
      priority: "Medium",
      source: "Operations Cockpit Spec",
      acceptanceCriteria: "Frontend Socket hook listens for `DISASTER_CREATED` and `ALLOCATION_CONFIRMED` events, automatically refreshing reactive counters.",
      dependencies: ["REQ-001"],
      assignedRole: "EMERGENCY_MANAGER",
      status: "Implemented",
      verificationMethod: "Source code verification of `backend/src/server.ts` and `frontend/src/hooks/useSocket.ts`",
      verificationEvidence: "Socket.IO server mounted on backend with CORS configured for frontend client.",
      relatedFeature: "Real-Time Communication",
      relatedTestIds: ["TEST-010"],
      relatedBugIds: [],
      createdAt: "2026-10-30",
      updatedAt: "2026-10-30"
    },
    {
      id: "REQ-009",
      title: "Shelter Occupancy & Capacity Enforcement",
      description: "Relief shelter manager must verify capacity limits and prevent check-in when shelter occupancy reaches 100% capacity.",
      category: "Functional",
      priority: "High",
      source: "Facility Operations Spec",
      acceptanceCriteria: "Check-in buttons must disable when `current_occupancy >= max_capacity` and status badge must switch to FULL.",
      dependencies: ["REQ-002"],
      assignedRole: "MEDICAL_COORDINATOR",
      status: "Implemented",
      verificationMethod: "Frontend inspection of `frontend/src/pages/SheltersPage.tsx`",
      verificationEvidence: "Verified: SheltersPage computes remaining capacity and visually marks full shelters.",
      relatedFeature: "Shelter Capacity and Occupancy",
      relatedTestIds: ["TEST-011"],
      relatedBugIds: [],
      createdAt: "2026-10-30",
      updatedAt: "2026-10-30"
    },
    {
      id: "REQ-010",
      title: "Accessible Color Contrast & Reduced Motion Support",
      description: "All UI components must meet WCAG 2.2 AA color contrast ratios (minimum 4.5:1 for normal text) and respect `prefers-reduced-motion` media queries.",
      category: "Accessibility",
      priority: "High",
      source: "Global Development Standards",
      acceptanceCriteria: "Reduced motion preference disables continuous radar rotation, spinning indicators, and large viewport transitions.",
      dependencies: [],
      assignedRole: "Accessibility Specialist",
      status: "Verified",
      verificationMethod: "CSS and component audits in `CitizenReportApp.tsx` and `index.css`",
      verificationEvidence: "Verified: `@media (prefers-reduced-motion: reduce)` rules implemented across animated components.",
      relatedFeature: "Design System & UI",
      relatedTestIds: ["TEST-012"],
      relatedBugIds: ["BUG-007"],
      createdAt: "2026-10-30",
      updatedAt: "2026-10-30"
    },
    {
      id: "REQ-011",
      title: "Offline Graceful Fallback for Notification Dispatch",
      description: "If SMTP or SMS transport is offline or credentials are not configured, the notification service must log the attempt gracefully rather than crashing the HTTP request thread.",
      category: "Non-functional",
      priority: "Medium",
      source: "Service Reliability Audit",
      acceptanceCriteria: "Emails sent without live SMTP configuration log a simulated message and resolve successfully without throwing uncaught exceptions.",
      dependencies: [],
      assignedRole: "Backend Engineer",
      status: "Verified",
      verificationMethod: "Unit verification of `backend/src/services/emailService.ts`",
      verificationEvidence: "Verified: `sendEmail` wraps transporter in try/catch and logs fallback warning.",
      relatedFeature: "Notification System",
      relatedTestIds: ["TEST-013"],
      relatedBugIds: ["BUG-003"],
      createdAt: "2026-10-30",
      updatedAt: "2026-10-30"
    },
    {
      id: "REQ-012",
      title: "Audit Logging of All Sensitive Administrative Actions",
      description: "Every disaster status change, resource allocation, and permission alteration must append an immutable audit log entry capturing user ID, IP address, timestamp, and action delta.",
      category: "Security",
      priority: "High",
      source: "Security Register SEC-007",
      acceptanceCriteria: "Audit log table receives entries upon sensitive operations and prevents unprivileged deletion.",
      dependencies: ["REQ-002"],
      assignedRole: "ADMIN",
      status: "Implemented",
      verificationMethod: "Schema inspection in `database/schema.sql` (table `audit_logs`) and `AuditLogsPage.tsx`",
      verificationEvidence: "Audit logs table created with foreign key to users and indexed by timestamp.",
      relatedFeature: "Audit Logs",
      relatedTestIds: ["TEST-014"],
      relatedBugIds: ["BUG-006"],
      createdAt: "2026-10-30",
      updatedAt: "2026-10-30"
    }
  ],
  productSpec: {
    vision: "To provide the world's most reliable, deterministic, and rapid emergency operations command platform, ensuring zero lives or relief supplies are lost due to coordination latency or database allocation collisions.",
    problemStatement: "In high-stress disaster response environments, existing systems suffer from split-brain data, ghost inventories, manual triage bottlenecks, and inaccessible desktop-only portals. UrbanResQ unifies field reporting, inventory logistics, and spatial command into one high-integrity workspace.",
    goals: [
      "Achieve sub-5-second end-to-end triage to dispatch latency for top-tier emergency requests.",
      "Enforce mathematical FIFO allocation eliminating expired goods and phantom reservations.",
      "Guarantee 100% operational uptime on intermittent field connections through responsive web architecture.",
      "Provide complete auditability for disaster after-action reviews."
    ],
    outOfScope: [
      "Real-time satellite weapon guidance or military warfare integration.",
      "Direct automatic financial bank transfers or municipal payroll processing.",
      "Consumer ride-hailing services for non-emergency public transportation."
    ],
    targetUsers: [
      "EOC Commanders",
      "Disaster Logistics Officers",
      "Field Search & Rescue Personnel",
      "Hospital Triage Coordinators",
      "Relief Shelter Operators",
      "Distressed Citizens"
    ],
    personas: [
      {
        name: "Commander Sarah Jenkins",
        role: "Emergency Operations Director",
        needs: "High-level real-time overview of active casualty zones, depleted depots, and hospital ER divert statuses.",
        painPoints: "Slow dashboard refreshes, lack of real-time multi-agency coordination, unverified field rumors."
      },
      {
        name: "David Chen",
        role: "Logistics Resource Coordinator",
        needs: "Deterministic inventory tracking, automated FIFO dispatch, shortage warnings before zero-stock crises.",
        painPoints: "Double-allocation of scarce antibiotics, expired rations, manual phone calls to regional warehouses."
      },
      {
        name: "Dr. Elena Rostova",
        role: "Hospital Chief Medical Officer",
        needs: "Immediate notice of incoming mass casualties, automated ICU bed counts, transfer routing.",
        painPoints: "Ambulances arriving at full ERs, lack of blood supply visibility, out-of-date bed status."
      }
    ],
    journeys: [
      {
        title: "Flash Flood Disaster Response Journey",
        actor: "Disaster Officer & Resource Manager",
        steps: [
          "Citizen submits distress report via public portal with GPS pin.",
          "Disaster Officer reviews incoming queue, verifies flood severity, and promotes report to declared Disaster.",
          "System triggers automated resource suggestion for 500 potable water kits and 2 zodiac rescue teams.",
          "Resource Manager authorizes allocation; MySQL stored procedure locks inventory batches using FIFO.",
          "Rescue coordinator receives dispatch alert, assigns rescue squad Alpha-1, and navigates via spatial route.",
          "Hospital coordinator confirms trauma readiness as victims are safely evacuated."
        ]
      }
    ],
    useCases: [
      {
        id: "UC-01",
        name: "Emergency Resource Allocation",
        actor: "Resource Manager",
        trigger: "High-priority emergency request validated by triage team",
        flow: [
          "Operator clicks Allocate on Request Detail page.",
          "Backend checks depot inventories with available quantity > 0.",
          "Stored procedure executes row-level locked selection of earliest dated batch.",
          "Allocation record created, stock deducted, request status set to 'Allocated'.",
          "Notification dispatched to dispatch depot and requester."
        ]
      }
    ],
    functionalScope: [
      "Incident logging and severity classification (Low, Medium, High, Critical)",
      "Automated and manual priority score calculation based on casualties, vulnerability, and response time",
      "Depot inventory batch tracking with receipt dates, expiry dates, and depot locations",
      "Hospital ER and ICU capacity monitoring with live occupancy metrics",
      "Relief shelter tracking with capacity limits and supplies requirements",
      "Vehicle fleet dispatch and maintenance tracking",
      "Rescue team skill tagging (Water rescue, K9, Hazmat, Medical)",
      "Public distress beacon submission with automated address reverse-geocoding"
    ],
    nonFunctionalScope: [
      "Sub-200ms API response time for read queries under 500 concurrent users",
      "Zero data loss via ACID transactions and InnoDB write-ahead logs",
      "Responsive rendering across mobile (375px), tablet (768px), and desktop (1280px+)",
      "Adherence to WCAG 2.2 AA accessibility guidelines",
      "Strict RBAC enforcement across all protected REST endpoints"
    ],
    businessConstraints: [
      "Must operate using open-source, non-proprietary software libraries (React, Node, MySQL).",
      "Must remain fully operable offline in simulated mode if external third-party APIs (weather, SMS) are unavailable."
    ],
    operationalConstraints: [
      "Field teams frequently operate over high-latency cellular connections (2G/3G speeds).",
      "Screen readability in high-glare outdoor environments requires strong contrast ratios."
    ],
    assumptions: [
      "Node.js runtime environment has network access to MySQL database on port 3306.",
      "Emergency operators have modern web browsers supporting ES2022 and WebGL."
    ],
    dependencies: [
      "MySQL 8.4 database server",
      "Node.js runtime v18+"
    ],
    successMetrics: [
      "Zero duplicate resource allocations in production",
      "Average incident triage completion under 60 seconds",
      "100% test pass rate across core allocation and RBAC suites"
    ],
    futureEnhancements: [
      "Native mobile app with offline SQLite sync and peer-to-peer Bluetooth mesh networking",
      "Direct RTSP / WebRTC hardware drone video stream ingestion",
      "Autonomous AI dispatch optimization with traffic-aware routing"
    ],
    capabilities: [
      {
        id: 1,
        name: "Emergency Operations Command Center",
        status: "Implemented",
        description: "Unified tactical dashboard providing live disaster counts, casualty summaries, critical resource gauges, and spatial incident density map.",
        keyFeatures: ["Real-time KPI metric cards", "Live mission clock (Local + UTC)", "Interactive Leaflet geospatial incident map", "High-priority alert ticker"],
        dependencies: ["Leaflet", "Socket.IO"],
        dataSources: ["/api/dashboard/stats", "/api/disasters"],
        uiRoute: "/command-center",
        backendRoutes: ["GET /api/dashboard/summary", "GET /api/disasters/active"]
      },
      {
        id: 2,
        name: "Disaster & Incident Management",
        status: "Implemented",
        description: "End-to-end incident declaration, status tracking, severity escalation, and post-disaster resolution.",
        keyFeatures: ["Multi-stage status workflow (Declared -> Active -> Contained -> Closed)", "Severity classification (1-4)", "Casualty and displaced person counts", "Affected perimeter mapping"],
        dependencies: ["Disaster Service", "Geocoding"],
        dataSources: ["/api/disasters"],
        uiRoute: "/disasters",
        backendRoutes: ["GET /api/disasters", "POST /api/disasters", "PUT /api/disasters/:id"]
      },
      {
        id: 3,
        name: "Emergency Request Management",
        status: "Implemented",
        description: "Intake and triage of civilian and field responder requests for food, medical aid, rescue squads, and evacuation.",
        keyFeatures: ["Priority score calculation", "Triage status transitions", "Direct linkage to disaster incidents", "One-click allocation trigger"],
        dependencies: ["Request Service", "Priority Calculator"],
        dataSources: ["/api/requests"],
        uiRoute: "/emergency-requests",
        backendRoutes: ["GET /api/requests", "POST /api/requests", "PUT /api/requests/:id"]
      },
      {
        id: 4,
        name: "Resource Allocation Engine",
        status: "Implemented",
        description: "Algorithmic and manual allocation of depot inventory with strict FIFO ordering and database row locking.",
        keyFeatures: ["FIFO batch selection", "Atomic ACID transaction rollback", "Batch reservation audit records", "Allocation dispatch slips"],
        dependencies: ["MySQL Stored Procedure sp_allocate_emergency_resources"],
        dataSources: ["/api/allocations"],
        uiRoute: "/allocations",
        backendRoutes: ["GET /api/allocations", "POST /api/allocations"]
      },
      {
        id: 5,
        name: "Inventory & Depot Management",
        status: "Implemented",
        description: "Multi-depot stock monitoring, batch receipt dates, expiration tracking, and replenishment alerts.",
        keyFeatures: ["Depot location breakdown", "Stock level gauges", "Expiry warning highlights", "Batch receipt logging"],
        dependencies: ["Resource Service"],
        dataSources: ["/api/inventory", "/api/resources"],
        uiRoute: "/inventory",
        backendRoutes: ["GET /api/inventory", "POST /api/inventory"]
      },
      {
        id: 6,
        name: "Hospital & Emergency-Room Capacity",
        status: "Implemented",
        description: "Hospital triage monitoring covering standard beds, ICU units, blood supply levels, and ambulance diversion status.",
        keyFeatures: ["Bed occupancy percentage", "Diversion state indicator", "Trauma center level ratings", "Emergency contact registry"],
        dependencies: ["Facility Service"],
        dataSources: ["/api/facilities/hospitals"],
        uiRoute: "/hospitals",
        backendRoutes: ["GET /api/facilities/hospitals", "PUT /api/facilities/hospitals/:id/capacity"]
      },
      {
        id: 7,
        name: "Shelter Capacity & Occupancy",
        status: "Implemented",
        description: "Relief camp registration, capacity enforcement, family check-in/out, and special-needs supply tracking.",
        keyFeatures: ["Strict overcapacity guards", "Pet-friendly / ADA compliance tags", "Meals and bedding inventory tracking"],
        dependencies: ["Facility Service"],
        dataSources: ["/api/facilities/shelters"],
        uiRoute: "/shelters",
        backendRoutes: ["GET /api/facilities/shelters", "PUT /api/facilities/shelters/:id"]
      },
      {
        id: 8,
        name: "Rescue Team Coordination",
        status: "Implemented",
        description: "Search and rescue unit roster, equipment readiness, deployment assignments, and live radio status.",
        keyFeatures: ["Team skill matrices (HAZMAT, Swiftwater, Urban SAR)", "Team size & equipment readiness", "Mission dispatch logs"],
        dependencies: ["Rescue Service"],
        dataSources: ["/api/rescue-teams"],
        uiRoute: "/rescue-teams",
        backendRoutes: ["GET /api/rescue-teams", "POST /api/rescue-teams/dispatch"]
      },
      {
        id: 9,
        name: "Volunteer Management",
        status: "Implemented",
        description: "Community volunteer registry, skill certification verification, availability tracking, and emergency shift assignment.",
        keyFeatures: ["Volunteer status toggle", "Skill indexing", "Background check flag", "Emergency roster activation"],
        dependencies: ["Volunteer Service"],
        dataSources: ["/api/volunteers"],
        uiRoute: "/volunteers",
        backendRoutes: ["GET /api/volunteers", "POST /api/volunteers"]
      },
      {
        id: 10,
        name: "Vehicle Management",
        status: "Implemented",
        description: "Specialized vehicle fleet tracking (ambulances, 4x4 trucks, water tenders, zodiac boats) with maintenance schedules.",
        keyFeatures: ["Fleet readiness status", "Fuel capacity metrics", "Vehicle assignment to rescue squads", "GPS tracker linkage"],
        dependencies: ["Vehicle Service"],
        dataSources: ["/api/vehicles"],
        uiRoute: "/vehicles",
        backendRoutes: ["GET /api/vehicles", "PUT /api/vehicles/:id"]
      },
      {
        id: 11,
        name: "Drone Surveillance Interface",
        status: "Simulated",
        description: "3D WebGL tactical reconnaissance cockpit simulating UAV thermal cameras, hazard detection, and flight coordinates.",
        keyFeatures: ["Three.js 3D terrain rendering", "Synthetic telemetry HUD (Altitude, Battery, Waypoints)", "Thermal color palette simulation", "Waypoint patrol routing"],
        dependencies: ["Three.js"],
        dataSources: ["Synthetic Generator"],
        uiRoute: "/drone-feed",
        backendRoutes: ["GET /api/drones/telemetry (Simulated)"]
      },
      {
        id: 12,
        name: "Maps & Geospatial Visualization",
        status: "Implemented",
        description: "Interactive Leaflet mapping layer displaying disaster perimeters, hospital pins, resource depots, and vehicle breadcrumbs.",
        keyFeatures: ["CartoDB dark-matter tile layers", "Custom SVG status markers", "Disaster radius circles", "Heatmap clustering"],
        dependencies: ["Leaflet", "React-Leaflet"],
        dataSources: ["/api/disasters", "/api/facilities"],
        uiRoute: "/command-center",
        backendRoutes: ["GET /api/map/layers"]
      },
      {
        id: 13,
        name: "Analytics & Reports",
        status: "Implemented",
        description: "Historical trend charts, resource depletion velocity graphs, casualty curves, and printable after-action reports.",
        keyFeatures: ["Recharts time-series data", "Allocation velocity metrics", "CSV and PDF report generator", "Date range filters"],
        dependencies: ["Recharts"],
        dataSources: ["/api/analytics"],
        uiRoute: "/analytics",
        backendRoutes: ["GET /api/analytics/resource-burn", "GET /api/analytics/casualty-curve"]
      },
      {
        id: 14,
        name: "Audit Logs",
        status: "Implemented",
        description: "Tamper-evident audit ledger recording every user authentication, permission change, allocation authorization, and disaster modification.",
        keyFeatures: ["Chronological event listing", "Actor IP address & user agent", "Before / After delta inspection", "Exportable compliance log"],
        dependencies: ["Audit Service"],
        dataSources: ["/api/audit-logs"],
        uiRoute: "/audit-logs",
        backendRoutes: ["GET /api/audit-logs"]
      },
      {
        id: 15,
        name: "User & Role Management",
        status: "Implemented",
        description: "Administrative console for managing command staff credentials, assigning RBAC permissions, and auditing active sessions.",
        keyFeatures: ["7-tier role assignment", "Password reset & rotation", "Account active/suspended toggle", "Staff directory"],
        dependencies: ["Auth Service"],
        dataSources: ["/api/users"],
        uiRoute: "/settings",
        backendRoutes: ["GET /api/users", "POST /api/users", "PUT /api/users/:id"]
      },
      {
        id: 16,
        name: "System Configuration",
        status: "Implemented",
        description: "Environment controls, Defcon status banner, alert thresholds, webhook integrations, and database maintenance tools.",
        keyFeatures: ["Defcon threat-level switcher (1-5)", "SMTP and SMS gateway tester", "Database backup trigger", "Cache flushing"],
        dependencies: ["Config Service"],
        dataSources: ["/api/settings"],
        uiRoute: "/settings",
        backendRoutes: ["GET /api/settings", "PUT /api/settings"]
      }
    ]
  },
  uiuxSpec: {
    designPrinciples: [
      "Clarity Over Decoration: Prioritize operational legibility and high contrast over aesthetic flourishes.",
      "Deterministic State: Never show ambiguous loading spinners without clear textual status.",
      "Accessible by Default: Meet WCAG 2.2 AA contrast standards with full keyboard focus indicators.",
      "Responsive Fluidity: Uncompromising usability on 375px mobile, 768px tablet, and 1280px+ desktop.",
      "Zero Visual Noise: No floating decorative blobs, excessive neon glows, or gratuitous parallax."
    ],
    colorPalette: [
      { token: "eoc-bg", hex: "#0B0F19", role: "Primary Application Canvas", contrastRatio: "14.2:1 against white text" },
      { token: "eoc-surface", hex: "#111827", role: "Cards, Sidebars, and Dialog Panels", contrastRatio: "11.8:1 against white text" },
      { token: "eoc-border", hex: "#1F2937", role: "Dividers, Card Borders, Input Outlines", contrastRatio: "3.2:1 against canvas" },
      { token: "eoc-accent", hex: "#06B6D4", role: "Primary Interactive Cyan Accent", contrastRatio: "5.1:1 against dark surface" },
      { token: "eoc-critical", hex: "#EF4444", role: "Defcon 1, Severe Disasters, Shortages", contrastRatio: "4.8:1 against dark surface" },
      { token: "eoc-warning", hex: "#F59E0B", role: "Pending Triage, Moderate Alerts", contrastRatio: "6.2:1 against dark surface" },
      { token: "eoc-success", hex: "#10B981", role: "Contained Incidents, Verified Stock", contrastRatio: "5.4:1 against dark surface" },
      { token: "eoc-text", hex: "#F9FAFB", role: "Primary Text Content", contrastRatio: "16.1:1 against background" },
      { token: "eoc-muted", hex: "#9CA3AF", role: "Secondary Labels and Timestamps", contrastRatio: "7.2:1 against background" }
    ],
    typography: [
      { element: "Display Headers (H1)", font: "Inter / Space Grotesk", size: "24px - 32px", weight: "700 Bold" },
      { element: "Section Titles (H2)", font: "Inter", size: "18px - 22px", weight: "600 SemiBold" },
      { element: "Card Headers (H3)", font: "Inter", size: "15px - 16px", weight: "600 SemiBold" },
      { element: "Body Copy", font: "Inter", size: "13px - 14px", weight: "400 Regular" },
      { element: "Data Tables & Metrics", font: "JetBrains Mono / monospace", size: "12px - 13px", weight: "500 Medium Tabular" },
      { element: "Micro Badges & Timestamps", font: "Inter", size: "10px - 11px", weight: "600 SemiBold" }
    ],
    spacing: [
      "Compact 4px (0.25rem) baseline scale",
      "Inputs & Buttons: 8px vertical padding, 14px horizontal padding (minimum 44px touch target height)",
      "Card Padding: 16px on mobile, 20px on desktop",
      "Grid Gap: 12px - 16px across metric cards"
    ],
    layoutGrid: "CSS Grid with responsive auto-fit columns (`grid-cols-1 md:grid-cols-2 lg:grid-cols-4`). Fluid flexbox containers with explicit gap utilities.",
    navigationRules: [
      "Structured left-hand sidebar with grouped operational categories",
      "One-click collapsing for smaller viewports with mobile sliding drawer",
      "Breadcrumb hierarchy at top of sub-pages (e.g. Disasters > Disaster #102 Detail)",
      "Global command palette accessible via Ctrl+K / Cmd+K",
      "Direct role-switching dropdown in header for rapid simulation and audit verification"
    ],
    componentStandards: [
      { component: "Buttons", rules: "Minimum 44px tap area on mobile. Visible focus ring on keyboard tab. Disabled state shows reduced opacity (0.5) and cursor-not-allowed." },
      { component: "Data Tables", rules: "Horizontal scroll container with sticky column header. Alternating row tint. Numeric columns aligned right with monospace fonts." },
      { component: "Modal Dialogs", rules: "Escape key dismisses. Focus trapped inside dialog while open. Backdrop click dismisses non-destructive dialogs." },
      { component: "Form Inputs", rules: "Explicit label above input. Red border and inline error text upon invalid entry. Clear autocomplete attributes." }
    ],
    tableBehavior: [
      "Column sorting with visible asc/desc caret indicators",
      "Pagination controls with current page / total records readout",
      "Row hover highlighting without layout shift",
      "Responsive card fallback on screens narrower than 480px"
    ],
    formValidation: [
      "Client-side validation using standard HTML5 and React state before submission",
      "Backend Zod schema errors mapped directly to form field error tags",
      "Submit buttons show active loading spinner and prevent duplicate submissions"
    ],
    modalBehavior: [
      "Strict backdrop blur overlay with keyboard focus trap",
      "Confirmation dialog for destructive actions (Delete, Close Incident, Rollback)",
      "Scroll locked on background body element while open"
    ],
    notificationBehavior: [
      "Non-intrusive toast notification stacked in bottom-right corner",
      "Auto-dismiss after 4 seconds for success/info; manual dismiss for critical errors",
      "Live auditory ding for Defcon 1 or mass casualty alerts (toggleable)"
    ],
    loadingStates: [
      "Skeleton pulse placeholders matching exact dimensions of upcoming content",
      "Minimal non-janky spinner for route-level page transitions",
      "Disabled button state with embedded SVG spinner during API requests"
    ],
    emptyStates: [
      "Clear informative icon and explanatory sentence",
      "Actionable primary button to create or reset filters (e.g. 'No active requests matching filter — Clear Filters')"
    ],
    errorStates: [
      "Standardized error boundary catching uncaught component rendering failures",
      "Clear human-readable error descriptions with retry button and error code"
    ],
    responsiveBreakpoints: [
      { name: "Mobile", width: "375px - 639px", rules: "Single column layout. Full-width cards. Drawer navigation. 44px touch targets. Sticky action buttons." },
      { name: "Tablet", width: "640px - 1023px", rules: "Two column grid. Collapsed icon-only sidebar option. Horizontal scrolling tables." },
      { name: "Desktop", width: "1024px - 1439px", rules: "Full expanded sidebar. Four-column metric grids. Side-by-side map and telemetry panels." },
      { name: "Ultra-Wide", width: "1440px+", rules: "Max container constraint or expanded spatial viewports for EOC command video walls." }
    ],
    accessibility: [
      "WCAG 2.2 AA compliant contrast ratios throughout all dark-mode and light-mode tokens",
      "Visible cyan focus ring on all interactive elements (`focus-visible:ring-2 focus-visible:ring-cyan-500`)",
      "Screen-reader semantic HTML (`<main>`, `<nav>`, `<header>`, `<section>`, `aria-live` for ticker)",
      "Full support for `prefers-reduced-motion` media query"
    ],
    mapInteractions: [
      "Zoom and pan controls positioned away from bottom command bars",
      "Clicking disaster pin opens rich popup with severity, casualty count, and link to detail",
      "Cluster markers expand smoothly upon click"
    ],
    pageSpecs: [
      {
        page: "Command Center Cockpit",
        route: "/command-center",
        components: ["DefconBanner", "LiveTicker", "MetricCards", "DisasterMap", "RecentIncidentsFeed"],
        responsiveRules: "Stacks vertically on mobile; 60/40 map/feed split on desktop.",
        validation: "Live Socket connection indicator."
      },
      {
        page: "Citizen Report App",
        route: "/report",
        components: ["IncidentTypeSelector", "LocationPinPicker", "PhotoUploadInput", "ContactDetailsForm"],
        responsiveRules: "Optimized for one-handed mobile emergency submission at 375px.",
        validation: "Requires valid description and geographic latitude/longitude."
      }
    ]
  },
  frontendSpec: {
    technologies: [
      { name: "React", version: "18.3.1", role: "Declarative UI component architecture with hooks" },
      { name: "TypeScript", version: "5.5.3", role: "Static type checking and interface contracts" },
      { name: "Vite", version: "5.4.1", role: "Lightning-fast build tool and local development HMR server" },
      { name: "Tailwind CSS", version: "3.4.10", role: "Utility-first design token styling engine" },
      { name: "React Router DOM", version: "6.26.1", role: "Client-side declarative routing and protected route guards" },
      { name: "Axios", version: "1.7.4", role: "HTTP client with JWT request interceptors" },
      { name: "Leaflet & React-Leaflet", version: "1.9.4 / 4.2.1", role: "Interactive geospatial mapping and marker layers" },
      { name: "Three.js", version: "0.186.1", role: "Hardware-accelerated 3D WebGL UAV simulation" },
      { name: "Recharts", version: "2.15.4", role: "Responsive SVG chart library for data visualization" },
      { name: "Socket.IO Client", version: "4.8.3", role: "Real-time bi-directional WebSocket client" },
      { name: "Lucide React", version: "0.436.0", role: "Accessible, clean SVG icon suite" }
    ],
    entryPoints: ["frontend/src/main.tsx", "frontend/src/App.tsx", "frontend/index.html"],
    routingArchitecture: "React Router v6 declarative routes with React.lazy code-splitting and Protected route wrapper enforcing JWT presence and RBAC allowedRoles.",
    stateManagement: "React Context for Auth (useAuth), Theme (useTheme), and Notifications (useNotifications). Local component state for forms and tables. Persistent IndexedDB for Spec Workspace.",
    themeManagement: "Dark mode default ('dark') with toggleable 'light' mode stored in localStorage and applied via `document.documentElement.classList`.",
    apiClient: "Axios instance in `frontend/src/services/api.ts` with base URL `/api` (proxied in Vite config to `http://localhost:4000`) and request interceptor appending `Authorization: Bearer <token>`.",
    featureMatrix: [
      {
        route: "/command-center",
        page: "CommandCenterPage",
        purpose: "Real-time tactical operations center cockpit",
        role: "All authenticated users",
        dataSources: "Socket.IO events, /api/dashboard/stats",
        apiEndpoints: "GET /api/dashboard/stats, GET /api/disasters",
        userActions: "Filter map layers, toggle Defcon level, view active tickers",
        validation: "None (read-only command view)",
        loadingError: "PageLoader fallback; error alert banner",
        mobileBehavior: "Stacked layout with scrollable map view",
        associatedTests: "TEST-006"
      },
      {
        route: "/disasters",
        page: "DisastersPage",
        purpose: "Disaster incident declaration and status management",
        role: "EMERGENCY_MANAGER, DISASTER_OFFICER, ADMIN",
        dataSources: "/api/disasters",
        apiEndpoints: "GET /api/disasters, POST /api/disasters",
        userActions: "Create incident, filter by severity, navigate to detail",
        validation: "Title (min 3 chars), severity (1-4), valid coordinates",
        loadingError: "Table skeleton loader",
        mobileBehavior: "Card layout with priority badges",
        associatedTests: "TEST-015"
      },
      {
        route: "/allocations",
        page: "AllocationsPage",
        purpose: "Resource allocation execution and FIFO audit",
        role: "EMERGENCY_MANAGER, RESOURCE_MANAGER, ADMIN",
        dataSources: "/api/allocations, /api/requests",
        apiEndpoints: "GET /api/allocations, POST /api/allocations",
        userActions: "Select emergency request, choose depot, trigger FIFO allocate",
        validation: "Request ID and Item ID required; positive quantity",
        loadingError: "Allocation modal with loading spinner",
        mobileBehavior: "Full-screen allocation dialog",
        associatedTests: "TEST-001"
      },
      {
        route: "/report",
        page: "CitizenReportApp",
        purpose: "Public citizen distress reporting",
        role: "Public (No auth required)",
        dataSources: "HTML5 Geolocation API, Public endpoint",
        apiEndpoints: "POST /api/public/emergency-report",
        userActions: "Pick category, pin location, enter phone, upload photo",
        validation: "Valid coordinates, description min 10 chars, phone format",
        loadingError: "Submission progress bar with offline fallback indicator",
        mobileBehavior: "Thumb-optimized touch workflow with big tap targets",
        associatedTests: "TEST-005"
      }
    ],
    qualityAudit: [
      { category: "Code Quality", finding: "Vite production build compiles cleanly without TypeScript errors.", severity: "Verified", resolution: "Passes `tsc -b && vite build` in 7.91s." },
      { category: "Responsive UX", finding: "Previous mobile overflow on login and report pages fixed with flexible widths and 44px targets.", severity: "Resolved", resolution: "Verified across 375px, 768px, and 1280px via headless Edge." },
      { category: "Audit Integrity", finding: "Removed simulated Merkle tree claims in AuditLogsPage to uphold honest technical reporting.", severity: "Resolved", resolution: "Displays standard SHA-256 event digest." }
    ]
  },
  backendSpec: {
    architectureSummary: "Authoritative backend is written in TypeScript and Express (`backend/src/`). It exposes structured REST API endpoints organized by domain, validates payloads using Zod, enforces JWT authentication and RBAC via middleware, and communicates with MySQL using connection pooling and transactions.",
    entryPoints: ["backend/src/server.ts", "backend/src/app.ts"],
    middleware: [
      { name: "authenticate", purpose: "Validates JWT Bearer token in Authorization header; attaches decoded user to req.user", file: "backend/src/middleware/auth.ts" },
      { name: "requireRole", purpose: "Enforces that req.user contains at least one of the required roles or ADMIN", file: "backend/src/middleware/auth.ts" },
      { name: "errorHandler", purpose: "Catches thrown errors; maps ZodError to HTTP 400 and ApiError to its status code; formats clean JSON", file: "backend/src/middleware/errorHandler.ts" },
      { name: "rateLimiter", purpose: "Protects public submission and login routes against brute-force DDoS abuse", file: "backend/src/middleware/rateLimiter.ts" }
    ],
    services: [
      { name: "disasterService", purpose: "CRUD and lifecycle transitions for declared disaster zones", methods: ["getAll", "getById", "create", "updateStatus"] },
      { name: "resourceService", purpose: "Depot inventory querying and allocation execution", methods: ["getInventory", "allocateFIFO", "releaseAllocation"] },
      { name: "facilityService", purpose: "Hospital and shelter capacity updates and metrics", methods: ["getHospitals", "updateHospitalCapacity", "getShelters", "updateShelterOccupancy"] },
      { name: "emailService", purpose: "Notification delivery with graceful offline fallback", methods: ["sendAlertEmail"] }
    ],
    databaseAccess: "MySQL2 connection pool with promise wrappers (`backend/src/config/db.ts`). Stored procedures invoked via `CALL sp_allocate_emergency_resources(...)`.",
    apiInventory: [
      {
        method: "POST",
        route: "/api/auth/login",
        purpose: "Authenticates user credentials and issues JWT token",
        authRequired: false,
        role: "Public",
        requestBody: "{ email: string, password: string }",
        validationRules: "Email format required, password min 6 characters",
        successResponse: "HTTP 200 { success: true, token: string, user: { id, email, name, roles } }",
        errorResponses: "HTTP 401 Invalid credentials; HTTP 400 Bad request",
        dbEffects: "SELECT from users table; verify bcrypt hash",
        auditRequired: true,
        rateLimit: "10 requests per minute",
        status: "Verified in source"
      },
      {
        method: "GET",
        route: "/api/disasters",
        purpose: "Retrieves list of active and archived disaster incidents",
        authRequired: true,
        role: "All authenticated roles",
        validationRules: "Optional query params: status, severity, page, limit",
        successResponse: "HTTP 200 { success: true, data: Disaster[], total: number }",
        errorResponses: "HTTP 401 Unauthorized",
        dbEffects: "SELECT from disasters table",
        auditRequired: false,
        status: "Verified in source"
      },
      {
        method: "POST",
        route: "/api/disasters",
        purpose: "Declares a new emergency disaster incident",
        authRequired: true,
        role: "EMERGENCY_MANAGER, DISASTER_OFFICER, ADMIN",
        requestBody: "{ title, type, severity, latitude, longitude, description, radius_km }",
        validationRules: "Zod: title (min 3), severity (1-4), latitude (-90 to 90), longitude (-180 to 180)",
        successResponse: "HTTP 201 { success: true, data: Disaster }",
        errorResponses: "HTTP 400 Validation error; HTTP 403 Forbidden",
        dbEffects: "INSERT into disasters; trigger audit log",
        auditRequired: true,
        status: "Verified in source"
      },
      {
        method: "POST",
        route: "/api/allocations",
        purpose: "Executes atomic FIFO inventory allocation for an emergency request",
        authRequired: true,
        role: "EMERGENCY_MANAGER, RESOURCE_MANAGER, ADMIN",
        requestBody: "{ request_id: number, resource_id: number, quantity: number }",
        validationRules: "All fields required; quantity > 0",
        successResponse: "HTTP 201 { success: true, allocation_id: number, batches: Batch[] }",
        errorResponses: "HTTP 409 Insufficient stock; HTTP 404 Request not found",
        dbEffects: "Calls sp_allocate_emergency_resources; locks depot rows FOR UPDATE",
        auditRequired: true,
        status: "Verified in source"
      },
      {
        method: "POST",
        route: "/api/public/emergency-report",
        purpose: "Allows public citizens to submit distress signals without login",
        authRequired: false,
        role: "Public",
        requestBody: "{ reporter_name, contact_phone, incident_type, latitude, longitude, description, photo_base64? }",
        validationRules: "Description required; valid GPS bounds; photo under 10MB",
        successResponse: "HTTP 201 { success: true, tracking_id: string }",
        errorResponses: "HTTP 400 Validation error; HTTP 429 Rate limit exceeded",
        dbEffects: "INSERT into emergency_requests (source = 'CITIZEN_PORTAL')",
        auditRequired: true,
        rateLimit: "5 requests per IP per 10 minutes",
        status: "Verified in source"
      }
    ]
  },
  databaseSpec: {
    engine: "MySQL",
    version: "8.4 LTS",
    tablesCount: 45,
    viewsCount: 10,
    proceduresCount: 2,
    triggersCount: 9,
    tables: [
      {
        name: "disasters",
        purpose: "Stores declared disaster incidents, impact perimeter, and lifecycle state",
        columns: [
          { name: "id", type: "INT AUTO_INCREMENT", nullable: false, pk: true },
          { name: "title", type: "VARCHAR(255)", nullable: false },
          { name: "disaster_type", type: "VARCHAR(50)", nullable: false },
          { name: "severity", type: "TINYINT", nullable: false },
          { name: "status", type: "ENUM('DECLARED','ACTIVE','CONTAINED','CLOSED')", nullable: false, defaultVal: "'DECLARED'" },
          { name: "latitude", type: "DECIMAL(10,8)", nullable: false },
          { name: "longitude", type: "DECIMAL(11,8)", nullable: false },
          { name: "radius_km", type: "DECIMAL(6,2)", nullable: false, defaultVal: "5.00" },
          { name: "declared_at", type: "DATETIME", nullable: false, defaultVal: "CURRENT_TIMESTAMP" },
          { name: "created_by", type: "INT", nullable: false, fk: "users(id)" }
        ],
        indexes: ["idx_disasters_status", "idx_disasters_severity", "idx_disasters_coords (latitude, longitude)"],
        sensitivity: "Operational",
        retention: "Permanent archive for after-action reporting"
      },
      {
        name: "emergency_requests",
        purpose: "Inbound distress requests from citizens and emergency personnel",
        columns: [
          { name: "id", type: "INT AUTO_INCREMENT", nullable: false, pk: true },
          { name: "disaster_id", type: "INT", nullable: true, fk: "disasters(id)" },
          { name: "requester_name", type: "VARCHAR(150)", nullable: true },
          { name: "contact_phone", type: "VARCHAR(30)", nullable: true },
          { name: "category", type: "VARCHAR(50)", nullable: false },
          { name: "priority_score", type: "DECIMAL(5,2)", nullable: false, defaultVal: "50.00" },
          { name: "status", type: "ENUM('PENDING','TRIAGED','ALLOCATED','DISPATCHED','COMPLETED','CANCELLED')", nullable: false, defaultVal: "'PENDING'" },
          { name: "latitude", type: "DECIMAL(10,8)", nullable: false },
          { name: "longitude", type: "DECIMAL(11,8)", nullable: false },
          { name: "created_at", type: "DATETIME", nullable: false, defaultVal: "CURRENT_TIMESTAMP" }
        ],
        indexes: ["idx_req_status", "idx_req_priority (priority_score DESC)", "idx_req_disaster"],
        sensitivity: "PII",
        retention: "7 years retention per emergency management statutory compliance"
      },
      {
        name: "inventory_batches",
        purpose: "Depot inventory tracked by arrival date and expiration for FIFO deduction",
        columns: [
          { name: "id", type: "INT AUTO_INCREMENT", nullable: false, pk: true },
          { name: "depot_id", type: "INT", nullable: false, fk: "depots(id)" },
          { name: "resource_id", type: "INT", nullable: false, fk: "resources(id)" },
          { name: "batch_number", type: "VARCHAR(100)", nullable: false },
          { name: "initial_quantity", type: "INT", nullable: false },
          { name: "available_quantity", type: "INT", nullable: false },
          { name: "received_date", type: "DATE", nullable: false },
          { name: "expiry_date", type: "DATE", nullable: true }
        ],
        indexes: ["idx_inv_fifo (resource_id, depot_id, received_date ASC)", "idx_inv_expiry (expiry_date)"],
        sensitivity: "Operational",
        retention: "Maintained during depot operational lifecycle"
      },
      {
        name: "allocations",
        purpose: "Immutable ledger of resources dispatched to emergency requests",
        columns: [
          { name: "id", type: "INT AUTO_INCREMENT", nullable: false, pk: true },
          { name: "request_id", type: "INT", nullable: false, fk: "emergency_requests(id)" },
          { name: "batch_id", type: "INT", nullable: false, fk: "inventory_batches(id)" },
          { name: "quantity_allocated", type: "INT", nullable: false },
          { name: "allocated_at", type: "DATETIME", nullable: false, defaultVal: "CURRENT_TIMESTAMP" },
          { name: "allocated_by", type: "INT", nullable: false, fk: "users(id)" },
          { name: "status", type: "ENUM('RESERVED','DISPATCHED','DELIVERED','RELEASED')", nullable: false, defaultVal: "'RESERVED'" }
        ],
        indexes: ["idx_alloc_req", "idx_alloc_batch", "idx_alloc_status"],
        sensitivity: "Operational",
        retention: "Permanent audit record"
      }
    ],
    storedProcedures: [
      {
        name: "sp_allocate_emergency_resources",
        purpose: "Executes atomic FIFO inventory deduction with row locking",
        parameters: "IN p_request_id INT, IN p_resource_id INT, IN p_quantity INT, IN p_user_id INT, OUT p_status VARCHAR(50)",
        logic: "Begins transaction. Loops through inventory_batches ordered by received_date ASC. Locks each candidate row using `SELECT ... FOR UPDATE`. Decrements available_quantity. Inserts corresponding allocation record. Commits on full fulfillment; rolls back if total available is insufficient.",
        lockingMechanisms: "Row-level exclusive locks (`FOR UPDATE`) on candidate inventory_batches. Eliminates race conditions during concurrent allocation attempts."
      },
      {
        name: "sp_release_disaster_resources",
        purpose: "Releases reserved inventory back to available depot stock upon mission cancellation",
        parameters: "IN p_allocation_id INT, IN p_user_id INT",
        logic: "Verifies allocation status is 'RESERVED'. Increments available_quantity on the original batch. Marks allocation status as 'RELEASED'. Logs audit event.",
        lockingMechanisms: "Row-level lock on specific batch and allocation record inside transaction."
      }
    ],
    triggers: [
      { name: "trg_update_request_priority", table: "emergency_requests", timing: "BEFORE", event: "INSERT", action: "Computes priority score from casualties and vulnerability weights." },
      { name: "trg_audit_disaster_changes", table: "disasters", timing: "AFTER", event: "UPDATE", action: "Appends status and severity delta to audit_logs." }
    ],
    views: [
      { name: "v_active_disaster_summary", purpose: "Aggregates active disaster count, total casualties, and displaced persons.", definition: "SELECT status, COUNT(*), SUM(casualties) FROM disasters GROUP BY status;" },
      { name: "v_critical_shortages", purpose: "Identifies resources where depot stock is less than 20% of minimum threshold.", definition: "SELECT r.name, SUM(b.available_quantity) FROM resources r JOIN inventory_batches b ... HAVING stock < threshold;" }
    ],
    allocationMechanics: {
      algorithm: "Strict FIFO (First-In, First-Out) by received_date. Items received earlier are allocated first to prevent depot hoarding and expiration.",
      lockingStrategy: "Row-level exclusive locking using `SELECT ... FOR UPDATE` inside an explicit ACID MySQL transaction.",
      rollbackBehavior: "Immediate `ROLLBACK` on MySQL error or if total available stock is strictly less than requested quantity. Zero partial allocations.",
      concurrencyHandling: "Serializable row isolation on contested batches; subsequent transactions wait on row lock until previous transaction commits."
    }
  },
  authSpec: {
    strategy: "Stateless JSON Web Token (JWT) Bearer tokens with 24-hour expiration. Stored in browser localStorage and sent via Axios request interceptor.",
    tokenLifetime: "24 hours (86,400 seconds)",
    passwordHashing: "Bcrypt with 10 salt rounds (`bcrypt.hash(password, 10)`)",
    roles: [
      { role: "ADMIN", description: "Full system superuser with unrestricted access across all modules, user administration, and system settings.", permissions: ["*"] },
      { role: "EMERGENCY_MANAGER", description: "Operations Director responsible for declaring disasters, orchestrating allocations, and monitoring overall response.", permissions: ["disasters:create", "disasters:update", "allocations:authorize", "facilities:view", "settings:view"] },
      { role: "RESOURCE_MANAGER", description: "Logistics officer managing warehouse depots, batches, shortages, and allocation dispatches.", permissions: ["inventory:manage", "allocations:execute", "shortages:view", "vehicles:assign"] },
      { role: "MEDICAL_COORDINATOR", description: "Hospital and health liaison tracking ER capacity, ICU beds, ambulance diversions, and relief shelters.", permissions: ["hospitals:manage", "shelters:manage", "requests:triage_medical"] },
      { role: "RESCUE_COORDINATOR", description: "Field tactical squad leader managing search and rescue teams, UAV drone reconnaissance, and volunteers.", permissions: ["rescue_teams:dispatch", "vehicles:view", "volunteers:roster", "drones:pilot"] },
      { role: "DISASTER_OFFICER", description: "Incident responder intake officer triaging citizen distress reports and logging initial casualty estimates.", permissions: ["disasters:log", "requests:triage", "public_reports:verify"] },
      { role: "VIEWER", description: "Read-only auditor or municipal observer with access to dashboards, reports, and public summaries.", permissions: ["analytics:view", "reports:view", "audit_logs:view"] }
    ],
    permissionMatrix: [
      { module: "Disasters", action: "Create Disaster", allowedRoles: ["ADMIN", "EMERGENCY_MANAGER", "DISASTER_OFFICER"], backendEnforced: true },
      { module: "Disasters", action: "Close / Contain Disaster", allowedRoles: ["ADMIN", "EMERGENCY_MANAGER"], backendEnforced: true },
      { module: "Allocations", action: "Execute FIFO Allocation", allowedRoles: ["ADMIN", "EMERGENCY_MANAGER", "RESOURCE_MANAGER"], backendEnforced: true },
      { module: "Hospitals", action: "Update Bed Capacity", allowedRoles: ["ADMIN", "MEDICAL_COORDINATOR", "EMERGENCY_MANAGER"], backendEnforced: true },
      { module: "Shelters", action: "Update Occupancy", allowedRoles: ["ADMIN", "MEDICAL_COORDINATOR", "EMERGENCY_MANAGER"], backendEnforced: true },
      { module: "Rescue Teams", action: "Dispatch Squad", allowedRoles: ["ADMIN", "RESCUE_COORDINATOR", "EMERGENCY_MANAGER"], backendEnforced: true },
      { module: "Audit Logs", action: "View Compliance Ledger", allowedRoles: ["ADMIN", "EMERGENCY_MANAGER", "VIEWER"], backendEnforced: true },
      { module: "Settings", action: "Modify System Settings", allowedRoles: ["ADMIN", "EMERGENCY_MANAGER"], backendEnforced: true }
    ],
    unauthorizedBehavior: "Backend responds with HTTP 401 Unauthorized (invalid/missing token) or HTTP 403 Forbidden (insufficient role). Frontend redirects unauthenticated users to `/login` and displays 'Access Denied' banner on forbidden routes."
  },
  securityReqs: [
    {
      id: "SEC-001",
      title: "SQL Injection Prevention",
      category: "Input Validation & Data Access",
      severity: "Critical",
      affectedComponent: "Backend Database Layer (`backend/src/config/db.ts` & Services)",
      reproductionSteps: "Pass SQL payloads (e.g. `' OR '1'='1`) into query parameters.",
      evidence: "Source code audit confirms parameterized queries (`?` placeholders) and stored procedures are used exclusively. No string concatenation in SQL queries.",
      remediation: "Maintain strict ban on raw string interpolated SQL queries. Enforce mysql2 prepared statement execution.",
      verificationMethod: "Automated Jest route testing and static analysis.",
      status: "Verified"
    },
    {
      id: "SEC-002",
      title: "Cross-Site Scripting (XSS) Sanitization",
      category: "Frontend Output Encoding",
      severity: "High",
      affectedComponent: "Citizen Distress Reports & Dashboard Display",
      reproductionSteps: "Submit `<script>alert('xss')</script>` in public emergency report description.",
      evidence: "React automatically escapes rendered strings in JSX. No `dangerouslySetInnerHTML` is used for user-generated strings.",
      remediation: "Ensure all user text fields are rendered via standard React bindings.",
      verificationMethod: "Codebase grep confirms no hazardous innerHTML calls.",
      status: "Verified"
    },
    {
      id: "SEC-003",
      title: "JWT Token Security & Secret Management",
      category: "Authentication",
      severity: "Critical",
      affectedComponent: "JWT Auth Middleware (`backend/src/middleware/auth.ts`)",
      reproductionSteps: "Attempt signature forgery with arbitrary HMAC secrets.",
      evidence: "JWT signed using `process.env.JWT_SECRET` with development fallback. Token checked with `jwt.verify` enforcing HS256 algorithm.",
      remediation: "Require strong 256-bit random secret in production `.env` file.",
      verificationMethod: "Jest RBAC suite verifies invalid tokens are rejected with HTTP 401.",
      status: "Verified"
    },
    {
      id: "SEC-004",
      title: "Rate Limiting on Public Endpoints",
      category: "Abuse & DDoS Protection",
      severity: "Medium",
      affectedComponent: "Public Distress Route (`/api/public/emergency-report`) & Auth Login",
      reproductionSteps: "Send 100 rapid POST requests to public endpoint.",
      evidence: "Rate limiter middleware configured to block after threshold with HTTP 429.",
      remediation: "Enforce express-rate-limit middleware on all unauthenticated endpoints.",
      verificationMethod: "Integration test verifies rate limit headers and 429 responses.",
      status: "Mitigated"
    },
    {
      id: "SEC-005",
      title: "File Upload Size & MIME Type Verification",
      category: "File Upload Security",
      severity: "High",
      affectedComponent: "Citizen Incident Photo Upload",
      reproductionSteps: "Upload 50MB file or executable `.exe` renamed as `.jpg`.",
      evidence: "Payload limit configured to 10MB; backend validates image magic numbers before storage.",
      remediation: "Enforce payload ceiling in express body parser and validate base64 MIME prefixes.",
      verificationMethod: "Route test rejects oversized payloads with HTTP 413.",
      status: "Verified"
    },
    {
      id: "SEC-006",
      title: "CORS Whitelisting",
      category: "Transport Security",
      severity: "Medium",
      affectedComponent: "Express Server & Socket.IO (`backend/src/server.ts`)",
      reproductionSteps: "Initiate fetch from untrusted origin `http://attacker.com`.",
      evidence: "CORS middleware configured to whitelist authorized client origins (`CLIENT_URL` / `http://localhost:5173`).",
      remediation: "Disallow wildcard `*` origins in authenticated production mode.",
      verificationMethod: "Browser network inspection confirms CORS headers.",
      status: "Verified"
    }
  ],
  integrations: [
    {
      id: "INT-001",
      name: "OpenStreetMap & CartoDB Dark Matter",
      purpose: "Tile server providing base cartographic layers for tactical operations map",
      status: "Live Integration",
      provider: "OpenStreetMap Foundation & CartoDB",
      configVariables: ["VITE_OSM_TILE_URL"],
      authMethod: "Public tile attribution header",
      endpoints: ["https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"],
      failureHandling: "Falls back to standard OSM tile server or local cached vector tiles",
      timeoutBehavior: "5000ms tile load timeout",
      retryBehavior: "Leaflet automatic 3-retry tile fetch",
      cost: "Free / Open-Source Attribution"
    },
    {
      id: "INT-002",
      name: "Socket.IO Real-Time Event Bus",
      purpose: "Low-latency WebSocket channel for instant incident and allocation broadcast",
      status: "Live Integration",
      provider: "Self-hosted Node.js Socket.IO Server",
      configVariables: ["PORT", "CLIENT_URL"],
      authMethod: "Socket handshake with JWT token authentication",
      endpoints: ["ws://localhost:4000/socket.io/"],
      failureHandling: "Automatic fallback to long-polling HTTP transport with reconnect interval",
      timeoutBehavior: "20000ms ping timeout",
      retryBehavior: "Exponential backoff reconnect (1s to 5s)",
      cost: "Free (Self-hosted)"
    },
    {
      id: "INT-003",
      name: "Nodemailer SMTP Dispatcher",
      purpose: "Delivers emergency alerts and allocation confirmations to personnel",
      status: "Optional / Configurable",
      provider: "Configured SMTP (SendGrid, AWS SES, or Local Postfix)",
      configVariables: ["SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASS"],
      authMethod: "SMTP PLAIN / LOGIN credentials",
      endpoints: ["smtp://smtp.relay.service"],
      failureHandling: "Catches transport connection failure and falls back to console logging without crashing thread",
      timeoutBehavior: "5000ms connection timeout",
      retryBehavior: "1 retry attempt before logging offline notice",
      cost: "Dependent on SMTP provider tier"
    },
    {
      id: "INT-004",
      name: "Three.js WebGL Tactical UAV Simulator",
      purpose: "Simulates live thermal drone reconnaissance video feed and sensor telemetry",
      status: "Simulated / Local",
      provider: "Client-side WebGL Engine",
      configVariables: [],
      authMethod: "None (Internal client component)",
      endpoints: ["Local WebGL Canvas Context"],
      failureHandling: "Degrades gracefully to 2D tactical map view if WebGL is unsupported",
      timeoutBehavior: "Instant client initialization",
      retryBehavior: "N/A",
      cost: "Free"
    }
  ],
  workflows: [
    {
      id: "WF-01",
      name: "Disaster Incident Lifecycle",
      category: "Incidents",
      startingConditions: "Hazard reported by field sensors, public distress calls, or municipal agency.",
      actors: ["Disaster Officer", "Emergency Operations Director"],
      requiredPermissions: ["disasters:create", "disasters:update"],
      steps: [
        { stepNumber: 1, title: "Incident Declaration", actor: "Disaster Officer", action: "Inputs incident title, hazard category, epicenter coordinates, and estimated radius.", outcome: "Incident created with status 'DECLARED'." },
        { stepNumber: 2, title: "Severity & Impact Assessment", actor: "Emergency Director", action: "Verifies initial damage reports and sets severity rating (1 to 4).", outcome: "Defcon threat banner updates; alerts broadcast via Socket.IO." },
        { stepNumber: 3, title: "Resource Requirement Generation", actor: "Logistics Team", action: "Identifies required supplies (potable water, rescue squads, trauma kits).", outcome: "Generates prioritized emergency requests linked to disaster ID." },
        { stepNumber: 4, title: "Containment & Closure", actor: "Emergency Director", action: "Validates field teams have extinguished or stabilized hazard.", outcome: "Status updated to 'CLOSED'; after-action report generated." }
      ],
      businessRules: [
        "A disaster cannot be closed while high-priority emergency requests remain in 'ALLOCATED' or 'DISPATCHED' status without confirmation.",
        "Severity 4 disasters automatically trigger mandatory notification to all registered medical and rescue coordinators."
      ],
      stateTransitions: [
        { from: "DECLARED", event: "VERIFY_EPICENTER", to: "ACTIVE" },
        { from: "ACTIVE", event: "STABILIZE_PERIMETER", to: "CONTAINED" },
        { from: "CONTAINED", event: "COMPLETE_AFTER_ACTION", to: "CLOSED" }
      ],
      failureCases: [
        "Database connectivity loss during creation: Triggers HTTP 500 error and prompts operator to retry.",
        "Incorrect coordinates outside valid bounds (-90/90, -180/180): Rejected by Zod validation with HTTP 400."
      ],
      rollbackBehavior: "Database transaction automatically rolls back creation if linked initial request creation fails.",
      notifications: ["Socket.IO broadcast 'DISASTER_CREATED'", "Email alert to command staff if severity >= 3"],
      auditEvents: ["DISASTER_DECLARED", "SEVERITY_ESCALATED", "DISASTER_CLOSED"],
      mermaidDiagram: "graph TD\n  A[Incident Detected] --> B[Declared]\n  B --> C{Severity Assessment}\n  C -->|Level 1-2| D[Active - Local Response]\n  C -->|Level 3-4| E[Active - Regional EOC Response]\n  D --> F[Contained]\n  E --> F[Contained]\n  F --> G[Closed / After-Action Review]"
    },
    {
      id: "WF-02",
      name: "Emergency Resource Allocation (FIFO)",
      category: "Logistics",
      startingConditions: "Validated emergency request requiring physical depot supplies.",
      actors: ["Resource Manager", "EOC Logistics Director"],
      requiredPermissions: ["allocations:execute"],
      steps: [
        { stepNumber: 1, title: "Request Selection", actor: "Resource Manager", action: "Selects pending request from queue sorted by priority score.", outcome: "Opens allocation modal displaying candidate depots." },
        { stepNumber: 2, title: "Batch Evaluation", actor: "System Engine", action: "Executes `SELECT ... FOR UPDATE` ordered by `received_date ASC`.", outcome: "Locks candidate rows exclusively in MySQL." },
        { stepNumber: 3, title: "Stock Deduction", actor: "System Engine", action: "Decrements batch available quantity and inserts allocation records.", outcome: "ACID transaction commits; inventory reserved." },
        { stepNumber: 4, title: "Dispatch Order", actor: "Resource Manager", action: "Prints/transmits dispatch slip to warehouse loading bay.", outcome: "Request status transitions to 'ALLOCATED'." }
      ],
      businessRules: [
        "Earliest received batch MUST be consumed before newer batches (Strict FIFO).",
        "If requested quantity exceeds total depot stock, transaction must abort completely (Zero partial allocation without explicit override)."
      ],
      stateTransitions: [
        { from: "PENDING", event: "ALLOCATE_CONFIRM", to: "ALLOCATED" },
        { from: "ALLOCATED", event: "DEPOT_DISPATCH", to: "DISPATCHED" },
        { from: "DISPATCHED", event: "FIELD_DELIVERY", to: "COMPLETED" }
      ],
      failureCases: [
        "Concurrent allocation for same scarce batch: Second transaction waits on row lock, then detects remaining quantity is insufficient and aborts with HTTP 409.",
        "Network disconnect during commit: MySQL engine automatically rolls back uncommitted rows."
      ],
      rollbackBehavior: "Entire stored procedure `sp_allocate_emergency_resources` rolls back atomically upon any exception.",
      notifications: ["Socket.IO 'ALLOCATION_COMPLETED'", "Warehouse dispatch notification"],
      auditEvents: ["INVENTORY_LOCKED", "STOCK_DEDUCTED", "ALLOCATION_CONFIRMED"],
      mermaidDiagram: "graph TD\n  Req[Emergency Request] --> Lock[Lock Batch FOR UPDATE]\n  Lock --> Check{Stock Available?}\n  Check -->|Yes| Deduct[Deduct Batch & Insert Allocation]\n  Check -->|No| Rollback[Rollback & Return HTTP 409]\n  Deduct --> Commit[Commit Transaction]\n  Commit --> Emit[Emit Realtime Alert]"
    }
  ],
  architecture: {
    rootVsBackendAnalysis: [
      {
        question: "Which application is started by root package scripts?",
        finding: "Root `package.json` contains scripts `start:dev` launching `nodemon server.js` (legacy CommonJS app). However, `backend/package.json` contains `npm run dev` running `tsx watch src/server.ts`.",
        recommendation: "Treat `backend/` as the authoritative production service. Clarify root package scripts to prevent accidental launching of the legacy CommonJS prototype."
      },
      {
        question: "Which application does the frontend communicate with?",
        finding: "The React frontend Vite config proxies `/api` requests to port `4000`, which is the port configured in `backend/src/server.ts`. Frontend models and routes match `backend/src/routes/` exclusively.",
        recommendation: "Preserve `backend/` as the single authoritative API provider for the frontend."
      },
      {
        question: "Do both applications expose overlapping APIs?",
        finding: "Yes, both root `server.js` and `backend/src/server.ts` expose `/api/disasters` and `/api/allocations`. However, root app lacks typed Zod validation and comprehensive error handling.",
        recommendation: "Retain root files for backward compatibility/reference but mark them as legacy."
      }
    ],
    recommendedArchitecture: "Decoupled Modern Client-Server Architecture: React 18 SPA (`frontend/`) communicating over REST and WebSockets with Node.js/TypeScript Express backend (`backend/`), backed by persistent MySQL 8.4 database and client-side IndexedDB for specification data.",
    fileMap: [
      { path: "frontend/src/App.tsx", type: "Active source", module: "Frontend Routing", description: "Main routing architecture and role guards" },
      { path: "frontend/src/layouts/AppLayout.tsx", type: "Active source", module: "Frontend Layout", description: "Primary command dashboard layout, topbar, and navigation" },
      { path: "frontend/src/spec-workspace/*", type: "Active source", module: "Specification Workspace", description: "19 interconnected project specification modules" },
      { path: "backend/src/server.ts", type: "Active source", module: "Backend Entry Point", description: "Express app initialization, CORS, Socket.IO, and port listener" },
      { path: "backend/src/config/db.ts", type: "Active source", module: "Database Connection", description: "MySQL2 connection pool with promise support" },
      { path: "backend/src/middleware/auth.ts", type: "Active source", module: "Security & RBAC", description: "JWT validation and role authorization middleware" },
      { path: "database/schema.sql", type: "Active source", module: "Database DDL", description: "45-table relational schema definition" },
      { path: "database/procedures.sql", type: "Active source", module: "Database Stored Procedures", description: "ACID FIFO allocation and release procedures" },
      { path: "server.js", type: "Legacy or potentially redundant", module: "Prototype Server", description: "Original CommonJS prototype server" }
    ]
  },
  testCases: [
    {
      id: "TEST-001",
      reqId: "REQ-001",
      scenario: "FIFO Allocation with Row Locking in Stored Procedure",
      category: "Unit",
      preconditions: "Depot has 2 batches received on Day 1 (qty: 5) and Day 2 (qty: 10). Request asks for 7 units.",
      steps: "Call allocation engine service with request quantity 7.",
      expectedResult: "All 5 units deducted from Day 1 batch; remaining 2 units deducted from Day 2 batch. Status set to 'ALLOCATED'.",
      actualResult: "Passed: Exactly matches FIFO batch consumption ordering.",
      status: "Passed",
      evidence: "backend/tests/allocationEngine.test.ts (Suite 'Allocation Engine & FIFO Mechanics' - Passed)",
      lastRun: "2026-10-30"
    },
    {
      id: "TEST-002",
      reqId: "REQ-006",
      scenario: "Transaction Rollback on Allocation Failure",
      category: "Unit",
      preconditions: "Simulated database connection drop during second batch deduction.",
      steps: "Execute allocation transaction and trigger simulated DB error midway.",
      expectedResult: "Transaction rolls back completely. Zero allocation batches created. Depot stock unchanged.",
      actualResult: "Passed: Mock transaction rollback invoked properly.",
      status: "Passed",
      evidence: "backend/tests/allocationEngine.test.ts (Rollback assertion verified)",
      lastRun: "2026-10-30"
    },
    {
      id: "TEST-003",
      reqId: "REQ-002",
      scenario: "RBAC Middleware Blocks Unauthorized Roles",
      category: "API",
      preconditions: "User authenticated with role 'VIEWER'.",
      steps: "Attempt POST request to `/api/disasters`.",
      expectedResult: "HTTP 403 Forbidden with error message 'Forbidden: Insufficient permissions'.",
      actualResult: "Passed: Returned HTTP 403 Forbidden.",
      status: "Passed",
      evidence: "backend/tests/rbac.test.ts (Suite 'RBAC Middleware' - Passed)",
      lastRun: "2026-10-30"
    },
    {
      id: "TEST-004",
      reqId: "REQ-002",
      scenario: "Superuser ADMIN Bypasses Role Restrictions",
      category: "API",
      preconditions: "User authenticated with role 'ADMIN'.",
      steps: "Execute POST request to sensitive route requiring 'RESOURCE_MANAGER'.",
      expectedResult: "HTTP 200 / 201 Success: ADMIN role permitted.",
      actualResult: "Passed: Request succeeded.",
      status: "Passed",
      evidence: "backend/tests/rbac.test.ts (ADMIN wildcard authorization verified)",
      lastRun: "2026-10-30"
    },
    {
      id: "TEST-005",
      reqId: "REQ-003",
      scenario: "Public Distress Beacon Validates GPS Bounds",
      category: "API",
      preconditions: "Public distress submission endpoint `/api/public/emergency-report`.",
      steps: "Submit payload with invalid latitude 145.0 (exceeds 90.0 maximum).",
      expectedResult: "HTTP 400 Bad Request with Zod validation details.",
      actualResult: "Passed: Rejected with HTTP 400 and validation message.",
      status: "Passed",
      evidence: "backend/tests/errorHandlerAndRoutes.test.ts (Suite 'Public Route Validation' - Passed)",
      lastRun: "2026-10-30"
    },
    {
      id: "TEST-006",
      reqId: "REQ-004",
      scenario: "Multi-Viewport Layout Inspection (375px Mobile)",
      category: "Browser",
      preconditions: "Vite production build running.",
      steps: "Headless Microsoft Edge navigates to `/login` and `/dashboard` at 375x667 viewport.",
      expectedResult: "Zero page errors, zero horizontal overflow scrollbar, 44px tap targets.",
      actualResult: "Passed: Clean render verified and captured to screenshot-mobile-375.png.",
      status: "Passed",
      evidence: "test/browser/verify-viewports.js (375px viewport test execution)",
      lastRun: "2026-10-30"
    },
    {
      id: "TEST-007",
      reqId: "REQ-004",
      scenario: "Desktop Viewport Inspection (1280px Desktop)",
      category: "Browser",
      preconditions: "Vite production build running.",
      steps: "Headless Edge navigates at 1280x800 viewport.",
      expectedResult: "Full command center cockpit layout rendered cleanly.",
      actualResult: "Passed: Captured to screenshot-desktop-1280.png.",
      status: "Passed",
      evidence: "test/browser/verify-viewports.js (1280px viewport test execution)",
      lastRun: "2026-10-30"
    }
  ],
  deployment: {
    environments: [
      {
        name: "Local Development",
        purpose: "Daily feature engineering and automated testing",
        hostPlatform: "Windows 11 / macOS / Linux with Node.js 24 and local MySQL 8.4",
        commands: [
          "git clone https://github.com/bankutech/UrbanResQ.git",
          "cd UrbanResQ/backend && npm install",
          "cd ../frontend && npm install",
          "cd ../backend && npm run build && npm test",
          "cd ../frontend && npm run build"
        ],
        envVars: ["PORT=4000", "DB_HOST=localhost", "DB_USER=root", "DB_PASS=secret", "DB_NAME=urbanresq", "JWT_SECRET=dev_secret_key_123"],
        notes: "Run backend on port 4000; Vite dev server runs on port 5173 with proxy configured."
      },
      {
        name: "Production (Staged)",
        purpose: "High-availability municipal emergency operations cluster",
        hostPlatform: "Ubuntu 24.04 LTS with Docker Compose or Kubernetes, managed MySQL 8.4 instance",
        commands: [
          "docker compose -f docker-compose.prod.yml build",
          "docker compose -f docker-compose.prod.yml up -d"
        ],
        envVars: ["NODE_ENV=production", "PORT=4000", "DB_HOST=mysql.internal", "JWT_SECRET=<strong-random-256bit-secret>", "CLIENT_URL=https://eoc.urbanresq.gov"],
        notes: "Enforce TLS termination via reverse proxy (Nginx / Cloudflare). Restrict MySQL port 3306 to internal VPC."
      }
    ],
    checklist: [
      { item: "Production database root credentials rotated and stored in KMS", category: "Security", verified: false, notes: "Pending production deployment provisioning" },
      { item: "JWT secret generated with cryptographically secure random 256-bit string", category: "Security", verified: false, notes: "Required before staging cutover" },
      { item: "CORS configured to whitelist production EOC domain only", category: "Security", verified: true, notes: "Configured in backend/src/server.ts" },
      { item: "All frontend production chunks build under size limits with dynamic import splitting", category: "Performance", verified: true, notes: "Build completes in 7.91s" },
      { item: "Automated regression test suite passes with 0 failures", category: "Testing", verified: true, notes: "15 tests passing across 4 suites" }
    ],
    runbooks: [
      {
        title: "Port Conflict Recovery",
        trigger: "Vite dev server fails to bind port 5173 or Express port 4000 in use",
        steps: [
          "Execute `netstat -ano | findstr :4000` to identify conflicting PID.",
          "Terminate stale Node process via `Stop-Process -Id <PID> -Force`.",
          "Restart server using `npm run dev`."
        ]
      },
      {
        title: "Database Connection Failure Runbook",
        trigger: "Backend logs 'ECONNREFUSED' or 'Access denied for user'",
        steps: [
          "Verify MySQL Windows service status: `Get-Service MySQL*`.",
          "Ensure credentials in `.env` match active MySQL user grants.",
          "Verify database schema initialization: `mysql -u root -p urbanresq < database/schema.sql`."
        ]
      }
    ]
  },
  decisions: [
    {
      id: "ADR-001",
      title: "Adoption of Modern React 18 + Vite over Legacy CRA",
      context: "UrbanResQ requires high-speed command center dashboard rendering with rapid HMR during emergency feature development.",
      problem: "Create React App is deprecated, slow to bundle, and lacks native TypeScript 5+ module resolution support.",
      optionsConsidered: [
        { option: "Vite 5 with React Plugin", pros: "Sub-second dev server startup, ESBuild pre-bundling, optimized Rollup builds", cons: "Requires modern ESM toolchain" },
        { option: "Next.js Pages/App Router", pros: "Built-in SSR and server components", cons: "Excessive complexity for client-side operations cockpit and WebGL Three.js integration" }
      ],
      selectedOption: "Vite 5 with React 18 and Tailwind CSS",
      rationale: "Vite provides fastest build speeds and effortless integration with Three.js WebGL and Leaflet canvas layers.",
      tradeOffs: "Client-side only rendering requires responsive skeleton loaders for slow networks.",
      affectedModules: ["frontend/*"],
      date: "2026-10-30",
      author: "Senior Software Architect",
      status: "Accepted"
    },
    {
      id: "ADR-002",
      title: "Consolidation of Authoritative Backend into TypeScript Express",
      context: "The repository contained both a root-level CommonJS prototype (`server.js`) and a structured TypeScript backend (`backend/src/`).",
      problem: "Dual backend implementations create confusion regarding routing, validation standards, and deployment scripts.",
      optionsConsidered: [
        { option: "Standardize on backend/src (TypeScript)", pros: "Strict type safety, Zod validation, modular services, Jest integration", cons: "Requires running separate build step" },
        { option: "Retain root server.js (CommonJS)", pros: "No build step required", cons: "No type safety, loose error handling, lacks structured service layer" }
      ],
      selectedOption: "backend/src (TypeScript Express)",
      rationale: "Enterprise emergency operations demand compile-time type guarantees and strict schema validation.",
      tradeOffs: "Root package.json scripts must be documented as legacy wrappers.",
      affectedModules: ["backend/*", "server.js"],
      date: "2026-10-30",
      author: "Senior Software Architect",
      status: "Accepted"
    },
    {
      id: "ADR-003",
      title: "Persistent Storage Architecture for Project Specification Workspace",
      context: "The master prompt requires a functional, persistent 19-section specification workspace without mixing specification records into emergency operational MySQL tables.",
      problem: "Local MySQL service credentials may be unavailable in development environments, and polluting disaster operational tables violates schema isolation.",
      optionsConsidered: [
        { option: "Browser IndexedDB + LocalStorage with JSON export/sync", pros: "100% reliable out of the box, zero external DB dependencies, instant persistence across refreshes, zero risk of operational data pollution", cons: "Storage is browser-scoped unless exported" },
        { option: "Separate MySQL specification tables", pros: "Centralized server storage", cons: "Fails when local MySQL credentials are unconfigured or unavailable" }
      ],
      selectedOption: "Client-Side IndexedDB Storage Engine with LocalStorage Fallback & Full JSON Sync",
      rationale: "Guarantees that the workspace is 100% operational immediately in any browser environment while supporting versioning and exports.",
      tradeOffs: "Team sharing relies on Export/Import JSON bundles until server sync endpoint is provisioned.",
      affectedModules: ["frontend/src/spec-workspace/*"],
      date: "2026-10-30",
      author: "Database Architect & Senior Full-Stack Engineer",
      status: "Accepted"
    },
    {
      id: "ADR-004",
      title: "Offline Graceful Fallback for Third-Party Notification Services",
      context: "SMTP and Twilio SMS services may not be provisioned in local test environments or may fail during catastrophic telecom outages.",
      problem: "Uncaught network exceptions when contacting SMTP relays crashed worker threads.",
      optionsConsidered: [
        { option: "Graceful Try-Catch with Fallback Logging", pros: "Requests complete successfully; simulated log preserved for audit", cons: "Notifications are not physically transmitted unless gateway is live" },
        { option: "Synchronous Hard Failure", pros: "Strict notification guarantee", cons: "Blocks emergency resource allocation when external mail server is down" }
      ],
      selectedOption: "Graceful Try-Catch with Fallback Logging",
      rationale: "Emergency supply dispatch must never be held hostage to an external third-party email server timeout.",
      tradeOffs: "Operators must monitor notification delivery status logs.",
      affectedModules: ["backend/src/services/emailService.ts"],
      date: "2026-10-30",
      author: "Reliability Engineer",
      status: "Accepted"
    }
  ],
  bugs: [
    {
      id: "BUG-001",
      title: "Zod Validation Errors Unhandled by Default Error Middleware",
      description: "Invalid request payloads resulted in generic HTTP 500 Internal Server Error rather than informative HTTP 400 Bad Request.",
      severity: "High",
      priority: "P1",
      affectedModule: "backend/src/middleware/errorHandler.ts",
      reproductionSteps: "Send POST request to `/api/disasters` with missing `severity` field.",
      expectedResult: "HTTP 400 Bad Request with field-level validation errors.",
      actualResult: "Returned HTTP 500 Internal Server Error.",
      evidence: "Fixed and verified in `backend/tests/errorHandlerAndRoutes.test.ts`.",
      rootCause: "errorHandler did not check `err instanceof ZodError`.",
      proposedFix: "Add explicit ZodError branch in errorHandler returning HTTP 400.",
      assignedTo: "Backend Engineer",
      status: "Verified",
      relatedReqId: "REQ-007",
      relatedTestId: "TEST-009",
      resolutionNotes: "Implemented in prior session; verified by Jest test suite."
    },
    {
      id: "BUG-002",
      title: "Raw Error Thrown in Facility and Resource Services",
      description: "Services threw raw untyped `new Error('Not found')`, bypassing HTTP status code mapping.",
      severity: "Medium",
      priority: "P2",
      affectedModule: "backend/src/services/facilityService.ts",
      reproductionSteps: "Request non-existent hospital ID.",
      expectedResult: "HTTP 404 Not Found.",
      actualResult: "HTTP 500 Internal Server Error.",
      evidence: "Replaced raw Error with `new ApiError(404, 'Hospital not found')`.",
      rootCause: "Services lacked imported `ApiError` utility.",
      proposedFix: "Import and throw typed `ApiError` with explicit status codes.",
      assignedTo: "Backend Engineer",
      status: "Verified",
      relatedReqId: "REQ-007",
      relatedTestId: "TEST-009",
      resolutionNotes: "Verified across facilityService and resourceService."
    },
    {
      id: "BUG-003",
      title: "Uncaught SMTP Relay Exception on Missing Credentials",
      description: "Attempting to send email alert without valid SMTP environment variables caused uncaught exception.",
      severity: "Medium",
      priority: "P2",
      affectedModule: "backend/src/services/emailService.ts",
      reproductionSteps: "Trigger resource allocation notification in environment without `.env` SMTP variables.",
      expectedResult: "Graceful offline log warning without request failure.",
      actualResult: "Promise rejection causing 500 error on caller.",
      evidence: "Added try/catch wrapper with simulated console output.",
      rootCause: "Missing defensive error handling around nodemailer transporter.",
      proposedFix: "Wrap nodemailer sendMail in try/catch block with fallback logger.",
      assignedTo: "Backend Engineer",
      status: "Verified",
      relatedReqId: "REQ-011",
      relatedTestId: "TEST-013",
      resolutionNotes: "Verified in `backend/src/services/emailService.ts`."
    },
    {
      id: "BUG-004",
      title: "Mobile Viewport Horizontal Overflow on Login and Cockpit",
      description: "Fixed width containers (e.g. `min-w-[400px]`) caused horizontal scrollbar and clipped buttons on 375px mobile screens.",
      severity: "High",
      priority: "P1",
      affectedModule: "frontend/src/pages/LoginPage.tsx",
      reproductionSteps: "View login page at 375px viewport.",
      expectedResult: "Fluid layout filling viewport with minimum 44px touch targets.",
      actualResult: "Card exceeded viewport width by 25px.",
      evidence: "Fixed with `w-full max-w-sm` and verified in headless Edge browser test.",
      rootCause: "Hardcoded pixel min-width constraints.",
      proposedFix: "Replace hardcoded min-widths with Tailwind responsive max-widths and flex-col.",
      assignedTo: "UI/UX Designer",
      status: "Verified",
      relatedReqId: "REQ-004",
      relatedTestId: "TEST-006",
      resolutionNotes: "Screenshots captured to artifact directory verifying fix."
    },
    {
      id: "BUG-005",
      title: "Missing Payload Size Ceiling on Public Photo Upload",
      description: "Citizens could upload arbitrarily large base64 image strings, risking server memory exhaustion.",
      severity: "High",
      priority: "P1",
      affectedModule: "backend/src/routes/publicRoutes.ts",
      reproductionSteps: "Submit 20MB base64 string in `photo_base64`.",
      expectedResult: "Rejected with HTTP 413 Payload Too Large.",
      actualResult: "Accepted into server memory.",
      evidence: "Added 10MB string length validation in publicRoutes handler.",
      rootCause: "Lack of length check on base64 string.",
      proposedFix: "Enforce `photo_base64.length <= 13_000_000` (approx 10MB binary equivalent).",
      assignedTo: "Cybersecurity Engineer",
      status: "Verified",
      relatedReqId: "REQ-003",
      relatedTestId: "TEST-005",
      resolutionNotes: "Verified in `backend/tests/errorHandlerAndRoutes.test.ts`."
    },
    {
      id: "BUG-006",
      title: "Simulated Merkle Tree Claims in Audit Logs Page",
      description: "AuditLogsPage UI previously claimed to compute live cryptographic Merkle tree root hashes when in reality it only generated random SHA-256 strings.",
      severity: "Low",
      priority: "P3",
      affectedModule: "frontend/src/pages/AuditLogsPage.tsx",
      reproductionSteps: "Inspect audit log hash computation.",
      expectedResult: "Accurate label reflecting single-record SHA-256 digest.",
      actualResult: "Misleading label claiming 'Merkle Tree Proof Validated'.",
      evidence: "Corrected label to 'SHA-256 Event Digest' in AuditLogsPage.",
      rootCause: "Overstated technical capability in UI template.",
      proposedFix: "Update UI labels to accurately reflect genuine technical capability.",
      assignedTo: "Independent Reviewer",
      status: "Verified",
      relatedReqId: "REQ-012",
      relatedTestId: "TEST-014",
      resolutionNotes: "Verified: AuditLogsPage now presents honest cryptographic digest description."
    },
    {
      id: "BUG-007",
      title: "Missing Reduced Motion Support in Citizen Report App",
      description: "Spinning icons and animated pulses violated accessibility standards for users with vestibular sensitivity.",
      severity: "Medium",
      priority: "P2",
      affectedModule: "frontend/src/pages/CitizenReportApp.tsx",
      reproductionSteps: "Enable `prefers-reduced-motion` in browser OS settings.",
      expectedResult: "Animations stop or reduce to static state.",
      actualResult: "Animations continued spinning indefinitely.",
      evidence: "Added `motion-reduce:animate-none` classes.",
      rootCause: "Missing Tailwind `motion-reduce:` variants on animated classes.",
      proposedFix: "Append `motion-reduce:animate-none` to all pulsing and spinning elements.",
      assignedTo: "Accessibility Specialist",
      status: "Verified",
      relatedReqId: "REQ-010",
      relatedTestId: "TEST-012",
      resolutionNotes: "Verified across CitizenReportApp."
    },
    {
      id: "BUG-008",
      title: "Hardcoded Database Table Count Discrepancy",
      description: "DatabaseIntelligencePage displayed 42 tables when the actual SQL schema defines 45 tables.",
      severity: "Low",
      priority: "P3",
      affectedModule: "frontend/src/pages/DatabaseIntelligencePage.tsx",
      reproductionSteps: "Count tables in `database/schema.sql` (45) vs UI display (42).",
      expectedResult: "Exact match: 45 tables.",
      actualResult: "Mismatched static counter: 42.",
      evidence: "Updated metric in DatabaseIntelligencePage to 45 tables.",
      rootCause: "Static template data out of sync with actual database schema.",
      proposedFix: "Update static constant to match verified schema count.",
      assignedTo: "Database Architect",
      status: "Verified",
      relatedReqId: "REQ-006",
      relatedTestId: "TEST-002",
      resolutionNotes: "Verified in `DatabaseIntelligencePage.tsx`."
    }
  ],
  promptTemplates: [
    {
      id: "PROMPT-001",
      title: "Security Hardening of Public Endpoints",
      targetRole: "Cybersecurity Engineer",
      module: "Backend Public Routes",
      category: "Audit security",
      problemDescription: "Audit and harden `/api/public/emergency-report` against rate-limit bypass, spoofed X-Forwarded-For headers, and multi-part upload attacks.",
      requirements: "Enforce trust proxy configuration, sanitize coordinates, ensure strict photo payload limits, and return standardized error envelopes.",
      constraints: "Do not break public access for genuine citizens without accounts.",
      relevantFiles: "backend/src/routes/publicRoutes.ts, backend/src/middleware/rateLimiter.ts",
      expectedBehavior: "Legitimate distress reports succeed; anomalous floods receive HTTP 429.",
      acceptanceCriteria: "Passes automated rate-limit and boundary tests.",
      testingRequirements: "Write integration tests simulating rapid submissions.",
      securityConsiderations: "Prevent denial of service on EOC intake servers.",
      outputFormat: "Git diff and test execution report.",
      generatedPrompt: "# URBANRESQ — CYBERSECURITY HARDENING TASK\n\n**Role:** Cybersecurity Engineer\n**Target:** backend/src/routes/publicRoutes.ts\n\nInspect existing public endpoints and implement IP-based rate limiting with trust-proxy awareness and payload sanitization...",
      createdAt: "2026-10-30",
      updatedAt: "2026-10-30"
    }
  ],
  versionHistory: [
    {
      versionId: "VER-001",
      versionNumber: "v1.0.0",
      timestamp: "2026-10-30T13:30:00Z",
      author: "Antigravity Engineering Team",
      changeSummary: "Initial authoritative baseline specification established from repository discovery, source code inspection, database DDL audit, and automated test verification.",
      modifiedSections: [
        "1. Overview",
        "2. Requirements Checklist",
        "3. Product Specification",
        "4. UI/UX Requirements",
        "5. Frontend Specification",
        "6. Backend Specification",
        "7. Database Design",
        "8. Authentication & Authorization",
        "9. Security Requirements",
        "10. Integrations & APIs",
        "11. Business Logic & Workflows",
        "12. Architecture & File Structure",
        "13. Testing & Acceptance",
        "14. Deployment Instructions",
        "15. Development Notes & Decisions",
        "16. Bugs & Limitations",
        "17. Antigravity Prompt Builder",
        "18. Export Center",
        "19. Version History"
      ],
      reason: "Initial baseline creation following Master Professional Project Audit.",
      dataSnapshot: null
    }
  ]
};
