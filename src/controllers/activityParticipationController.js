import { prisma } from "../libs/prisma.js";
import { getParticipationStatus } from "../utils/activityUtil.js";
import { PARTICIPATION_STATUS } from "../utils/constant.js";
import { withSoftDeleteFilter } from "../utils/queryUtil.js";
import { registerActivityParticipation } from "../services/activityParticipationRegistrationService.js";

export const createActivityParticipation = async (req, res, next) => {
  try {
    const participationData = req.body;

    const activity = await prisma.activity.findUnique({
      where: { id: Number(participationData.activityId) },
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

    const participation = await registerActivityParticipation({
      activity,
      userId: participationData.userId ? Number(participationData.userId) : null,
      guestName: participationData.guestName || null,
      guestEmail: participationData.guestEmail || null,
      guestPhoneNumber: participationData.guestPhoneNumber || null,
      status: getParticipationStatus(
        participationData.status.trim().toLowerCase(),
      ),
    });

    res.status(201).json({
      success: true,
      message: "Activity participation created successfully",
      data: participation,
    });
  } catch (err) {
    return next(err);
  }
};

export const getParticipations = async (req, res, next) => {
  try {
    const participations = await prisma.activityParticipation.findMany({
      where: { ...withSoftDeleteFilter(req.userRole) },
    });
    res.status(200).json({
      success: true,
      message: "Get all participations successfully",
      data: participations,
    });
  } catch (err) {
    return next(err);
  }
};

export const getParticipationById = async (req, res, next) => {
  try {
    const { participationId } = req.params;
    const participation = await prisma.activityParticipation.findUnique({
      where: {
        id: Number(participationId),
        ...withSoftDeleteFilter(req.userRole),
      },
    });
    if (!participation) {
      return res.status(404).json({
        success: false,
        message: "participation not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "Get participation by ID successfully",
      data: participation,
    });
  } catch (err) {
    return next(err);
  }
};

export const getParticipationsByActivityId = async (req, res, next) => {
  try {
    const { activityId } = req.params;
    const participations = await prisma.activityParticipation.findMany({
      where: {
        activityId: Number(activityId),
        ...withSoftDeleteFilter(req.userRole),
      },
    });
    res.status(200).json({
      success: true,
      message: "Get participations by activity ID successfully",
      data: participations,
    });
  } catch (err) {
    return next(err);
  }
};

export const getParticipationsByUserId = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const participations = await prisma.activityParticipation.findMany({
      where: {
        userId: Number(userId),
        ...withSoftDeleteFilter(req.userRole),
      },
      include: {
        activity: {
          select: {
            id: true,
            title: true,
            description: true,
            startDate: true,
            endDate: true,
            venueName: true,
            venueAddress: true,
            thumbnailUrl: true,
          },
        },
      },
    });
    res.status(200).json({
      success: true,
      message: "Get participations by user ID successfully",
      data: participations,
    });
  } catch (err) {
    return next(err);
  }
};

export const updateParticipationById = async (req, res, next) => {
  try {
    const { participationId } = req.params;
    const participationData = req.body;
    const participation = await prisma.activityParticipation.findUnique({
      where: { id: Number(participationId) },
    });
    if (!participation) {
      return res.status(404).json({
        success: false,
        message: "participation not found",
      });
    }
    const updatedparticipation = await prisma.activityParticipation.update({
      where: { id: Number(participationId) },
      data: {
        status: getParticipationStatus(
          participationData.status.trim().toLowerCase(),
        ),
      },
    });
    res.status(200).json({
      success: true,
      message: "Update participation status successfully",
      data: updatedparticipation,
    });
  } catch (err) {
    return next(err);
  }
};

export const deleteParticipation = async (req, res, next) => {
  try {
    const { participationId } = req.params;
    const participation = await prisma.activityParticipation.findUnique({
      where: { id: Number(participationId) },
    });
    if (!participation) {
      return res.status(404).json({
        success: false,
        message: "participation not found",
      });
    }
    await prisma.activityParticipation.delete({
      where: { id: Number(participationId) },
    });
    res.status(200).json({
      success: true,
      message: "participation deleted successfully",
    });
  } catch (err) {
    return next(err);
  }
};

export const checkInParticipant = async (req, res, next) => {
  try {
    const { participationId } = req.params;

    const participation = await prisma.activityParticipation.findUnique({
      where: { id: Number(participationId) },
    });

    if (!participation) {
      return res.status(404).json({
        success: false,
        message: "Participation not found",
      });
    }

    const updatedParticipation = await prisma.activityParticipation.update({
      where: { id: Number(participationId) },
      data: { status: PARTICIPATION_STATUS.ATTENDED },
    });

    res.status(200).json({
      success: true,
      message: "Participant checked in successfully",
      data: updatedParticipation,
    });
  } catch (err) {
    return next(err);
  }
};

export const markParticipantNoShow = async (req, res, next) => {
  try {
    const { participationId } = req.params;

    const participation = await prisma.activityParticipation.findUnique({
      where: { id: Number(participationId) },
    });

    if (!participation) {
      return res.status(404).json({
        success: false,
        message: "Participation not found",
      });
    }

    const updatedParticipations = await prisma.activityParticipation.updateMany(
      {
        where: {
          id: Number(participationId),
        },
        data: { status: PARTICIPATION_STATUS.ABSENT },
      },
    );

    res.status(200).json({
      success: true,
      message: "Participants marked as no-show successfully",
      data: updatedParticipations,
    });
  } catch (err) {
    return next(err);
  }
};
