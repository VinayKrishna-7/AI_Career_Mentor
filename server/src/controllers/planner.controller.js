import { query } from '../config/db.js';

export const getStudySessions = async (req, res, next) => {
  try {
    const sessionsRes = await query(
      `SELECT * FROM study_sessions
       WHERE user_id = $1
       ORDER BY session_date DESC, created_at DESC
       LIMIT 30`,
      [req.user.id]
    );

    // Also get user's target weekly study hours from profile
    const profileRes = await query(
      'SELECT weekly_study_hours FROM profiles WHERE user_id = $1',
      [req.user.id]
    );
    const weeklyTarget = profileRes.rows[0]?.weekly_study_hours || 10;

    res.json({
      success: true,
      weeklyTargetHours: weeklyTarget,
      sessions: sessionsRes.rows,
    });
  } catch (error) {
    next(error);
  }
};

export const logStudySession = async (req, res, next) => {
  try {
    const { subject, duration_minutes, completed } = req.body;

    if (!subject || !duration_minutes) {
      return res.status(400).json({
        success: false,
        message: 'Subject and duration in minutes are required.',
      });
    }

    const insertRes = await query(
      `INSERT INTO study_sessions (user_id, subject, duration_minutes, completed)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [req.user.id, subject.trim(), parseInt(duration_minutes, 10), completed ?? true]
    );

    res.status(201).json({
      success: true,
      message: 'Study session recorded successfully.',
      session: insertRes.rows[0],
    });
  } catch (error) {
    next(error);
  }
};
