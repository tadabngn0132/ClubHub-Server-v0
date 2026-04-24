import express from "express";
import {
	getPublicActivities,
	getPublicActivityBySlug,
	registerPublicActivity,
} from "../controllers/publicActivityController.js";

const router = express.Router();

router.get("/activities", getPublicActivities);
router.get("/activities/slug/:slug", getPublicActivityBySlug);
router.post("/activities/:activityId/register", registerPublicActivity);

export default router;