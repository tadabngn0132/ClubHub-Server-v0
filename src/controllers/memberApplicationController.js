import { prisma } from "../libs/prisma.js"

export const createMemberApplication = async (req, res) => {
  try {
    const { memberInfo } = req.body;
    const application = await prisma.memberApplication.create({
      data: {
        ...memberInfo,
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

export const deleteMemberApplication = async (req, res) => {
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

export const approveMemberApplication = async (req, res) => {
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
    const user = await prisma.user.create({
      data: {
        name: application.name,
        email: application.email,
        password: application.password,
        role: "member",
      },
    });
    await prisma.memberApplication.delete({
      where: { id: Number(id) },
    });
    res.status(200).json({
      success: true,
      message: "Member application approved and user created successfully",
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Internal server error / Approve member application error: ${error.message}`,
    });
  }
};

export const rejectMemberApplication = async (req, res) => {
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
      message: "Member application rejected and deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Internal server error / Reject member application error: ${error.message}`,
    });
  }
};
