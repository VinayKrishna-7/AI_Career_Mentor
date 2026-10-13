import { Router } from 'express';
import { getStudySessions, logStudySession } from '../controllers/planner.controller.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth);

router.get('/sessions', getStudySessions);
router.post('/sessions', logStudySession);

export default router;
