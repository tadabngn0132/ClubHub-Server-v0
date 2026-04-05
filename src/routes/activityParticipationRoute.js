import express from "express";
import {
  createActivityParticipation,
  getParticipations,
  getParticipationById,
  getParticipationsByActivityId,
  getParticipationsByUserId,
  updateParticipationById,
  deleteParticipation,
  checkInParticipant,
  markParticipantNoShow,
} from "../controllers/activityParticipationController.js";
import { verifyAccessToken } from "../middlewares/authMiddleware.js";
import { requirePermission } from "../middlewares/permissionMiddleware.js";
import {
  validateActivityParticipationCreation,
  validateActivityParticipationUpdate,
} from "../middlewares/validationMiddleware.js";

const router = express.Router();

router.post(
  "/",
  verifyAccessToken,
  requirePermission("activityParticipations", "create"),
  validateActivityParticipationCreation,
  createActivityParticipation,
);
router.get(
  "/",
  verifyAccessToken,
  requirePermission("activityParticipations", "read"),
  getParticipations,
);
router.get(
  "/activity/:activityId",
  verifyAccessToken,
  requirePermission("activityParticipations", "read"),
  getParticipationsByActivityId,
);
router.get(
  "/user/:userId",
  verifyAccessToken,
  requirePermission("activityParticipations", "read", { allowOwner: true }),
  getParticipationsByUserId,
);
router.get(
  "/:participationId",
  verifyAccessToken,
  requirePermission("activityParticipations", "read"),
  getParticipationById,
);
router.put(
  "/:participationId",
  verifyAccessToken,
  requirePermission("activityParticipations", "update"),
  validateActivityParticipationUpdate,
  updateParticipationById,
);
router.delete(
  "/:participationId",
  verifyAccessToken,
  requirePermission("activityParticipations", "delete"),
  deleteParticipation,
);
router.put(
  "/:participationId/check-in",
  verifyAccessToken,
  requirePermission("activityParticipations", "update"),
  checkInParticipant,
);
router.put(
  "/:activityId/no-show",
  verifyAccessToken,
  requirePermission("activityParticipations", "update"),
  markParticipantNoShow,
);

export default router;
