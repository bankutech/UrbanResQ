// URBANRESQ — Specification Workspace Master Layout
// Numbered 19-section collapsible sidebar, global cross-specification search modal, save indicator, and breadcrumbs

import React, { useState, useEffect } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  Compass,
  CheckSquare,
  FileSpreadsheet,
  Palette,
  Layout,
  Server,
  Database,
  KeyRound,
  ShieldAlert,
  Plug,
  GitMerge,
  FolderTree,
  FlaskConical,
  Rocket,
  Lightbulb,
  Bug,
  Bot,
  Download,
  History,
  Search,
  Save,
  Check,
  RefreshCw,
  ArrowLeft,
  Menu,
  X,
  AlertCircle,
  ExternalLink,
  ChevronRight
} from "lucide-react";
import { SPEC_SECTIONS } from "./constants";
import { useSpecWorkspace } from "./context";

// Icon mapping dictionary
const ICON_MAP: Record<string, React.ElementType> = {
  Compass,
  CheckSquare,
  FileSpreadsheet,
  Palette,
  Layout,
  Server,
  Database,
  KeyRound,
  ShieldAlert,
  Plug,
  GitMerge,
  FolderTree,
  FlaskConical,
  Rocket,
  Lightbulb,
  Bug,
  Bot,
  Download,
  History
};

