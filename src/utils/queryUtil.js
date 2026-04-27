export const withSoftDeleteFilter = (userRole) => {
  return userRole === "ADMIN" ? {} : { isDeleted: false };
};