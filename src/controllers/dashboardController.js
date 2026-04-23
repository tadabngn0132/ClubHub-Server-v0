import { prisma } from "../libs/prisma.js";
import {
  USER_STATUS,
  ACTIVITY_STATUS,
  TASK_STATUS,
  CV_STATUS,
  MEMBER_APPLICATION_STATE,
} from "../utils/constant.js";

export const getDashboardStats = async (req, res, next) => {
  // 4 aggregate queries to get the counts of total active users, upcoming events, incomplete tasks, and pending member applications
  try {
    const [
      totalUsers,
      upcomingEvents,
      pendingTasks,
      pendingMemberApplications,
    ] = await Promise.all([
      prisma.user.count({
        where: {
          isDeleted: false,
          status: USER_STATUS.ACTIVE,
        },
      }),
      prisma.activity.count({
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
      prisma.memberApplication.count({
        where: {
          isDeleted: false,
          state: {
            in: [MEMBER_APPLICATION_STATE.SUBMITTED, MEMBER_APPLICATION_STATE.CV_PENDING],
          },
        },
      }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        userCount: totalUsers,
        upcomingEvents: upcomingEvents,
        pendingTasks: pendingTasks,
        pendingMemberApplications: pendingMemberApplications,
      },
    });
  } catch (err) {
    return next(err);
  }
};