export default function SpecLayout({ children }: { children: React.ReactNode }) {
  const {
    state,
    saveStatus,
    hasUnsavedChanges,
    saveNow,
    resetToDefault,
    searchQuery,
    setSearchQuery,
    searchResults
  } = useSpecWorkspace();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Keyboard shortcut Ctrl+K to open global search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setSearchModalOpen((prev) => !prev);
      }
      if (e.key === "Escape" && searchModalOpen) {
        setSearchModalOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [searchModalOpen]);

  // Current active section
  const currentSection = SPEC_SECTIONS.find((s) => s.path === location.pathname) || SPEC_SECTIONS[0];

  // Group sections by category
  const categories = ["Strategy & Scope", "Architecture & Tech", "Quality & Security", "Operations & Delivery"] as const;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#0B0F19] text-[#F9FAFB] font-sans antialiased">
      {/* =========================================================================
          LEFT SIDEBAR: 19 NUMBERED SECTIONS
          ========================================================================= */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex flex-col border-r border-[#1F2937] bg-[#111827] transition-all duration-200 lg:static ${
          mobileMenuOpen ? "translate-x-0 w-72" : "-translate-x-full lg:translate-x-0"
        } ${sidebarOpen ? "lg:w-72" : "lg:w-20"}`}
      >
        {/* Workspace Brand / Header */}
        <div className="flex h-14 items-center justify-between border-b border-[#1F2937] px-4">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-cyan-950 border border-cyan-800 text-cyan-400 font-mono font-bold text-sm">
              19
            </div>
            {sidebarOpen && (
              <div className="flex flex-col truncate">
                <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400">
                  UrbanResQ
                </span>
                <span className="text-xs font-mono text-gray-400 truncate">
                  Spec Workspace
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setSidebarOpen((prev) => !prev)}
              className="hidden lg:flex p-1.5 rounded hover:bg-[#1F2937] text-gray-400 hover:text-white"
              title={sidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"}
              aria-label="Toggle navigation drawer"
            >
              <Menu className="h-4 w-4" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="lg:hidden p-1.5 rounded hover:bg-[#1F2937] text-gray-400 hover:text-white"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Global Search Shortcut Pill */}
        <div className="p-3 border-b border-[#1F2937]">
          <button
            onClick={() => setSearchModalOpen(true)}
            className="flex w-full items-center justify-between gap-2 rounded border border-[#1F2937] bg-[#0B0F19] px-3 py-2 text-xs text-gray-400 hover:border-cyan-500 hover:text-gray-200 focus:outline-none focus:ring-1 focus:ring-cyan-500"
          >
            <div className="flex items-center gap-2 truncate">
              <Search className="h-3.5 w-3.5 shrink-0 text-cyan-400" />
              {sidebarOpen && <span className="truncate">Search 19 sections...</span>}
            </div>
            {sidebarOpen && (
              <kbd className="hidden sm:inline-block rounded border border-gray-700 bg-gray-800 px-1.5 py-0.5 text-[10px] font-mono text-gray-400">
                Ctrl+K
              </kbd>
            )}
          </button>
        </div>

        {/* Navigation Section List */}
        <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-4 text-xs font-medium scrollbar-thin">
          {categories.map((cat) => {
            const catSections = SPEC_SECTIONS.filter((s) => s.category === cat);
            return (
              <div key={cat} className="space-y-1">
                {sidebarOpen ? (
                  <div className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                    {cat}
                  </div>
                ) : (
                  <div className="my-2 border-t border-[#1F2937]" />
                )}

                {catSections.map((sec) => {
                  const Icon = ICON_MAP[sec.iconName] || Compass;
                  const isActive = location.pathname === sec.path;

                  return (
                    <NavLink
                      key={sec.id}
                      to={sec.path}
                      className={`group flex items-center gap-3 rounded-md px-3 py-2 text-xs transition-colors ${
                        isActive
                          ? "bg-cyan-950/80 text-cyan-300 font-semibold border-l-2 border-cyan-400"
                          : "text-gray-300 hover:bg-[#1F2937] hover:text-white"
                      }`}
                      title={!sidebarOpen ? sec.title : undefined}
                    >
                      <Icon
                        className={`h-4 w-4 shrink-0 transition-colors ${
                          isActive ? "text-cyan-400" : "text-gray-400 group-hover:text-cyan-300"
                        }`}
                      />
                      {sidebarOpen && (
                        <div className="flex flex-1 items-center justify-between truncate">
                          <span className="truncate">{sec.title}</span>
                          {/* Mini badges for critical sections */}
                          {sec.id === "requirements" && (
                            <span className="rounded bg-gray-800 px-1.5 py-0.2 text-[10px] font-mono text-gray-300">
                              {state.requirements.length}
                            </span>
                          )}
                          {sec.id === "bugs" && (
                            <span className="rounded bg-red-950 border border-red-800 px-1.5 py-0.2 text-[10px] font-mono text-red-300">
                              {state.bugs.filter((b) => b.status === "Open" || b.status === "In Progress").length}
                            </span>
                          )}
                          {sec.id === "testing" && (
                            <span className="rounded bg-emerald-950 border border-emerald-800 px-1.5 py-0.2 text-[10px] font-mono text-emerald-300">
                              {state.testCases.filter((t) => t.status === "Passed").length}/{state.testCases.length}
                            </span>
                          )}
                        </div>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            );
          })}
        </nav>

        {/* Sidebar Footer: Return to Operations Cockpit */}
        <div className="border-t border-[#1F2937] p-3">
          <NavLink
            to="/dashboard"
            className="flex items-center gap-2 rounded border border-[#1F2937] bg-[#0B0F19] px-3 py-2 text-xs text-gray-300 hover:border-cyan-500 hover:text-cyan-300 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 text-cyan-400 shrink-0" />
            {sidebarOpen && <span>Exit to EOC Operations</span>}
          </NavLink>
        </div>
      </aside>

      {/* Backdrop for mobile navigation drawer */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* =========================================================================
          MAIN CONTENT AREA
          ========================================================================= */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Header Bar */}
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-[#1F2937] bg-[#111827] px-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-1.5 rounded hover:bg-[#1F2937] text-gray-400 hover:text-white"
              aria-label="Open mobile menu"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Breadcrumb Hierarchy */}
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="text-gray-400 hidden sm:inline">Workspace</span>
              <ChevronRight className="h-3 w-3 text-gray-600 hidden sm:inline" />
              <span className="font-semibold text-cyan-400">{currentSection.title}</span>
            </div>
          </div>

          {/* Right Action Tools: Save status, Reset, Quick Export */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Save Status Indicator */}
            <div className="flex items-center gap-2 px-2 py-1 rounded bg-[#0B0F19] border border-[#1F2937] text-xs font-mono">
              {saveStatus === "Saved" && (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="hidden md:inline text-gray-400">Persistent:</span>
                  <span className="text-emerald-400">Saved</span>
                </>
              )}
              {saveStatus === "Saving..." && (
                <>
                  <RefreshCw className="h-3.5 w-3.5 text-cyan-400 animate-spin" />
                  <span className="text-cyan-400">Saving...</span>
                </>
              )}
              {saveStatus === "Unsaved changes" && (
                <>
                  <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
                  <span className="text-amber-400 font-semibold">Unsaved</span>
                  <button
                    onClick={saveNow}
                    className="ml-1 rounded bg-amber-500/20 px-1.5 py-0.5 text-[10px] text-amber-300 hover:bg-amber-500/30 font-bold"
                  >
                    Save
                  </button>
                </>
              )}
              {saveStatus === "Error" && (
                <>
                  <AlertCircle className="h-3.5 w-3.5 text-red-400" />
                  <span className="text-red-400">Save Error</span>
                </>
              )}
            </div>

            {/* Version Badge */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded border border-cyan-900 bg-cyan-950/60 text-cyan-400 text-xs font-mono">
              <span>{state.version}</span>
            </div>

            {/* Quick Export Button */}
            <NavLink
              to="/spec/export-center"
              className="flex items-center gap-1.5 rounded border border-[#1F2937] bg-[#0B0F19] px-2.5 py-1 text-xs text-gray-300 hover:border-cyan-500 hover:text-cyan-300 transition-colors"
              title="Export Full Specification"
            >
              <Download className="h-3.5 w-3.5 text-cyan-400" />
              <span className="hidden md:inline">Export</span>
            </NavLink>

            {/* Reset Defaults Button */}
            <button
              onClick={resetToDefault}
              className="hidden lg:flex items-center gap-1.5 rounded border border-gray-800 bg-[#0B0F19] px-2.5 py-1 text-xs text-gray-400 hover:text-red-300 hover:border-red-900 transition-colors"
              title="Reset all sections to authoritative repository audit baseline"
            >
              <RefreshCw className="h-3.5 w-3.5 text-gray-500" />
              <span>Reset</span>
            </button>
          </div>
        </header>

        {/* Scrollable Viewport Canvas */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-[#0B0F19]">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>

      {/* =========================================================================
          SEARCH MODAL (Ctrl+K)
          ========================================================================= */}
      {searchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-lg border border-[#1F2937] bg-[#111827] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-100">
            {/* Search Input Bar */}
            <div className="flex items-center border-b border-[#1F2937] px-4 py-3">
              <Search className="h-4 w-4 text-cyan-400 mr-3 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search across all 19 sections (e.g. FIFO, RBAC, REQ-001, BUG-001)..."
                autoFocus
                className="w-full bg-transparent text-sm text-white placeholder-gray-500 focus:outline-none"
              />
              <button
                onClick={() => setSearchModalOpen(false)}
                className="p-1 rounded text-gray-400 hover:text-white hover:bg-[#1F2937]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Search Results List */}
            <div className="max-h-96 overflow-y-auto p-2 divide-y divide-gray-800/50">
              {searchResults.length > 0 ? (
                searchResults.map((res, idx) => (
                  <button
                    key={`${res.id}-${idx}`}
                    onClick={() => {
                      setSearchModalOpen(false);
                      navigate(res.link);
                    }}
                    className="flex flex-col w-full text-left p-3 rounded hover:bg-[#1F2937] transition-colors group"
                  >
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-semibold text-cyan-400 group-hover:text-cyan-300">
                        {res.title}
                      </span>
                      <span className="rounded bg-gray-800 px-2 py-0.5 text-[10px] text-gray-400 font-mono">
                        {res.sectionTitle}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 line-clamp-2">{res.snippet}</p>
                  </button>
                ))
              ) : searchQuery.length >= 2 ? (
                <div className="py-8 text-center text-xs text-gray-500">
                  No matching specification records found for "{searchQuery}".
                </div>
              ) : (
                <div className="py-8 text-center text-xs text-gray-500">
                  Type at least 2 characters to search across Requirements, APIs, Tables, Bugs, Tests, and ADRs.
                </div>
              )}
            </div>

            {/* Footer Shortcut Info */}
            <div className="flex items-center justify-between border-t border-[#1F2937] bg-[#0B0F19] px-4 py-2 text-[11px] text-gray-500 font-mono">
              <span>Press ESC to close</span>
              <span>{searchResults.length} results matched</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
