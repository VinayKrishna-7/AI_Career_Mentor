import { query } from '../config/db.js';
import { AIService } from '../services/ai.service.js';

export const getConversations = async (req, res, next) => {
  try {
    const convsRes = await query(
      `SELECT c.id, c.title, c.created_at, c.updated_at,
              (SELECT content FROM chat_messages m WHERE m.conversation_id = c.id ORDER BY m.created_at DESC LIMIT 1) as last_message
       FROM chat_conversations c
       WHERE c.user_id = $1
       ORDER BY c.updated_at DESC`,
      [req.user.id]
    );

    res.json({
      success: true,
      conversations: convsRes.rows,
    });
  } catch (error) {
    next(error);
  }
};

export const createConversation = async (req, res, next) => {
  try {
    const { title } = req.body;
    const conversationTitle = title || 'New Career Mentorship';

    const insertRes = await query(
      `INSERT INTO chat_conversations (user_id, title)
       VALUES ($1, $2)
       RETURNING *`,
      [req.user.id, conversationTitle]
    );

    res.status(201).json({
      success: true,
      conversation: insertRes.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

export const getMessages = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check ownership
    const convRes = await query(
      'SELECT id, title FROM chat_conversations WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
    );

    if (convRes.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found.',
      });
    }

    const messagesRes = await query(
      `SELECT id, role, content, created_at
       FROM chat_messages
       WHERE conversation_id = $1
       ORDER BY created_at ASC`,
      [id]
    );

    res.json({
      success: true,
      conversation: convRes.rows[0],
      messages: messagesRes.rows,
    });
  } catch (error) {
    next(error);
  }
};

export const sendMessage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const content = req.body.content || req.body.message;

    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Message content cannot be empty.',
      });
    }

    // Verify conversation ownership
    const convRes = await query(
      'SELECT id, title FROM chat_conversations WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
    );

    if (convRes.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found.',
      });
    }

    // Insert user message into PostgreSQL
    const userMsgRes = await query(
      `INSERT INTO chat_messages (conversation_id, role, content)
       VALUES ($1, 'user', $2)
       RETURNING *`,
      [id, content.trim()]
    );
    const userMessage = userMsgRes.rows[0];

    // Fetch user profile for context
    const profileRes = await query('SELECT * FROM profiles WHERE user_id = $1', [req.user.id]);
    const profile = profileRes.rows[0] || {};

    // Fetch recent message history (last 10 messages)
    const historyRes = await query(
      `SELECT role, content FROM chat_messages
       WHERE conversation_id = $1
       ORDER BY created_at ASC
       LIMIT 10`,
      [id]
    );

    // Call AI Mentor service
    const aiResponseText = await AIService.generateChatResponse(
      content.trim(),
      historyRes.rows,
      profile
    );

    // Insert assistant message into PostgreSQL
    const assistantMsgRes = await query(
      `INSERT INTO chat_messages (conversation_id, role, content)
       VALUES ($1, 'assistant', $2)
       RETURNING *`,
      [id, aiResponseText]
    );
    const assistantMessage = assistantMsgRes.rows[0];

    // Update conversation timestamp and title if first user message
    await query(
      `UPDATE chat_conversations
       SET updated_at = CURRENT_TIMESTAMP,
           title = CASE WHEN title = 'New Career Mentorship' THEN SUBSTRING($1 FROM 1 FOR 40) ELSE title END
       WHERE id = $2`,
      [content.trim(), id]
    );

    res.json({
      success: true,
      userMessage,
      assistantMessage,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteConversation = async (req, res, next) => {
  try {
    const { id } = req.params;

    const deleteRes = await query(
      'DELETE FROM chat_conversations WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, req.user.id]
    );

    if (deleteRes.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found or already deleted.',
      });
    }

    res.json({
      success: true,
      message: 'Conversation deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

export const getAiStatus = async (req, res) => {
  res.json({
    success: true,
    status: AIService.getAiStatus(),
  });
};

export const updateAiConfig = async (req, res) => {
  const { provider, apiKey, model } = req.body;
  if (!apiKey || !apiKey.trim()) {
    return res.status(400).json({
      success: false,
      message: 'API Key cannot be empty.',
    });
  }

  AIService.setApiKey(provider || 'gemini', apiKey, model);
  res.json({
    success: true,
    message: `${(provider || 'gemini').toUpperCase()} API Key configured successfully.`,
    status: AIService.getAiStatus(),
  });
};
