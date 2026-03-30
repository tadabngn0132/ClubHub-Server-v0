import { prisma } from '../../libs/prisma.js';
import { SOCKET_EVENTS } from '../../utils/constant.js';

export const setupNotificationHandler = (io, socket) => {
    socket.on(SOCKET_EVENTS.NOTIFICATION_SEND, async (data = {}, ack) => {
        try {
            const senderId = Number(socket.data.userId);
            const { recipientId, message } = data;

            if (!senderId || !recipientId || !message?.trim()) {
                const errorResponse = {
                    success: false,
                    message: 'Missing required fields: recipientId, message',
                };
                if (typeof ack === 'function') ack(errorResponse);
                socket.emit(SOCKET_EVENTS.NOTIFICATION_RECEIVE, errorResponse);
                return;
            }

            const notification = await prisma.notification.create({
                data: {
                    userId: Number(recipientId),
                    message,
                },
            });

            io.to(`user:${Number(recipientId)}`).emit(
                SOCKET_EVENTS.NOTIFICATION_RECEIVE,
                notification,
            );

            if (typeof ack === 'function') {
                ack({
                    success: true,
                    data: notification,
                });
            }

            console.log(`Notification ${notification.id} sent from ${senderId} to ${recipientId}`);
        } catch (error) {
            const errorResponse = {
                success: false,
                message: error.message,
            };

            if (typeof ack === 'function') ack(errorResponse);
            socket.emit(SOCKET_EVENTS.NOTIFICATION_RECEIVE, errorResponse);
        }
    });

    socket.on(SOCKET_EVENTS.NOTIFICATION_READ, async (notificationId, ack) => {
        try {
            const userId = Number(socket.data.userId);
            const notification = await prisma.notification.findUnique({
                where: { id: Number(notificationId) },
            });

            if (!notification || Number(notification.userId) !== userId) {
                const errorResponse = {
                    success: false,
                    message: 'Notification not found or unauthorized',
                };
                if (typeof ack === 'function') ack(errorResponse);
                return;
            }

            const updated = await prisma.notification.update({
                where: { id: Number(notificationId) },
                data: { isRead: true },
            });

            io.to(`user:${userId}`).emit(SOCKET_EVENTS.NOTIFICATION_READ, updated);

            if (typeof ack === 'function') {
                ack({
                    success: true,
                    data: updated,
                });
            }
        } catch (error) {
            if (typeof ack === 'function') {
                ack({
                    success: false,
                    message: error.message,
                });
            }
        }
    });

    socket.on(SOCKET_EVENTS.NOTIFICATION_DELETE, async (notificationId, ack) => {
        try {
            const userId = Number(socket.data.userId);
            const notification = await prisma.notification.findUnique({
                where: { id: Number(notificationId) },
            });

            if (!notification || Number(notification.userId) !== userId) {
                const errorResponse = {
                    success: false,
                    message: 'Notification not found or unauthorized',
                };
                if (typeof ack === 'function') ack(errorResponse);
                return;
            }

            await prisma.notification.delete({
                where: { id: Number(notificationId) },
            });

            io.to(`user:${userId}`).emit(SOCKET_EVENTS.NOTIFICATION_DELETE, {
                id: Number(notificationId),
            });

            if (typeof ack === 'function') {
                ack({
                    success: true,
                    data: { id: Number(notificationId) },
                });
            }
        } catch (error) {
            if (typeof ack === 'function') {
                ack({
                    success: false,
                    message: error.message,
                });
            }
        }
    });
}