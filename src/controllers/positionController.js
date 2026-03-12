import { prisma } from "../libs/prisma.js";

export const createPosition = async (req, res) => {
  try {
    const positionData = req.body;

    const newPosition = await prisma.position.create({
      data: {
        title: positionData.title,
        departmentId: positionData.departmentId,
        level: positionData.level,
        systemRole: positionData.systemRole,
      },
    });

    res.status(201).json({
      success: true,
      data: newPosition,
    });
  } catch (error) {
    console.error("Error in createPosition function:", error);
    res.status(500).json({
      success: false,
      message: `Internal server error / Create position error: ${error.message}`,
    });
  }
};

export const getAllPositions = async (req, res) => {
  try {
    const positions = await prisma.position.findMany();

    res.status(200).json({
      success: true,
      data: positions,
    });
  } catch (error) {
    console.error("Error in getAllPositions function:", error);
    res.status(500).json({
      success: false,
      message: `Internal server error / Get all positions error: ${error.message}`,
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
      data: position,
    });
  } catch (error) {
    console.error("Error in getPositionById function:", error);
    res.status(500).json({
      success: false,
      message: `Internal server error / Get position by ID error: ${error.message}`,
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
        level: positionData.level,
        systemRole: positionData.systemRole,
        updatedAt: new Date(),
      },
    });

    res.status(200).json({
      success: true,
      data: updatedPosition,
    });
  } catch (error) {
    console.error("Error in updatePosition function:", error);
    res.status(500).json({
      success: false,
      message: `Internal server error / Update position error: ${error.message}`,
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
  } catch (error) {
    console.error("Error in deletePosition function:", error);
    res.status(500).json({
      success: false,
      message: `Internal server error / Delete position error: ${error.message}`,
    });
  }
};
