import bcrypt from 'bcryptjs';
import { query } from '../config/db.js';
import { generateToken, getCookieOptions } from '../utils/token.js';

export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists.',
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Insert user
    const userRes = await query(
      `INSERT INTO users (name, email, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, name, email, created_at`,
      [name, email, passwordHash]
    );
    const user = userRes.rows[0];

    // Create initial profile record
    await query(
      `INSERT INTO profiles (user_id)
       VALUES ($1)
       ON CONFLICT (user_id) DO NOTHING`,
      [user.id]
    );

    // Issue JWT cookie & token
    const token = generateToken(user);
    res.cookie('token', token, getCookieOptions());

    res.status(201).json({
      success: true,
      message: 'Account registered successfully.',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.created_at,
      },
      token, // Also provided in payload for clients preferring Authorization headers
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Lookup user
    const userRes = await query('SELECT id, name, email, password_hash, created_at FROM users WHERE email = $1', [email]);
    if (userRes.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const user = userRes.rows[0];

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // Issue JWT cookie & token
    const token = generateToken(user);
    res.cookie('token', token, getCookieOptions());

    res.json({
      success: true,
      message: 'Logged in successfully.',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.created_at,
      },
      token,
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res) => {
  res.clearCookie('token', { path: '/' });
  res.json({
    success: true,
    message: 'Logged out successfully.',
  });
};

export const getMe = async (req, res, next) => {
  try {
    const userRes = await query(
      `SELECT u.id, u.name, u.email, u.created_at,
              p.education, p.degree, p.skills, p.interests,
              p.experience_level, p.target_career, p.career_goals,
              p.learning_preferences, p.weekly_study_hours
       FROM users u
       LEFT JOIN profiles p ON u.id = p.user_id
       WHERE u.id = $1`,
      [req.user.id]
    );

    if (userRes.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User account not found.',
      });
    }

    const row = userRes.rows[0];
    const user = {
      id: row.id,
      name: row.name,
      email: row.email,
      createdAt: row.created_at,
      profile: {
        education: row.education || '',
        degree: row.degree || '',
        skills: row.skills || [],
        interests: row.interests || [],
        experienceLevel: row.experience_level || 'Beginner',
        targetCareer: row.target_career || '',
        careerGoals: row.career_goals || '',
        learningPreferences: row.learning_preferences || 'Hands-on projects',
        weeklyStudyHours: row.weekly_study_hours || 10,
      },
    };

    res.json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};
