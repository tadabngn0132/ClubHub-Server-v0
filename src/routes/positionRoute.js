import express from "express";
import {
  getAllPositions,
  getPositionById,
  createPosition,
  updatePosition,
  deletePosition,
} from "../controllers/positionController.js";
import { verifyAccessToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/", verifyAccessToken, createPosition);
router.get("/", verifyAccessToken, getAllPositions);
router.get("/:id", verifyAccessToken, getPositionById);
router.put("/:id", verifyAccessToken, updatePosition);
router.delete("/:id", verifyAccessToken, deletePosition);

export default router;
