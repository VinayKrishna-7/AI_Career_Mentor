import { Router } from 'express';
import {
  getConversations,
  createConversation,
  getMessages,
  sendMessage,
  deleteConversation,
  getAiStatus,
  updateAiConfig,
} from '../controllers/chat.controller.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth);

router.get('/status', getAiStatus);
router.post('/config', updateAiConfig);
router.get('/conversations', getConversations);
router.post('/conversations', createConversation);
router.get('/conversations/:id/messages', getMessages);
router.post('/conversations/:id/messages', sendMessage);
router.delete('/conversations/:id', deleteConversation);

export default router;
