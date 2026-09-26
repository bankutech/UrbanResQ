/**
 * Seeds demo users with bcrypt-hashed passwords. Run after schema + seed.sql:
 *   npm run db:seed:users
 *
 * All demo accounts share the password: UrbanResQ@2026
 * (documented in README "Demo credentials" — change before any real deployment)
 */
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { pool } from '../config/db';

dotenv.config();

const DEMO_PASSWORD = 'UrbanResQ@2026';

const DEMO_USERS: { fullName: string; email: string; designation: string; role: string }[] = [
  { fullName: 'Ananya Ramaswamy', email: 'admin@urbanresq.city', designation: 'System Administrator', role: 'ADMIN' },
  { fullName: 'Vikram Mehta', email: 'manager@urbanresq.city', designation: 'Emergency Operations Manager', role: 'EMERGENCY_MANAGER' },
  { fullName: 'Sathish Kumar', email: 'officer@urbanresq.city', designation: 'Disaster Officer', role: 'DISASTER_OFFICER' },
  { fullName: 'Reema Nair', email: 'resources@urbanresq.city', designation: 'Resource Manager', role: 'RESOURCE_MANAGER' },
  { fullName: 'Dr. Fathima Begum', email: 'medical@urbanresq.city', designation: 'Medical Coordinator', role: 'MEDICAL_COORDINATOR' },
  { fullName: 'Arun Vijayan', email: 'rescue@urbanresq.city', designation: 'Rescue Coordinator', role: 'RESCUE_COORDINATOR' },
  { fullName: 'Observer Account', email: 'viewer@urbanresq.city', designation: 'Read-only Observer', role: 'VIEWER' },
  { fullName: 'Sagnik Mitra', email: 'sagnikmitra1302@gmail.com', designation: 'System Administrator', role: 'ADMIN' },
];

async function main() {
  const hash = await bcrypt.hash(DEMO_PASSWORD, 10);

  for (const u of DEMO_USERS) {
    const [existing] = await pool.query('SELECT user_id FROM users WHERE email = ?', [u.email]);
    let userId: string;
    if ((existing as any[]).length > 0) {
      userId = (existing as any[])[0].user_id;
      await pool.query('UPDATE users SET password_hash = ?, full_name = ?, designation = ? WHERE user_id = ?', [
        hash, u.fullName, u.designation, userId,
      ]);
    } else {
      userId = crypto.randomUUID();
      await pool.query(
        'INSERT INTO users (user_id, full_name, email, password_hash, designation, is_active) VALUES (?, ?, ?, ?, ?, 1)',
        [userId, u.fullName, u.email, hash, u.designation]
      );
    }

    const [roleRows] = await pool.query('SELECT role_id FROM roles WHERE role_name = ?', [u.role]);
    const roleId = (roleRows as any[])[0]?.role_id;
    if (roleId) {
      await pool.query('INSERT IGNORE INTO user_roles (user_id, role_id) VALUES (?, ?)', [userId, roleId]);
    }
    console.log(`Seeded user: ${u.email} (${u.role})`);
  }

  // Point disaster/citizen created_by references at the admin account (user_id may not be 1
  // if this script is re-run after manual edits, so re-map defensively).
  const [adminRows] = await pool.query('SELECT user_id FROM users WHERE email = ?', ['admin@urbanresq.city']);
  const adminId = (adminRows as any[])[0]?.user_id;
  if (adminId) {
    await pool.query("UPDATE disasters SET created_by = ? WHERE created_by = '1'", [adminId]);
  }

  console.log(`\nDemo password for all accounts: ${DEMO_PASSWORD}`);
  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
