import { prisma } from "../libs/prisma.js";
import { removeSensitiveUserData } from "../utils/userUtil.js";
import {
  USER_STATUS,
  AVATAR_PROVIDERS,
  DEFAULT_PASSWORD,
  ASSIGNEE_TASK_STATUS,
} from "../utils/constant.js";
import { userIncludeOptions } from "../utils/userUtil.js";
import cloudinary from "../libs/cloudinary.js";
import { sendWelcomeEmail } from "../utils/emailUtil.js";
import {
  createUserWithPositionsService,
  updateUserWithPositionsService,
} from "../services/userService.js";
import { indexMember } from "../services/knowledgeIndexerService.js";
import { deleteChunksBySource } from "../services/documentChunkService.js";

const normalizePositionIds = (raw) => {
  if (Array.isArray(raw)) return raw;
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
};

export const createUser = async (req, res) => {
  try {
    const payload = req.body;
    const file = req.file;

    const storedUser = await prisma.user.findUnique({
      where: {
        email: payload.email,
      },
    });

    if (storedUser) {
      return res.status(400).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    if (payload.rootDepartmentId !== null && payload.rootDepartmentId !== "") {
      const department = await prisma.department.findUnique({
        where: { id: Number(payload.rootDepartmentId) },
        select: { id: true },
      });

      if (!department) {
        return res.status(400).json({
          success: false,
          message: "Root department not found",
        });
      }
    }

    if (file) {
      const base64 = `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;

      try {
        const uploadResult = await cloudinary.uploader.upload(base64, {
          folder: "clubhub/users/avatars",
          public_id: `${payload.email}_avatar_${Date.now()}`,
          resource_type: "image",
        });
        payload.avatarUrl = uploadResult.secure_url;
        payload.avatarPublicId = uploadResult.public_id;
        payload.avatarProvider = AVATAR_PROVIDERS.CLOUDINARY;
      } catch (err) {
        console.error("Error uploading image to Cloudinary:", err);
        return res.status(500).json({
          success: false,
          message: `Failed to upload avatar image: ${err.message}`,
        });
      }
    }

    const createdUser = await createUserWithPositionsService({
      ...payload,
      positionIds: normalizePositionIds(payload.positionIds),
    });

    const necessaryUserData = removeSensitiveUserData(createdUser);

    await sendWelcomeEmail(
      createdUser.email,
      createdUser.fullname,
      DEFAULT_PASSWORD,
    );

    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: necessaryUserData,
    });

    // Index member into the RAG system
    indexMember(createdUser.id).catch((err) =>
      console.error(`[RAG] Indexing member ${createdUser.id} failed:`, err),
    );
  } catch (err) {
    console.log("Error in createUser function:", err);
    res.status(500).json({
      success: false,
      message: `Internal server error / Create user error: ${err.message}`,
    });
  }
};

export const getUser = async (req, res) => {
  try {
    const { id } = req.params;

    const storedUser = await prisma.user.findUnique({
      where: {
        id: Number(id),
      },
      include: userIncludeOptions,
    });

    if (!storedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const necessaryUserData = removeSensitiveUserData(storedUser);

    res.status(200).json({
      success: true,
      message: "Get user by ID successfully",
      data: necessaryUserData,
    });
  } catch (err) {
    console.log("Error in getUser function:", err);
    res.status(500).json({
      success: false,
      message: `Internal server error / Get user error: ${err.message}`,
    });
  }
};

export const getUsers = async (req, res) => {
  try {
    const storedUsers = await prisma.user.findMany({
      include: {
        rootDepartment: {
          select: {
            id: true,
            name: true,
          },
        },
        userPosition: {
          where: { isPrimary: true },
          include: {
            position: {
              select: {
                id: true,
                title: true,
                level: true,
                systemRole: true,
                department: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    const users = storedUsers.map((user) => removeSensitiveUserData(user));

    res.status(200).json({
      success: true,
      message: "Get users successfully",
      data: users,
    });
  } catch (err) {
    console.log("Error in getUsers function:", err);
    res.status(500).json({
      success: false,
      message: `Internal server error / Get users error: ${err.message}`,
    });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const payload = req.body;
    const file = req.file;

    const storedUser = await prisma.user.findUnique({
      where: {
        id: Number(id),
      },
    });

    if (!storedUser) {
      return res.status(404).json({
        success: false,
        message: "Not found user to update",
      });
    }

    if (payload.rootDepartmentId !== null && payload.rootDepartmentId !== "") {
      const department = await prisma.department.findUnique({
        where: { id: Number(payload.rootDepartmentId) },
        select: { id: true },
      });

      if (!department) {
        return res.status(400).json({
          success: false,
          message: "Root department not found",
        });
      }
    }

    if (file) {
      const base64 = `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;

      try {
        const uploadResult = await cloudinary.uploader.upload(base64, {
          folder: "clubhub/users/avatars",
          public_id: `${payload.email}_avatar_${Date.now()}`,
          resource_type: "image",
        });
        payload.avatarUrl = uploadResult.secure_url;
        payload.avatarPublicId = uploadResult.public_id;
        payload.avatarProvider = AVATAR_PROVIDERS.CLOUDINARY;

        if (storedUser.avatarPublicId) {
          cloudinary.uploader.destroy(
            storedUser.avatarPublicId,
            (error, result) => {
              if (error) {
                console.log("Cloudinary deletion error:", error);
              } else {
                console.log("Cloudinary deletion result:", result);
              }
            },
          );
        }
      } catch (err) {
        console.error("Error uploading image to Cloudinary:", err);
        return res.status(500).json({
          success: false,
          message: `Failed to upload avatar image: ${err.message}`,
        });
      }
    }

    const updatedUser = await updateUserWithPositionsService(id, {
      ...payload,
      positionIds: normalizePositionIds(payload.positionIds),
    });

    const necessaryUserData = removeSensitiveUserData(updatedUser);

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: necessaryUserData,
    });

    // Index member into the RAG system
    indexMember(updatedUser.id).catch((err) =>
      console.error(`[RAG] Indexing member ${updatedUser.id} failed:`, err),
    );
  } catch (err) {
    console.log("Error in updateUser function:", err);
    res.status(500).json({
      success: false,
      message: `Internal server error / Update user error: ${err.message}`,
    });
  }
};

