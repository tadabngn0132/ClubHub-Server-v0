import { detectIntent } from "../services/intentRouterService.js";
import { ragQuery } from "../services/ragService.js";
import { generateResponse } from "../services/aiService.js";

// Conversation history tạm thời trong memory theo session
// Key: userId, Value: array messages
// Reset khi server restart — đủ cho thesis/demo
// Nếu muốn persist thì lưu vào Redis hoặc DB sau
const conversationStore = new Map();

const MAX_HISTORY_LENGTH = 10; // giữ tối đa 10 lượt hỏi-đáp gần nhất

const getHistory = (userId) => conversationStore.get(userId) ?? [];

const appendHistory = (userId, userMessage, assistantMessage, intent) => {
  const history = getHistory(userId);

  history.push({
    role: "user",
    content: userMessage,
    intent,
    timestamp: new Date().toISOString(),
  });
  history.push({
    role: "assistant",
    content: assistantMessage,
    intent,
    timestamp: new Date().toISOString(),
  });

  // Giữ tối đa MAX_HISTORY_LENGTH lượt (mỗi lượt = 2 entries)
  if (history.length > MAX_HISTORY_LENGTH * 2) {
    history.splice(0, history.length - MAX_HISTORY_LENGTH * 2);
  }

  conversationStore.set(userId, history);
};

const clearHistory = (userId) => {
  conversationStore.delete(userId);
};

// ─── Handler chính ────────────────────────────────────────────────────────────

/**
 * POST /api/ai-chat
 *
 * Body:
 *   query      {string}  - câu hỏi/yêu cầu của user
 *   sourceType {string?} - filter RAG theo loại: 'activity'|'task'|'member'|'department'
 *
 * Response:
 *   {
 *     success: true,
 *     intent: 'rag' | 'ai',
 *     data: {
 *       answer: string,
 *       sources?: Array  // chỉ có khi intent = 'rag'
 *     }
 *   }
 */
export const unifiedChat = async (req, res) => {
  try {
    const { query, sourceType } = req.body;
    const userId = req.userId;

    // ── Validation ──────────────────────────────────────────────────────────
    if (!query || String(query).trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Query cannot be empty",
      });
    }

    if (String(query).trim().length > 1000) {
      return res.status(400).json({
        success: false,
        message: "Query cannot exceed 1000 characters",
      });
    }

    const cleanQuery = String(query).trim();

    // ── Intent detection ────────────────────────────────────────────────────
    const intent = await detectIntent(cleanQuery);

    // ── Route đến đúng luồng ────────────────────────────────────────────────
    let answer = "";
    let sources = null;

    if (intent === "rag") {
      // Validate sourceType nếu có
      const VALID_SOURCE_TYPES = ["activity", "task", "member", "department"];
      const validatedSourceType =
        sourceType && VALID_SOURCE_TYPES.includes(sourceType)
          ? sourceType
          : null;

      const result = await ragQuery(cleanQuery, {
        sourceType: validatedSourceType,
        userId,
      });

      answer = result.answer;
      sources = result.sources;
    } else {
      // intent === "ai" — AI sáng tạo, không cần context từ DB
      answer = await generateResponse(cleanQuery);
    }

    // ── Lưu history ─────────────────────────────────────────────────────────
    appendHistory(userId, cleanQuery, answer, intent);

    // ── Response ─────────────────────────────────────────────────────────────
    const responseData = { answer };
    if (sources !== null) responseData.sources = sources;

    return res.json({
      success: true,
      intent, // frontend dùng để render badge "RAG" hay "AI" nếu muốn
      data: responseData,
    });
  } catch (err) {
    console.error("[UnifiedChat] Error:", err);
    return res.status(500).json({
      success: false,
      message: `Internal server error / AI Chat error: ${err.message}`,
    });
  }
};

/**
 * GET /api/ai-chat/history
 * Lấy lịch sử chat của user hiện tại
 */
export const getChatHistory = async (req, res) => {
  try {
    const history = getHistory(req.userId);
    res.json({ success: true, data: history });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: `Internal server error / AI Chat error: ${err.message}`,
    });
  }
};

/**
 * DELETE /api/ai-chat/history
 * Xóa lịch sử chat của user hiện tại
 */
export const clearChatHistory = async (req, res) => {
  try {
    clearHistory(req.userId);
    res.json({ success: true, message: "Đã xóa lịch sử chat" });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: `Internal server error / AI Chat error: ${err.message}`,
    });
  }
};
