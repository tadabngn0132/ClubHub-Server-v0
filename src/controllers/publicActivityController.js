import { prisma } from "../libs/prisma.js";
import { ACTIVITY_STATUS } from "../utils/constant.js";

export const getPublicActivities = async (req, res, next) => {
  try {
    const activities = await prisma.activity.findMany({
      where: {
        isDeleted: false,
        isPublic: true,
        status: {
          in: [
            ACTIVITY_STATUS.PUBLISHED,
            ACTIVITY_STATUS.ONGOING,
            ACTIVITY_STATUS.COMPLETED,
          ],
        },
      },
      orderBy: [{ startDate: "desc" }, { id: "desc" }],
      select: {
        id: true,
        slug: true,
        title: true,
        description: true,
        shortDescription: true,
        type: true,
        status: true,
        startDate: true,
        endDate: true,
        venueName: true,
        venueAddress: true,
        roomNumber: true,
        thumbnailUrl: true,
        isFeatured: true,
      },
    });

    res.status(200).json({
      success: true,
      message: "Get public activities successfully",
      data: activities,
    });
  } catch (err) {
    return next(err);
  }
};