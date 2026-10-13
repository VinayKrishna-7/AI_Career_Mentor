import { Router } from 'express';
import {
  getResources,
  generateSkillResources,
  getRecommendedProjects,
  generateCustomProjectIdeas,
  saveUserProject,
  deleteUserProject,
} from '../controllers/resources.controller.js';
import { requireAuth, optionalAuth } from '../middleware/auth.js';

const router = Router();

router.get('/resources', optionalAuth, getResources);
router.post('/resources/generate', optionalAuth, generateSkillResources);
router.get('/projects/recommend', requireAuth, getRecommendedProjects);
router.post('/projects/generate-ideas', requireAuth, generateCustomProjectIdeas);
router.post('/projects/save', requireAuth, saveUserProject);
router.delete('/projects/:id', requireAuth, deleteUserProject);

export default router;
