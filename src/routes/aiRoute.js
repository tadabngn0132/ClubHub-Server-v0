import express from "express";
import {
  generateAIResponse
} from "../controllers/aiController.js";
import { verifyAccessToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/generate-response", verifyAccessToken, generateAIResponse);

export default router;
