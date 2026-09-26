import React, { memo } from "react";
import { Skeleton, EmptyState, ErrorState } from "./ui";

export interface Column<T> {
  header: string;
  render: (row: T) => React.ReactNode;
  className?: string;
}

export function DataTable<T>({
  columns, rows, loading, error, onRetry, emptyMessage = "No records found.", onRowClick,
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

  return (
    <div className="overflow-x-auto rounded-md">
      <table className="eoc-table">
        <thead>
          <tr>
            {columns.map((c, i) => (
              <th key={i} className={c.className || ""}>{c.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading &&
            Array.from({ length: 6 }).map((_, i) => (
              <tr key={i}>
                {columns.map((_, j) => (
                  <td key={j}><Skeleton className="h-4" /></td>
                ))}
              </tr>
            ))}
          {!loading && rows && rows.length > 0 && rows.map((row, i) => (
            <tr
              key={i}
              onClick={() => onRowClick?.(row)}
              className={onRowClick ? "clickable" : ""}
            >
              {columns.map((c, j) => (
                <td key={j} className={c.className || ""}>{c.render(row)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {!loading && rows && rows.length === 0 && <EmptyState message={emptyMessage} />}
    </div>
  );
}
