import {
    createNotificationService,
    getNotificationsService,
    getNotificationByUserIdService,
    getNotificationByIdService,
    updateNotificationService,
    softDeleteNotificationService,
    hardDeleteNotificationService,
    softDeleteNotificationsByUserIdService,
    hardDeleteNotificationsByUserIdService,
} from '../services/notificationService.js';

const handleError = (res, err, context) => {
    if (err.isOperational) {
        return res.status(err.statusCode).json({ success: false, message: err.message });
    }
    console.error(`Unexpected error in ${context}:`, err);
    res.status(500).json({ success: false, message: `Internal server error / ${context} error: ${err.message}` });
}

export const createNotification = async (req, res) => {
    try {
        const notificationData = req.body;

        const newNotification = await createNotificationService(notificationData);
        res.status(201).json({
            success: true,
            message: "Notification created successfully",
            data: newNotification
        });
    } catch (err) {
        handleError(res, err, "createNotification");
    }
}

export const getNotifications = async (req, res) => {
    try {
        const notifications = await getNotificationsService();
        res.status(200).json({
            success: true,
            message: "Notifications retrieved successfully",
            data: notifications
        });
    } catch (err) {
        handleError(res, err, "getNotifications");
    }
}

export const getNotificationByUserId = async (req, res) => {
    try {
        const { userId } = req.params;
        const notifications = await getNotificationByUserIdService(Number(userId));
        res.status(200).json({
            success: true,
            message: "Notifications retrieved successfully",
            data: notifications
        });
    } catch (err) {
        handleError(res, err, "getNotificationByUserId");
    }
}

export const getNotificationById = async (req, res) => {
    try {
        const { id } = req.params;
        const notification = await getNotificationByIdService(Number(id));
        res.status(200).json({
            success: true,
            message: "Notification retrieved successfully",
            data: notification
        });
    } catch (err) {
        handleError(res, err, "getNotificationById");
    }
}

export const updateNotification = async (req, res) => {
    try {
        const { id } = req.params;
        const notificationData = req.body;
        const updatedNotification = await updateNotificationService(Number(id), notificationData);
        res.status(200).json({
            success: true,
            message: "Notification updated successfully",
            data: updatedNotification
        });
    } catch (err) {
        handleError(res, err, "updateNotification");
    }
}

export const softDeleteNotification = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedNotification = await softDeleteNotificationService(Number(id));
        res.status(200).json({
            success: true,
            message: "Notification soft deleted successfully",
            data: deletedNotification
        });
    } catch (err) {
        handleError(res, err, "softDeleteNotification");
    }
}

export const hardDeleteNotification = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedNotification = await hardDeleteNotificationService(Number(id));
        res.status(200).json({
            success: true,
            message: "Notification hard deleted successfully",
            data: deletedNotification
        });
    } catch (err) {
        handleError(res, err, "hardDeleteNotification");
    }
}

export const softDeleteNotificationsByUserId = async (req, res) => {
    try {
        const { userId } = req.params;
        const result = await softDeleteNotificationsByUserIdService(Number(userId));
        res.status(200).json({
            success: true,
            message: "Notifications soft deleted successfully",
            data: result
        });
    } catch (err) {
        handleError(res, err, "softDeleteNotificationsByUserId");
    }
}

export const hardDeleteNotificationsByUserId = async (req, res) => {
    try {
        const { userId } = req.params;
        const result = await hardDeleteNotificationsByUserIdService(Number(userId));
        res.status(200).json({
            success: true,
            message: "Notifications hard deleted successfully",
            data: result
        });
    } catch (err) {
        handleError(res, err, "hardDeleteNotificationsByUserId");
    }
}