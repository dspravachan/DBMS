const express = require('express');
const { body, validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');
const db = require('../config/db');
const adminAuth = require('../middleware/adminAuth');

const router = express.Router();

// ============================================================
// GET /api/foods  - All foods (filter by restaurant, category, search)
// ============================================================
router.get('/', async (req, res) => {
  try {
    const { restaurant_id, category, search, is_veg, is_popular } = req.query;

    let sql = `
      SELECT f.*, r.name AS restaurant_name, r.city AS restaurant_city
      FROM foods f
      JOIN restaurants r ON r.id = f.restaurant_id
      WHERE f.is_available = TRUE AND r.is_active = TRUE
    `;
    const params = [];

    if (restaurant_id) {
      sql += ' AND f.restaurant_id = ?';
      params.push(restaurant_id);
    }
    if (category) {
      sql += ' AND f.category LIKE ?';
      params.push(`%${category}%`);
    }
    if (search) {
      sql += ' AND (f.name LIKE ? OR f.description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    if (is_veg !== undefined) {
      sql += ' AND f.is_veg = ?';
      params.push(is_veg === 'true' ? 1 : 0);
    }
    if (is_popular !== undefined) {
      sql += ' AND f.is_popular = ?';
      params.push(is_popular === 'true' ? 1 : 0);
    }

    sql += ' ORDER BY f.is_popular DESC, f.category, f.name';

    const [rows] = await db.execute(sql, params);

    return res.status(200).json({ success: true, data: rows, count: rows.length });
  } catch (err) {
    console.error('Get foods error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch foods.' });
  }
});

// ============================================================
// GET /api/foods/search  - Unified search: restaurants + foods
// ============================================================
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length < 2) {
      return res.status(200).json({ success: true, data: { restaurants: [], foods: [] } });
    }
    const term = `%${q.trim()}%`;
    const [restaurants, foods] = await Promise.all([
      db.execute(
        `SELECT r.id, r.name, r.cuisine_type, r.city, r.image_url, r.delivery_time,
                COALESCE(ROUND(AVG(rt.stars), 2), 0) AS rating
         FROM restaurants r
         LEFT JOIN ratings rt ON rt.restaurant_id = r.id
         WHERE r.is_active = TRUE AND (r.name LIKE ? OR r.cuisine_type LIKE ? OR r.description LIKE ?)
         GROUP BY r.id
         ORDER BY rating DESC LIMIT 5`,
        [term, term, term]
      ),
      db.execute(
        `SELECT f.id, f.name, f.price, f.image_url, f.is_veg, f.category,
                r.id AS restaurant_id, r.name AS restaurant_name, r.city AS restaurant_city
         FROM foods f
         JOIN restaurants r ON r.id = f.restaurant_id
         WHERE f.is_available = TRUE AND r.is_active = TRUE
           AND (f.name LIKE ? OR f.description LIKE ? OR f.category LIKE ?)
         ORDER BY f.is_popular DESC LIMIT 8`,
        [term, term, term]
      ),
    ]);
    return res.status(200).json({
      success: true,
      data: { restaurants: restaurants[0], foods: foods[0] },
    });
  } catch (err) {
    console.error('Search error:', err);
    return res.status(500).json({ success: false, message: 'Search failed.' });
  }
});

