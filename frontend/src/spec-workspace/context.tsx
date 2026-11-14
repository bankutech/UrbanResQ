// URBANRESQ — Specification Workspace Context & Reactive Hooks

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { FullWorkspaceState } from "./types";
import { DEFAULT_WORKSPACE_STATE } from "./defaultData";
import { loadWorkspaceState, saveWorkspaceState, createVersionRevision } from "./storage";

export type SaveStatus = "Saved" | "Saving..." | "Unsaved changes" | "Error";

interface SearchResultItem {
  sectionId: string;
  sectionTitle: string;
  itemType: string;
  id: string;
  title: string;
  snippet: string;
  link: string;
}

interface SpecContextType {
  state: FullWorkspaceState;
  loading: boolean;
  saveStatus: SaveStatus;
  hasUnsavedChanges: boolean;
  updateSection: <K extends keyof FullWorkspaceState>(key: K, data: FullWorkspaceState[K]) => void;
  saveNow: () => Promise<void>;
  resetToDefault: () => Promise<void>;
  createRevision: (
    version: string,
    author: string,
    summary: string,
    sections: string[],
    reason: string
  ) => Promise<void>;
  restoreRevision: (versionId: string) => Promise<void>;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  searchResults: SearchResultItem[];
  // Cross-reference helpers
  getRequirementById: (id: string) => any;
  getTestById: (id: string) => any;
  getBugById: (id: string) => any;
  getDecisionById: (id: string) => any;
}

const SpecContext = createContext<SpecContextType | undefined>(undefined);

