// URBANRESQ — Project Specification Workspace Types
// Defines data models for all 19 interconnected specification sections

export type SectionId =
  | "overview"
  | "requirements"
  | "product-spec"
  | "ui-ux"
  | "frontend-spec"
  | "backend-spec"
  | "database-design"
  | "auth"
  | "security"
  | "integrations"
  | "workflows"
  | "architecture"
  | "testing"
  | "deployment"
  | "decisions"
  | "bugs"
  | "prompt-builder"
  | "export-center"
  | "version-history";

export interface SectionMeta {
  id: SectionId;
  number: number;
  title: string;
  shortTitle: string;
  path: string;
  iconName: string;
  category: "Strategy & Scope" | "Architecture & Tech" | "Quality & Security" | "Operations & Delivery";
}

export interface ProjectOverview {
  name: string;
  description: string;
  version: string;
  status: "Draft" | "Under Review" | "Verified Active";
  deploymentStatus: string;
  lastUpdated: string;
  objectives: string[];
  problemStatement: string;
  targetUsers: string[];
  useCases: string[];
  majorModules: string[];
  frontendArch: string;
  backendArch: string;
  databaseTech: string;
  externalIntegrations: string[];
  authModel: string;
  securityArch: string;
  knownLimitations: string[];
}

export type RequirementCategory =
  | "Functional"
  | "Non-functional"
  | "UI/UX"
  | "Security"
  | "Performance"
  | "Database"
  | "Integration"
  | "Accessibility"
  | "Testing"
  | "Deployment"
  | "Disaster-recovery";

export type RequirementPriority = "Critical" | "High" | "Medium" | "Low";

export type RequirementStatus =
  | "Not Started"
  | "In Progress"
  | "Implemented"
  | "Verified"
  | "Blocked"
  | "Rejected"
  | "Deferred";

export interface Requirement {
  id: string; // e.g. REQ-001
  title: string;
  description: string;
  category: RequirementCategory;
  priority: RequirementPriority;
  source: string;
  acceptanceCriteria: string;
  dependencies: string[];
  assignedRole: string;
  status: RequirementStatus;
  verificationMethod: string;
  verificationEvidence?: string;
  relatedFeature?: string;
  relatedTestIds: string[];
  relatedBugIds: string[];
  createdAt: string;
  updatedAt: string;
}

export type CapabilityStatus = "Implemented" | "In Progress" | "Planned" | "Simulated";

export interface ProductCapability {
  id: number;
  name: string;
  status: CapabilityStatus;
  description: string;
  keyFeatures: string[];
  dependencies: string[];
  dataSources: string[];
  uiRoute: string;
  backendRoutes: string[];
}

export interface ProductSpec {
  vision: string;
  problemStatement: string;
  goals: string[];
  outOfScope: string[];
  targetUsers: string[];
  personas: { name: string; role: string; needs: string; painPoints: string }[];
  journeys: { title: string; actor: string; steps: string[] }[];
  useCases: { id: string; name: string; actor: string; trigger: string; flow: string[] }[];
  functionalScope: string[];
  nonFunctionalScope: string[];
  businessConstraints: string[];
  operationalConstraints: string[];
  assumptions: string[];
  dependencies: string[];
  successMetrics: string[];
  futureEnhancements: string[];
  capabilities: ProductCapability[];
}

export interface UIUXSpec {
  designPrinciples: string[];
  colorPalette: { token: string; hex: string; role: string; contrastRatio: string }[];
  typography: { element: string; font: string; size: string; weight: string }[];
  spacing: string[];
  layoutGrid: string;
  navigationRules: string[];
  componentStandards: { component: string; rules: string }[];
  tableBehavior: string[];
  formValidation: string[];
  modalBehavior: string[];
  notificationBehavior: string[];
  loadingStates: string[];
  emptyStates: string[];
  errorStates: string[];
  responsiveBreakpoints: { name: string; width: string; rules: string }[];
  accessibility: string[];
  mapInteractions: string[];
  pageSpecs: { page: string; route: string; components: string[]; responsiveRules: string; validation: string }[];
}

export interface FrontendFeature {
  route: string;
  page: string;
  purpose: string;
  role: string;
  dataSources: string;
  apiEndpoints: string;
  userActions: string;
  validation: string;
  loadingError: string;
  mobileBehavior: string;
  associatedTests: string;
}

