import { SOCKET_EVENTS } from '../../utils/constant.js';

export const setupNotificationHandler = (io, socket) => {
    socket.on(SOCKET_EVENTS.SEND_NOTIFICATION, (data) => {
        const { recipientId, notification } = data;
        const recipientSocketId = getUserSocket(recipientId);

        if (recipientSocketId) {
            io.to(recipientSocketId).emit(SOCKET_EVENTS.RECEIVE_NOTIFICATION, notification);
            console.log(`Notification sent to user ${recipientId}:`, notification);
        } else {
            console.log(`User ${recipientId} is offline. Notification not sent.`);
        }

        // Optionally, save the notification to the database here
    });

    socket.on(SOCKET_EVENTS.MARK_NOTIFICATION_READ, (notificationId) => {
        // Handle marking the notification as read in the database
        console.log(`Notification ${notificationId} marked as read by user ${socket.id}`);
    });

    socket.on(SOCKET_EVENTS.DELETE_NOTIFICATION, (notificationId) => {
        // Handle deleting the notification from the database
        console.log(`Notification ${notificationId} deleted by user ${socket.id}`);
    });
}