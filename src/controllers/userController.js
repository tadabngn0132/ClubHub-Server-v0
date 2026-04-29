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
import {
  sendWelcomeEmail,
  sendAccountUnlockedEmail,
} from "../utils/emailUtil.js";
import {
  createUserWithPositionsService,
  updateUserWithPositionsService,
} from "../services/userService.js";
import { indexMember } from "../services/knowledgeIndexerService.js";
import { deleteChunksBySource } from "../services/documentChunkService.js";
import { logSystemAction } from "../services/auditLogService.js";
import { createNotificationSafe } from "../services/notificationService.js";
import { AppError } from "../utils/AppError.js";
import { withSoftDeleteFilter } from "../utils/queryUtil.js";

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

export const createUser = async (req, res, next) => {
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
        throw new AppError(
          `Failed to upload avatar image: ${err.message}`,
          500,
        );
      }
    }

    const createdUser = await prisma.$transaction(async (tx) => {
      const user = await createUserWithPositionsService(
        {
          ...payload,
          positionIds: normalizePositionIds(payload.positionIds),
        },
        tx,
      );

      return user;
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

    void logSystemAction(createdUser.id, "user.create", {
      targetUserId: createdUser.id,
      email: createdUser.email,
    });

    void createNotificationSafe({
      userId: createdUser.id,
      type: "SYSTEM",
      message: "Your account has been created successfully.",
    });

    // Index member into the RAG system
    indexMember(createdUser.id).catch((err) =>
      console.error(`[RAG] Indexing member ${createdUser.id} failed:`, err),
    );
  } catch (err) {
    return next(err);
  }
};

export const getUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    const storedUser = await prisma.user.findUnique({
      where: {
        id: Number(id),
        ...withSoftDeleteFilter(req.userRole),
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
    return next(err);
  }
};

export const getUsers = async (req, res, next) => {
  try {
    const storedUsers = await prisma.user.findMany({
      where: { ...withSoftDeleteFilter(req.userRole) },
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
    return next(err);
  }
};

export const updateUser = async (req, res, next) => {
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
        throw new AppError(
          `Failed to upload avatar image: ${err.message}`,
          500,
        );
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

    void logSystemAction(updatedUser.id, "user.update", {
      targetUserId: updatedUser.id,
      email: updatedUser.email,
    });

    // Index member into the RAG system
    indexMember(updatedUser.id).catch((err) =>
      console.error(`[RAG] Indexing member ${updatedUser.id} failed:`, err),
    );
  } catch (err) {
    return next(err);
  }
};

export const updateUserProfile = async (req, res, next) => {
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
        throw new AppError(
          `Failed to upload avatar image: ${err.message}`,
          500,
        );
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

    void logSystemAction(updatedUser.id, "user.update_profile", {
      targetUserId: updatedUser.id,
      email: updatedUser.email,
    });

    // Index member into the RAG system
    indexMember(updatedUser.id).catch((err) =>
      console.error(`[RAG] Indexing member ${updatedUser.id} failed:`, err),
    );
  } catch (err) {
    return next(err);
  }
};

export const softDeleteUser = async (req, res, next) => {
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
      },
    });

    const necessaryUserData = removeSensitiveUserData(deletedUser);

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
      data: necessaryUserData,
    });

    void logSystemAction(req.userId ?? Number(id), "user.soft_delete", {
      targetUserId: Number(id),
    });

    // Xóa chunks liên quan đến user này trong hệ thống RAG
    deleteChunksBySource("member", deletedUser.id).catch((err) =>
      console.error(
        `[RAG] Deleting chunks for member ${deletedUser.id} failed:`,
        err,
      ),
    );
  } catch (err) {
    return next(err);
  }
};

export const hardDeleteUser = async (req, res, next) => {
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

    void logSystemAction(req.userId ?? Number(id), "user.hard_delete", {
      targetUserId: Number(id),
    });

    // Xóa chunks liên quan đến user này trong hệ thống RAG
    deleteChunksBySource("member", deletedUser.id).catch((err) =>
      console.error(
        `[RAG] Deleting chunks for member ${deletedUser.id} failed:`,
        err,
      ),
    );
  } catch (err) {
    return next(err);
  }
};

export const unlockAccount = async (req, res, next) => {
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

    void logSystemAction(req.userId ?? Number(id), "user.unlock_account", {
      targetUserId: Number(id),
    });

    void createNotificationSafe({
      userId: Number(id),
      type: "SYSTEM",
      message: "Your account has been unlocked. You can sign in now.",
    });

    await sendAccountUnlockedEmail(storedUser.email, storedUser.fullname).catch(
      console.error,
    );
  } catch (err) {
    return next(err);
  }
};

export const getUserDashboardStats = async (req, res, next) => {
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
    return next(err);
  }
};

export const restoreUser = async (req, res, next) => {
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

    const restoredUser = await prisma.user.update({
      where: {
        id: Number(id),
      },
      data: {
        isDeleted: false,
      },
    });

    const necessaryUserData = removeSensitiveUserData(restoredUser);

    res.status(200).json({
      success: true,
      message: "User restored successfully",
      data: necessaryUserData,
    });

    void logSystemAction(req.userId ?? Number(id), "user.restore", {
      targetUserId: Number(id),
    });

    // Index member into the RAG system
    indexMember(restoredUser.id).catch((err) =>
      console.error(`[RAG] Indexing member ${restoredUser.id} failed:`, err),
    );
  } catch (err) {
    return next(err);
  }
};