export interface FrontendSpec {
  technologies: { name: string; version: string; role: string }[];
  entryPoints: string[];
  routingArchitecture: string;
  stateManagement: string;
  themeManagement: string;
  apiClient: string;
  featureMatrix: FrontendFeature[];
  qualityAudit: { category: string; finding: string; severity: string; resolution: string }[];
}

export interface ApiEndpointDoc {
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  route: string;
  purpose: string;
  authRequired: boolean;
  role: string;
  requestParams?: string;
  requestBody?: string;
  validationRules: string;
  successResponse: string;
  errorResponses: string;
  dbEffects: string;
  auditRequired: boolean;
  rateLimit?: string;
  status: "Verified in source" | "Planned";
}

export interface BackendSpec {
  architectureSummary: string;
  entryPoints: string[];
  middleware: { name: string; purpose: string; file: string }[];
  services: { name: string; purpose: string; methods: string[] }[];
  databaseAccess: string;
  apiInventory: ApiEndpointDoc[];
}

export interface TableDoc {
  name: string;
  purpose: string;
  columns: {
    name: string;
    type: string;
    nullable: boolean;
    pk?: boolean;
    fk?: string;
    defaultVal?: string;
  }[];
  indexes: string[];
  sensitivity: "Public" | "Operational" | "PII" | "Restricted";
  retention: string;
}

export interface StoredProcedureDoc {
  name: string;
  purpose: string;
  parameters: string;
  logic: string;
  lockingMechanisms: string;
}

export interface TriggerDoc {
  name: string;
  table: string;
  timing: string;
  event: string;
  action: string;
}

export interface ViewDoc {
  name: string;
  purpose: string;
  definition: string;
}

export interface DatabaseSpec {
  engine: string;
  version: string;
  tablesCount: number;
  viewsCount: number;
  proceduresCount: number;
  triggersCount: number;
  tables: TableDoc[];
  storedProcedures: StoredProcedureDoc[];
  triggers: TriggerDoc[];
  views: ViewDoc[];
  allocationMechanics: {
    algorithm: string;
    lockingStrategy: string;
    rollbackBehavior: string;
    concurrencyHandling: string;
  };
}

export interface RoleDoc {
  role: string;
  description: string;
  permissions: string[];
}

export interface PermissionMatrixItem {
  module: string;
  action: string;
  allowedRoles: string[];
  backendEnforced: boolean;
}

export interface AuthSpec {
  strategy: string;
  tokenLifetime: string;
  passwordHashing: string;
  roles: RoleDoc[];
  permissionMatrix: PermissionMatrixItem[];
  unauthorizedBehavior: string;
}

export type SecuritySeverity = "Critical" | "High" | "Medium" | "Low" | "Informational";
export type SecurityStatus = "Open" | "Mitigated" | "Verified" | "Accepted Risk";

export interface SecurityRequirement {
  id: string; // e.g. SEC-001
  title: string;
  category: string;
  severity: SecuritySeverity;
  affectedComponent: string;
  reproductionSteps: string;
  evidence: string;
  remediation: string;
  verificationMethod: string;
  status: SecurityStatus;
}

export interface IntegrationItem {
  id: string;
  name: string;
  purpose: string;
  status: "Live Integration" | "Simulated / Local" | "Optional / Configurable" | "Planned";
  provider: string;
  configVariables: string[];
  authMethod: string;
  endpoints: string[];
  failureHandling: string;
  timeoutBehavior: string;
  retryBehavior: string;
  cost: string;
}

export interface WorkflowStep {
  stepNumber: number;
  title: string;
  actor: string;
  action: string;
  outcome: string;
}

export interface WorkflowDoc {
  id: string;
  name: string;
  category: string;
  startingConditions: string;
  actors: string[];
  requiredPermissions: string[];
  steps: WorkflowStep[];
  businessRules: string[];
  stateTransitions: { from: string; event: string; to: string }[];
  failureCases: string[];
  rollbackBehavior: string;
  notifications: string[];
  auditEvents: string[];
  mermaidDiagram: string;
}

