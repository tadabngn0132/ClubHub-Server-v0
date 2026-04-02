import express from "express";
import {
  
} from "../controllers/aiController.js";
import { verifyAccessToken } from "../middlewares/authMiddleware.js";

const router = express.Router();



export default router;
