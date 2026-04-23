import { prisma } from "../libs/prisma.js";
import {
  hashedDefaultPassword,
  userIncludeOptions,
} from "../utils/userUtil.js";
import { USER_STATUS } from "../utils/constant.js";
import { getHighestPositionLevel } from "../utils/positionUtil.js";
import { BadRequestError } from "../utils/AppError.js";

export const createUserWithPositionsService = async (payload, tx) => {
  if (!payload.positionIds || payload.positionIds.length === 0) {
    throw new BadRequestError(
      "At least one position must be assigned to the user.",
    );
  }

  const dedupedPositionIds = [
    ...new Set(payload.positionIds.map((id) => Number(id))),
  ];

  const userPositions = await tx.position.findMany({
    where: {
      id: {
        in: dedupedPositionIds,
      },
    },
  });

  if (userPositions.length !== dedupedPositionIds.length) {
    throw new BadRequestError("One or more provided position IDs are invalid.");
  }

  const primaryPositionId = getHighestPositionLevel(userPositions);

  if (!primaryPositionId) {
    throw new BadRequestError("Invalid position IDs provided.");
  }

  const user = await tx.user.create({
    data: {
      email: payload.email,
      hashedPassword: await hashedDefaultPassword(),
      fullname: payload.fullname,
      phoneNumber: payload.phoneNumber,
      dateOfBirth: payload.dateOfBirth ? new Date(payload.dateOfBirth) : null,
      gender: payload.gender,
      major: payload.major,
      generation: payload.generation ? Number(payload.generation) : null,
      joinedAt: payload.joinedAt ? new Date(payload.joinedAt) : null,
      status:
        String(payload.status || "ACTIVE")
          .trim()
          .toLowerCase() === "active"
          ? USER_STATUS.ACTIVE
          : USER_STATUS.INACTIVE,
      studentId: payload.studentId,
      avatarUrl: payload.avatarUrl,
      avatarPublicId: payload.avatarPublicId,
      avatarProvider: payload.avatarProvider,
      bio: payload.bio,
      rootDepartmentId:
        payload.rootDepartmentId !== "" &&
        payload.rootDepartmentId !== null &&
        payload.rootDepartmentId !== undefined
          ? Number(payload.rootDepartmentId)
          : null,
    },
  });

  await tx.userPosition.createMany({
    data: userPositions.map((position) => ({
      userId: user.id,
      positionId: position.id,
      isPrimary: position.id === primaryPositionId,
    })),
    skipDuplicates: true,
  });

  return tx.user.findUnique({
    where: { id: user.id },
    include: userIncludeOptions,
  });
};

export const updateUserWithPositionsService = async (userId, payload) => {
  if (!payload.positionIds || payload.positionIds.length === 0) {
    throw new BadRequestError(
      "At least one position must be assigned to the user.",
    );
  }

  const dedupedPositionIds = [
    ...new Set(payload.positionIds.map((id) => Number(id))),
  ];

  const userPositions = await prisma.position.findMany({
    where: {
      id: {
        in: dedupedPositionIds,
      },
    },
  });

  if (userPositions.length !== dedupedPositionIds.length) {
    throw new BadRequestError("One or more provided position IDs are invalid.");
  }

  const primaryPositionId = getHighestPositionLevel(userPositions);

  if (!primaryPositionId) {
    throw new BadRequestError("Invalid position IDs provided.");
  }

  const updatedUser = await prisma.$transaction(async (tx) => {
    const user = await tx.user.update({
      where: {
        id: Number(userId),
      },
      data: {
        email: payload.email,
        fullname: payload.fullname,
        phoneNumber: payload.phoneNumber,
        dateOfBirth: payload.dateOfBirth ? new Date(payload.dateOfBirth) : null,
        gender: payload.gender,
        major: payload.major,
        generation: payload.generation ? Number(payload.generation) : null,
        joinedAt: payload.joinedAt ? new Date(payload.joinedAt) : null,
        status:
          String(payload.status || "ACTIVE")
            .trim()
            .toLowerCase() === "active"
            ? USER_STATUS.ACTIVE
            : USER_STATUS.INACTIVE,
        studentId: payload.studentId,
        avatarUrl: payload.avatarUrl,
        avatarPublicId: payload.avatarPublicId,
        avatarProvider: payload.avatarProvider,
        bio: payload.bio,
        rootDepartmentId:
          payload.rootDepartmentId !== "" &&
          payload.rootDepartmentId !== null &&
          payload.rootDepartmentId !== undefined
            ? Number(payload.rootDepartmentId)
            : null,
      },
      include: {
        userPosition: {
          include: {
            position: {
              select: {
                id: true,
                level: true,
              },
            },
          },
        },
      },
    });

    await tx.userPosition.deleteMany({
      where: {
        userId: user.id,
        positionId: {
          notIn: dedupedPositionIds,
        },
      },
    });

    await tx.userPosition.createMany({
      data: userPositions.map((position) => ({
        userId: user.id,
        positionId: position.id,
        isPrimary: position.id === primaryPositionId,
      })),
      skipDuplicates: true,
    });

    await tx.userPosition.updateMany({
      where: {
        userId: user.id,
      },
      data: {
        isPrimary: false,
      },
    });

    await tx.userPosition.update({
      where: {
        userId_positionId: {
          userId: user.id,
          positionId: primaryPositionId,
        },
      },
      data: {
        isPrimary: true,
      },
    });

    return tx.user.findUnique({
      where: { id: user.id },
      include: userIncludeOptions,
    });
  });

  return updatedUser;
};
