export const setSocketIO = (io) => {
    // Logic to set the Socket.IO instance for use in other parts of the application
    global.socketIO = io;
}

export const getSocketIO = () => {
    return global.socketIO; // Return the actual Socket.IO instance
}

export const emitToUser = (userId, event, data) => {
    // Logic to emit an event to a specific user using their userId
    const socketIO = getSocketIO();
    const userSocket = socketIO.to(userId);
    userSocket.emit(event, data);
}

export const emitToChatRoom = (chatRoomId, event, data) => {
    // Logic to emit an event to all members of a specific chat room using the chatRoomId
    const socketIO = getSocketIO();
    const chatRoomSocket = socketIO.to(chatRoomId);
    chatRoomSocket.emit(event, data);
}

export const emitToAll = (event, data) => {
    // Logic to emit an event to all connected clients
    const socketIO = getSocketIO();
    socketIO.emit(event, data);
}
