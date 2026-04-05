import express from "express";
import { getDashboardStats } from "../controllers/dashboardController.js";
import { verifyAccessToken } from "../middlewares/authMiddleware.js";
import { requirePermission } from "../middlewares/permissionMiddleware.js";

const router = express.Router();

router.get("/stats", verifyAccessToken, requirePermission, getDashboardStats);

export default router;