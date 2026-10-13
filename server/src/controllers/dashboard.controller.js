import { query } from '../config/db.js';
import { CareerService } from '../services/career.service.js';

export const getDashboardSummary = async (req, res, next) => {
  try {
    // 1. Fetch user & profile
    const userRes = await query(
      `SELECT u.name, u.email, p.*
       FROM users u
       LEFT JOIN profiles p ON u.id = p.user_id
       WHERE u.id = $1`,
      [req.user.id]
    );

    const userData = userRes.rows[0] || {};

    // 2. Fetch latest active roadmap
    const roadmapRes = await query(
      `SELECT r.*,
              COUNT(t.id) as total_tasks,
              COUNT(CASE WHEN t.status = 'Completed' THEN 1 END) as completed_tasks
       FROM roadmaps r
       LEFT JOIN roadmap_tasks t ON r.id = t.roadmap_id
       WHERE r.user_id = $1
       GROUP BY r.id
       ORDER BY r.created_at DESC
       LIMIT 1`,
      [req.user.id]
    );

    let activeRoadmap = null;
    let nextPendingTask = null;

    if (roadmapRes.rows.length > 0) {
      const r = roadmapRes.rows[0];
      const total = parseInt(r.total_tasks, 10) || 0;
      const completed = parseInt(r.completed_tasks, 10) || 0;
      const progressPercentage = total > 0 ? Math.round((completed / total) * 100) : 0;

      // Find the next task to resume
      const nextTaskRes = await query(
        `SELECT * FROM roadmap_tasks
         WHERE roadmap_id = $1 AND status != 'Completed'
         ORDER BY phase_order ASC, created_at ASC
         LIMIT 1`,
        [r.id]
      );

      activeRoadmap = {
        id: r.id,
        careerTitle: r.career_title,
        totalTasks: total,
        completedTasks: completed,
        pendingTasks: Math.max(0, total - completed),
        progressPercentage,
        createdAt: r.created_at,
      };

      nextPendingTask = nextTaskRes.rows[0] || null;
    }

    // 3. Skill gap summary for target career
    const targetCareer = userData.target_career || 'Full-Stack Developer';
    const roleRes = await query(
      'SELECT required_skills FROM career_roles WHERE LOWER(title) = LOWER($1)',
      [targetCareer]
    );
    const requiredSkills = roleRes.rows[0]?.required_skills || [
      'JavaScript',
      'React',
      'Node.js',
      'PostgreSQL',
      'Git',
    ];
    const skillGap = CareerService.analyzeSkillGap(userData.skills || [], requiredSkills);

    // 4. Recent conversations
    const recentConvs = await query(
      `SELECT id, title, updated_at
       FROM chat_conversations
       WHERE user_id = $1
       ORDER BY updated_at DESC
       LIMIT 3`,
      [req.user.id]
    );

    res.json({
      success: true,
      user: {
        name: userData.name,
        email: userData.email,
        targetCareer: userData.target_career,
        experienceLevel: userData.experience_level,
        skillsCount: (userData.skills || []).length,
      },
      activeRoadmap,
      nextPendingTask,
      skillGap,
      recentConversations: recentConvs.rows,
    });
  } catch (error) {
    next(error);
  }
};
