import { prisma } from "../libs/prisma.js";

export const getNotificationPreferencesByUserId = async (req, res) => {
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
    console.error("Error retrieving notification preferences:", err);
    res.status(500).json({
      success: false,
      message: `Internal server error / Get notification preferences error: ${err.message}`,
    });
  }
};

export const updateNotificationPreferencesByUserId = async (req, res) => {
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
    console.error("Error updating notification preferences:", err);
    res.status(500).json({
      success: false,
      message: `Internal server error / Update notification preferences error: ${err.message}`,
    });
  }
};
