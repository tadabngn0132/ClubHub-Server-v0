import { prisma } from '../../libs/prisma.js';
import { SOCKET_EVENTS } from '../../utils/constant.js';

export const setupMessageHandler = (io, socket) => {
  socket.on(SOCKET_EVENTS.MESSAGE_SEND, async (data) => {
    const { senderId, receiverId, content, roomId } = data;

    try {
      // Validate data
      if (!senderId || !receiverId || !content) {
        socket.emit(SOCKET_EVENTS.MESSAGE_ERROR, {
          error: 'Missing required fields: senderId, receiverId, content',
        });
        return;
      }

      // Save to database
      const message = await prisma.message.create({
        data: {
          senderId,
          receiverId,
          roomId,
          content,
        },
        include: {
          sender: {
            select: { id: true, fullname: true, avatarUrl: true },
          },
        },
      });

      // Send to receiver
      io.to(`user:${receiverId}`).emit(SOCKET_EVENTS.MESSAGE_RECEIVE, message);

      // Feedback to sender
      socket.emit(SOCKET_EVENTS.MESSAGE_SENT, {
        success: true,
        messageId: message.id,
        createdAt: message.createdAt,
      });

      console.log(`Message ${message.id} sent from ${senderId} to ${receiverId}`);
    } catch (error) {
      console.error('Message send error:', error);
      socket.emit(SOCKET_EVENTS.MESSAGE_ERROR, {
        error: error.message,
      });
    }
  });

  socket.on(SOCKET_EVENTS.MESSAGE_DELETE, async (messageId) => {
    try {
      const message = await prisma.message.findUnique({
        where: { id: messageId },
      });

      if (!message) {
        socket.emit(SOCKET_EVENTS.MESSAGE_ERROR, {
          error: 'Message not found',
        });
        return;
      }

      await prisma.message.delete({ where: { id: messageId } });

      // Broadcast deletion
      io.emit(SOCKET_EVENTS.MESSAGE_DELETED, { messageId });
      console.log(`Message ${messageId} deleted`);
    } catch (error) {
      console.error('Message delete error:', error);
      socket.emit(SOCKET_EVENTS.MESSAGE_ERROR, {
        error: error.message,
      });
    }
  });
};