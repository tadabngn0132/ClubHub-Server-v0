import { prisma } from "../libs/prisma.js";
import { AppError } from "../utils/AppError.js";

export const createSystemLogService = async (userId, action, details) => {
  try {
    const logEntry = await prisma.systemLog.create({
      data: {
        userId,
        action,
        details,
      },
    });
    return logEntry;
  } catch (err) {
    console.error("Error creating system log:", err);
    throw new AppError(`Internal server error / Create system log error: ${err.message}`, 500);
  }
};

export const getSystemLogsService = async (limit = 100, page = 1) => {
  const offset = (page - 1) * limit;
  const logs = await prisma.systemLog.findMany({
    take: limit,
    skip: offset,
    orderBy: {
      timestamp: "desc",
    },
  });
  return logs;
};