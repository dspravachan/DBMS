const express = require('express');
const { body, validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');
const db = require('../config/db');
const adminAuth = require('../middleware/adminAuth');

const router = express.Router();

// ============================================================
// GET /api/meal-plans  - All meal plans with optional filters
// ============================================================
router.get('/', async (req, res) => {
  try {
    const { restaurant_id, plan_type, meal_type, search } = req.query;

    let sql = `
      SELECT mp.*, r.name AS restaurant_name, r.city AS restaurant_city,
             r.image_url AS restaurant_image, r.cuisine_type,
             COALESCE(ROUND(AVG(rt.stars), 2), 0) AS avg_rating,
             COUNT(DISTINCT rt.id) AS review_count,
             COUNT(DISTINCT s.id) AS subscriber_count
      FROM meal_plans mp
      JOIN restaurants r ON r.id = mp.restaurant_id
      LEFT JOIN ratings rt ON rt.meal_plan_id = mp.id
      LEFT JOIN subscriptions s ON s.meal_plan_id = mp.id AND s.status = 'active'
      WHERE mp.is_active = TRUE AND r.is_active = TRUE
    `;
    const params = [];

    if (restaurant_id) {
      sql += ' AND mp.restaurant_id = ?';
      params.push(restaurant_id);
    }
    if (plan_type) {
      sql += ' AND mp.plan_type = ?';
      params.push(plan_type);
    }
    if (meal_type) {
      sql += ' AND mp.meal_type = ?';
      params.push(meal_type);
    }
    if (search) {
      sql += ' AND (mp.plan_name LIKE ? OR mp.description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    sql += ' GROUP BY mp.id ORDER BY avg_rating DESC, mp.price ASC';

    const [rows] = await db.execute(sql, params);

    return res.status(200).json({ success: true, data: rows, count: rows.length });
  } catch (err) {
    console.error('Get meal plans error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch meal plans.' });
  }
});

// ============================================================
// GET /api/meal-plans/:id  - Single meal plan + weekly menu
// ============================================================
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [plans] = await db.execute(
      `SELECT mp.*, r.name AS restaurant_name, r.city AS restaurant_city,
              r.image_url AS restaurant_image, r.cuisine_type, r.delivery_time,
              COALESCE(ROUND(AVG(rt.stars), 2), 0) AS avg_rating,
              COUNT(DISTINCT rt.id) AS review_count
       FROM meal_plans mp
       JOIN restaurants r ON r.id = mp.restaurant_id
       LEFT JOIN ratings rt ON rt.meal_plan_id = mp.id
       WHERE mp.id = ?
       GROUP BY mp.id`,
      [id]
    );

    if (plans.length === 0) {
      return res.status(404).json({ success: false, message: 'Meal plan not found.' });
    }

    // Fetch weekly menu for this plan
    const [weeklyMenu] = await db.execute(
      `SELECT * FROM weekly_menu WHERE meal_plan_id = ?
       ORDER BY FIELD(day_of_week, 'Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday')`,
      [id]
    );

    // Fetch reviews
    const [reviews] = await db.execute(
      `SELECT rt.id, rt.stars, rt.review_text, rt.created_at,
              u.name AS user_name, u.avatar_url AS user_avatar
       FROM ratings rt
       JOIN users u ON u.id = rt.user_id
       WHERE rt.meal_plan_id = ?
       ORDER BY rt.created_at DESC
       LIMIT 10`,
      [id]
    );

    return res.status(200).json({
      success: true,
      data: { ...plans[0], weekly_menu: weeklyMenu, reviews },
    });
  } catch (err) {
    console.error('Get meal plan error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch meal plan.' });
  }
});

