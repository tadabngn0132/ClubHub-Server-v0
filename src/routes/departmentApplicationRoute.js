import express from "express";
import {
  createDepartmentApplication,
  getDepartmentApplicationsByMemberApplicationId,
  getDepartmentApplicationById,
  getDepartmentApplications,
  updateDepartmentApplication,
  softDeleteDepartmentApplication,
  hardDeleteDepartmentApplication,
} from "../controllers/departmentApplicationController.js";
import { verifyAccessToken } from "../middlewares/authMiddleware.js";
import { requirePermission } from "../middlewares/permissionMiddleware.js";
import {
  validateDepartmentApplicationCreation,
  validateDepartmentApplicationUpdate,
} from "../middlewares/validationMiddleware.js";

const router = express.Router();

router.post(
  "/",
  verifyAccessToken,
  requirePermission("departmentApplication", "create"),
  validateDepartmentApplicationCreation,
  createDepartmentApplication,
);
router.get(
  "/",
  verifyAccessToken,
  requirePermission("departmentApplication", "read"),
  getDepartmentApplications,
);
router.get(
  "/memberApplication/:memberApplicationId",
  verifyAccessToken,
  requirePermission("departmentApplication", "read"),
  getDepartmentApplicationsByMemberApplicationId,
);
router.get(
  "/:id",
  verifyAccessToken,
  requirePermission("departmentApplication", "read"),
  getDepartmentApplicationById,
);
router.put(
  "/:id",
  verifyAccessToken,
  requirePermission("departmentApplication", "update"),
  validateDepartmentApplicationUpdate,
  updateDepartmentApplication,
);
router.put(
  "/:id/soft",
  verifyAccessToken,
  requirePermission("departmentApplication", "softDelete"),
  softDeleteDepartmentApplication,
);
router.delete(
  "/:id/hard",
  verifyAccessToken,
  requirePermission("departmentApplication", "hardDelete"),
  hardDeleteDepartmentApplication,
);

export default router;
