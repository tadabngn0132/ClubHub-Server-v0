import express from "express";
import {
  createDepartmentApplication,
  getDepartmentApplicationsByMemberApplicationId,
  getDepartmentApplicationById,
  getDepartmentApplications,
  updateDepartmentApplication,
  softDeleteDepartmentApplication,
  hardDeleteDepartmentApplication,
  createManyDepartmentApplications,
  getManyDepartmentApplications,
  updateManyDepartmentApplications,
  softDeleteManyDepartmentApplications,
  hardDeleteManyDepartmentApplications,
} from "../controllers/departmentApplicationController.js";
import { verifyAccessToken } from "../middlewares/authMiddleware.js";
import { requirePermission } from "../middlewares/permissionMiddleware.js";
import {
  validateDepartmentApplicationCreation,
  validateDepartmentApplicationUpdate,
} from "../middlewares/validationMiddleware.js";

const router = express.Router();

router.post(
  "/many/create",
  verifyAccessToken,
  requirePermission("departmentApplication", "create"),
  createManyDepartmentApplications,
);
router.post(
  "/many/get",
  verifyAccessToken,
  requirePermission("departmentApplication", "read"),
  getManyDepartmentApplications,
);
router.put(
  "/many/update",
  verifyAccessToken,
  requirePermission("departmentApplication", "update"),
  updateManyDepartmentApplications,
);
router.put(
  "/many/soft-delete",
  verifyAccessToken,
  requirePermission("departmentApplication", "softDelete"),
  softDeleteManyDepartmentApplications,
);
router.delete(
  "/many/hard-delete",
  verifyAccessToken,
  requirePermission("departmentApplication", "hardDelete"),
  hardDeleteManyDepartmentApplications,
);

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
