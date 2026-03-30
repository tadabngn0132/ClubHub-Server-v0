let ioInstance = null;

export const setSocketIO = (io) => {
  ioInstance = io;
};

export const getSocketIO = () => {
  return ioInstance;
};

export const emitToUser = (userId, eventName, payload) => {
  if (!ioInstance || !userId) {
    return false;
  }

  ioInstance.to(`user:${Number(userId)}`).emit(eventName, payload);
  return true;
};

export const emitToRoom = (roomId, eventName, payload) => {
  if (!ioInstance || !roomId) {
    return false;
  }

  ioInstance.to(`room:${roomId}`).emit(eventName, payload);
  return true;
};
