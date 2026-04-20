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
    markAllNotificationsAsReadService
} from '../services/notificationService.js';

const handleError = (next, err) => next(err);

export const createNotification = async (req, res, next) => {
    try {
        const notificationData = req.body;

        const newNotification = await createNotificationService(notificationData);
        res.status(201).json({
            success: true,
            message: "Notification created successfully",
            data: newNotification
        });
    } catch (err) {
        handleError(next, err);
    }
}

export const getNotifications = async (req, res, next) => {
    try {
        const notifications = await getNotificationsService();
        res.status(200).json({
            success: true,
            message: "Notifications retrieved successfully",
            data: notifications
        });
    } catch (err) {
        handleError(next, err);
    }
}

export const getNotificationByUserId = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const notifications = await getNotificationByUserIdService(Number(userId));
        res.status(200).json({
            success: true,
            message: "Notifications retrieved successfully",
            data: notifications
        });
    } catch (err) {
        handleError(next, err);
    }
}

export const getNotificationById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const notification = await getNotificationByIdService(Number(id));
        res.status(200).json({
            success: true,
            message: "Notification retrieved successfully",
            data: notification
        });
    } catch (err) {
        handleError(next, err);
    }
}

export const updateNotification = async (req, res, next) => {
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
        handleError(next, err);
    }
}

export const markAllNotificationsAsRead = async (req, res, next) => {
    try {
        const { userId } = req.params;

        const result = await markAllNotificationsAsReadService(Number(userId));
        res.status(200).json({
            success: true,
            message: "All notifications marked as read successfully",
            data: result
        });
    } catch (err) {
        handleError(next, err);
    }
}

export const softDeleteNotification = async (req, res, next) => {
    try {
        const { id } = req.params;
        const deletedNotification = await softDeleteNotificationService(Number(id));
        res.status(200).json({
            success: true,
            message: "Notification soft deleted successfully",
            data: deletedNotification
        });
    } catch (err) {
        handleError(next, err);
    }
}

export const hardDeleteNotification = async (req, res, next) => {
    try {
        const { id } = req.params;
        const deletedNotification = await hardDeleteNotificationService(Number(id));
        res.status(200).json({
            success: true,
            message: "Notification hard deleted successfully",
            data: deletedNotification
        });
    } catch (err) {
        handleError(next, err);
    }
}

export const softDeleteNotificationsByUserId = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const result = await softDeleteNotificationsByUserIdService(Number(userId));
        res.status(200).json({
            success: true,
            message: "Notifications soft deleted successfully",
            data: result
        });
    } catch (err) {
        handleError(next, err);
    }
}

export const hardDeleteNotificationsByUserId = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const result = await hardDeleteNotificationsByUserIdService(Number(userId));
        res.status(200).json({
            success: true,
            message: "Notifications hard deleted successfully",
            data: result
        });
    } catch (err) {
        handleError(next, err);
    }
}