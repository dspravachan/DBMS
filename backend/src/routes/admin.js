const express = require('express');
const db = require('../config/db');
const adminAuth = require('../middleware/adminAuth');

const router = express.Router();

// ============================================================
// GET /api/admin/analytics  - Comprehensive admin analytics dashboard
// ============================================================
router.get('/analytics', adminAuth, async (req, res) => {
  try {
    // M-5 fix: run all independent queries in parallel
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
      [[{ monthly_revenue }]],
      [[{ avg_rating }]],
      [top_meal_plans],
      [subscription_growth],
      [top_rated_restaurants],
      [revenue_by_month],
      [user_growth],
      [order_status_distribution],
      [revenue_by_method],
      [recent_orders],
      [delivery_status_today],
      [membership_distribution],
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
      db.execute('SELECT COALESCE(SUM(amount), 0) AS monthly_revenue FROM payments WHERE status = \'success\' AND MONTH(created_at) = MONTH(CURDATE()) AND YEAR(created_at) = YEAR(CURDATE())'),
      // avg_rating from reviews table (more accurate than restaurants.rating column)
      db.execute('SELECT COALESCE(ROUND(AVG(stars), 1), 0) AS avg_rating FROM ratings'),
      db.execute(
        `SELECT mp.id, mp.plan_name, mp.plan_type, mp.meal_type, mp.price,
                r.name AS restaurant_name,
                COUNT(s.id) AS subscription_count,
                COALESCE(ROUND(AVG(rt.stars), 2), 0) AS avg_rating
         FROM meal_plans mp
         JOIN restaurants r ON r.id = mp.restaurant_id
         LEFT JOIN subscriptions s ON s.meal_plan_id = mp.id
         LEFT JOIN ratings rt ON rt.meal_plan_id = mp.id
         GROUP BY mp.id
         ORDER BY subscription_count DESC LIMIT 5`
      ),
      db.execute(
        `SELECT DATE_FORMAT(created_at, '%Y-%m') AS month,
                MIN(DATE_FORMAT(created_at, '%b %Y')) AS month_label,
                COUNT(*) AS new_subscriptions,
                SUM(total_amount) AS revenue
         FROM subscriptions
         WHERE created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
         GROUP BY DATE_FORMAT(created_at, '%Y-%m')
         ORDER BY month ASC`
      ),
      db.execute(
        `SELECT r.id, r.name, r.cuisine_type, r.city, r.image_url,
                COALESCE(ROUND(AVG(rt.stars), 2), 0) AS avg_rating,
                COUNT(DISTINCT rt.id) AS review_count,
                COUNT(DISTINCT o.id) AS total_orders
         FROM restaurants r
         LEFT JOIN ratings rt ON rt.restaurant_id = r.id
         LEFT JOIN orders o ON o.restaurant_id = r.id
         WHERE r.is_active = TRUE
         GROUP BY r.id
         ORDER BY avg_rating DESC, review_count DESC LIMIT 5`
      ),
      db.execute(
        `SELECT DATE_FORMAT(created_at, '%Y-%m') AS month,
                MIN(DATE_FORMAT(created_at, '%b %Y')) AS month_label,
                SUM(amount) AS revenue, COUNT(*) AS transactions
         FROM payments
         WHERE status = 'success' AND created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
         GROUP BY DATE_FORMAT(created_at, '%Y-%m')
         ORDER BY month ASC`
      ),
      db.execute(
        `SELECT DATE_FORMAT(created_at, '%Y-%m') AS month,
                MIN(DATE_FORMAT(created_at, '%b %Y')) AS month_label,
                COUNT(*) AS new_users
         FROM users
         WHERE created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
         GROUP BY DATE_FORMAT(created_at, '%Y-%m')
         ORDER BY month ASC`
      ),
      db.execute('SELECT status, COUNT(*) AS count FROM orders GROUP BY status'),
      db.execute(
        "SELECT method, COUNT(*) AS transactions, SUM(amount) AS revenue FROM payments WHERE status = 'success' GROUP BY method"
      ),
      db.execute(
        `SELECT o.id, o.total_amount, o.status, o.created_at,
                u.name AS user_name, r.name AS restaurant_name
         FROM orders o
         JOIN users u ON u.id = o.user_id
         JOIN restaurants r ON r.id = o.restaurant_id
         ORDER BY o.created_at DESC LIMIT 10`
      ),
      db.execute(
        'SELECT delivery_status, COUNT(*) AS count FROM deliveries WHERE delivery_date = CURDATE() GROUP BY delivery_status'
      ),
      // Membership distribution: how many active users per tier (Silver/Gold/Platinum)
      db.execute(
        `SELECT m.name, COUNT(um.id) AS value
         FROM memberships m
         LEFT JOIN user_memberships um ON um.membership_id = m.id
           AND um.is_active = TRUE AND um.end_date >= CURDATE()
         WHERE m.is_active = TRUE
         GROUP BY m.id, m.name
         ORDER BY m.price ASC`
      ),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        total_users,
        total_restaurants,
        total_orders,
        total_revenue: parseFloat(parseFloat(total_revenue).toFixed(2)),
        monthly_revenue: parseFloat(parseFloat(monthly_revenue).toFixed(2)),
        active_subscriptions,
        daily_deliveries,
        delivered_today,
        avg_rating: parseFloat(parseFloat(avg_rating).toFixed(1)),
        total_wallet_balance: parseFloat(parseFloat(total_wallet_balance).toFixed(2)),
        avg_order_value: parseFloat(parseFloat(avg_order_value).toFixed(2)),
        top_meal_plans,
        subscription_growth,
        top_rated_restaurants,
        revenue_by_month,
        user_growth,
        order_status_distribution,
        revenue_by_method,
        delivery_status_today,
        recent_orders,
        // NEW: real membership distribution keyed by tier name
        plan_distribution: membership_distribution,
        membership_distribution,
      },
    });
  } catch (err) {
    console.error('Admin analytics error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch analytics.' });
  }
});


