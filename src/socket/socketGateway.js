let ioInstance = null;

export const setSocketIO = (io) => {
  // Logic to set the Socket.IO instance for use in other parts of the application
  ioInstance = io;
};

export const getSocketIO = () => {
  return ioInstance; // Return the actual Socket.IO instance
};

export const emitToUser = (userId, event, data) => {
  // Logic to emit an event to a specific user using their userId
  const io = getSocketIO();
  if (!io || !userId) return false; // Ensure io and userId are defined
  io.to(`user:${userId}`).emit(event, data); // Emit the event to the specific user room
  return true; // Indicate that the event was emitted successfully
};

export const emitToChatRoom = (chatRoomId, event, data) => {
  // Logic to emit an event to all members of a specific chat room using the chatRoomId
  const io = getSocketIO();
  if (!io || !chatRoomId) return false; // Ensure io and chatRoomId are defined
  io.to(`room_${chatRoomId}`).emit(event, data); // Emit the event to the specific chat room
  return true; // Indicate that the event was emitted successfully
};

export const emitToAll = (event, data) => {
  // Logic to emit an event to all connected clients
  const socketIO = getSocketIO();
  socketIO.emit(event, data);
};
