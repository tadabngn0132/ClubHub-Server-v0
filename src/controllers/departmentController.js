import { prisma } from "../libs/prisma.js";

export const createDepartment = async (req, res) => {
  try {
    const departmentData = req.body;

    const newDepartment = await prisma.department.create({
      data: {
        name: departmentData.name,
        description: departmentData.description,
        isActive: departmentData.isActive,
      },
    });

    res.status(201).json({
      success: true,
      data: newDepartment,
    });
  } catch (err) {
    console.error("Error in createDepartment function:", err);
    res.status(500).json({
      success: false,
      message: `Internal server error / Create department error: ${err.message}`,
    });
  }
};

export const getAllDepartments = async (req, res) => {
  try {
    const departments = await prisma.department.findMany();

    res.status(200).json({
      success: true,
      data: departments,
    });
  } catch (err) {
    console.error("Error in getAllDepartments function:", err);
    res.status(500).json({
      success: false,
      message: `Internal server error / Get all departments error: ${err.message}`,
    });
  }
};

export const getDepartmentById = async (req, res) => {
  try {
    const { id } = req.params;

    const department = await prisma.department.findUnique({
      where: {
        id: Number(id),
      },
    });

    if (!department) {
      return res.status(404).json({
        success: false,
        message: "Department not found",
      });
    }

    res.status(200).json({
      success: true,
      data: department,
    });
  } catch (err) {
    console.error("Error in getDepartmentById function:", err);
    res.status(500).json({
      success: false,
      message: `Internal server error / Get department by ID error: ${err.message}`,
    });
  }
};

export const updateDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const departmentData = req.body;

    const department = await prisma.department.findUnique({
      where: {
        id: Number(id),
      },
    });

    if (!department) {
      return res.status(404).json({
        success: false,
        message: "Department not found",
      });
    }

    const updatedDepartment = await prisma.department.update({
      where: {
        id: Number(id),
      },
      data: {
        name: departmentData.name,
        description: departmentData.description,
        isActive: departmentData.isActive,
        updatedAt: new Date(),
      },
    });

    res.status(200).json({
      success: true,
      data: updatedDepartment,
    });
  } catch (err) {
    console.error("Error in updateDepartment function:", err);
    res.status(500).json({
      success: false,
      message: `Internal server error / Update department error: ${err.message}`,
    });
  }
};

export const deleteDepartment = async (req, res) => {
  try {
    const { id } = req.params;

    const department = await prisma.department.findUnique({
      where: {
        id: Number(id),
      },
    });

    if (!department) {
      return res.status(404).json({
        success: false,
        message: "Department not found",
      });
    }

    await prisma.department.delete({
      where: {
        id: Number(id),
      },
    });

    res.status(200).json({
      success: true,
      message: "Department deleted successfully",
    });
  } catch (err) {
    console.error("Error in deleteDepartment function:", err);
    res.status(500).json({
      success: false,
      message: `Internal server error / Delete department error: ${err.message}`,
    });
  }
};
