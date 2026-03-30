import { prisma } from '../../libs/prisma.js';
import { SOCKET_EVENTS } from '../../utils/constant.js';

export const setupMessageHandler = (io, socket) => {
  socket.on(SOCKET_EVENTS.MESSAGE_SEND, async (data = {}, ack) => {
    const senderId = Number(socket.data.userId);
    const { receiverId, content, roomId } = data;

    try {
      if (!senderId || !receiverId || !roomId || !content?.trim()) {
        const errorResponse = {
          success: false,
          message: 'Missing required fields: receiverId, roomId, content',
        };
        socket.emit(SOCKET_EVENTS.MESSAGE_ERROR, errorResponse);
        if (typeof ack === 'function') ack(errorResponse);
        return;
      }

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

      socket.join(`room:${roomId}`);
      io.to(`user:${receiverId}`).emit(SOCKET_EVENTS.MESSAGE_RECEIVE, message);
      io.to(`room:${roomId}`).emit(SOCKET_EVENTS.MESSAGE_RECEIVE, message);

      socket.emit(SOCKET_EVENTS.MESSAGE_SENT, {
        success: true,
        messageId: message.id,
        createdAt: message.createdAt,
      });

      if (typeof ack === 'function') {
        ack({
          success: true,
          data: message,
        });
      }

      console.log(`Message ${message.id} sent from ${senderId} to ${receiverId}`);
    } catch (error) {
      console.error('Message send error:', error);
      const errorResponse = {
        success: false,
        message: error.message,
      };
      socket.emit(SOCKET_EVENTS.MESSAGE_ERROR, errorResponse);
      if (typeof ack === 'function') ack(errorResponse);
    }
  });

  socket.on(SOCKET_EVENTS.MESSAGE_DELETE, async (messageId, ack) => {
    try {
      const message = await prisma.message.findUnique({
        where: { id: Number(messageId) },
      });

      if (!message) {
        const errorResponse = {
          success: false,
          message: 'Message not found',
        };
        socket.emit(SOCKET_EVENTS.MESSAGE_ERROR, errorResponse);
        if (typeof ack === 'function') ack(errorResponse);
        return;
      }

      if (Number(message.senderId) !== Number(socket.data.userId)) {
        const errorResponse = {
          success: false,
          message: 'Unauthorized to delete this message',
        };
        socket.emit(SOCKET_EVENTS.MESSAGE_ERROR, errorResponse);
        if (typeof ack === 'function') ack(errorResponse);
        return;
      }

      await prisma.message.delete({ where: { id: Number(messageId) } });

      io.to(`room:${message.roomId}`).emit(SOCKET_EVENTS.MESSAGE_DELETED, {
        messageId: Number(messageId),
        roomId: message.roomId,
      });

      if (message.receiverId) {
        io.to(`user:${message.receiverId}`).emit(SOCKET_EVENTS.MESSAGE_DELETED, {
          messageId: Number(messageId),
          roomId: message.roomId,
        });
      }

      if (typeof ack === 'function') {
        ack({
          success: true,
          data: { messageId: Number(messageId) },
        });
      }

      console.log(`Message ${messageId} deleted`);
    } catch (error) {
      console.error('Message delete error:', error);
      const errorResponse = {
        success: false,
        message: error.message,
      };
      socket.emit(SOCKET_EVENTS.MESSAGE_ERROR, errorResponse);
      if (typeof ack === 'function') ack(errorResponse);
    }
  });
};