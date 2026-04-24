import express from "express";
import { getClubStructure } from "../controllers/publicController.js";

const router = express.Router();

router.get("/club-structure", getClubStructure);

export default router;