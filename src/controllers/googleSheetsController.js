import {
  createGoogleSheetFromTemplate,
  createGoogleSheetTemplate,
  exportMemberListToGoogleSheet,
  exportAttendanceReportToGoogleSheet,
  getEmbedableLinkForGoogleSheet,
} from "../services/googleSheetsService.js";

export const createGoogleSheetFromExistingTemplate = async (req, res, next) => {
  try {
    const { templateId, title, folderId } = req.body;
    const result = await createGoogleSheetFromTemplate(
      req.userId,
      templateId,
      title,
      folderId,
    );
    res.status(201).json({
      success: true,
      message: "Google Sheet created successfully from template",
      data: result,
    });
  } catch (error) {
    return next(error);
  }
};

export const createNewGoogleSheetTemplate = async (req, res, next) => {
  try {
    const { userId, title } = req.body;
    const result = await createGoogleSheetTemplate(userId, title);
    res.status(201).json({
      success: true,
      message: "Google Sheet template created successfully",
      data: result,
    });
  } catch (error) {
    return next(error);
  }
};

export const exportMemberListToSheet = async (req, res, next) => {
  try {
    const { userId, sheetTitle, memberList } = req.body;

    const result = await exportMemberListToGoogleSheet(
      userId,
      sheetTitle,
      memberList,
    );

    res.status(201).json({
      success: true,
      message: "Member list exported to Google Sheet successfully",
      data: result,
    });
  } catch (error) {
    return next(error);
  }
};

export const exportAttendanceReportToSheet = async (req, res, next) => {
  try {
    const { userId, sheetTitle, attendanceData } = req.body;
    const result = await exportAttendanceReportToGoogleSheet(
      userId,
      sheetTitle,
      attendanceData,
    );
    res.status(201).json({
      success: true,
      message: "Attendance report exported to Google Sheet successfully",
      data: result,
    });
  } catch (error) {
    return next(error);
  }
};

export const fetchGoogleSheetEmbedLink = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { sheetId } = req.params;

    const result = await getEmbedableLinkForGoogleSheet(userId, sheetId);

    res.json({
      success: true,
      message: "Embeddable link for Google Sheet retrieved successfully",
      data: result,
    });
  } catch (error) {
    return next(error);
  }
};
