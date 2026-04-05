import { prisma } from "../libs/prisma.js";
import { getParticipationStatus } from "../utils/activityUtil.js";
import { sendEventRegistrationConfirmationEmail } from "../utils/emailUtil.js";

export const createActivityParticipation = async (req, res) => {
  try {
    const participationData = req.body;
    const participation = await prisma.activityParticipation.create({
      data: {
        userId: Number(participationData.userId),
        activityId: Number(participationData.activityId),
        status: getParticipationStatus(
          participationData.status.trim().toLowerCase(),
        ),
      },
    });

    const activity = await prisma.activity.findUnique({
      where: { id: Number(participationData.activityId) },
    });

    const user = await prisma.user.findUnique({
      where: { id: Number(participationData.userId) },
    });

    await sendEventRegistrationConfirmationEmail(
      user.email,
      user.fullname,
      activity.title,
    );

    res.status(201).json({
      success: true,
      message: "Activity participation created successfully",
      data: participation,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: `Internal server error / Create activity participation error: ${err.message}`,
    });
  }
};

export const getParticipations = async (req, res) => {
  try {
    const participations = await prisma.activityParticipation.findMany();
    res.status(200).json({
      success: true,
      message: "Get all participations successfully",
      data: participations,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: `Internal server error / Get participations error: ${err.message}`,
    });
  }
};

export const getParticipationById = async (req, res) => {
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
    res.status(200).json({
      success: true,
      message: "Get participation by ID successfully",
      data: participation,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: `Internal server error / Get participation by ID error: ${err.message}`,
    });
  }
};

export const getParticipationsByActivityId = async (req, res) => {
  try {
    const { activityId } = req.params;
    const participations = await prisma.activityParticipation.findMany({
      where: { activityId: Number(activityId) },
    });
    res.status(200).json({
      success: true,
      message: "Get participations by activity ID successfully",
      data: participations,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: `Internal server error / Get participations by activity ID error: ${err.message}`,
    });
  }
};

export const getParticipationsByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    const participations = await prisma.activityParticipation.findMany({
      where: { userId: Number(userId) },
    });
    res.status(200).json({
      success: true,
      message: "Get participations by user ID successfully",
      data: participations,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: `Internal server error / Get participations by user ID error: ${err.message}`,
    });
  }
};

export const updateParticipationById = async (req, res) => {
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
    res.status(500).json({
      success: false,
      message: `Internal server error / Update participation status error: ${err.message}`,
    });
  }
};

export const deleteParticipation = async (req, res) => {
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
    res.status(500).json({
      success: false,
      message: `Internal server error / Delete participation error: ${err.message}`,
    });
  }
};
