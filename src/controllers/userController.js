import { prisma } from "../libs/prisma.js";
import { removeSensitiveUserData } from "../utils/userUtil.js";
import { USER_STATUS, AVATAR_PROVIDERS } from "../utils/constant.js";
import {
  hashedDefaultPassword,
  userIncludeOptions,
} from "../utils/userUtil.js";
import multer from "multer";
import cloudinary from "./src/libs/cloudinary.js";
import { file } from "googleapis/build/src/apis/file/index.js";

const storage = multer.memoryStorage();
const upload = multer({ storage });

export const createUser = async (req, res) => {
  try {
    const payload = req.body;

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

    const position = await prisma.position.findUnique({
      where: {
        id: Number(payload.positionId),
      },
    });

    if (!position) {
      return res.status(400).json({
        success: false,
        message: "Position not found",
      });
    }

    if (payload.rootDepartmentId !== null) {
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

    if (payload.avatar) {
      if (!file.minetype.startsWith("image/")) {
        return res.status(400).json({
          success: false,
          message: "Uploaded file is not an image",
        });
      }

      if (payload.avatar.size > 5 * 1024 * 1024) { // 5MB limit
        return res.status(400).json({
          success: false,
          message: "Avatar image size exceeds 5MB limit",
        });
      }

      const uploadResult = await cloudinary.uploader
        .upload(payload.avatar, {
          folder: "clubhub/users/avatars",
          public_id: `${payload.email}_avatar_${Date.now()}`,
          resource_type: "image",
        })
        .catch((error) => {
          console.log("Cloudinary upload error:", error);
          res.status(500).json({
            success: false,
            message: `Failed to upload avatar image: ${error.message}`,
          });
          return;
        });
      payload.avatarUrl = uploadResult.secure_url;
      payload.avatarPublicId = uploadResult.public_id;
      payload.avatarProvider = AVATAR_PROVIDERS.CLOUDINARY;
    }

    const createdUser = await prisma.$transaction(async (prisma) => {
      const user = await prisma.user.create({
        data: {
          email: payload.email,
          hashedPassword: await hashedDefaultPassword(),
          fullname: payload.fullname,
          phoneNumber: payload.phoneNumber,
          dateOfBirth: payload.dateOfBirth
            ? new Date(payload.dateOfBirth)
            : null,
          gender: payload.gender,
          major: payload.major,
          generation: Number(payload.generation),
          joinedAt: payload.joinedAt? new Date(payload.joinedAt) : null,
          status:
            payload.status.trim().toLowerCase() === "active"
              ? USER_STATUS.ACTIVE
              : USER_STATUS.INACTIVE,
          studentId: payload.studentId,
          avatarUrl: payload.avatarUrl,
          avatarPublicId: payload.avatarPublicId,
          avatarProvider: payload.avatarProvider,
          bio: payload.bio,
          rootDepartmentId: Number(payload.rootDepartmentId),
        },
      });

      await prisma.userPosition.create({
        data: {
          userId: user.id,
          positionId: Number(payload.positionId),
          isPrimary: true,
        },
      });

      return prisma.user.findUnique({
        where: { id: user.id },
        include: userIncludeOptions,
      });
    });

    const necessaryUserData = removeSensitiveUserData(createdUser);

    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: necessaryUserData,
    });
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

    const position = await prisma.position.findUnique({
      where: {
        id: Number(payload.positionId),
      },
    });

    if (!position) {
      return res.status(400).json({
        success: false,
        message: "Position not found",
      });
    }

    if (payload.rootDepartmentId !== null) {
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

    if (payload.avatar) {
      if (!file.minetype.startsWith("image/")) {
        return res.status(400).json({
          success: false,
          message: "Uploaded file is not an image",
        });
      }

      if (payload.avatar.size > 5 * 1024 * 1024) { // 5MB limit
        return res.status(400).json({
          success: false,
          message: "Avatar image size exceeds 5MB limit",
        });
      }

      const uploadResult = await cloudinary.uploader
        .upload(payload.avatar, {
          folder: "clubhub/users/avatars",
          public_id: `${payload.email}_avatar_${Date.now()}`,
          resource_type: "image",
        })
        .catch((error) => {
          console.log("Cloudinary upload error:", error);
          res.status(500).json({
            success: false,
            message: `Failed to upload avatar image: ${error.message}`,
          });
          return;
        }
      );
      payload.avatarUrl = uploadResult.secure_url;
      payload.avatarPublicId = uploadResult.public_id;
      payload.avatarProvider = AVATAR_PROVIDERS.CLOUDINARY;
    }

    const updatedUser = await prisma.$transaction(async (prisma) => {
      const user = await prisma.user.update({
        where: {
          id: Number(id),
        },
        data: {
          email: payload.email,
          hashedPassword: await hashedDefaultPassword(),
          fullname: payload.fullname,
          phoneNumber: payload.phoneNumber,
          dateOfBirth: payload.dateOfBirth
            ? new Date(payload.dateOfBirth)
            : null,
          gender: payload.gender,
          major: payload.major,
          generation: Number(payload.generation),
          joinedAt: payload.joinedAt ? new Date(payload.joinedAt) : null,
          status:
            payload.status.trim().toLowerCase() === "active"
              ? USER_STATUS.ACTIVE
              : USER_STATUS.INACTIVE,
          studentId: payload.studentId,
          avatarUrl: payload.avatarUrl,
          avatarPublicId: payload.avatarPublicId,
          avatarProvider: payload.avatarProvider,
          bio: payload.bio,
          rootDepartmentId: Number(payload.rootDepartmentId),
        },
        include: {
          userPosition: {
            where: { isPrimary: true },
            include: {
              position: {
                select: {
                  id: true,
                },
              },
            },
          },
        },
      });

      await prisma.userPosition.update({
        where: {
          userId_positionId: {
            userId: user.id,
            positionId: user.userPosition[0].position.id,
          }
        },
        data: {
          positionId: Number(payload.positionId),
        },
      });

      return prisma.user.findUnique({
        where: { id: user.id },
        include: userIncludeOptions,
      });
    });

    const necessaryUserData = removeSensitiveUserData(updatedUser);

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: necessaryUserData,
    });
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
        message: "Not found user to delete",
      });
    }

    const deletedUser = await prisma.user.update({
      where: {
        id: Number(id),
      },
      data: {
        status: USER_STATUS.INACTIVE,
      },
    });

    const necessaryUserData = removeSensitiveUserData(deletedUser);

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
      data: necessaryUserData,
    });
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
        message: "Not found user to delete",
      });
    }

    if (storedUser.avatarPublicId) {
      cloudinary.uploader.destroy(storedUser.avatarPublicId, (error, result) => {
        if (error) {
          console.log("Cloudinary deletion error:", error);
        } else {
          console.log("Cloudinary deletion result:", result);
        }
      });
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
  } catch (err) {
    console.log("Error in hardDeleteUser function:", err);
    res.status(500).json({
      success: false,
      message: `Internal server error / Hard delete user error: ${err.message}`,
    });
  }
};
