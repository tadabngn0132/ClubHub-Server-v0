import express from "express";
import {
  getAllPositions,
  getPositionById,
  createPosition,
  updatePosition,
  softDeletePosition,
  hardDeletePosition,
  restorePosition,
} from "../controllers/positionController.js";
import { verifyAccessToken } from "../middlewares/authMiddleware.js";
import { requirePermission } from "../middlewares/permissionMiddleware.js";
import {
  validatePositionCreation,
  validatePositionUpdate,
} from "../middlewares/validationMiddleware.js";

const router = express.Router();

router.post(
  "/",
  verifyAccessToken,
  requirePermission("positions", "create"),
  validatePositionCreation,
  createPosition,
);
router.get(
  "/",
  verifyAccessToken,
  requirePermission("positions", "read"),
  getAllPositions,
);
router.get(
  "/:id",
  verifyAccessToken,
  requirePermission("positions", "read"),
  getPositionById,
);
router.put(
  "/:id",
  verifyAccessToken,
  requirePermission("positions", "update"),
  validatePositionUpdate,
  updatePosition,
);
router.put(
  "/:id/soft",
  verifyAccessToken,
  requirePermission("positions", "softDelete"),
  softDeletePosition,
);
router.delete(
  "/:id/hard",
  verifyAccessToken,
  requirePermission("positions", "delete"),
  hardDeletePosition,
);
router.put(
  "/:id/restore",
  verifyAccessToken,
  requirePermission("positions", "restore"),
  restorePosition,
);

export default router;
