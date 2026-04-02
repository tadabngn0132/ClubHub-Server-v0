import { withUserGoogleDocs } from "./googleAuthContextService";

export const createGoogleDocFromTemplate = async (userId, templateId, newDocTitle) => {
  return withUserGoogleDocs(userId, async (googleDocs) => {
    const response = await googleDocs.documents.copy({
      documentId: templateId,
      requestBody: {
        title: newDocTitle,
      },
      fields: "documentId,title,createdTime,modifiedTime",
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
