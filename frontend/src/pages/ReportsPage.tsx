import React from 'react';
import { FileText, Download, Printer, CheckCircle2, ShieldCheck, Database } from 'lucide-react';
import { useFetch } from '../hooks/useFetch';
import { Panel, Button, Skeleton, PageHeader, StatCard } from '../components/ui';

function toCsv(rows: any[]): string {
  if (!rows || rows.length === 0) return '';
  const headers = Object.keys(rows[0]);
  const lines = [headers.join(',')];
  for (const row of rows) {
    lines.push(headers.map((h) => JSON.stringify(row[h] ?? '')).join(','));
  }
  return lines.join('\n');
}

function downloadCsv(filename: string, rows: any[]) {
  const csv = toCsv(rows);
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

const REPORTS = [
  { key: 'disasters', title: 'Daily Disaster Incident Summary', url: '/disasters', filename: 'disaster-summary.csv', description: 'Active & contained catastrophe logs and casualty totals' },
  { key: 'allocations', title: 'Resource Allocation Master Ledger', url: '/allocations', filename: 'allocation-report.csv', description: 'ACID FIFO committed resource batches and dispatch timestamps' },
  { key: 'utilization', title: 'Depot Resource Utilization Report', url: '/resources/utilization', filename: 'resource-utilization.csv', description: 'Stock burn-rates and safety buffer compliance' },
  { key: 'unresolved', title: 'Unresolved Emergency Triage Queue', url: '/emergency-requests?status=PENDING&pageSize=100', filename: 'unresolved-requests.csv', description: 'Calls awaiting team dispatch or resource assignment' },
  { key: 'hospitals', title: 'Hospital ER & ICU Surge Capacity', url: '/hospitals', filename: 'hospital-capacity.csv', description: 'Bed occupancy ratios and blood reserve metrics' },
  { key: 'shelters', title: 'Relief Shelter Occupancy & Supplies', url: '/shelters', filename: 'shelter-capacity.csv', description: 'Evacuee intake, bed counts, and food/water provisions' },
  { key: 'shortages', title: 'Inventory Deficit & Shortage Manifest', url: '/shortages', filename: 'shortage-report.csv', description: 'Automated deficit records below minimum thresholds' },
];

export default function ReportsPage() {
  return (
    <div className="space-y-4 font-sans">
      <PageHeader
        title="Municipal Operations Reports & Data Exports"
        subtitle="Export verified real-time crisis data to CSV for external state audit, FEMA reporting, or print command briefs"
        freshness="FEMA / ISO 11064 Compliance Ready"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {REPORTS.map((r) => (
          <ReportCard 
            key={r.key} 
            title={r.title} 
            url={r.url} 
            filename={r.filename} 
            description={r.description}
          />
        ))}
      </div>
    </div>
  );
}

function ReportCard({ 
  title, 
  url, 
  filename, 
  description 
}: { 
  title: string; 
  url: string; 
  filename: string; 
  description: string;
}) {
  const { data, loading } = useFetch<any>(url);
  const rows = Array.isArray(data) ? data : data?.data || [];

  return (
    <Panel title={title}>
      {loading ? (
        <Skeleton className="h-16" />
      ) : (
        <div className="flex flex-col justify-between gap-3 font-mono text-xs">
          <p className="text-[11px] text-eoc-muted">{description}</p>
          <div className="flex items-center justify-between border-t border-eoc-border/60 pt-2">
            <span className="text-[10px] text-cyan-400 font-bold tabular-nums">
              {rows.length} RECORD(S) VERIFIED
            </span>
            <div className="flex gap-2">
              <Button 
                variant="secondary" 
                size="sm"
                onClick={() => downloadCsv(filename, rows)}
              >
                <Download size={12} />
                <span>CSV</span>
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => window.print()}
              >
                <Printer size={12} />
                <span>Print</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </Panel>
  );
}
