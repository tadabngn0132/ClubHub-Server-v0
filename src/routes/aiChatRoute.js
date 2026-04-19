import express from "express";
import {
  unifiedChat,
  getChatHistory,
  clearChatHistory,
} from "../controllers/aiUnifiedController.js";
import { verifyAccessToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

/**
 * POST /api/ai-chat
 * Unified AI endpoint — tự phân loại RAG hay AI thường
 *
 * Body: { query: string, sourceType?: string }
 */
router.post("/", verifyAccessToken, unifiedChat);

/**
 * GET /api/ai-chat/history
 * Lấy lịch sử chat của user đang đăng nhập
 */
router.get("/history", verifyAccessToken, getChatHistory);

/**
 * DELETE /api/ai-chat/history
 * Xóa lịch sử chat
 */
router.delete("/history", verifyAccessToken, clearChatHistory);

export default router;
