import express from "express";
import {
  createNotification,
  getNotifications,
  getNotificationById,
  deleteNotificationByUserId,
  getNotificationsByUserId,
  updateNotification,
  deleteNotificationById,
  createManyNotifications,
  getManyNotifications,
  updateManyNotifications,
  deleteManyNotifications,
} from "../controllers/notificationController.js";
import { verifyAccessToken } from "../middlewares/authMiddleware.js";
import { requirePermission } from "../middlewares/permissionMiddleware.js";
import {
  validateNotificationCreation,
  validateNotificationUpdate,
} from "../middlewares/validationMiddleware.js";

const router = express.Router();

router.post(
  "/many/create",
  verifyAccessToken,
  requirePermission("notifications", "create"),
  createManyNotifications,
);
router.post(
  "/many/get",
  verifyAccessToken,
  requirePermission("notifications", "read"),
  getManyNotifications,
);
router.put(
  "/many/update",
  verifyAccessToken,
  requirePermission("notifications", "update"),
  updateManyNotifications,
);
router.delete(
  "/many/delete",
  verifyAccessToken,
  requirePermission("notifications", "delete"),
  deleteManyNotifications,
);

router.post(
  "/",
  verifyAccessToken,
  requirePermission("notifications", "create"),
  validateNotificationCreation,
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
  requirePermission("notifications", "read", { allowOwner: true }),
  getNotificationsByUserId,
);
router.delete(
  "/user/:userId",
  verifyAccessToken,
  requirePermission("notifications", "delete"),
  deleteNotificationByUserId,
);
router.delete(
  "/:id",
  verifyAccessToken,
  requirePermission("notifications", "delete"),
  deleteNotificationById,
);
router.put(
  "/:id",
  verifyAccessToken,
  requirePermission("notifications", "update"),
  validateNotificationUpdate,
  updateNotification,
);
export default router;
