import express from 'express'
import {
  createNotification,
  getNotifications,
  getNotificationById,
  deleteNotificationByUserId,
  getNotificationsByUserId,
  updateNotification
} from '../controllers/notificationController.js';
import { verifyAccessToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/', verifyAccessToken, createNotification);
router.get('/', verifyAccessToken, getNotifications);
router.get('/:id', verifyAccessToken, getNotificationById);
router.get('/user/:userId', verifyAccessToken, getNotificationsByUserId);
router.delete('/user/:userId', verifyAccessToken, deleteNotificationByUserId);
router.put('/:id', verifyAccessToken, updateNotification);

export default router;