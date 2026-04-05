import { TASK_STATUS, ASSIGNEE_SCOPE } from "../utils/constant.js";

export const getTaskStatus = (status) => {
  switch (status) {
    case "new":
      return TASK_STATUS.NEW;
    case "in_progress":
      return TASK_STATUS.IN_PROGRESS;
    case "done":
      return TASK_STATUS.DONE;
    case "cancelled":
      return TASK_STATUS.CANCELLED;
    case "on_hold":
      return TASK_STATUS.ON_HOLD;
    default:
      return TASK_STATUS.NEW;
  }
};

export const taskInclude = {
  assignees: {
    select: {
      status: true,
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          fullname: true,
          status: true,
        },
      },
    },
  },
  assignedBy: {
    select: {
      email: true,
      fullname: true,
    },
  },
};

export const getAssigneeScopeValue = (scope) => {
  switch (scope) {
    case "all":
      return ASSIGNEE_SCOPE.ALL;
    case "committee-dept":
      return ASSIGNEE_SCOPE.EXPERT_COMMITTEE_DEPT;
    case "communication-dept":
      return ASSIGNEE_SCOPE.COMMUNICATION_DEPT;
    case "design-dept":
      return ASSIGNEE_SCOPE.DESIGN_DEPT;
    case "hr-dept":
      return ASSIGNEE_SCOPE.HUMAN_RESOURCES_DEPT;
    case "logistics-dept":
      return ASSIGNEE_SCOPE.LOGISTICS_DEPT;
    case "content-dept":
      return ASSIGNEE_SCOPE.CONTENT_DEPT;
    case "media-dept":
      return ASSIGNEE_SCOPE.MEDIA_DEPT;
  }
};

// Utility function to convert an array of values to a unique array of integers
const toUniqueNumberArray = (arr) => {
  if (!Array.isArray(arr)) return [];
  return [...new Set(arr.map(Number).filter(Number.isInteger))];
};

// Function to resolve assignee IDs based on the provided target object
export const resolveAssigneeIds = async (tx, target = {}) => {
  // Extract and process the target properties
  const allClub = Boolean(target.allClub);
  const departmentIds = toUniqueNumberArray(target.departmentIds);
  const userIds = toUniqueNumberArray(target.userIds);
  const excludeUserIds = new Set(toUniqueNumberArray(target.excludeUserIds));

  const finalSet = new Set();

  // Fetch users based on the specified criteria and populate the final set of assignee IDs
  // If allClub is true, fetch all active users and add their IDs to the final set
  if (allClub) {
    const allUsers = await tx.user.findMany({
      where: { status: "ACTIVE" },
      select: { id: true },
    });
    allUsers.forEach((user) => finalSet.add(user.id));
  }

  // Fetch users from the specified departments and add them to the final set
  if (departmentIds.length > 0) {
    const departmentUsers = await tx.userPosition.findMany({
      where: {
        position: { departmentId: { in: departmentIds } },
        user: { status: "ACTIVE" },
      },
      select: { userId: true },
      distinct: ["userId"],
    });
    departmentUsers.forEach((departmentUser) =>
      finalSet.add(departmentUser.userId),
    );
  }

  // Fetch users from the specified user IDs and add them to the final set
  if (userIds.length > 0) {
    const manualUsers = await tx.user.findMany({
      where: { id: { in: userIds }, status: "ACTIVE" },
      select: { id: true },
    });
    manualUsers.forEach((manualUser) => finalSet.add(manualUser.id));
  }

  // Remove any excluded user IDs from the final set
  excludeUserIds.forEach((id) => finalSet.delete(id));

  // Return the final array of unique assignee IDs
  return [...finalSet];
};
