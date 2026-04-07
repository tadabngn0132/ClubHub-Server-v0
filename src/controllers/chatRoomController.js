import { prisma } from "../libs/prisma.js";

export const createChatRoom = async (req, res) => {
  try {
    const chatRoomData = req.body;

    const newChatRoom = await prisma.chatRoom.create({
      data: {
        name: chatRoomData.name,
        isGroup: chatRoomData.isGroup,
      },
    });

    res.status(201).json({
      success: true,
      message: "Chat room created successfully",
      chatRoom: newChatRoom,
    });
  } catch (err) {
    console.error("Error creating chat room:", err);
    res.status(500).json({
      success: false,
      message: `Internal server error / Create chat room error: ${err.message}`,
    });
  }
};

export const getChatRooms = async (req, res) => {
  try {
    const chatRooms = await prisma.chatRoom.findMany();

    res.status(200).json({
      success: true,
      message: "Chat rooms retrieved successfully",
      chatRooms,
    });
  } catch (err) {
    console.error("Error retrieving chat rooms:", err);
    res.status(500).json({
      success: false,
      message: `Internal server error / Get chat rooms error: ${err.message}`,
    });
  }
};

export const getChatRoomById = async (req, res) => {
  try {
    const { id } = req.params;
    const chatRoom = await prisma.chatRoom.findUnique({
      where: { id: id },
    });

    if (!chatRoom) {
      return res.status(404).json({
        success: false,
        message: "Chat room not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Chat room retrieved successfully",
      chatRoom,
    });
  } catch (err) {
    console.error("Error retrieving chat room:", err);
    res.status(500).json({
      success: false,
      message: `Internal server error / Get chat room by ID error: ${err.message}`,
    });
  }
};

export const getChatRoomsByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    const chatRooms = await prisma.chatRoom.findMany({
      where: {
        members: {
          some: {
            userId: Number(userId),
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      message: "Chat rooms for user retrieved successfully",
      data: chatRooms,
    });
  } catch (err) {
    console.error("Error retrieving chat rooms for user:", err);
    res.status(500).json({
      success: false,
      message: `Internal server error / Get chat rooms by user ID error: ${err.message}`,
    });
  }
};

export const updateChatRoom = async (req, res) => {
  try {
    const { id } = req.params;
    const chatRoomData = req.body;

    const updatedChatRoom = await prisma.chatRoom.update({
      where: { id: id },
      data: {
        name: chatRoomData.name,
        isGroup: chatRoomData.isGroup,
      },
    });

    res.status(200).json({
      success: true,
      message: "Chat room updated successfully",
      chatRoom: updatedChatRoom,
    });
  } catch (err) {
    console.error("Error updating chat room:", err);
    res.status(500).json({
      success: false,
      message: `Internal server error / Update chat room error: ${err.message}`,
    });
  }
};

export const deleteChatRoom = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedChatRoom = await prisma.chatRoom.delete({
      where: { id: id },
    });

    res.status(200).json({
      success: true,
      message: "Chat room deleted successfully",
      chatRoom: deletedChatRoom,
    });
  } catch (err) {
    console.error("Error deleting chat room:", err);
    res.status(500).json({
      success: false,
      message: `Internal server error / Delete chat room error: ${err.message}`,
    });
  }
};

export const addMemberToChatRoom = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    const chatRoom = await prisma.chatRoom.findUnique({
      where: { id: id },
    });

    if (!chatRoom) {
      return res.status(404).json({
        success: false,
        message: "Chat room not found",
      });
    }

    if (!chatRoom.isGroup) {
      return res.status(400).json({
        success: false,
        message: "Cannot add members to a non-group chat room",
      });
    }

    const existingMember = await prisma.chatRoomMember.findUnique({
      where: {
        roomId_userId: {
          roomId: id,
          userId: Number(userId),
        },
      },
    });

    if (existingMember) {
      return res.status(400).json({
        success: false,
        message: "User is already a member of this chat room",
      });
    }

    const newMember = await prisma.chatRoomMember.create({
      data: {
        roomId: id,
        userId: Number(userId),
      },
    });

    res.status(201).json({
      success: true,
      message: "Member added to chat room successfully",
      data: newMember,
    });
  } catch (err) {
    console.error("Error adding member to chat room:", err);
    res.status(500).json({
      success: false,
      message: `Internal server error / Add member to chat room error: ${err.message}`,
    });
  }
};

export const removeMemberFromChatRoom = async (req, res) => {
  try {
    const { id, userId } = req.params;

    const chatRoom = await prisma.chatRoom.findUnique({
      where: { id: id },
    });

    if (!chatRoom) {
      return res.status(404).json({
        success: false,
        message: "Chat room not found",
      });
    }

    const existingMember = await prisma.chatRoomMember.findUnique({
      where: {
        roomId_userId: {
          roomId: id,
          userId: Number(userId),
        },
      },
    });

    if (!existingMember) {
      return res.status(400).json({
        success: false,
        message: "User is not a member of this chat room",
      });
    }

    await prisma.chatRoomMember.delete({
      where: {
        roomId_userId: {
          roomId: id,
          userId: Number(userId),
        },
      },
    });

    res.status(200).json({
      success: true,
      message: "Member removed from chat room successfully",
    });
  } catch (err) {
    console.error("Error removing member from chat room:", err);
    res.status(500).json({
      success: false,
      message: `Internal server error / Remove member from chat room error: ${err.message}`,
    });
  }
};

export const getChatRoomMembers = async (req, res) => {
  try {
    const { id } = req.params;

    const members = await prisma.chatRoomMember.findMany({
      where: { roomId: id },
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
    res.status(200).json({
      success: true,
      message: "Chat room members retrieved successfully",
      data: members,
    });
  } catch (err) {
    console.error("Error retrieving chat room members:", err);
    res.status(500).json({
      success: false,
      message: `Internal server error / Get chat room members error: ${err.message}`,
    });
  }
};
