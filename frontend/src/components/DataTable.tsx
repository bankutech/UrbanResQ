import React, { memo } from "react";
import { Skeleton, EmptyState, ErrorState } from "./ui";

export interface Column<T> {
  header: string;
  render: (row: T) => React.ReactNode;
  className?: string;
}

export function DataTable<T>({
  columns,
  rows,
  loading,
  error,
  onRetry,
  emptyMessage = "No records found.",
  onRowClick,
}: {
  columns: Column<T>[];
  rows: T[] | null | undefined;
  loading: boolean;
  error?: string | null;
  onRetry?: () => void;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
}) {
  if (error) return <ErrorState message={error} onRetry={onRetry} />;

  const isEmpty = !loading && rows && rows.length === 0;

  return (
    <div className="w-full">
      {/* 1. DESKTOP & TABLET VIEW: High-density EOC Data Table */}
      <div className="hidden md:block overflow-x-auto rounded-md border border-eoc-border bg-eoc-panel">
        <table className="eoc-table w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-eoc-border bg-eoc-panel2/50 text-xs font-mono uppercase tracking-wider text-eoc-muted">
              {columns.map((c, i) => (
                <th key={i} className={`p-3 ${c.className || ""}`}>{c.header}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-eoc-border/50 text-xs">
            {loading &&
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  {columns.map((_, j) => (
                    <td key={j} className="p-3"><Skeleton className="h-4 w-full" /></td>
                  ))}
                </tr>
              ))}
            {!loading && rows && rows.length > 0 && rows.map((row, i) => (
              <tr
                key={i}
                onClick={() => onRowClick?.(row)}
                className={`transition-colors hover:bg-eoc-panel2/40 ${onRowClick ? "cursor-pointer" : ""}`}
              >
                {columns.map((c, j) => (
                  <td key={j} className={`p-3 align-middle ${c.className || ""}`}>{c.render(row)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {isEmpty && <EmptyState message={emptyMessage} />}
      </div>

      {/* 2. MOBILE VIEW: Scannable Tactical Cards (Under 768px Viewports) */}
      <div className="md:hidden space-y-3">
        {loading &&
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-lg border border-eoc-border bg-eoc-panel p-3.5 space-y-2.5">
              <Skeleton className="h-5 w-1/3" />
              <div className="grid grid-cols-2 gap-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </div>
              <Skeleton className="h-7 w-full" />
            </div>
          ))}

        {!loading && rows && rows.length > 0 && rows.map((row, i) => {
          const firstCol = columns[0];
          const otherCols = columns.slice(1);
          return (
            <div
              key={i}
              onClick={() => onRowClick?.(row)}
              className={`rounded-lg border border-eoc-border bg-eoc-panel p-3.5 transition-all shadow-tactical hover:border-eoc-border2 ${onRowClick ? "cursor-pointer active:scale-[0.99]" : ""}`}
            >
              {/* Card Header (Primary Column) */}
              <div className="flex items-center justify-between pb-2.5 border-b border-eoc-border/60">
                <div className="font-semibold text-eoc-text text-sm">
                  {firstCol ? firstCol.render(row) : null}
                </div>
              </div>

              {/* Card Field Grid */}
              <div className="py-2.5 space-y-2 text-xs">
                {otherCols.map((c, j) => {
                  const isLastActionCol = j === otherCols.length - 1 && c.header.toLowerCase().includes('action');
                  if (isLastActionCol) return null;
                  return (
                    <div key={j} className="flex items-center justify-between gap-2">
                      <span className="font-mono text-[11px] uppercase tracking-wider text-eoc-muted shrink-0">
                        {c.header}:
                      </span>
                      <div className="text-right text-eoc-text font-medium truncate">
                        {c.render(row)}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Card Footer (Actions, if present) */}
              {otherCols.length > 0 && otherCols[otherCols.length - 1].header.toLowerCase().includes('action') && (
                <div className="pt-2.5 border-t border-eoc-border/60 flex items-center justify-end gap-2">
                  {otherCols[otherCols.length - 1].render(row)}
                </div>
              )}
            </div>
          );
        })}

        {isEmpty && <EmptyState message={emptyMessage} />}
      </div>
    </div>
  );
}
