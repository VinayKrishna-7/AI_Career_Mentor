import { Router } from 'express';
import {
  generateRoadmap,
  getRoadmaps,
  getRoadmapById,
  updateTaskStatus,
  deleteRoadmap,
} from '../controllers/roadmaps.controller.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth);

router.post('/generate', generateRoadmap);
router.get('/', getRoadmaps);
router.get('/:id', getRoadmapById);
router.patch('/:roadmapId/tasks/:taskId', updateTaskStatus);
router.delete('/:id', deleteRoadmap);

export default router;
