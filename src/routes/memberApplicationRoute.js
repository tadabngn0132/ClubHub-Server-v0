import express from "express";
import {
  createMemberApplication,
  getMemberApplications,
  getMemberApplicationById,
  softDeleteMemberApplication,
  hardDeleteMemberApplication,
  updateMemberApplicationCVReviewDetail,
  updateMemberApplicationDepartmentInterviewDetail,
  updateMemberApplicationFinalReviewDetail,
  withdrawMemberApplication,
} from "../controllers/memberApplicationController.js";
import { verifyAccessToken } from "../middlewares/authMiddleware.js";
import { requirePermission } from "../middlewares/permissionMiddleware.js";
import {
  validateMemberApplicationCreation,
  validateMemberApplicationCVReviewUpdate,
  validateMemberApplicationFinalReviewUpdate,
} from "../middlewares/validationMiddleware.js";
import { uploadImage } from "../middlewares/uploadMiddleware.js";

const router = express.Router();

router.post(
  "/",
  requirePermission("memberApplications", "create"),
  uploadImage.single("avatar"),
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
  requirePermission("memberApplications", "softDelete"),
  softDeleteMemberApplication,
);
router.delete(
  "/:id/hard",
  verifyAccessToken,
  requirePermission("memberApplications", "hardDelete"),
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
  "/:id/department-interview",
  verifyAccessToken,
  requirePermission("memberApplications", "update"),
  updateMemberApplicationDepartmentInterviewDetail,
);
router.put(
  "/:id/final-review",
  verifyAccessToken,
  requirePermission("memberApplications", "update"),
  validateMemberApplicationFinalReviewUpdate,
  updateMemberApplicationFinalReviewDetail,
);
router.put(
  "/:id/withdraw",
  verifyAccessToken,
  requirePermission("memberApplications", "update"),
  withdrawMemberApplication,
);

export default router;