export const SpecWorkspaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<FullWorkspaceState>(DEFAULT_WORKSPACE_STATE);
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("Saved");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Initialize from persistent storage
  useEffect(() => {
    let mounted = true;
    loadWorkspaceState()
      .then((loaded) => {
        if (mounted) {
          setState(loaded);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error("[SpecWorkspace] Initialization error:", err);
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  // Warn user before leaving page if unsaved changes exist
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = "You have unsaved specification changes. Are you sure you want to leave?";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // Save changes explicitly
  const saveNow = useCallback(async () => {
    setSaveStatus("Saving...");
    try {
      await saveWorkspaceState(state);
      setSaveStatus("Saved");
      setHasUnsavedChanges(false);
    } catch (err) {
      console.error("[SpecWorkspace] Save failed:", err);
      setSaveStatus("Error");
    }
  }, [state]);

  // Update specific section
  const updateSection = useCallback(
    <K extends keyof FullWorkspaceState>(key: K, data: FullWorkspaceState[K]) => {
      setState((prev) => {
        const next = { ...prev, [key]: data };
        return next;
      });
      setHasUnsavedChanges(true);
      setSaveStatus("Unsaved changes");
    },
    []
  );

  // Auto-save debounced after 2 seconds of inactivity
  useEffect(() => {
    if (!hasUnsavedChanges) return;
    const timer = setTimeout(() => {
      saveNow();
    }, 2000);
    return () => clearTimeout(timer);
  }, [state, hasUnsavedChanges, saveNow]);

  // Reset to default seed
  const resetToDefault = useCallback(async () => {
    if (window.confirm("Are you sure you want to reset all specification sections to authoritative repository defaults? This will erase local modifications.")) {
      setState(DEFAULT_WORKSPACE_STATE);
      await saveWorkspaceState(DEFAULT_WORKSPACE_STATE);
      setHasUnsavedChanges(false);
      setSaveStatus("Saved");
    }
  }, []);

  // Create new version revision
  const createRevision = useCallback(
    async (
      version: string,
      author: string,
      summary: string,
      sections: string[],
      reason: string
    ) => {
      const updated = createVersionRevision(state, version, author, summary, sections, reason);
      setState(updated);
      await saveWorkspaceState(updated);
      setHasUnsavedChanges(false);
      setSaveStatus("Saved");
    },
    [state]
  );

  // Restore revision
  const restoreRevision = useCallback(
    async (versionId: string) => {
      const entry = state.versionHistory.find((v) => v.versionId === versionId);
      if (!entry) throw new Error("Version not found");
      if (!entry.dataSnapshot) {
        throw new Error("No data snapshot found for this version.");
      }

      const confirmed = window.confirm(
        `Are you sure you want to restore revision ${entry.versionNumber}? This will preserve historical records and create a new restoration entry.`
      );
      if (!confirmed) return;

      const restoredData = JSON.parse(JSON.stringify(entry.dataSnapshot));
      // Append a new version history entry for the restoration
      const restorationEntry = {
        versionId: `VER-${String(state.versionHistory.length + 1).padStart(3, "0")}`,
        versionNumber: `${entry.versionNumber}-restored`,
        timestamp: new Date().toISOString(),
        author: "System Administrator",
        changeSummary: `Restored state from historical version ${entry.versionNumber}`,
        modifiedSections: ["All Sections"],
        reason: `Reverted to revision ${entry.versionNumber} per administrative instruction.`,
        dataSnapshot: JSON.parse(JSON.stringify(state))
      };

      restoredData.version = `${entry.versionNumber}-restored`;
      restoredData.versionHistory = [restorationEntry, ...state.versionHistory];

      setState(restoredData);
      await saveWorkspaceState(restoredData);
      setHasUnsavedChanges(false);
      setSaveStatus("Saved");
    },
    [state]
  );

  // Cross-reference lookup helpers
  const getRequirementById = useCallback(
    (id: string) => state.requirements.find((r) => r.id === id),
    [state.requirements]
  );
  const getTestById = useCallback(
    (id: string) => state.testCases.find((t) => t.id === id),
    [state.testCases]
  );
  const getBugById = useCallback(
    (id: string) => state.bugs.find((b) => b.id === id),
    [state.bugs]
  );
  const getDecisionById = useCallback(
    (id: string) => state.decisions.find((d) => d.id === id),
    [state.decisions]
  );

  // Global search across all 19 sections
  const searchResults = useMemo(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) return [];
    const q = searchQuery.toLowerCase();
    const results: SearchResultItem[] = [];

    // Search Requirements
    state.requirements.forEach((r) => {
      if (
        r.id.toLowerCase().includes(q) ||
        r.title.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.acceptanceCriteria.toLowerCase().includes(q)
      ) {
        results.push({
          sectionId: "requirements",
          sectionTitle: "2. Requirements Checklist",
          itemType: "Requirement",
          id: r.id,
          title: `${r.id}: ${r.title}`,
          snippet: r.description.slice(0, 120) + "...",
          link: "/spec/requirements"
        });
      }
    });

    // Search Bugs
    state.bugs.forEach((b) => {
      if (
        b.id.toLowerCase().includes(q) ||
        b.title.toLowerCase().includes(q) ||
        b.description.toLowerCase().includes(q) ||
        b.rootCause.toLowerCase().includes(q)
      ) {
        results.push({
          sectionId: "bugs",
          sectionTitle: "16. Bugs & Limitations",
          itemType: "Defect",
          id: b.id,
          title: `${b.id}: ${b.title}`,
          snippet: b.rootCause || b.description.slice(0, 120),
          link: "/spec/bugs"
        });
      }
    });

    // Search Tests
    state.testCases.forEach((t) => {
      if (
        t.id.toLowerCase().includes(q) ||
        t.scenario.toLowerCase().includes(q) ||
        t.expectedResult.toLowerCase().includes(q) ||
        t.evidence.toLowerCase().includes(q)
      ) {
        results.push({
          sectionId: "testing",
          sectionTitle: "13. Testing & Acceptance",
          itemType: "Test Case",
          id: t.id,
          title: `${t.id}: ${t.scenario}`,
          snippet: t.expectedResult,
          link: "/spec/testing"
        });
      }
    });

    // Search Decisions
    state.decisions.forEach((d) => {
      if (
        d.id.toLowerCase().includes(q) ||
        d.title.toLowerCase().includes(q) ||
        d.selectedOption.toLowerCase().includes(q) ||
        d.rationale.toLowerCase().includes(q)
      ) {
        results.push({
          sectionId: "decisions",
          sectionTitle: "15. Architecture Decisions",
          itemType: "Decision (ADR)",
          id: d.id,
          title: `${d.id}: ${d.title}`,
          snippet: d.selectedOption + " — " + d.rationale.slice(0, 80),
          link: "/spec/decisions"
        });
      }
    });

    // Search APIs
    state.backendSpec.apiInventory.forEach((a) => {
      if (
        a.route.toLowerCase().includes(q) ||
        a.purpose.toLowerCase().includes(q) ||
        a.method.toLowerCase().includes(q)
      ) {
        results.push({
          sectionId: "backend-spec",
          sectionTitle: "6. Backend Specification",
          itemType: "API Endpoint",
          id: `${a.method} ${a.route}`,
          title: `${a.method} ${a.route}`,
          snippet: a.purpose,
          link: "/spec/backend-spec"
        });
      }
    });

    // Search Database Tables
    state.databaseSpec.tables.forEach((tbl) => {
      if (
        tbl.name.toLowerCase().includes(q) ||
        tbl.purpose.toLowerCase().includes(q)
      ) {
        results.push({
          sectionId: "database-design",
          sectionTitle: "7. Database Design",
          itemType: "Database Table",
          id: tbl.name,
          title: `Table: ${tbl.name}`,
          snippet: tbl.purpose,
          link: "/spec/database-design"
        });
      }
    });

    // Search Security
    state.securityReqs.forEach((s) => {
      if (
        s.id.toLowerCase().includes(q) ||
        s.title.toLowerCase().includes(q) ||
        s.remediation.toLowerCase().includes(q)
      ) {
        results.push({
          sectionId: "security",
          sectionTitle: "9. Security Requirements",
          itemType: "Security Finding",
          id: s.id,
          title: `${s.id}: ${s.title}`,
          snippet: s.remediation,
          link: "/spec/security"
        });
      }
    });

    return results.slice(0, 30);
  }, [state, searchQuery]);

  return (
    <SpecContext.Provider
      value={{
        state,
        loading,
        saveStatus,
        hasUnsavedChanges,
        updateSection,
        saveNow,
        resetToDefault,
        createRevision,
        restoreRevision,
        searchQuery,
        setSearchQuery,
        searchResults,
        getRequirementById,
        getTestById,
        getBugById,
        getDecisionById
      }}
    >
      {children}
    </SpecContext.Provider>
  );
};

export function useSpecWorkspace() {
  const context = useContext(SpecContext);
  if (!context) {
    throw new Error("useSpecWorkspace must be used within a SpecWorkspaceProvider");
  }
  return context;
}
