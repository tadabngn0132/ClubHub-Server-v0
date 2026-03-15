import express from "express";
import {
  createActivity,
  getActivities,
  getActivityById,
  getActivitiesBySlug,
  updateActivity,
  softDeleteActivity,
  hardDeleteActivity,
  getActivitiesByUserId,
} from "../controllers/activityController.js";
import { verifyAccessToken } from "../middlewares/authMiddleware.js";
import { requirePermission } from "../middlewares/permissionMiddleware.js";

const router = express.Router();

router.post(
  "/",
  verifyAccessToken,
  requirePermission("activities", "create"),
  createActivity,
);
router.get(
  "/",
  verifyAccessToken,
  requirePermission("activities", "read"),
  getActivities,
);
router.get(
  "/user/:userId",
  verifyAccessToken,
  requirePermission("activities", "read", { allowOwner: true }),
  getActivitiesByUserId,
);
router.get(
  "/slug/:slug",
  verifyAccessToken,
  requirePermission("activities", "read"),
  getActivitiesBySlug,
);
router.get(
  "/:id",
  verifyAccessToken,
  requirePermission("activities", "read"),
  getActivityById,
);
router.put(
  "/:id",
  verifyAccessToken,
  requirePermission("activities", "update"),
  updateActivity,
);
router.delete(
  "/:id/soft",
  verifyAccessToken,
  requirePermission("activities", "delete"),
  softDeleteActivity,
);
router.delete(
  "/:id/hard",
  verifyAccessToken,
  requirePermission("activities", "delete"),
  hardDeleteActivity,
);

export default router;
