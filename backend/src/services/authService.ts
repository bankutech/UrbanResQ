import bcrypt from 'bcryptjs';
import { query } from '../config/db';
import { ApiError } from '../utils/asyncHandler';
import { signToken } from '../middleware/auth';
import { Role } from '../types';

interface UserRow {
  user_id: string;
  full_name: string;
  email: string;
  password_hash: string;
  is_active: number;
}

export async function login(email: string, password: string) {
  const users = await query<UserRow>(
    `SELECT user_id, full_name, email, password_hash, is_active FROM users WHERE email = ? LIMIT 1`,
    [email]
  );
  const user = users[0];
  if (!user || !user.is_active) {
    throw new ApiError(401, 'INVALID_CREDENTIALS', 'Email or password is incorrect');
  }

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    throw new ApiError(401, 'INVALID_CREDENTIALS', 'Email or password is incorrect');
  }

  const roleRows = await query<{ role_name: Role }>(
    `SELECT r.role_name FROM user_roles ur JOIN roles r ON r.role_id = ur.role_id WHERE ur.user_id = ?`,
    [user.user_id]
  );
  const roles = roleRows.map((r) => r.role_name);

  await query(`UPDATE users SET last_login_at = NOW() WHERE user_id = ?`, [user.user_id]);
  await query(
    `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, new_value) VALUES (?, 'LOGIN', 'users', ?, JSON_OBJECT('email', ?))`,
    [user.user_id, user.user_id, user.email]
  );

  const authUser = { userId: user.user_id, email: user.email, fullName: user.full_name, roles };
  const token = signToken(authUser);
  return { token, user: authUser };
}
