import express from "express";
import {
  createUser,
  getUser,
  getUsers,
  updateUser,
  softDeleteUser,
  hardDeleteUser,
  createManyUsers,
  getManyUsers,
  updateManyUsers,
  softDeleteManyUsers,
  hardDeleteManyUsers,
} from "../controllers/userController.js";
import { verifyAccessToken } from "../middlewares/authMiddleware.js";
import {
  validateUserCreation,
  validateUserUpdate,
} from "../middlewares/validationMiddleware.js";
import { requirePermission } from "../middlewares/permissionMiddleware.js";
import { uploadImage } from "../middlewares/uploadMiddleware.js";

const router = express.Router();

router.post(
  "/many/create",
  verifyAccessToken,
  requirePermission("users", "create"),
  createManyUsers,
);
router.post(
  "/many/get",
  verifyAccessToken,
  requirePermission("users", "read"),
  getManyUsers,
);
router.put(
  "/many/update",
  verifyAccessToken,
  requirePermission("users", "update"),
  updateManyUsers,
);
router.put(
  "/many/soft-delete",
  verifyAccessToken,
  requirePermission("users", "delete"),
  softDeleteManyUsers,
);
router.delete(
  "/many/hard-delete",
  verifyAccessToken,
  requirePermission("users", "delete"),
  hardDeleteManyUsers,
);

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
