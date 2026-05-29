const express = require('express');
const { body, validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');
const db = require('../config/db');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

const router = express.Router();

// ============================================================
// POST /api/payments  - Process a payment
// ============================================================
router.post(
  '/',
  auth,
  [
    body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
    body('method')
      .isIn(['wallet', 'card', 'upi', 'netbanking'])
      .withMessage('Invalid payment method'),
    body('order_id').optional().isString(),
    body('subscription_id').optional().isString(),
  ],
  async (req, res) => {
    const connection = await db.getConnection();
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { amount, method, order_id, subscription_id } = req.body;

      if (!order_id && !subscription_id) {
        return res.status(400).json({ success: false, message: 'Either order_id or subscription_id is required.' });
      }

      await connection.beginTransaction();

      // Handle wallet payment
      let paymentStatus = 'pending';
      if (method === 'wallet') {
        const [wallets] = await connection.execute(
          'SELECT id, balance FROM wallet WHERE user_id = ? FOR UPDATE',
          [req.user.id]
        );
        if (wallets.length === 0 || parseFloat(wallets[0].balance) < amount) {
          await connection.rollback();
          return res.status(400).json({ success: false, message: 'Insufficient wallet balance.' });
        }
        await connection.execute('UPDATE wallet SET balance = balance - ? WHERE user_id = ?', [amount, req.user.id]);
        await connection.execute(
          'INSERT INTO wallet_transactions (id, wallet_id, type, amount, description) VALUES (?, ?, ?, ?, ?)',
          [uuidv4(), wallets[0].id, 'debit', amount, order_id ? `Payment for order` : `Subscription payment`]
        );
        paymentStatus = 'success';
      } else {
        // Simulate card/UPI/netbanking - always succeed for demo
        paymentStatus = 'success';
      }

      const paymentId = uuidv4();
      const txnId = `TXN-MM-${Date.now()}-${uuidv4().substring(0, 8).toUpperCase()}`;

      await connection.execute(
        `INSERT INTO payments (id, user_id, order_id, subscription_id, amount, status, method, transaction_id)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [paymentId, req.user.id, order_id || null, subscription_id || null, amount, paymentStatus, method, txnId]
      );

      // Update order or subscription status on successful payment
      if (paymentStatus === 'success') {
        if (order_id) {
          await connection.execute(
            "UPDATE orders SET status = 'confirmed', payment_id = ? WHERE id = ? AND user_id = ?",
            [paymentId, order_id, req.user.id]
          );
        }
        if (subscription_id) {
          await connection.execute(
            "UPDATE subscriptions SET status = 'active' WHERE id = ? AND user_id = ?",
            [subscription_id, req.user.id]
          );
        }
      }

      await connection.commit();

      const [payment] = await connection.execute('SELECT * FROM payments WHERE id = ?', [paymentId]);

      return res.status(201).json({
        success: true,
        message: 'Payment processed successfully.',
        data: payment[0],
      });
    } catch (err) {
      await connection.rollback();
      console.error('Payment error:', err);
      return res.status(500).json({ success: false, message: 'Payment processing failed.' });
    } finally {
      connection.release();
    }
  }
);

// ============================================================
// GET /api/payments  - User's payment history
// ============================================================
router.get('/', auth, async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT p.*, 
              o.status AS order_status,
              s.status AS subscription_status
       FROM payments p
       LEFT JOIN orders o ON o.id = p.order_id
       LEFT JOIN subscriptions s ON s.id = p.subscription_id
       WHERE p.user_id = ?
       ORDER BY p.created_at DESC LIMIT 50`,
      [req.user.id]
    );

    return res.status(200).json({ success: true, data: rows });
  } catch (err) {
    console.error('Get payments error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch payments.' });
  }
});

// ============================================================
// GET /api/payments/admin/all  - Admin: all payments
// ============================================================
router.get('/admin/all', adminAuth, async (req, res) => {
  try {
    const { status, method, from_date, to_date } = req.query;

    let sql = `
      SELECT p.*, u.name AS user_name, u.email AS user_email
      FROM payments p
      JOIN users u ON u.id = p.user_id
      WHERE 1=1
    `;
    const params = [];

    if (status) { sql += ' AND p.status = ?'; params.push(status); }
    if (method) { sql += ' AND p.method = ?'; params.push(method); }
    if (from_date) { sql += ' AND p.created_at >= ?'; params.push(from_date); }
    if (to_date) { sql += ' AND p.created_at <= ?'; params.push(to_date + ' 23:59:59'); }

    sql += ' ORDER BY p.created_at DESC LIMIT 200';

    const [rows] = await db.execute(sql, params);
    return res.status(200).json({ success: true, data: rows, count: rows.length });
  } catch (err) {
    console.error('Admin get payments error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch payments.' });
  }
});

module.exports = router;
