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
  requirePermission("departmentApplications", "create"),
  createManyDepartmentApplications,
);
router.post(
  "/many/get",
  verifyAccessToken,
  requirePermission("departmentApplications", "read"),
  getManyDepartmentApplications,
);
router.put(
  "/many/update",
  verifyAccessToken,
  requirePermission("departmentApplications", "update"),
  updateManyDepartmentApplications,
);
router.put(
  "/many/soft-delete",
  verifyAccessToken,
  requirePermission("departmentApplications", "softDelete"),
  softDeleteManyDepartmentApplications,
);
router.delete(
  "/many/hard-delete",
  verifyAccessToken,
  requirePermission("departmentApplications", "hardDelete"),
  hardDeleteManyDepartmentApplications,
);

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
