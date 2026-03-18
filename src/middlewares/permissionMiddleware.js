import { ROLE_PERMISSIONS } from "../utils/constant.js";

export const requirePermission = (resource, action, options = {}) => {
  return (req, res, next) => {
    const userRole = req.userRole || "GUEST";

    console.log("User Role:", userRole, "| Resource:", resource, "| Action:", action);
    

    const permissions = ROLE_PERMISSIONS[userRole]?.[resource]?.[action];
    console.log("Permission :", permissions);
    

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
            console.log("User is not the owner of the resource 1");
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
            console.log("User is not the owner of the resource 2");
          }
        }
      } else {
        return res.status(403).json({
          success: false,
          message:
            "Forbidden: You do not have permission to perform this action",
        });
        console.log("User does not have the required permission and allowOwner is false");
      }
    }

    next();
  };
};
