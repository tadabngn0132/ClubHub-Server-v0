import express from "express";
import {
  getAllDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} from "../controllers/departmentController.js";
import { verifyAccessToken } from "../middlewares/authMiddleware.js";
import { requirePermission } from "../middlewares/permissionMiddleware.js";

const router = express.Router();

router.post(
  "/",
  verifyAccessToken,
  requirePermission("departments", "create"),
  createDepartment,
);
router.get(
  "/",
  verifyAccessToken,
  requirePermission("departments", "read"),
  getAllDepartments,
);
router.get(
  "/:id",
  verifyAccessToken,
  requirePermission("departments", "read"),
  getDepartmentById,
);
router.put(
  "/:id",
  verifyAccessToken,
  requirePermission("departments", "update"),
  updateDepartment,
);
router.delete(
  "/:id",
  verifyAccessToken,
  requirePermission("departments", "delete"),
  deleteDepartment,
);

export default router;
