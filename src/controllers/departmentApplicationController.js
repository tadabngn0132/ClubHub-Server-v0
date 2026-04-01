import { prisma } from "../libs/prisma.js";
import { getInterviewStatus } from "../utils/applicationUtil.js";

export const createDepartmentApplication = async (req, res) => {
  try {
    const deptApplicationData = req.body;

    const existingApplication = await prisma.departmentMemberApplication.findFirst({
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

    const newDeptApplication = await prisma.departmentMemberApplication.create({
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

    const deptApplications = await prisma.departmentMemberApplication.findMany({
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
    const deptApplications = await prisma.departmentMemberApplication.findMany({
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
    const deptApplication = await prisma.departmentMemberApplication.findUnique({
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

    const updatedDeptApplication = await prisma.departmentMemberApplication.update({
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

    const deletedDeptApplication = await prisma.departmentMemberApplication.update({
      where: {
        id: Number(id),
      },
      data: {
        isDeleted: true,
        interviewStatus: getInterviewStatus("pending"), // Keep interview status consistent with model field
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

    await prisma.departmentMemberApplication.delete({
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

export const createManyDepartmentApplications = async (req, res) => {
  try {
    const items = req.body?.items;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: "items array is required and cannot be empty" });
    }

    const result = await prisma.departmentMemberApplication.createMany({ data: items, skipDuplicates: true });
    res.status(201).json({ success: true, message: "Department applications createMany successful", data: result });
  } catch (err) {
    console.error("Error in createManyDepartmentApplications:", err);
    res.status(500).json({ success: false, message: `Internal server error / Create many department applications error: ${err.message}` });
  }
};

export const getManyDepartmentApplications = async (req, res) => {
  try {
    const ids = Array.isArray(req.body?.ids)
      ? req.body.ids.map((id) => Number(id)).filter((id) => Number.isFinite(id))
      : [];

    if (ids.length === 0) {
      return res.status(400).json({ success: false, message: "ids array is required and cannot be empty" });
    }

    const records = await prisma.departmentMemberApplication.findMany({ where: { id: { in: ids } } });
    res.status(200).json({ success: true, message: "Department applications getMany successful", data: records });
  } catch (err) {
    console.error("Error in getManyDepartmentApplications:", err);
    res.status(500).json({ success: false, message: `Internal server error / Get many department applications error: ${err.message}` });
  }
};

export const updateManyDepartmentApplications = async (req, res) => {
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

    const result = await prisma.departmentMemberApplication.updateMany({ where: { id: { in: ids } }, data: updateData });
    res.status(200).json({ success: true, message: "Department applications updateMany successful", data: result });
  } catch (err) {
    console.error("Error in updateManyDepartmentApplications:", err);
    res.status(500).json({ success: false, message: `Internal server error / Update many department applications error: ${err.message}` });
  }
};

export const softDeleteManyDepartmentApplications = async (req, res) => {
  try {
    const ids = Array.isArray(req.body?.ids)
      ? req.body.ids.map((id) => Number(id)).filter((id) => Number.isFinite(id))
      : [];

    if (ids.length === 0) {
      return res.status(400).json({ success: false, message: "ids array is required and cannot be empty" });
    }

    const result = await prisma.departmentMemberApplication.updateMany({
      where: { id: { in: ids } },
      data: {
        isDeleted: true,
        status: getInterviewStatus("pending"),
        updatedAt: new Date(),
      },
    });
    res.status(200).json({ success: true, message: "Department applications softDeleteMany successful", data: result });
  } catch (err) {
    console.error("Error in softDeleteManyDepartmentApplications:", err);
    res.status(500).json({ success: false, message: `Internal server error / Soft delete many department applications error: ${err.message}` });
  }
};

export const hardDeleteManyDepartmentApplications = async (req, res) => {
  try {
    const ids = Array.isArray(req.body?.ids)
      ? req.body.ids.map((id) => Number(id)).filter((id) => Number.isFinite(id))
      : [];

    if (ids.length === 0) {
      return res.status(400).json({ success: false, message: "ids array is required and cannot be empty" });
    }

    const result = await prisma.departmentMemberApplication.deleteMany({ where: { id: { in: ids } } });
    res.status(200).json({ success: true, message: "Department applications hardDeleteMany successful", data: result });
  } catch (err) {
    console.error("Error in hardDeleteManyDepartmentApplications:", err);
    res.status(500).json({ success: false, message: `Internal server error / Hard delete many department applications error: ${err.message}` });
  }
};
