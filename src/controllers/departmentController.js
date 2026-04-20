import { prisma } from "../libs/prisma.js";
import { indexDepartment } from "../services/knowledgeIndexerService.js";
import { deleteChunksBySource } from "../services/documentChunkService.js";

export const createDepartment = async (req, res, next) => {
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
      message: "Department created successfully",
      data: newDepartment,
    });

    // Index department into the RAG system
    indexDepartment(newDepartment.id).catch((err) =>
      console.error(
        `[RAG] Indexing department ${newDepartment.id} failed:`,
        err,
      ),
    );
  } catch (err) {
    return next(err);
  }
};

export const getAllDepartments = async (req, res, next) => {
  try {
    const departments = await prisma.department.findMany();

    res.status(200).json({
      success: true,
      message: "Get all departments successfully",
      data: departments,
    });
  } catch (err) {
    return next(err);
  }
};

export const getDepartmentById = async (req, res, next) => {
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
      message: "Get department by ID successfully",
      data: department,
    });
  } catch (err) {
    return next(err);
  }
};

export const updateDepartment = async (req, res, next) => {
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
      message: "Department updated successfully",
      data: updatedDepartment,
    });

    // Index department into the RAG system
    indexDepartment(updatedDepartment.id).catch((err) =>
      console.error(
        `[RAG] Indexing department ${updatedDepartment.id} failed:`,
        err,
      ),
    );
  } catch (err) {
    return next(err);
  }
};

export const softDeleteDepartment = async (req, res, next) => {
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

    const softDeletedDepartment = await prisma.department.update({
      where: {
        id: Number(id),
      },
      data: {
        isDeleted: true,
        isActive: false,
        updatedAt: new Date(),
      },
    });
    res.status(200).json({
      success: true,
      message: "Department soft deleted successfully",
      data: softDeletedDepartment,
    });

    // Xóa chunks liên quan đến department này trong hệ thống RAG
    deleteChunksBySource("department", softDeletedDepartment.id).catch((err) =>
      console.error(
        `[RAG] Deleting chunks for department ${softDeletedDepartment.id} failed:`,
        err,
      ),
    );
  } catch (err) {
    return next(err);
  }
};

export const hardDeleteDepartment = async (req, res, next) => {
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

    // Xóa chunks liên quan đến department này trong hệ thống RAG
    deleteChunksBySource("department", Number(id)).catch((err) =>
      console.error(
        `[RAG] Deleting chunks for department ${Number(id)} failed:`,
        err,
      ),
    );
  } catch (err) {
    return next(err);
  }
};