export const updateUserProfile = async (req, res) => {
  const { id } = req.params;
  const payload = req.body;
  const file = req.file;

  try {
    const storedUser = await prisma.user.findUnique({
      where: {
        id: Number(id),
      },
    });

    if (!storedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (file) {
      const base64 = `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;

      try {
        const uploadResult = await cloudinary.uploader.upload(base64, {
          folder: "clubhub/users/avatars",
          public_id: `${payload.email}_avatar_${Date.now()}`,
          resource_type: "image",
        });
        payload.avatarUrl = uploadResult.secure_url;
        payload.avatarPublicId = uploadResult.public_id;
        payload.avatarProvider = AVATAR_PROVIDERS.CLOUDINARY;

        if (storedUser.avatarPublicId) {
          cloudinary.uploader.destroy(
            storedUser.avatarPublicId,
            (error, result) => {
              if (error) {
                console.log("Cloudinary deletion error:", error);
              } else {
                console.log("Cloudinary deletion result:", result);
              }
            },
          );
        }
      } catch (err) {
        console.error("Error uploading image to Cloudinary:", err);
        return res.status(500).json({
          success: false,
          message: `Failed to upload avatar image: ${err.message}`,
        });
      }
    }

    const updatedUser = await prisma.user.update({
      where: {
        id: Number(id),
      },
      data: {
        fullname: payload.fullname,
        phoneNumber: payload.phoneNumber,
        dateOfBirth: payload.dateOfBirth ? new Date(payload.dateOfBirth) : null,
        gender: payload.gender,
        major: payload.major,
        avatarUrl: payload.avatarUrl,
        avatarPublicId: payload.avatarPublicId,
        avatarProvider: payload.avatarProvider,
        bio: payload.bio,
      },
      include: userIncludeOptions,
    });

    const necessaryUserData = removeSensitiveUserData(updatedUser);

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: necessaryUserData,
    });

    // Index member into the RAG system
    indexMember(updatedUser.id).catch((err) =>
      console.error(`[RAG] Indexing member ${updatedUser.id} failed:`, err),
    );
  } catch (err) {
    console.log("Error in updateUser function:", err);
    res.status(500).json({
      success: false,
      message: `Internal server error / Update user error: ${err.message}`,
    });
  }
};

export const softDeleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const storedUser = await prisma.user.findUnique({
      where: {
        id: Number(id),
      },
    });

    if (!storedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const deletedUser = await prisma.user.update({
      where: {
        id: Number(id),
      },
      data: {
        isDeleted: true,
        status: USER_STATUS.INACTIVE,
      },
    });

    const necessaryUserData = removeSensitiveUserData(deletedUser);

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
      data: necessaryUserData,
    });

    // Xóa chunks liên quan đến user này trong hệ thống RAG
    deleteChunksBySource("member", deletedUser.id).catch((err) =>
      console.error(
        `[RAG] Deleting chunks for member ${deletedUser.id} failed:`,
        err,
      ),
    );
  } catch (err) {
    console.log("Error in softDeleteUser function:", err);
    res.status(500).json({
      success: false,
      message: `Internal server error / Soft delete user error: ${err.message}`,
    });
  }
};

export const hardDeleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const storedUser = await prisma.user.findUnique({
      where: {
        id: Number(id),
      },
    });

    if (!storedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (storedUser.avatarPublicId) {
      cloudinary.uploader.destroy(
        storedUser.avatarPublicId,
        (error, result) => {
          if (error) {
            console.log("Cloudinary deletion error:", error);
          } else {
            console.log("Cloudinary deletion result:", result);
          }
        },
      );
    }

    const deletedUser = await prisma.user.delete({
      where: {
        id: Number(id),
      },
    });

    const necessaryUserData = removeSensitiveUserData(deletedUser);

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
      data: necessaryUserData,
    });

    // Xóa chunks liên quan đến user này trong hệ thống RAG
    deleteChunksBySource("member", deletedUser.id).catch((err) =>
      console.error(
        `[RAG] Deleting chunks for member ${deletedUser.id} failed:`,
        err,
      ),
    );
  } catch (err) {
    console.log("Error in hardDeleteUser function:", err);
    res.status(500).json({
      success: false,
      message: `Internal server error / Hard delete user error: ${err.message}`,
    });
  }
};

export const unlockAccount = async (req, res) => {
  try {
    const { id } = req.params;

    const storedUser = await prisma.user.findUnique({
      where: {
        id: Number(id),
      },
    });

    if (!storedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    await prisma.user.update({
      where: {
        id: storedUser.id,
      },
      data: {
        failedLoginAttempts: 0,
        lockedUntil: null,
      },
    });

    res.status(200).json({
      success: true,
      message: "Account unlocked successfully",
    });
  } catch (err) {
    console.log("Error in unlockAccount function", err);
    res.status(500).json({
      success: false,
      message: `Internal server error / Unlock account error: ${err.message}`,
    });
  }
};

export const getUserDashboardStats = async (req, res) => {
  try {
    const { id } = req.params;

    const storedUser = await prisma.user.findUnique({
      where: {
        id: Number(id),
      },
    });

    if (!storedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const incompleteTasks = await prisma.assigneeTask.findMany({
      where: {
        assigneeId: Number(id),
        status: {
          in: [ASSIGNEE_TASK_STATUS.PENDING, ASSIGNEE_TASK_STATUS.REJECTED],
        },
      },
      select: {
        id: true,
        status: true,
        task: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    const upcomingEvents = await prisma.activity.findMany({
      where: {
        activityParticipations: {
          some: {
            userId: Number(id),
          },
        },
        startDate: {
          gte: new Date(),
        },
      },
      select: {
        id: true,
        title: true,
        startDate: true,
        endDate: true,
      },
    });

    const recentActivities = await prisma.activity.findMany({
      where: {
        activityParticipations: {
          some: {
            userId: Number(id),
          },
        },
        endDate: {
          gte: new Date(new Date().setDate(new Date().getDate() - 30)), // Activities that ended in the last 30 days
        },
      },
      select: {
        id: true,
        title: true,
        startDate: true,
        endDate: true,
        slug: true,
      },
    });

    res.status(200).json({
      success: true,
      data: {
        incompleteTasks: incompleteTasks,
        upcomingEvents: upcomingEvents,
        recentActivities: recentActivities,
      },
    });
  } catch (err) {
    console.error("Error in getUserDashboardStats function:", err);
    res.status(500).json({
      success: false,
      message: `Internal server error / Get user dashboard stats error: ${err.message}`,
    });
  }
};