export interface FileMapItem {
  path: string;
  type:
    | "Active source"
    | "Configuration"
    | "Generated build output"
    | "Tests"
    | "Documentation"
    | "Development utilities"
    | "Legacy or potentially redundant"
    | "Sensitive or environment-specific";
  module: string;
  description: string;
}

export interface ArchitectureDoc {
  rootVsBackendAnalysis: {
    question: string;
    finding: string;
    recommendation: string;
  }[];
  recommendedArchitecture: string;
  fileMap: FileMapItem[];
}

export type TestCategory =
  | "Unit"
  | "Integration"
  | "API"
  | "Browser"
  | "E2E"
  | "Security"
  | "Accessibility"
  | "Performance";

export type TestStatus = "Passed" | "Failed" | "Pending" | "Blocked";

export interface TestCase {
  id: string; // e.g. TEST-001
  reqId: string;
  scenario: string;
  category: TestCategory;
  preconditions: string;
  steps: string;
  expectedResult: string;
  actualResult: string;
  status: TestStatus;
  evidence: string;
  defectId?: string;
  lastRun: string;
}

export interface EnvironmentDoc {
  name: string;
  purpose: string;
  hostPlatform: string;
  commands: string[];
  envVars: string[];
  notes: string;
}

export interface DeploymentChecklistItem {
  item: string;
  category: string;
  verified: boolean;
  notes: string;
}

export interface DeploymentDoc {
  environments: EnvironmentDoc[];
  checklist: DeploymentChecklistItem[];
  runbooks: { title: string; trigger: string; steps: string[] }[];
}

export type DecisionStatus = "Proposed" | "Accepted" | "Superseded" | "Rejected";

export interface DecisionRecord {
  id: string; // e.g. ADR-001
  title: string;
  context: string;
  problem: string;
  optionsConsidered: { option: string; pros: string; cons: string }[];
  selectedOption: string;
  rationale: string;
  tradeOffs: string;
  affectedModules: string[];
  date: string;
  author: string;
  status: DecisionStatus;
  supersededBy?: string;
}

export type DefectSeverity = "Critical" | "High" | "Medium" | "Low";
export type DefectPriority = "P0" | "P1" | "P2" | "P3";
export type DefectStatus =
  | "Open"
  | "Investigating"
  | "In Progress"
  | "Fixed"
  | "Verified"
  | "Won't Fix";

export interface BugDefect {
  id: string; // e.g. BUG-001
  title: string;
  description: string;
  severity: DefectSeverity;
  priority: DefectPriority;
  affectedModule: string;
  reproductionSteps: string;
  expectedResult: string;
  actualResult: string;
  evidence: string;
  rootCause: string;
  proposedFix: string;
  assignedTo: string;
  status: DefectStatus;
  relatedReqId?: string;
  relatedTestId?: string;
  resolutionNotes?: string;
}

export interface PromptTemplate {
  id: string;
  title: string;
  targetRole: string;
  module: string;
  category: string;
  problemDescription: string;
  requirements: string;
  constraints: string;
  relevantFiles: string;
  expectedBehavior: string;
  acceptanceCriteria: string;
  testingRequirements: string;
  securityConsiderations: string;
  outputFormat: string;
  generatedPrompt: string;
  createdAt: string;
  updatedAt: string;
}

export interface VersionEntry {
  versionId: string;
  versionNumber: string;
  timestamp: string;
  author: string;
  changeSummary: string;
  modifiedSections: string[];
  reason: string;
  dataSnapshot: any;
}

export interface FullWorkspaceState {
  version: string;
  lastUpdated: string;
  overview: ProjectOverview;
  requirements: Requirement[];
  productSpec: ProductSpec;
  uiuxSpec: UIUXSpec;
  frontendSpec: FrontendSpec;
  backendSpec: BackendSpec;
  databaseSpec: DatabaseSpec;
  authSpec: AuthSpec;
  securityReqs: SecurityRequirement[];
  integrations: IntegrationItem[];
  workflows: WorkflowDoc[];
  architecture: ArchitectureDoc;
  testCases: TestCase[];
  deployment: DeploymentDoc;
  decisions: DecisionRecord[];
  bugs: BugDefect[];
  promptTemplates: PromptTemplate[];
  versionHistory: VersionEntry[];
}
