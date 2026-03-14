import express from "express";
import {
  createUser,
  getUser,
  getUsers,
  updateUser,
  softDeleteUser,
  hardDeleteUser,
} from "../controllers/userController.js";
import { verifyAccessToken } from "../middlewares/authMiddleware.js";
import {
  validateUserCreation,
  validateUserUpdate,
} from "../middlewares/validationMiddleware.js";

const router = express.Router();

router.post("/", verifyAccessToken, validateUserCreation, createUser);
router.get("/:id", verifyAccessToken, getUser);
router.get("/", verifyAccessToken, getUsers);
router.put("/:id", verifyAccessToken, validateUserUpdate, updateUser);
router.delete("/:id/soft", verifyAccessToken, softDeleteUser);
router.delete("/:id/hard", verifyAccessToken, hardDeleteUser);

export default router;
