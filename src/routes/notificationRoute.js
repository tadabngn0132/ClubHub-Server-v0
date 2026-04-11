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
router.delete(
  "/:id/hard",
  verifyAccessToken,
  requirePermission("notifications", "hardDelete"),
  hardDeleteNotification,
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

export default router;
