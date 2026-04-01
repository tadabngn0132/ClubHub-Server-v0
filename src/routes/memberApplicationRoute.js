import express from "express";
import {
  createMemberApplication,
  getMemberApplications,
  getMemberApplicationById,
  softDeleteMemberApplication,
  hardDeleteMemberApplication,
  updateMemberApplicationCVReviewDetail,
  updateMemberApplicationFinalReviewDetail,
  createManyMemberApplications,
  getManyMemberApplications,
  updateManyMemberApplications,
  softDeleteManyMemberApplications,
  hardDeleteManyMemberApplications,
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
  "/many/create",
  verifyAccessToken,
  requirePermission("memberApplications", "create"),
  createManyMemberApplications,
);
router.post(
  "/many/get",
  verifyAccessToken,
  requirePermission("memberApplications", "read"),
  getManyMemberApplications,
);
router.put(
  "/many/update",
  verifyAccessToken,
  requirePermission("memberApplications", "update"),
  updateManyMemberApplications,
);
router.put(
  "/many/soft-delete",
  verifyAccessToken,
  requirePermission("memberApplications", "update"),
  softDeleteManyMemberApplications,
);
router.delete(
  "/many/hard-delete",
  verifyAccessToken,
  requirePermission("memberApplications", "delete"),
  hardDeleteManyMemberApplications,
);

router.post(
  "/",
  // verifyAccessToken,
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
