const express = require('express');
const { body, validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');
const db = require('../config/db');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

const router = express.Router();

// ============================================================
// GET /api/orders  - User's order history with items
// ============================================================
router.get('/', auth, async (req, res) => {
  try {
    const { status } = req.query;

    let sql = `
      SELECT o.*, 
             r.name AS restaurant_name, r.image_url AS restaurant_image,
             c.code AS coupon_code,
             COUNT(oi.id) AS item_count
      FROM orders o
      JOIN restaurants r ON r.id = o.restaurant_id
      LEFT JOIN coupons c ON c.id = o.coupon_id
      LEFT JOIN order_items oi ON oi.order_id = o.id
      WHERE o.user_id = ?
    `;
    const params = [req.user.id];

    if (status) {
      sql += ' AND o.status = ?';
      params.push(status);
    }

    sql += ' GROUP BY o.id ORDER BY o.created_at DESC';

    const [orders] = await db.execute(sql, params);

    return res.status(200).json({ success: true, data: orders, count: orders.length });
  } catch (err) {
    console.error('Get orders error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch orders.' });
  }
});

// ============================================================
// GET /api/orders/admin/all  - Admin: all orders
// ============================================================
router.get('/admin/all', adminAuth, async (req, res) => {
  try {
    const { status, restaurant_id, from_date, to_date } = req.query;

    let sql = `
      SELECT o.*,
             u.name AS user_name, u.email AS user_email, u.phone AS user_phone,
             r.name AS restaurant_name,
             c.code AS coupon_code
      FROM orders o
      JOIN users u ON u.id = o.user_id
      JOIN restaurants r ON r.id = o.restaurant_id
      LEFT JOIN coupons c ON c.id = o.coupon_id
      WHERE 1=1
    `;
    const params = [];

    if (status) { sql += ' AND o.status = ?'; params.push(status); }
    if (restaurant_id) { sql += ' AND o.restaurant_id = ?'; params.push(restaurant_id); }
    if (from_date) { sql += ' AND o.created_at >= ?'; params.push(from_date); }
    if (to_date) { sql += ' AND o.created_at <= ?'; params.push(to_date + ' 23:59:59'); }

    sql += ' ORDER BY o.created_at DESC LIMIT 200';

    const [rows] = await db.execute(sql, params);
    return res.status(200).json({ success: true, data: rows, count: rows.length });
  } catch (err) {
    console.error('Admin get orders error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch orders.' });
  }
});

// ============================================================
// GET /api/orders/:id  - Order detail with items
// ============================================================
router.get('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    const [orders] = await db.execute(
      `SELECT o.*,
              r.name AS restaurant_name, r.image_url AS restaurant_image, r.address AS restaurant_address,
              c.code AS coupon_code, c.discount_type, c.discount_value
       FROM orders o
       JOIN restaurants r ON r.id = o.restaurant_id
       LEFT JOIN coupons c ON c.id = o.coupon_id
       WHERE o.id = ? AND (o.user_id = ? OR ? = 'admin')`,
      [id, req.user.id, req.user.role]
    );

    if (orders.length === 0) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    const [items] = await db.execute(
      `SELECT oi.id, oi.quantity, oi.price, oi.created_at,
              f.id AS food_id, f.name AS food_name, f.image_url AS food_image, f.is_veg,
              (oi.price * oi.quantity) AS subtotal
       FROM order_items oi
       JOIN foods f ON f.id = oi.food_id
       WHERE oi.order_id = ?`,
      [id]
    );

    // Fetch payment info
    const [payments] = await db.execute(
      'SELECT id, status, method, transaction_id, amount, created_at FROM payments WHERE order_id = ? LIMIT 1',
      [id]
    );

    return res.status(200).json({
      success: true,
      data: { ...orders[0], items, payment: payments[0] || null },
    });
  } catch (err) {
    console.error('Get order error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch order.' });
  }
});

