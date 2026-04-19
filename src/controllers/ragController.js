// TODO: Implement RAG controller logic
import { ragQuery } from "../services/ragService.js";
import { reindexAll } from "../services/knowledgeIndexerService.js";
import { countChunks } from "../services/documentChunkService.js";

const VALID_SOURCE_TYPES = ["activity", "task", "member", "department"];

/**
 * POST /api/rag/query
 * Body: { query: string, sourceType?: 'activity'|'task'|'member'|'department' }
 */
export const queryRAG = async (req, res) => {
  try {
    const { query, sourceType } = req.body;

    if (!query || String(query).trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Query cannot be empty",
      });
    }

    if (String(query).trim().length > 500) {
      return res.status(400).json({
        success: false,
        message: "Query cannot exceed 500 characters",
      });
    }

    const validatedSourceType =
      sourceType && VALID_SOURCE_TYPES.includes(sourceType) ? sourceType : null;

    const result = await ragQuery(query.trim(), {
      sourceType: validatedSourceType,
      userId: req.userId,
    });

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (err) {
    console.error("[RAG] queryRAG error:", err);
    res.status(500).json({
      success: false,
      message: `Internal server error / RAG query error: ${err.message}`,
    });
  }
};

/**
 * POST /api/rag/reindex
 * ADMIN only — trigger full reindex thủ công.
 * Chạy async nền, không block response.
 */
export const triggerReindex = async (req, res) => {
  try {
    reindexAll().catch((err) =>
      console.error("[RAG] Background reindex failed:", err.message),
    );

    res.status(200).json({
      success: true,
      message: "Reindex triggered successfully.",
    });
  } catch (err) {
    console.error("[RAG] triggerReindex error:", err);
    res.status(500).json({
      success: false,
      message: `Internal server error / RAG reindex error: ${err.message}`,
    });
  }
};

/**
 * GET /api/rag/health
 * Kiểm tra Chroma có bao nhiêu chunks — dùng để verify reindex thành công.
 */
export const getRAGHealth = async (req, res) => {
  try {
    const total = await countChunks();
    res.status(200).json({
      success: true,
      data: {
        totalChunks: total,
        vectorStore: "Chroma",
        relationalStore: "PostgreSQL/Neon via Prisma",
        status: total > 0 ? "ready" : "Empty (no chunks indexed yet). Trigger reindex to populate.",
      },
    });
  } catch (err) {
    console.error("[RAG] getRAGHealth error:", err);
    res.status(500).json({
      success: false,
      message: `Internal server error / RAG health check error: ${err.message}`,
    });
  }
};
