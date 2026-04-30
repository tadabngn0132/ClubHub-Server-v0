import { NotFoundError } from "../utils/AppError.js";
import { logSystemAction } from "../services/auditLogService.js";

const isProduction = process.env.NODE_ENV === "production";

export const notFoundHandler = (req, res, next) => {
  next(new NotFoundError(`Route ${req.originalUrl} not found`));
};

export const errorHandler = async (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  const statusCode = Number(err.statusCode) || 500;
  const isOperational = Boolean(err.isOperational) || statusCode < 500;
  const errorMessage = err.message || "Internal server error";

  if (!isOperational || statusCode >= 500) {
    console.error("[GlobalError]", {
      method: req.method,
      path: req.originalUrl,
      userId: req.userId ?? null,
      statusCode,
      message: errorMessage,
      stack: err.stack,
    });

    void logSystemAction(req.userId ?? null, "system.error", {
      method: req.method,
      path: req.originalUrl,
      query: req.query,
      params: req.params,
      body: req.body,
      statusCode,
      message: errorMessage,
      name: err.name,
      stack: isProduction ? undefined : err.stack,
    });
  }

  return res.status(statusCode).json({
    success: false,
    message: isOperational ? errorMessage : "Internal server error",
    data: null,
    statusCode,
  });
};
