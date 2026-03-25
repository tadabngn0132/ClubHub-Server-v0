import { SOCKET_EVENTS } from '../../utils/constant.js';

// In-memory store for online users
// Key: userId, Value: Set of socket IDs (to support multiple connections per user)
const onlineUsers = new Map();
// Reverse mapping to find userId by socketId for disconnect handling
// Key: socketId, Value: userId
const socketToUserId = new Map();

export const setupUserHandler = (io, socket) => {
    socket.on(SOCKET_EVENTS.USER_ONLINE, (userId) => {
        if (!userId) {
            console.error('USER_ONLINE event missing userId');
            return;
        }

        const uId = Number(userId);
        if (!onlineUsers.has(uId)) {
            onlineUsers.set(uId, new Set());
        }
        
        onlineUsers.get(uId).add(socket.id);
        socketToUserId.set(socket.id, uId);

        // Thống nhất room name: user:{userId}
        socket.join(`user:${uId}`);

        // Broadcast online users to all clients
        io.emit(SOCKET_EVENTS.USERS_ONLINE_STATUS, {
            onlineUsers: Array.from(onlineUsers.keys()),
        });

        console.log(`User ${userId} online. Total online users: ${onlineUsers.size}`);
    });

    socket.on('disconnect', () => {
        // Remove user from online users map
        const userIdToRemove = socketToUserId.get(socket.id);

        if (!userIdToRemove) {
            console.warn(`Socket ${socket.id} disconnected but no associated userId found.`);
            return;
        }

        const sockets = onlineUsers.get(userIdToRemove);
        if (sockets) {
            sockets.delete(socket.id);
            if (sockets.size === 0) {
                onlineUsers.delete(userIdToRemove);
            }
        }

        socketToUserId.delete(socket.id);

        io.emit(SOCKET_EVENTS.USERS_ONLINE_STATUS, {
            onlineUsers: Array.from(onlineUsers.keys()),
        });

        console.log(`User ${userIdToRemove} offline. Total online: ${onlineUsers.size}`);
    });
}

// Helper function to get socket ID by user ID
export const getOnlineUsers = () => Array.from(onlineUsers.keys());
export const isUserOnline = (userId) => onlineUsers.has(Number(userId));