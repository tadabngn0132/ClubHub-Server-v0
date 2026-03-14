import express from "express";
import {
  createActivityParticipation,
  getParticipations,
  getParticipationById,
  getParticipationsByActivityId,
  getParticipationsByUserId,
  updateParticipationById,
  deleteParticipation,
} from "../controllers/activityParticipationController.js";
import { verifyAccessToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/", verifyAccessToken, createActivityParticipation);
router.get("/", verifyAccessToken, getParticipations);
router.get(
  "/activity/:activityId",
  verifyAccessToken,
  getParticipationsByActivityId,
);
router.get("/user/:userId", verifyAccessToken, getParticipationsByUserId);
router.get("/:participationId", verifyAccessToken, getParticipationById);
router.put("/:participationId", verifyAccessToken, updateParticipationById);
router.delete("/:participationId", verifyAccessToken, deleteParticipation);

export default router;
