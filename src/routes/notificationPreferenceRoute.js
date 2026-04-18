import express from "express";
import {
  getNotificationPreferencesByUserId,
  updateNotificationPreferencesByUserId,
} from "../controllers/notificationPreferenceController.js";

const router = express.Router();

// Get notification preferences for a user
router.get("/:userId", getNotificationPreferencesByUserId);
// Update notification preferences for a user
router.put("/:userId", updateNotificationPreferencesByUserId);

export default router;
