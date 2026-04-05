import { prisma } from "../libs/prisma.js";
import { userIncludeOptions } from "../utils/userUtil.js";
import { USER_STATUS, ACTIVITY_STATUS, TASK_STATUS } from "../utils/constant";

export const getDashboardStats = async (req, res) => {
  // 3 aggregate queries to get the counts of total active users, upcoming events, and incomplete tasks
  try {
    const [totalUsers, upcomingEvents, pendingTasks] = await Promise.all([
      prisma.user.count({
        where: {
          isDeleted: false,
          status: USER_STATUS.ACTIVE,
        },
        include: userIncludeOptions,
      }),
      prisma.event.count({
        where: {
          isDeleted: false,
          status: ACTIVITY_STATUS.PUBLISHED,
          startDate: {
            gte: new Date(),
          },
        },
      }),
      prisma.task.count({
        where: {
          isDeleted: false,
          status: {
            in: [TASK_STATUS.IN_PROGRESS, TASK_STATUS.NEW],
          },
        },
      }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        userCount: totalUsers,
        taskCount: pendingTasks,
        eventCount: upcomingEvents,
      },
    });
  } catch (err) {
    console.error("Error in getDashboardStats function:", err);
    res.status(500).json({
      success: false,
      message: `Internal server error / Get dashboard stats error: ${err.message}`,
    });
  }
};
