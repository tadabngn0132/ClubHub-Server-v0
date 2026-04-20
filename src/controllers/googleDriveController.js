import {
  createFolder,
  listFolders,
  listFilesInFolder,
  getFileMetadata,
  uploadFileToFolder,
  listGoogleDocsTemplates,
  listGoogleSheetsTemplates,
} from "../services/googleDriveService.js";

export const createGoogleDriveFolder = async (req, res, next) => {
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
    return next(error);
  }
};

export const listGoogleDriveFolders = async (req, res, next) => {
  try {
    const userId = req.userId;
    const folders = await listFolders(userId);
    res.json({
      success: true,
      message: "Folders retrieved successfully",
      data: folders,
    });
  } catch (error) {
    return next(error);
  }
};

export const listGoogleDriveFilesInFolder = async (req, res, next) => {
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
    return next(error);
  }
};

export const getGoogleDriveFileMetadata = async (req, res, next) => {
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
    return next(error);
  }
};

export const uploadFileToGoogleDriveFolder = async (req, res, next) => {
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
    return next(error);
  }
};

export const listGoogleDocsTemplatesInDrive = async (req, res, next) => {
  try {
    const userId = req.userId;
    const templates = await listGoogleDocsTemplates(userId);
    res.status(200).json({
      success: true,
      message: "Google Docs templates retrieved successfully",
      data: templates,
    });
  } catch (error) {
    return next(error);
  }
};

export const listGoogleSheetsTemplatesInDrive = async (req, res, next) => {
  try {
    const userId = req.userId;
    const templates = await listGoogleSheetsTemplates(userId);
    res.status(200).json({
      success: true,
      message: "Google Sheets templates retrieved successfully",
      data: templates,
    });
  } catch (error) {
    return next(error);
  }
};
