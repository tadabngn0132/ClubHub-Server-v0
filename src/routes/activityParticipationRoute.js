import express from "express";
import {
  createActivityParticipation,
  getParticipations,
  getParticipationById,
  getParticipationsByActivityId,
  getParticipationsByUserId,
  updateParticipationById,
  deleteParticipation,
  createManyParticipations,
  getManyParticipations,
  updateManyParticipations,
  deleteManyParticipations,
} from "../controllers/activityParticipationController.js";
import { verifyAccessToken } from "../middlewares/authMiddleware.js";
import { requirePermission } from "../middlewares/permissionMiddleware.js";
import {
  validateActivityParticipationCreation,
  validateActivityParticipationUpdate,
} from "../middlewares/validationMiddleware.js";

const router = express.Router();

router.post(
  "/many/create",
  verifyAccessToken,
  requirePermission("activityParticipations", "create"),
  createManyParticipations,
);
router.post(
  "/many/get",
  verifyAccessToken,
  requirePermission("activityParticipations", "read"),
  getManyParticipations,
);
router.put(
  "/many/update",
  verifyAccessToken,
  requirePermission("activityParticipations", "update"),
  updateManyParticipations,
);
router.delete(
  "/many/delete",
  verifyAccessToken,
  requirePermission("activityParticipations", "delete"),
  deleteManyParticipations,
);

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

export default router;
