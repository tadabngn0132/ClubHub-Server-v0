import { prisma } from "../libs/prisma.js";
import { SOCKET_EVENTS } from "../utils/constant.js";
import { emitToUser } from "../socket/socketGateway.js";

export const createNotificationService = async (userId, message) => {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId: Number(userId),
        message,
      },
    });

    return notification;
  } catch (err) {
    console.error("Error in createNotification function:", err);
    throw new Error("Failed to create notification");
  }
};

export const getNotificationsService = async () => {
  try {
    const notifications = await prisma.notification.findMany();
    return notifications;
  } catch (err) {
    console.error("Error in getNotifications function:", err);
    throw new Error("Failed to get notifications");
  }
};

export const getNotificationByIdService = async (id) => {
  try {
    const notification = await prisma.notification.findUnique({
      where: { id: Number(id) },
    });
    if (!notification) {
      throw new Error("Notification not found");
    }
    return notification;
  } catch (err) {
    console.error("Error in getNotificationById function:", err);
    throw new Error("Failed to get notification by ID");
  }
};

export const deleteNotificationService = async (id) => {
  try {
    const notification = await prisma.notification.findUnique({
      where: { id: Number(id) },
    });
    if (!notification) {
      throw new Error("Notification not found");
    }
    const deletedNotification = await prisma.notification.delete({
      where: { id: Number(id) },
    });
    return deletedNotification;
  } catch (err) {
    console.error("Error in deleteNotification function:", err);
    throw new Error("Failed to delete notification");
  }
};

export const getNotificationsByUserIdService = async (userId) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: Number(userId) },
    });
    return notifications;
  } catch (err) {
    console.error("Error in getNotificationsByUserId function:", err);
    throw new Error("Failed to get notifications by user ID");
  }
};

export const updateNotificationService = async (id, message, isRead) => {
  try {
    const notification = await prisma.notification.findUnique({
      where: { id: Number(id) },
    });
    if (!notification) {
      throw new Error("Notification not found");
    }
    const updatedNotification = await prisma.notification.update({
      where: { id: Number(id) },
      data: {
        message: message || notification.message,
        isRead: typeof isRead === "boolean" ? isRead : notification.isRead,
      },
    });

    return updatedNotification;
  } catch (err) {
    console.error("Error in updateNotification function:", err);
    throw new Error("Failed to update notification");
  }
};

export const deleteNotificationByUserIdService = async (userId) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: Number(userId) },
    });
    if (notifications.length === 0) {
      throw new Error("No notifications found for this user");
    }
    const deletedNotifications = await prisma.notification.deleteMany({
      where: { userId: Number(userId) },
    });
    return deletedNotifications;
  } catch (err) {
    console.error("Error in deleteNotificationByUserId function:", err);
    throw new Error("Failed to delete notifications by user ID");
  }
};

export const deleteNotificationByIdService = async (id) => {
  try {
    const notification = await prisma.notification.findUnique({
      where: { id: Number(id) },
    });

    if (!notification) {
      throw new Error("Notification not found");
    }

    const deletedNotification = await prisma.notification.delete({
      where: { id: Number(id) },
    });

    emitToUser(notification.userId, SOCKET_EVENTS.NOTIFICATION_DELETE, {
      id: Number(id),
    });

    return deletedNotification;
  } catch (err) {
    console.error("Error in deleteNotificationById function:", err);
    throw new Error("Failed to delete notification by ID");
  }
};
