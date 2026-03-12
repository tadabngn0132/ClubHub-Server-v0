import express from "express";
import {
  getAllDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} from "../controllers/departmentController.js";
import { verifyAccessToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/", verifyAccessToken, createDepartment);
router.get("/", verifyAccessToken, getAllDepartments);
router.get("/:id", verifyAccessToken, getDepartmentById);
router.put("/:id", verifyAccessToken, updateDepartment);
router.delete("/:id", verifyAccessToken, deleteDepartment);

export default router;
