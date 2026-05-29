require('dotenv').config();
const db = require('./src/config/db');

(async () => {
  try {
    const [
      [[{ total_users }]],
      [[{ total_restaurants }]],
      [[{ total_orders }]],
      [[{ total_revenue }]],
      [[{ active_subscriptions }]],
      [[{ daily_deliveries }]],
      [[{ delivered_today }]],
      [[{ total_wallet_balance }]],
      [[{ avg_order_value }]],
      [top_meal_plans],
      [subscription_growth],
      [top_rated_restaurants],
      [revenue_by_month],
      [user_growth],
      [order_status_distribution],
      [revenue_by_method],
      [recent_orders],
      [delivery_status_today],
    ] = await Promise.all([
      db.execute("SELECT COUNT(*) AS total_users FROM users WHERE role = 'user'"),
      db.execute('SELECT COUNT(*) AS total_restaurants FROM restaurants WHERE is_active = TRUE'),
      db.execute('SELECT COUNT(*) AS total_orders FROM orders'),
      db.execute("SELECT COALESCE(SUM(amount), 0) AS total_revenue FROM payments WHERE status = 'success'"),
      db.execute("SELECT COUNT(*) AS active_subscriptions FROM subscriptions WHERE status = 'active'"),
      db.execute('SELECT COUNT(*) AS daily_deliveries FROM deliveries WHERE delivery_date = CURDATE()'),
      db.execute("SELECT COUNT(*) AS delivered_today FROM deliveries WHERE delivery_date = CURDATE() AND delivery_status = 'delivered'"),
      db.execute('SELECT COALESCE(SUM(balance), 0) AS total_wallet_balance FROM wallet'),
      db.execute("SELECT COALESCE(AVG(total_amount), 0) AS avg_order_value FROM orders WHERE status != 'cancelled'"),
      db.execute(`SELECT mp.id, mp.plan_name, mp.plan_type, mp.meal_type, mp.price, r.name AS restaurant_name, COUNT(s.id) AS subscription_count, COALESCE(ROUND(AVG(rt.stars), 2), 0) AS avg_rating FROM meal_plans mp JOIN restaurants r ON r.id = mp.restaurant_id LEFT JOIN subscriptions s ON s.meal_plan_id = mp.id LEFT JOIN ratings rt ON rt.meal_plan_id = mp.id GROUP BY mp.id ORDER BY subscription_count DESC LIMIT 5`),
      // FIXED: MIN(DATE_FORMAT...) to satisfy ONLY_FULL_GROUP_BY
      db.execute(`SELECT DATE_FORMAT(created_at, '%Y-%m') AS month, MIN(DATE_FORMAT(created_at, '%b %Y')) AS month_label, COUNT(*) AS new_subscriptions, SUM(total_amount) AS revenue FROM subscriptions WHERE created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH) GROUP BY DATE_FORMAT(created_at, '%Y-%m') ORDER BY month ASC`),
      db.execute(`SELECT r.id, r.name, r.cuisine_type, r.city, r.image_url, COALESCE(ROUND(AVG(rt.stars), 2), 0) AS avg_rating, COUNT(DISTINCT rt.id) AS review_count, COUNT(DISTINCT o.id) AS total_orders FROM restaurants r LEFT JOIN ratings rt ON rt.restaurant_id = r.id LEFT JOIN orders o ON o.restaurant_id = r.id WHERE r.is_active = TRUE GROUP BY r.id ORDER BY avg_rating DESC, review_count DESC LIMIT 5`),
      db.execute(`SELECT DATE_FORMAT(created_at, '%Y-%m') AS month, MIN(DATE_FORMAT(created_at, '%b %Y')) AS month_label, SUM(amount) AS revenue, COUNT(*) AS transactions FROM payments WHERE status = 'success' AND created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH) GROUP BY DATE_FORMAT(created_at, '%Y-%m') ORDER BY month ASC`),
      db.execute(`SELECT DATE_FORMAT(created_at, '%Y-%m') AS month, MIN(DATE_FORMAT(created_at, '%b %Y')) AS month_label, COUNT(*) AS new_users FROM users WHERE created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH) GROUP BY DATE_FORMAT(created_at, '%Y-%m') ORDER BY month ASC`),
      db.execute('SELECT status, COUNT(*) AS count FROM orders GROUP BY status'),
      db.execute("SELECT method, COUNT(*) AS transactions, SUM(amount) AS revenue FROM payments WHERE status = 'success' GROUP BY method"),
      db.execute(`SELECT o.id, o.total_amount, o.status, o.created_at, u.name AS user_name, r.name AS restaurant_name FROM orders o JOIN users u ON u.id = o.user_id JOIN restaurants r ON r.id = o.restaurant_id ORDER BY o.created_at DESC LIMIT 10`),
      db.execute('SELECT delivery_status, COUNT(*) AS count FROM deliveries WHERE delivery_date = CURDATE() GROUP BY delivery_status'),
    ]);

    console.log('✅ ALL QUERIES SUCCESS');
    console.log('total_users:', total_users, '| subscriptions:', active_subscriptions, '| restaurants:', total_restaurants);
    console.log('recent_orders:', recent_orders.length, '| top_plans:', top_meal_plans.length);
  } catch (e) {
    console.error('❌ FAILED:', e.message);
  }
  process.exit(0);
})();
