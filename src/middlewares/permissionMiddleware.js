import { ROLE_PERMISSIONS } from "../utils/constant.js";

export const requirePermission = (resource, action, options = {}) => {
  return (req, res, next) => {
    const userRole = req.userRole;

    if (!userRole) {
      userRole = "GUEST";
    }

    const permissions = ROLE_PERMISSIONS[userRole]?.[resource]?.[action];

    if (!permissions) {
      if (options.allowOwner) {
        if (resource !== "users") {
          const isOwner = Number(req.params.userId) === Number(req.userId);

          if (isOwner && (action === "read" || action === "update")) {
            return next();
          } else {
            return res.status(403).json({
              success: false,
              message:
                "Forbidden: You do not have permission to perform this action",
            });
          }
        } else {
          const isOwner = Number(req.params.id) === Number(req.userId);

          if (isOwner && (action === "read" || action === "update")) {
            return next();
          } else {
            return res.status(403).json({
              success: false,
              message:
                "Forbidden: You do not have permission to perform this action",
            });
          }
        }
      } else {
        return res.status(403).json({
          success: false,
          message:
            "Forbidden: You do not have permission to perform this action",
        });
      }
    }

    next();
  };
};
