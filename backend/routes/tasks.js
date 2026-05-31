// routes/tasks.js
// GET    /api/tasks          – list all tasks for the logged-in user
// POST   /api/tasks          – create a new task
// PUT    /api/tasks/:id      – toggle completion or update title
// DELETE /api/tasks/:id      – delete a task

const express = require('express');
const { body, validationResult } = require('express-validator');
const db   = require('../config/db');
const auth = require('../middleware/auth');

const router = express.Router();
router.use(auth); // All task routes require authentication

// ─── GET /api/tasks ─────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const [tasks] = await db.query(
      'SELECT * FROM tasks WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.id]
    );
    return res.json({ success: true, tasks });
  } catch (err) {
    console.error('Get tasks error:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ─── POST /api/tasks ────────────────────────────────────────
router.post(
  '/',
  [body('task_title').trim().notEmpty().withMessage('Task title is required')],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { task_title } = req.body;
    try {
      const [result] = await db.query(
        'INSERT INTO tasks (user_id, task_title) VALUES (?, ?)',
        [req.user.id, task_title]
      );
      const [rows] = await db.query('SELECT * FROM tasks WHERE id = ?', [result.insertId]);
      return res.status(201).json({ success: true, task: rows[0] });
    } catch (err) {
      console.error('Create task error:', err);
      return res.status(500).json({ success: false, message: 'Server error.' });
    }
  }
);

// ─── PUT /api/tasks/:id ─────────────────────────────────────
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { is_completed, task_title } = req.body;

  try {
    // Verify ownership
    const [rows] = await db.query(
      'SELECT * FROM tasks WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }

    const updates = [];
    const values  = [];

    if (typeof is_completed !== 'undefined') {
      updates.push('is_completed = ?');
      values.push(is_completed ? 1 : 0);
    }
    if (task_title) {
      updates.push('task_title = ?');
      values.push(task_title.trim());
    }

    if (updates.length === 0) {
      return res.status(400).json({ success: false, message: 'Nothing to update.' });
    }

    values.push(id);
    await db.query(`UPDATE tasks SET ${updates.join(', ')} WHERE id = ?`, values);

    const [updated] = await db.query('SELECT * FROM tasks WHERE id = ?', [id]);
    return res.json({ success: true, task: updated[0] });
  } catch (err) {
    console.error('Update task error:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ─── DELETE /api/tasks/:id ──────────────────────────────────
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.query(
      'SELECT id FROM tasks WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }

    await db.query('DELETE FROM tasks WHERE id = ?', [id]);
    return res.json({ success: true, message: 'Task deleted.' });
  } catch (err) {
    console.error('Delete task error:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});

module.exports = router;
