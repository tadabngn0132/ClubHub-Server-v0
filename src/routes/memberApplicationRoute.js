import express from "express";
import {
  createMemberApplication,
  getMemberApplications,
  getMemberApplicationById,
  softDeleteMemberApplication,
  hardDeleteMemberApplication,
  createMemberApplicationCVReviewDetail,
  createMemberApplicationInterviewDetail,
  createMemberApplicationFinalReviewDetail,
} from "../controllers/memberApplicationController.js";
import { verifyAccessToken } from "../middlewares/authMiddleware.js";
import { requirePermission } from "../middlewares/permissionMiddleware.js";

const router = express.Router();

router.post(
  "/",
  verifyAccessToken,
  requirePermission("memberApplications", "create"),
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
router.post(
  "/:id/cv-review",
  verifyAccessToken,
  requirePermission("memberApplications", "create"),
  createMemberApplicationCVReviewDetail,
);
router.post(
  "/:id/interview",
  verifyAccessToken,
  requirePermission("memberApplications", "create"),
  createMemberApplicationInterviewDetail,
);
router.post(
  "/:id/final-review",
  verifyAccessToken,
  requirePermission("memberApplications", "create"),
  createMemberApplicationFinalReviewDetail,
);
export default router;
