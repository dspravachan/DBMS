const express = require('express');
const { body, validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');
const db = require('../config/db');
const adminAuth = require('../middleware/adminAuth');

const router = express.Router();

const DAYS_ORDER = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

// ============================================================
// GET /api/weekly-menu  - Get menu for a meal plan
// ============================================================
router.get('/', async (req, res) => {
  try {
    const { meal_plan_id } = req.query;

    if (!meal_plan_id) {
      return res.status(400).json({ success: false, message: 'meal_plan_id query param is required.' });
    }

    const [rows] = await db.execute(
      `SELECT wm.*, mp.plan_name, r.name AS restaurant_name
       FROM weekly_menu wm
       JOIN meal_plans mp ON mp.id = wm.meal_plan_id
       JOIN restaurants r ON r.id = wm.restaurant_id
       WHERE wm.meal_plan_id = ?
       ORDER BY FIELD(wm.day_of_week, 'Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday')`,
      [meal_plan_id]
    );

    return res.status(200).json({ success: true, data: rows });
  } catch (err) {
    console.error('Get weekly menu error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch weekly menu.' });
  }
});

// ============================================================
// POST /api/weekly-menu  - Admin: insert weekly menu for a day
// ============================================================
router.post(
  '/',
  adminAuth,
  [
    body('meal_plan_id').notEmpty().withMessage('meal_plan_id is required'),
    body('restaurant_id').notEmpty().withMessage('restaurant_id is required'),
    body('day_of_week')
      .isIn(DAYS_ORDER)
      .withMessage('day_of_week must be a valid day name'),
    body('breakfast_name').optional().trim(),
    body('lunch_name').optional().trim(),
    body('dinner_name').optional().trim(),
    body('breakfast_calories').optional().isInt({ min: 0 }),
    body('lunch_calories').optional().isInt({ min: 0 }),
    body('dinner_calories').optional().isInt({ min: 0 }),
    body('description').optional().trim(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { meal_plan_id, restaurant_id, day_of_week, breakfast_name, lunch_name, dinner_name, breakfast_calories, lunch_calories, dinner_calories, description } = req.body;

      // Verify meal plan exists
      const [plan] = await db.execute('SELECT id FROM meal_plans WHERE id = ?', [meal_plan_id]);
      if (plan.length === 0) {
        return res.status(404).json({ success: false, message: 'Meal plan not found.' });
      }

      // Check for duplicate (meal_plan_id + day_of_week must be unique)
      const [existing] = await db.execute(
        'SELECT id FROM weekly_menu WHERE meal_plan_id = ? AND day_of_week = ?',
        [meal_plan_id, day_of_week]
      );
      if (existing.length > 0) {
        return res.status(409).json({ success: false, message: `Menu for ${day_of_week} already exists for this plan. Use PUT to update.` });
      }

      const id = uuidv4();
      await db.execute(
        `INSERT INTO weekly_menu (id, meal_plan_id, restaurant_id, day_of_week, breakfast_name, lunch_name, dinner_name, breakfast_calories, lunch_calories, dinner_calories, description)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, meal_plan_id, restaurant_id, day_of_week, breakfast_name || null, lunch_name || null, dinner_name || null, breakfast_calories || null, lunch_calories || null, dinner_calories || null, description || null]
      );

      const [rows] = await db.execute('SELECT * FROM weekly_menu WHERE id = ?', [id]);

      return res.status(201).json({ success: true, message: 'Weekly menu entry created.', data: rows[0] });
    } catch (err) {
      console.error('Create weekly menu error:', err);
      return res.status(500).json({ success: false, message: 'Failed to create weekly menu entry.' });
    }
  }
);

// ============================================================
// PUT /api/weekly-menu/:id  - Admin: update weekly menu entry
// ============================================================
router.put(
  '/:id',
  adminAuth,
  [
    body('breakfast_calories').optional().isInt({ min: 0 }),
    body('lunch_calories').optional().isInt({ min: 0 }),
    body('dinner_calories').optional().isInt({ min: 0 }),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { id } = req.params;
      const { breakfast_name, lunch_name, dinner_name, breakfast_calories, lunch_calories, dinner_calories, description } = req.body;

      const [existing] = await db.execute('SELECT id FROM weekly_menu WHERE id = ?', [id]);
      if (existing.length === 0) {
        return res.status(404).json({ success: false, message: 'Weekly menu entry not found.' });
      }

      await db.execute(
        `UPDATE weekly_menu SET
          breakfast_name = COALESCE(?, breakfast_name),
          lunch_name = COALESCE(?, lunch_name),
          dinner_name = COALESCE(?, dinner_name),
          breakfast_calories = COALESCE(?, breakfast_calories),
          lunch_calories = COALESCE(?, lunch_calories),
          dinner_calories = COALESCE(?, dinner_calories),
          description = COALESCE(?, description)
        WHERE id = ?`,
        [breakfast_name || null, lunch_name || null, dinner_name || null, breakfast_calories != null ? breakfast_calories : null, lunch_calories != null ? lunch_calories : null, dinner_calories != null ? dinner_calories : null, description || null, id]
      );

      const [rows] = await db.execute('SELECT * FROM weekly_menu WHERE id = ?', [id]);

      return res.status(200).json({ success: true, message: 'Weekly menu updated.', data: rows[0] });
    } catch (err) {
      console.error('Update weekly menu error:', err);
      return res.status(500).json({ success: false, message: 'Failed to update weekly menu.' });
    }
  }
);

// ============================================================
// DELETE /api/weekly-menu/:id  - Admin: delete weekly menu entry
// ============================================================
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const [existing] = await db.execute('SELECT id FROM weekly_menu WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Weekly menu entry not found.' });
    }

    await db.execute('DELETE FROM weekly_menu WHERE id = ?', [id]);

    return res.status(200).json({ success: true, message: 'Weekly menu entry deleted.' });
  } catch (err) {
    console.error('Delete weekly menu error:', err);
    return res.status(500).json({ success: false, message: 'Failed to delete weekly menu entry.' });
  }
});

module.exports = router;
