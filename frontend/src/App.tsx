import React, { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";
import AppLayout from "./layouts/AppLayout";
import { useTheme } from "./hooks/useTheme";

// ---------------------------------------------------------------------------
// Lazy-loaded pages — each page is split into its own JS chunk and fetched
// only when the user first navigates to that route.
// ---------------------------------------------------------------------------
const LoginPage                = lazy(() => import("./pages/LoginPage"));
const DashboardPage            = lazy(() => import("./pages/DashboardPage"));
const CommandCenterPage        = lazy(() => import("./pages/CommandCenterPage"));
const DisastersPage            = lazy(() => import("./pages/DisastersPage"));
const DisasterDetailPage       = lazy(() => import("./pages/DisasterDetailPage"));
const EmergencyRequestsPage    = lazy(() => import("./pages/EmergencyRequestsPage"));
const RequestDetailPage        = lazy(() => import("./pages/RequestDetailPage"));
const AllocationsPage          = lazy(() => import("./pages/AllocationsPage"));
const ResourcesPage            = lazy(() => import("./pages/ResourcesPage"));
const InventoryPage            = lazy(() => import("./pages/InventoryPage"));
const ShortagesPage            = lazy(() => import("./pages/ShortagesPage"));
const RescueTeamsPage          = lazy(() => import("./pages/RescueTeamsPage"));
const VehiclesPage             = lazy(() => import("./pages/VehiclesPage"));
const HospitalsPage            = lazy(() => import("./pages/HospitalsPage"));
const SheltersPage             = lazy(() => import("./pages/SheltersPage"));
const VolunteersPage           = lazy(() => import("./pages/VolunteersPage"));
const SimulationsPage          = lazy(() => import("./pages/SimulationsPage"));
const AnalyticsPage            = lazy(() => import("./pages/AnalyticsPage"));
const ReportsPage              = lazy(() => import("./pages/ReportsPage"));
const DatabaseIntelligencePage = lazy(() => import("./pages/DatabaseIntelligencePage"));
const AuditLogsPage            = lazy(() => import("./pages/AuditLogsPage"));
const SettingsPage             = lazy(() => import("./pages/SettingsPage"));
const SearchResultsPage        = lazy(() => import("./pages/SearchResultsPage"));
const DroneSurveillancePage    = lazy(() => import("./pages/DroneSurveillancePage"));
const AnalyticsDashboard       = lazy(() => import("./pages/AnalyticsDashboard").then(m => ({ default: m.AnalyticsDashboard })));
const CitizenReportApp         = lazy(() => import("./pages/CitizenReportApp").then(m => ({ default: m.CitizenReportApp })));

// ---------------------------------------------------------------------------
// Page-level loading fallback — minimal, non-janky
// ---------------------------------------------------------------------------
function PageLoader() {
  return (
    <div className="flex h-full min-h-[200px] items-center justify-center">
      <div className="h-6 w-6 animate-spin rounded-sm border-2 border-eoc-border border-t-eoc-accent" />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Route guard — redirects unauthenticated users to /login and handles RBAC
// ---------------------------------------------------------------------------
function Protected({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles?: string[];
}) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;

  if (allowedRoles && allowedRoles.length > 0) {
    const hasRole = user.roles.some(
      (role: string) =>
        allowedRoles.includes(role) ||
        role === "ADMIN" ||
        allowedRoles.includes("VIEWER"),
    );
    if (!hasRole) {
      return (
        <AppLayout>
          <div className="flex h-full items-center justify-center py-20">
            <div className="text-center">
              <h2 className="font-display text-3xl font-light tracking-tight text-eoc-critical">
                Access Denied
              </h2>
              <p className="mt-2 text-sm text-eoc-muted">
                You do not have permission to view this section.
              </p>
            </div>
          </div>
        </AppLayout>
      );
    }
  }

  return <AppLayout>{children}</AppLayout>;
}

export default function App() {
  useTheme(); // Initialize theme preference at the root

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <Protected>
              <CommandCenterPage />
            </Protected>
          }
        />
        <Route
          path="/command-center"
          element={
            <Protected>
              <CommandCenterPage />
            </Protected>
          }
        />
        <Route
          path="/dashboard"
          element={
            <Protected>
              <DashboardPage />
            </Protected>
          }
        />
        <Route
          path="/disasters"
          element={
            <Protected allowedRoles={["EMERGENCY_MANAGER", "DISASTER_OFFICER"]}>
              <DisastersPage />
            </Protected>
          }
        />
        <Route
          path="/disasters/:id"
          element={
            <Protected allowedRoles={["EMERGENCY_MANAGER", "DISASTER_OFFICER"]}>
              <DisasterDetailPage />
            </Protected>
          }
        />
        <Route
          path="/emergency-requests"
          element={
            <Protected
              allowedRoles={[
                "EMERGENCY_MANAGER",
                "DISASTER_OFFICER",
                "MEDICAL_COORDINATOR",
              ]}
            >
              <EmergencyRequestsPage />
            </Protected>
          }
        />
        <Route
          path="/emergency-requests/:id"
          element={
            <Protected
              allowedRoles={[
                "EMERGENCY_MANAGER",
                "DISASTER_OFFICER",
                "MEDICAL_COORDINATOR",
              ]}
            >
              <RequestDetailPage />
            </Protected>
          }
        />
        <Route
          path="/allocations"
          element={
            <Protected allowedRoles={["EMERGENCY_MANAGER", "RESOURCE_MANAGER"]}>
              <AllocationsPage />
            </Protected>
          }
        />
        <Route
          path="/resources"
          element={
            <Protected allowedRoles={["RESOURCE_MANAGER"]}>
              <ResourcesPage />
            </Protected>
          }
        />
        <Route
          path="/inventory"
          element={
            <Protected allowedRoles={["RESOURCE_MANAGER"]}>
              <InventoryPage />
            </Protected>
          }
        />
        <Route
          path="/shortages"
          element={
            <Protected allowedRoles={["RESOURCE_MANAGER"]}>
              <ShortagesPage />
            </Protected>
          }
        />
        <Route
          path="/rescue-teams"
          element={
            <Protected allowedRoles={["RESCUE_COORDINATOR"]}>
              <RescueTeamsPage />
            </Protected>
          }
        />
        <Route
          path="/vehicles"
          element={
            <Protected allowedRoles={["RESCUE_COORDINATOR", "RESOURCE_MANAGER"]}>
              <VehiclesPage />
            </Protected>
          }
        />
        <Route
          path="/hospitals"
          element={
            <Protected allowedRoles={["MEDICAL_COORDINATOR", "EMERGENCY_MANAGER"]}>
              <HospitalsPage />
            </Protected>
          }
        />
        <Route
          path="/shelters"
          element={
            <Protected
              allowedRoles={["MEDICAL_COORDINATOR", "EMERGENCY_MANAGER"]}
            >
              <SheltersPage />
            </Protected>
          }
        />
        <Route
          path="/volunteers"
          element={
            <Protected allowedRoles={["RESCUE_COORDINATOR", "EMERGENCY_MANAGER"]}>
              <VolunteersPage />
            </Protected>
          }
        />
        <Route
          path="/simulations"
          element={
            <Protected allowedRoles={["EMERGENCY_MANAGER"]}>
              <SimulationsPage />
            </Protected>
          }
        />
        <Route
          path="/analytics"
          element={
            <Protected allowedRoles={["VIEWER", "EMERGENCY_MANAGER"]}>
              <AnalyticsPage />
            </Protected>
          }
        />
        <Route
          path="/analytics-dashboard"
          element={
            <Protected allowedRoles={["VIEWER", "EMERGENCY_MANAGER"]}>
              <AnalyticsDashboard />
            </Protected>
          }
        />
        <Route
          path="/reports"
          element={
            <Protected allowedRoles={["VIEWER", "EMERGENCY_MANAGER"]}>
              <ReportsPage />
            </Protected>
          }
        />
        <Route
          path="/database-intelligence"
          element={
            <Protected allowedRoles={["VIEWER", "EMERGENCY_MANAGER"]}>
              <DatabaseIntelligencePage />
            </Protected>
          }
        />
        <Route
          path="/audit-logs"
          element={
            <Protected allowedRoles={["VIEWER", "EMERGENCY_MANAGER"]}>
              <AuditLogsPage />
            </Protected>
          }
        />
        <Route
          path="/settings"
          element={
            <Protected allowedRoles={["EMERGENCY_MANAGER"]}>
              <SettingsPage />
            </Protected>
          }
        />
        <Route
          path="/search"
          element={
            <Protected>
              <SearchResultsPage />
            </Protected>
          }
        />
        <Route
          path="/drone-feed"
          element={
            <Protected allowedRoles={["EMERGENCY_MANAGER", "RESCUE_COORDINATOR"]}>
              <DroneSurveillancePage />
            </Protected>
          }
        />
        <Route path="/report" element={<CitizenReportApp />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Suspense>
  );
}
