import express from "express";
import {
  createUser,
  getUser,
  getUsers,
  updateUser,
  updateUserProfile,
  softDeleteUser,
  hardDeleteUser,
  unlockAccount,
  getUserDashboardStats,
  restoreUser,
} from "../controllers/userController.js";
import { verifyAccessToken } from "../middlewares/authMiddleware.js";
import {
  validateUserCreation,
  validateUserUpdate,
  validateUserProfileUpdate,
} from "../middlewares/validationMiddleware.js";
import { requirePermission } from "../middlewares/permissionMiddleware.js";
import { uploadImage } from "../middlewares/uploadMiddleware.js";

const router = express.Router();

router.post(
  "/",
  verifyAccessToken,
  requirePermission("users", "create"),
  uploadImage.single("avatar"),
  validateUserCreation,
  createUser,
);
router.get(
  "/",
  verifyAccessToken,
  requirePermission("users", "read"),
  getUsers,
);
router.put(
  "/profile/:id",
  verifyAccessToken,
  requirePermission("users", "update", { allowOwner: true }),
  uploadImage.single("avatar"),
  validateUserProfileUpdate,
  updateUserProfile,
);
router.put(
  "/unlock/:id",
  verifyAccessToken,
  requirePermission("users", "update"),
  unlockAccount,
);
router.get(
  "/:id",
  verifyAccessToken,
  requirePermission("users", "read"),
  getUser,
);
router.put(
  "/:id",
  verifyAccessToken,
  requirePermission("users", "update"),
  uploadImage.single("avatar"),
  validateUserUpdate,
  updateUser,
);
router.put(
  "/:id/soft",
  verifyAccessToken,
  requirePermission("users", "softDelete"),
  softDeleteUser,
);
router.delete(
  "/:id/hard",
  verifyAccessToken,
  requirePermission("users", "hardDelete"),
  hardDeleteUser,
);
router.get(
  "/:id/dashboard-stats",
  verifyAccessToken,
  requirePermission("users", "read"),
  getUserDashboardStats,
);
router.put(
  "/:id/restore",
  verifyAccessToken,
  requirePermission("users", "restore"),
  restoreUser,
);

export default router;
