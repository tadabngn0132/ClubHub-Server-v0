import express from 'express';
import {
  createNewMessage,
  updateMessage,
  getAllMessagesByRoomId,
  deleteMessage,
  getAllRoomsForUser
} from '../controllers/messageController.js';
import { verifyAccessToken } from '../middlewares/authMiddleware.js';
import { requirePermission } from '../middlewares/permissionMiddleware.js';

const router = express.Router();

router.post('/messages', verifyAccessToken, requirePermission('message', 'create'), createNewMessage);
router.put('/messages/:messageId', verifyAccessToken, requirePermission('message', 'update'), updateMessage);
router.get('/rooms/:roomId/messages', verifyAccessToken, requirePermission('message', 'read'), getAllMessagesByRoomId);
router.delete('/messages/:messageId', verifyAccessToken, requirePermission('message', 'delete'), deleteMessage);
router.get('/rooms', verifyAccessToken, requirePermission('message', 'read'), getAllRoomsForUser);

export default router;