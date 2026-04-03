import {
    createGoogleSheetFromTemplate,
    createGoogleSheetTemplate,
    exportMemberListToGoogleSheet,
    exportAttendanceReportToGoogleSheet,
    getEmbedableLinkForGoogleSheet,
} from '../services/googleSheetsService.js';

export const createGoogleSheetFromExistingTemplate = async (req, res) => {
  try {
    const { userId, templateId, newSheetTitle } = req.body;
    const result = await createGoogleSheetFromTemplate(userId, templateId, newSheetTitle);
    res.status(201).json({
        success: true,
        message: "Google Sheet created successfully from template",
        data: result,
    });
  } catch (error) {
    console.error("Error creating Google Sheet from template:", error);
    res.status(500).json({
        success: false,
        message: `Internal Server Error / Create Google Sheet from Template Error: ${error.message}`,
    });
  }
};

export const createNewGoogleSheetTemplate = async (req, res) => {
  try {
    const { userId, title } = req.body;
    const result = await createGoogleSheetTemplate(userId, title);
    res.status(201).json({
        success: true,
        message: "Google Sheet template created successfully",
        data: result,
    });
  } catch (error) {
    console.error("Error creating Google Sheet template:", error);
    res.status(500).json({
        success: false,
        message: `Internal Server Error / Create Google Sheet Template Error: ${error.message}`,
    });
  }
};

export const exportMemberListToSheet = async (req, res) => {
  try {
    const { userId, sheetTitle, memberList } = req.body;

    const result = await exportMemberListToGoogleSheet(userId, sheetTitle, memberList);

    res.status(201).json({
        success: true,
        message: "Member list exported to Google Sheet successfully",
        data: result,
    });
  } catch (error) {
    console.error("Error exporting member list to Google Sheet:", error);
    res.status(500).json({
        success: false,
        message: `Internal Server Error / Export Member List to Google Sheet Error: ${error.message}`,
    });
  }
};

export const exportAttendanceReportToSheet = async (req, res) => {
  try {
    const { userId, sheetTitle, attendanceData } = req.body;
    const result = await exportAttendanceReportToGoogleSheet(userId, sheetTitle, attendanceData);
    res.status(201).json({
        success: true,
        message: "Attendance report exported to Google Sheet successfully",
        data: result,
    });
  } catch (error) {
    console.error("Error exporting attendance report to Google Sheet:", error);
    res.status(500).json({
        success: false,
        message: `Internal Server Error / Export Attendance Report to Google Sheet Error: ${error.message}`,
    });
  }
};

export const fetchGoogleSheetEmbedLink = async (req, res) => {
    try {
        const { documentId } = req.params;

        const result = await getEmbedableLinkForGoogleSheet(documentId);

        res.json({
            success: true,
            message: "Embeddable link for Google Sheet retrieved successfully",
            data: result,
        });
    } catch (error) {
        console.error("Error fetching embeddable link for Google Sheet:", error);
        res.status(500).json({
            success: false,
            message: `Internal Server Error / Fetch Embeddable Link for Google Sheet Error: ${error.message}`,
        });
    }
};

export const listGoogleSheetsTemplates = async (req, res) => {
  try {
    const { userId } = req.params;
    const templates = await listGoogleSheetsTemplates(userId);
    res.json({
        success: true,
        message: "Google Sheet templates retrieved successfully",
        data: templates,
    });
  } catch (error) {
    console.error("Error listing Google Sheet templates:", error);
    res.status(500).json({
        success: false,
        message: `Internal Server Error / List Google Sheet Templates Error: ${error.message}`,
    });
  }
};
