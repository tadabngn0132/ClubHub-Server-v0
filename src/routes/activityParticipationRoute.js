import express from "express";
import {
  createActivityParticipation,
  getParticipations,
  getParticipationById,
  getParticipationsByUserId,
  updateParticipationById,
  deleteParticipation,
} from "../controllers/activityParticipationController.js";
import { verifyAccessToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/register", verifyAccessToken, createActivityParticipation);
router.get("/", verifyAccessToken, getParticipations);
router.get("/:participationId", verifyAccessToken, getParticipationById);
router.get("/user/:userId", verifyAccessToken, getParticipationsByUserId);
router.put("/:participationId", verifyAccessToken, updateParticipationById);
router.delete("/:participationId", verifyAccessToken, deleteParticipation);

export default router;
