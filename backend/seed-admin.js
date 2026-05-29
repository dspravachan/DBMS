const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

(async () => {
  const db = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  // Check if admin exists
  const [rows] = await db.execute("SELECT id, email, role FROM users WHERE role = 'admin'");
  console.log('Existing admins:', rows);

  const newHash = await bcrypt.hash('Admin@123', 10);

  if (rows.length === 0) {
    const id = uuidv4();
    await db.execute(
      'INSERT INTO users (id, name, email, password_hash, role, is_active) VALUES (?, ?, ?, ?, ?, ?)',
      [id, 'Admin', 'admin@mealmatrix.com', newHash, 'admin', 1]
    );
    // Create wallet for admin too
    await db.execute(
      'INSERT INTO wallet (id, user_id, balance) VALUES (?, ?, ?)',
      [uuidv4(), id, 0]
    );
    console.log('SUCCESS: Admin created => admin@mealmatrix.com / Admin@123');
  } else {
    // Reset password for all admin accounts
    for (const row of rows) {
      await db.execute(
        'UPDATE users SET password_hash = ?, is_active = 1 WHERE id = ?',
        [newHash, row.id]
      );
      console.log(`SUCCESS: Password reset for admin: ${row.email} => Admin@123`);
    }
  }

  await db.end();
  console.log('Done.');
})().catch(e => {
  console.error('FAILED:', e.message);
  process.exit(1);
});
