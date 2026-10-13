import { query } from '../config/db.js';
import { AIService } from '../services/ai.service.js';

export const generateRoadmap = async (req, res, next) => {
  try {
    const {
      career_title,
      focus_areas,
      experience_level,
      weekly_hours,
      custom_goals,
    } = req.body;

    // Get user profile
    const profileRes = await query('SELECT * FROM profiles WHERE user_id = $1', [req.user.id]);
    const profile = profileRes.rows[0] || {};

    const targetCareer = (career_title || profile.target_career || 'Full-Stack Developer').trim();

    const mergedProfile = {
      ...profile,
      experience_level: experience_level || profile.experience_level || 'Beginner',
      weekly_study_hours: weekly_hours || profile.weekly_study_hours || 10,
      focus_areas: (focus_areas || '').trim(),
      custom_goals: (custom_goals || '').trim(),
    };

    // Find career_role_id if matching title exists
    const roleRes = await query('SELECT id FROM career_roles WHERE LOWER(title) = LOWER($1)', [targetCareer]);
    const careerRoleId = roleRes.rows[0]?.id || null;

    // Generate roadmap using AI service
    const roadmapData = await AIService.generateRoadmap(targetCareer, mergedProfile);

    // Save roadmap in database
    const roadmapInsert = await query(
      `INSERT INTO roadmaps (user_id, career_role_id, career_title, roadmap_data)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [req.user.id, careerRoleId, targetCareer, JSON.stringify(roadmapData)]
    );
    const createdRoadmap = roadmapInsert.rows[0];

    // Extract and persist individual tasks into roadmap_tasks
    let phaseOrder = 1;
    for (const phase of roadmapData.phases || []) {
      for (const task of phase.tasks || []) {
        await query(
          `INSERT INTO roadmap_tasks (
             roadmap_id, title, description, phase_name, phase_order, status, estimated_hours
           )
           VALUES ($1, $2, $3, $4, $5, 'Not Started', $6)`,
          [
            createdRoadmap.id,
            task.title,
            task.description || '',
            phase.name,
            phaseOrder,
            task.estimatedHours || 5,
          ]
        );
      }
      phaseOrder++;
    }

    // Fetch the persisted tasks
    const tasksRes = await query(
      `SELECT * FROM roadmap_tasks WHERE roadmap_id = $1 ORDER BY phase_order ASC, created_at ASC`,
      [createdRoadmap.id]
    );

    res.status(201).json({
      success: true,
      message: 'Roadmap generated successfully.',
      roadmap: {
        ...createdRoadmap,
        tasks: tasksRes.rows,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getRoadmaps = async (req, res, next) => {
  try {
    const roadmapsRes = await query(
      `SELECT r.id, r.career_title, r.created_at, r.updated_at,
              COUNT(t.id) as total_tasks,
              COUNT(CASE WHEN t.status = 'Completed' THEN 1 END) as completed_tasks
       FROM roadmaps r
       LEFT JOIN roadmap_tasks t ON r.id = t.roadmap_id
       WHERE r.user_id = $1
       GROUP BY r.id
       ORDER BY r.created_at DESC`,
      [req.user.id]
    );

    const roadmaps = roadmapsRes.rows.map((r) => {
      const total = parseInt(r.total_tasks, 10) || 0;
      const completed = parseInt(r.completed_tasks, 10) || 0;
      const progressPercentage = total > 0 ? Math.round((completed / total) * 100) : 0;
      return {
        ...r,
        totalTasks: total,
        completedTasks: completed,
        progressPercentage,
      };
    });

    res.json({
      success: true,
      roadmaps,
    });
  } catch (error) {
    next(error);
  }
};

export const getRoadmapById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Verify ownership
    const roadmapRes = await query(
      `SELECT * FROM roadmaps WHERE id = $1 AND user_id = $2`,
      [id, req.user.id]
    );

    if (roadmapRes.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Roadmap not found or you do not have permission to view it.',
      });
    }

    const roadmap = roadmapRes.rows[0];

    // Fetch tasks
    const tasksRes = await query(
      `SELECT * FROM roadmap_tasks WHERE roadmap_id = $1 ORDER BY phase_order ASC, created_at ASC`,
      [id]
    );

    const total = tasksRes.rows.length;
    const completed = tasksRes.rows.filter((t) => t.status === 'Completed').length;
    const progressPercentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    res.json({
      success: true,
      roadmap: {
        ...roadmap,
        tasks: tasksRes.rows,
        totalTasks: total,
        completedTasks: completed,
        progressPercentage,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateTaskStatus = async (req, res, next) => {
  try {
    const { roadmapId, taskId } = req.params;
    const { status } = req.body;

    if (!['Not Started', 'Learning', 'Completed'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be 'Not Started', 'Learning', or 'Completed'.",
      });
    }

    // Verify roadmap ownership
    const ownerRes = await query('SELECT id FROM roadmaps WHERE id = $1 AND user_id = $2', [
      roadmapId,
      req.user.id,
    ]);

    if (ownerRes.rows.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to modify tasks for this roadmap.',
      });
    }

    const completedAt = status === 'Completed' ? new Date().toISOString() : null;

    const taskUpdate = await query(
      `UPDATE roadmap_tasks
       SET status = $1, completed_at = $2, updated_at = CURRENT_TIMESTAMP
       WHERE id = $3 AND roadmap_id = $4
       RETURNING *`,
      [status, completedAt, taskId, roadmapId]
    );

    if (taskUpdate.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Roadmap task not found.',
      });
    }

    // Calculate updated progress
    const statsRes = await query(
      `SELECT COUNT(id) as total, COUNT(CASE WHEN status = 'Completed' THEN 1 END) as completed
       FROM roadmap_tasks WHERE roadmap_id = $1`,
      [roadmapId]
    );
    const total = parseInt(statsRes.rows[0].total, 10);
    const completed = parseInt(statsRes.rows[0].completed, 10);
    const progressPercentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    res.json({
      success: true,
      message: 'Task updated successfully.',
      task: taskUpdate.rows[0],
      roadmapProgress: {
        totalTasks: total,
        completedTasks: completed,
        progressPercentage,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteRoadmap = async (req, res, next) => {
  try {
    const { id } = req.params;

    const deleteRes = await query(
      `DELETE FROM roadmaps WHERE id = $1 AND user_id = $2 RETURNING id`,
      [id, req.user.id]
    );

    if (deleteRes.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Roadmap not found or already deleted.',
      });
    }

    res.json({
      success: true,
      message: 'Roadmap deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};
