const express = require('express');
const { body, validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');
const db = require('../config/db');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

const router = express.Router();

// ============================================================
// GET /api/subscriptions  - User's subscriptions
// ============================================================
router.get('/', auth, async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT s.*, 
              mp.plan_name, mp.plan_type, mp.meal_type, mp.meals_per_day, mp.duration_days,
              r.name AS restaurant_name, r.image_url AS restaurant_image, r.city AS restaurant_city
       FROM subscriptions s
       JOIN meal_plans mp ON mp.id = s.meal_plan_id
       JOIN restaurants r ON r.id = s.restaurant_id
       WHERE s.user_id = ?
       ORDER BY s.created_at DESC`,
      [req.user.id]
    );

    return res.status(200).json({ success: true, data: rows });
  } catch (err) {
    console.error('Get subscriptions error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch subscriptions.' });
  }
});

// ============================================================
// GET /api/subscriptions/admin/all  - Admin: all subscriptions
// ============================================================
router.get('/admin/all', adminAuth, async (req, res) => {
  try {
    const { status } = req.query;
    let sql = `
      SELECT s.*, 
             u.name AS user_name, u.email AS user_email,
             mp.plan_name, mp.plan_type, mp.meal_type,
             r.name AS restaurant_name
      FROM subscriptions s
      JOIN users u ON u.id = s.user_id
      JOIN meal_plans mp ON mp.id = s.meal_plan_id
      JOIN restaurants r ON r.id = s.restaurant_id
    `;
    const params = [];
    if (status) {
      sql += ' WHERE s.status = ?';
      params.push(status);
    }
    sql += ' ORDER BY s.created_at DESC';

    const [rows] = await db.execute(sql, params);
    return res.status(200).json({ success: true, data: rows, count: rows.length });
  } catch (err) {
    console.error('Admin get subscriptions error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch subscriptions.' });
  }
});

// ============================================================
// GET /api/subscriptions/:id  - Single subscription detail
// ============================================================
router.get('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await db.execute(
      `SELECT s.*, 
              mp.plan_name, mp.plan_type, mp.meal_type, mp.meals_per_day, mp.duration_days, mp.description AS plan_description,
              r.name AS restaurant_name, r.image_url AS restaurant_image, r.city AS restaurant_city, r.cuisine_type
       FROM subscriptions s
       JOIN meal_plans mp ON mp.id = s.meal_plan_id
       JOIN restaurants r ON r.id = s.restaurant_id
       WHERE s.id = ? AND (s.user_id = ? OR ? = 'admin')`,
      [id, req.user.id, req.user.role]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Subscription not found.' });
    }

    // Fetch recent deliveries for this subscription
    const [deliveries] = await db.execute(
      `SELECT * FROM deliveries WHERE subscription_id = ? ORDER BY delivery_date DESC LIMIT 14`,
      [id]
    );

    return res.status(200).json({ success: true, data: { ...rows[0], deliveries } });
  } catch (err) {
    console.error('Get subscription error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch subscription.' });
  }
});

// ============================================================
// POST /api/subscriptions  - Subscribe to a meal plan
// ============================================================
router.post(
  '/',
  auth,
  [
    body('meal_plan_id').notEmpty().withMessage('Meal plan ID is required'),
    body('start_date').isDate().withMessage('Valid start date required (YYYY-MM-DD)'),
    body('delivery_address').trim().notEmpty().withMessage('Delivery address is required'),
    body('auto_renew').optional().isBoolean(),
    body('payment_method').isIn(['wallet', 'card', 'upi', 'netbanking']).withMessage('Invalid payment method'),
  ],
  async (req, res) => {
    const connection = await db.getConnection();
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { meal_plan_id, start_date, delivery_address, auto_renew, payment_method } = req.body;

      // Fetch meal plan
      const [plans] = await connection.execute(
        'SELECT * FROM meal_plans WHERE id = ? AND is_active = TRUE',
        [meal_plan_id]
      );
      if (plans.length === 0) {
        return res.status(404).json({ success: false, message: 'Meal plan not found or inactive.' });
      }

      const plan = plans[0];
      const startDate = new Date(start_date);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + plan.duration_days - 1);
      const endDateStr = endDate.toISOString().split('T')[0];

      // Apply membership discount if user has active membership
      const [memberships] = await connection.execute(
        `SELECT m.subscription_discount FROM user_memberships um
         JOIN memberships m ON m.id = um.membership_id
         WHERE um.user_id = ? AND um.is_active = TRUE AND um.end_date >= CURDATE()`,
        [req.user.id]
      );

      let totalAmount = parseFloat(plan.price);
      if (memberships.length > 0 && memberships[0].subscription_discount > 0) {
        const discount = memberships[0].subscription_discount;
        totalAmount = totalAmount * (1 - discount / 100);
      }

      await connection.beginTransaction();

      // For wallet payment, verify balance
      if (payment_method === 'wallet') {
        const [wallets] = await connection.execute(
          'SELECT id, balance FROM wallet WHERE user_id = ? FOR UPDATE',
          [req.user.id]
        );
        if (wallets.length === 0 || parseFloat(wallets[0].balance) < totalAmount) {
          await connection.rollback();
          return res.status(400).json({ success: false, message: 'Insufficient wallet balance.' });
        }
        // Deduct from wallet
        await connection.execute('UPDATE wallet SET balance = balance - ? WHERE user_id = ?', [totalAmount, req.user.id]);
        await connection.execute(
          'INSERT INTO wallet_transactions (id, wallet_id, type, amount, description) VALUES (?, ?, ?, ?, ?)',
          [uuidv4(), wallets[0].id, 'debit', totalAmount, `Subscription: ${plan.plan_name}`]
        );
      }

      const subscriptionId = uuidv4();
      await connection.execute(
        `INSERT INTO subscriptions (id, user_id, restaurant_id, meal_plan_id, start_date, end_date, status, auto_renew, delivery_address, total_amount)
         VALUES (?, ?, ?, ?, ?, ?, 'active', ?, ?, ?)`,
        [subscriptionId, req.user.id, plan.restaurant_id, meal_plan_id, start_date, endDateStr, auto_renew || false, delivery_address, totalAmount]
      );

      // Create payment record
      const paymentId = uuidv4();
      const txnId = `TXN-MM-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      await connection.execute(
        `INSERT INTO payments (id, user_id, subscription_id, amount, status, method, transaction_id)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [paymentId, req.user.id, subscriptionId, totalAmount, payment_method === 'wallet' ? 'success' : 'pending', payment_method, txnId]
      );

      // Create delivery records for each day of the subscription
      const mealTypes = [];
      if (plan.meals_per_day >= 1) mealTypes.push('breakfast');
      if (plan.meals_per_day >= 2) mealTypes.push('lunch');
      if (plan.meals_per_day >= 3) mealTypes.push('dinner');

      const deliveryInserts = [];
      const current = new Date(startDate);
      while (current <= endDate) {
        const dateStr = current.toISOString().split('T')[0];
        for (const mealType of mealTypes) {
          deliveryInserts.push([uuidv4(), subscriptionId, req.user.id, dateStr, mealType, 'pending']);
        }
        current.setDate(current.getDate() + 1);
      }

      if (deliveryInserts.length > 0) {
        const placeholders = deliveryInserts.map(() => '(?, ?, ?, ?, ?, ?)').join(', ');
        const flatValues = deliveryInserts.flat();
        await connection.execute(
          `INSERT INTO deliveries (id, subscription_id, user_id, delivery_date, meal_type, delivery_status) VALUES ${placeholders}`,
          flatValues
        );
      }

      await connection.commit();

      const [created] = await connection.execute(
        `SELECT s.*, mp.plan_name, r.name AS restaurant_name FROM subscriptions s
         JOIN meal_plans mp ON mp.id = s.meal_plan_id
         JOIN restaurants r ON r.id = s.restaurant_id
         WHERE s.id = ?`,
        [subscriptionId]
      );

      return res.status(201).json({
        success: true,
        message: 'Subscription created successfully.',
        data: created[0],
      });
    } catch (err) {
      await connection.rollback();
      console.error('Create subscription error:', err);
      return res.status(500).json({ success: false, message: 'Failed to create subscription.' });
    } finally {
      connection.release();
    }
  }
);

// ============================================================
// PUT /api/subscriptions/:id/pause  - Pause subscription (user or admin)
// ============================================================
router.put('/:id/pause', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { paused_until } = req.body;
    const isAdmin = req.user.role === 'admin';

    const sql = isAdmin
      ? "SELECT * FROM subscriptions WHERE id = ? AND status = 'active'"
      : "SELECT * FROM subscriptions WHERE id = ? AND user_id = ? AND status = 'active'";
    const params = isAdmin ? [id] : [id, req.user.id];

    const [rows] = await db.execute(sql, params);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Active subscription not found.' });
    }

    await db.execute(
      "UPDATE subscriptions SET status = 'paused', paused_until = ? WHERE id = ?",
      [paused_until || null, id]
    );

    return res.status(200).json({ success: true, message: 'Subscription paused successfully.' });
  } catch (err) {
    console.error('Pause subscription error:', err);
    return res.status(500).json({ success: false, message: 'Failed to pause subscription.' });
  }
});

// ============================================================
// PUT /api/subscriptions/:id/resume  - Resume subscription (user or admin)
// ============================================================
router.put('/:id/resume', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const isAdmin = req.user.role === 'admin';

    const sql = isAdmin
      ? "SELECT * FROM subscriptions WHERE id = ? AND status = 'paused'"
      : "SELECT * FROM subscriptions WHERE id = ? AND user_id = ? AND status = 'paused'";
    const params = isAdmin ? [id] : [id, req.user.id];

    const [rows] = await db.execute(sql, params);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Paused subscription not found.' });
    }

    await db.execute(
      "UPDATE subscriptions SET status = 'active', paused_until = NULL WHERE id = ?",
      [id]
    );

    return res.status(200).json({ success: true, message: 'Subscription resumed successfully.' });
  } catch (err) {
    console.error('Resume subscription error:', err);
    return res.status(500).json({ success: false, message: 'Failed to resume subscription.' });
  }
});

// ============================================================
// PUT /api/subscriptions/:id/cancel  - Cancel subscription (user or admin)
// ============================================================
router.put('/:id/cancel', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const isAdmin = req.user.role === 'admin';

    const sql = isAdmin
      ? "SELECT * FROM subscriptions WHERE id = ? AND status IN ('active','paused')"
      : "SELECT * FROM subscriptions WHERE id = ? AND user_id = ? AND status IN ('active','paused')";
    const params = isAdmin ? [id] : [id, req.user.id];

    const [rows] = await db.execute(sql, params);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Active or paused subscription not found.' });
    }

    await db.execute("UPDATE subscriptions SET status = 'cancelled' WHERE id = ?", [id]);

    // Mark future deliveries as missed
    await db.execute(
      "UPDATE deliveries SET delivery_status = 'missed' WHERE subscription_id = ? AND delivery_date > CURDATE() AND delivery_status = 'pending'",
      [id]
    );

    return res.status(200).json({ success: true, message: 'Subscription cancelled successfully.' });
  } catch (err) {
    console.error('Cancel subscription error:', err);
    return res.status(500).json({ success: false, message: 'Failed to cancel subscription.' });
  }
});

module.exports = router;
