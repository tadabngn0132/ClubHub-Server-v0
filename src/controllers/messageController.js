import { prisma } from '../libs/prisma.js';

export const createNewMessage = async (req, res) => {
    const { roomId, receiverId, content } = req.body;
    const senderId = req.user.id;

    try {
        const newMessage = await prisma.message.create({
            data: {
                roomId,
                senderId,
                receiverId,
                content
            }
        });

        res.status(201).json({ success: true, message: 'Message sent successfully', data: newMessage });
    } catch (error) {
        console.error('Error creating message:', error);
        res.status(500).json({ success: false, message: 'Failed to send message' });
    }
};

export const updateMessage = async (req, res) => {
    const { messageId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    try {
        const message = await prisma.message.findUnique({
            where: { id: messageId }
        });

        if (!message) {
            return res.status(404).json({ success: false, message: 'Message not found' });
        }

        if (message.senderId !== userId) {
            return res.status(403).json({ success: false, message: 'Unauthorized to edit this message' });
        }

        const updatedMessage = await prisma.message.update({
            where: { id: messageId },
            data: { content }
        });

        res.status(200).json({ success: true, message: 'Message updated successfully', data: updatedMessage });
    } catch (error) {
        console.error('Error updating message:', error);
        res.status(500).json({ success: false, message: 'Failed to update message' });
    }
};

export const getAllMessagesByRoomId = async (req, res) => {
    const { roomId } = req.params;
    const userId = req.user.id;

    try {
        const messages = await prisma.message.findMany({
            where: {
                roomId,
                OR: [
                    { senderId: userId },
                    { receiverId: userId }
                ]
            },
            orderBy: { createdAt: 'asc' }
        });

        res.status(200).json({ success: true, data: messages });
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch messages' });
    }
};

export const softDeleteMessage = async (req, res) => {
    const { messageId } = req.params;
    const userId = req.user.id;

    try {
        const message = await prisma.message.findUnique({
            where: { id: messageId }
        });

        if (!message) {
            return res.status(404).json({ success: false, message: 'Message not found' });
        }

        if (message.senderId !== userId) {
            return res.status(403).json({ success: false, message: 'Unauthorized to delete this message' });
        }

        const deletedMessage = await prisma.message.update({
            where: { id: messageId },
            data: { isDeleted: true }
        });

        res.status(200).json({ success: true, message: 'Message soft deleted successfully', data: deletedMessage });
    } catch (error) {
        console.error('Error soft deleting message:', error);
        res.status(500).json({ success: false, message: 'Failed to soft delete message' });
    }
};

export const hardDeleteMessage = async (req, res) => {
    const { messageId } = req.params;
    const userId = req.user.id;

    try {
        const message = await prisma.message.findUnique({
            where: { id: messageId }
        });

        if (!message) {
            return res.status(404).json({ success: false, message: 'Message not found' });
        }
        if (message.senderId !== userId) {
            return res.status(403).json({ success: false, message: 'Unauthorized to delete this message' });
        }

        await prisma.message.delete({
            where: { id: messageId }
        });

        res.status(200).json({ success: true, message: 'Message deleted successfully' });
    } catch (error) {
        console.error('Error deleting message:', error);
        res.status(500).json({ success: false, message: 'Failed to delete message' });
    }
};

export const getAllRoomsForUser = async (req, res) => {
    const userId = req.user.id;

    try {
        const rooms = await prisma.message.groupBy({
            by: ['roomId'],
            where: {
                OR: [
                    { senderId: userId },
                    { receiverId: userId }
                ]
            },
            orderBy: { createdAt: 'desc' }
        });

        const conversations = await Promise.all(rooms.map(async (room) => {
            const lastMessage = await prisma.message.findFirst({
                where: { roomId: room.roomId },
                orderBy: { createdAt: 'desc' }
            });

            const otherUserId = lastMessage.senderId === userId ? lastMessage.receiverId : lastMessage.senderId;
            const otherUser = await prisma.user.findUnique({
                where: { id: otherUserId },
                select: { id: true, fullname: true, email: true, avatarUrl: true }
            });

            return {
                roomId: room.roomId,
                lastMessage,
                otherUser
            };
        }));

        res.status(200).json({ success: true, data: conversations });
    } catch (error) {
        console.error('Error fetching conversations:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch conversations' });
    }
};