require('dotenv').config();
const db = require('./src/config/db');

(async () => {
  console.log('\n====== MEALMATRIX DATABASE VIEWER ======\n');

  const tables = [
    'users', 'restaurants', 'foods', 'meal_plans', 'subscriptions',
    'memberships', 'user_memberships', 'orders', 'payments',
    'cart', 'ratings', 'weekly_menu', 'wallet', 'coupons', 'deliveries'
  ];

  for (const table of tables) {
    try {
      const [[{ cnt }]] = await db.execute(`SELECT COUNT(*) AS cnt FROM ${table}`);
      console.log(`  📊 ${table.padEnd(20)} → ${cnt} rows`);
    } catch (e) {
      console.log(`  ❌ ${table.padEnd(20)} → ERROR: ${e.message}`);
    }
  }

  console.log('\n====== RECENT USERS ======');
  const [users] = await db.execute('SELECT id, name, email, role, is_active FROM users ORDER BY created_at DESC LIMIT 10');
  users.forEach(u => console.log(`  [${u.role}] ${u.name} — ${u.email} (active: ${u.is_active})`));

  console.log('\n====== ACTIVE SUBSCRIPTIONS ======');
  const [subs] = await db.execute(
    `SELECT s.id, u.name AS user, mp.plan_name, s.status, s.start_date, s.end_date
     FROM subscriptions s
     JOIN users u ON u.id = s.user_id
     JOIN meal_plans mp ON mp.id = s.meal_plan_id
     ORDER BY s.created_at DESC LIMIT 10`
  );
  subs.forEach(s => console.log(`  [${s.status}] ${s.user} → ${s.plan_name} (${s.start_date} to ${s.end_date})`));

  console.log('\n====== MEMBERSHIPS ======');
  const [mems] = await db.execute('SELECT name, price, duration_days, subscription_discount, free_deliveries FROM memberships');
  mems.forEach(m => console.log(`  ${m.name}: ₹${m.price} / ${m.duration_days}d | ${m.subscription_discount}% off | ${m.free_deliveries} free deliveries`));

  console.log('\nTo open a full GUI for your database, use:');
  console.log('  • phpMyAdmin (if you have XAMPP/WAMP)');
  console.log('  • MySQL Workbench: https://dev.mysql.com/downloads/workbench/');
  console.log('  • TablePlus (recommended): https://tableplus.com/');
  console.log(`\n  Connection: localhost:3306 | DB: ${process.env.DB_NAME} | User: ${process.env.DB_USER}`);

  process.exit(0);
})();
