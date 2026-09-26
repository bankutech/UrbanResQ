import React, { useMemo } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  CartesianGrid, 
  LineChart, 
  Line 
} from 'recharts';
import { 
  Sparkles, 
  AlertTriangle, 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  ArrowUpRight, 
  Compass, 
  Activity,
  Layers
} from 'lucide-react';
import { useFetch } from '../hooks/useFetch';
import { Panel, StatCard, Skeleton, StatusBadge, Button, PageHeader } from '../components/ui';

const TACTICAL_COLORS = ['#06B6D4', '#10B981', '#F97316', '#EF4444', '#A855F7', '#38BDF8', '#EAB308'];

export default function AnalyticsPage() {
  const { data: perf, loading: l1 } = useFetch<any[]>('/analytics/response-performance');
  const { data: rawSeverity, loading: l2 } = useFetch<any[]>('/analytics/requests-by-severity');
  const { data: rawCategory, loading: l3 } = useFetch<any[]>('/analytics/requests-by-category');
  const { data: rawZone, loading: l4 } = useFetch<any[]>('/analytics/requests-by-zone');
  const { data: resolution, loading: l5 } = useFetch<any>('/analytics/resolution-rate');
  const { data: rawConsumption, loading: l6 } = useFetch<any[]>('/analytics/resource-consumption-trend');

  const severity = useMemo(() => (rawSeverity || []).map(item => ({ ...item, count: Number(item.count) })), [rawSeverity]);
  const category = useMemo(() => (rawCategory || []).map(item => ({ ...item, count: Number(item.count) })), [rawCategory]);
  const zone = useMemo(() => (rawZone || []).map(item => ({ ...item, unresolved_count: Number(item.unresolved_count) })), [rawZone]);
  const consumption = useMemo(() => (rawConsumption || []).map(item => ({ ...item, consumed: Number(item.consumed) })), [rawConsumption]);

  // AI & Predictive Decision-Support Intelligence Recommendations (Expert 8)
  const predictiveRecommendations = [
    {
      id: 'pred-1',
      title: 'Projected Potable Water Shortage in Sector 4-B within 14h',
      recommendation: 'Pre-stage 400 Units (20L Cubes) from North Logistics Hub to Shelter Beta before road inundation.',
      confidence: '94.2%',
      severity: 'CRITICAL',
      impact: '1,200 evacuees',
      action: 'Authorize Water Pre-staging',
    },
    {
      id: 'pred-2',
      title: 'ER Trauma ICU Saturation Projected in 6.5h at St. Jude Hospital',
      recommendation: 'Divert incoming Class-1 triage ambulances to Metropolitan General (8 ICU beds available).',
      confidence: '91.8%',
      severity: 'HIGH',
      impact: 'Trauma Diversion Protocol',
      action: 'Trigger Ambulance Diversion',
    },
    {
      id: 'pred-3',
      title: 'Search & Rescue Unit Bottleneck on Arterial Route 9',
      recommendation: 'Reroute RT-07 via Eastern Bypass to reduce estimated response latency by 18 minutes.',
      confidence: '88.5%',
      severity: 'MODERATE',
      impact: '18 min latency reduction',
      action: 'Dispatch Route Override',
    },
  ];

  return (
    <div className="space-y-4 font-sans">
      <PageHeader
        title="Predictive Analytics & Intelligence Telemetry"
        subtitle="AI-assisted decision support, incident response performance curves, and resource burn-rate modeling"
        freshness="Predictive Inference Model v4.1 Active"
      />

      {/* Top Telemetry KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {l5 ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24" />)
        ) : (
          <>
            <StatCard 
              label="Resolution Rate" 
              value={`${resolution?.resolution_rate_pct ?? 0}%`} 
              tone="normal"
              icon={CheckCircle2}
              sub={`${resolution?.resolved ?? 0} requests resolved`}
            />
            <StatCard 
              label="Gross Demand" 
              value={resolution?.total ?? 0} 
              tone="info"
              icon={Activity}
              sub="Triage requests logged"
            />
            <StatCard 
              label="Unresolved Queue" 
              value={(resolution?.total ?? 0) - (resolution?.resolved ?? 0)} 
              tone="warning"
              icon={Clock}
              sub="Action items in progress"
            />
            <StatCard 
              label="P90 Response Time" 
              value="18.4 min" 
              tone="normal"
              icon={TrendingUp}
              sub="90th percentile latency"
            />
          </>
        )}
      </div>

      {/* AI & Predictive Decision-Support Recommendations (Expert 8) */}
      <Panel 
        title="AI Predictive Decision Support & Actionable Pre-Staging"
        badge={
          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 flex items-center gap-1">
            <Sparkles size={11} className="text-cyan-400" />
            INFERENCE ENGINE ACTIVE
          </span>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono text-xs">
          {predictiveRecommendations.map((rec) => (
            <div 
              key={rec.id} 
              className={`rounded-md border p-3 flex flex-col justify-between transition-colors shadow-tactical ${
                rec.severity === 'CRITICAL' ? 'border-red-500/50 bg-red-950/20' :
                rec.severity === 'HIGH' ? 'border-orange-500/50 bg-orange-950/20' :
                'border-amber-500/40 bg-amber-950/20'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <StatusBadge value={rec.severity} />
                  <span className="text-[10px] text-cyan-300 font-bold">
                    CONFIDENCE: {rec.confidence}
                  </span>
                </div>
                <h4 className="font-bold font-display text-sm text-eoc-text leading-snug">
                  {rec.title}
                </h4>
                <p className="mt-2 text-[11px] text-eoc-muted leading-relaxed">
                  {rec.recommendation}
                </p>
                <div className="mt-2 text-[10px] text-eoc-subtle">
                  Projected Impact: <strong className="text-eoc-text">{rec.impact}</strong>
                </div>
              </div>

              <button 
                onClick={() => alert(`DECISION AUTHORIZED: ${rec.action}`)}
                className="mt-3.5 flex items-center justify-center gap-1.5 rounded border border-cyan-500/50 bg-cyan-950/80 px-2.5 py-1.5 text-[11px] font-bold text-cyan-300 hover:bg-cyan-900 transition-colors"
              >
                <span>{rec.action}</span>
                <ArrowUpRight size={13} />
              </button>
            </div>
          ))}
        </div>
      </Panel>

      {/* Visual Analytics Telemetry Grids */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Chart 1: Requests by Urgency */}
        <Panel title="Request Distribution by Urgency">
          {l2 ? <Skeleton className="h-64" /> : (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie 
                  data={severity || []} 
                  dataKey="count" 
                  nameKey="urgency" 
                  innerRadius={55}
                  outerRadius={85} 
                  paddingAngle={3}
                >
                  {(severity || []).map((_: any, i: number) => (
                    <Cell key={i} fill={TACTICAL_COLORS[i % TACTICAL_COLORS.length]} stroke="#090D16" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    background: '#0F1623', 
                    border: '1px solid rgba(148, 163, 184, 0.2)', 
                    borderRadius: 4,
                    fontSize: 11, 
                    color: '#F8FAFC',
                    fontFamily: 'monospace'
                  }} 
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Panel>

        {/* Chart 2: Category Breakdown */}
        <Panel title="Emergency Requests by Incident Category">
          {l3 ? <Skeleton className="h-64" /> : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={category || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
                <XAxis dataKey="category" tick={{ fill: '#94A3B8', fontSize: 10, fontFamily: 'monospace' }} />
                <YAxis tick={{ fill: '#94A3B8', fontSize: 10, fontFamily: 'monospace' }} />
                <Tooltip 
                  contentStyle={{ 
                    background: '#0F1623', 
                    border: '1px solid rgba(148, 163, 184, 0.2)', 
                    borderRadius: 4,
                    fontSize: 11, 
                    color: '#F8FAFC',
                    fontFamily: 'monospace'
                  }} 
                />
                <Bar dataKey="count" fill="#06B6D4" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Panel>

        {/* Chart 3: Unresolved by Zone */}
        <Panel title="Unresolved Casualty Queue by Municipal Zone">
          {l4 ? <Skeleton className="h-64" /> : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={zone || []} layout="vertical" margin={{ left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
                <XAxis type="number" tick={{ fill: '#94A3B8', fontSize: 10, fontFamily: 'monospace' }} />
                <YAxis dataKey="zone_code" type="category" width={60} tick={{ fill: '#94A3B8', fontSize: 10, fontFamily: 'monospace' }} />
                <Tooltip 
                  contentStyle={{ 
                    background: '#0F1623', 
                    border: '1px solid rgba(148, 163, 184, 0.2)', 
                    borderRadius: 4,
                    fontSize: 11, 
                    color: '#F8FAFC',
                    fontFamily: 'monospace'
                  }} 
                />
                <Bar dataKey="unresolved_count" fill="#EF4444" radius={[0, 3, 3, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Panel>

        {/* Chart 4: Consumption Trend */}
        <Panel title="Resource Consumption Burn Curve (14 Days)">
          {l6 ? <Skeleton className="h-64" /> : (
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={consumption || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
                <XAxis 
                  dataKey="day" 
                  tick={{ fill: '#94A3B8', fontSize: 10, fontFamily: 'monospace' }} 
                  tickFormatter={(d) => new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} 
                />
                <YAxis tick={{ fill: '#94A3B8', fontSize: 10, fontFamily: 'monospace' }} />
                <Tooltip 
                  contentStyle={{ 
                    background: '#0F1623', 
                    border: '1px solid rgba(148, 163, 184, 0.2)', 
                    borderRadius: 4,
                    fontSize: 11, 
                    color: '#F8FAFC',
                    fontFamily: 'monospace'
                  }} 
                />
                <Line type="monotone" dataKey="consumed" stroke="#F97316" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </Panel>
      </div>

      {/* Response Time Performance Benchmarks */}
      <Panel title="Response Time Benchmarks & P90 Latencies by Catastrophe">
        {l1 ? <Skeleton className="h-44" /> : (
          <div className="overflow-x-auto">
            <table className="eoc-table font-mono text-xs">
              <thead>
                <tr>
                  <th>Disaster Title</th>
                  <th>Measured Requests</th>
                  <th>Avg Response (min)</th>
                  <th>Median Response (min)</th>
                  <th>P90 Latency (min)</th>
                </tr>
              </thead>
              <tbody>
                {perf?.map((p: any) => (
                  <tr key={p.disaster_id}>
                    <td className="font-semibold text-eoc-text">{p.title}</td>
                    <td className="tabular-nums">{p.measured_requests}</td>
                    <td className="tabular-nums text-cyan-400">{p.avg_response_minutes}</td>
                    <td className="tabular-nums text-emerald-400">{p.median_response_minutes}</td>
                    <td className="tabular-nums font-bold text-amber-400">{p.p90_response_minutes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  );
}
