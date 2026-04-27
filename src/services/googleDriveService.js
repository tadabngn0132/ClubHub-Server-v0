import { withUserGoogleDrive } from "./googleAuthContextService.js";

export const createFolder = async (userId, folderName) => {
  return withUserGoogleDrive(userId, async (googleDrive) => {
    const fileMetadata = {
      name: folderName,
      mimeType: "application/vnd.google-apps.folder",
    };
    const res = await googleDrive.files.create({
      requestBody: fileMetadata,
      fields: "id, name",
    });
    return res.data;
  });
};

export const listFolders = async (userId) => {
  return withUserGoogleDrive(userId, async (googleDrive) => {
    const res = await googleDrive.files.list({
      q: "mimeType='application/vnd.google-apps.folder'",
      fields: "files(id, name)",
    });
    return res.data.files;
  });
};

export const listFilesInFolder = async (userId, folderId) => {
  return withUserGoogleDrive(userId, async (googleDrive) => {
    const res = await googleDrive.files.list({
      q: `'${folderId}' in parents`,
      fields: "files(id, name, mimeType)",
    });
    return res.data.files;
  });
};

export const getFileMetadata = async (userId, fileId) => {
  return withUserGoogleDrive(userId, async (googleDrive) => {
    const res = await googleDrive.files.get({
      fileId,
      fields: "id, name, mimeType, parents",
    });
    return res.data;
  });
};

export const uploadFileToFolder = async (
  userId,
  folderId,
  fileName,
  fileContent,
) => {
  return withUserGoogleDrive(userId, async (googleDrive) => {
    const fileMetadata = {
      name: fileName,
      parents: [folderId],
    };
    const media = {
      mimeType: "application/octet-stream",
      body: fileContent,
    };
    const res = await googleDrive.files.create({
      requestBody: fileMetadata,
      media,
      fields: "id, name",
    });
    return res.data;
  });
};

export const downloadFile = async (userId, fileId) => {
  return withUserGoogleDrive(userId, async (googleDrive) => {
    const res = await googleDrive.files.get(
      {
        fileId,
        alt: "media",
      },
      { responseType: "stream" },
    );
    return res.data;
  });
};

export const getSharedFileLink = async (userId, fileId) => {
  return withUserGoogleDrive(userId, async (googleDrive) => {
    // First, set the file to be shared with anyone who has the link
    await googleDrive.permissions.create({
      fileId,
      requestBody: {
        role: "reader",
        type: "anyone",
      },
    });
    // Then, get the sharing link
    const res = await googleDrive.files.get({
      fileId,
      fields: "id, name, webViewLink",
    });
    return res.data.webViewLink;
  });
};

export const listGoogleDocsTemplates = async (userId) => {
  return withUserGoogleDrive(userId, async (googleDrive) => {
    const res = await googleDrive.files.list({
      q: "mimeType='application/vnd.google-apps.document' and name contains 'Template'",
      fields: "files(id, name, createdTime, modifiedTime)",
    });
    return res.data.files || [];
  });
};

export const listGoogleSheetsTemplates = async (userId) => {
  return withUserGoogleDrive(userId, async (googleDrive) => {
    const res = await googleDrive.files.list({
      q: "mimeType='application/vnd.google-apps.spreadsheet' and name contains 'Template'",
      fields: "files(id, name, createdTime, modifiedTime)",
    });
    return res.data.files || [];
  });
};
