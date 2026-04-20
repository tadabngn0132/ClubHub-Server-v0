import { prisma } from "../libs/prisma.js";

export const getNotificationPreferencesByUserId = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const preferences = await prisma.notificationPreference.findMany({
      where: {
        userId: Number(userId),
      },
    });

    res.status(200).json({
      success: true,
      message: "Notification preferences retrieved successfully.",
      data: preferences,
    });
  } catch (err) {
    return next(err);
  }
};

export const updateNotificationPreferencesByUserId = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { emailNotifications, pushNotifications } = req.body;

    // Upsert notification preferences
    const updatedPreferences = await prisma.notificationPreference.upsert({
      where: { userId: Number(userId) },
      update: {
        emailNotifications,
        pushNotifications,
      },
      create: {
        userId: Number(userId),
        emailNotifications,
        pushNotifications,
      },
    });

    res.status(200).json({
      success: true,
      message: "Notification preferences updated successfully.",
      data: updatedPreferences,
    });
  } catch (err) {
    return next(err);
  }
};
