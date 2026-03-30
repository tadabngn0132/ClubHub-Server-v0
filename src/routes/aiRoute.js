import express from "express";
import {
  generateContentHandler,
  recommendActivities,
  generateEventDescription,
  draftMessage,
  planTask,
  generateAdvancedContent,
  checkHealth,
} from "../controllers/aiController.js";
import { verifyAccessToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/generate-content", verifyAccessToken, generateContentHandler);
router.post("/recommend-activities", verifyAccessToken, recommendActivities);
router.post("/generate-event-description", verifyAccessToken, generateEventDescription);
router.post("/draft-message", verifyAccessToken, draftMessage);
router.post("/plan-task", verifyAccessToken, planTask);
router.post("/generate-advanced-content", verifyAccessToken, generateAdvancedContent);
router.get("/health", verifyAccessToken, checkHealth);

export default router;
