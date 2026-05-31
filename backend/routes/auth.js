// routes/auth.js
// POST /api/auth/register  — create new user
// POST /api/auth/login     — login and return JWT

const express  = require('express');
const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const db       = require('../config/db');

const router = express.Router();

// ─── Helper: sign JWT ───────────────────────────────────────
const signToken = (user) =>
  jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

// ─── POST /api/auth/register ────────────────────────────────
router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters'),
    body('confirmPassword').custom((value, { req }) => {
      if (value !== req.body.password) throw new Error('Passwords do not match');
      return true;
    }),
    body('exam_name').trim().notEmpty().withMessage('Exam name is required'),
    body('exam_date').isDate().withMessage('Valid exam date is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { name, email, password, exam_name, exam_date } = req.body;

    try {
      // Check duplicate email
      const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
      if (existing.length > 0) {
        return res.status(409).json({ success: false, message: 'Email already registered.' });
      }

      // Hash password
      const hash = await bcrypt.hash(password, 12);

      // Insert user
      const [result] = await db.query(
        'INSERT INTO users (name, email, password, exam_name, exam_date) VALUES (?, ?, ?, ?, ?)',
        [name, email, hash, exam_name, exam_date]
      );

      const userId = result.insertId;

      // Initialize streak row
      await db.query(
        'INSERT INTO streaks (user_id, current_streak, longest_streak) VALUES (?, 0, 0)',
        [userId]
      );

      // Return token
      const token = signToken({ id: userId, email });
      return res.status(201).json({
        success: true,
        message: 'Registration successful.',
        token,
        user: { id: userId, name, email, exam_name, exam_date },
      });
    } catch (err) {
      console.error('Register error:', err);
      return res.status(500).json({ success: false, message: 'Server error.' });
    }
  }
);

// ─── POST /api/auth/login ───────────────────────────────────
router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
      if (rows.length === 0) {
        return res.status(401).json({ success: false, message: 'Invalid email or password.' });
      }

      const user = rows[0];
      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        return res.status(401).json({ success: false, message: 'Invalid email or password.' });
      }

      const token = signToken(user);
      return res.json({
        success: true,
        message: 'Login successful.',
        token,
        user: {
          id:        user.id,
          name:      user.name,
          email:     user.email,
          exam_name: user.exam_name,
          exam_date: user.exam_date,
        },
      });
    } catch (err) {
      console.error('Login error:', err);
      return res.status(500).json({ success: false, message: 'Server error.' });
    }
  }
);

module.exports = router;
