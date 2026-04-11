import { SOCKET_EVENTS } from "../../utils/constant.js";
import {
  createNotificationService,
  getNotificationByIdService,
  updateNotificationService,
  softDeleteNotificationService,
  emitNotificationToUser,
} from "../../services/notificationService.js";

const safeAck = (ack, response) => {
  if (typeof ack === "function") {
    ack(response);
  }
};

export const setupNotificationHandler = (io, socket) => {
  /**
   * Listen for notification:send
   * -> Save to DB
   * -> Emit to recipient
   *
   * Listen for notification:read
   * -> Check ownership
   * -> Update in DB
   * -> Emit to user
   *
   * Listen for notification:softDelete
   * -> Check ownership
   * -> Soft delete in DB
   * -> Emit to user
   */

  socket.on(SOCKET_EVENTS.NOTIFICATION_SEND, async (data = {}, ack) => {
    const { userId, type, message } = data;

    try {
      const notification = await createNotificationService({
        userId,
        type,
        message,
      });

      safeAck(ack, { success: true, data: notification });
    } catch (error) {
      safeAck(ack, { success: false, message: error.message });
    }
  });

  socket.on(SOCKET_EVENTS.NOTIFICATION_READ, async (data = {}, ack) => {
    const userId = Number(socket.data.userId);
    const { notificationId } = data;

    if (!notificationId) {
      return safeAck(ack, {
        success: false,
        message: "Notification ID is required",
      });
    }

    try {
      const notification = await getNotificationByIdService(notificationId);
      if (notification.userId !== userId) {
        return safeAck(ack, { success: false, message: "Unauthorized" });
      }
      const updatedNotification = await updateNotificationService(
        notificationId,
        { isRead: true },
      );
      io.to(`user:${userId}`).emit(
        SOCKET_EVENTS.NOTIFICATION_READ,
        updatedNotification,
      );
      safeAck(ack, { success: true, data: updatedNotification });
    } catch (error) {
      safeAck(ack, { success: false, message: error.message });
    }
  });

  socket.on(SOCKET_EVENTS.NOTIFICATION_SOFT_DELETE, async (data = {}, ack) => {
    const userId = Number(socket.data.userId);
    const { notificationId } = data;

    if (!notificationId) {
      return safeAck(ack, {
        success: false,
        message: "Notification ID is required",
      });
    }

    try {
      const notification = await getNotificationByIdService(notificationId);
      if (notification.userId !== userId) {
        return safeAck(ack, { success: false, message: "Unauthorized" });
      }
      const deletedNotification =
        await softDeleteNotificationService(notificationId);
      io.to(`user:${userId}`).emit(
        SOCKET_EVENTS.NOTIFICATION_SOFT_DELETE,
        deletedNotification,
      );
      safeAck(ack, { success: true, data: deletedNotification });
    } catch (error) {
      safeAck(ack, { success: false, message: error.message });
    }
  });
};
