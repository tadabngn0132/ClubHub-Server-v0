import { TASK_STATUS } from "../utils/constant.js";

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
  assigneeTasks: {
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