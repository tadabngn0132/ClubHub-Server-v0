import { prisma } from "../libs/prisma.js";
import { getActivityStatus, getActivityType } from "../utils/activityUtil.js";
import { ACTIVITY_STATUS } from "../utils/constant.js";
import cloudinary from "../libs/cloudinary.js";
import {
  createCalendarEventAndMeetingLink,
  updateGoogleCalendarEvent,
  deleteGoogleCalendarEvent,
  exportICSFile,
} from "../services/googleCalendarService.js";

export const createActivity = async (req, res) => {
  try {
    const payload = req.body;
    const file = req.file;
    const calendarOwnerUserId = Number(payload.organizerId || req.userId);

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

    if (file) {
      const base64 = `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;

      try {
        const uploadResult = await cloudinary.uploader.upload(base64, {
          folder: "clubhub/activities/thumbnails",
          public_id: `activity_${finalSlug}_thumbnail_${Date.now()}`,
          resource_type: "image",
        });
        payload.thumbnailUrl = uploadResult.secure_url;
        payload.thumbnailPublicId = uploadResult.public_id;
      } catch (error) {
        console.error("Cloudinary upload error:", error);
        return res.status(500).json({
          success: false,
          message: `Cloudinary upload error: ${error.message}`,
        });
      }
    }

    const newActivity = await prisma.activity.create({
      data: {
        title: payload.title,
        description: payload.description,
        slug: finalSlug,
        startDate: new Date(payload.startDate),
        endDate: new Date(payload.endDate),
        locationType: payload.locationType,
        venueName: payload.venueName || null,
        venueAddress: payload.venueAddress || null,
        roomNumber: payload.roomNumber || null,
        type: getActivityType(payload.type.trim().toLowerCase()),
        status: getActivityStatus(payload.status.trim().toLowerCase()),
        organizerId: Number(payload.organizerId),
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

    const calendarPayload = {
      summary: newActivity.title,
      description: newActivity.description,
      startDateTime: newActivity.startDate.toISOString(),
      endDateTime: newActivity.endDate.toISOString(),
      timeZone: "Asia/Ho_Chi_Minh",
      locationType: newActivity.locationType,
    };

    const calendarEventData = await createCalendarEventAndMeetingLink(
      calendarOwnerUserId,
      calendarPayload,
    );

    const updatedActivity = await prisma.activity.update({
      where: { id: newActivity.id },
      data: {
        googleCalendarEventId: calendarEventData.id,
        meetingLink:
          calendarEventData.conferenceData?.entryPoints?.[0]?.uri || null,
      },
    });

    res.status(201).json({
      success: true,
      message: "Activity created successfully",
      data: updatedActivity,
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
    const {page = 1, limit = 10} = req.query;
    const offset = (page - 1) * limit;
    const activities = await prisma.activity.findMany({
      skip: offset,
      take: Number(limit),
    });

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
    const file = req.file;

    const storedActivity = await prisma.activity.findUnique({
      where: { id: Number(id) },
    });

    if (!storedActivity) {
      return res.status(404).json({
        success: false,
        message: "Activity not found",
      });
    }

    if (file) {
      const base64 = `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;

      try {
        const uploadResult = await cloudinary.uploader.upload(base64, {
          folder: "clubhub/activities/thumbnails",
          public_id: `activity_${storedActivity.slug}_thumbnail_${Date.now()}`,
          resource_type: "image",
        });
        payload.thumbnailUrl = uploadResult.secure_url;
        payload.thumbnailPublicId = uploadResult.public_id;

        if (storedActivity.thumbnailPublicId) {
          cloudinary.uploader.destroy(
            storedActivity.thumbnailPublicId,
            (error, result) => {
              if (error) {
                console.log("Cloudinary deletion error:", error);
              } else {
                console.log("Cloudinary deletion result:", result);
              }
            },
          );
        }
      } catch (error) {
        console.error("Cloudinary upload error:", error);
        return res.status(500).json({
          success: false,
          message: `Cloudinary upload error: ${error.message}`,
        });
      }
    }

    const updatedActivity = await prisma.activity.update({
      where: { id: Number(id) },
      data: {
        title: payload.title,
        description: payload.description,
        startDate: new Date(payload.startDate),
        endDate: new Date(payload.endDate),
        locationType: payload.locationType,
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

    const calendarEventData = await updateGoogleCalendarEvent(
      Number(payload.organizerId || req.userId),
      storedActivity.googleCalendarEventId,
      updatedActivity,
    );

    const finalUpdatedActivity = await prisma.activity.update({
      where: { id: Number(id) },
      data: {
        googleCalendarEventId: calendarEventData.id,
        meetingLink:
          calendarEventData.conferenceData?.entryPoints?.[0]?.uri || null,
      },
    });

    res.status(200).json({
      success: true,
      message: "Activity updated successfully",
      data: finalUpdatedActivity,
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

    const existingActivity = await prisma.activity.findUnique({
      where: { id: Number(id) },
    });

    if (!existingActivity) {
      return res.status(404).json({
        success: false,
        message: "Activity not found",
      });
    }

    const deletedActivity = await prisma.activity.update({
      where: { id: Number(id) },
      data: {
        status: ACTIVITY_STATUS.CANCELLED,
        isDeleted: true,
      },
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
      cloudinary.uploader.destroy(
        storedActivity.thumbnailPublicId,
        (error, result) => {
          if (error) {
            console.log("Cloudinary deletion error:", error);
          } else {
            console.log("Cloudinary deletion result:", result);
          }
        },
      );
    }

    await deleteGoogleCalendarEvent(
      Number(storedActivity.organizerId || req.userId),
      storedActivity.googleCalendarEventId,
    );

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

export const createActivityImage = async (req, res) => {
  try {
    const { activityId } = req.params;
    const payload = req.body;

    const storedActivity = await prisma.activity.findUnique({
      where: { id: Number(activityId) },
    });

    if (!storedActivity) {
      return res.status(404).json({
        success: false,
        message: "Activity not found",
      });
    }

    const createdImage = await prisma.activityImage.create({
      data: {
        imageUrl: payload.secure_url,
        imagePublicId: payload.public_id,
        activityId: Number(activityId),
      },
    });

    res.status(201).json({
      success: true,
      message: "Activity images uploaded and created successfully",
      data: createdImage,
    });
  } catch (err) {
    console.log("Error create activity image function: ", err.message);
    res.status(500).json({
      success: false,
      message: `Internal server error / Create activity image error: ${err.message}`,
    });
  }
};

export const deleteActivityImage = async (req, res) => {
  try {
    const { imageId } = req.params;
    const storedImage = await prisma.activityImage.findUnique({
      where: { id: Number(imageId) },
    });

    if (!storedImage) {
      return res.status(404).json({
        success: false,
        message: "Activity image not found",
      });
    }

    if (storedImage.imagePublicId) {
      cloudinary.uploader.destroy(
        storedImage.imagePublicId,
        (error, result) => {
          if (error) {
            console.log("Cloudinary deletion error:", error);
          } else {
            console.log("Cloudinary deletion result:", result);
          }
        },
      );
    }

    const deletedImage = await prisma.activityImage.delete({
      where: { id: Number(imageId) },
    });

    res.status(200).json({
      success: true,
      message: "Activity image deleted successfully",
      data: deletedImage,
    });
  } catch (err) {
    console.log("Error delete activity image function: ", err.message);
    res.status(500).json({
      success: false,
      message: `Internal server error / Delete activity image error: ${err.message}`,
    });
  }
};

export const createActivityVideo = async (req, res) => {
  try {
    const { activityId } = req.params;
    const payload = req.body;

    const storedActivity = await prisma.activity.findUnique({
      where: { id: Number(activityId) },
    });

    if (!storedActivity) {
      return res.status(404).json({
        success: false,
        message: "Activity not found",
      });
    }

    const createdVideo = await prisma.activityVideo.create({
      data: {
        videoUrl: payload.secure_url,
        videoPublicId: payload.public_id,
        activityId: Number(activityId),
      },
    });

    res.status(201).json({
      success: true,
      message: "Activity video created successfully",
      data: createdVideo,
    });
  } catch (err) {
    console.log("Error create activity video function: ", err.message);
    res.status(500).json({
      success: false,
      message: `Internal server error / Create activity video error: ${err.message}`,
    });
  }
};

export const deleteActivityVideo = async (req, res) => {
  try {
    const { videoId } = req.params;
    const storedVideo = await prisma.activityVideo.findUnique({
      where: { id: Number(videoId) },
    });

    if (!storedVideo) {
      return res.status(404).json({
        success: false,
        message: "Activity video not found",
      });
    }

    if (storedVideo.videoPublicId) {
      cloudinary.uploader.destroy(
        storedVideo.videoPublicId,
        { resource_type: "video" },
        (error, result) => {
          if (error) {
            console.log("Cloudinary deletion error:", error);
          } else {
            console.log("Cloudinary deletion result:", result);
          }
        },
      );
    }

    const deletedVideo = await prisma.activityVideo.delete({
      where: { id: Number(videoId) },
    });

    res.status(200).json({
      success: true,
      message: "Activity video deleted successfully",
      data: deletedVideo,
    });
  } catch (err) {
    console.log("Error delete activity video function: ", err.message);
    res.status(500).json({
      success: false,
      message: `Internal server error / Delete activity video error: ${err.message}`,
    });
  }
};

export const getICSFile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { activityId } = req.params;

    const storedActivity = await prisma.activity.findUnique({
      where: { id: Number(activityId) },
    });

    if (!storedActivity) {
      return res.status(404).json({
        success: false,
        message: "Activity not found",
      });
    }

    const icsFileData = await exportICSFile(userId, storedActivity.id, storedActivity.googleCalendarEventId);

    res.setHeader("Content-Type", "text/calendar");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=activity_${storedActivity.slug}.ics`,
    );
    res.status(200).send(icsFileData);
  } catch (err) {
    console.log("Error get ICS file function: ", err.message);
    res.status(500).json({
      success: false,
      message: `Internal server error / Get ICS file error: ${err.message}`,
    });
  }
};
