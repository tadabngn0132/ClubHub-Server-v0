import { getSystemLogsService } from "../services/systemLogService.js";

export const getAllSystemLogs = async (req, res, next) => {
  try {
    const { limit, page } = req.query;

    const logs = await getSystemLogsService(
      Number(limit) || 100,
      Number(page) || 1,
    );

    res.status(200).json({
      success: true,
      message: "System logs retrieved successfully.",
      data: logs,
    });
  } catch (err) {
    return next(err);
  }
};
