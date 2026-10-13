import { query } from '../config/db.js';
import { CareerService } from '../services/career.service.js';
import { AIService } from '../services/ai.service.js';
import { extractSkillsFromJobDescription } from '../utils/jobDescriptionSkills.js';
import { normalizeSkill } from '../utils/skillDictionary.js';

export const getCareers = async (req, res, next) => {
  try {
    const rolesRes = await query('SELECT * FROM career_roles ORDER BY title ASC');
    res.json({
      success: true,
      careers: rolesRes.rows,
    });
  } catch (error) {
    next(error);
  }
};

export const getCareerById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const roleRes = await query('SELECT * FROM career_roles WHERE id = $1', [id]);
    if (roleRes.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Career role not found.',
      });
    }

    res.json({
      success: true,
      career: roleRes.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

export const recommendCareers = async (req, res, next) => {
  try {
    const profileRes = await query('SELECT * FROM profiles WHERE user_id = $1', [req.user.id]);
    const profile = profileRes.rows[0] || {};

    const scoredRoles = await CareerService.getRoleMatchesForProfile(profile);
    const enrichedRecommendations = await AIService.enrichCareerRecommendations(scoredRoles, profile);

    res.json({
      success: true,
      recommendations: enrichedRecommendations,
      profileUsed: {
        skills: profile.skills || [],
        interests: profile.interests || [],
        experienceLevel: profile.experience_level || 'Beginner',
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Extract skills from raw job description and compare against user's profile
 */
export const extractSkillsFromJD = async (req, res, next) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Job description text cannot be empty.',
      });
    }

    const extracted = extractSkillsFromJobDescription(text);

    // Fetch user skills to compare
    let userSkills = [];
    if (req.user?.id) {
      const profileRes = await query('SELECT skills FROM profiles WHERE user_id = $1', [req.user.id]);
      userSkills = profileRes.rows[0]?.skills || [];
    }

    const normalizedUserSkills = new Set(
      userSkills.map((s) => normalizeSkill(s)?.toLowerCase() || s.toLowerCase())
    );

    const matched = [];
    const missing = [];

    extracted.all.forEach((skill) => {
      const norm = normalizeSkill(skill)?.toLowerCase() || skill.toLowerCase();
      if (normalizedUserSkills.has(norm)) {
        matched.push(skill);
      } else {
        missing.push(skill);
      }
    });

    const matchPercentage = extracted.all.length > 0
      ? Math.round((matched.length / extracted.all.length) * 100)
      : 0;

    res.json({
      success: true,
      extracted,
      comparison: {
        matchPercentage,
        matchedSkills: matched,
        missingSkills: missing,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Analyze custom career role input by user's choice
 */
export const analyzeCustomRole = async (req, res, next) => {
  try {
    let rawInput = req.body?.target_career || req.body?.title || req.body?.role || req.query?.role || req.query?.target_career || '';

    // If not provided in request, fall back to user profile's target_career
    if (!rawInput && req.user?.id) {
      const profileRes = await query('SELECT target_career FROM profiles WHERE user_id = $1', [req.user.id]);
      rawInput = profileRes.rows[0]?.target_career || '';
    }

    if (!rawInput || !rawInput.trim()) {
      rawInput = 'Full-Stack Developer';
    }

    const cleanTitle = rawInput.trim();

    // Fetch user profile skills
    let userSkills = [];
    if (req.user?.id) {
      const profileRes = await query('SELECT skills FROM profiles WHERE user_id = $1', [req.user.id]);
      userSkills = profileRes.rows[0]?.skills || [];
    }

    // Check if cleanTitle matches an existing benchmark role
    const existingRoleRes = await query(
      'SELECT * FROM career_roles WHERE LOWER(title) = LOWER($1)',
      [cleanTitle]
    );

    let roleData;
    let isCustom = false;

    if (existingRoleRes.rows.length > 0) {
      const r = existingRoleRes.rows[0];
      roleData = {
        id: r.id,
        title: r.title,
        description: r.description,
        required_skills: r.required_skills,
        recommended_projects: r.recommended_projects || [],
        learning_advice: `Master the essential industry benchmark competencies for ${r.title}.`,
      };
      isCustom = false;
    } else {
      // Fuzzy check against known benchmark roles (e.g. "Full Stack Developer" matching "Full-Stack Developer")
      const allRolesRes = await query('SELECT * FROM career_roles ORDER BY title ASC');
      const normalizedQuery = cleanTitle.toLowerCase().replace(/[-_\s]+/g, '');
      const matchedKnownRole = (allRolesRes.rows || []).find((r) => {
        const normRole = (r.title || '').toLowerCase().replace(/[-_\s]+/g, '');
        return normRole === normalizedQuery;
      });

      if (matchedKnownRole) {
        roleData = {
          id: matchedKnownRole.id,
          title: matchedKnownRole.title,
          description: matchedKnownRole.description,
          required_skills: matchedKnownRole.required_skills,
          recommended_projects: matchedKnownRole.recommended_projects || [],
          learning_advice: `Master the essential industry benchmark competencies for ${matchedKnownRole.title}.`,
        };
        isCustom = false;
      } else {
        roleData = await AIService.extractSkillsForCustomRole(cleanTitle);
        isCustom = true;
      }
    }

    const requiredSkills = Array.isArray(roleData?.required_skills) && roleData.required_skills.length > 0
      ? roleData.required_skills
      : ['Programming Fundamentals', 'Git & Version Control', 'Problem Solving', 'Software Architecture'];

    const gap = CareerService.analyzeSkillGap(userSkills, requiredSkills);

    const result = {
      id: roleData.id || `role-${cleanTitle.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
      title: roleData.title || cleanTitle,
      description: roleData.description || `Specialized professional domain focusing on ${cleanTitle}.`,
      required_skills: requiredSkills,
      recommended_projects: roleData.recommended_projects || [],
      learning_advice: roleData.learning_advice || `Focus on mastering the core technical skills and practical projects for ${cleanTitle}.`,
      isCustom,
      analysis: {
        score: gap.matchPercentage,
        total: gap.totalRequired,
        matched: gap.matchedSkills,
        missing: gap.missingSkills,
        readinessStatus: gap.readinessStatus,
      },
    };

    res.json({
      success: true,
      role: result,
      analysis: result.analysis,
    });
  } catch (error) {
    console.error('[Careers Controller] analyzeCustomRole error:', error);
    next(error);
  }
};
