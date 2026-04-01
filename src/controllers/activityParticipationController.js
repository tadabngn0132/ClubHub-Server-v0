import { prisma } from "../libs/prisma.js";
import { getParticipationStatus } from "../utils/activityUtil.js";

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

export const createManyParticipations = async (req, res) => {
  try {
    const items = req.body?.items;
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: "items array is required and cannot be empty" });
    }
    const result = await prisma.activityParticipation.createMany({ data: items, skipDuplicates: true });
    res.status(201).json({ success: true, message: "Participations createMany successful", data: result });
  } catch (err) {
    console.error("Error in createManyParticipations:", err);
    res.status(500).json({ success: false, message: `Internal server error / Create many participations error: ${err.message}` });
  }
};

export const getManyParticipations = async (req, res) => {
  try {
    const ids = Array.isArray(req.body?.ids)
      ? req.body.ids.map((id) => Number(id)).filter((id) => Number.isFinite(id))
      : [];
    if (ids.length === 0) {
      return res.status(400).json({ success: false, message: "ids array is required and cannot be empty" });
    }
    const records = await prisma.activityParticipation.findMany({ where: { id: { in: ids } } });
    res.status(200).json({ success: true, message: "Participations getMany successful", data: records });
  } catch (err) {
    console.error("Error in getManyParticipations:", err);
    res.status(500).json({ success: false, message: `Internal server error / Get many participations error: ${err.message}` });
  }
};

export const updateManyParticipations = async (req, res) => {
  try {
    const ids = Array.isArray(req.body?.ids)
      ? req.body.ids.map((id) => Number(id)).filter((id) => Number.isFinite(id))
      : [];
    const updateData = req.body?.data;
    if (ids.length === 0) {
      return res.status(400).json({ success: false, message: "ids array is required and cannot be empty" });
    }
    if (!updateData || typeof updateData !== "object" || Array.isArray(updateData) || Object.keys(updateData).length === 0) {
      return res.status(400).json({ success: false, message: "data object is required and cannot be empty" });
    }
    const result = await prisma.activityParticipation.updateMany({ where: { id: { in: ids } }, data: updateData });
    res.status(200).json({ success: true, message: "Participations updateMany successful", data: result });
  } catch (err) {
    console.error("Error in updateManyParticipations:", err);
    res.status(500).json({ success: false, message: `Internal server error / Update many participations error: ${err.message}` });
  }
};

export const deleteManyParticipations = async (req, res) => {
  try {
    const ids = Array.isArray(req.body?.ids)
      ? req.body.ids.map((id) => Number(id)).filter((id) => Number.isFinite(id))
      : [];
    if (ids.length === 0) {
      return res.status(400).json({ success: false, message: "ids array is required and cannot be empty" });
    }
    const result = await prisma.activityParticipation.deleteMany({ where: { id: { in: ids } } });
    res.status(200).json({ success: true, message: "Participations deleteMany successful", data: result });
  } catch (err) {
    console.error("Error in deleteManyParticipations:", err);
    res.status(500).json({ success: false, message: `Internal server error / Delete many participations error: ${err.message}` });
  }
};
