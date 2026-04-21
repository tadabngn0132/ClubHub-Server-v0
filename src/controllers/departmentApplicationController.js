import { prisma } from "../libs/prisma.js";
import { getInterviewStatus } from "../utils/applicationUtil.js";
import { logSystemAction } from "../services/auditLogService.js";
import { BadRequestError, NotFoundError } from "../utils/AppError.js";
import { sendDepartmentInterviewResultEmail } from "../utils/emailUtil.js";

export const getDepartmentApplicationsByMemberApplicationId = async (
  req,
  res,
) => {
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
};

export const getDepartmentApplications = async (req, res) => {
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
};

export const getDepartmentApplicationById = async (req, res) => {
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
      throw new NotFoundError("Department application not found.");
    }

    res.status(200).json({
      success: true,
      message: "Department application retrieved successfully.",
      data: deptApplication,
    });
};

export const updateDepartmentApplication = async (req, res) => {
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
      include: {
        memberApplication: {
          select: {
            email: true,
            fullname: true,
          },
        },
        department: {
          select: {
            name: true,
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      message: "Department application updated successfully.",
      data: updatedDeptApplication,
    });

    void logSystemAction(req.userId ?? updatedDeptApplication.interviewerId ?? null, "department_application.update", {
      departmentApplicationId: updatedDeptApplication.id,
      interviewStatus: updatedDeptApplication.interviewStatus,
    });

    await sendDepartmentInterviewResultEmail(
      updatedDeptApplication.memberApplication.email,
      updatedDeptApplication.memberApplication.fullname,
      updatedDeptApplication.department.name,
      updatedDeptApplication.interviewStatus,
      updatedDeptApplication.interviewComment || "",
    ).catch(console.error);
};

export const softDeleteDepartmentApplication = async (req, res) => {
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

    void logSystemAction(req.userId ?? deletedDeptApplication.interviewerId ?? null, "department_application.soft_delete", {
      departmentApplicationId: deletedDeptApplication.id,
    });
};

export const hardDeleteDepartmentApplication = async (req, res) => {
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

    void logSystemAction(req.userId ?? null, "department_application.hard_delete", {
      departmentApplicationId: Number(id),
    });
};
