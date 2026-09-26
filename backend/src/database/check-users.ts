async function getUsers() {
  const mysql = require('mysql2/promise');
  require('dotenv').config();

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  try {
    const [users] = await connection.query(`
      SELECT u.user_id, u.email, u.full_name, GROUP_CONCAT(r.role_name) as roles
      FROM users u
      LEFT JOIN user_roles ur ON u.user_id = ur.user_id
      LEFT JOIN roles r ON ur.role_id = r.role_id
      GROUP BY u.user_id
    `);
    console.table(users);
  } catch (error) {
    console.error('Fatal error:', error);
  } finally {
    await connection.end();
  }
}

getUsers();
