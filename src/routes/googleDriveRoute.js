import express from "express";
import {
  createGoogleDriveFolder,
  listGoogleDriveFolders,
  listGoogleDriveFilesInFolder,
  getGoogleDriveFileMetadata,
  uploadFileToGoogleDriveFolder,
  listGoogleDocsTemplatesInDrive,
  listGoogleSheetsTemplatesInDrive,
} from "../controllers/googleDriveController.js";
import { verifyAccessToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/", verifyAccessToken, createGoogleDriveFolder);
router.get("/", verifyAccessToken, listGoogleDriveFolders);
router.get("/:folderId/files", verifyAccessToken, listGoogleDriveFilesInFolder);
router.get(
  "/files/:fileId/metadata",
  verifyAccessToken,
  getGoogleDriveFileMetadata,
);
router.post(
  "/:folderId/files",
  verifyAccessToken,
  uploadFileToGoogleDriveFolder,
);
router.get(
  "/templates/docs",
  verifyAccessToken,
  listGoogleDocsTemplatesInDrive,
);
router.get(
  "/templates/sheets",
  verifyAccessToken,
  listGoogleSheetsTemplatesInDrive,
);

export default router;
