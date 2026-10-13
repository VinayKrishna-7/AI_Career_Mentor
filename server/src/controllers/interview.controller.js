import { query } from '../config/db.js';
import { AIService } from '../services/ai.service.js';

const DEFAULT_QUESTIONS = {
  'Frontend Developer': [
    'Explain how the React Virtual DOM works and what problem reconciliation solves.',
    'What are the key performance optimizations you consider when building a web application?',
    'Describe a challenging UI/UX state bug you encountered and how you debugged and resolved it.',
  ],
  'Backend Developer': [
    'How do you design a relational database schema to prevent data anomalies while optimizing query read speeds?',
    'Explain how JWT authentication works, and how you protect tokens against XSS and CSRF attacks.',
    'How do you design an API endpoint to handle sudden traffic spikes and slow third-party services?',
  ],
  'Full-Stack Developer': [
    'Walk me through the architecture of a full-stack feature from database migration to React UI.',
    'How do you decide whether state belongs on the client, in cache, or in the primary database?',
    'Describe how you approach security and validation across both frontend and backend layers.',
  ],
};

export const startInterview = async (req, res, next) => {
  try {
    const { target_role, difficulty } = req.body;
    const role = target_role || 'Full-Stack Developer';
    const diff = difficulty || 'Intermediate';

    const questions = DEFAULT_QUESTIONS[role] || [
      `What are the core technical responsibilities of a ${role}?`,
      `Describe a complex problem you solved in a recent project.`,
      `How do you stay up-to-date with emerging industry practices in ${role}?`,
    ];

    const interviewData = {
      role,
      difficulty: diff,
      status: 'In Progress',
      questions: questions.map((q, idx) => ({
        id: idx + 1,
        question: q,
        answer: null,
        feedback: null,
        score: null,
      })),
    };

    const insertRes = await query(
      `INSERT INTO mock_interviews (user_id, target_role, difficulty, interview_data)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [req.user.id, role, diff, JSON.stringify(interviewData)]
    );

    res.status(201).json({
      success: true,
      interview: insertRes.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

export const getInterviews = async (req, res, next) => {
  try {
    const interviewsRes = await query(
      `SELECT id, target_role, difficulty,
              interview_data->>'status' as status,
              created_at, updated_at
       FROM mock_interviews
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [req.user.id]
    );

    res.json({
      success: true,
      interviews: interviewsRes.rows,
    });
  } catch (error) {
    next(error);
  }
};

export const getInterviewById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const interviewRes = await query(
      'SELECT * FROM mock_interviews WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
    );

    if (interviewRes.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Mock interview session not found.',
      });
    }

    res.json({
      success: true,
      interview: interviewRes.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

export const submitAnswer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { questionId, answer } = req.body;

    if (!answer || !answer.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an answer to receive feedback.',
      });
    }

    const interviewRes = await query(
      'SELECT * FROM mock_interviews WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
    );

    if (interviewRes.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Interview session not found.',
      });
    }

    const interview = interviewRes.rows[0];
    const data = interview.interview_data;

    const qIndex = data.questions.findIndex((q) => q.id === Number(questionId));
    if (qIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Question not found in this interview session.',
      });
    }

    const currentQuestion = data.questions[qIndex];

    // Evaluate answer with AI
    const evaluation = await AIService.evaluateMockInterviewAnswer(
      interview.target_role,
      interview.difficulty,
      currentQuestion.question,
      answer.trim()
    );

    data.questions[qIndex].answer = answer.trim();
    data.questions[qIndex].feedback = evaluation;
    data.questions[qIndex].score = evaluation.score;

    // Check if all questions are answered
    const allAnswered = data.questions.every((q) => q.answer !== null);
    if (allAnswered) {
      data.status = 'Completed';
    }

    const updateRes = await query(
      `UPDATE mock_interviews
       SET interview_data = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2 AND user_id = $3
       RETURNING *`,
      [JSON.stringify(data), id, req.user.id]
    );

    res.json({
      success: true,
      message: 'Answer evaluated successfully.',
      interview: updateRes.rows[0],
      feedback: evaluation,
    });
  } catch (error) {
    next(error);
  }
};
