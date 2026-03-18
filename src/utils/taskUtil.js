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