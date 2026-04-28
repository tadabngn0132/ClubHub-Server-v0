import { prisma } from "../libs/prisma.js";
import {
  CV_STATUS,
  FINAL_STATUS,
  DEFAULT_PASSWORD,
  POSITION_LEVEL,
  INTERVIEW_STATUS,
  AVATAR_PROVIDERS,
  MEMBER_APPLICATION_STATE,
} from "../utils/constant.js";
import cloudinary from "../libs/cloudinary.js";
import {
  sendWelcomeEmail,
  sendApplicationReviewResultEmail,
} from "../utils/emailUtil.js";
import { createUserWithPositionsService } from "../services/userService.js";
import { indexMember } from "../services/knowledgeIndexerService.js";
import { logSystemAction } from "../services/auditLogService.js";
import { createNotificationSafe } from "../services/notificationService.js";
import { AppError, BadRequestError } from "../utils/AppError.js";
import { withSoftDeleteFilter } from "../utils/queryUtil.js";

const memberApplicationIncludeOptions = {
  cvReview: {
    include: {
      reviewer: {
        select: {
          id: true,
          fullname: true,
          email: true,
          avatarUrl: true,
        },
      },
    },
  },
  departmentInterviews: {
    include: {
      interviewer: {
        select: {
          id: true,
          fullname: true,
          email: true,
          avatarUrl: true,
        },
      },
      department: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  },
  finalReview: {
    include: {
      reviewer: {
        select: {
          id: true,
          fullname: true,
          email: true,
          avatarUrl: true,
        },
      },
    },
  },
};

export const createMemberApplication = async (req, res, next) => {
  try {
    const applicationData = req.body;
    const file = req.file;
    const rootDepartmentId = Number(applicationData.rootDepartmentId);
    const selectedDepartmentIds = Array.isArray(applicationData.departmentIds)
      ? [
          ...new Set(
            applicationData.departmentIds
              .map((id) => Number(id))
              .filter((id) => Number.isInteger(id) && id > 0),
          ),
        ]
      : [];

    if (!Number.isInteger(rootDepartmentId) || rootDepartmentId <= 0) {
      throw new BadRequestError("Main department is required");
    }

    const departmentInterviewIds = [
      ...new Set([rootDepartmentId, ...selectedDepartmentIds]),
    ];

    if (file) {
      const base64 = `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;

      try {
        const uploadResult = await cloudinary.uploader.upload(base64, {
          folder: "clubhub/applications/avatars",
          public_id: `${applicationData.email}_avatar_${Date.now()}`,
          resource_type: "image",
        });
        applicationData.avatarUrl = uploadResult.secure_url;
        applicationData.avatarPublicId = uploadResult.public_id;
        applicationData.avatarProvider = AVATAR_PROVIDERS.CLOUDINARY;
      } catch (err) {
        throw new AppError(
          `Failed to upload avatar image: ${err.message}`,
          500,
        );
      }
    }

    const newApplication = await prisma.$transaction(async (tx) => {
      const application = await tx.memberApplication.create({
        data: {
          fullname: applicationData.fullname,
          email: applicationData.email,
          phoneNumber: applicationData.phoneNumber,
          dateOfBirth: new Date(applicationData.dateOfBirth),
          gender: applicationData.gender,
          major: applicationData.major,
          studentId: applicationData.studentId,
          rootDepartmentId: rootDepartmentId,
          avatarUrl: applicationData.avatarUrl,
          avatarPublicId: applicationData.avatarPublicId,
          avatarProvider: applicationData.avatarProvider,
          appliedAt: new Date(),
          state: MEMBER_APPLICATION_STATE.SUBMITTED,
        },
      });

      await tx.cVReview.create({
        data: {
          memberApplicationId: application.id,
          status: CV_STATUS.PENDING,
        },
      });

      await tx.departmentInterview.createMany({
        data: departmentInterviewIds.map((deptId) => ({
          memberApplicationId: application.id,
          departmentId: deptId,
          status: INTERVIEW_STATUS.PENDING,
        })),
      });

      await tx.finalReview.create({
        data: {
          memberApplicationId: application.id,
          status: FINAL_STATUS.PENDING,
        },
      });

      return await tx.memberApplication.findUnique({
        where: { id: application.id },
        include: memberApplicationIncludeOptions,
      });
    });

    res.status(201).json({
      success: true,
      message: "Member application created successfully",
      data: newApplication,
    });

    void logSystemAction(req.userId ?? null, "member_application.create", {
      applicationId: newApplication.id,
      email: newApplication.email,
    });
  } catch (err) {
    return next(err);
  }
};

export const getMemberApplications = async (req, res, next) => {
  try {
    const applications = await prisma.memberApplication.findMany({
      include: memberApplicationIncludeOptions,
      where: { ...withSoftDeleteFilter(req.userRole) },
    });
    res.status(200).json({
      success: true,
      message: "Get all member applications successfully",
      data: applications,
    });
  } catch (err) {
    return next(err);
  }
};

export const getMemberApplicationById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const application = await prisma.memberApplication.findUnique({
      where: { id: Number(id), ...withSoftDeleteFilter(req.userRole) },
      include: memberApplicationIncludeOptions,
    });
    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Member application not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "Get member application by ID successfully",
      data: application,
    });
  } catch (err) {
    return next(err);
  }
};

export const softDeleteMemberApplication = async (req, res, next) => {
  try {
    const { id } = req.params;
    const application = await prisma.memberApplication.findUnique({
      where: { id: Number(id) },
      include: memberApplicationIncludeOptions,
    });
    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Member application not found",
      });
    }
    await prisma.memberApplication.update({
      where: { id: Number(id) },
      data: {
        isDeleted: true,
      },
    });
    res.status(200).json({
      success: true,
      message: "Member application deleted successfully",
    });
  } catch (err) {
    return next(err);
  }
};

export const hardDeleteMemberApplication = async (req, res, next) => {
  try {
    const { id } = req.params;
    const application = await prisma.memberApplication.findUnique({
      where: { id: Number(id) },
      include: memberApplicationIncludeOptions,
    });
    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Member application not found",
      });
    }
    await prisma.memberApplication.delete({
      where: { id: Number(id) },
    });
    res.status(200).json({
      success: true,
      message: "Member application deleted successfully",
    });
  } catch (err) {
    return next(err);
  }
};

export const updateMemberApplicationCVReviewDetail = async (req, res, next) => {
  try {
    const { id } = req.params;
    const cvReviewData = req.body;
    const application = await prisma.memberApplication.findUnique({
      where: { id: Number(id) },
      include: memberApplicationIncludeOptions,
    });
    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Member application not found",
      });
    }
    const updatedApplication = await prisma.$transaction(async (tx) => {
      await tx.memberApplication.update({
        where: { id: Number(id) },
        data: {
          state:
            cvReviewData.status.trim().toLowerCase() === "passed"
              ? MEMBER_APPLICATION_STATE.CV_PASSED
              : MEMBER_APPLICATION_STATE.CV_FAILED,
        },
      });

      await tx.cvReview.update({
        where: { memberApplicationId: Number(id) },
        data: {
          status:
            cvReviewData.status.trim().toLowerCase() === "passed"
              ? CV_STATUS.PASSED
              : CV_STATUS.FAILED,
          reviewerId: cvReviewData.cvReviewerId,
          comment: cvReviewData.cvReviewComment || "",
          reviewedAt: new Date(),
        },
      });

      return await tx.memberApplication.findUnique({
        where: { id: Number(id) },
        include: memberApplicationIncludeOptions,
      });
    });

    res.status(200).json({
      success: true,
      message: "Member application CV review detail updated successfully",
      data: updatedApplication,
    });

    void logSystemAction(
      req.userId ?? cvReviewData.cvReviewerId ?? null,
      "member_application.cv_review",
      {
        applicationId: updatedApplication.id,
        status: updatedApplication.cvReview.status,
      },
    );

    if (updatedApplication.state === MEMBER_APPLICATION_STATE.CV_PASSED) {
      void createNotificationSafe({
        userId: updatedApplication.finalReview.reviewerId,
        type: "SYSTEM",
        message: `A member application is ready for department interview (Application #${updatedApplication.id}).`,
      });
    }

    await sendApplicationReviewResultEmail(
      updatedApplication.email,
      updatedApplication.fullname,
      "CV",
      updatedApplication.cvReview.status,
      updatedApplication.cvReview.comment || "",
    ).catch(console.error);
  } catch (err) {
    return next(err);
  }
};

