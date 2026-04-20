import { prisma } from "../libs/prisma.js";
import {
  CV_STATUS,
  FINAL_STATUS,
  DEFAULT_PASSWORD,
  POSITION_LEVEL,
  INTERVIEW_STATUS,
  AVATAR_PROVIDERS,
} from "../utils/constant.js";
import cloudinary from "../libs/cloudinary.js";
import { removeSensitiveUserData } from "../utils/userUtil.js";
import { sendWelcomeEmail } from "../utils/emailUtil.js";
import { createUserWithPositionsService } from "../services/userService.js";
import { indexMember } from "../services/knowledgeIndexerService.js";
import { logSystemAction } from "../services/auditLogService.js";
import { AppError } from "../utils/AppError.js";

export const createMemberApplication = async (req, res, next) => {
  try {
    const applicationData = req.body;
    const file = req.file;

    if (file) {
      const base64 = `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;

      try {
        const uploadResult = await cloudinary.uploader.upload(base64, {
          folder: "clubhub/users/avatars",
          public_id: `${applicationData.email}_avatar_${Date.now()}`,
          resource_type: "image",
        });
        applicationData.avatarUrl = uploadResult.secure_url;
        applicationData.avatarPublicId = uploadResult.public_id;
        applicationData.avatarProvider = AVATAR_PROVIDERS.CLOUDINARY;
      } catch (err) {
        throw new AppError(`Failed to upload avatar image: ${err.message}`, 500);
      }
    }

    const application = await prisma.memberApplication.create({
      data: {
        fullname: applicationData.fullname,
        email: applicationData.email,
        phoneNumber: applicationData.phoneNumber,
        dateOfBirth: new Date(applicationData.dateOfBirth),
        gender: applicationData.gender,
        major: applicationData.major,
        studentId: applicationData.studentId,
        avatarUrl: applicationData.avatarUrl,
        avatarPublicId: applicationData.avatarPublicId,
        avatarProvider: applicationData.avatarProvider,
        bio: applicationData.bio,
        appliedAt: new Date(),
        cvStatus: CV_STATUS.PENDING,
        finalStatus: FINAL_STATUS.PENDING,
      },
    });
    res.status(201).json({
      success: true,
      message: "Member application created successfully",
      data: application,
    });

    void logSystemAction(req.userId ?? null, "member_application.create", {
      applicationId: application.id,
      email: application.email,
    });
  } catch (err) {
    return next(err);
  }
};

export const getMemberApplications = async (req, res, next) => {
  try {
    const applications = await prisma.memberApplication.findMany({
      include: {
        cvReviewer: true,
        finalReviewer: true,
        departmentApplications: {
          include: {
            department: true,
            interviewer: true,
          },
        },
      },
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
      where: { id: Number(id) },
      include: {
        cvReviewer: true,
        finalReviewer: true,
        departmentApplications: {
          include: {
            department: true,
            interviewer: true,
          },
        },
      },
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
        cvStatus: CV_STATUS.FAILED,
        finalStatus: FINAL_STATUS.FAILED,
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
    });
    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Member application not found",
      });
    }
    const updatedApplication = await prisma.memberApplication.update({
      where: { id: Number(id) },
      data: {
        cvStatus:
          cvReviewData.status.trim().toLowerCase() === "passed"
            ? CV_STATUS.PASSED
            : CV_STATUS.FAILED,
        cvReviewedAt: new Date(),
        cvReviewComment: cvReviewData.cvReviewComment || "",
        cvReviewerId: cvReviewData.cvReviewerId,
      },
    });
    res.status(200).json({
      success: true,
      message: "Member application CV review detail updated successfully",
      data: updatedApplication,
    });

    void logSystemAction(req.userId ?? cvReviewData.cvReviewerId ?? null, "member_application.cv_review", {
      applicationId: updatedApplication.id,
      status: updatedApplication.cvStatus,
    });
  } catch (err) {
    return next(err);
  }
};

export const updateMemberApplicationFinalReviewDetail = async (req, res, next) => {
  try {
    const { id } = req.params;
    const finalReviewData = req.body;

    const application = await prisma.memberApplication.findUnique({
      where: { id: Number(id) },
      include: {
        departmentApplications: {
          where: {
            interviewStatus: INTERVIEW_STATUS.PASSED,
            isDeleted: false,
          },
          select: {
            departmentId: true,
            priority: true,
          },
        },
      },
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Member application not found",
      });
    }

    let createdUser = null;

    const finalApplicationResult = await prisma.$transaction(async (tx) => {
      const passedDeptIds = application.departmentApplications.map(
        (deptApp) => deptApp.departmentId,
      );

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

      createdUser = await createUserWithPositionsService({
        ...finalReviewData,
        positionIds,
      });

      await sendWelcomeEmail(
        createdUser.email,
        createdUser.fullname,
        DEFAULT_PASSWORD,
      );

      const updatedApplication = await tx.memberApplication.update({
        where: { id: Number(id) },
        data: {
          finalStatus:
            finalReviewData.status.trim().toLowerCase() === "passed"
              ? FINAL_STATUS.PASSED
              : FINAL_STATUS.FAILED,
          finalReviewedAt: new Date(),
          finalReviewComment: finalReviewData.finalReviewComment || "",
          finalReviewerId: finalReviewData.finalReviewerId,
        },
      });

      return updatedApplication;
    });

    res.status(200).json({
      success: true,
      message: "Member application final review detail updated successfully",
      data: finalApplicationResult,
    });

    void logSystemAction(req.userId ?? finalReviewData.finalReviewerId ?? null, "member_application.final_review", {
      applicationId: finalApplicationResult.id,
      status: finalApplicationResult.finalStatus,
      createdUserId: createdUser?.id ?? null,
    });

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
