// routes/sessions.js
// GET    /api/sessions        – list all sessions for logged-in user
// POST   /api/sessions        – log a study session + update streak
// DELETE /api/sessions/:id    – delete a session

const express = require('express');
const { body, validationResult } = require('express-validator');
const db   = require('../config/db');
const auth = require('../middleware/auth');

const router = express.Router();
router.use(auth);

// ─── Streak update helper ───────────────────────────────────
// Called whenever a new session is logged
async function updateStreak(userId, sessionDate) {
  // sessionDate: 'YYYY-MM-DD' string
  const [rows] = await db.query('SELECT * FROM streaks WHERE user_id = ?', [userId]);

  if (rows.length === 0) {
    // Create streak record
    await db.query(
      'INSERT INTO streaks (user_id, current_streak, longest_streak, last_study_date) VALUES (?, 1, 1, ?)',
      [userId, sessionDate]
    );
    return;
  }

  const streak         = rows[0];
  const lastDate       = streak.last_study_date; // 'YYYY-MM-DD' or null
  const today          = sessionDate;

  if (!lastDate) {
    // First ever session
    await db.query(
      'UPDATE streaks SET current_streak=1, longest_streak=1, last_study_date=? WHERE user_id=?',
      [today, userId]
    );
    return;
  }

  // Compare dates
  const last = new Date(lastDate);
  const curr = new Date(today);
  const diffDays = Math.round((curr - last) / (1000 * 60 * 60 * 24));

  let newCurrent = streak.current_streak;
  let newLongest = streak.longest_streak;

  if (diffDays === 0) {
    // Already studied today – no change
    return;
  } else if (diffDays === 1) {
    // Consecutive day
    newCurrent += 1;
    if (newCurrent > newLongest) newLongest = newCurrent;
  } else {
    // Streak broken
    newCurrent = 1;
  }

  await db.query(
    'UPDATE streaks SET current_streak=?, longest_streak=?, last_study_date=? WHERE user_id=?',
    [newCurrent, newLongest, today, userId]
  );
}

// ─── GET /api/sessions ──────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const [sessions] = await db.query(
      'SELECT * FROM study_sessions WHERE user_id = ? ORDER BY session_date DESC, created_at DESC',
      [req.user.id]
    );
    return res.json({ success: true, sessions });
  } catch (err) {
    console.error('Get sessions error:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ─── POST /api/sessions ─────────────────────────────────────
router.post(
  '/',
  [
    body('subject_name').trim().notEmpty().withMessage('Subject name is required'),
    body('study_hours')
      .isInt({ min: 0, max: 24 })
      .withMessage('Hours must be 0–24'),
    body('study_minutes')
      .isInt({ min: 0, max: 59 })
      .withMessage('Minutes must be 0–59'),
    body('session_date').isDate().withMessage('Valid date is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { subject_name, study_hours, study_minutes, session_date } = req.body;

    // Must have at least 1 minute of study
    if (Number(study_hours) === 0 && Number(study_minutes) === 0) {
      return res
        .status(400)
        .json({ success: false, message: 'Study duration must be at least 1 minute.' });
    }

    try {
      const [result] = await db.query(
        `INSERT INTO study_sessions (user_id, subject_name, study_hours, study_minutes, session_date)
         VALUES (?, ?, ?, ?, ?)`,
        [req.user.id, subject_name, study_hours, study_minutes, session_date]
      );

      // Update streak
      await updateStreak(req.user.id, session_date);

      const [rows] = await db.query('SELECT * FROM study_sessions WHERE id = ?', [result.insertId]);
      return res.status(201).json({ success: true, session: rows[0] });
    } catch (err) {
      console.error('Create session error:', err);
      return res.status(500).json({ success: false, message: 'Server error.' });
    }
  }
);

// ─── DELETE /api/sessions/:id ───────────────────────────────
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.query(
      'SELECT id FROM study_sessions WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Session not found.' });
    }

    await db.query('DELETE FROM study_sessions WHERE id = ?', [id]);
    return res.json({ success: true, message: 'Session deleted.' });
  } catch (err) {
    console.error('Delete session error:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});

module.exports = router;