export const updateMemberApplicationDepartmentInterviewDetail = async (
  req,
  res,
  next,
) => {
  try {
    const { id } = req.params;
    const interviewData = req.body;

    const application = await prisma.memberApplication.findUnique({
      where: { id: Number(id) },
      include: memberApplicationIncludeOptions,
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Member application not found",
      });
    }

    const updatedApplication = await prisma.$transaction(async (tx) => {
      await tx.departmentInterview.update({
        where: {
          memberApplicationId_departmentId: {
            memberApplicationId: Number(id),
            departmentId: interviewData.departmentId,
          },
        },
        data: {
          status:
            interviewData.status.trim().toLowerCase() === "passed"
              ? INTERVIEW_STATUS.PASSED
              : INTERVIEW_STATUS.FAILED,
          interviewerId: interviewData.interviewerId,
          comment: interviewData.interviewComment || "",
          interviewedAt: new Date(),
        },
      });

      const allInterviews = await tx.departmentInterview.findMany({
        where: { memberApplicationId: Number(id) },
      });

      const hasPassedInterview = allInterviews.some(
        (interview) => interview.status === INTERVIEW_STATUS.PASSED,
      );
      const allFailedInterview = allInterviews.every(
        (interview) => interview.status === INTERVIEW_STATUS.FAILED,
      );

      if (allFailedInterview) {
        await tx.memberApplication.update({
          where: { id: Number(id) },
          data: {
            state: MEMBER_APPLICATION_STATE.DEPARTMENT_INTERVIEW_FAILED,
          },
        });
      }

      if (hasPassedInterview && !allFailedInterview) {
        await tx.memberApplication.update({
          where: { id: Number(id) },
          data: {
            state: MEMBER_APPLICATION_STATE.FINAL_PENDING,
          },
        });
      }

      return await tx.memberApplication.findUnique({
        where: { id: Number(id) },
        include: memberApplicationIncludeOptions,
      });
    });

    res.status(200).json({
      success: true,
      message:
        "Member application department interview detail updated successfully",
      data: updatedApplication,
    });

    void logSystemAction(
      req.userId ?? interviewData.interviewerId ?? null,
      "member_application.department_interview",
      {
        applicationId: updatedApplication.id,
        departmentId: interviewData.departmentId,
        status: updatedApplication.departmentInterviews.find(
          (interview) => interview.departmentId === interviewData.departmentId,
        )?.status,
      },
    );

    await sendApplicationReviewResultEmail(
      application.email,
      application.fullname,
      "DEPARTMENT_INTERVIEW",
      interviewData.status.trim().toLowerCase() === "passed"
        ? INTERVIEW_STATUS.PASSED
        : INTERVIEW_STATUS.FAILED,
      interviewData.interviewComment || "",
    ).catch(console.error);
  } catch (err) {
    return next(err);
  }
};

