import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

export const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'urbanresq',
  waitForConnections: true,
  connectionLimit: 15,
  queueLimit: 0,
  decimalNumbers: true, // return DECIMAL columns as JS numbers, not strings
  multipleStatements: false,
});

/** Run a query with parameters. Prevents SQL injection via mysql2 placeholders. */
export async function query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
  const [rows] = await pool.query(sql, params);
  return rows as T[];
}

/** Get a dedicated connection for multi-statement transactions / CALL with multiple result sets. */
export async function getConnection() {
  return pool.getConnection();
}
