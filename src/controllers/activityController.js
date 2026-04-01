import { prisma } from "../libs/prisma.js";
import { getActivityStatus, getActivityType } from "../utils/activityUtil.js";
import { ACTIVITY_STATUS } from "../utils/constant.js";
import cloudinary from "../libs/cloudinary.js";
import {
  createUserCalendarEvent,
  updateUserCalendarEvent,
  deleteUserCalendarEvent,
  findUserCalendarEventByActivityId,
} from "../services/googleCalendarService.js";

const buildActivityCalendarEventData = (activity) => {
  return {
    summary: activity.title,
    description: activity.description,
    location: activity.venueAddress || activity.venueName || activity.meetingLink || "",
    startDateTime: new Date(activity.startDate).toISOString(),
    endDateTime: new Date(activity.endDate).toISOString(),
    extendedProperties: {
      private: {
        activityId: String(activity.id),
        activitySlug: activity.slug,
      },
    },
  };
};

const applyGoogleMeetDetailsToActivity = async (activityId, calendarEvent) => {
  const meetLink =
    calendarEvent?.hangoutLink ||
    calendarEvent?.conferenceData?.entryPoints?.find(
      (entry) => entry.entryPointType === "video",
    )?.uri ||
    null;
  const meetId = calendarEvent?.conferenceData?.conferenceId || null;

  if (!meetLink && !meetId) {
    return null;
  }

  return prisma.activity.update({
    where: { id: Number(activityId) },
    data: {
      meetingPlatform: "GOOGLE_MEET",
      meetingLink: meetLink,
      meetingId: meetId,
    },
  });
};

const trySyncCreateActivityCalendarEvent = async (activity, userId) => {
  const eventData = buildActivityCalendarEventData(activity);
  return createUserCalendarEvent(userId, eventData);
};

const trySyncUpdateActivityCalendarEvent = async (activity, userId) => {
  const eventData = buildActivityCalendarEventData(activity);
  const linkedEvent = await findUserCalendarEventByActivityId(userId, activity.id);

  if (linkedEvent?.id) {
    return updateUserCalendarEvent(userId, linkedEvent.id, eventData);
  }

  return createUserCalendarEvent(userId, eventData);
};

