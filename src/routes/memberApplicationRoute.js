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

const router = express.Router();

router.post("/", createMemberApplication);
router.get("/", verifyAccessToken, getMemberApplications);
router.get("/:id", verifyAccessToken, getMemberApplicationById);
router.put("/:id/soft", verifyAccessToken, softDeleteMemberApplication);
router.delete("/:id/hard", verifyAccessToken, hardDeleteMemberApplication);
router.post(
  "/:id/cv-review",
  verifyAccessToken,
  createMemberApplicationCVReviewDetail,
);
router.post(
  "/:id/interview",
  verifyAccessToken,
  createMemberApplicationInterviewDetail,
);
router.post(
  "/:id/final-review",
  verifyAccessToken,
  createMemberApplicationFinalReviewDetail,
);
export default router;
