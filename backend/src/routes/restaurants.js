const express = require('express');
const { body, query, validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');
const db = require('../config/db');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

const router = express.Router();

// ============================================================
// GET /api/restaurants  - All active restaurants with avg rating
// ============================================================
router.get('/', async (req, res) => {
  try {
    const { city, cuisine_type, search, has_veg } = req.query;

    let sql = `
      SELECT r.id, r.name, r.description, r.cuisine_type, r.address, r.city,
             r.image_url, r.delivery_time, r.min_order, r.owner_name,
             r.is_active, r.created_at,
             COALESCE(ROUND(AVG(rt.stars), 2), 0) AS rating,
             COUNT(DISTINCT rt.id) AS review_count,
             COUNT(DISTINCT f.id) AS food_count,
             COUNT(DISTINCT CASE WHEN f.is_veg = TRUE THEN f.id END) AS veg_food_count
      FROM restaurants r
      LEFT JOIN ratings rt ON rt.restaurant_id = r.id
      LEFT JOIN foods f ON f.restaurant_id = r.id AND f.is_available = TRUE
      WHERE r.is_active = TRUE
    `;
    const params = [];

    if (city) {
      sql += ' AND r.city LIKE ?';
      params.push(`%${city}%`);
    }
    if (cuisine_type) {
      sql += ' AND r.cuisine_type LIKE ?';
      params.push(`%${cuisine_type}%`);
    }
    if (search) {
      sql += ' AND (r.name LIKE ? OR r.description LIKE ? OR r.cuisine_type LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    sql += ' GROUP BY r.id';

    // Filter: only restaurants that have at least one veg food
    if (has_veg === 'true') {
      sql += ' HAVING veg_food_count > 0';
    }

    sql += ' ORDER BY rating DESC, r.created_at DESC';

    const [rows] = await db.execute(sql, params);

    return res.status(200).json({ success: true, data: rows, count: rows.length });
  } catch (err) {
    console.error('Get restaurants error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch restaurants.' });
  }
});

// ============================================================
// GET /api/restaurants/:id  - Single restaurant with foods
// ============================================================
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch restaurant
    const [restaurants] = await db.execute(
      `SELECT r.id, r.name, r.description, r.cuisine_type, r.address, r.city,
              r.image_url, r.delivery_time, r.min_order, r.owner_name,
              r.is_active, r.created_at,
              COALESCE(ROUND(AVG(rt.stars), 2), 0) AS rating,
              COUNT(DISTINCT rt.id) AS review_count
       FROM restaurants r
       LEFT JOIN ratings rt ON rt.restaurant_id = r.id
       WHERE r.id = ?
       GROUP BY r.id`,
      [id]
    );

    if (restaurants.length === 0) {
      return res.status(404).json({ success: false, message: 'Restaurant not found.' });
    }

    // Fetch foods for this restaurant
    const [foods] = await db.execute(
      'SELECT * FROM foods WHERE restaurant_id = ? AND is_available = TRUE ORDER BY is_popular DESC, category, name',
      [id]
    );

    // Fetch meal plans
    const [mealPlans] = await db.execute(
      'SELECT * FROM meal_plans WHERE restaurant_id = ? AND is_active = TRUE ORDER BY plan_type',
      [id]
    );

    // Fetch active offers
    const [offers] = await db.execute(
      'SELECT * FROM offers WHERE restaurant_id = ? AND is_active = TRUE AND valid_to >= CURDATE()',
      [id]
    );

    return res.status(200).json({
      success: true,
      data: { ...restaurants[0], foods, meal_plans: mealPlans, offers },
    });
  } catch (err) {
    console.error('Get restaurant error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch restaurant.' });
  }
});

// ============================================================
// POST /api/restaurants  - Admin: create restaurant
// ============================================================
router.post(
  '/',
  adminAuth,
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('description').optional().trim(),
    body('cuisine_type').trim().notEmpty().withMessage('Cuisine type is required'),
    body('address').trim().notEmpty().withMessage('Address is required'),
    body('city').trim().notEmpty().withMessage('City is required'),
    body('image_url').optional().isURL(),
    body('delivery_time').optional().trim(),
    body('min_order').optional().isFloat({ min: 0 }),
    body('owner_name').optional().trim(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { name, description, cuisine_type, address, city, image_url, delivery_time, min_order, owner_name } = req.body;
      const id = uuidv4();

      await db.execute(
        `INSERT INTO restaurants (id, name, description, cuisine_type, address, city, image_url, delivery_time, min_order, owner_name)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, name, description || null, cuisine_type, address, city, image_url || null, delivery_time || null, min_order || 0, owner_name || null]
      );

      const [rows] = await db.execute('SELECT * FROM restaurants WHERE id = ?', [id]);

      return res.status(201).json({
        success: true,
        message: 'Restaurant created successfully.',
        data: rows[0],
      });
    } catch (err) {
      console.error('Create restaurant error:', err);
      return res.status(500).json({ success: false, message: 'Failed to create restaurant.' });
    }
  }
);

// ============================================================
// PUT /api/restaurants/:id  - Admin: update restaurant
// ============================================================
router.put(
  '/:id',
  adminAuth,
  [
    body('name').optional().trim().notEmpty(),
    body('cuisine_type').optional().trim(),
    body('address').optional().trim(),
    body('city').optional().trim(),
    body('min_order').optional().isFloat({ min: 0 }),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { id } = req.params;
      const { name, description, cuisine_type, address, city, image_url, delivery_time, min_order, owner_name, is_active } = req.body;

      const [existing] = await db.execute('SELECT id FROM restaurants WHERE id = ?', [id]);
      if (existing.length === 0) {
        return res.status(404).json({ success: false, message: 'Restaurant not found.' });
      }

      await db.execute(
        `UPDATE restaurants SET
          name = COALESCE(?, name),
          description = COALESCE(?, description),
          cuisine_type = COALESCE(?, cuisine_type),
          address = COALESCE(?, address),
          city = COALESCE(?, city),
          image_url = COALESCE(?, image_url),
          delivery_time = COALESCE(?, delivery_time),
          min_order = COALESCE(?, min_order),
          owner_name = COALESCE(?, owner_name),
          is_active = COALESCE(?, is_active)
        WHERE id = ?`,
        [name || null, description || null, cuisine_type || null, address || null, city || null, image_url || null, delivery_time || null, min_order != null ? min_order : null, owner_name || null, is_active != null ? is_active : null, id]
      );

      const [rows] = await db.execute('SELECT * FROM restaurants WHERE id = ?', [id]);

      return res.status(200).json({
        success: true,
        message: 'Restaurant updated successfully.',
        data: rows[0],
      });
    } catch (err) {
      console.error('Update restaurant error:', err);
      return res.status(500).json({ success: false, message: 'Failed to update restaurant.' });
    }
  }
);

// ============================================================
// DELETE /api/restaurants/:id  - Admin: hard delete restaurant
// ============================================================
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const [existing] = await db.execute('SELECT id FROM restaurants WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Restaurant not found.' });
    }

    // Hard delete – remove from DB entirely
    await db.execute('DELETE FROM restaurants WHERE id = ?', [id]);

    return res.status(200).json({ success: true, message: 'Restaurant deleted successfully.' });
  } catch (err) {
    console.error('Delete restaurant error:', err);
    return res.status(500).json({ success: false, message: 'Failed to delete restaurant. It may have associated orders or data.' });
  }
});

module.exports = router;
