import { withUserGoogleDrive } from "./googleAuthContextService.js";

export const listUserDriveFiles = async (userId, query = "trashed = false", pageSize = 50) => {
  return withUserGoogleDrive(userId, async (googleDrive) => {
    const response = await googleDrive.files.list({
      q: query,
      pageSize,
      fields: "files(id,name,mimeType,modifiedTime,webViewLink,size,parents)",
    });
    return response.data.files ?? [];
  });
};

export const getUserDriveFile = async (userId, fileId) => {
  return withUserGoogleDrive(userId, async (googleDrive) => {
    const response = await googleDrive.files.get({
      fileId,
      fields: "id,name,mimeType,size,webViewLink,parents,createdTime,modifiedTime",
    });
    return response.data;
  });
};

export const createUserDriveFolder = async (userId, folderName, parentId = null) => {
  return withUserGoogleDrive(userId, async (googleDrive) => {
    const fileMetadata = {
      name: folderName,
      mimeType: "application/vnd.google-apps.folder",
    };

    if (parentId) {
      fileMetadata.parents = [parentId];
    }

    const response = await googleDrive.files.create({
      requestBody: fileMetadata,
      fields: "id,name,webViewLink",
    });

    return response.data;
  });
};

export const uploadUserDriveFile = async (userId, metadata, media) => {
  return withUserGoogleDrive(userId, async (googleDrive) => {
    const response = await googleDrive.files.create({
      requestBody: {
        name: metadata.name,
        parents: metadata.parents || undefined,
      },
      media,
      fields: "id,name,mimeType,webViewLink,webContentLink,size",
    });

    return response.data;
  });
};

export const downloadUserDriveFile = async (userId, fileId) => {
  return withUserGoogleDrive(userId, async (googleDrive) => {
    const response = await googleDrive.files.get(
      { fileId, alt: "media" },
      { responseType: "stream" },
    );

    return response.data;
  });
};
