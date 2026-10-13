import { query } from '../config/db.js';

export const getApplications = async (req, res, next) => {
  try {
    const listRes = await query(
      `SELECT * FROM job_applications
       WHERE user_id = $1
       ORDER BY applied_date DESC, created_at DESC`,
      [req.user.id]
    );

    res.json({
      success: true,
      applications: listRes.rows,
    });
  } catch (error) {
    next(error);
  }
};

export const createApplication = async (req, res, next) => {
  try {
    const { company, position, location, status, salary, applied_date, notes } = req.body;

    if (!company || !company.trim() || !position || !position.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Company name and position are required.',
      });
    }

    const insertRes = await query(
      `INSERT INTO job_applications (
         user_id, company, position, location, status, salary, applied_date, notes
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        req.user.id,
        company.trim(),
        position.trim(),
        location || 'Remote',
        status || 'Applied',
        salary || '',
        applied_date || new Date().toISOString().split('T')[0],
        notes || '',
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Job application tracked successfully.',
      application: insertRes.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

export const updateApplication = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { company, position, location, status, salary, applied_date, notes } = req.body;

    // Check ownership
    const existing = await query(
      'SELECT id FROM job_applications WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Application record not found.',
      });
    }

    const updateRes = await query(
      `UPDATE job_applications
       SET company = COALESCE($1, company),
           position = COALESCE($2, position),
           location = COALESCE($3, location),
           status = COALESCE($4, status),
           salary = COALESCE($5, salary),
           applied_date = COALESCE($6, applied_date),
           notes = COALESCE($7, notes),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $8 AND user_id = $9
       RETURNING *`,
      [
        company,
        position,
        location,
        status,
        salary,
        applied_date,
        notes,
        id,
        req.user.id,
      ]
    );

    res.json({
      success: true,
      message: 'Application updated successfully.',
      application: updateRes.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

export const deleteApplication = async (req, res, next) => {
  try {
    const { id } = req.params;

    const delRes = await query(
      'DELETE FROM job_applications WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, req.user.id]
    );

    if (delRes.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Application record not found or already deleted.',
      });
    }

    res.json({
      success: true,
      message: 'Job application removed successfully.',
    });
  } catch (error) {
    next(error);
  }
};
