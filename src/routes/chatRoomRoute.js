import express from "express";
import {
  createChatRoom,
  getChatRooms,
  getChatRoomById,
  getChatRoomByUserId,
  updateChatRoom,
  softDeleteChatRoom,
  hardDeleteChatRoom,
  getChatRoomMembers,
  addMemberToChatRoom,
  removeMemberFromChatRoom,
} from "../controllers/chatRoomController.js";
import { verifyAccessToken } from "../middlewares/authMiddleware.js";
import { requirePermission } from "../middlewares/permissionMiddleware.js";
import {
  validateChatRoomCreation,
  validateChatRoomUpdate,
} from "../middlewares/validationMiddleware.js";

const router = express.Router();

router.post(
  "/",
  verifyAccessToken,
  requirePermission("chatRooms", "create"),
  validateChatRoomCreation,
  createChatRoom,
);
router.get(
  "/",
  verifyAccessToken,
  requirePermission("chatRooms", "read"),
  getChatRooms,
);
router.get(
  "/user/:userId",
  verifyAccessToken,
  requirePermission("chatRooms", "read"),
  getChatRoomByUserId,
);
router.get(
  "/:id",
  verifyAccessToken,
  requirePermission("chatRooms", "read"),
  getChatRoomById,
);
router.put(
  "/:id",
  verifyAccessToken,
  requirePermission("chatRooms", "update"),
  validateChatRoomUpdate,
  updateChatRoom,
);
router.put(
  "/:id/soft",
  verifyAccessToken,
  requirePermission("chatRooms", "softDelete"),
  softDeleteChatRoom,
);
router.delete(
  "/:id/hard",
  verifyAccessToken,
  requirePermission("chatRooms", "hardDelete"),
  hardDeleteChatRoom,
);
router.get(
  "/:id/members",
  verifyAccessToken,
  requirePermission("chatRooms", "read"),
  getChatRoomMembers,
);
router.post(
  "/:id/members",
  verifyAccessToken,
  requirePermission("chatRooms", "manageMembers"),
  addMemberToChatRoom,
);
router.delete(
  "/:id/members/:userId",
  verifyAccessToken,
  requirePermission("chatRooms", "manageMembers"),
  removeMemberFromChatRoom,
);

export default router;
