import { Router } from 'express';
import { getProfile, updateProfile } from '../controllers/profile.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { updateProfileSchema } from '../validators/profile.validator.js';

const router = Router();

router.get('/', requireAuth, getProfile);
router.put('/', requireAuth, validate(updateProfileSchema), updateProfile);

export default router;
