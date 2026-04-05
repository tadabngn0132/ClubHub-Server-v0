import express from "express";
import {
  createChatRoom,
  getChatRooms,
  getChatRoomById,
  getChatRoomsByUserId,
  updateChatRoom,
  deleteChatRoom,
  getChatRoomMembers,
  addMemberToChatRoom,
  removeMemberFromChatRoom,
} from "../controllers/chatRoomController.js";
import { verifyAccessToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/", verifyAccessToken, createChatRoom);
router.get("/", verifyAccessToken, getChatRooms);
router.get("/user/:userId", verifyAccessToken, getChatRoomsByUserId);
router.get("/:id", verifyAccessToken, getChatRoomById);
router.put("/:id", verifyAccessToken, updateChatRoom);
router.delete("/:id", verifyAccessToken, deleteChatRoom);
router.get("/:id/members", verifyAccessToken, getChatRoomMembers);
router.post("/:id/members", verifyAccessToken, addMemberToChatRoom);
router.delete(
  "/:id/members/:userId",
  verifyAccessToken,
  removeMemberFromChatRoom,
);

export default router;