const trySyncDeleteActivityCalendarEvent = async (activityId, userId) => {
  const linkedEvent = await findUserCalendarEventByActivityId(userId, activityId);

  if (!linkedEvent?.id) {
    return null;
  }

  await deleteUserCalendarEvent(userId, linkedEvent.id);
  return linkedEvent.id;
};

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
      base64 = `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;

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

    let calendarSync = {
      synced: false,
      eventId: null,
      error: null,
    };

    try {
      const calendarEvent = await trySyncCreateActivityCalendarEvent(
        newActivity,
        calendarOwnerUserId,
      );
      await applyGoogleMeetDetailsToActivity(newActivity.id, calendarEvent);
      if (calendarEvent?.hangoutLink) {
        newActivity.meetingPlatform = "GOOGLE_MEET";
        newActivity.meetingLink = calendarEvent.hangoutLink;
        newActivity.meetingId = calendarEvent?.conferenceData?.conferenceId || null;
      }
      calendarSync = {
        synced: true,
        eventId: calendarEvent?.id || null,
        error: null,
      };
    } catch (calendarError) {
      calendarSync.error = calendarError.message;
    }

    res.status(201).json({
      success: true,
      message: "Activity created successfully",
      data: newActivity,
      calendarSync,
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
      base64 = `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;

      try {
        const uploadResult = await cloudinary.uploader.upload(base64, {
          folder: "clubhub/activities/thumbnails",
          public_id: `activity_${finalSlug}_thumbnail_${Date.now()}`,
          resource_type: "image",
        });
        payload.thumbnailUrl = uploadResult.secure_url;
        payload.thumbnailPublicId = uploadResult.public_id;

        if (storedActivity.thumbnailPublicId) {
          cloudinary.uploader.destroy(storedActivity.thumbnailPublicId, (error, result) => {
            if (error) {
              console.log("Cloudinary deletion error:", error);
            } else {
              console.log("Cloudinary deletion result:", result);
            }
          });
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

    const calendarOwnerUserId = Number(updatedActivity.organizerId || req.userId);
    let calendarSync = {
      synced: false,
      eventId: null,
      error: null,
    };

    try {
      const calendarEvent = await trySyncUpdateActivityCalendarEvent(
        updatedActivity,
        calendarOwnerUserId,
      );
      await applyGoogleMeetDetailsToActivity(updatedActivity.id, calendarEvent);
      if (calendarEvent?.hangoutLink) {
        updatedActivity.meetingPlatform = "GOOGLE_MEET";
        updatedActivity.meetingLink = calendarEvent.hangoutLink;
        updatedActivity.meetingId = calendarEvent?.conferenceData?.conferenceId || null;
      }
      calendarSync = {
        synced: true,
        eventId: calendarEvent?.id || null,
        error: null,
      };
    } catch (calendarError) {
      calendarSync.error = calendarError.message;
    }

    res.status(200).json({
      success: true,
      message: "Activity updated successfully",
      data: updatedActivity,
      calendarSync,
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

    const calendarOwnerUserId = Number(deletedActivity.organizerId || req.userId);
    let calendarSync = {
      synced: false,
      eventId: null,
      error: null,
    };

    try {
      const deletedEventId = await trySyncDeleteActivityCalendarEvent(
        deletedActivity.id,
        calendarOwnerUserId,
      );
      calendarSync = {
        synced: true,
        eventId: deletedEventId,
        error: null,
      };
    } catch (calendarError) {
      calendarSync.error = calendarError.message;
    }

    res.status(200).json({
      success: true,
      message: "Activity soft deleted successfully",
      data: deletedActivity,
      calendarSync,
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

    const calendarOwnerUserId = Number(storedActivity.organizerId || req.userId);
    let calendarSync = {
      synced: false,
      eventId: null,
      error: null,
    };

    try {
      const deletedEventId = await trySyncDeleteActivityCalendarEvent(
        storedActivity.id,
        calendarOwnerUserId,
      );
      calendarSync = {
        synced: true,
        eventId: deletedEventId,
        error: null,
      };
    } catch (calendarError) {
      calendarSync.error = calendarError.message;
    }

    const deletedActivity = await prisma.activity.delete({
      where: { id: Number(id) },
    });

    res.status(200).json({
      success: true,
      message: "Activity deleted successfully",
      data: deletedActivity,
      calendarSync,
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
      cloudinary.uploader.destroy(storedImage.imagePublicId, (error, result) => {
        if (error) {
          console.log("Cloudinary deletion error:", error);
        } else {
          console.log("Cloudinary deletion result:", result);
        }
      });
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
      cloudinary.uploader.destroy(storedVideo.videoPublicId, { resource_type: "video" }, (error, result) => {
        if (error) {
          console.log("Cloudinary deletion error:", error);
        } else {
          console.log("Cloudinary deletion result:", result);
        }
      });
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

export const createManyActivities = async (req, res) => {
  try {
    const items = req.body?.items;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: "items array is required and cannot be empty" });
    }

    const result = await prisma.activity.createMany({ data: items, skipDuplicates: true });
    res.status(201).json({ success: true, message: "Activities createMany successful", data: result });
  } catch (err) {
    console.error("Error in createManyActivities:", err);
    res.status(500).json({ success: false, message: `Internal server error / Create many activities error: ${err.message}` });
  }
};

export const getManyActivities = async (req, res) => {
  try {
    const ids = Array.isArray(req.body?.ids)
      ? req.body.ids.map((id) => Number(id)).filter((id) => Number.isFinite(id))
      : [];

    if (ids.length === 0) {
      return res.status(400).json({ success: false, message: "ids array is required and cannot be empty" });
    }

    const records = await prisma.activity.findMany({ where: { id: { in: ids } } });
    res.status(200).json({ success: true, message: "Activities getMany successful", data: records });
  } catch (err) {
    console.error("Error in getManyActivities:", err);
    res.status(500).json({ success: false, message: `Internal server error / Get many activities error: ${err.message}` });
  }
};

export const updateManyActivities = async (req, res) => {
  try {
    const ids = Array.isArray(req.body?.ids)
      ? req.body.ids.map((id) => Number(id)).filter((id) => Number.isFinite(id))
      : [];
    const updateData = req.body?.data;

    if (ids.length === 0) {
      return res.status(400).json({ success: false, message: "ids array is required and cannot be empty" });
    }
    if (!updateData || typeof updateData !== "object" || Array.isArray(updateData) || Object.keys(updateData).length === 0) {
      return res.status(400).json({ success: false, message: "data object is required and cannot be empty" });
    }

    const result = await prisma.activity.updateMany({ where: { id: { in: ids } }, data: updateData });
    res.status(200).json({ success: true, message: "Activities updateMany successful", data: result });
  } catch (err) {
    console.error("Error in updateManyActivities:", err);
    res.status(500).json({ success: false, message: `Internal server error / Update many activities error: ${err.message}` });
  }
};

export const softDeleteManyActivities = async (req, res) => {
  try {
    const ids = Array.isArray(req.body?.ids)
      ? req.body.ids.map((id) => Number(id)).filter((id) => Number.isFinite(id))
      : [];

    if (ids.length === 0) {
      return res.status(400).json({ success: false, message: "ids array is required and cannot be empty" });
    }

    const result = await prisma.activity.updateMany({
      where: { id: { in: ids } },
      data: { isDeleted: true, status: ACTIVITY_STATUS.CANCELLED },
    });

    res.status(200).json({ success: true, message: "Activities softDeleteMany successful", data: result });
  } catch (err) {
    console.error("Error in softDeleteManyActivities:", err);
    res.status(500).json({ success: false, message: `Internal server error / Soft delete many activities error: ${err.message}` });
  }
};

export const hardDeleteManyActivities = async (req, res) => {
  try {
    const ids = Array.isArray(req.body?.ids)
      ? req.body.ids.map((id) => Number(id)).filter((id) => Number.isFinite(id))
      : [];

    if (ids.length === 0) {
      return res.status(400).json({ success: false, message: "ids array is required and cannot be empty" });
    }

    const result = await prisma.activity.deleteMany({ where: { id: { in: ids } } });
    res.status(200).json({ success: true, message: "Activities hardDeleteMany successful", data: result });
  } catch (err) {
    console.error("Error in hardDeleteManyActivities:", err);
    res.status(500).json({ success: false, message: `Internal server error / Hard delete many activities error: ${err.message}` });
  }
};
