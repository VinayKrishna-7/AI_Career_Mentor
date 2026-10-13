import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth);

const lockedNoticeHandler = (req, res) => {
  return res.status(423).json({
    success: false,
    locked: true,
    message:
      'The Mock Interview Simulator is currently locked as an upcoming future feature. You can practice technical and behavioral interview questions with the AI Mentor Chat in the meantime.',
  });
};

router.post('/', lockedNoticeHandler);
router.get('/', lockedNoticeHandler);
router.get('/:id', lockedNoticeHandler);
router.post('/:id/answers', lockedNoticeHandler);

export default router;
