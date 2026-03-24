import { SOCKET_EVENTS } from '../../utils/constant.js';

const onlineUsers = new Map();

export const setupUserHandler = (io, socket) => {
    socket.on(SOCKET_EVENTS.USER_ONLINE, (userId) => {
        onlineUsers.set(userId, socket.id);
        socket.join(`user_${userId}`); // User-specific room for private notifications
        
        // Broadcast online users to all clients
        io.emit(SOCKET_EVENTS.USERS_ONLINE_STATUS, {
            onlineUsers: Array.from(onlineUsers.keys()),
        });

        console.log(`User ${userId} online. Total online users: ${onlineUsers.size}`);
    });

    socket.on('disconnect', () => {
        // Remove user from online users map
        let userIdToRemove = null;
        for (let [userId, socketId] of onlineUsers.entries()) {
            if (socketId === socket.id) {
                userIdToRemove = userId;
                onlineUsers.delete(userId);
                break;
            }
        }

        if (userIdToRemove) {io.emit(SOCKET_EVENTS.USERS_ONLINE_STATUS, {
            onlineUsers: Array.from(onlineUsers.keys()),
        });
        console.log(`User ${userIdToRemove} offline. Total online: ${onlineUsers.size}`);
        }
    })
}

// Helper function to get socket ID by user ID
export const getOnlineUsers = () => Array.from(onlineUsers.keys());
export const getUserSocket = (userId) => onlineUsers.get(userId);
export const isUserOnline = (userId) => onlineUsers.has(userId);