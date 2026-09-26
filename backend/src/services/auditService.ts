import { query } from '../config/db';

export async function listAuditLogs(filters: { entityType?: string; userId?: string; page?: number; pageSize?: number }) {
  const page = filters.page && filters.page > 0 ? filters.page : 1;
  const pageSize = filters.pageSize && filters.pageSize > 0 && filters.pageSize <= 100 ? filters.pageSize : 25;
  const offset = (page - 1) * pageSize;

  const where: string[] = [];
  const params: any[] = [];
  if (filters.entityType) { where.push('a.entity_type = ?'); params.push(filters.entityType); }
  if (filters.userId) { where.push('a.user_id = ?'); params.push(filters.userId); }
  const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';

  const rows = await query(
    `SELECT a.*, u.full_name AS user_name FROM audit_logs a LEFT JOIN users u ON u.user_id = a.user_id
     ${whereClause} ORDER BY a.created_at DESC LIMIT ? OFFSET ?`,
    [...params, pageSize, offset]
  );
  const countRows: any[] = await query(`SELECT COUNT(*) AS total FROM audit_logs a ${whereClause}`, params);
  return { data: rows, page, pageSize, total: countRows[0].total };
}
