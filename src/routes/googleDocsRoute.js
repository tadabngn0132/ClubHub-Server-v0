import express from "express";
import {
    createGoogleDocFromExistingTemplate,
    createNewGoogleDocTemplate,
    getGoogleDocEmbedLink,
    listGoogleDocTemplates,
} from "../controllers/googleDocsController.js";
import { verifyAccessToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/from-template", verifyAccessToken, createGoogleDocFromExistingTemplate);
router.post("/templates", verifyAccessToken, createNewGoogleDocTemplate);
router.get("/:documentId/embed-link", verifyAccessToken, getGoogleDocEmbedLink);
router.get("/templates", verifyAccessToken, listGoogleDocTemplates);

export default router;