// ============================================================
// GET /api/admin/users  - Admin: list all users
// ============================================================
router.get('/users', adminAuth, async (req, res) => {
  try {
    const { search, role, is_active } = req.query;

    let sql = `
      SELECT u.id, u.name, u.email, u.role, u.phone, u.is_active, u.created_at,
             ANY_VALUE(w.balance) AS wallet_balance,
             COUNT(DISTINCT o.id) AS total_orders,
             COUNT(DISTINCT s.id) AS total_subscriptions,
             ANY_VALUE(m.name) AS membership_name,
             ANY_VALUE(m.name) AS membership_tier,
             ANY_VALUE(um.end_date) AS membership_end_date,
             ANY_VALUE(um.is_active) AS membership_is_active
      FROM users u
      LEFT JOIN wallet w ON w.user_id = u.id
      LEFT JOIN orders o ON o.user_id = u.id
      LEFT JOIN subscriptions s ON s.user_id = u.id
      LEFT JOIN user_memberships um ON um.user_id = u.id
        AND um.is_active = TRUE AND um.end_date >= CURDATE()
      LEFT JOIN memberships m ON m.id = um.membership_id
      WHERE 1=1
    `;
    const params = [];

    if (search) {
      sql += ' AND (u.name LIKE ? OR u.email LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    if (role) { sql += ' AND u.role = ?'; params.push(role); }
    if (is_active !== undefined) { sql += ' AND u.is_active = ?'; params.push(is_active === 'true' ? 1 : 0); }

    sql += ' GROUP BY u.id, u.name, u.email, u.role, u.phone, u.is_active, u.created_at ORDER BY u.created_at DESC';

    const [rows] = await db.execute(sql, params);

    return res.status(200).json({ success: true, data: rows, count: rows.length });
  } catch (err) {
    console.error('Admin get users error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch users.' });
  }
});