export const updateMemberApplicationFinalReviewDetail = async (
  req,
  res,
  next,
) => {
  try {
    const { id } = req.params;
    const finalReviewData = req.body;

    const application = await prisma.memberApplication.findUnique({
      where: { id: Number(id) },
      include: memberApplicationIncludeOptions,
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Member application not found",
      });
    }

    let createdUser = null;

    const finalApplicationResult = await prisma.$transaction(async (tx) => {
      if (finalReviewData.status.trim().toLowerCase() === "passed") {
        const passedDeptIds = application.departmentInterviews
          .filter((interview) => interview.status === INTERVIEW_STATUS.PASSED)
          .map((interview) => interview.departmentId);

        const memberPositions = await tx.position.findMany({
          where: {
            departmentId: {
              in: passedDeptIds,
            },
            level: POSITION_LEVEL.MEMBER,
            isDeleted: false,
          },
          select: {
            id: true,
            level: true,
            departmentId: true,
          },
        });

        const positionIds = memberPositions.map((pos) => pos.id);

        const highestPriorityPassedDeptId = application.departmentInterviews
          .filter((interview) => interview.status === INTERVIEW_STATUS.PASSED)
          .sort((a, b) => a.priority - b.priority)[0]?.departmentId;

        let rootDepartmentId;

        if (passedDeptIds.includes(application.rootDepartmentId)) {
          rootDepartmentId = application.rootDepartmentId;
        } else if (highestPriorityPassedDeptId) {
          rootDepartmentId = highestPriorityPassedDeptId;
        } else {
          rootDepartmentId = passedDeptIds[0];
        }

        createdUser = await createUserWithPositionsService(
          {
            ...finalReviewData,
            rootDepartmentId: rootDepartmentId,
            positionIds,
          },
          tx,
        );
      }

      await tx.memberApplication.update({
        where: { id: Number(id) },
        data: {
          state:
            finalReviewData.status.trim().toLowerCase() === "passed"
              ? MEMBER_APPLICATION_STATE.FINAL_PASSED
              : MEMBER_APPLICATION_STATE.FINAL_FAILED,
        },
      });

      await tx.finalReview.update({
        where: { memberApplicationId: Number(id) },
        data: {
          status:
            finalReviewData.status.trim().toLowerCase() === "passed"
              ? FINAL_STATUS.PASSED
              : FINAL_STATUS.FAILED,
          reviewerId: finalReviewData.finalReviewerId,
          comment: finalReviewData.finalReviewComment || "",
          reviewedAt: new Date(),
        },
      });

      return await tx.memberApplication.findUnique({
        where: { id: Number(id) },
        include: memberApplicationIncludeOptions,
      });
    });

    if (finalApplicationResult.finalReview.status === FINAL_STATUS.PASSED) {
      void sendWelcomeEmail(
        createdUser.email,
        createdUser.fullname,
        DEFAULT_PASSWORD,
      ).catch(console.error);
    }

    res.status(200).json({
      success: true,
      message: "Member application final review detail updated successfully",
      data: finalApplicationResult,
    });

    void logSystemAction(
      req.userId ?? finalReviewData.finalReviewerId ?? null,
      "member_application.final_review",
      {
        applicationId: finalApplicationResult.id,
        status: finalApplicationResult.finalReview.status,
        createdUserId: createdUser?.id ?? null,
      },
    );

    if (createdUser?.id) {
      void createNotificationSafe({
        userId: createdUser.id,
        type: "SYSTEM",
        message:
          finalApplicationResult.finalReview.status === FINAL_STATUS.PASSED
            ? "Congratulations! Your membership application has been approved."
            : "Your membership application has been reviewed.",
      });
    }

    await sendApplicationReviewResultEmail(
      application.email,
      application.fullname,
      "FINAL",
      finalApplicationResult.finalReview.status,
      finalApplicationResult.finalReview.comment || "",
    ).catch(console.error);

    // Index the new member into the RAG system
    if (createdUser?.id) {
      indexMember(createdUser.id).catch((err) =>
        console.error(
          `[RAG] Indexing member ${createdUser.id} after application approval failed:`,
          err,
        ),
      );
    }
  } catch (err) {
    return next(err);
  }
};

export const withdrawMemberApplication = async (req, res, next) => {
  try {
    const { id } = req.params;

    const application = await prisma.memberApplication.findUnique({
      where: { id: Number(id) },
      include: memberApplicationIncludeOptions,
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Member application not found",
      });
    }

    if (application.state === MEMBER_APPLICATION_STATE.FINAL_PASSED) {
      return res.status(400).json({
        success: false,
        message: "Cannot withdraw an application that has been approved",
      });
    }

    await prisma.memberApplication.update({
      where: { id: Number(id) },
      data: {
        state: MEMBER_APPLICATION_STATE.WITHDRAWN,
      },
    });

    res.status(200).json({
      success: true,
      message: "Member application withdrawn successfully",
    });

    void logSystemAction(req.userId ?? null, "member_application.withdraw", {
      applicationId: application.id,
    });
  } catch (err) {
    return next(err);
  }
};
