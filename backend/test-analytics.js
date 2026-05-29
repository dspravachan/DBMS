require('dotenv').config();
const db = require('./src/config/db');

(async () => {
  const queries = [
    ["total_users", "SELECT COUNT(*) AS total_users FROM users WHERE role = 'user'"],
    ["total_restaurants", "SELECT COUNT(*) AS total_restaurants FROM restaurants WHERE is_active = TRUE"],
    ["total_orders", "SELECT COUNT(*) AS total_orders FROM orders"],
    ["total_revenue", "SELECT COALESCE(SUM(amount), 0) AS total_revenue FROM payments WHERE status = 'success'"],
    ["active_subscriptions", "SELECT COUNT(*) AS active_subscriptions FROM subscriptions WHERE status = 'active'"],
    ["daily_deliveries", "SELECT COUNT(*) AS daily_deliveries FROM deliveries WHERE delivery_date = CURDATE()"],
    ["delivered_today", "SELECT COUNT(*) AS delivered_today FROM deliveries WHERE delivery_date = CURDATE() AND delivery_status = 'delivered'"],
    ["total_wallet_balance", "SELECT COALESCE(SUM(balance), 0) AS total_wallet_balance FROM wallet"],
    ["avg_order_value", "SELECT COALESCE(AVG(total_amount), 0) AS avg_order_value FROM orders WHERE status != 'cancelled'"],
    ["subscription_growth", `SELECT DATE_FORMAT(created_at, '%Y-%m') AS month, COUNT(*) AS new_subscriptions FROM subscriptions WHERE created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH) GROUP BY DATE_FORMAT(created_at, '%Y-%m') ORDER BY month ASC`],
    ["revenue_by_month", `SELECT DATE_FORMAT(created_at, '%Y-%m') AS month, SUM(amount) AS revenue FROM payments WHERE status = 'success' AND created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH) GROUP BY DATE_FORMAT(created_at, '%Y-%m') ORDER BY month ASC`],
    ["user_growth", `SELECT DATE_FORMAT(created_at, '%Y-%m') AS month, COUNT(*) AS new_users FROM users WHERE created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH) GROUP BY DATE_FORMAT(created_at, '%Y-%m') ORDER BY month ASC`],
    ["order_status_distribution", "SELECT status, COUNT(*) AS count FROM orders GROUP BY status"],
    ["revenue_by_method", "SELECT method, COUNT(*) AS transactions, SUM(amount) AS revenue FROM payments WHERE status = 'success' GROUP BY method"],
    ["delivery_status_today", "SELECT delivery_status, COUNT(*) AS count FROM deliveries WHERE delivery_date = CURDATE() GROUP BY delivery_status"],
    ["top_meal_plans", `SELECT mp.id, mp.plan_name, COUNT(s.id) AS subscription_count FROM meal_plans mp LEFT JOIN subscriptions s ON s.meal_plan_id = mp.id JOIN restaurants r ON r.id = mp.restaurant_id GROUP BY mp.id ORDER BY subscription_count DESC LIMIT 5`],
    ["top_rated_restaurants", `SELECT r.id, r.name, COALESCE(ROUND(AVG(rt.stars), 2), 0) AS avg_rating FROM restaurants r LEFT JOIN ratings rt ON rt.restaurant_id = r.id WHERE r.is_active = TRUE GROUP BY r.id ORDER BY avg_rating DESC LIMIT 5`],
    ["recent_orders", `SELECT o.id, o.total_amount, o.status, o.created_at, u.name AS user_name, r.name AS restaurant_name FROM orders o JOIN users u ON u.id = o.user_id JOIN restaurants r ON r.id = o.restaurant_id ORDER BY o.created_at DESC LIMIT 10`],
  ];

  for (const [name, sql] of queries) {
    try {
      const [rows] = await db.execute(sql);
      console.log(`✅ ${name}: ${rows.length} rows`);
    } catch (e) {
      console.error(`❌ ${name}: ${e.message}`);
    }
  }

  process.exit(0);
})();
