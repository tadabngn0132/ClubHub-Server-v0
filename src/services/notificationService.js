import { prisma } from "../libs/prisma.js";
import { BadRequestError, NotFoundError } from "../utils/AppError.js";
import { emitToUser } from "../socket/socketGateway.js";
import { SOCKET_EVENTS } from "../utils/constant.js";

export const createNotificationService = async (notificationData) => {
  const { userId, type, message } = notificationData;

  if (!userId || !type || !message) {
    throw new BadRequestError("Missing required fields: userId, type, message");
  }

  const notification = await prisma.notification.create({
    data: {
      userId,
      type,
      message,
    },
  });

  emitToUser(userId, SOCKET_EVENTS.NOTIFICATION_RECEIVE, notification);

  return notification;
};

export const createNotificationSafe = async (notificationData) => {
  try {
    return await createNotificationService(notificationData);
  } catch (error) {
    console.error("[Notification] Failed to create notification:", error);
    return null;
  }
};

export const createNotificationsForUsersSafe = async (
  userIds,
  notificationData,
) => {
  const uniqueUserIds = [...new Set((userIds || []).map(Number).filter(Boolean))];

  if (uniqueUserIds.length === 0) {
    return [];
  }

  const tasks = uniqueUserIds.map((userId) =>
    createNotificationSafe({
      userId,
      ...notificationData,
    }),
  );

  return Promise.all(tasks);
};

export const getNotificationsService = async () => {
  return prisma.notification.findMany({
    where: { isDeleted: false },
    orderBy: { createdAt: "desc" },
  });
};

export const getNotificationByIdService = async (notificationId) => {
  const notification = await prisma.notification.findUnique({
    where: { id: notificationId, isDeleted: false },
  });

  if (!notification) {
    throw new NotFoundError("Notification not found");
  }

  emitToUser(
    notification.userId,
    SOCKET_EVENTS.NOTIFICATION_READ,
    notification,
  );

  return notification;
};

export const getNotificationByUserIdService = async (userId) => {
  return prisma.notification.findMany({
    where: { userId, isDeleted: false },
    orderBy: { createdAt: "desc" },
  });
};

export const updateNotificationService = async (
  notificationId,
  notificationData,
) => {
  const { message, isRead } = notificationData;

  const notification = await prisma.notification.findUnique({
    where: { id: notificationId, isDeleted: false },
  });

  if (!notification) {
    throw new NotFoundError("Notification not found");
  }

  return prisma.notification.update({
    where: { id: notificationId },
    data: {
      ...(message !== undefined && { message }),
      ...(isRead !== undefined && { isRead }),
    },
  });
};

export const markAllNotificationsAsReadService = async (userId) => {
  const result = await prisma.notification.updateMany({
    where: { userId, isDeleted: false, isRead: false },
    data: { isRead: true },
  });

  const updatedNotifications = await prisma.notification.findMany({
    where: { userId, isDeleted: false },
    orderBy: { createdAt: "desc" },
  });

  updatedNotifications.forEach((notification) => {
    emitToUser(
      notification.userId,
      SOCKET_EVENTS.NOTIFICATION_READ,
      notification,
    );
  });

  return result;
};

export const softDeleteNotificationService = async (notificationId) => {
  const notification = await prisma.notification.findUnique({
    where: { id: notificationId, isDeleted: false },
  });

  if (!notification) {
    throw new NotFoundError("Notification not found");
  }

  const deletedNotification = await prisma.notification.update({
    where: { id: notificationId },
    data: { isDeleted: true },
  });

  emitToUser(
    deletedNotification.userId,
    SOCKET_EVENTS.NOTIFICATION_SOFT_DELETE,
    deletedNotification,
  );

  return deletedNotification;
};

export const hardDeleteNotificationService = async (notificationId) => {
  const notification = await prisma.notification.findUnique({
    where: { id: notificationId },
  });

  if (!notification) {
    throw new NotFoundError("Notification not found");
  }

  return prisma.notification.delete({
    where: { id: notificationId },
  });
};

export const softDeleteNotificationsByUserIdService = async (userId) => {
  const result = await prisma.notification.updateMany({
    where: { userId, isDeleted: false },
    data: { isDeleted: true },
  });

  return result;
};

export const hardDeleteNotificationsByUserIdService = async (userId) => {
  const result = await prisma.notification.deleteMany({
    where: { userId },
  });

  return result;
};

export const emitNotificationToUser = (userId, notificationData) => {
  emitToUser(userId, SOCKET_EVENTS.NOTIFICATION_RECEIVE, notificationData);
};
