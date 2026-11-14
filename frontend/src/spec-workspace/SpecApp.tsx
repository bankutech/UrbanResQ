// Specification Workspace Application Wrapper
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { SpecWorkspaceProvider } from "./context";
import SpecLayout from "./SpecLayout";

// 19 Section Page Components
import Section1Overview from "./sections/Section1Overview";
import Section2Requirements from "./sections/Section2Requirements";
import Section3ProductSpec from "./sections/Section3ProductSpec";
import Section4UIUX from "./sections/Section4UIUX";
import Section5FrontendSpec from "./sections/Section5FrontendSpec";
import Section6BackendSpec from "./sections/Section6BackendSpec";
import Section7DatabaseDesign from "./sections/Section7DatabaseDesign";
import Section8Auth from "./sections/Section8Auth";
import Section9Security from "./sections/Section9Security";
import Section10Integrations from "./sections/Section10Integrations";
import Section11Workflows from "./sections/Section11Workflows";
import Section12Architecture from "./sections/Section12Architecture";
import Section13Testing from "./sections/Section13Testing";
import Section14Deployment from "./sections/Section14Deployment";
import Section15Decisions from "./sections/Section15Decisions";
import Section16Bugs from "./sections/Section16Bugs";
import Section17PromptBuilder from "./sections/Section17PromptBuilder";
import Section18ExportCenter from "./sections/Section18ExportCenter";
import Section19VersionHistory from "./sections/Section19VersionHistory";

export default function SpecApp() {
  return (
    <SpecWorkspaceProvider>
      <SpecLayout>
        <Routes>
          <Route path="overview" element={<Section1Overview />} />
          <Route path="requirements" element={<Section2Requirements />} />
          <Route path="product-spec" element={<Section3ProductSpec />} />
          <Route path="ui-ux" element={<Section4UIUX />} />
          <Route path="frontend-spec" element={<Section5FrontendSpec />} />
          <Route path="backend-spec" element={<Section6BackendSpec />} />
          <Route path="database-design" element={<Section7DatabaseDesign />} />
          <Route path="auth" element={<Section8Auth />} />
          <Route path="security" element={<Section9Security />} />
          <Route path="integrations" element={<Section10Integrations />} />
          <Route path="workflows" element={<Section11Workflows />} />
          <Route path="architecture" element={<Section12Architecture />} />
          <Route path="testing" element={<Section13Testing />} />
          <Route path="deployment" element={<Section14Deployment />} />
          <Route path="decisions" element={<Section15Decisions />} />
          <Route path="bugs" element={<Section16Bugs />} />
          <Route path="prompt-builder" element={<Section17PromptBuilder />} />
          <Route path="export-center" element={<Section18ExportCenter />} />
          <Route path="version-history" element={<Section19VersionHistory />} />
          <Route path="*" element={<Navigate to="/spec/overview" replace />} />
        </Routes>
      </SpecLayout>
    </SpecWorkspaceProvider>
  );
}
