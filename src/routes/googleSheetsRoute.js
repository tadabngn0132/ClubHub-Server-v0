import express from "express";
import {
  createGoogleSheetFromExistingTemplate,
  createNewGoogleSheetTemplate,
  exportMemberListToSheet,
  exportAttendanceReportToSheet,
  fetchGoogleSheetEmbedLink,
} from "../controllers/googleSheetsController.js";
import { verifyAccessToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post(
  "/create-from-template",
  verifyAccessToken,
  createGoogleSheetFromExistingTemplate,
);
router.post(
  "/create-template",
  verifyAccessToken,
  createNewGoogleSheetTemplate,
);
router.post("/export-member-list", verifyAccessToken, exportMemberListToSheet);
router.post(
  "/export-attendance-report",
  verifyAccessToken,
  exportAttendanceReportToSheet,
);
router.get(
  "/:sheetId/embed-link",
  verifyAccessToken,
  fetchGoogleSheetEmbedLink,
);

export default router;
