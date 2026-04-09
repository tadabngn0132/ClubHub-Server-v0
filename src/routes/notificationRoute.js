import express from 'express';
import {
    createNotification,
    getNotifications,
    getNotificationByUserId,
    getNotificationById,
    updateNotification,
    softDeleteNotification,
    hardDeleteNotification,
    softDeleteNotificationsByUserId,
    hardDeleteNotificationsByUserId,
} from '../controllers/notificationController.js';
import { verifyAccessToken } from '../middlewares/authMiddleware.js';
import { requirePermission } from '../middlewares/permissionMiddleware.js';

const router = express.Router();

router.post('/', verifyAccessToken, requirePermission('notification', 'create'), createNotification);
router.get('/', verifyAccessToken, requirePermission('notification', 'read'), getNotifications);
router.delete('/:id/hard', verifyAccessToken, requirePermission('notification', 'hardDelete'), hardDeleteNotification);
router.get('/user/:userId', verifyAccessToken, requirePermission('notification', 'read'), getNotificationByUserId);
router.put('/user/:userId/soft', verifyAccessToken, requirePermission('notification', 'softDelete'), softDeleteNotificationsByUserId);
router.delete('/user/:userId/hard', verifyAccessToken, requirePermission('notification', 'hardDelete'), hardDeleteNotificationsByUserId);
router.get('/:id', verifyAccessToken, requirePermission('notification', 'read'), getNotificationById);
router.put('/:id', verifyAccessToken, requirePermission('notification', 'update'), updateNotification);
router.put('/:id/soft', verifyAccessToken, requirePermission('notification', 'softDelete'), softDeleteNotification);

export default router;