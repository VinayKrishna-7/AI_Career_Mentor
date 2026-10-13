import { query } from '../config/db.js';
import { ResumeService } from '../services/resume.service.js';

export const analyzeResume = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please select a PDF resume file to upload.',
      });
    }
    const { target_role, targetRole: altRole, job_description, jobDescription: altJD } = req.body;
    const targetRole = (target_role || altRole || 'Full-Stack Developer').trim();
    const jobDescription = (job_description || altJD || '').trim();

    // 1. Extract text from uploaded buffer
    const extractedText = await ResumeService.extractPdfText(req.file.buffer);

    // 2. Fetch required skills for role if known
    const roleRes = await query(
      'SELECT required_skills FROM career_roles WHERE LOWER(title) = LOWER($1)',
      [targetRole]
    );
    const requiredSkills = roleRes.rows[0]?.required_skills || [];

    // 3. Analyze resume
    const analysis = await ResumeService.analyzeResume(
      extractedText,
      targetRole,
      job_description || '',
      requiredSkills
    );

    // 4. Save analysis result in PostgreSQL
    const insertRes = await query(
      `INSERT INTO resume_analyses (user_id, target_role, analysis_result)
       VALUES ($1, $2, $3)
       RETURNING id, target_role, analysis_result, created_at`,
      [req.user.id, targetRole, JSON.stringify(analysis)]
    );

    const savedRow = insertRes.rows[0];
    const parsedResult = typeof savedRow?.analysis_result === 'string'
      ? JSON.parse(savedRow.analysis_result)
      : (savedRow?.analysis_result || analysis);

    const analysisPayload = {
      id: savedRow?.id,
      targetRole: savedRow?.target_role || targetRole,
      createdAt: savedRow?.created_at,
      ...parsedResult,
    };

    res.status(201).json({
      success: true,
      message: 'Resume analyzed successfully.',
      analysis: analysisPayload,
    });
  } catch (error) {
    next(error);
  }
};

export const getAnalyses = async (req, res, next) => {
  try {
    const listRes = await query(
      `SELECT id, target_role,
              (analysis_result->>'overallScore')::int as overall_score,
              created_at
       FROM resume_analyses
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [req.user.id]
    );

    res.json({
      success: true,
      analyses: listRes.rows,
    });
  } catch (error) {
    next(error);
  }
};

export const getAnalysisById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const itemRes = await query(
      'SELECT * FROM resume_analyses WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
    );

    if (itemRes.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Resume analysis report not found.',
      });
    }

    const row = itemRes.rows[0];
    const parsedResult = typeof row?.analysis_result === 'string'
      ? JSON.parse(row.analysis_result)
      : (row?.analysis_result || {});

    const analysisPayload = {
      id: row?.id,
      targetRole: row?.target_role,
      createdAt: row?.created_at,
      ...parsedResult,
    };

    res.json({
      success: true,
      analysis: analysisPayload,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteAnalysis = async (req, res, next) => {
  try {
    const { id } = req.params;

    const delRes = await query(
      'DELETE FROM resume_analyses WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, req.user.id]
    );

    if (delRes.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Analysis record not found.',
      });
    }

    res.json({
      success: true,
      message: 'Resume analysis deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

export const improveBullet = async (req, res, next) => {
  try {
    const { bullet, jobRole, count } = req.body;

    if (!bullet || !bullet.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide resume experience or bullet text to improve.',
      });
    }

    const { AIService } = await import('../services/ai.service.js');
    const result = await AIService.improveResumeBullet(bullet.trim(), jobRole, count || 3);

    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

