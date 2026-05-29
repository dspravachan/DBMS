const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');
const db = require('../config/db');
const auth = require('../middleware/auth');

const router = express.Router();

// Helper: generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

// ============================================================
// POST /api/auth/register
// ============================================================
router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required').isLength({ min: 2, max: 100 }),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
    body('phone').optional().isMobilePhone().withMessage('Invalid phone number'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { name, email, password, phone, address } = req.body;

      // Check if email already exists
      const [existing] = await db.execute('SELECT id FROM users WHERE email = ?', [email]);
      if (existing.length > 0) {
        return res.status(409).json({ success: false, message: 'Email already registered.' });
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash(password, salt);

      const userId = uuidv4();

      // Insert user
      await db.execute(
        'INSERT INTO users (id, name, email, password_hash, role, phone, address) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [userId, name, email, password_hash, 'user', phone || null, address || null]
      );

      // Create wallet for new user
      await db.execute('INSERT INTO wallet (id, user_id, balance) VALUES (?, ?, ?)', [
        uuidv4(),
        userId,
        0.0,
      ]);

      // Fetch created user
      const [users] = await db.execute(
        'SELECT id, name, email, role, phone, address, avatar_url, is_active, created_at FROM users WHERE id = ?',
        [userId]
      );

      const user = users[0];
      const token = generateToken(user);

      return res.status(201).json({
        success: true,
        message: 'Account created successfully.',
        data: { token, user },
      });
    } catch (err) {
      console.error('Register error:', err);
      return res.status(500).json({ success: false, message: 'Failed to register user.' });
    }
  }
);

// ============================================================
// POST /api/auth/login
// ============================================================
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email is required').customSanitizer(v => v.toLowerCase().trim()),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { email, password } = req.body;

      // Fetch user with password hash
      const [rows] = await db.execute(
        'SELECT id, name, email, password_hash, role, phone, address, avatar_url, is_active FROM users WHERE email = ?',
        [email]
      );

      if (rows.length === 0) {
        return res.status(401).json({ success: false, message: 'Invalid email or password.' });
      }

      const user = rows[0];

      if (!user.is_active) {
        return res
          .status(403)
          .json({ success: false, message: 'Account is deactivated. Contact support.' });
      }

      // Verify password
      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Invalid email or password.' });
      }

      // Remove sensitive fields
      const { password_hash, ...safeUser } = user;
      const token = generateToken(safeUser);

      return res.status(200).json({
        success: true,
        message: 'Login successful.',
        data: { token, user: safeUser },
      });
    } catch (err) {
      console.error('Login error:', err);
      return res.status(500).json({ success: false, message: 'Failed to login.' });
    }
  }
);

// ============================================================
// GET /api/auth/me  (protected)
// ============================================================
router.get('/me', auth, async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT u.id, u.name, u.email, u.role, u.phone, u.address, u.avatar_url, u.is_active, u.created_at,
              w.balance AS wallet_balance,
              um.id AS membership_id,
              m.name AS membership_name,
              um.end_date AS membership_expires
       FROM users u
       LEFT JOIN wallet w ON w.user_id = u.id
       LEFT JOIN user_memberships um ON um.user_id = u.id AND um.is_active = TRUE
       LEFT JOIN memberships m ON m.id = um.membership_id
       WHERE u.id = ?`,
      [req.user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    return res.status(200).json({ success: true, data: rows[0] });
  } catch (err) {
    console.error('Get me error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch profile.' });
  }
});

// ============================================================
// PUT /api/auth/profile  (protected - update profile)
// ============================================================
router.put(
  '/profile',
  auth,
  [
    body('name').optional().trim().notEmpty().isLength({ min: 2, max: 100 }),
    body('phone').optional().isMobilePhone(),
    body('address').optional().trim(),
    body('avatar_url').optional().isURL(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { name, phone, address, avatar_url } = req.body;

      await db.execute(
        'UPDATE users SET name = COALESCE(?, name), phone = COALESCE(?, phone), address = COALESCE(?, address), avatar_url = COALESCE(?, avatar_url) WHERE id = ?',
        [name || null, phone || null, address || null, avatar_url || null, req.user.id]
      );

      const [rows] = await db.execute(
        'SELECT id, name, email, role, phone, address, avatar_url, is_active, created_at FROM users WHERE id = ?',
        [req.user.id]
      );

      return res.status(200).json({
        success: true,
        message: 'Profile updated successfully.',
        data: rows[0],
      });
    } catch (err) {
      console.error('Update profile error:', err);
      return res.status(500).json({ success: false, message: 'Failed to update profile.' });
    }
  }
);

module.exports = router;
