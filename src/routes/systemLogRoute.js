import express from "express";
import {
  getAllSystemLogs,
} from "../controllers/systemLogController.js";
import { verifyAccessToken } from "../middlewares/authMiddleware.js";
import { requirePermission } from "../middlewares/permissionMiddleware.js";

const router = express.Router();

// Get all system logs (admin only)
router.get("/", verifyAccessToken, requirePermission("systemLogs", "read"), getAllSystemLogs);

export default router;