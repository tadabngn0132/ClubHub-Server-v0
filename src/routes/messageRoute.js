import express from 'express';
import {
    createMessage,
    getMessagesByChatRoomId,
    updateMessage,
    softDeleteMessage,
    hardDeleteMessage,
} from '../controllers/messageController.js';
import { verifyAccessToken } from '../middlewares/authMiddleware.js';
import { requirePermission } from '../middlewares/permissionMiddleware.js';

const router = express.Router();

router.post('/', verifyAccessToken, requirePermission('message', 'create'), createMessage);
router.get('/chatroom/:chatRoomId', verifyAccessToken, requirePermission('message', 'read'), getMessagesByChatRoomId);
router.put('/:id', verifyAccessToken, requirePermission('message', 'update'), updateMessage);
router.put('/:id/soft', verifyAccessToken, requirePermission('message', 'softDelete'), softDeleteMessage);
router.delete('/:id/hard', verifyAccessToken, requirePermission('message', 'hardDelete'), hardDeleteMessage);

export default router;