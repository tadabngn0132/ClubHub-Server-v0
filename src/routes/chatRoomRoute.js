import express from 'express';
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
} from '../controllers/chatRoomController.js';
import { verifyAccessToken } from '../middlewares/authMiddleware.js';
import { requirePermission } from '../middlewares/permissionMiddleware.js';

const router = express.Router();

router.post('/', verifyAccessToken, requirePermission('chatRoom', 'create'), createChatRoom);
router.get('/', verifyAccessToken, requirePermission('chatRoom', 'read'), getChatRooms);
router.get('/user/:userId', verifyAccessToken, requirePermission('chatRoom', 'read'), getChatRoomByUserId);
router.get('/:id', verifyAccessToken, requirePermission('chatRoom', 'read'), getChatRoomById);
router.put('/:id', verifyAccessToken, requirePermission('chatRoom', 'update'), updateChatRoom);
router.put('/:id/soft', verifyAccessToken, requirePermission('chatRoom', 'softDelete'), softDeleteChatRoom);
router.delete('/:id/hard', verifyAccessToken, requirePermission('chatRoom', 'hardDelete'), hardDeleteChatRoom);
router.get('/:id/members', verifyAccessToken, requirePermission('chatRoom', 'read'), getChatRoomMembers);
router.post('/:id/members', verifyAccessToken, requirePermission('chatRoom', 'manageMembers'), addMemberToChatRoom);
router.delete('/:id/members/:userId', verifyAccessToken, requirePermission('chatRoom', 'manageMembers'), removeMemberFromChatRoom);

export default router;