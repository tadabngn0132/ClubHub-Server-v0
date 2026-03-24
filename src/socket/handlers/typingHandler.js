import { SOCKET_EVENTS } from "../../utils/constant.js";

export const setupTypingHandler = (io, socket) => {
  socket.on(SOCKET_EVENTS.USER_TYPING, (data) => {
    const { senderId, receiverId } = data;

    if (!senderId || !receiverId) return;

    io.to(`user:${receiverId}`).emit(SOCKET_EVENTS.USER_TYPING, {
      senderId,
    });
  });

  socket.on(SOCKET_EVENTS.USER_STOP_TYPING, (data) => {
    const { senderId, receiverId } = data;

    if (!senderId || !receiverId) return;

    io.to(`user:${receiverId}`).emit(SOCKET_EVENTS.USER_STOP_TYPING, {
      senderId,
    });
  });
};