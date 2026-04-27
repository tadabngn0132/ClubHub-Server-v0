import {
  withUserGoogleSheets,
  withUserGoogleAuth,
} from "./googleAuthContextService.js";

export const createGoogleSheetFromTemplate = async (
  userId,
  templateId,
  newSheetTitle,
) => {
  return withUserGoogleSheets(userId, async ({ googleDrive }) => {
    const response = await googleDrive.files.copy({
      fileId: templateId,
      requestBody: {
        name: newSheetTitle,
      },
      fields: "id, name, createdTime, modifiedTime",
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
