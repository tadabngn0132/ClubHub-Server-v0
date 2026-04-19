import express from "express";
import {
  queryRAG,
  triggerReindex,
  getRAGHealth,
} from "../controllers/ragController.js";
import { verifyAccessToken } from "../middlewares/authMiddleware.js";
import { requirePermission } from "../middlewares/permissionMiddleware.js";

const router = express.Router();

router.post(
  "/query",
  verifyAccessToken,
  requirePermission("rag", "query"),
  queryRAG,
);

router.get(
  "/health",
  verifyAccessToken,
  requirePermission("rag", "viewHealth"),
  getRAGHealth,
);

router.post(
  "/reindex",
  verifyAccessToken,
  requirePermission("rag", "reindex"),
  triggerReindex,
);

export default router;
