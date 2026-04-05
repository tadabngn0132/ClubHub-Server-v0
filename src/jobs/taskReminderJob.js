import cron from "node-cron";
import { prisma } from "../libs/prisma.js";
import { sendTaskDeadlineReminderEmail } from "../utils/emailUtil.js";
import { TASK_STATUS, ASSIGNEE_TASK_STATUS } from "../utils/constant.js";
import { taskInclude } from "../utils/taskUtil.js";

export const startTaskReminderJob = () => {
  // Chạy mỗi giờ
  cron.schedule("0 * * * *", async () => {
    try {
      const now = new Date();

      const [threeDayTasks, oneDayTasks] = await Promise.all([
        // Deadline còn 3 ngày
        prisma.task.findMany({
          where: {
            isDeleted: false,
            status: TASK_STATUS.IN_PROGRESS,
            dueDate: {
              gte: new Date(
                now.getTime() + 3 * 24 * 60 * 60 * 1000 - 30 * 60 * 1000,
              ), // >= 3 ngày nữa - 30 phút
              lte: new Date(
                now.getTime() + 3 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000,
              ), // <= 3 ngày nữa + 30 phút
            },
          },
          include: taskInclude,
        }),
        // Deadline còn 1 ngày
        prisma.task.findMany({
          where: {
            isDeleted: false,
            status: TASK_STATUS.IN_PROGRESS,
            dueDate: {
              gte: new Date(
                now.getTime() + 24 * 60 * 60 * 1000 - 30 * 60 * 1000,
              ), // >= 1 ngày nữa - 30 phút
              lte: new Date(
                now.getTime() + 24 * 60 * 60 * 1000 + 30 * 60 * 1000,
              ), // <= 1 ngày nữa + 30 phút
            },
          },
          include: taskInclude,
        }),
      ]);

      const tasksToRemind = [...threeDayTasks, ...oneDayTasks];

      for (const task of tasksToRemind) {
        const assignees = task.assignees.filter(
          (assignee) =>
            assignee.status === ASSIGNEE_TASK_STATUS.PENDING ||
            assignee.status === ASSIGNEE_TASK_STATUS.REJECTED,
        );

        for (const assignee of assignees) {
          sendTaskDeadlineReminderEmail(
            assignee.user.email,
            assignee.user.fullname,
            task.title,
            task.dueDate,
          );
        }
      };
    } catch (error) {
      console.error(
        "Error occurred while sending task reminder emails:",
        error,
      );
    }
  });
};
