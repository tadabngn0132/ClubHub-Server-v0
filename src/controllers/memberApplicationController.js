import { prisma } from "../libs/prisma.js";
import {
  hashedDefaultPassword,
  userIncludeOptions,
} from "../utils/userUtil.js";
import {
  CV_STATUS,
  FINAL_STATUS,
  INTERVIEW_STATUS,
  PROVIDER,
} from "../utils/constant.js";

export const createMemberApplication = async (req, res) => {
  try {
    const applicationData = req.body;
    const application = await prisma.memberApplication.create({
      data: {
        fullname: applicationData.fullname,
        email: applicationData.email,
        phoneNumber: applicationData.phoneNumber,
        dateOfBirth: applicationData.dateOfBirth,
        gender: applicationData.gender,
        major: applicationData.major,
        studentId: applicationData.studentId,
        avatarUrl: applicationData.avatarUrl,
        bio: applicationData.bio,
        rootDepartmentId: applicationData.rootDepartmentId,
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
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Internal server error / Create member application error: ${error.message}`,
    });
  }
};

export const getMemberApplications = async (req, res) => {
  try {
    const applications = await prisma.memberApplication.findMany();
    res.status(200).json({
      success: true,
      message: "Get all member applications successfully",
      data: applications,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Internal server error / Get member applications error: ${error.message}`,
    });
  }
};

export const getMemberApplicationById = async (req, res) => {
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
    res.status(200).json({
      success: true,
      message: "Get member application by ID successfully",
      data: application,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Internal server error / Get member application by ID error: ${error.message}`,
    });
  }
};

export const softDeleteMemberApplication = async (req, res) => {
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
        cvStatus: CV_STATUS.FAILED,
        finalStatus: FINAL_STATUS.FAILED,
      },
    });
    res.status(200).json({
      success: true,
      message: "Member application deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Internal server error / Delete member application error: ${error.message}`,
    });
  }
};

export const hardDeleteMemberApplication = async (req, res) => {
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
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Internal server error / Delete member application error: ${error.message}`,
    });
  }
};

export const createMemberApplicationCVReviewDetail = async (req, res) => {
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
    await prisma.memberApplication.update({
      where: { id: Number(id) },
      data: {
        cvStatus:
          cvReviewData.status.trim().toLowerCase() === "passed"
            ? CV_STATUS.PASSED
            : CV_STATUS.FAILED,
        cvReviewAt: new Date(),
        cvReviewComment: cvReviewData.cvReviewComment || "",
        cvReviewerId: cvReviewData.cvReviewerId,
      },
    });
    res.status(200).json({
      success: true,
      message: "Member application CV review detail created successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Internal server error / Create member application CV review detail error: ${error.message}`,
    });
  }
};

export const createMemberApplicationInterviewDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const interviewReviewData = req.body;
    const application = await prisma.memberApplication.findUnique({
      where: { id: Number(id) },
    });
    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Member application not found",
      });
    }
    await prisma.departmentMemberApplication.updateMany({
      where: { memberApplicationId: Number(id) },
      data: {
        interviewStatus:
          interviewReviewData.status.trim().toLowerCase() === "passed"
            ? INTERVIEW_STATUS.PASSED
            : INTERVIEW_STATUS.FAILED,
        interviewAt: new Date(),
        interviewComment: interviewReviewData.interviewComment || "",
        interviewerId: interviewReviewData.interviewerId,
      },
    });
    res.status(200).json({
      success: true,
      message: "Member application interview detail created successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Internal server error / Create member application interview detail error: ${error.message}`,
    });
  }
};

export const createMemberApplicationFinalReviewDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const finalReviewData = req.body;

    const application = await prisma.memberApplication.findUnique({
      where: { id: Number(id) },
    });
    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Member application not found",
      });
    }

    const createdUser = await prisma.$transaction(async (prisma) => {
      const newUser = await prisma.user.create({
        data: {
          fullname: finalReviewData.fullname,
          email: finalReviewData.email,
          hashedPassword: await hashedDefaultPassword(),
          provider: PROVIDER.LOCAL,
          phoneNumber: finalReviewData.phoneNumber,
          dateOfBirth: finalReviewData.dateOfBirth,
          gender: finalReviewData.gender,
          major: finalReviewData.major,
          studentId: finalReviewData.studentId,
          avatarUrl: finalReviewData.avatarUrl,
          bio: finalReviewData.bio,
          rootDepartmentId: finalReviewData.rootDepartmentId,
        },
      });
      await prisma.memberApplication.update({
        where: { id: Number(id) },
        data: {
          finalStatus:
            finalReviewData.status.trim().toLowerCase() === "passed"
              ? FINAL_STATUS.PASSED
              : FINAL_STATUS.FAILED,
          finalReviewAt: new Date(),
          finalReviewComment: finalReviewData.finalReviewComment || "",
          finalReviewerId: finalReviewData.finalReviewerId,
        },
      });
      await prisma.userPosition.create({
        data: {
          userId: newUser.id,
          positionId: Number(finalReviewData.positionId),
          isPrimary: true,
        },
      });
      return prisma.user.findUnique({
        where: { id: newUser.id },
        include: userIncludeOptions,
      });
    });

    res.status(200).json({
      success: true,
      message: "Member application final review detail created successfully",
      data: createdUser,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Internal server error / Create member application final review detail error: ${error.message}`,
    });
  }
};
