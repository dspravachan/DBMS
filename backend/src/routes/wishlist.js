const express = require('express');
const { body, validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');
const db = require('../config/db');
const auth = require('../middleware/auth');

const router = express.Router();

// ============================================================
// GET /api/wishlist  - User's wishlist with food details
// ============================================================
router.get('/', auth, async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT w.id, w.created_at,
              f.id AS food_id, f.name, f.description, f.price, f.image_url, f.category, f.is_veg, f.is_popular, f.calories, f.is_available,
              r.id AS restaurant_id, r.name AS restaurant_name, r.city AS restaurant_city,
              COALESCE(ROUND(AVG(rt.stars), 2), 0) AS avg_rating
       FROM wishlist w
       JOIN foods f ON f.id = w.food_id
       JOIN restaurants r ON r.id = f.restaurant_id
       LEFT JOIN ratings rt ON rt.food_id = f.id
       WHERE w.user_id = ?
       GROUP BY w.id, f.id, r.id
       ORDER BY w.created_at DESC`,
      [req.user.id]
    );

    return res.status(200).json({ success: true, data: rows, count: rows.length });
  } catch (err) {
    console.error('Get wishlist error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch wishlist.' });
  }
});

// ============================================================
// POST /api/wishlist  - Toggle wishlist (add if not exists, remove if exists)
// ============================================================
router.post(
  '/',
  auth,
  [body('food_id').notEmpty().withMessage('Food ID is required')],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { food_id } = req.body;

      // Verify food exists
      const [foods] = await db.execute('SELECT id FROM foods WHERE id = ?', [food_id]);
      if (foods.length === 0) {
        return res.status(404).json({ success: false, message: 'Food item not found.' });
      }

      // Check if already in wishlist
      const [existing] = await db.execute(
        'SELECT id FROM wishlist WHERE user_id = ? AND food_id = ?',
        [req.user.id, food_id]
      );

      if (existing.length > 0) {
        // Remove from wishlist
        await db.execute('DELETE FROM wishlist WHERE id = ?', [existing[0].id]);
        return res.status(200).json({ success: true, message: 'Removed from wishlist.', data: { action: 'removed', food_id } });
      } else {
        // Add to wishlist
        const id = uuidv4();
        await db.execute(
          'INSERT INTO wishlist (id, user_id, food_id) VALUES (?, ?, ?)',
          [id, req.user.id, food_id]
        );
        return res.status(201).json({ success: true, message: 'Added to wishlist.', data: { action: 'added', food_id } });
      }
    } catch (err) {
      console.error('Toggle wishlist error:', err);
      return res.status(500).json({ success: false, message: 'Failed to update wishlist.' });
    }
  }
);

// ============================================================
// DELETE /api/wishlist/:id  - Remove specific wishlist item
// ============================================================
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    const [existing] = await db.execute(
      'SELECT id FROM wishlist WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Wishlist item not found.' });
    }

    await db.execute('DELETE FROM wishlist WHERE id = ?', [id]);

    return res.status(200).json({ success: true, message: 'Removed from wishlist.' });
  } catch (err) {
    console.error('Delete wishlist item error:', err);
    return res.status(500).json({ success: false, message: 'Failed to remove wishlist item.' });
  }
});

module.exports = router;
