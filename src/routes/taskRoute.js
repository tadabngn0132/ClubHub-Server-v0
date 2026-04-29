import express from "express";
import {
  createTask,
  getTasks,
  getTaskById,
  getTasksByUserId,
  updateTask,
  softDeleteTask,
  hardDeleteTask,
  confirmTaskCompletion,
  verifyTaskCompletion,
  restoreTask,
} from "../controllers/taskController.js";
import { verifyAccessToken } from "../middlewares/authMiddleware.js";
import { requirePermission } from "../middlewares/permissionMiddleware.js";
import {
  validateTaskCreation,
  validateTaskUpdate,
} from "../middlewares/validationMiddleware.js";
import { uploadImage } from "../middlewares/uploadMiddleware.js";

const router = express.Router();

router.post(
  "/",
  verifyAccessToken,
  requirePermission("tasks", "create"),
  validateTaskCreation,
  createTask,
);
router.get(
  "/",
  verifyAccessToken,
  requirePermission("tasks", "read"),
  getTasks,
);
router.get(
  "/user/:userId",
  verifyAccessToken,
  requirePermission("tasks", "read"),
  getTasksByUserId,
);
router.get(
  "/:taskId",
  verifyAccessToken,
  requirePermission("tasks", "read"),
  getTaskById,
);
router.put(
  "/:taskId",
  verifyAccessToken,
  requirePermission("tasks", "update"),
  validateTaskUpdate,
  updateTask,
);
router.delete(
  "/:taskId/soft",
  verifyAccessToken,
  requirePermission("tasks", "delete"),
  softDeleteTask,
);
router.delete(
  "/:taskId/hard",
  verifyAccessToken,
  requirePermission("tasks", "delete"),
  hardDeleteTask,
);
router.put(
  "/:taskId/confirm-completion",
  verifyAccessToken,
  requirePermission("tasks", "update"),
  uploadImage.single("evidence"),
  confirmTaskCompletion,
);
router.put(
  "/:taskId/verify-completion",
  verifyAccessToken,
  requirePermission("tasks", "update"),
  verifyTaskCompletion,
);
router.put(
  "/:taskId/restore",
  verifyAccessToken,
  requirePermission("tasks", "restore"),
  restoreTask,
);

export default router;
