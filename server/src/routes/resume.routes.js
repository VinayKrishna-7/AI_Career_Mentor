import { Router } from 'express';
import {
  analyzeResume,
  getAnalyses,
  getAnalysisById,
  deleteAnalysis,
  improveBullet,
} from '../controllers/resume.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { uploadResume } from '../middleware/upload.js';

const router = Router();

router.use(requireAuth);

router.post('/analyze', uploadResume.single('resume'), analyzeResume);
router.post('/improve-bullet', improveBullet);
router.get('/analyses', getAnalyses);
router.get('/analyses/:id', getAnalysisById);
router.delete('/analyses/:id', deleteAnalysis);

export default router;
