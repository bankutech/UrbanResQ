import React, { useState } from 'react';
import { Database, ChevronDown, ChevronUp, Terminal, ShieldCheck, Cpu, HardDrive } from 'lucide-react';
import { Panel, PageHeader, StatCard, Button } from '../components/ui';

interface Feature {
  title: string;
  what: string;
  why: string;
  useCase: string;
  sql: string;
}

const FEATURES: Feature[] = [
  {
    title: 'Recursive Common Table Expressions (CTEs)',
    what: 'A self-referencing CTE that generates continuous time-series sequences dynamically.',
    why: 'Emergency incident charts require unbroken time windows, including quiet hours with zero incoming requests. Simple GROUP BY statements silently omit missing timestamps, skewing predictive models.',
    useCase: 'Date-spine sequence generation for the 14-day rolling incident trend chart across Dashboard and Analytics.',
    sql: `WITH RECURSIVE date_spine AS (
  SELECT CURDATE() - INTERVAL 13 DAY AS d
  UNION ALL
  SELECT d + INTERVAL 1 DAY FROM date_spine WHERE d < CURDATE()
)
SELECT ds.d, COALESCE(dc.request_count, 0)
FROM date_spine ds
LEFT JOIN daily_counts dc ON dc.d = ds.d;`,
  },
  {
    title: 'Window Functions (DENSE_RANK & PERCENTILE)',
    what: 'Partitioned analytic functions calculating relative order without collapsing rows.',
    why: 'Triage prioritization is inherently comparative. Determining whether an incident is top-priority within its zone requires relative rank against concurrent emergencies.',
    useCase: '`vw_emergency_request_priority` ranks active calls per geographic zone; `vw_response_performance` calculates P90 response latencies.',
    sql: `DENSE_RANK() OVER (
  PARTITION BY er.zone_id
  ORDER BY computed_priority_score DESC
) AS rank_in_zone`,
  },
  {
    title: 'ACID Transactional Stored Procedures',
    what: 'Atomic server-side stored procedure routines executed with FOR UPDATE row locks.',
    why: 'Concurrent allocation dispatch requests must never overcommit limited depot medical supplies. The routine locks rows, deducts oldest unexpired FIFO batches, and logs audit events atomically.',
    useCase: '`sp_generate_resource_allocation_plan()` — allocation engine. `sp_admit_patient()` — ICU capacity checked hospital admission.',
    sql: `CALL sp_generate_resource_allocation_plan(
  :disaster_id, :dry_run, :run_by
);`,
  },
  {
    title: 'Automated Database Triggers',
    what: 'Autonomous server-side event hooks firing immediately post-INSERT or post-UPDATE.',
    why: 'Safety buffers (hospital bed counts, shelter beds, supply shortage alerts) must remain mathematically consistent even if backend services restart or manual DB updates occur.',
    useCase: '`trg_hospital_admission_bed_update`, `trg_shelter_checkin`, `trg_inventory_shortage_detect`, `trg_request_status_history`.',
    sql: `CREATE TRIGGER trg_inventory_shortage_detect
AFTER UPDATE ON resource_inventory
FOR EACH ROW
BEGIN
  IF NEW.available_quantity <= NEW.min_threshold THEN
    INSERT INTO resource_shortages (inventory_id, deficit) 
    VALUES (NEW.inventory_id, NEW.min_threshold - NEW.available_quantity);
  END IF;
END;`,
  },
  {
    title: 'Aggregated Schema Views',
    what: 'Real-time multi-table virtual views centralizing complex joins for high-frequency queries.',
    why: 'High-frequency EOC telemetry requests require sub-5ms query execution times. Pre-aggregated views eliminate repeated expensive multi-table joins.',
    useCase: '`vw_active_disaster_summary`, `vw_hospital_capacity`, `vw_resource_health`.',
    sql: `CREATE OR REPLACE VIEW vw_hospital_capacity AS
SELECT h.hospital_id, h.name, h.available_beds, h.total_beds,
       ROUND(((h.total_beds - h.available_beds) / h.total_beds) * 100, 1) AS occupancy_pct
FROM hospitals h;`,
  },
];

export default function DatabaseIntelligencePage() {
  const [expanded, setExpanded] = useState<number | null>(0);

  return (
    <div className="space-y-4 font-sans">
      <PageHeader
        title="MySQL 8.4 Enterprise Database Intelligence"
        subtitle="Architectural transparency of the 55-table relational schema, atomic stored procedures, and FIFO triggers"
        freshness="MySQL 8.4 InnoDB ACID Engine"
      />

      {/* Architecture Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard 
          label="Relational Tables" 
          value="55 TABLES" 
          tone="info"
          icon={Database}
          sub="Strict 3NF normalized"
        />
        <StatCard 
          label="ACID Stored Procedures" 
          value="12 PROCEDURES" 
          tone="normal"
          icon={Cpu}
          sub="Atomic FIFO allocations"
        />
        <StatCard 
          label="Automated Triggers" 
          value="18 TRIGGERS" 
          tone="normal"
          icon={ShieldCheck}
          sub="Shortage & audit automation"
        />
        <StatCard 
          label="Aggregated Views" 
          value="14 VIEWS" 
          tone="normal"
          icon={HardDrive}
          sub="Sub-5ms query optimization"
        />
      </div>

      <div className="space-y-3">
        {FEATURES.map((f, i) => {
          const isOpen = expanded === i;
          return (
            <Panel key={i} noPadding className="border-eoc-border">
              <button
                onClick={() => setExpanded(isOpen ? null : i)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-eoc-panel2 transition-colors"
                aria-expanded={isOpen}
              >
                <div className="flex items-center gap-2.5">
                  <Terminal size={15} className="text-cyan-400 shrink-0" />
                  <span className="font-bold text-sm text-eoc-text font-display">
                    {f.title}
                  </span>
                </div>
                {isOpen ? <ChevronUp size={16} className="text-eoc-muted" /> : <ChevronDown size={16} className="text-eoc-muted" />}
              </button>

              {isOpen && (
                <div className="p-4 border-t border-eoc-border bg-eoc-panel2/40 space-y-3 font-mono text-xs">
                  <div>
                    <span className="text-[10px] text-eoc-muted uppercase font-bold block mb-1">Concept Definition:</span>
                    <p className="text-eoc-text">{f.what}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-eoc-muted uppercase font-bold block mb-1">Mission Rationale:</span>
                    <p className="text-eoc-muted">{f.why}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-cyan-400 uppercase font-bold block mb-1">Production Implementation:</span>
                    <p className="text-slate-300 font-semibold">{f.useCase}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-eoc-muted uppercase font-bold block mb-1">SQL Definition:</span>
                    <pre className="rounded border border-eoc-border bg-[#090D16] p-3 text-[11px] text-cyan-300 overflow-x-auto leading-relaxed select-all">
                      {f.sql}
                    </pre>
                  </div>
                </div>
              )}
            </Panel>
          );
        })}
      </div>
    </div>
  );
}
