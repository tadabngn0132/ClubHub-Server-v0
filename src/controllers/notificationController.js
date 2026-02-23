import { prisma } from "../libs/prisma";

export const createNotification = async (req, res) => {
  try {
    const { userId, message } = req.body;
    const notification = await prisma.notification.create({
      data: {
        userId: Number(userId),
        message,
      },
    });
    res.status(201).json({
      success: true,
      message: "Notification created successfully",
      data: notification,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Internal server error / Create notification error: ${error.message}`,
    });
  }
};

export const getNotifications = async (req, res) => {
  try {
    const notifications = await prisma.notification.findMany();
    res.status(200).json({
      success: true,
      message: "Get all notifications successfully",
      data: notifications,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Internal server error / Get notifications error: ${error.message}`,
    });
  }
};

export const getNotificationById = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await prisma.notification.findUnique({
      where: { id: Number(id) },
    });
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "Get notification by ID successfully",
      data: notification,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Internal server error / Get notification by ID error: ${error.message}`,
    });
  }
};

export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await prisma.notification.findUnique({
      where: { id: Number(id) },
    });
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }
    await prisma.notification.delete({
      where: { id: Number(id) },
    });
    res.status(200).json({
      success: true,
      message: "Notification deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Internal server error / Delete notification error: ${error.message}`,
    });
  }
};

export const getNotificationsByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    const notifications = await prisma.notification.findMany({
      where: { userId: Number(userId) },
    });
    res.status(200).json({
      success: true,
      message: "Get notifications by user ID successfully",
      data: notifications,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Internal server error / Get notifications by user ID error: ${error.message}`,
    });
  }
};

export const updateNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;
    const notification = await prisma.notification.findUnique({
      where: { id: Number(id) },
    });
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }
    const updatedNotification = await prisma.notification.update({
      where: { id: Number(id) },
      data: {
        message: message || notification.message,
      },
    });
    res.status(200).json({
      success: true,
      message: "Notification updated successfully",
      data: updatedNotification,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Internal server error / Update notification error: ${error.message}`,
    });
  }
};

export const deleteNotificationByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    const notifications = await prisma.notification.findMany({
      where: { userId: Number(userId) },
    });
    if (notifications.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No notifications found for this user",
      });
    }
    await prisma.notification.deleteMany({
      where: { userId: Number(userId) },
    });
    res.status(200).json({
      success: true,
      message: "All notifications for the user deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Internal server error / Delete notifications by user ID error: ${error.message}`,
    });
  }
};
