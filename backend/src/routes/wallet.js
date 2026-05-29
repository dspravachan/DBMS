const express = require('express');
const { body, validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');
const db = require('../config/db');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

const router = express.Router();

// ============================================================
// GET /api/wallet  - User's wallet balance + recent transactions
// ============================================================
router.get('/', auth, async (req, res) => {
  try {
    const [wallets] = await db.execute(
      'SELECT id, balance, created_at, updated_at FROM wallet WHERE user_id = ?',
      [req.user.id]
    );

    if (wallets.length === 0) {
      // Auto-create wallet if missing
      const walletId = uuidv4();
      await db.execute(
        'INSERT INTO wallet (id, user_id, balance) VALUES (?, ?, 0)',
        [walletId, req.user.id]
      );
      return res.status(200).json({
        success: true,
        data: { id: walletId, balance: 0, transactions: [] },
      });
    }

    const wallet = wallets[0];

    const [transactions] = await db.execute(
      `SELECT id, type, amount, description, reference_id, created_at
       FROM wallet_transactions WHERE wallet_id = ?
       ORDER BY created_at DESC LIMIT 20`,
      [wallet.id]
    );

    return res.status(200).json({
      success: true,
      data: { ...wallet, transactions },
    });
  } catch (err) {
    console.error('Get wallet error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch wallet.' });
  }
});

// ============================================================
// POST /api/wallet/recharge  - Recharge wallet
// ============================================================
router.post(
  '/recharge',
  auth,
  [
    body('amount').isFloat({ min: 1, max: 50000 }).withMessage('Amount must be between ₹1 and ₹50,000'),
    body('payment_method').optional().isIn(['card', 'upi', 'netbanking']),
  ],
  async (req, res) => {
    const connection = await db.getConnection();
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { amount, payment_method } = req.body;

      await connection.beginTransaction();

      // Get or create wallet
      let [wallets] = await connection.execute(
        'SELECT id, balance FROM wallet WHERE user_id = ? FOR UPDATE',
        [req.user.id]
      );

      let walletId;
      if (wallets.length === 0) {
        walletId = uuidv4();
        await connection.execute(
          'INSERT INTO wallet (id, user_id, balance) VALUES (?, ?, 0)',
          [walletId, req.user.id]
        );
      } else {
        walletId = wallets[0].id;
      }

      // Add balance
      await connection.execute('UPDATE wallet SET balance = balance + ? WHERE id = ?', [amount, walletId]);

      // Record transaction
      const txnId = `RCHG-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
      await connection.execute(
        'INSERT INTO wallet_transactions (id, wallet_id, type, amount, description, reference_id) VALUES (?, ?, ?, ?, ?, ?)',
        [uuidv4(), walletId, 'credit', amount, `Wallet recharge via ${payment_method || 'card'}`, txnId]
      );

      // Record payment
      await connection.execute(
        `INSERT INTO payments (id, user_id, amount, status, method, transaction_id)
         VALUES (?, ?, ?, 'success', ?, ?)`,
        [uuidv4(), req.user.id, amount, payment_method || 'card', txnId]
      );

      await connection.commit();

      const [updatedWallet] = await connection.execute(
        'SELECT id, balance FROM wallet WHERE id = ?',
        [walletId]
      );

      return res.status(200).json({
        success: true,
        message: `₹${amount} added to wallet successfully.`,
        data: { new_balance: updatedWallet[0].balance, amount_added: amount, transaction_id: txnId },
      });
    } catch (err) {
      await connection.rollback();
      console.error('Wallet recharge error:', err);
      return res.status(500).json({ success: false, message: 'Failed to recharge wallet.' });
    } finally {
      connection.release();
    }
  }
);

// ============================================================
// POST /api/wallet/deduct  - Internal: deduct from wallet
// ============================================================
router.post(
  '/deduct',
  auth,
  [
    body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be positive'),
    body('description').optional().trim(),
    body('reference_id').optional().trim(),
  ],
  async (req, res) => {
    const connection = await db.getConnection();
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { amount, description, reference_id } = req.body;

      await connection.beginTransaction();

      const [wallets] = await connection.execute(
        'SELECT id, balance FROM wallet WHERE user_id = ? FOR UPDATE',
        [req.user.id]
      );

      if (wallets.length === 0 || parseFloat(wallets[0].balance) < amount) {
        await connection.rollback();
        return res.status(400).json({ success: false, message: 'Insufficient wallet balance.' });
      }

      await connection.execute('UPDATE wallet SET balance = balance - ? WHERE id = ?', [amount, wallets[0].id]);

      await connection.execute(
        'INSERT INTO wallet_transactions (id, wallet_id, type, amount, description, reference_id) VALUES (?, ?, ?, ?, ?, ?)',
        [uuidv4(), wallets[0].id, 'debit', amount, description || 'Wallet deduction', reference_id || null]
      );

      await connection.commit();

      const [updated] = await connection.execute('SELECT balance FROM wallet WHERE id = ?', [wallets[0].id]);

      return res.status(200).json({
        success: true,
        message: 'Amount deducted from wallet.',
        data: { new_balance: updated[0].balance, amount_deducted: amount },
      });
    } catch (err) {
      await connection.rollback();
      console.error('Wallet deduct error:', err);
      return res.status(500).json({ success: false, message: 'Failed to deduct from wallet.' });
    } finally {
      connection.release();
    }
  }
);

module.exports = router;
