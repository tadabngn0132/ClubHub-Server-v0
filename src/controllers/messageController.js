import { prisma } from '../libs/prisma.js';
import { SOCKET_EVENTS } from '../utils/constant.js';
import { emitToRoom, emitToUser } from '../socket/socketGateway.js';

export const createNewMessage = async (req, res) => {
    const { roomId, receiverId, content } = req.body;
    const senderId = req.userId;

    try {
        const newMessage = await prisma.message.create({
            data: {
                roomId,
                senderId,
                receiverId,
                content
            }
        });

        emitToUser(receiverId, SOCKET_EVENTS.MESSAGE_RECEIVE, newMessage);
        emitToRoom(roomId, SOCKET_EVENTS.MESSAGE_RECEIVE, newMessage);
        emitToUser(senderId, SOCKET_EVENTS.MESSAGE_SENT, {
            success: true,
            messageId: newMessage.id,
            createdAt: newMessage.createdAt,
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
    const userId = req.userId;

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
            where: { id: Number(messageId) },
            data: { content }
        });

        emitToRoom(updatedMessage.roomId, SOCKET_EVENTS.MESSAGE_RECEIVE, updatedMessage);
        if (updatedMessage.receiverId) {
            emitToUser(updatedMessage.receiverId, SOCKET_EVENTS.MESSAGE_RECEIVE, updatedMessage);
        }

        res.status(200).json({ success: true, message: 'Message updated successfully', data: updatedMessage });
    } catch (error) {
        console.error('Error updating message:', error);
        res.status(500).json({ success: false, message: 'Failed to update message' });
    }
};

export const getAllMessagesByRoomId = async (req, res) => {
    const { roomId } = req.params;
    const userId = req.userId;

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
    const userId = req.userId;

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
            where: { id: Number(messageId) },
            data: { isDeleted: true }
        });

        emitToRoom(deletedMessage.roomId, SOCKET_EVENTS.MESSAGE_DELETED, {
            messageId: deletedMessage.id,
            roomId: deletedMessage.roomId,
        });
        if (deletedMessage.receiverId) {
            emitToUser(deletedMessage.receiverId, SOCKET_EVENTS.MESSAGE_DELETED, {
                messageId: deletedMessage.id,
                roomId: deletedMessage.roomId,
            });
        }

        res.status(200).json({ success: true, message: 'Message soft deleted successfully', data: deletedMessage });
    } catch (error) {
        console.error('Error soft deleting message:', error);
        res.status(500).json({ success: false, message: 'Failed to soft delete message' });
    }
};

export const hardDeleteMessage = async (req, res) => {
    const { messageId } = req.params;
    const userId = req.userId;

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
            where: { id: Number(messageId) }
        });

        emitToRoom(message.roomId, SOCKET_EVENTS.MESSAGE_DELETED, {
            messageId: Number(messageId),
            roomId: message.roomId,
        });
        if (message.receiverId) {
            emitToUser(message.receiverId, SOCKET_EVENTS.MESSAGE_DELETED, {
                messageId: Number(messageId),
                roomId: message.roomId,
            });
        }

        res.status(200).json({ success: true, message: 'Message deleted successfully' });
    } catch (error) {
        console.error('Error deleting message:', error);
        res.status(500).json({ success: false, message: 'Failed to delete message' });
    }
};

export const getAllRoomsForUser = async (req, res) => {
    const userId = req.userId;

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
