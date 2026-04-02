import { withUserGoogleSheets } from "./googleAuthContextService";

export const createGoogleSheetFromTemplate = async (userId, templateId, newSheetTitle) => {
  return withUserGoogleSheets(userId, async (googleSheets) => {
    const response = await googleSheets.spreadsheets.copyTo({
      spreadsheetId: templateId,
      requestBody: {
        title: newSheetTitle,
      },
      fields: "spreadsheetId,title,createdTime,modifiedTime",
    });
    return response.data;
  });
};

export const createGoogleSheetTemplate = async (userId, title) => {
  return withUserGoogleSheets(userId, async (googleSheets) => {
    const response = await googleSheets.spreadsheets.create({
      requestBody: {
        properties: {
          title,
        },
      },
      fields: "spreadsheetId,title,createdTime,modifiedTime",
    });
    return response.data;
  });
};