// ============================================================
// PUT /api/admin/users/:id/toggle  - Admin: activate/deactivate user
// ============================================================
router.put('/users/:id/toggle', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await db.execute('SELECT id, is_active, role FROM users WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (rows[0].role === 'admin') {
      return res.status(403).json({ success: false, message: 'Cannot deactivate admin users.' });
    }

    const newStatus = !rows[0].is_active;
    await db.execute('UPDATE users SET is_active = ? WHERE id = ?', [newStatus, id]);

    return res.status(200).json({
      success: true,
      message: `User ${newStatus ? 'activated' : 'deactivated'} successfully.`,
      data: { id, is_active: newStatus },
    });
  } catch (err) {
    console.error('Toggle user status error:', err);
    return res.status(500).json({ success: false, message: 'Failed to update user status.' });
  }
});

// ============================================================
// GET /api/admin/restaurants  - Admin: all restaurants (including inactive)
// ============================================================
router.get('/restaurants', adminAuth, async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT r.*,
              COUNT(DISTINCT f.id) AS food_count,
              COUNT(DISTINCT mp.id) AS plan_count,
              COUNT(DISTINCT o.id) AS order_count,
              COALESCE(ROUND(AVG(rt.stars), 2), 0) AS avg_rating
       FROM restaurants r
       LEFT JOIN foods f ON f.restaurant_id = r.id
       LEFT JOIN meal_plans mp ON mp.restaurant_id = r.id
       LEFT JOIN orders o ON o.restaurant_id = r.id
       LEFT JOIN ratings rt ON rt.restaurant_id = r.id
       GROUP BY r.id
       ORDER BY r.created_at DESC`
    );

    return res.status(200).json({ success: true, data: rows, count: rows.length });
  } catch (err) {
    console.error('Admin get restaurants error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch restaurants.' });
  }
});

// ============================================================
// GET /api/admin/coupons  - Admin: all coupons (active + inactive)
// ============================================================
router.get('/coupons', adminAuth, async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT id, code, discount_type, discount_value, min_order_amount, max_discount,
              max_uses, used_count, is_active, expires_at, created_at
       FROM coupons
       ORDER BY created_at DESC`
    );
    return res.status(200).json({ success: true, data: rows, count: rows.length });
  } catch (err) {
    console.error('Admin get coupons error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch coupons.' });
  }
});

// ============================================================
// PUT /api/admin/coupons/:id/toggle  - Admin: toggle coupon active status
// ============================================================
router.put('/coupons/:id/toggle', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.execute('SELECT id, is_active FROM coupons WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Coupon not found.' });
    }
    const newStatus = !rows[0].is_active;
    await db.execute('UPDATE coupons SET is_active = ? WHERE id = ?', [newStatus, id]);
    return res.status(200).json({
      success: true,
      message: `Coupon ${newStatus ? 'activated' : 'deactivated'} successfully.`,
      data: { id, is_active: newStatus },
    });
  } catch (err) {
    console.error('Toggle coupon status error:', err);
    return res.status(500).json({ success: false, message: 'Failed to toggle coupon status.' });
  }
});

// ============================================================
// PUT /api/admin/restaurants/:id/toggle  - Admin: toggle restaurant active status
// ============================================================
router.put('/restaurants/:id/toggle', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.execute('SELECT id, is_active FROM restaurants WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Restaurant not found.' });
    }
    const newStatus = !rows[0].is_active;
    await db.execute('UPDATE restaurants SET is_active = ? WHERE id = ?', [newStatus, id]);
    return res.status(200).json({
      success: true,
      message: `Restaurant ${newStatus ? 'activated' : 'deactivated'} successfully.`,
      data: { id, is_active: newStatus },
    });
  } catch (err) {
    console.error('Toggle restaurant status error:', err);
    return res.status(500).json({ success: false, message: 'Failed to update restaurant status.' });
  }
});

module.exports = router;
