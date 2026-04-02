import express from "express";
import {
  createMemberApplication,
  getMemberApplications,
  getMemberApplicationById,
  softDeleteMemberApplication,
  hardDeleteMemberApplication,
  updateMemberApplicationCVReviewDetail,
  updateMemberApplicationFinalReviewDetail,
} from "../controllers/memberApplicationController.js";
import { verifyAccessToken } from "../middlewares/authMiddleware.js";
import { requirePermission } from "../middlewares/permissionMiddleware.js";
import {
  validateMemberApplicationCreation,
  validateMemberApplicationCVReviewUpdate,
  validateMemberApplicationFinalReviewUpdate,
} from "../middlewares/validationMiddleware.js";

const router = express.Router();

router.post(
  "/",
  requirePermission("memberApplications", "create"),
  validateMemberApplicationCreation,
  createMemberApplication,
);
router.get(
  "/",
  verifyAccessToken,
  requirePermission("memberApplications", "read"),
  getMemberApplications,
);
router.get(
  "/:id",
  verifyAccessToken,
  requirePermission("memberApplications", "read"),
  getMemberApplicationById,
);
router.put(
  "/:id/soft",
  verifyAccessToken,
  requirePermission("memberApplications", "update"),
  softDeleteMemberApplication,
);
router.delete(
  "/:id/hard",
  verifyAccessToken,
  requirePermission("memberApplications", "delete"),
  hardDeleteMemberApplication,
);
router.put(
  "/:id/cv-review",
  verifyAccessToken,
  requirePermission("memberApplications", "update"),
  validateMemberApplicationCVReviewUpdate,
  updateMemberApplicationCVReviewDetail,
);
router.put(
  "/:id/final-review",
  verifyAccessToken,
  requirePermission("memberApplications", "update"),
  validateMemberApplicationFinalReviewUpdate,
  updateMemberApplicationFinalReviewDetail,
);

export default router;
