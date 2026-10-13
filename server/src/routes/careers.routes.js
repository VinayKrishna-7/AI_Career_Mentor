import { Router } from 'express';
import {
  getCareers,
  getCareerById,
  recommendCareers,
  extractSkillsFromJD,
  analyzeCustomRole,
} from '../controllers/careers.controller.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/', getCareers);
router.get('/skill-gap', requireAuth, analyzeCustomRole);
router.post('/recommend', requireAuth, recommendCareers);
router.post('/extract-skills', requireAuth, extractSkillsFromJD);
router.post('/analyze-custom-role', requireAuth, analyzeCustomRole);
router.get('/:id', getCareerById);

export default router;
