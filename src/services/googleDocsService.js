import { withUserGoogleDocs, withUserGoogleAuth } from "./googleAuthContextService.js";

export const createGoogleDocFromTemplate = async (
  userId,
  templateId,
  newDocTitle,
) => {
  return withUserGoogleDocs(userId, async ({ googleDrive }) => {
    const response = await googleDrive.files.copy({
      fileId: templateId,
      requestBody: {
        name: newDocTitle,
      },
      fields: "id, name, createdTime, modifiedTime",
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
      fields: "documentId,title,createdTime,modifiedTime",
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
