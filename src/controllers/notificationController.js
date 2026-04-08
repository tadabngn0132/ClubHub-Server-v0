import {
  createNotificationService,
  updateNotificationService,
  getNotificationsService,
  getNotificationByIdService,
  deleteNotificationService,
  getNotificationsByUserIdService,
  deleteNotificationByUserIdService,
  deleteNotificationByIdService,
} from "../services/notificationService.js";

export const createNotification = async (req, res) => {
  try {
    const { userId, message } = req.body;
    const notification = await createNotificationService(userId, message);

    res.status(201).json({
      success: true,
      message: "Notification created successfully",
      data: notification,
    });
  } catch (err) {
    console.error("Error in createNotification function:", err);
    res.status(500).json({
      success: false,
      message: `Internal server error / Create notification error: ${err.message}`,
    });
  }
};

export const getNotifications = async (req, res) => {
  try {
    const notifications = await getNotificationsService();
    res.status(200).json({
      success: true,
      message: "Get all notifications successfully",
      data: notifications,
    });
  } catch (err) {
    console.error("Error in getNotifications function:", err);
    res.status(500).json({
      success: false,
      message: `Internal server error / Get notifications error: ${err.message}`,
    });
  }
};

export const getNotificationById = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await getNotificationByIdService(id);
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
  } catch (err) {
    console.error("Error in getNotificationById function:", err);
    res.status(500).json({
      success: false,
      message: `Internal server error / Get notification by ID error: ${err.message}`,
    });
  }
};

export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await deleteNotificationService(id);
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "Notification deleted successfully",
    });
  } catch (err) {
    console.error("Error in deleteNotification function:", err);
    res.status(500).json({
      success: false,
      message: `Internal server error / Delete notification error: ${err.message}`,
    });
  }
};

export const getNotificationsByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    const notifications = await getNotificationsByUserIdService(userId);
    res.status(200).json({
      success: true,
      message: "Get notifications by user ID successfully",
      data: notifications,
    });
  } catch (err) {
    console.error("Error in getNotificationsByUserId function:", err);
    res.status(500).json({
      success: false,
      message: `Internal server error / Get notifications by user ID error: ${err.message}`,
    });
  }
};

export const updateNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const { message, isRead } = req.body;
    const updatedNotification = await updateNotificationService(
      id,
      message,
      isRead
    );

    res.status(200).json({
      success: true,
      message: "Notification updated successfully",
      data: updatedNotification,
    });
  } catch (err) {
    console.error("Error in updateNotification function:", err);
    res.status(500).json({
      success: false,
      message: `Internal server error / Update notification error: ${err.message}`,
    });
  }
};

export const deleteNotificationByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    const notifications = await deleteNotificationByUserIdService(userId);
    if (notifications.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No notifications found for this user",
      });
    }
    res.status(200).json({
      success: true,
      message: "All notifications for the user deleted successfully",
    });
  } catch (err) {
    console.error("Error in deleteNotificationByUserId function:", err);
    res.status(500).json({
      success: false,
      message: `Internal server error / Delete notifications by user ID error: ${err.message}`,
    });
  }
};

export const deleteNotificationById = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await deleteNotificationByIdService(id);
    if (notification) {
      return res.status(200).json({
        success: true,
        message: "Notification deleted successfully",
      });
    }
  } catch (err) {
    console.error("Error in deleteNotificationById function:", err);
    if (err.message === "Notification not found") {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }
    res.status(500).json({
      success: false,
      message: `Internal server error / Delete notification by ID error: ${err.message}`,
    });
  }
};
