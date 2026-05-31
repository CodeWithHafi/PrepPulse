// routes/profile.js
// GET /api/profile      – get logged-in user profile
// PUT /api/profile      – update name / exam_name / exam_date / password

const express = require('express');
const bcrypt  = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const db   = require('../config/db');
const auth = require('../middleware/auth');

const router = express.Router();
router.use(auth);

// ─── GET /api/profile ───────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT id, name, email, exam_name, exam_date, created_at FROM users WHERE id = ?',
      [req.user.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    return res.json({ success: true, user: rows[0] });
  } catch (err) {
    console.error('Get profile error:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ─── PUT /api/profile ───────────────────────────────────────
router.put(
  '/',
  [
    body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
    body('exam_name').optional().trim().notEmpty().withMessage('Exam name cannot be empty'),
    body('exam_date').optional().isDate().withMessage('Valid exam date required'),
    body('new_password')
      .optional()
      .isLength({ min: 8 })
      .withMessage('New password must be at least 8 characters'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { name, exam_name, exam_date, current_password, new_password } = req.body;

    try {
      const [rows] = await db.query('SELECT * FROM users WHERE id = ?', [req.user.id]);
      if (rows.length === 0) {
        return res.status(404).json({ success: false, message: 'User not found.' });
      }
      const user = rows[0];

      const updates = [];
      const values  = [];

      if (name) {
        updates.push('name = ?');
        values.push(name);
      }
      if (exam_name) {
        updates.push('exam_name = ?');
        values.push(exam_name);
      }
      if (exam_date) {
        updates.push('exam_date = ?');
        values.push(exam_date);
      }

      // Password change
      if (new_password) {
        if (!current_password) {
          return res
            .status(400)
            .json({ success: false, message: 'Current password is required to change password.' });
        }
        const match = await bcrypt.compare(current_password, user.password);
        if (!match) {
          return res
            .status(400)
            .json({ success: false, message: 'Current password is incorrect.' });
        }
        const hash = await bcrypt.hash(new_password, 12);
        updates.push('password = ?');
        values.push(hash);
      }

      if (updates.length === 0) {
        return res.status(400).json({ success: false, message: 'Nothing to update.' });
      }

      values.push(req.user.id);
      await db.query(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, values);

      const [updated] = await db.query(
        'SELECT id, name, email, exam_name, exam_date, created_at FROM users WHERE id = ?',
        [req.user.id]
      );
      return res.json({ success: true, user: updated[0] });
    } catch (err) {
      console.error('Update profile error:', err);
      return res.status(500).json({ success: false, message: 'Server error.' });
    }
  }
);

module.exports = router;
