import {
  withUserGoogleSheets,
  withUserGoogleDrive,
} from "./googleAuthContextService.js";

export const createGoogleSheetFromTemplate = async (
  userId,
  templateId,
  newSheetTitle,
  folderId,
) => {
  return withUserGoogleDrive(userId, async (googleDrive) => {
    const templateResponse = await googleDrive.files.get({
      fileId: templateId,
      fields: "id, name, parents",
    });

    const templateParents = templateResponse.data.parents || [];
    const parentsToUse = folderId
      ? [folderId]
      : templateParents.length > 0
        ? templateParents
        : undefined;
    const response = await googleDrive.files.copy({
      fileId: templateId,
      requestBody: {
        name: newSheetTitle,
        ...(parentsToUse ? { parents: parentsToUse } : {}),
      },
      fields:
        "id, name, parents, createdTime, modifiedTime, webViewLink, mimeType, size",
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

export const exportMemberListToGoogleSheet = async (
  userId,
  sheetTitle,
  memberList,
) => {
  return withUserGoogleSheets(userId, async (googleSheets) => {
    // Step 1: Create a new Google Sheet
    const createResponse = await googleSheets.spreadsheets.create({
      requestBody: {
        properties: {
          title: sheetTitle,
        },
        sheets: [
          {
            properties: {
              title: "Members",
            },
          },
        ],
      },
      fields: "spreadsheetId",
    });
    const spreadsheetId = createResponse.data.spreadsheetId;

    // Step 2: Prepare the data to be inserted
    const values = [
      ["Name", "Email", "Role"], // Header row
      ...memberList.map((member) => [member.name, member.email, member.role]), // Data rows
    ];

    // Step 3: Insert the data into the sheet
    await googleSheets.spreadsheets.values.update({
      spreadsheetId,
      range: "Members!A1",
      valueInputOption: "RAW",
      requestBody: {
        values,
      },
    });

    return { spreadsheetId };
  });
};

export const exportAttendanceReportToGoogleSheet = async (
  userId,
  sheetTitle,
  attendanceData,
) => {
  return withUserGoogleSheets(userId, async (googleSheets) => {
    // Step 1: Create a new Google Sheet
    const createResponse = await googleSheets.spreadsheets.create({
      requestBody: {
        properties: {
          title: sheetTitle,
        },
        sheets: [
          {
            properties: {
              title: "Attendance Report",
            },
          },
        ],
      },
      fields: "spreadsheetId",
    });
    const spreadsheetId = createResponse.data.spreadsheetId;

    // Step 2: Prepare the data to be inserted
    const values = [
      ["Activity Name", "Date", "Attendee Name", "Attendee Email"], // Header row
      ...attendanceData.flatMap((record) =>
        record.attendees.map((attendee) => [
          record.activityName,
          record.date,
          attendee.name,
          attendee.email,
        ]),
      ), // Data rows
    ];

    // Step 3: Insert the data into the sheet
    await googleSheets.spreadsheets.values.update({
      spreadsheetId,
      range: "Attendance Report!A1",
      valueInputOption: "RAW",
      requestBody: {
        values,
      },
    });

    return { spreadsheetId };
  });
};

export const getEmbedableLinkForGoogleSheet = async (userId, spreadsheetId) => {
  return `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit?usp=sharing`;
};
