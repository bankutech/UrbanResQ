// SECTION 8: AUTHENTICATION & AUTHORIZATION
// JWT Bearer tokens, 7-tier role architecture, and backend-enforced RBAC permission matrix

import React from "react";
import {
  KeyRound,
  ShieldCheck,
  Lock,
  Users,
  CheckCircle2,
  XCircle,
  AlertTriangle
} from "lucide-react";
import { useSpecWorkspace } from "../context";

export default function Section8Auth() {
  const { state } = useSpecWorkspace();
  const auth = state.authSpec;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between border-b border-[#1F2937] pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-wider">
            <KeyRound className="h-4 w-4" />
            <span>Specification Section 08</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white mt-1">
            Authentication, JWT Tokens & Role-Based Access Control
          </h1>
          <p className="text-sm text-gray-400 mt-1 max-w-3xl">
            Stateless JWT token issuance, bcrypt 10-round password hashing, and granular backend-enforced permissions across 7 operational command roles.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded bg-purple-950 border border-purple-800 px-2.5 py-1 text-xs font-mono text-purple-300">
            7 Hierarchical Roles
          </span>
        </div>
      </div>

      {/* Security Architecture Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-lg border border-[#1F2937] bg-[#111827] p-4 text-xs space-y-1">
          <span className="font-mono text-cyan-400 font-bold uppercase text-[10px]">Auth Strategy</span>
          <div className="text-sm font-semibold text-white">Stateless JWT Bearer</div>
          <p className="text-gray-400 text-[11px] pt-1">{auth.strategy}</p>
        </div>

        <div className="rounded-lg border border-[#1F2937] bg-[#111827] p-4 text-xs space-y-1">
          <span className="font-mono text-cyan-400 font-bold uppercase text-[10px]">Token Lifetime</span>
          <div className="text-sm font-semibold text-white">{auth.tokenLifetime}</div>
          <p className="text-gray-400 text-[11px] pt-1">
            Enforced via jsonwebtoken verify middleware on every protected API call.
          </p>
        </div>

        <div className="rounded-lg border border-[#1F2937] bg-[#111827] p-4 text-xs space-y-1">
          <span className="font-mono text-cyan-400 font-bold uppercase text-[10px]">Password Storage</span>
          <div className="text-sm font-semibold text-white">{auth.passwordHashing}</div>
          <p className="text-gray-400 text-[11px] pt-1">
            Zero plain-text passwords stored; validated via bcrypt.compare.
          </p>
        </div>
      </div>

      {/* 7 Operational Roles Matrix */}
      <div className="rounded-lg border border-[#1F2937] bg-[#111827] p-5 space-y-3">
        <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400">
          Defined Roles & Scopes
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {auth.roles.map((r) => (
            <div key={r.role} className="rounded border border-[#1F2937] bg-[#0B0F19] p-3 text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-white">{r.role}</span>
                <span className="rounded bg-cyan-950/60 border border-cyan-900 px-1.5 py-0.2 text-[10px] font-mono text-cyan-300">
                  {r.permissions.length} perms
                </span>
              </div>
              <p className="text-gray-400 text-[11px] leading-relaxed">{r.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Role-Permission Matrix Table */}
      <div className="rounded-lg border border-[#1F2937] bg-[#111827] p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400">
            Granular Role-Permission Enforcement Matrix
          </h2>
          <span className="text-[11px] text-gray-500 font-mono">Backend vs Frontend Guards</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#1F2937] bg-[#0B0F19] text-gray-400 font-mono text-[11px] uppercase">
                <th className="py-2.5 px-3">Module</th>
                <th className="py-2.5 px-3">Sensitive Operation</th>
                <th className="py-2.5 px-3">Authorized Roles</th>
                <th className="py-2.5 px-3 text-right">Enforcement Layer</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1F2937]/60">
              {auth.permissionMatrix.map((item, idx) => (
                <tr key={idx} className="hover:bg-[#1a2333] transition-colors">
                  <td className="py-2.5 px-3 font-mono font-bold text-cyan-400 whitespace-nowrap">
                    {item.module}
                  </td>
                  <td className="py-2.5 px-3 font-medium text-white">{item.action}</td>
                  <td className="py-2.5 px-3 font-mono text-[11px] text-gray-300">
                    <div className="flex flex-wrap gap-1">
                      {item.allowedRoles.map((role) => (
                        <span
                          key={role}
                          className="rounded bg-gray-800 px-1.5 py-0.2 text-[10px] text-gray-300"
                        >
                          {role}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-2.5 px-3 text-right whitespace-nowrap font-mono text-[11px]">
                    {item.backendEnforced ? (
                      <span className="inline-flex items-center gap-1 rounded bg-emerald-950 border border-emerald-800 px-2 py-0.5 text-emerald-300 font-semibold">
                        <CheckCircle2 className="h-3 w-3" />
                        <span>Backend Enforced</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded bg-amber-950 border border-amber-800 px-2 py-0.5 text-amber-300">
                        <AlertTriangle className="h-3 w-3" />
                        <span>UI Guard Only</span>
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
