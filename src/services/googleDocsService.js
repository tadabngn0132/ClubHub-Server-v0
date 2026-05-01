import {
  withUserGoogleDocs,
  withUserGoogleDrive,
} from "./googleAuthContextService.js";

export const createGoogleDocFromTemplate = async (
  userId,
  templateId,
  newDocTitle,
  folderId,
) => {
  return withUserGoogleDrive(userId, async (googleDrive) => {
    const templateResponse = await googleDrive.files.get({
      fileId: templateId,
      fields: "id, name, parents",
    });

    const templateParents = templateResponse.data.parents || [];
    // prefer explicit folderId when provided, otherwise use template parents
    const parentsToUse = folderId
      ? [folderId]
      : templateParents.length > 0
        ? templateParents
        : undefined;

    const response = await googleDrive.files.copy({
      fileId: templateId,
      requestBody: {
        name: newDocTitle,
        ...(parentsToUse ? { parents: parentsToUse } : {}),
      },
      fields:
        "id, name, parents, createdTime, modifiedTime, webViewLink, mimeType, size",
    });
    return response.data;
  });
};

export const createGoogleDocTemplate = async (userId, title) => {
  return withUserGoogleDocs(userId, async (googleDocs) => {
    const response = await googleDocs.documents.create({
      requestBody: {
        title,
      },
      fields: "documentId,title",
    });
    return response.data;
  });
};

export const getEmbeddableLinkForGoogleDoc = async (userId, documentId) => {
  return withUserGoogleDocs(userId, async (googleDocs) => {
    const response = await googleDocs.documents.get({
      documentId,
      fields: "documentId,title,createdTime,modifiedTime",
    });
    const docData = response.data;
    return `https://docs.google.com/document/d/${docData.documentId}/edit?usp=sharing`;
  });
};
