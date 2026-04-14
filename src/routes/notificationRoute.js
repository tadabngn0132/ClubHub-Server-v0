import express from "express";
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
  markAllNotificationsAsRead
} from "../controllers/notificationController.js";
import { verifyAccessToken } from "../middlewares/authMiddleware.js";
import { requirePermission } from "../middlewares/permissionMiddleware.js";

const router = express.Router();

router.post(
  "/",
  verifyAccessToken,
  requirePermission("notifications", "create"),
  createNotification,
);
router.get(
  "/",
  verifyAccessToken,
  requirePermission("notifications", "read"),
  getNotifications,
);
router.get(
  "/user/:userId",
  verifyAccessToken,
  requirePermission("notifications", "read"),
  getNotificationByUserId,
);
router.put(
  "/user/:userId/soft",
  verifyAccessToken,
  requirePermission("notifications", "softDelete"),
  softDeleteNotificationsByUserId,
);
router.delete(
  "/user/:userId/hard",
  verifyAccessToken,
  requirePermission("notifications", "hardDelete"),
  hardDeleteNotificationsByUserId,
);
router.put(
  "/user/:userId/mark-all-read",
  verifyAccessToken,
  requirePermission("notifications", "update"),
  markAllNotificationsAsRead,
);
router.get(
  "/:id",
  verifyAccessToken,
  requirePermission("notifications", "read"),
  getNotificationById,
);
router.put(
  "/:id",
  verifyAccessToken,
  requirePermission("notifications", "update"),
  updateNotification,
);
router.put(
  "/:id/soft",
  verifyAccessToken,
  requirePermission("notifications", "softDelete"),
  softDeleteNotification,
);
router.delete(
  "/:id/hard",
  verifyAccessToken,
  requirePermission("notifications", "hardDelete"),
  hardDeleteNotification,
);
export default router;
