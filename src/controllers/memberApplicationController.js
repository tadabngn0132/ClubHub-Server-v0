import { prisma } from "../libs/prisma.js";
import {
  hashedDefaultPassword,
  userIncludeOptions,
} from "../utils/userUtil.js";
import {
  CV_STATUS,
  FINAL_STATUS,
  PROVIDER,
} from "../utils/constant.js";

export const createMemberApplication = async (req, res) => {
  // TODO: Implement file upload handling for CV and avatar, and save the file URLs in the database
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
  } catch (err) {
    console.error("Error in createMemberApplication function:", err);
    res.status(500).json({
      success: false,
      message: `Internal server error / Create member application error: ${err.message}`,
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
  } catch (err) {
    console.error("Error in getMemberApplications function:", err);
    res.status(500).json({
      success: false,
      message: `Internal server error / Get member applications error: ${err.message}`,
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
  } catch (err) {
    console.error("Error in getMemberApplicationById function:", err);
    res.status(500).json({
      success: false,
      message: `Internal server error / Get member application by ID error: ${err.message}`,
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
  } catch (err) {
    console.error("Error in softDeleteMemberApplication function:", err);
    res.status(500).json({
      success: false,
      message: `Internal server error / Delete member application error: ${err.message}`,
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
  } catch (err) {
    console.error("Error in hardDeleteMemberApplication function:", err);
    res.status(500).json({
      success: false,
      message: `Internal server error / Delete member application error: ${err.message}`,
    });
  }
};

export const updateMemberApplicationCVReviewDetail = async (req, res) => {
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
        cvReviewedAt: new Date(),
        cvReviewComment: cvReviewData.cvReviewComment || "",
        cvReviewerId: cvReviewData.cvReviewerId,
      },
    });
    res.status(200).json({
      success: true,
      message: "Member application CV review detail updated successfully",
    });
  } catch (err) {
    console.error(
      "Error in updateMemberApplicationCVReviewDetail function:",
      err,
    );
    res.status(500).json({
      success: false,
      message: `Internal server error / Update member application CV review detail error: ${err.message}`,
    });
  }
};

export const updateMemberApplicationFinalReviewDetail = async (req, res) => {
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
          finalReviewedAt: new Date(),
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
      message: "Member application final review detail updated successfully",
      data: createdUser,
    });
  } catch (err) {
    console.error(
      "Error in updateMemberApplicationFinalReviewDetail function:",
      err,
    );
    res.status(500).json({
      success: false,
      message: `Internal server error / Update member application final review detail error: ${err.message}`,
    });
  }
};
