import { query } from '../config/db.js';
import { AIService } from '../services/ai.service.js';

export const getResources = async (req, res, next) => {
  try {
    const { skill, topic, search } = req.query;

    let sql = 'SELECT * FROM learning_resources';
    const params = [];

    const queryTerm = search || skill || topic;
    if (queryTerm) {
      params.push(`%${queryTerm}%`);
      sql += ' WHERE LOWER(skill_name) LIKE LOWER($1) OR LOWER(topic) LIKE LOWER($1) OR LOWER(title) LIKE LOWER($1) OR LOWER(category) LIKE LOWER($1)';
    }

    sql += ' ORDER BY title ASC';

    const resourcesRes = await query(sql, params);
    let allResources = resourcesRes.rows || [];

    let userSkills = [];
    let missingSkills = [];
    let targetCareer = '';

    // If authenticated user is present, calculate personalized mappings
    if (req.user?.id) {
      const profileRes = await query('SELECT target_career, skills FROM profiles WHERE user_id = $1', [req.user.id]);
      const profile = profileRes.rows[0] || {};
      userSkills = Array.isArray(profile.skills) ? profile.skills : [];
      targetCareer = profile.target_career || '';

      // Check required skills for target career
      if (targetCareer) {
        const roleRes = await query('SELECT required_skills FROM career_roles WHERE LOWER(title) = LOWER($1)', [targetCareer]);
        if (roleRes.rows[0]?.required_skills) {
          const required = roleRes.rows[0].required_skills;
          missingSkills = required.filter(
            (reqSkill) => !userSkills.some((u) => u.toLowerCase() === reqSkill.toLowerCase())
          );
        }
      }

      // Check latest resume analysis for any additional missing skills
      const resumeRes = await query(
        'SELECT analysis_result FROM resume_analyses WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1',
        [req.user.id]
      );
      if (resumeRes.rows[0]?.analysis_result) {
        const rAnalysis = resumeRes.rows[0].analysis_result;
        if (Array.isArray(rAnalysis.missingSkills)) {
          for (const s of rAnalysis.missingSkills) {
            const skillName = typeof s === 'string' ? s : s?.name;
            if (
              skillName &&
              !missingSkills.some((m) => m.toLowerCase() === skillName.toLowerCase()) &&
              !userSkills.some((u) => u.toLowerCase() === skillName.toLowerCase())
            ) {
              missingSkills.push(skillName);
            }
          }
        }
      }
    }

    // Helper to test if a resource matches a list of skill names
    const matchesSkillList = (resource, skillList) => {
      if (!Array.isArray(skillList) || skillList.length === 0) return false;
      const rSkill = (resource.skill_name || '').toLowerCase();
      const rTopic = (resource.topic || '').toLowerCase();
      const rTitle = (resource.title || '').toLowerCase();
      return skillList.some((s) => {
        const lower = s.toLowerCase();
        return (
          rSkill.includes(lower) ||
          lower.includes(rSkill) ||
          rTopic.includes(lower) ||
          lower.includes(rTopic) ||
          rTitle.includes(lower)
        );
      });
    };

    // Enrich resources with personalized badges
    const enriched = allResources.map((r) => ({
      ...r,
      is_missing_skill: matchesSkillList(r, missingSkills),
      is_current_skill: matchesSkillList(r, userSkills),
    }));

    // Collect distinct available skills and categories across all resources
    const availableSkillsSet = new Set();
    const categoriesSet = new Set();
    for (const r of allResources) {
      if (r.skill_name) availableSkillsSet.add(r.skill_name);
      if (r.topic) availableSkillsSet.add(r.topic);
      if (r.category) categoriesSet.add(r.category);
    }

    res.json({
      success: true,
      resources: enriched,
      userSkills,
      missingSkills,
      targetCareer,
      totalCount: enriched.length,
      availableSkills: Array.from(availableSkillsSet).sort(),
      categories: Array.from(categoriesSet).sort(),
    });
  } catch (error) {
    next(error);
  }
};

export const generateSkillResources = async (req, res, next) => {
  try {
    const { skill } = req.body;
    if (!skill || typeof skill !== 'string' || !skill.trim()) {
      return res.status(400).json({ success: false, message: 'Please specify a valid skill or technology name.' });
    }

    const cleanSkill = skill.trim();

    // Check if we already have resources for this skill
    const existingRes = await query(
      'SELECT * FROM learning_resources WHERE LOWER(skill_name) = LOWER($1) OR LOWER(topic) = LOWER($1)',
      [cleanSkill]
    );

    if (existingRes.rows && existingRes.rows.length >= 2) {
      return res.json({
        success: true,
        resources: existingRes.rows,
        message: `Found ${existingRes.rows.length} existing verified resources for "${cleanSkill}".`,
        alreadyExisted: true,
      });
    }

    // Generate fresh curated resources using AI
    const generated = await AIService.generateResourcesForSkill(cleanSkill);
    const saved = [];

    for (const item of generated) {
      const insertRes = await query(
        'INSERT INTO learning_resources (title, url, topic, skill_name, category, resource_type, difficulty, description) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
        [
          item.title,
          item.url,
          item.topic || cleanSkill,
          item.skill_name || cleanSkill,
          item.category || 'General',
          item.resource_type || 'Documentation',
          item.difficulty || 'Intermediate',
          item.description || '',
        ]
      );
      if (insertRes.rows && insertRes.rows[0]) {
        saved.push(insertRes.rows[0]);
      }
    }

    res.json({
      success: true,
      resources: saved.length > 0 ? saved : generated,
      message: `Generated and added ${saved.length || generated.length} verified resources for "${cleanSkill}".`,
    });
  } catch (error) {
    next(error);
  }
};

export const getRecommendedProjects = async (req, res, next) => {
  try {
    const profileRes = await query('SELECT target_career, skills FROM profiles WHERE user_id = $1', [req.user.id]);
    const profile = profileRes.rows[0] || {};
    const targetCareer = profile.target_career || '';

    // Fetch user's saved/generated portfolio projects
    const userProjectsRes = await query(
      'SELECT * FROM user_projects WHERE user_id = $1',
      [req.user.id]
    );

    const projects = userProjectsRes.rows || [];

    res.json({
      success: true,
      targetCareer,
      projects,
    });
  } catch (error) {
    next(error);
  }
};

export const saveUserProject = async (req, res, next) => {
  try {
    const {
      title,
      difficulty,
      technologies,
      skills_developed,
      main_objectives,
      suggested_features,
      estimated_effort,
    } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, message: 'Project title is required' });
    }

    const insertRes = await query(
      'INSERT INTO user_projects (user_id, title, difficulty, technologies, skills_developed, main_objectives, suggested_features, estimated_effort) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [
        req.user.id,
        title,
        difficulty || 'Intermediate',
        Array.isArray(technologies) ? technologies : [],
        Array.isArray(skills_developed) ? skills_developed : [],
        main_objectives || '',
        Array.isArray(suggested_features) ? suggested_features : [],
        estimated_effort || '15-20 hours',
      ]
    );

    res.json({
      success: true,
      project: insertRes.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

export const deleteUserProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    await query('DELETE FROM user_projects WHERE id = $1 AND user_id = $2', [id, req.user.id]);

    res.json({
      success: true,
      message: 'Project removed successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const generateCustomProjectIdeas = async (req, res, next) => {
  try {
    const { technology, difficulty, projectType } = req.body;
    const ideas = await AIService.generateProjectIdeas(
      technology || 'React',
      difficulty || 'Intermediate',
      projectType || 'Web Application'
    );

    res.json({
      success: true,
      ideas,
    });
  } catch (error) {
    next(error);
  }
};
