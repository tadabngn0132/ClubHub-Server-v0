import express from "express";
import {
  getNotificationPreferencesByUserId,
  updateNotificationPreferencesByUserId,
} from "../controllers/notificationPreferenceController.js";
import { verifyAccessToken } from "../middlewares/authMiddleware.js";
import { requirePermission } from "../middlewares/permissionMiddleware.js";

const router = express.Router();

// Get notification preferences for a user
router.get(
  "/:userId",
  verifyAccessToken,
  requirePermission("notificationPreferences", "read"),
  getNotificationPreferencesByUserId,
);
// Update notification preferences for a user
router.put(
  "/:userId",
  verifyAccessToken,
  requirePermission("notificationPreferences", "update"),
  updateNotificationPreferencesByUserId,
);

export default router;
