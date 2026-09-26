import { query } from '../config/db';

export async function getResponsePerformance() {
  return query(
    `SELECT rp.*, d.title FROM vw_response_performance rp JOIN disasters d ON d.disaster_id = rp.disaster_id`
  );
}

export async function getRequestsBySeverity() {
  return query(
    `SELECT urgency, COUNT(*) AS count FROM emergency_requests GROUP BY urgency
     ORDER BY FIELD(urgency,'CRITICAL','HIGH','MEDIUM','LOW')`
  );
}

export async function getRequestsByCategory() {
  return query(`SELECT category, COUNT(*) AS count FROM emergency_requests GROUP BY category ORDER BY count DESC`);
}

export async function getRequestsByZone() {
  return query(
    `SELECT z.zone_name, z.zone_code, COUNT(er.request_id) AS unresolved_count
     FROM disaster_zones z LEFT JOIN emergency_requests er
       ON er.zone_id = z.zone_id AND er.status NOT IN ('RESOLVED','CANCELLED')
     GROUP BY z.zone_id, z.zone_name, z.zone_code
     ORDER BY unresolved_count DESC`
  );
}

export async function getResolutionRate() {
  const rows: any[] = await query(
    `SELECT
        COUNT(*) AS total,
        SUM(CASE WHEN status = 'RESOLVED' THEN 1 ELSE 0 END) AS resolved,
        ROUND(100 * SUM(CASE WHEN status = 'RESOLVED' THEN 1 ELSE 0 END) / COUNT(*), 1) AS resolution_rate_pct
     FROM emergency_requests`
  );
  return rows[0];
}

export async function getResourceConsumptionTrend() {
  return query(
    `WITH RECURSIVE date_spine AS (
        SELECT CURDATE() - INTERVAL 13 DAY AS d
        UNION ALL SELECT d + INTERVAL 1 DAY FROM date_spine WHERE d < CURDATE()
     ),
     daily AS (
        SELECT DATE(created_at) AS d, SUM(quantity) AS consumed
        FROM resource_movements WHERE movement_type = 'ALLOCATION' GROUP BY DATE(created_at)
     )
     SELECT ds.d AS day, COALESCE(daily.consumed, 0) AS consumed
     FROM date_spine ds LEFT JOIN daily ON daily.d = ds.d ORDER BY ds.d`
  );
}
