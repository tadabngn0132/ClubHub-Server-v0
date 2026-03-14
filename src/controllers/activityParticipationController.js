import { prisma } from "../libs/prisma.js";
import { PARTICIPATION_STATUS } from "../utils/constant.js";

const getParticipationStatus = (status) => {
  switch (status) {
    case "registered":
      return PARTICIPATION_STATUS.REGISTERED;
    case "confirmed":
      return PARTICIPATION_STATUS.CONFIRMED;
    case "attended":
      return PARTICIPATION_STATUS.ATTENDED;
    case "absent":
      return PARTICIPATION_STATUS.ABSENT;
    case "cancelled":
      return PARTICIPATION_STATUS.CANCELLED;
    default:
      return PARTICIPATION_STATUS.REGISTERED;
  }
};

export const createActivityParticipation = async (req, res) => {
  try {
    const participationData = req.body;
    const participation = await prisma.activityParticipation.create({
      userId: Number(participationData.userId),
      activityId: Number(participationData.activityId),
      status: getParticipationStatus(
        participationData.status.trim().toLowerCase(),
      ),
    });
    res.status(201).json({
      success: true,
      message: "Activity participation created successfully",
      data: participation,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Internal server error / Create activity participation error: ${error.message}`,
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
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Internal server error / Get participations error: ${error.message}`,
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
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Internal server error / Get participation by ID error: ${error.message}`,
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
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Internal server error / Get participations by activity ID error: ${error.message}`,
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
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Internal server error / Get participations by user ID error: ${error.message}`,
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
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Internal server error / Update participation status error: ${error.message}`,
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
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Internal server error / Delete participation error: ${error.message}`,
    });
  }
};