// ============================================================
// POST /api/meal-plans  - Admin: create meal plan
// ============================================================
router.post(
  '/',
  adminAuth,
  [
    body('restaurant_id').notEmpty().withMessage('Restaurant ID is required'),
    body('plan_name').trim().notEmpty().withMessage('Plan name is required'),
    body('plan_type').isIn(['weekly', 'monthly', 'custom']).withMessage('Invalid plan type'),
    body('meal_type').isIn(['veg', 'non-veg', 'both']).withMessage('Invalid meal type'),
    body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    body('duration_days').isInt({ min: 1 }).withMessage('Duration must be at least 1 day'),
    body('meals_per_day').optional().isInt({ min: 1, max: 3 }),
    body('delivery_frequency').optional().trim(),
    body('description').optional().trim(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { restaurant_id, plan_name, plan_type, meal_type, description, price, duration_days, meals_per_day, delivery_frequency } = req.body;

      // Check restaurant exists
      const [restaurant] = await db.execute('SELECT id FROM restaurants WHERE id = ? AND is_active = TRUE', [restaurant_id]);
      if (restaurant.length === 0) {
        return res.status(404).json({ success: false, message: 'Restaurant not found.' });
      }

      const id = uuidv4();
      await db.execute(
        `INSERT INTO meal_plans (id, restaurant_id, plan_name, plan_type, meal_type, description, price, duration_days, meals_per_day, delivery_frequency)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, restaurant_id, plan_name, plan_type, meal_type, description || null, price, duration_days, meals_per_day || 3, delivery_frequency || 'Daily']
      );

      const [rows] = await db.execute('SELECT * FROM meal_plans WHERE id = ?', [id]);

      return res.status(201).json({ success: true, message: 'Meal plan created.', data: rows[0] });
    } catch (err) {
      console.error('Create meal plan error:', err);
      return res.status(500).json({ success: false, message: 'Failed to create meal plan.' });
    }
  }
);

// ============================================================
// PUT /api/meal-plans/:id  - Admin: update meal plan
// ============================================================
router.put(
  '/:id',
  adminAuth,
  [
    body('plan_type').optional().isIn(['weekly', 'monthly', 'custom']),
    body('meal_type').optional().isIn(['veg', 'non-veg', 'both']),
    body('price').optional().isFloat({ min: 0 }),
    body('duration_days').optional().isInt({ min: 1 }),
    body('meals_per_day').optional().isInt({ min: 1, max: 3 }),
    body('is_active').optional().isBoolean(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { id } = req.params;
      const { plan_name, plan_type, meal_type, description, price, duration_days, meals_per_day, delivery_frequency, is_active } = req.body;

      const [existing] = await db.execute('SELECT id FROM meal_plans WHERE id = ?', [id]);
      if (existing.length === 0) {
        return res.status(404).json({ success: false, message: 'Meal plan not found.' });
      }

      await db.execute(
        `UPDATE meal_plans SET
          plan_name = COALESCE(?, plan_name),
          plan_type = COALESCE(?, plan_type),
          meal_type = COALESCE(?, meal_type),
          description = COALESCE(?, description),
          price = COALESCE(?, price),
          duration_days = COALESCE(?, duration_days),
          meals_per_day = COALESCE(?, meals_per_day),
          delivery_frequency = COALESCE(?, delivery_frequency),
          is_active = COALESCE(?, is_active)
        WHERE id = ?`,
        [plan_name || null, plan_type || null, meal_type || null, description || null, price != null ? price : null, duration_days || null, meals_per_day || null, delivery_frequency || null, is_active != null ? is_active : null, id]
      );

      const [rows] = await db.execute('SELECT * FROM meal_plans WHERE id = ?', [id]);

      return res.status(200).json({ success: true, message: 'Meal plan updated.', data: rows[0] });
    } catch (err) {
      console.error('Update meal plan error:', err);
      return res.status(500).json({ success: false, message: 'Failed to update meal plan.' });
    }
  }
);

// ============================================================
// DELETE /api/meal-plans/:id  - Admin: deactivate meal plan
// ============================================================
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const [existing] = await db.execute('SELECT id FROM meal_plans WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Meal plan not found.' });
    }

    await db.execute('UPDATE meal_plans SET is_active = FALSE WHERE id = ?', [id]);

    return res.status(200).json({ success: true, message: 'Meal plan deactivated.' });
  } catch (err) {
    console.error('Delete meal plan error:', err);
    return res.status(500).json({ success: false, message: 'Failed to delete meal plan.' });
  }
});

module.exports = router;
