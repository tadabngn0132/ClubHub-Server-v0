import {
  createFolder,
  listFolders,
  listFilesInFolder,
  getFileMetadata,
  uploadFileToFolder,
  listGoogleDocsTemplates,
  listGoogleSheetsTemplates,
} from "../services/googleDriveService.js";

export const createGoogleDriveFolder = async (req, res) => {
  try {
    const userId = req.userId;
    const { folderName } = req.body;
    const folder = await createFolder(userId, folderName);
    res.status(201).json({
      success: true,
      message: "Folder created successfully",
      data: folder,
    });
  } catch (error) {
    console.error("Error creating Google Drive folder:", error);
    res.status(500).json({
      success: false,
      message: `Internal Server Error / Create Google Drive Folder Error: ${error.message}`,
    });
  }
};

export const listGoogleDriveFolders = async (req, res) => {
  try {
    const userId = req.userId;
    const folders = await listFolders(userId);
    res.json({
      success: true,
      message: "Folders retrieved successfully",
      data: folders,
    });
  } catch (error) {
    console.error("Error listing Google Drive folders:", error);
    res.status(500).json({
      success: false,
      message: `Internal Server Error / List Google Drive Folders Error: ${error.message}`,
    });
  }
};

export const listGoogleDriveFilesInFolder = async (req, res) => {
  try {
    const userId = req.userId;
    const { folderId } = req.params;
    const files = await listFilesInFolder(userId, folderId);
    res.json({
      success: true,
      message: "Files retrieved successfully",
      data: files,
    });
  } catch (error) {
    console.error("Error listing files in Google Drive folder:", error);
    res.status(500).json({
      success: false,
      message: `Internal Server Error / List Files in Google Drive Folder Error: ${error.message}`,
    });
  }
};

export const getGoogleDriveFileMetadata = async (req, res) => {
  try {
    const userId = req.userId;
    const { fileId } = req.params;
    const metadata = await getFileMetadata(userId, fileId);
    res.json({
      success: true,
      message: "File metadata retrieved successfully",
      data: metadata,
    });
  } catch (error) {
    console.error("Error getting Google Drive file metadata:", error);
    res.status(500).json({
      success: false,
      message: `Internal Server Error / Get Google Drive File Metadata Error: ${error.message}`,
    });
  }
};

export const uploadFileToGoogleDriveFolder = async (req, res) => {
  try {
    const userId = req.userId;
    const { folderId } = req.params;
    const fileName = req.file.originalname;
    const fileContent = req.file.buffer;
    const file = await uploadFileToFolder(
      userId,
      folderId,
      fileName,
      fileContent,
    );
    res.status(201).json({
      success: true,
      message: "File uploaded successfully",
      data: file,
    });
  } catch (error) {
    console.error("Error uploading file to Google Drive folder:", error);
    res.status(500).json({
      success: false,
      message: `Internal Server Error / Upload File to Google Drive Folder Error: ${error.message}`,
    });
  }
};

export const listGoogleDocsTemplatesInDrive = async (req, res) => {
  try {
    const userId = req.userId;
    const templates = await listGoogleDocsTemplates(userId);
    res.status(200).json({
      success: true,
      message: "Google Docs templates retrieved successfully",
      data: templates,
    });
  } catch (error) {
    console.error("Error listing Google Docs templates in Drive:", error);
    res.status(500).json({
      success: false,
      message: `Internal Server Error / List Google Docs Templates in Drive Error: ${error.message}`,
    });
  }
};

export const listGoogleSheetsTemplatesInDrive = async (req, res) => {
  try {
    const userId = req.userId;
    const templates = await listGoogleSheetsTemplates(userId);
    res.status(200).json({
      success: true,
      message: "Google Sheets templates retrieved successfully",
      data: templates,
    });
  } catch (error) {
    console.error("Error listing Google Sheets templates in Drive:", error);
    res.status(500).json({
      success: false,
      message: `Internal Server Error / List Google Sheets Templates in Drive Error: ${error.message}`,
    });
  }
};