// ============================================================
// GET /api/foods/popular  - Popular foods
// ============================================================
router.get('/popular', async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT f.*, r.name AS restaurant_name, r.city AS restaurant_city,
              COALESCE(ROUND(AVG(rt.stars), 2), 0) AS avg_rating
       FROM foods f
       JOIN restaurants r ON r.id = f.restaurant_id
       LEFT JOIN ratings rt ON rt.food_id = f.id
       WHERE f.is_popular = TRUE AND f.is_available = TRUE AND r.is_active = TRUE
       GROUP BY f.id
       ORDER BY avg_rating DESC
       LIMIT 20`
    );

    return res.status(200).json({ success: true, data: rows });
  } catch (err) {
    console.error('Get popular foods error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch popular foods.' });
  }
});

// ============================================================
// GET /api/foods/:id  - Single food
// ============================================================
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await db.execute(
      `SELECT f.*, r.name AS restaurant_name, r.city AS restaurant_city, r.cuisine_type,
              COALESCE(ROUND(AVG(rt.stars), 2), 0) AS avg_rating,
              COUNT(DISTINCT rt.id) AS review_count
       FROM foods f
       JOIN restaurants r ON r.id = f.restaurant_id
       LEFT JOIN ratings rt ON rt.food_id = f.id
       WHERE f.id = ?
       GROUP BY f.id`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Food item not found.' });
    }

    return res.status(200).json({ success: true, data: rows[0] });
  } catch (err) {
    console.error('Get food error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch food item.' });
  }
});

// ============================================================
// POST /api/foods  - Admin: create food
// ============================================================
router.post(
  '/',
  adminAuth,
  [
    body('restaurant_id').notEmpty().withMessage('Restaurant ID is required'),
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    body('is_veg').optional().isBoolean(),
    body('is_popular').optional().isBoolean(),
    body('calories').optional().isInt({ min: 0 }),
    body('category').optional().trim(),
    body('description').optional().trim(),
    body('image_url').optional().isURL(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { restaurant_id, name, description, price, image_url, category, is_veg, is_popular, calories } = req.body;

      // Check restaurant exists
      const [restaurant] = await db.execute('SELECT id FROM restaurants WHERE id = ? AND is_active = TRUE', [restaurant_id]);
      if (restaurant.length === 0) {
        return res.status(404).json({ success: false, message: 'Restaurant not found.' });
      }

      const id = uuidv4();
      await db.execute(
        `INSERT INTO foods (id, restaurant_id, name, description, price, image_url, category, is_veg, is_popular, calories)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, restaurant_id, name, description || null, price, image_url || null, category || null, is_veg !== undefined ? is_veg : true, is_popular || false, calories || null]
      );

      const [rows] = await db.execute('SELECT * FROM foods WHERE id = ?', [id]);

      return res.status(201).json({ success: true, message: 'Food item created.', data: rows[0] });
    } catch (err) {
      console.error('Create food error:', err);
      return res.status(500).json({ success: false, message: 'Failed to create food item.' });
    }
  }
);

// ============================================================
// PUT /api/foods/:id  - Admin: update food
// ============================================================
router.put(
  '/:id',
  adminAuth,
  [
    body('price').optional().isFloat({ min: 0 }),
    body('is_veg').optional().isBoolean(),
    body('is_popular').optional().isBoolean(),
    body('calories').optional().isInt({ min: 0 }),
    body('is_available').optional().isBoolean(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { id } = req.params;
      const { name, description, price, image_url, category, is_veg, is_popular, calories, is_available } = req.body;

      const [existing] = await db.execute('SELECT id FROM foods WHERE id = ?', [id]);
      if (existing.length === 0) {
        return res.status(404).json({ success: false, message: 'Food item not found.' });
      }

      await db.execute(
        `UPDATE foods SET
          name = COALESCE(?, name),
          description = COALESCE(?, description),
          price = COALESCE(?, price),
          image_url = COALESCE(?, image_url),
          category = COALESCE(?, category),
          is_veg = COALESCE(?, is_veg),
          is_popular = COALESCE(?, is_popular),
          calories = COALESCE(?, calories),
          is_available = COALESCE(?, is_available)
        WHERE id = ?`,
        [name || null, description || null, price != null ? price : null, image_url || null, category || null, is_veg != null ? is_veg : null, is_popular != null ? is_popular : null, calories != null ? calories : null, is_available != null ? is_available : null, id]
      );

      const [rows] = await db.execute('SELECT * FROM foods WHERE id = ?', [id]);

      return res.status(200).json({ success: true, message: 'Food item updated.', data: rows[0] });
    } catch (err) {
      console.error('Update food error:', err);
      return res.status(500).json({ success: false, message: 'Failed to update food item.' });
    }
  }
);

// ============================================================
// DELETE /api/foods/:id  - Admin: soft delete food
// ============================================================
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const [existing] = await db.execute('SELECT id FROM foods WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Food item not found.' });
    }

    await db.execute('UPDATE foods SET is_available = FALSE WHERE id = ?', [id]);

    return res.status(200).json({ success: true, message: 'Food item deactivated.' });
  } catch (err) {
    console.error('Delete food error:', err);
    return res.status(500).json({ success: false, message: 'Failed to delete food item.' });
  }
});

module.exports = router;
