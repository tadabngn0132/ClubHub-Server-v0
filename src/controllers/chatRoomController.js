import { prisma } from '../libs/prisma.js';

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
        message: 'Chat room created successfully',
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
        message: 'Chat rooms retrieved successfully',
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
      where: { id: Number(id) },
    });

    if (!chatRoom) {
      return res.status(404).json({
          success: false,
          message: 'Chat room not found',
      });
    }

    res.status(200).json({
        success: true,
        message: 'Chat room retrieved successfully',
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
            includes: {
                user: {
                    some: {
                        id: Number(userId),
                    },
                }
            }
        },
      },
    });

    res.status(200).json({
        success: true,
        message: 'Chat rooms for user retrieved successfully',
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
      where: { id: Number(id) },
      data: {
        name: chatRoomData.name,
        isGroup: chatRoomData.isGroup,
      },
    });

    res.status(200).json({
        success: true,
        message: 'Chat room updated successfully',
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
      where: { id: Number(id) },
    });

    res.status(200).json({
        success: true,
        message: 'Chat room deleted successfully',
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
