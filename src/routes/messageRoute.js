import express from 'express';
import {
  createNewMessage,
  updateMessage,
  getAllMessagesByRoomId,
  softDeleteMessage,
  hardDeleteMessage,
  getAllRoomsForUser,
  createManyMessages,
  getManyMessages,
  updateManyMessages,
  softDeleteManyMessages,
  hardDeleteManyMessages,
} from '../controllers/messageController.js';
import { verifyAccessToken } from '../middlewares/authMiddleware.js';
import { requirePermission } from '../middlewares/permissionMiddleware.js';

const router = express.Router();

router.post('/many/create', verifyAccessToken, requirePermission('messages', 'create'), createManyMessages);
router.post('/many/get', verifyAccessToken, requirePermission('messages', 'read'), getManyMessages);
router.put('/many/update', verifyAccessToken, requirePermission('messages', 'update'), updateManyMessages);
router.put('/many/soft-delete', verifyAccessToken, requirePermission('messages', 'delete'), softDeleteManyMessages);
router.delete('/many/hard-delete', verifyAccessToken, requirePermission('messages', 'delete'), hardDeleteManyMessages);

router.post('/', verifyAccessToken, requirePermission('messages', 'create'), createNewMessage);
router.get('/rooms', verifyAccessToken, requirePermission('messages', 'read'), getAllRoomsForUser);
router.get('/rooms/:roomId', verifyAccessToken, requirePermission('messages', 'read'), getAllMessagesByRoomId);
router.put('/:messageId', verifyAccessToken, requirePermission('messages', 'update'), updateMessage);
router.put('/:messageId/soft', verifyAccessToken, requirePermission('messages', 'delete'), softDeleteMessage);
router.delete('/:messageId/hard', verifyAccessToken, requirePermission('messages', 'delete'), hardDeleteMessage);

export default router;