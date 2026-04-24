import { prisma } from "../libs/prisma.js";
import { removeSensitiveUserData, userIncludeOptions } from "../utils/userUtil.js";

export const getClubStructure = async (req, res, next) => {
  try {
    const [departments, positions, users] = await Promise.all([
      prisma.department.findMany({
        where: {
          isDeleted: false,
          isActive: true,
        },
        orderBy: [{ id: "asc" }],
      }),
      prisma.position.findMany({
        where: {
          isDeleted: false,
        },
        include: {
          department: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: [{ level: "desc" }, { id: "asc" }],
      }),
      prisma.user.findMany({
        where: {
          isDeleted: false,
          status: "ACTIVE",
        },
        include: userIncludeOptions,
        orderBy: [{ joinedAt: "asc" }, { id: "asc" }],
      }),
    ]);

    res.status(200).json({
      success: true,
      message: "Get club structure successfully",
      data: {
        departments,
        positions,
        members: users.map(removeSensitiveUserData),
      },
    });
  } catch (err) {
    return next(err);
  }
};