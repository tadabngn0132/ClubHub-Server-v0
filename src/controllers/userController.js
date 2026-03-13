import { prisma } from "../libs/prisma.js"
import bcrypt from "bcryptjs"
import { removeSensitiveUserData } from "../utils/userUtil.js"
import { USER_STATUS } from "../utils/constant.js"

export const createUser = async (req, res) => {
  try {
    const payload = req.body;

    // TODO: Create validation middleware

    const storedUser = await prisma.user.findUnique({
      where: {
        email: payload.email,
      },
    })

    if (storedUser) {
      return res.status(400).json({
        success: false,
        message: "User with this email already exists",
      })
    }

    const position = await prisma.position.findUnique({
      where: {
        id: payload.positionId,
      },
    })

    if (!position) {
      return res.status(400).json({
        success: false,
        message: "Position not found",
      })
    }

    if (payload.rootDepartmentId !== null) {
      const department = await prisma.department.findUnique({
        where: { id: payload.rootDepartmentId },
        select: { id: true },
      });

      if (!department) {
        return res.status(400).json({
          success: false,
          message: "Root department not found",
        });
      }
    }
    
    const hashedPassword = await bcrypt.hash("WelcometoGDC22%^&", 12);

    const createdUser = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: payload.email,
          hashedPassword: hashedPassword,
          fullname: payload.fullname,
          phoneNumber: payload.phoneNumber,
          dateOfBirth: payload.dateOfBirth ? new Date(payload.dateOfBirth) : null,
          gender: payload.gender,
          major: payload.major,
          generation: Number(payload.generation),
          joinedAt: payload.joinedAt,
          status: payload.status.trim().toLowerCase() === 'active' ? USER_STATUS.ACTIVE : USER_STATUS.INACTIVE,
          studentId: payload.studentId,
          avatarUrl: payload.avatarUrl,
          bio: payload.bio,
        },
      });

      await tx.userPosition.create({
        data: {
          userId: user.id,
          positionId: Number(payload.positionId),
          isPrimary: true,
        },
      });

      return tx.user.findUnique({
        where: { id: user.id },
        include: {
          rootDepartment: {
            select: {
              id: true,
              name: true,
            },
          },
          userPosition: {
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
    });

    const necessaryUserData = removeSensitiveUserData(createdUser);

    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: necessaryUserData,
    })
  } catch (err) {
    console.log("Error in createUser function:", err);
    res.status(500).json({
      success: false,
      message: `Internal server error / Create user error: ${err.message}`,
    })
  }
}

export const getUser = async (req, res) => {
  try {
    const { id } = req.params;

    const storedUser = await prisma.user.findUnique({
      where: {
        id: Number(id),
      },
    })

    if (!storedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    const necessaryUserData = removeSensitiveUserData(storedUser)

    res.status(200).json({
      success: true,
      data: necessaryUserData,
    })
  } catch (err) {
    console.log("Error in getUser function:", err);
    res.status(500).json({
      success: false,
      message: `Internal server error / Get user error: ${err.message}`,
    })
  }
}

export const getUsers = async (req, res) => {
  try {
    const storedUsers = await prisma.user.findMany();

    const users = storedUsers.map((user) => removeSensitiveUserData(user))

    res.status(200).json({
      success: true,
      data: users,
    })
  } catch (err) {
    console.log("Error in getUsers function:", err);
    res.status(500).json({
      success: false,
      message: `Internal server error / Get users error: ${err.message}`,
    })
  }
}

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const payload = req.body;

    // TODO: Create validation middleware

    const storedUser = await prisma.user.findUnique({
      where: {
        id: Number(id),
      },
    })

    if (!storedUser) {
      return res.status(404).json({
        success: false,
        message: "Not found user to update",
      })
    }

    const position = await prisma.position.findUnique({
      where: {
        id: payload.positionId,
      },
    })

    if (!position) {
      return res.status(400).json({
        success: false,
        message: "Position not found",
      })
    }

    if (payload.rootDepartmentId !== null) {
      const department = await prisma.department.findUnique({
        where: { id: payload.rootDepartmentId },
        select: { id: true },
      });

      if (!department) {
        return res.status(400).json({
          success: false,
          message: "Root department not found",
        });
      }
    }

    const updatedUser = await prisma.$transaction(async (tx) => {
      const user = await tx.user.update({
        where: {
          id: Number(id),
        },
        data: {
          email: payload.email,
          hashedPassword: hashedPassword,
          fullname: payload.fullname,
          phoneNumber: payload.phoneNumber,
          dateOfBirth: payload.dateOfBirth ? new Date(payload.dateOfBirth) : null,
          gender: payload.gender,
          major: payload.major,
          generation: Number(payload.generation),
          joinedAt: payload.joinedAt,
          status: payload.status.trim().toLowerCase() === 'active' ? USER_STATUS.ACTIVE : USER_STATUS.INACTIVE,
          studentId: payload.studentId,
          avatarUrl: payload.avatarUrl,
          bio: payload.bio,
        },
      });

      await tx.userPosition.update({
        where: {
          userId: user.id,
          isPrimary: true,
        },
        data: {
          positionId: Number(payload.positionId),
        },
      });

      return tx.user.findUnique({
        where: { id: user.id },
        include: {
          rootDepartment: {
            select: {
              id: true,
              name: true,
            },
          },
          userPosition: {
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
    });

    const necessaryUserData = removeSensitiveUserData(updatedUser)

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: necessaryUserData,
    })
  } catch (err) {
    console.log("Error in updateUser function:", err);
    res.status(500).json({
      success: false,
      message: `Internal server error / Update user error: ${err.message}`,
    })
  }
}

export const softDeleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const storedUser = await prisma.user.findUnique({
      where: {
        id: Number(id),
      },
    })

    if (!storedUser) {
      return res.status(404).json({
        success: false,
        message: "Not found user to delete",
      })
    }

    const deletedUser = await prisma.user.update({
      where: {
        id: Number(id),
      },
      data: {
        status: "inactive",
      },
    })

    const necessaryUserData = removeSensitiveUserData(deletedUser)

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
      data: necessaryUserData,
    })
  } catch (err) {
    console.log("Error in softDeleteUser function:", err);
    res.status(500).json({
      success: false,
      message: `Internal server error / Soft delete user error: ${err.message}`,
    })
  }
}

export const hardDeleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const storedUser = await prisma.user.findUnique({
      where: {
        id: Number(id),
      },
    })

    if (!storedUser) {
      return res.status(404).json({
        success: false,
        message: "Not found user to delete",
      })
    }

    const deletedUser = await prisma.user.delete({
      where: {
        id: Number(id),
      },
    })

    const necessaryUserData = removeSensitiveUserData(deletedUser)

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
      data: necessaryUserData,
    })
  } catch (err) {
    console.log("Error in hardDeleteUser function:", err);
    res.status(500).json({
      success: false,
      message: `Internal server error / Hard delete user error: ${err.message}`,
    })
  }
}