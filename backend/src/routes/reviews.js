const express = require('express');
const { body, validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');
const db = require('../config/db');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

const router = express.Router();

// ============================================================
// GET /api/reviews  - Get reviews by food, restaurant, or meal_plan
// ============================================================
router.get('/', async (req, res) => {
  try {
    const { food_id, restaurant_id, meal_plan_id } = req.query;

    if (!food_id && !restaurant_id && !meal_plan_id) {
      return res.status(400).json({
        success: false,
        message: 'At least one filter is required: food_id, restaurant_id, or meal_plan_id.',
      });
    }

    let sql = `
      SELECT rt.id, rt.stars, rt.review_text, rt.created_at,
             rt.food_id, rt.restaurant_id, rt.meal_plan_id,
             u.id AS user_id, u.name AS user_name, u.avatar_url AS user_avatar
      FROM ratings rt
      JOIN users u ON u.id = rt.user_id
      WHERE 1=1
    `;
    const params = [];

    if (food_id) {
      sql += ' AND rt.food_id = ?';
      params.push(food_id);
    }
    if (restaurant_id) {
      sql += ' AND rt.restaurant_id = ?';
      params.push(restaurant_id);
    }
    if (meal_plan_id) {
      sql += ' AND rt.meal_plan_id = ?';
      params.push(meal_plan_id);
    }

    sql += ' ORDER BY rt.created_at DESC LIMIT 50';

    const [rows] = await db.execute(sql, params);

    // M-1 fix: compute true average from full dataset, not just the paged 50 rows
    let avg = 0;
    if (food_id || restaurant_id || meal_plan_id) {
      const avgParams = [];
      let avgSql = 'SELECT COALESCE(ROUND(AVG(stars), 2), 0) AS avg FROM ratings WHERE 1=1';
      if (food_id) { avgSql += ' AND food_id = ?'; avgParams.push(food_id); }
      if (restaurant_id) { avgSql += ' AND restaurant_id = ?'; avgParams.push(restaurant_id); }
      if (meal_plan_id) { avgSql += ' AND meal_plan_id = ?'; avgParams.push(meal_plan_id); }
      const [[avgRow]] = await db.execute(avgSql, avgParams);
      avg = parseFloat(avgRow.avg);
    }

    return res.status(200).json({ success: true, data: rows, count: rows.length, average_rating: avg });
  } catch (err) {
    console.error('Get reviews error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch reviews.' });
  }
});

// ============================================================
// POST /api/reviews  - Create a review (protected)
// ============================================================
router.post(
  '/',
  auth,
  [
    body('stars').isInt({ min: 1, max: 5 }).withMessage('Stars must be between 1 and 5'),
    body('review_text').optional().trim().isLength({ max: 1000 }),
    body('food_id').optional().isString(),
    body('restaurant_id').optional().isString(),
    body('meal_plan_id').optional().isString(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { stars, review_text, food_id, restaurant_id, meal_plan_id } = req.body;

      if (!food_id && !restaurant_id && !meal_plan_id) {
        return res.status(400).json({
          success: false,
          message: 'At least one of food_id, restaurant_id, or meal_plan_id is required.',
        });
      }

      // Prevent duplicate review (same user, same target)
      const [existing] = await db.execute(
        `SELECT id FROM ratings 
         WHERE user_id = ? 
         AND (food_id = ? OR (food_id IS NULL AND ? IS NULL))
         AND (restaurant_id = ? OR (restaurant_id IS NULL AND ? IS NULL))
         AND (meal_plan_id = ? OR (meal_plan_id IS NULL AND ? IS NULL))`,
        [req.user.id, food_id || null, food_id || null, restaurant_id || null, restaurant_id || null, meal_plan_id || null, meal_plan_id || null]
      );
      if (existing.length > 0) {
        return res.status(409).json({ success: false, message: 'You have already reviewed this item.' });
      }

      const id = uuidv4();
      await db.execute(
        `INSERT INTO ratings (id, user_id, food_id, restaurant_id, meal_plan_id, stars, review_text)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [id, req.user.id, food_id || null, restaurant_id || null, meal_plan_id || null, stars, review_text || null]
      );

      // Update restaurant rating if restaurant review
      if (restaurant_id) {
        await db.execute(
          `UPDATE restaurants r 
           SET rating = (SELECT COALESCE(ROUND(AVG(rt.stars), 2), 0) FROM ratings rt WHERE rt.restaurant_id = r.id)
           WHERE r.id = ?`,
          [restaurant_id]
        );
      }

      const [rows] = await db.execute(
        `SELECT rt.*, u.name AS user_name, u.avatar_url AS user_avatar
         FROM ratings rt JOIN users u ON u.id = rt.user_id WHERE rt.id = ?`,
        [id]
      );

      return res.status(201).json({ success: true, message: 'Review submitted.', data: rows[0] });
    } catch (err) {
      console.error('Create review error:', err);
      return res.status(500).json({ success: false, message: 'Failed to submit review.' });
    }
  }
);

// ============================================================
// DELETE /api/reviews/:id  - Delete review (own or admin)
// ============================================================
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await db.execute('SELECT id, user_id FROM ratings WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Review not found.' });
    }

    // Check ownership (admin can delete any)
    if (req.user.role !== 'admin' && rows[0].user_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'You can only delete your own reviews.' });
    }

    await db.execute('DELETE FROM ratings WHERE id = ?', [id]);

    // M-6 fix: recalculate restaurant rating if this was a restaurant review
    if (rows[0].restaurant_id) {
      await db.execute(
        `UPDATE restaurants r
         SET rating = (SELECT COALESCE(ROUND(AVG(rt.stars), 2), 0) FROM ratings rt WHERE rt.restaurant_id = r.id)
         WHERE r.id = ?`,
        [rows[0].restaurant_id]
      );
    }

    return res.status(200).json({ success: true, message: 'Review deleted.' });
  } catch (err) {
    console.error('Delete review error:', err);
    return res.status(500).json({ success: false, message: 'Failed to delete review.' });
  }
});

module.exports = router;
