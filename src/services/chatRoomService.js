import { prisma } from "../libs/prisma.js";
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} from "../utils/AppError.js";
import { withSoftDeleteFilter } from "../utils/queryUtil.js";

const chatRoomInclude = {
  members: {
    include: {
      user: {
        select: {
          id: true,
          fullname: true,
          email: true,
          avatarUrl: true,
        },
      },
    },
  },
};

const chatRoomMemberInclude = {
  user: {
    select: {
      id: true,
      fullname: true,
      email: true,
      avatarUrl: true,
    },
  },
  chatRoom: {
    select: {
      id: true,
      name: true,
      isGroup: true,
    },
  },
};

export const createChatRoomService = async (chatRoomData) => {
  const userIds = chatRoomData.userIds || [];

  if (!chatRoomData.isGroup && userIds.length === 2) {
    const existingRoom = await prisma.chatRoom.findFirst({
      where: {
        isGroup: false,
        isDeleted: false,
        AND: userIds.map((userId) => ({
          members: {
            some: {
              userId: Number(userId),
            },
          },
        })),
      },
    });
    if (existingRoom) {
      return existingRoom;
    }
  } else if (!chatRoomData.isGroup && userIds.length !== 2) {
    throw new BadRequestError("Private chat rooms must have exactly 2 members");
  } else if (chatRoomData.isGroup && userIds.length < 3) {
    throw new BadRequestError("Group chat rooms must have at least 3 members");
  }

  const room = await prisma.$transaction(async (tx) => {
    const newRoom = await tx.chatRoom.create({
      data: {
        name: chatRoomData.name,
        isGroup: chatRoomData.isGroup,
      },
    });

    await tx.chatRoomMember.createMany({
      data: chatRoomData.userIds.map((userId) => ({
        roomId: newRoom.id,
        userId: Number(userId),
      })),
    });

    const createdRoom = await tx.chatRoom.findUnique({
      where: { id: newRoom.id },
      include: chatRoomInclude,
    });

    return createdRoom;
  });
  return room;
};

export const getChatRoomsService = async (userRole) => {
  const chatRooms = await prisma.chatRoom.findMany({
    where: { ...withSoftDeleteFilter(userRole) },
    include: chatRoomInclude,
  });
  return chatRooms;
};

export const getChatRoomByIdService = async (chatRoomId, userRole) => {
  const chatRoom = await prisma.chatRoom.findUnique({
    where: { id: chatRoomId, ...withSoftDeleteFilter(userRole) },
    include: chatRoomInclude,
  });

  if (!chatRoom) {
    throw new NotFoundError("Chat room not found");
  }

  return chatRoom;
};

export const getChatRoomByUserIdService = async (userId, userRole) => {
  const chatRooms = await prisma.chatRoom.findMany({
    where: {
      ...withSoftDeleteFilter(userRole),
      members: {
        some: {
          userId: Number(userId),
        },
      },
    },
    include: chatRoomInclude,
  });

  return chatRooms;
};

export const updateChatRoomService = async (chatRoomId, chatRoomData) => {
  const chatRoom = await prisma.chatRoom.findUnique({
    where: { id: chatRoomId, isDeleted: false },
  });

  if (!chatRoom) {
    throw new NotFoundError("Chat room not found");
  }

  const updatedRoom = await prisma.chatRoom.update({
    where: { id: chatRoomId, isDeleted: false },
    data: {
      name: chatRoomData.name,
      isGroup: chatRoomData.isGroup,
    },
    include: chatRoomInclude,
  });

  return updatedRoom;
};

export const softDeleteChatRoomService = async (chatRoomId) => {
  const chatRoom = await prisma.chatRoom.findUnique({
    where: { id: chatRoomId, isDeleted: false },
  });

  if (!chatRoom) {
    throw new NotFoundError("Chat room not found");
  }

  const deletedRoom = await prisma.chatRoom.update({
    where: { id: chatRoomId, isDeleted: false },
    data: { isDeleted: true },
    include: chatRoomInclude,
  });
  return deletedRoom;
};

export const hardDeleteChatRoomService = async (chatRoomId) => {
  const chatRoom = await prisma.chatRoom.findUnique({
    where: { id: chatRoomId },
  });

  if (!chatRoom) {
    throw new NotFoundError("Chat room not found");
  }

  const deletedRoom = await prisma.chatRoom.delete({
    where: { id: chatRoomId },
    include: chatRoomInclude,
  });
  return deletedRoom;
};

export const getChatRoomMembersService = async (chatRoomId) => {
  const chatRoom = await prisma.chatRoom.findUnique({
    where: { id: chatRoomId, isDeleted: false },
  });

  if (!chatRoom) {
    throw new NotFoundError("Chat room not found");
  }

  const members = await prisma.chatRoomMember.findMany({
    where: { roomId: chatRoomId },
    include: chatRoomMemberInclude,
  });
  return members;
};

export const addMemberToChatRoomService = async (chatRoomId, userIds) => {
  const chatRoom = await prisma.chatRoom.findUnique({
    where: { id: chatRoomId, isDeleted: false },
  });

  if (!chatRoom) {
    throw new NotFoundError("Chat room not found");
  }

  if (!chatRoom.isGroup) {
    throw new ForbiddenError("Cannot add members to a private chat room");
  }

  if (!Array.isArray(userIds) || userIds.length === 0) {
    throw new BadRequestError("User IDs must be a non-empty array");
  }

  const normalizedUserIds = userIds.map((id) => Number(id));

  const existingMembers = await prisma.chatRoomMember.findMany({
    where: {
      roomId: chatRoomId,
      userId: {
        in: normalizedUserIds,
      },
    },
  });

  const existingUserIds = existingMembers.map((member) => member.userId);
  const newUserIds = normalizedUserIds.filter(
    (id) => !existingUserIds.includes(id),
  );

  if (newUserIds.length === 0) {
    throw new BadRequestError(
      "All users are already members of this chat room",
    );
  }

  const addedMembers = await prisma.chatRoomMember.createMany({
    data: newUserIds.map((userId) => ({
      roomId: chatRoomId,
      userId,
    })),
  });

  const createdMembers = await prisma.chatRoomMember.findMany({
    where: {
      roomId: chatRoomId,
      userId: {
        in: newUserIds,
      },
    },
    include: chatRoomMemberInclude,
  });

  return createdMembers;
};

export const removeMemberFromChatRoomService = async (chatRoomId, userId) => {
  const chatRoom = await prisma.chatRoom.findUnique({
    where: { id: chatRoomId, isDeleted: false },
  });

  if (!chatRoom) {
    throw new NotFoundError("Chat room not found");
  }

  const existingMember = await prisma.chatRoomMember.findUnique({
    where: {
      roomId_userId: {
        roomId: chatRoomId,
        userId: Number(userId),
      },
    },
  });

  if (!existingMember) {
    throw new BadRequestError("User is not a member of this chat room");
  }

  const removedMember = await prisma.chatRoomMember.delete({
    where: {
      roomId_userId: {
        roomId: chatRoomId,
        userId: Number(userId),
      },
    },
    include: chatRoomMemberInclude,
  });

  return removedMember;
};

export const checkUserMembershipInChatRoomService = async (
  chatRoomId,
  userId,
) => {
  const chatRoom = await prisma.chatRoom.findUnique({
    where: { id: chatRoomId, isDeleted: false },
  });

  if (!chatRoom) {
    throw new NotFoundError("Chat room not found");
  }

  const isMember = await prisma.chatRoomMember.findUnique({
    where: {
      roomId_userId: {
        roomId: chatRoomId,
        userId: Number(userId),
      },
    },
  });

  return !!isMember;
};
