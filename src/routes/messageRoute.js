import express from "express";
import {
  createNewMessage,
  updateMessage,
  getAllMessagesByRoomId,
  softDeleteMessage,
  hardDeleteMessage,
} from "../controllers/messageController.js";
import { verifyAccessToken } from "../middlewares/authMiddleware.js";
import { requirePermission } from "../middlewares/permissionMiddleware.js";

const router = express.Router();

router.post(
  "/",
  verifyAccessToken,
  requirePermission("messages", "create"),
  createNewMessage,
);
router.get(
  "/rooms/:roomId",
  verifyAccessToken,
  requirePermission("messages", "read"),
  getAllMessagesByRoomId,
);
router.put(
  "/:messageId",
  verifyAccessToken,
  requirePermission("messages", "update"),
  updateMessage,
);
router.put(
  "/:messageId/soft",
  verifyAccessToken,
  requirePermission("messages", "softDelete"),
  softDeleteMessage,
);
router.delete(
  "/:messageId/hard",
  verifyAccessToken,
  requirePermission("messages", "hardDelete"),
  hardDeleteMessage,
);

export default router;
