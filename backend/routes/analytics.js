// routes/analytics.js
// GET /api/analytics – returns aggregated study analytics for logged-in user

const express = require('express');
const db   = require('../config/db');
const auth = require('../middleware/auth');

const router = express.Router();
router.use(auth);

router.get('/', async (req, res) => {
  const userId = req.user.id;

  try {
    // ── Total study hours & total sessions ──
    const [[{ total_hours, total_minutes, total_sessions }]] = await db.query(
      `SELECT
         COALESCE(SUM(study_hours), 0)   AS total_hours,
         COALESCE(SUM(study_minutes), 0) AS total_minutes,
         COUNT(*)                         AS total_sessions
       FROM study_sessions
       WHERE user_id = ?`,
      [userId]
    );

    // Convert minutes overflow into hours
    const allMinutes    = Number(total_hours) * 60 + Number(total_minutes);
    const grandTotalHrs = Math.floor(allMinutes / 60);
    const remMins       = allMinutes % 60;

    // ── Task completion stats ──
    const [[{ total_tasks, completed_tasks }]] = await db.query(
      `SELECT
         COUNT(*)                              AS total_tasks,
         SUM(CASE WHEN is_completed=1 THEN 1 ELSE 0 END) AS completed_tasks
       FROM tasks
       WHERE user_id = ?`,
      [userId]
    );

    const completion_rate =
      total_tasks > 0 ? ((completed_tasks / total_tasks) * 100).toFixed(1) : 0;

    // ── Weekly chart: last 7 days ──
    const [weeklyRaw] = await db.query(
      `SELECT
         session_date,
         SUM(study_hours * 60 + study_minutes) AS total_minutes
       FROM study_sessions
       WHERE user_id = ?
         AND session_date >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
       GROUP BY session_date
       ORDER BY session_date ASC`,
      [userId]
    );

    // Build a full 7-day map (fill in 0 for missing days)
    const weeklyMap = {};
    for (const row of weeklyRaw) {
      weeklyMap[row.session_date] = Math.round(row.total_minutes / 60 * 10) / 10;
    }
    const weekly = [];
    for (let i = 6; i >= 0; i--) {
      const d    = new Date();
      d.setDate(d.getDate() - i);
      const key  = d.toISOString().split('T')[0];
      const label = d.toLocaleDateString('en-US', { weekday: 'short' });
      weekly.push({ date: key, label, hours: weeklyMap[key] || 0 });
    }

    // ── Monthly chart: current month ──
    const [monthlyRaw] = await db.query(
      `SELECT
         DAY(session_date) AS day_num,
         SUM(study_hours * 60 + study_minutes) AS total_minutes
       FROM study_sessions
       WHERE user_id = ?
         AND MONTH(session_date) = MONTH(CURDATE())
         AND YEAR(session_date)  = YEAR(CURDATE())
       GROUP BY DAY(session_date)
       ORDER BY day_num ASC`,
      [userId]
    );

    const monthly = monthlyRaw.map((r) => ({
      day:   r.day_num,
      hours: Math.round((r.total_minutes / 60) * 10) / 10,
    }));

    // ── Streak ──
    const [[streak]] = await db.query(
      'SELECT current_streak, longest_streak FROM streaks WHERE user_id = ?',
      [userId]
    );

    return res.json({
      success: true,
      analytics: {
        total_hours:      grandTotalHrs,
        total_minutes_rem: remMins,
        total_sessions:   Number(total_sessions),
        total_tasks:      Number(total_tasks),
        completed_tasks:  Number(completed_tasks),
        completion_rate:  Number(completion_rate),
        current_streak:   streak ? streak.current_streak : 0,
        longest_streak:   streak ? streak.longest_streak : 0,
        weekly,
        monthly,
      },
    });
  } catch (err) {
    console.error('Analytics error:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});

module.exports = router;
