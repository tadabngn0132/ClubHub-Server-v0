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

router.post('/', verifyAccessToken, requirePermission('message', 'create'), createNewMessage);
router.get('/rooms', verifyAccessToken, requirePermission('message', 'read'), getAllRoomsForUser);
router.get('/rooms/:roomId', verifyAccessToken, requirePermission('message', 'read'), getAllMessagesByRoomId);
router.put('/:messageId', verifyAccessToken, requirePermission('message', 'update'), updateMessage);
router.delete('/:messageId', verifyAccessToken, requirePermission('message', 'delete'), deleteMessage);

export default router;