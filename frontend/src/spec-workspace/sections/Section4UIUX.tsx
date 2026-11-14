// SECTION 4: UI/UX REQUIREMENTS
// Design system tokens, WCAG 2.2 AA contrast standards, responsive breakpoint matrices, and interaction behaviors

import React from "react";
import {
  Palette,
  CheckCircle2,
  Smartphone,
  Tablet,
  Monitor,
  Eye,
  Sliders,
  Sparkles,
  MousePointerClick
} from "lucide-react";
import { useSpecWorkspace } from "../context";

export default function Section4UIUX() {
  const { state } = useSpecWorkspace();
  const uiux = state.uiuxSpec;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between border-b border-[#1F2937] pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-wider">
            <Palette className="h-4 w-4" />
            <span>Specification Section 04</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white mt-1">
            UI/UX Design System & Interface Standards
          </h1>
          <p className="text-sm text-gray-400 mt-1 max-w-3xl">
            Design tokens, color contrast compliance, responsive breakpoint rules, and interaction patterns engineered for emergency management operations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded bg-emerald-950 border border-emerald-800 px-2.5 py-1 text-xs font-mono text-emerald-300">
            WCAG 2.2 AA Compliant
          </span>
        </div>
      </div>

      {/* Core Design Principles */}
      <div className="rounded-lg border border-[#1F2937] bg-[#111827] p-5">
        <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400 mb-3">
          Core Interface Principles
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {uiux.designPrinciples.map((prin, i) => (
            <div key={i} className="rounded border border-[#1F2937] bg-[#0B0F19] p-3 text-xs">
              <span className="font-mono text-cyan-400 font-bold block mb-1">0{i + 1}.</span>
              <p className="text-gray-300 leading-relaxed">{prin}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Color Palette Tokens */}
      <div className="rounded-lg border border-[#1F2937] bg-[#111827] p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400">
            Color Palette & Contrast Verification
          </h2>
          <span className="text-[11px] font-mono text-gray-500">Theme Tokens</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {uiux.colorPalette.map((color) => (
            <div
              key={color.token}
              className="flex items-center gap-3 rounded border border-[#1F2937] bg-[#0B0F19] p-3"
            >
              <div
                className="h-9 w-9 shrink-0 rounded border border-gray-700 shadow-sm"
                style={{ backgroundColor: color.hex }}
              />
              <div className="flex flex-col truncate text-xs">
                <div className="flex items-center gap-1.5 font-mono">
                  <span className="font-bold text-white">{color.token}</span>
                  <span className="text-gray-500 text-[10px]">{color.hex}</span>
                </div>
                <span className="text-gray-400 text-[11px] truncate">{color.role}</span>
                <span className="text-emerald-400 font-mono text-[10px] mt-0.5">
                  {color.contrastRatio}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Responsive Breakpoints Matrix */}
      <div className="rounded-lg border border-[#1F2937] bg-[#111827] p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400">
            Multi-Viewport Responsive Specification
          </h2>
          <span className="text-[11px] font-mono text-gray-400">
            Automated Headless Edge Verified
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {uiux.responsiveBreakpoints.map((bp) => (
            <div key={bp.name} className="rounded border border-[#1F2937] bg-[#0B0F19] p-4 text-xs space-y-2">
              <div className="flex items-center gap-2 text-cyan-400 font-semibold font-mono">
                {bp.name === "Mobile" ? (
                  <Smartphone className="h-4 w-4" />
                ) : bp.name === "Tablet" ? (
                  <Tablet className="h-4 w-4" />
                ) : (
                  <Monitor className="h-4 w-4" />
                )}
                <span>
                  {bp.name} ({bp.width})
                </span>
              </div>
              <p className="text-gray-300 leading-relaxed text-[11px]">{bp.rules}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Component & Interaction Standards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-lg border border-[#1F2937] bg-[#111827] p-5 space-y-3">
          <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400">
            Component Standards
          </h2>
          <div className="space-y-2">
            {uiux.componentStandards.map((std) => (
              <div key={std.component} className="rounded border border-[#1F2937] bg-[#0B0F19] p-3 text-xs">
                <span className="font-semibold text-white font-mono block mb-1">{std.component}</span>
                <p className="text-gray-400 text-[11px] leading-relaxed">{std.rules}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-[#1F2937] bg-[#111827] p-5 space-y-3">
          <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400">
            Interaction & Accessibility Rules
          </h2>
          <ul className="space-y-2 text-xs text-gray-300">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
              <span>Full keyboard focus rings on interactive elements (`focus-visible:ring-2 focus-visible:ring-cyan-500`).</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
              <span>Respects `prefers-reduced-motion` media queries by disabling radar sweeps and continuous spinners.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
              <span>Table rows highlight on hover without vertical or horizontal layout shifts.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
              <span>Destructive operations (Delete, Cancel Incident) mandate confirmation modals.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
