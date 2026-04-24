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

export const getPublicActivityBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;

    const activity = await prisma.activity.findFirst({
      where: {
        slug,
        isDeleted: false,
        isPublic: true,
      },
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
        maxParticipants: true,
        requireRegistration: true,
        registrationDeadline: true,
        _count: {
          select: {
            activityParticipations: true,
          },
        },
      },
    });

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: "Activity not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Get public activity by slug successfully",
      data: activity,
    });
  } catch (err) {
    return next(err);
  }
};

export const registerPublicActivity = async (req, res, next) => {
  try {
    const { activityId } = req.params;
    const { name, email, phoneNumber } = req.body;

    if (!name || !email || !phoneNumber) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and phone number are required",
      });
    }

    const activity = await prisma.activity.findFirst({
      where: {
        id: Number(activityId),
        isDeleted: false,
        isPublic: true,
      },
      include: {
        activityParticipations: true,
      },
    });

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: "Activity not found",
      });
    }

    if (!activity.requireRegistration) {
      return res.status(400).json({
        success: false,
        message: "This activity does not accept registration",
      });
    }

    if (
      activity.registrationDeadline &&
      new Date() > new Date(activity.registrationDeadline)
    ) {
      return res.status(400).json({
        success: false,
        message: "Registration deadline has passed",
      });
    }

    if (
      activity.maxParticipants &&
      activity.activityParticipations.length >= activity.maxParticipants
    ) {
      return res.status(400).json({
        success: false,
        message: "Activity has reached maximum participant limit",
      });
    }

    const existedGuest = await prisma.activityParticipation.findFirst({
      where: {
        activityId: Number(activityId),
        guestEmail: email,
      },
    });

    if (existedGuest) {
      return res.status(400).json({
        success: false,
        message: "You are already registered for this activity",
      });
    }

    const participation = await prisma.activityParticipation.create({
      data: {
        activityId: Number(activityId),
        status: "REGISTERED",
        guestName: name,
        guestEmail: email,
        guestPhoneNumber: phoneNumber,
      },
    });

    res.status(201).json({
      success: true,
      message: "Activity registration submitted successfully",
      data: participation,
    });
  } catch (err) {
    return next(err);
  }
};