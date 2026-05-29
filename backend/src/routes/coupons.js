const express = require('express');
const { body, validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');
const db = require('../config/db');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

const router = express.Router();

// ============================================================
// GET /api/coupons  - All active coupons
// ============================================================
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT id, code, discount_type, discount_value, min_order_amount, max_discount, max_uses, used_count, expires_at, created_at
       FROM coupons
       WHERE is_active = TRUE AND (expires_at IS NULL OR expires_at > NOW())
       AND (max_uses IS NULL OR used_count < max_uses)
       ORDER BY created_at DESC`
    );

    return res.status(200).json({ success: true, data: rows });
  } catch (err) {
    console.error('Get coupons error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch coupons.' });
  }
});

// ============================================================
// POST /api/coupons/validate  - Validate a coupon code
// ============================================================
router.post(
  '/validate',
  auth,
  [
    body('code').trim().notEmpty().withMessage('Coupon code is required'),
    body('order_amount').isFloat({ min: 0 }).withMessage('Order amount is required'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { code, order_amount } = req.body;

      const [coupons] = await db.execute(
        `SELECT * FROM coupons 
         WHERE code = ? AND is_active = TRUE
         AND (expires_at IS NULL OR expires_at > NOW())
         AND (max_uses IS NULL OR used_count < max_uses)`,
        [code.toUpperCase()]
      );

      if (coupons.length === 0) {
        return res.status(400).json({ success: false, message: 'Invalid, expired, or fully used coupon.' });
      }

      const coupon = coupons[0];

      if (order_amount < parseFloat(coupon.min_order_amount)) {
        return res.status(400).json({
          success: false,
          message: `Minimum order amount of ₹${coupon.min_order_amount} required for this coupon.`,
        });
      }

      // Calculate discount
      let discount = 0;
      if (coupon.discount_type === 'percent') {
        discount = parseFloat((order_amount * (coupon.discount_value / 100)).toFixed(2));
        if (coupon.max_discount) {
          discount = Math.min(discount, parseFloat(coupon.max_discount));
        }
      } else {
        discount = parseFloat(coupon.discount_value);
      }

      const final_amount = Math.max(0, parseFloat(order_amount) - discount);

      return res.status(200).json({
        success: true,
        message: 'Coupon is valid.',
        data: {
          coupon_id: coupon.id,
          code: coupon.code,
          discount_type: coupon.discount_type,
          discount_value: coupon.discount_value,
          discount_amount: discount,
          original_amount: order_amount,
          final_amount: parseFloat(final_amount.toFixed(2)),
        },
      });
    } catch (err) {
      console.error('Validate coupon error:', err);
      return res.status(500).json({ success: false, message: 'Failed to validate coupon.' });
    }
  }
);

// ============================================================
// POST /api/coupons  - Admin: create coupon
// ============================================================
router.post(
  '/',
  adminAuth,
  [
    body('code').trim().notEmpty().toUpperCase().withMessage('Coupon code is required'),
    body('discount_type').isIn(['percent', 'flat']).withMessage('Invalid discount type'),
    body('discount_value').isFloat({ min: 0.01 }).withMessage('Discount value is required'),
    body('min_order_amount').optional().isFloat({ min: 0 }),
    body('max_discount').optional().isFloat({ min: 0 }),
    body('max_uses').optional().isInt({ min: 1 }),
    body('expires_at').optional().isISO8601(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { code, discount_type, discount_value, min_order_amount, max_discount, max_uses, expires_at } = req.body;

      // Check unique code
      const [existing] = await db.execute('SELECT id FROM coupons WHERE code = ?', [code.toUpperCase()]);
      if (existing.length > 0) {
        return res.status(409).json({ success: false, message: 'Coupon code already exists.' });
      }

      const id = uuidv4();
      await db.execute(
        `INSERT INTO coupons (id, code, discount_type, discount_value, min_order_amount, max_discount, max_uses, expires_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, code.toUpperCase(), discount_type, discount_value, min_order_amount || 0, max_discount || null, max_uses || null, expires_at || null]
      );

      const [rows] = await db.execute('SELECT * FROM coupons WHERE id = ?', [id]);

      return res.status(201).json({ success: true, message: 'Coupon created.', data: rows[0] });
    } catch (err) {
      console.error('Create coupon error:', err);
      return res.status(500).json({ success: false, message: 'Failed to create coupon.' });
    }
  }
);

// ============================================================
// PUT /api/coupons/:id  - Admin: update coupon
// ============================================================
router.put(
  '/:id',
  adminAuth,
  [
    body('discount_value').optional().isFloat({ min: 0.01 }),
    body('is_active').optional().isBoolean(),
    body('max_uses').optional().isInt({ min: 1 }),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { id } = req.params;
      const { discount_value, min_order_amount, max_discount, max_uses, is_active, expires_at } = req.body;

      const [existing] = await db.execute('SELECT id FROM coupons WHERE id = ?', [id]);
      if (existing.length === 0) {
        return res.status(404).json({ success: false, message: 'Coupon not found.' });
      }

      // Strip time portion — MySQL DATE column rejects ISO 8601 datetime strings
      const expiresAtDate = expires_at ? expires_at.slice(0, 10) : null;
      // Explicit 0/1 coercion for MySQL TINYINT
      const isActiveVal = is_active != null ? (is_active ? 1 : 0) : null;

      await db.execute(
        `UPDATE coupons SET
          discount_value = COALESCE(?, discount_value),
          min_order_amount = COALESCE(?, min_order_amount),
          max_discount = COALESCE(?, max_discount),
          max_uses = COALESCE(?, max_uses),
          is_active = COALESCE(?, is_active),
          expires_at = COALESCE(?, expires_at)
        WHERE id = ?`,
        [discount_value || null, min_order_amount != null ? min_order_amount : null, max_discount || null, max_uses || null, isActiveVal, expiresAtDate, id]
      );

      const [rows] = await db.execute('SELECT * FROM coupons WHERE id = ?', [id]);

      return res.status(200).json({ success: true, message: 'Coupon updated.', data: rows[0] });
    } catch (err) {
      console.error('Update coupon error:', err);
      return res.status(500).json({ success: false, message: 'Failed to update coupon.' });
    }
  }
);

// ============================================================
// DELETE /api/coupons/:id  - Admin: deactivate coupon
// ============================================================
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const [existing] = await db.execute('SELECT id FROM coupons WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Coupon not found.' });
    }

    await db.execute('DELETE FROM coupons WHERE id = ?', [id]);

    return res.status(200).json({ success: true, message: 'Coupon deleted.' });
  } catch (err) {
    console.error('Delete coupon error:', err);
    return res.status(500).json({ success: false, message: 'Failed to delete coupon.' });
  }
});

module.exports = router;
