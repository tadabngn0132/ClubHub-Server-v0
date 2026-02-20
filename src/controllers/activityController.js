import { prisma } from "../libs/prisma.js";

// ==========CHƯA ĐẾN SPRINT -> CHƯA TRIỂN KHAI CHÍNH XÁC -> CHƯA TEST==========

export const createActivity = async (req, res) => {
  try {
    const payload = req.body;
    const validTypes = ["MEETING", "WORKSHOP", "TRAINING", "PERFORMANCE", "COMPETITION", "SOCIAL", "VOLUNTEER"];
    const validStatuses = ["DRAFT", "PUBLISHED", "ONGOING", "COMPLETED", "CANCELLED", "POSTPONED"];

    // Kiểm tra loại hoạt động hợp lệ
    if (!validTypes.includes(payload.type)) {
      return res.status(400).json({
        success: false,
        message: "Invalid activity type",
      });
    }

    // Kiểm tra trạng thái hoạt động hợp lệ
    if (!validStatuses.includes(payload.status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid activity status",
      });
    }

    // Tạo slug từ tiêu đề hoạt động
    const activitySlug = payload.title
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9\-]/g, "");

    // Kiểm tra nếu slug đã tồn tại, thêm hậu tố ngẫu nhiên để đảm bảo tính duy nhất

    const existingActivity = await prisma.activity.findUnique({
      where: { slug: activitySlug },
    });

    let finalSlug = activitySlug;
    if (existingActivity) {
      const randomSuffix = Math.random().toString(36).substring(2, 8); // Tạo hậu tố ngẫu nhiên
      finalSlug = `${activitySlug}-${randomSuffix}`;
    }

    const newActivity = await prisma.activity.create({
      data: {
        title: payload.title,
        description: payload.description,
        slug: finalSlug,
        startDate: new Date(payload.startDate),
        endDate: new Date(payload.endDate),
        locationType: payload.locationType,
        meetingPlatform: payload.meetingPlatform || null,
        meetingLink: payload.meetingLink || null,
        meetingId: payload.meetingId || null,
        meetingPassword: payload.meetingPassword || null,
        venueName: payload.venueName || null,
        venueAddress: payload.venueAddress || null,
        roomNumber: payload.roomNumber || null,
        type: payload.type || null,
        status: payload.status || "DRAFT",
        organizerId: parseInt(payload.organizerId),
        slug: finalSlug,
        startDate: new Date(payload.startDate),
        endDate: new Date(payload.endDate),
      },
      include: {
        organizer: {
          select: {
            id: true,
            fullname: true,
            email: true,
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      message: "Activity created successfully",
      data: newActivity,
    });
  } catch (err) {
    console.log("Error create activity function: ", err.message);
    res.status(500).json({
      success: false,
      message: `Internal server error / Create activity error: ${err.message}`,
    });
  }
};

export const getActivities = async (req, res) => {
  try {
    const activities = await prisma.activity.findMany();

    res.status(200).json({
      success: true,
      message: "Get all activities successfully",
      data: activities,
    });
  } catch (err) {
    console.log("Error get activities function: ", err.message);
    res.status(500).json({
      success: false,
      message: `Internal server error / Get activities error: ${err.message}`,
    });
  }
};

export const getActivityById = async (req, res) => {
  try {
    const { id } = req.params;

    const storedActivity = await prisma.activity.findUnique({
      where: { id: Number(id) },
      include: {
        organizer: {
          select: {
            id: true,
            fullname: true,
            email: true,
          },
        },
      },
    });

    if (!storedActivity) {
      return res.status(404).json({
        success: false,
        message: "Activity not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Get activity by ID successfully",
      data: storedActivity,
    });
  } catch (err) {
    console.log("Error get activity by ID function: ", err.message);
    res.status(500).json({
      success: false,
      message: `Internal server error / Get activity by ID error: ${err.message}`,
    });
  }
};

export const getActivitiesBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const activity = await prisma.activity.findUnique({
      where: { slug: slug },
    });

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: "Activity not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Get activities by slug successfully",
      data: activity,
    });
  } catch (err) {
    console.log("Error get activities by slug function: ", err.message);
    res.status(500).json({
      success: false,
      message: `Internal server error / Get activities by slug error: ${err.message}`,
    });
  }
};

export const updateActivity = async (req, res) => {
  try {
    const { id } = req.params;
    const payload = req.body;

    const updatedActivity = await prisma.activity.update({
      where: { id: Number(id) },
      data: {
        title: payload.title,
        description: payload.description,
        startDate: new Date(payload.startDate),
        endDate: new Date(payload.endDate),
        locationType: payload.locationType,
        meetingPlatform: payload.meetingPlatform,
        meetingLink: payload.meetingLink,
        meetingId: payload.meetingId,
        meetingPassword: payload.meetingPassword,
        venueName: payload.venueName,
        venueAddress: payload.venueAddress,
        roomNumber: payload.roomNumber,
        type: payload.type,
        status: payload.status,
        organizerId: payload.organizerId,
      },
    });

    res.status(200).json({
      success: true,
      message: "Activity updated successfully",
      data: updatedActivity,
    });
  } catch (err) {
    console.log("Error update activity function: ", err.message);
    res.status(500).json({
      success: false,
      message: `Internal server error / Update activity error: ${err.message}`,
    });
  }
};

export const deleteActivity = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedActivity = await prisma.activity.delete({
      where: { id: Number(id) },
    });

    res.status(200).json({
      success: true,
      message: "Activity deleted successfully",
      data: deletedActivity,
    });
  } catch (err) {
    console.log("Error delete activity function: ", err.message);
    res.status(500).json({
      success: false,
      message: `Internal server error / Delete activity error: ${err.message}`,
    });
  }
};

export const getActivitiesByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    const activities = await prisma.activity.findMany({
      where: { userId: Number(userId) },
    });

    res.status(200).json({
      success: true,
      message: "Get activities by user ID successfully",
      data: activities,
    });
  } catch (err) {
    console.log("Error get activities by user ID function: ", err.message);
    res.status(500).json({
      success: false,
      message: `Internal server error / Get activities by user ID error: ${err.message}`,
    });
  }
};