// ============================================================
// POST /api/orders  - Place an order (transactional)
// ============================================================
router.post(
  '/',
  auth,
  [
    body('delivery_address').trim().notEmpty().withMessage('Delivery address is required'),
    body('special_instructions').optional().trim(),
    body('coupon_code').optional().trim(),
    body('payment_method')
      .isIn(['wallet', 'card', 'upi', 'netbanking'])
      .withMessage('Invalid payment method'),
  ],
  async (req, res) => {
    const connection = await db.getConnection();
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { delivery_address, special_instructions, coupon_code, payment_method } = req.body;

      // Fetch user's cart
      const [cartItems] = await connection.execute(
        `SELECT c.id AS cart_id, c.quantity, f.id AS food_id, f.name, f.price, f.restaurant_id, f.is_available
         FROM cart c
         JOIN foods f ON f.id = c.food_id
         WHERE c.user_id = ?`,
        [req.user.id]
      );

      if (cartItems.length === 0) {
        return res.status(400).json({ success: false, message: 'Cart is empty.' });
      }

      // Verify all items are available
      const unavailable = cartItems.filter(item => !item.is_available);
      if (unavailable.length > 0) {
        return res.status(400).json({
          success: false,
          message: `Some items are no longer available: ${unavailable.map(i => i.name).join(', ')}`,
        });
      }

      const restaurantId = cartItems[0].restaurant_id;

      // Calculate subtotal
      let subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
      let discount = 0;
      let couponId = null;
      let membershipDiscount = 0;

      // Apply coupon if provided
      if (coupon_code) {
        const [coupons] = await connection.execute(
          `SELECT * FROM coupons 
           WHERE code = ? AND is_active = TRUE
           AND (expires_at IS NULL OR expires_at > NOW())
           AND (max_uses IS NULL OR used_count < max_uses)`,
          [coupon_code.toUpperCase()]  // H-5 fix: normalize case
        );

        if (coupons.length === 0) {
          return res.status(400).json({ success: false, message: 'Invalid or expired coupon.' });
        }

        const coupon = coupons[0];
        if (subtotal < parseFloat(coupon.min_order_amount)) {
          return res.status(400).json({
            success: false,
            message: `Minimum order amount for this coupon is ₹${coupon.min_order_amount}.`,
          });
        }

        if (coupon.discount_type === 'percent') {
          discount = Math.min(subtotal * (coupon.discount_value / 100), coupon.max_discount || Infinity);
        } else {
          discount = coupon.discount_value;
        }

        couponId = coupon.id;
      }

      // Apply membership subscription_discount (stacks on top of coupon)
      const [membershipRows] = await connection.execute(
        `SELECT m.subscription_discount, m.free_deliveries
         FROM user_memberships um
         JOIN memberships m ON m.id = um.membership_id
         WHERE um.user_id = ? AND um.is_active = TRUE AND um.end_date >= CURDATE()
         ORDER BY um.created_at DESC LIMIT 1`,
        [req.user.id]
      );

      if (membershipRows.length > 0 && membershipRows[0].subscription_discount > 0) {
        const pct = parseFloat(membershipRows[0].subscription_discount);
        // Discount applied to the post-coupon amount
        const afterCoupon = subtotal - discount;
        membershipDiscount = parseFloat(((afterCoupon * pct) / 100).toFixed(2));
      }

      const totalAmount = parseFloat((subtotal - discount - membershipDiscount).toFixed(2));

      await connection.beginTransaction();

      // For wallet payment, verify and deduct balance
      if (payment_method === 'wallet') {
        const [wallets] = await connection.execute(
          'SELECT id, balance FROM wallet WHERE user_id = ? FOR UPDATE',
          [req.user.id]
        );
        if (wallets.length === 0 || parseFloat(wallets[0].balance) < totalAmount) {
          await connection.rollback();
          return res.status(400).json({ success: false, message: 'Insufficient wallet balance.' });
        }
        await connection.execute('UPDATE wallet SET balance = balance - ? WHERE user_id = ?', [totalAmount, req.user.id]);
        await connection.execute(
          'INSERT INTO wallet_transactions (id, wallet_id, type, amount, description) VALUES (?, ?, ?, ?, ?)',
          [uuidv4(), wallets[0].id, 'debit', totalAmount, 'Order payment']
        );
      }

      // Create order
      const orderId = uuidv4();
      await connection.execute(
        `INSERT INTO orders (id, user_id, restaurant_id, total_amount, status, coupon_id, membership_discount, delivery_address, special_instructions)
         VALUES (?, ?, ?, ?, 'pending', ?, ?, ?, ?)`,
        [orderId, req.user.id, restaurantId, totalAmount, couponId, membershipDiscount, delivery_address, special_instructions || null]
      );

      // Insert order items
      for (const item of cartItems) {
        await connection.execute(
          'INSERT INTO order_items (id, order_id, food_id, quantity, price) VALUES (?, ?, ?, ?, ?)',
          [uuidv4(), orderId, item.food_id, item.quantity, item.price]
        );
      }

      // Create payment record
      const paymentId = uuidv4();
      const txnId = `TXN-MM-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
      await connection.execute(
        `INSERT INTO payments (id, user_id, order_id, amount, status, method, transaction_id)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [paymentId, req.user.id, orderId, totalAmount, payment_method === 'wallet' ? 'success' : 'pending', payment_method, txnId]
      );

      // Update order with payment ID and set confirmed if wallet payment
      await connection.execute(
        `UPDATE orders SET payment_id = ?, status = IF(? = 'wallet', 'confirmed', 'pending') WHERE id = ?`,
        [paymentId, payment_method, orderId]
      );

      // Update coupon used_count
      if (couponId) {
        await connection.execute('UPDATE coupons SET used_count = used_count + 1 WHERE id = ?', [couponId]);
      }

      // Clear cart
      await connection.execute('DELETE FROM cart WHERE user_id = ?', [req.user.id]);

      await connection.commit();

      const [created] = await connection.execute(
        `SELECT o.*, r.name AS restaurant_name FROM orders o
         JOIN restaurants r ON r.id = o.restaurant_id WHERE o.id = ?`,
        [orderId]
      );

      return res.status(201).json({
        success: true,
        message: 'Order placed successfully.',
        data: { ...created[0], transaction_id: txnId },
      });
    } catch (err) {
      await connection.rollback();
      console.error('Place order error:', err);
      return res.status(500).json({ success: false, message: 'Failed to place order.' });
    } finally {
      connection.release();
    }
  }
);

// ============================================================
// PUT /api/orders/:id/status  - Admin: update order status
// ============================================================
router.put(
  '/:id/status',
  adminAuth,
  [body('status').isIn(['pending', 'confirmed', 'preparing', 'delivered', 'cancelled'])],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { id } = req.params;
      const { status } = req.body;

      const [existing] = await db.execute('SELECT id FROM orders WHERE id = ?', [id]);
      if (existing.length === 0) {
        return res.status(404).json({ success: false, message: 'Order not found.' });
      }

      await db.execute('UPDATE orders SET status = ? WHERE id = ?', [status, id]);

      return res.status(200).json({ success: true, message: `Order status updated to ${status}.` });
    } catch (err) {
      console.error('Update order status error:', err);
      return res.status(500).json({ success: false, message: 'Failed to update order status.' });
    }
  }
);

module.exports = router;
