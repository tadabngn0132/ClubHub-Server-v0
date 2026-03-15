import { prisma } from "../libs/prisma.js";
import { getInterviewStatus } from "../utils/applicationUtil.js";

export const createDepartmentApplication = async (req, res) => {
  try {
    const deptApplicationData = req.body;

    const existingApplication = await prisma.departmentApplication.findFirst({
      where: {
        memberApplicationId: deptApplicationData.memberApplicationId,
        departmentId: deptApplicationData.departmentId,
      },
    });

    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: "You have already applied to this department.",
      });
    }

    const newDeptApplication = await prisma.departmentApplication.create({
      data: {
        memberApplicationId: deptApplicationData.memberApplicationId,
        departmentId: deptApplicationData.departmentId,
        interviewStatus: getInterviewStatus(
          deptApplicationData.interviewStatus.trim().toLowerCase(),
        ),
        priority: deptApplicationData.priority,
        interviewedAt: deptApplicationData.interviewedAt
          ? new Date(deptApplicationData.interviewedAt)
          : null,
        interviewerId: deptApplicationData.interviewerId,
        interviewComment: deptApplicationData.interviewComment,
      },
    });

    res.status(201).json({
      success: true,
      message: "Department application created successfully.",
      data: newDeptApplication,
    });
  } catch (err) {
    console.error("Error creating department application:", err);
    res.status(500).json({
      success: false,
      message: `Internal server error / Create department application error: ${err.message}`,
    });
  }
};

export const getDepartmentApplicationsByMemberApplicationId = async (
  req,
  res,
) => {
  try {
    const { memberApplicationId } = req.params;

    const deptApplications = await prisma.departmentApplication.findMany({
      where: {
        memberApplicationId: Number(memberApplicationId),
      },
      include: {
        department: true,
        interviewer: true,
      },
    });

    res.status(200).json({
      success: true,
      message: "Department applications retrieved successfully.",
      data: deptApplications,
    });
  } catch (err) {
    console.error("Error retrieving department applications:", err);
    res.status(500).json({
      success: false,
      message: `Internal server error / Get department applications error: ${err.message}`,
    });
  }
};

export const getDepartmentApplications = async (req, res) => {
  try {
    const deptApplications = await prisma.departmentApplication.findMany({
      include: {
        department: true,
        interviewer: true,
      },
    });
    res.status(200).json({
      success: true,
      message: "All department applications retrieved successfully.",
      data: deptApplications,
    });
  } catch (err) {
    console.error("Error retrieving all department applications:", err);
    res.status(500).json({
      success: false,
      message: `Internal server error / Get all department applications error: ${err.message}`,
    });
  }
};

export const getDepartmentApplicationById = async (req, res) => {
  try {
    const { id } = req.params;
    const deptApplication = await prisma.departmentApplication.findUnique({
      where: {
        id: Number(id),
      },
      include: {
        department: true,
        interviewer: true,
      },
    });

    if (!deptApplication) {
      return res.status(404).json({
        success: false,
        message: "Department application not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Department application retrieved successfully.",
      data: deptApplication,
    });
  } catch (err) {
    console.error("Error retrieving department application by ID:", err);
    res.status(500).json({
      success: false,
      message: `Internal server error / Get department application by ID error: ${err.message}`,
    });
  }
};

export const updateDepartmentApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const updatedDeptApplication = await prisma.departmentApplication.update({
      where: {
        id: Number(id),
      },
      data: {
        interviewStatus: getInterviewStatus(
          updateData.interviewStatus.trim().toLowerCase(),
        ),
        priority: updateData.priority,
        interviewedAt: updateData.interviewedAt
          ? new Date(updateData.interviewedAt)
          : null,
        interviewerId: updateData.interviewerId,
        interviewComment: updateData.interviewComment,
      },
    });

    res.status(200).json({
      success: true,
      message: "Department application updated successfully.",
      data: updatedDeptApplication,
    });
  } catch (err) {
    console.error("Error updating department application:", err);
    res.status(500).json({
      success: false,
      message: `Internal server error / Update department application error: ${err.message}`,
    });
  }
};

export const softDeleteDepartmentApplication = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedDeptApplication = await prisma.departmentApplication.update({
      where: {
        id: Number(id),
      },
      data: {
        status: getInterviewStatus("pending"), // Set to pending or any default status to indicate soft deletion
        updatedAt: new Date(),
      },
    });

    res.status(200).json({
      success: true,
      message: "Department application soft deleted successfully.",
      data: deletedDeptApplication,
    });
  } catch (err) {
    console.error("Error soft deleting department application:", err);
    res.status(500).json({
      success: false,
      message: `Internal server error / Soft delete department application error: ${err.message}`,
    });
  }
};

export const hardDeleteDepartmentApplication = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.departmentApplication.delete({
      where: {
        id: Number(id),
      },
    });

    res.status(200).json({
      success: true,
      message: "Department application hard deleted successfully.",
    });
  } catch (err) {
    console.error("Error hard deleting department application:", err);
    res.status(500).json({
      success: false,
      message: `Internal server error / Hard delete department application error: ${err.message}`,
    });
  }
};
