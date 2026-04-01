import { prisma } from "../libs/prisma.js";
import { getPositionLevel } from "../utils/positionUtil.js";

export const createPosition = async (req, res) => {
  try {
    const positionData = req.body;

    const newPosition = await prisma.position.create({
      data: {
        title: positionData.title,
        departmentId: positionData.departmentId,
        level: getPositionLevel(positionData.level.trim().toLowerCase()),
        systemRole: positionData.systemRole,
      },
    });

    res.status(201).json({
      success: true,
      message: "Position created successfully",
      data: newPosition,
    });
  } catch (err) {
    console.error("Error in createPosition function:", err);
    res.status(500).json({
      success: false,
      message: `Internal server error / Create position error: ${err.message}`,
    });
  }
};

export const getAllPositions = async (req, res) => {
  try {
    const positions = await prisma.position.findMany();

    res.status(200).json({
      success: true,
      message: "Get all positions successfully",
      data: positions,
    });
  } catch (err) {
    console.error("Error in getAllPositions function:", err);
    res.status(500).json({
      success: false,
      message: `Internal server error / Get all positions error: ${err.message}`,
    });
  }
};

export const getPositionById = async (req, res) => {
  try {
    const { id } = req.params;

    const position = await prisma.position.findUnique({
      where: {
        id: Number(id),
      },
    });

    if (!position) {
      return res.status(404).json({
        success: false,
        message: "Position not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Get position by ID successfully",
      data: position,
    });
  } catch (err) {
    console.error("Error in getPositionById function:", err);
    res.status(500).json({
      success: false,
      message: `Internal server error / Get position by ID error: ${err.message}`,
    });
  }
};

export const updatePosition = async (req, res) => {
  try {
    const { id } = req.params;
    const positionData = req.body;

    const position = await prisma.position.findUnique({
      where: {
        id: Number(id),
      },
    });

    if (!position) {
      return res.status(404).json({
        success: false,
        message: "Position not found",
      });
    }

    const updatedPosition = await prisma.position.update({
      where: {
        id: Number(id),
      },
      data: {
        title: positionData.title,
        departmentId: positionData.departmentId,
        level: getPositionLevel(positionData.level.trim().toLowerCase()),
        systemRole: positionData.systemRole,
      },
    });

    res.status(200).json({
      success: true,
      message: "Position updated successfully",
      data: updatedPosition,
    });
  } catch (err) {
    console.error("Error in updatePosition function:", err);
    res.status(500).json({
      success: false,
      message: `Internal server error / Update position error: ${err.message}`,
    });
  }
};

export const deletePosition = async (req, res) => {
  try {
    const { id } = req.params;

    const position = await prisma.position.findUnique({
      where: {
        id: Number(id),
      },
    });

    if (!position) {
      return res.status(404).json({
        success: false,
        message: "Position not found",
      });
    }

    await prisma.position.delete({
      where: {
        id: Number(id),
      },
    });

    res.status(200).json({
      success: true,
      message: "Position deleted successfully",
    });
  } catch (err) {
    console.error("Error in deletePosition function:", err);
    res.status(500).json({
      success: false,
      message: `Internal server error / Delete position error: ${err.message}`,
    });
  }
};

export const createManyPositions = async (req, res) => {
  try {
    const items = req.body?.items;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: "items array is required and cannot be empty" });
    }

    const result = await prisma.position.createMany({ data: items, skipDuplicates: true });
    res.status(201).json({ success: true, message: "Positions createMany successful", data: result });
  } catch (err) {
    console.error("Error in createManyPositions:", err);
    res.status(500).json({ success: false, message: `Internal server error / Create many positions error: ${err.message}` });
  }
};

export const getManyPositions = async (req, res) => {
  try {
    const ids = Array.isArray(req.body?.ids)
      ? req.body.ids.map((id) => Number(id)).filter((id) => Number.isFinite(id))
      : [];
    if (ids.length === 0) {
      return res.status(400).json({ success: false, message: "ids array is required and cannot be empty" });
    }
    const records = await prisma.position.findMany({ where: { id: { in: ids } } });
    res.status(200).json({ success: true, message: "Positions getMany successful", data: records });
  } catch (err) {
    console.error("Error in getManyPositions:", err);
    res.status(500).json({ success: false, message: `Internal server error / Get many positions error: ${err.message}` });
  }
};

export const updateManyPositions = async (req, res) => {
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
    const result = await prisma.position.updateMany({ where: { id: { in: ids } }, data: updateData });
    res.status(200).json({ success: true, message: "Positions updateMany successful", data: result });
  } catch (err) {
    console.error("Error in updateManyPositions:", err);
    res.status(500).json({ success: false, message: `Internal server error / Update many positions error: ${err.message}` });
  }
};

export const deleteManyPositions = async (req, res) => {
  try {
    const ids = Array.isArray(req.body?.ids)
      ? req.body.ids.map((id) => Number(id)).filter((id) => Number.isFinite(id))
      : [];
    if (ids.length === 0) {
      return res.status(400).json({ success: false, message: "ids array is required and cannot be empty" });
    }
    const result = await prisma.position.deleteMany({ where: { id: { in: ids } } });
    res.status(200).json({ success: true, message: "Positions deleteMany successful", data: result });
  } catch (err) {
    console.error("Error in deleteManyPositions:", err);
    res.status(500).json({ success: false, message: `Internal server error / Delete many positions error: ${err.message}` });
  }
};
