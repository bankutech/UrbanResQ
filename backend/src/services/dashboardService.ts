import { query } from '../config/db';

export async function getCityStatus() {
  const rows = await query(`SELECT * FROM vw_city_emergency_status`);
  return rows[0];
}

export async function getActiveDisasters() {
  return query(`SELECT * FROM vw_active_disaster_summary ORDER BY FIELD(severity,'CRITICAL','HIGH','MODERATE','LOW')`);
}

export async function getSeverityDistribution() {
  return query(`
    SELECT severity, COUNT(*) AS disaster_count, SUM(affected_population) AS total_affected,
           SUM(CASE WHEN status = 'ACTIVE' THEN 1 ELSE 0 END) AS active_count
    FROM disasters GROUP BY severity ORDER BY FIELD(severity,'CRITICAL','HIGH','MODERATE','LOW')
  `);
}

export async function getRequestTrend() {
  return query(`
    WITH RECURSIVE date_spine AS (
      SELECT CURDATE() - INTERVAL 13 DAY AS d
      UNION ALL
      SELECT d + INTERVAL 1 DAY FROM date_spine WHERE d < CURDATE()
    ),
    daily_counts AS (
      SELECT DATE(created_at) AS d, COUNT(*) AS request_count,
             SUM(CASE WHEN urgency = 'CRITICAL' THEN 1 ELSE 0 END) AS critical_count
      FROM emergency_requests GROUP BY DATE(created_at)
    )
    SELECT ds.d AS day, COALESCE(dc.request_count,0) AS request_count,
           COALESCE(dc.critical_count,0) AS critical_count
    FROM date_spine ds LEFT JOIN daily_counts dc ON dc.d = ds.d ORDER BY ds.d
  `);
}

export async function getRecentActivity(limit = 15) {
  return query(
    `SELECT audit_id, user_id, action, entity_type, entity_id, created_at
     FROM audit_logs ORDER BY created_at DESC LIMIT ?`,
    [limit]
  );
}

export async function getResourceUtilizationSummary() {
  return query(`SELECT * FROM vw_resource_utilization ORDER BY utilization_rank LIMIT 8`);
}
