import express from "express";
import {
  createUser,
  getUser,
  getUsers,
  updateUser,
  softDeleteUser,
  hardDeleteUser,
} from "../controllers/userController.js";
import { verifyAccessToken } from "../middlewares/authMiddleware.js";
import {
  validateUserCreation,
  validateUserUpdate,
} from "../middlewares/validationMiddleware.js";
import { requirePermission } from "../middlewares/permissionMiddleware.js";
import { uploadImage } from "../middlewares/uploadMiddleware.js";

const router = express.Router();

router.post("/", verifyAccessToken, requirePermission("users", "create"), uploadImage.single("avatar"), validateUserCreation, createUser);
router.get(
  "/:id",
  verifyAccessToken,
  requirePermission("users", "read"),
  getUser,
);
router.get(
  "/",
  verifyAccessToken,
  requirePermission("users", "read"),
  getUsers,
);
router.put(
  "/:id",
  verifyAccessToken,
  requirePermission("users", "update", { allowOwner: true }),
  uploadImage.single("avatar"),
  validateUserUpdate,
  updateUser,
);
router.delete(
  "/:id/soft",
  verifyAccessToken,
  requirePermission("users", "delete"),
  softDeleteUser,
);
router.delete(
  "/:id/hard",
  verifyAccessToken,
  requirePermission("users", "delete"),
  hardDeleteUser,
);

export default router;
