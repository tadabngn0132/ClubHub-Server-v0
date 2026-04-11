import express from "express";
import {
  createMessage,
  getMessagesByChatRoomId,
  updateMessage,
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
  createMessage,
);
router.get(
  "/chatroom/:chatRoomId",
  verifyAccessToken,
  requirePermission("messages", "read"),
  getMessagesByChatRoomId,
);
router.put(
  "/:id",
  verifyAccessToken,
  requirePermission("messages", "update"),
  updateMessage,
);
router.put(
  "/:id/soft",
  verifyAccessToken,
  requirePermission("messages", "softDelete"),
  softDeleteMessage,
);
router.delete(
  "/:id/hard",
  verifyAccessToken,
  requirePermission("messages", "hardDelete"),
  hardDeleteMessage,
);

export default router;
