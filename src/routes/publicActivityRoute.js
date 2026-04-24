import express from "express";
import { getPublicActivities } from "../controllers/publicActivityController.js";

const router = express.Router();

router.get("/activities", getPublicActivities);

export default router;