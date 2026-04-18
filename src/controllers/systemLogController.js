import { getSystemLogsService } from "../services/systemLogService.js";

export const getAllSystemLogs = async (req, res) => {
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
    console.error("Error retrieving system logs:", err);
    res.status(500).json({
      success: false,
      message: `Internal server error / Get system logs error: ${err.message}`,
    });
  }
};
