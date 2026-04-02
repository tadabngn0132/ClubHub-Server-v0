import express from "express";
import {
  getAllDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  softDeleteDepartment,
  hardDeleteDepartment,
} from "../controllers/departmentController.js";
import { verifyAccessToken } from "../middlewares/authMiddleware.js";
import { requirePermission } from "../middlewares/permissionMiddleware.js";
import {
  validateDepartmentCreation,
  validateDepartmentUpdate,
} from "../middlewares/validationMiddleware.js";

const router = express.Router();

router.post(
  "/",
  verifyAccessToken,
  requirePermission("departments", "create"),
  validateDepartmentCreation,
  createDepartment,
);
router.get(
  "/",
  // verifyAccessToken,
  requirePermission("departments", "read"),
  getAllDepartments,
);
router.get(
  "/:id",
  // verifyAccessToken,
  requirePermission("departments", "read"),
  getDepartmentById,
);
router.put(
  "/:id",
  verifyAccessToken,
  requirePermission("departments", "update"),
  validateDepartmentUpdate,
  updateDepartment,
);
router.put(
  "/:id/soft",
  verifyAccessToken,
  requirePermission("departments", "softDelete"),
  softDeleteDepartment,
);
router.delete(
  "/:id/hard",
  verifyAccessToken,
  requirePermission("departments", "hardDelete"),
  hardDeleteDepartment,
);

export default router;
