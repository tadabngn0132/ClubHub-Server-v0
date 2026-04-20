import { createSystemLogService } from "./systemLogService.js";

const serializeDetails = (details) => {
  if (details === undefined || details === null) {
    return null;
  }

  if (typeof details === "string") {
    return details;
  }

  try {
    return JSON.stringify(details);
  } catch {
    return String(details);
  }
};

export const logSystemAction = async (userId, action, details) => {
  try {
    return await createSystemLogService(
      userId ?? null,
      action,
      serializeDetails(details),
    );
  } catch (error) {
    console.error("[AuditLog] Failed to write system log:", error);
    return null;
  }
};