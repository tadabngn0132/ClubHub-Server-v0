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
      id: true,
      evidenceUrl: true,
      additionalComments: true,
      reviewerComments: true,
      status: true,
      assigneeId: true,
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
    case "depts":
      return ASSIGNEE_SCOPE.DEPTS;
    case "members":
      return ASSIGNEE_SCOPE.MEMBERS;
  }
};

export const resolveAssigneeIds = async (tx, taskData) => {
  if (taskData.assigneeScope === "all") {
    const allUsers = await tx.user.findMany({
      where: { status: "ACTIVE", isDeleted: false },
      select: { id: true },
    });
    return allUsers.map((user) => user.id);
  }

  if (taskData.assigneeScope === "depts") {
    const deptUsers = await tx.user.findMany({
      where: {
        status: "ACTIVE",
        isDeleted: false,
        departments: {
          hasSome: taskData.departmentIds,
        },
      },
      select: { id: true },
    });
    return deptUsers.map((user) => user.id);
  }

  if (taskData.assigneeScope === "members") {
    return taskData.userIds;
  }

  return [];
};
