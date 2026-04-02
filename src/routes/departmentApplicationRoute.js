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
  requirePermission("departmentApplications", "create"),
  validateDepartmentApplicationCreation,
  createDepartmentApplication,
);
router.get(
  "/",
  verifyAccessToken,
  requirePermission("departmentApplications", "read"),
  getDepartmentApplications,
);
router.get(
  "/memberApplication/:memberApplicationId",
  verifyAccessToken,
  requirePermission("departmentApplications", "read"),
  getDepartmentApplicationsByMemberApplicationId,
);
router.get(
  "/:id",
  verifyAccessToken,
  requirePermission("departmentApplications", "read"),
  getDepartmentApplicationById,
);
router.put(
  "/:id",
  verifyAccessToken,
  requirePermission("departmentApplications", "update"),
  validateDepartmentApplicationUpdate,
  updateDepartmentApplication,
);
router.put(
  "/:id/soft",
  verifyAccessToken,
  requirePermission("departmentApplications", "softDelete"),
  softDeleteDepartmentApplication,
);
router.delete(
  "/:id/hard",
  verifyAccessToken,
  requirePermission("departmentApplications", "hardDelete"),
  hardDeleteDepartmentApplication,
);

export default router;
