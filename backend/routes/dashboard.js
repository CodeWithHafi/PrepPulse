// routes/dashboard.js
// GET /api/dashboard – all data needed for the dashboard in one call

const express = require('express');
const db   = require('../config/db');
const auth = require('../middleware/auth');

const router = express.Router();
router.use(auth);

router.get('/', async (req, res) => {
  const userId = req.user.id;

  try {
    // User info
    const [[user]] = await db.query(
      'SELECT id, name, email, exam_name, exam_date FROM users WHERE id = ?',
      [userId]
    );

    // Today's tasks
    const today = new Date().toISOString().split('T')[0];
    const [[todayTasks]] = await db.query(
      `SELECT
         COUNT(*) AS total,
         SUM(CASE WHEN is_completed=1 THEN 1 ELSE 0 END) AS completed
       FROM tasks
       WHERE user_id = ? AND DATE(created_at) = ?`,
      [userId, today]
    );

    // All-time task counts
    const [[allTasks]] = await db.query(
      `SELECT
         COUNT(*) AS total,
         SUM(CASE WHEN is_completed=1 THEN 1 ELSE 0 END) AS completed
       FROM tasks WHERE user_id = ?`,
      [userId]
    );

    // Streak
    const [[streak]] = await db.query(
      'SELECT current_streak, longest_streak FROM streaks WHERE user_id = ?',
      [userId]
    );

    // Total study hours (all time)
    const [[studyTotals]] = await db.query(
      `SELECT
         COALESCE(SUM(study_hours),0)   AS hours,
         COALESCE(SUM(study_minutes),0) AS minutes
       FROM study_sessions WHERE user_id = ?`,
      [userId]
    );

    // Days remaining
    const examDate    = new Date(user.exam_date);
    const now         = new Date();
    now.setHours(0, 0, 0, 0);
    const daysRemaining = Math.max(
      0,
      Math.ceil((examDate - now) / (1000 * 60 * 60 * 24))
    );

    const totalMinutes = Number(studyTotals.hours) * 60 + Number(studyTotals.minutes);
    const totalHours   = Math.floor(totalMinutes / 60);

    return res.json({
      success: true,
      dashboard: {
        user,
        exam: {
          name:          user.exam_name,
          date:          user.exam_date,
          days_remaining: daysRemaining,
          predicted_hours: daysRemaining * 3,
        },
        today_tasks: {
          total:     Number(todayTasks.total),
          completed: Number(todayTasks.completed || 0),
          remaining: Number(todayTasks.total) - Number(todayTasks.completed || 0),
        },
        all_tasks: {
          total:     Number(allTasks.total),
          completed: Number(allTasks.completed || 0),
        },
        streak: {
          current: streak ? streak.current_streak : 0,
          longest: streak ? streak.longest_streak : 0,
        },
        study: {
          total_hours: totalHours,
        },
      },
    });
  } catch (err) {
    console.error('Dashboard error:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});

module.exports = router;
