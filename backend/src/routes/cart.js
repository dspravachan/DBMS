const express = require('express');
const { body, validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');
const db = require('../config/db');
const auth = require('../middleware/auth');

const router = express.Router();

// ============================================================
// GET /api/cart  - User's cart with food details
// ============================================================
router.get('/', auth, async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT c.id, c.quantity, c.created_at,
              f.id AS food_id, f.name, f.description, f.price, f.image_url, f.category, f.is_veg, f.calories,
              r.id AS restaurant_id, r.name AS restaurant_name,
              (f.price * c.quantity) AS subtotal
       FROM cart c
       JOIN foods f ON f.id = c.food_id
       JOIN restaurants r ON r.id = f.restaurant_id
       WHERE c.user_id = ?
       ORDER BY c.created_at DESC`,
      [req.user.id]
    );

    const total = rows.reduce((acc, item) => acc + parseFloat(item.subtotal), 0);
    const item_count = rows.reduce((acc, item) => acc + item.quantity, 0);

    return res.status(200).json({
      success: true,
      data: { items: rows, total: parseFloat(total.toFixed(2)), item_count },
    });
  } catch (err) {
    console.error('Get cart error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch cart.' });
  }
});

// ============================================================
// POST /api/cart  - Add item to cart or update quantity
// ============================================================
router.post(
  '/',
  auth,
  [
    body('food_id').notEmpty().withMessage('Food ID is required'),
    body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { food_id, quantity } = req.body;

      // Verify food exists and is available
      const [foods] = await db.execute(
        'SELECT id, restaurant_id FROM foods WHERE id = ? AND is_available = TRUE',
        [food_id]
      );
      if (foods.length === 0) {
        return res.status(404).json({ success: false, message: 'Food item not found or unavailable.' });
      }

      // Check if user's cart has items from a different restaurant
      const [cartItems] = await db.execute(
        `SELECT c.food_id, f.restaurant_id FROM cart c
         JOIN foods f ON f.id = c.food_id
         WHERE c.user_id = ? LIMIT 1`,
        [req.user.id]
      );

      if (cartItems.length > 0 && cartItems[0].restaurant_id !== foods[0].restaurant_id) {
        return res.status(400).json({
          success: false,
          message: 'Cart already has items from a different restaurant. Please clear your cart first.',
        });
      }

      // Check if item already in cart
      const [existing] = await db.execute(
        'SELECT id, quantity FROM cart WHERE user_id = ? AND food_id = ?',
        [req.user.id, food_id]
      );

      if (existing.length > 0) {
        // Update quantity
        await db.execute('UPDATE cart SET quantity = ? WHERE id = ?', [quantity, existing[0].id]);
      } else {
        // Insert new item
        await db.execute(
          'INSERT INTO cart (id, user_id, food_id, quantity) VALUES (?, ?, ?, ?)',
          [uuidv4(), req.user.id, food_id, quantity]
        );
      }

      // Return updated cart
      const [cart] = await db.execute(
        `SELECT c.id, c.quantity,
                f.id AS food_id, f.name, f.price, f.image_url, f.is_veg,
                r.name AS restaurant_name,
                (f.price * c.quantity) AS subtotal
         FROM cart c
         JOIN foods f ON f.id = c.food_id
         JOIN restaurants r ON r.id = f.restaurant_id
         WHERE c.user_id = ?`,
        [req.user.id]
      );

      const total = cart.reduce((acc, item) => acc + parseFloat(item.subtotal), 0);

      return res.status(200).json({
        success: true,
        message: 'Cart updated.',
        data: { items: cart, total: parseFloat(total.toFixed(2)) },
      });
    } catch (err) {
      console.error('Add to cart error:', err);
      return res.status(500).json({ success: false, message: 'Failed to update cart.' });
    }
  }
);

// ============================================================
// DELETE /api/cart/:id  - Remove single item from cart
// ============================================================
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    const [existing] = await db.execute(
      'SELECT id FROM cart WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Cart item not found.' });
    }

    await db.execute('DELETE FROM cart WHERE id = ?', [id]);

    return res.status(200).json({ success: true, message: 'Item removed from cart.' });
  } catch (err) {
    console.error('Remove cart item error:', err);
    return res.status(500).json({ success: false, message: 'Failed to remove item from cart.' });
  }
});

// ============================================================
// DELETE /api/cart  - Clear entire cart
// ============================================================
router.delete('/', auth, async (req, res) => {
  try {
    await db.execute('DELETE FROM cart WHERE user_id = ?', [req.user.id]);

    return res.status(200).json({ success: true, message: 'Cart cleared.' });
  } catch (err) {
    console.error('Clear cart error:', err);
    return res.status(500).json({ success: false, message: 'Failed to clear cart.' });
  }
});

module.exports = router;
