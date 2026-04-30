export const normalizeErrorResponseShape = (req, res, next) => {
  const originalJson = res.json.bind(res);

  res.json = (body) => {
    if (body && typeof body === "object") {
      const isErrorResponse =
        body.success === false || body.error !== undefined;

      if (isErrorResponse) {
        const statusCode = Number(body.statusCode) || res.statusCode || 500;
        const message = body.message || body.error || "Request failed";

        return originalJson({
          success: false,
          message,
          data: body.data ?? null,
          statusCode,
        });
      }
    }

    return originalJson(body);
  };

  next();
};
