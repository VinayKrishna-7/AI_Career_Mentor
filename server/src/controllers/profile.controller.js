import { query } from '../config/db.js';

export const getProfile = async (req, res, next) => {
  try {
    const profileRes = await query(
      `SELECT id, user_id, education, degree, skills, interests,
              experience_level, target_career, career_goals,
              learning_preferences, weekly_study_hours, updated_at
       FROM profiles
       WHERE user_id = $1`,
      [req.user.id]
    );

    if (profileRes.rows.length === 0) {
      // Create profile row if not present
      const insertRes = await query(
        `INSERT INTO profiles (user_id) VALUES ($1) RETURNING *`,
        [req.user.id]
      );
      return res.json({ success: true, profile: insertRes.rows[0] });
    }

    res.json({
      success: true,
      profile: profileRes.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const {
      education,
      degree,
      skills,
      interests,
      experience_level,
      target_career,
      career_goals,
      learning_preferences,
      weekly_study_hours,
    } = req.body;

    const upsertRes = await query(
      `INSERT INTO profiles (
         user_id, education, degree, skills, interests,
         experience_level, target_career, career_goals,
         learning_preferences, weekly_study_hours, updated_at
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, CURRENT_TIMESTAMP)
       ON CONFLICT (user_id) DO UPDATE
       SET education = EXCLUDED.education,
           degree = EXCLUDED.degree,
           skills = EXCLUDED.skills,
           interests = EXCLUDED.interests,
           experience_level = EXCLUDED.experience_level,
           target_career = EXCLUDED.target_career,
           career_goals = EXCLUDED.career_goals,
           learning_preferences = EXCLUDED.learning_preferences,
           weekly_study_hours = EXCLUDED.weekly_study_hours,
           updated_at = CURRENT_TIMESTAMP
       RETURNING *;`,
      [
        req.user.id,
        education || '',
        degree || '',
        skills || [],
        interests || [],
        experience_level || 'Beginner',
        target_career || '',
        career_goals || '',
        learning_preferences || 'Hands-on projects',
        weekly_study_hours || 10,
      ]
    );

    res.json({
      success: true,
      message: 'Career profile updated successfully.',
      profile: upsertRes.rows[0],
    });
  } catch (error) {
    next(error);
  }
};
