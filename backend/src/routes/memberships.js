const express = require('express');
const { body, validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');
const db = require('../config/db');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

const router = express.Router();

// ============================================================
// GET /api/memberships  - All active membership tiers
// ============================================================
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.execute(
      'SELECT * FROM memberships WHERE is_active = TRUE ORDER BY price ASC'
    );

    return res.status(200).json({ success: true, data: rows });
  } catch (err) {
    console.error('Get memberships error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch memberships.' });
  }
});

// ============================================================
// GET /api/memberships/my  - User's active membership
// ============================================================
router.get('/my', auth, async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT um.*, m.name, m.price, m.duration_days, m.perks, m.subscription_discount, m.free_deliveries
       FROM user_memberships um
       JOIN memberships m ON m.id = um.membership_id
       WHERE um.user_id = ? AND um.is_active = TRUE AND um.end_date >= CURDATE()
       ORDER BY um.created_at DESC LIMIT 1`,
      [req.user.id]
    );

    if (rows.length === 0) {
      return res.status(200).json({ success: true, data: null, message: 'No active membership.' });
    }

    return res.status(200).json({ success: true, data: rows[0] });
  } catch (err) {
    console.error('Get my membership error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch membership.' });
  }
});

// ============================================================
// POST /api/memberships/purchase  - User purchases a membership
// ============================================================
router.post(
  '/purchase',
  auth,
  [
    body('membership_id').notEmpty().withMessage('Membership ID is required'),
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

      const { membership_id, payment_method } = req.body;

      // Fetch membership
      const [memberships] = await connection.execute(
        'SELECT * FROM memberships WHERE id = ? AND is_active = TRUE',
        [membership_id]
      );
      if (memberships.length === 0) {
        return res.status(404).json({ success: false, message: 'Membership not found.' });
      }

      const membership = memberships[0];

      await connection.beginTransaction();

      // Check if user already has an active membership and deactivate it INSIDE the transaction
      const [existing] = await connection.execute(
        "SELECT id FROM user_memberships WHERE user_id = ? AND is_active = TRUE AND end_date >= CURDATE()",
        [req.user.id]
      );
      if (existing.length > 0) {
        await connection.execute(
          'UPDATE user_memberships SET is_active = FALSE WHERE user_id = ?',
          [req.user.id]
        );
      }

      // Handle wallet payment
      if (payment_method === 'wallet') {
        const [wallets] = await connection.execute(
          'SELECT id, balance FROM wallet WHERE user_id = ? FOR UPDATE',
          [req.user.id]
        );
        if (wallets.length === 0 || parseFloat(wallets[0].balance) < parseFloat(membership.price)) {
          await connection.rollback();
          return res.status(400).json({ success: false, message: 'Insufficient wallet balance.' });
        }
        await connection.execute('UPDATE wallet SET balance = balance - ? WHERE user_id = ?', [membership.price, req.user.id]);
        await connection.execute(
          'INSERT INTO wallet_transactions (id, wallet_id, type, amount, description) VALUES (?, ?, ?, ?, ?)',
          [uuidv4(), wallets[0].id, 'debit', membership.price, `${membership.name} membership purchase`]
        );
      }

      // Create user_membership record
      const today = new Date();
      const endDate = new Date(today);
      endDate.setDate(endDate.getDate() + membership.duration_days);

      const userMembershipId = uuidv4();
      await connection.execute(
        `INSERT INTO user_memberships (id, user_id, membership_id, start_date, end_date, is_active)
         VALUES (?, ?, ?, ?, ?, TRUE)`,
        [userMembershipId, req.user.id, membership_id, today.toISOString().split('T')[0], endDate.toISOString().split('T')[0]]
      );

      // Create payment record
      const txnId = `TXN-MEM-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
      await connection.execute(
        `INSERT INTO payments (id, user_id, amount, status, method, transaction_id)
         VALUES (?, ?, ?, 'success', ?, ?)`,
        [uuidv4(), req.user.id, membership.price, payment_method, txnId]
      );

      await connection.commit();

      const [created] = await connection.execute(
        `SELECT um.*, m.name, m.price, m.perks, m.subscription_discount, m.free_deliveries
         FROM user_memberships um JOIN memberships m ON m.id = um.membership_id
         WHERE um.id = ?`,
        [userMembershipId]
      );

      return res.status(201).json({
        success: true,
        message: `${membership.name} membership activated successfully!`,
        data: created[0],
      });
    } catch (err) {
      await connection.rollback();
      console.error('Purchase membership error:', err);
      return res.status(500).json({ success: false, message: 'Failed to purchase membership.' });
    } finally {
      connection.release();
    }
  }
);

// ============================================================
// POST /api/memberships  - Admin: create membership tier
// ============================================================
router.post(
  '/admin',
  adminAuth,
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    body('duration_days').isInt({ min: 1 }).withMessage('Duration must be at least 1 day'),
    body('subscription_discount').optional().isInt({ min: 0, max: 100 }),
    body('free_deliveries').optional().isInt({ min: 0 }),
    body('perks').optional().isArray(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { name, price, duration_days, perks, subscription_discount, free_deliveries } = req.body;
      const id = uuidv4();

      await db.execute(
        `INSERT INTO memberships (id, name, price, duration_days, perks, subscription_discount, free_deliveries)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [id, name, price, duration_days, JSON.stringify(perks || []), subscription_discount || 0, free_deliveries || 0]
      );

      const [rows] = await db.execute('SELECT * FROM memberships WHERE id = ?', [id]);

      return res.status(201).json({ success: true, message: 'Membership tier created.', data: rows[0] });
    } catch (err) {
      console.error('Create membership error:', err);
      return res.status(500).json({ success: false, message: 'Failed to create membership.' });
    }
  }
);

module.exports = router;
