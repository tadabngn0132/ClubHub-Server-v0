import { prisma } from "../libs/prisma.js";

export const createChatRoomService = async (chatRoomData) => {
  try {
    const newChatRoom = await prisma.chatRoom.create({
      data: {
        name: chatRoomData.name,
        isGroup: chatRoomData.isGroup,
      },
    });

    return newChatRoom;
  } catch (err) {
    console.error("Error creating chat room:", err);
    throw new Error(err.message);
  }
};

export const getChatRoomsService = async () => {
  try {
    const chatRooms = await prisma.chatRoom.findMany();

    return chatRooms;
  } catch (err) {
    console.error("Error retrieving chat rooms:", err);
    throw new Error(err.message);
  }
};

export const getChatRoomByIdService = async (id) => {
  try {
    const chatRoom = await prisma.chatRoom.findUnique({
      where: { id: id },
    });

    if (!chatRoom) {
      throw new Error("Chat room not found");
    }

    return chatRoom;
  } catch (err) {
    console.error("Error retrieving chat room:", err);
    throw new Error(err.message);
  }
};

export const getChatRoomsByUserIdService = async (userId) => {
  try {
    const chatRooms = await prisma.chatRoom.findMany({
      where: {
        members: {
          some: {
            userId: Number(userId),
          },
        },
      },
    });

    return chatRooms;
  } catch (err) {
    console.error("Error retrieving chat rooms for user:", err);
    throw new Error(err.message);
  }
};

export const updateChatRoomService = async (id, chatRoomData) => {
  try {
    const updatedChatRoom = await prisma.chatRoom.update({
      where: { id: id },
      data: {
        name: chatRoomData.name,
        isGroup: chatRoomData.isGroup,
      },
    });

    return updatedChatRoom;
  } catch (err) {
    console.error("Error updating chat room:", err);
    throw new Error(err.message);
  }
};

export const deleteChatRoomService = async (id) => {
  try {
    const deletedChatRoom = await prisma.chatRoom.delete({
      where: { id: id },
    });

    return deletedChatRoom;
  } catch (err) {
    console.error("Error deleting chat room:", err);
    throw new Error(err.message);
  }
};

export const addMemberToChatRoomService = async (chatRoomId, userId) => {
  try {
    const chatRoom = await prisma.chatRoom.findUnique({
      where: { id: chatRoomId },
    });

    if (!chatRoom) {
      throw new Error("Chat room not found");
    }

    if (!chatRoom.isGroup) {
      throw new Error("Cannot add members to a non-group chat room");
    }

    const existingMember = await prisma.chatRoomMember.findUnique({
      where: {
        roomId_userId: {
          roomId: chatRoomId,
          userId: Number(userId),
        },
      },
    });

    if (existingMember) {
      throw new Error("User is already a member of this chat room");
    }

    const newMember = await prisma.chatRoomMember.create({
      data: {
        roomId: chatRoomId,
        userId: Number(userId),
      },
    });

    return newMember;
  } catch (err) {
    console.error("Error adding member to chat room:", err);
    throw new Error(err.message);
  }
};

export const removeMemberFromChatRoomService = async (chatRoomId, userId) => {
  try {
    const chatRoom = await prisma.chatRoom.findUnique({
      where: { id: chatRoomId },
    });

    if (!chatRoom) {
      throw new Error("Chat room not found");
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
      throw new Error("User is not a member of this chat room");
    }

    const deletedMember = await prisma.chatRoomMember.delete({
      where: {
        roomId_userId: {
          roomId: chatRoomId,
          userId: Number(userId),
        },
      },
    });

    return deletedMember;
  } catch (err) {
    console.error("Error removing member from chat room:", err);
    throw new Error(err.message);
  }
};

export const getChatRoomMembersService = async (chatRoomId) => {
  try {
    const members = await prisma.chatRoomMember.findMany({
      where: { roomId: chatRoomId },
      include: {
        user: {
          select: {
            id: true,
            fullname: true,
            avatarUrl: true,
            status: true,
          },
        },
      },
    });
    return members;
  } catch (err) {
    console.error("Error retrieving chat room members:", err);
    throw new Error(err.message);
  }
};
