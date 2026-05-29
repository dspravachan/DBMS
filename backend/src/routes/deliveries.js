const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../config/db');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

const router = express.Router();

// ============================================================
// GET /api/deliveries  - User's deliveries (with optional filter)
// ============================================================
router.get('/', auth, async (req, res) => {
  try {
    const { subscription_id, status, from_date, to_date } = req.query;

    let sql = `
      SELECT d.*, 
             s.delivery_address,
             mp.plan_name, mp.meal_type,
             r.name AS restaurant_name, r.image_url AS restaurant_image
      FROM deliveries d
      JOIN subscriptions s ON s.id = d.subscription_id
      JOIN meal_plans mp ON mp.id = s.meal_plan_id
      JOIN restaurants r ON r.id = s.restaurant_id
      WHERE d.user_id = ?
    `;
    const params = [req.user.id];

    if (subscription_id) {
      sql += ' AND d.subscription_id = ?';
      params.push(subscription_id);
    }
    if (status) {
      sql += ' AND d.delivery_status = ?';
      params.push(status);
    }
    if (from_date) {
      sql += ' AND d.delivery_date >= ?';
      params.push(from_date);
    }
    if (to_date) {
      sql += ' AND d.delivery_date <= ?';
      params.push(to_date);
    }

    sql += ' ORDER BY d.delivery_date DESC, d.meal_type ASC LIMIT 100';

    const [rows] = await db.execute(sql, params);

    return res.status(200).json({ success: true, data: rows, count: rows.length });
  } catch (err) {
    console.error('Get deliveries error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch deliveries.' });
  }
});

// ============================================================
// GET /api/deliveries/today  - Today's deliveries for user
// ============================================================
router.get('/today', auth, async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT d.*,
              mp.plan_name, mp.meal_type,
              r.name AS restaurant_name, r.image_url AS restaurant_image,
              s.delivery_address
       FROM deliveries d
       JOIN subscriptions s ON s.id = d.subscription_id
       JOIN meal_plans mp ON mp.id = s.meal_plan_id
       JOIN restaurants r ON r.id = s.restaurant_id
       WHERE d.user_id = ? AND d.delivery_date = CURDATE()
       ORDER BY FIELD(d.meal_type, 'breakfast', 'lunch', 'dinner')`,
      [req.user.id]
    );

    return res.status(200).json({ success: true, data: rows });
  } catch (err) {
    console.error('Get today deliveries error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch today\'s deliveries.' });
  }
});

// ============================================================
// GET /api/deliveries/admin/all  - Admin: all deliveries (today by default)
// ============================================================
router.get('/admin/all', adminAuth, async (req, res) => {
  try {
    const { date, status } = req.query;
    const targetDate = date || new Date().toISOString().split('T')[0];

    let sql = `
      SELECT d.*,
             u.name AS user_name, u.phone AS user_phone,
             mp.plan_name, mp.meal_type,
             r.name AS restaurant_name
      FROM deliveries d
      JOIN users u ON u.id = d.user_id
      JOIN subscriptions s ON s.id = d.subscription_id
      JOIN meal_plans mp ON mp.id = s.meal_plan_id
      JOIN restaurants r ON r.id = s.restaurant_id
      WHERE d.delivery_date = ?
    `;
    const params = [targetDate];

    if (status) {
      sql += ' AND d.delivery_status = ?';
      params.push(status);
    }

    sql += ' ORDER BY r.name, d.meal_type, u.name';

    const [rows] = await db.execute(sql, params);

    return res.status(200).json({ success: true, data: rows, count: rows.length, date: targetDate });
  } catch (err) {
    console.error('Admin get deliveries error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch deliveries.' });
  }
});

// ============================================================
// PUT /api/deliveries/:id/status  - Admin: update delivery status
// ============================================================
router.put(
  '/:id/status',
  adminAuth,
  [
    body('delivery_status')
      .isIn(['pending', 'preparing', 'out_for_delivery', 'delivered', 'missed'])
      .withMessage('Invalid delivery status'),
    body('delivery_time').optional().matches(/^\d{2}:\d{2}(:\d{2})?$/).withMessage('Invalid time format (HH:MM)'),
    body('notes').optional().trim(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { id } = req.params;
      const { delivery_status, delivery_time, notes } = req.body;

      const [existing] = await db.execute('SELECT id FROM deliveries WHERE id = ?', [id]);
      if (existing.length === 0) {
        return res.status(404).json({ success: false, message: 'Delivery not found.' });
      }

      await db.execute(
        `UPDATE deliveries SET 
          delivery_status = ?,
          delivery_time = COALESCE(?, delivery_time),
          notes = COALESCE(?, notes)
        WHERE id = ?`,
        [delivery_status, delivery_time || null, notes || null, id]
      );

      const [rows] = await db.execute('SELECT * FROM deliveries WHERE id = ?', [id]);

      return res.status(200).json({ success: true, message: 'Delivery status updated.', data: rows[0] });
    } catch (err) {
      console.error('Update delivery status error:', err);
      return res.status(500).json({ success: false, message: 'Failed to update delivery status.' });
    }
  }
);

module.exports = router;
