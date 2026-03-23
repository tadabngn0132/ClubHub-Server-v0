import { prisma } from "../libs/prisma.js";
import { getActivityStatus, getActivityType } from "../utils/activityUtil.js";
import { ACTIVITY_STATUS } from "../utils/constant.js";
import multer from "multer";
import cloudinary from "./src/libs/cloudinary.js";

const storage = multer.memoryStorage();
const upload = multer({ storage });

export const createActivity = async (req, res) => {
  try {
    const payload = req.body;

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

    if (payload.thumbnail) {
      if (!payload.thumbnail.startsWith("data:image/")) {
        return res.status(400).json({
          success: false,
          message: "Invalid thumbnail format. Expected a base64-encoded image string.",
        });
      }

      if (payload.thumbnail.length > 10 * 1024 * 1024) { // Giới hạn kích thước ảnh tối đa 10MB
        return res.status(400).json({
          success: false,
          message: "Thumbnail size exceeds the 10MB limit.",
        });
      }

      const uploadResult = await cloudinary.uploader
        .upload(payload.thumbnail, {
          folder: "clubhub/activities/thumbnails",
        })
        .catch((error) => {
          console.log("Cloudinary upload error:", error);
          return res.status(500).json({
            success: false,
            message: `Cloudinary upload error: ${error.message}`,
          });
        });
      payload.thumbnailUrl = uploadResult.secure_url;
      payload.thumbnailPublicId = uploadResult.public_id;
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
        type: getActivityType(payload.type.trim().toLowerCase()),
        status: getActivityStatus(payload.status.trim().toLowerCase()),
        organizerId: Number(payload.organizerId),
        slug: finalSlug,
        startDate: new Date(payload.startDate),
        endDate: new Date(payload.endDate),
        thumbnailUrl: payload.thumbnailUrl || null,
        thumbnailPublicId: payload.thumbnailPublicId || null,
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

    if (payload.thumbnail) {
      if (!payload.thumbnail.startsWith("data:image/")) {
        return res.status(400).json({
          success: false,          message: "Invalid thumbnail format. Expected a base64-encoded image string.",
        });
      }

      if (payload.thumbnail.length > 10 * 1024 * 1024) { // Giới hạn kích thước ảnh tối đa 10MB
        return res.status(400).json({
          success: false,
          message: "Thumbnail size exceeds the 10MB limit.",
        });
      }

      const uploadResult = await cloudinary.uploader
        .upload(payload.thumbnail, {
          folder: "clubhub/activities/thumbnails",
        })
        .catch((error) => {
          console.log("Cloudinary upload error:", error);
          return res.status(500).json({
            success: false,
            message: `Cloudinary upload error: ${error.message}`,
          });
        }
      );
      payload.thumbnailUrl = uploadResult.secure_url;
      payload.thumbnailPublicId = uploadResult.public_id;
    }

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
        type: getActivityType(payload.type.trim().toLowerCase()),
        status: getActivityStatus(payload.status.trim().toLowerCase()),
        organizerId: payload.organizerId,
        thumbnailUrl: payload.thumbnailUrl,
        thumbnailPublicId: payload.thumbnailPublicId,
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

export const softDeleteActivity = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedActivity = await prisma.activity.update({
      where: { id: Number(id) },
      data: { status: ACTIVITY_STATUS.CANCELLED },
    });

    res.status(200).json({
      success: true,
      message: "Activity soft deleted successfully",
      data: deletedActivity,
    });
  } catch (err) {
    console.log("Error soft delete activity function: ", err.message);
    res.status(500).json({
      success: false,
      message: `Internal server error / Soft delete activity error: ${err.message}`,
    });
  }
};

export const hardDeleteActivity = async (req, res) => {
  try {
    const { id } = req.params;

    const storedActivity = await prisma.activity.findUnique({
      where: { id: Number(id) },
    });

    if (!storedActivity) {
      return res.status(404).json({
        success: false,
        message: "Activity not found",
      });
    }
    
    if (storedActivity.thumbnailPublicId) {
      cloudinary.uploader.destroy(storedActivity.thumbnailPublicId, (error, result) => {
        if (error) {
          console.log("Cloudinary deletion error:", error);
        } else {
          console.log("Cloudinary deletion result:", result);
        }
      });
    }

    const deletedActivity = await prisma.activity.delete({
      where: { id: Number(id) },
    });

    res.status(200).json({
      success: true,
      message: "Activity deleted successfully",
      data: deletedActivity,
    });
  } catch (err) {
    console.log("Error hard delete activity function: ", err.message);
    res.status(500).json({
      success: false,
      message: `Internal server error / Hard delete activity error: ${err.message}`,
    });
  }
};

export const getActivitiesByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    const activities = await prisma.activity.findMany({
      where: { organizerId: Number(userId) },
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
