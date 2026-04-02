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
  createActivityImage,
  createActivityVideo,
  deleteActivityImage,
  deleteActivityVideo,
} from "../controllers/activityController.js";
import { verifyAccessToken } from "../middlewares/authMiddleware.js";
import { requirePermission } from "../middlewares/permissionMiddleware.js";
import {
  validateActivityCreation,
  validateActivityUpdate,
} from "../middlewares/validationMiddleware.js";
import { uploadImage } from "../middlewares/uploadMiddleware.js";

const router = express.Router();

router.post(
  "/",
  verifyAccessToken,
  requirePermission("activities", "create"),
  uploadImage.single("thumbnail"),
  validateActivityCreation,
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
router.post(
  "/images/create/:activityId",
  verifyAccessToken,
  createActivityImage,
);
router.post(
  "/videos/create/:activityId",
  verifyAccessToken,
  createActivityVideo,
);
router.delete(
  "/images/delete/:videoId",
  verifyAccessToken,
  deleteActivityImage,
);
router.delete(
  "/videos/delete/:videoId",
  verifyAccessToken,
  deleteActivityVideo,
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
  uploadImage.single("thumbnail"),
  validateActivityUpdate,
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
