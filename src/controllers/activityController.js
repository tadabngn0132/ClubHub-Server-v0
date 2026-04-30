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
import { indexActivity } from "../services/knowledgeIndexerService.js";
import { deleteChunksBySource } from "../services/documentChunkService.js";
import { logSystemAction } from "../services/auditLogService.js";
import { AppError } from "../utils/AppError.js";
import { withSoftDeleteFilter } from "../utils/queryUtil.js";

const activityIncludes = {
  organizer: {
    select: {
      id: true,
      fullname: true,
      email: true,
      avatarUrl: true,
    },
  },
  activityParticipations: {
    select: {
      id: true,
      guestName: true,
      guestEmail: true,
      guestPhoneNumber: true,
      status: true,
      registeredAt: true,
      user: {
        select: {
          id: true,
          fullname: true,
          email: true,
          avatarUrl: true,
        },
      },
    },
  },
  images: {
    select: {
      id: true,
      imageUrl: true,
    },
  },
  videos: {
    select: {
      id: true,
      videoUrl: true,
    },
  },
};

const formatalendarPayload = (activity) => ({
  summary: activity.title,
  description: activity.description,
  startDateTime: activity.startDate.toISOString(),
  endDateTime: activity.endDate.toISOString(),
  timeZone: "Asia/Ho_Chi_Minh",
  locationType: activity.locationType,
});

export const createActivity = async (req, res, next) => {
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
        throw new AppError(`Cloudinary upload error: ${error.message}`, 500);
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
        requireRegistration: payload.requireRegistration || false,
        registrationDeadline: payload.registrationDeadline
          ? new Date(payload.registrationDeadline)
          : null,
        maxParticipants: payload.maxParticipants || null,
        isFeatured: payload.isFeatured || false,
      },
    });

    const calendarPayload = formatalendarPayload(newActivity);

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
      include: activityIncludes,
    });

    res.status(201).json({
      success: true,
      message: "Activity created successfully",
      data: updatedActivity,
      // data: newActivity,
    });

    void logSystemAction(
      req.userId ?? updatedActivity.organizerId ?? null,
      "activity.create",
      {
        activityId: updatedActivity.id,
        title: updatedActivity.title,
      },
    );

    // Index hoạt động mới tạo vào hệ thống RAG
    indexActivity(updatedActivity.id).catch((err) =>
      console.error(
        `[RAG] Indexing activity ${updatedActivity.id} failed:`,
        err,
      ),
    );
  } catch (err) {
    return next(err);
  }
};

export const getActivities = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    const activities = await prisma.activity.findMany({
      skip: offset,
      take: Number(limit),
      where: {
        ...withSoftDeleteFilter(req.userRole),
      },
      include: activityIncludes,
    });

    res.status(200).json({
      success: true,
      message: "Get all activities successfully",
      data: activities,
    });
  } catch (err) {
    return next(err);
  }
};

export const getActivityById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const storedActivity = await prisma.activity.findUnique({
      where: { id: Number(id), ...withSoftDeleteFilter(req.userRole) },
      include: activityIncludes,
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
    return next(err);
  }
};

export const getActivitiesBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;

    const activity = await prisma.activity.findUnique({
      where: { slug: slug, ...withSoftDeleteFilter(req.userRole) },
      include: activityIncludes,
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
    return next(err);
  }
};

export const updateActivity = async (req, res, next) => {
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
        throw new AppError(`Cloudinary upload error: ${error.message}`, 500);
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
        requireRegistration:
          payload.requireRegistration || storedActivity.requireRegistration,
        registrationDeadline: payload.registrationDeadline
          ? new Date(payload.registrationDeadline)
          : storedActivity.registrationDeadline,
        maxParticipants:
          payload.maxParticipants || storedActivity.maxParticipants,
        isFeatured: payload.isFeatured || storedActivity.isFeatured,
      },
    });

    let finalUpdatedActivity = updatedActivity;

    if (storedActivity.googleCalendarEventId) {
      const calendarPayload = formatalendarPayload(updatedActivity);

      const calendarEventData = await updateGoogleCalendarEvent(
        Number(payload.organizerId || req.userId),
        storedActivity.googleCalendarEventId,
        calendarPayload,
      );

      finalUpdatedActivity = await prisma.activity.update({
        where: { id: Number(id) },
        data: {
          googleCalendarEventId: calendarEventData.id,
          meetingLink:
            calendarEventData.conferenceData?.entryPoints?.[0]?.uri || null,
        },
        include: activityIncludes,
      });
    }

    res.status(200).json({
      success: true,
      message: "Activity updated successfully",
      data: finalUpdatedActivity,
    });

    void logSystemAction(
      req.userId ?? storedActivity.organizerId ?? null,
      "activity.update",
      {
        activityId: finalUpdatedActivity.id,
        title: finalUpdatedActivity.title,
      },
    );

    // Cập nhật lại index của hoạt động trong hệ thống RAG
    indexActivity(finalUpdatedActivity.id).catch((err) =>
      console.error(
        `[RAG] Re-indexing activity ${finalUpdatedActivity.id} failed:`,
        err,
      ),
    );
  } catch (err) {
    return next(err);
  }
};

export const softDeleteActivity = async (req, res, next) => {
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
        isDeleted: true,
      },
    });

    res.status(200).json({
      success: true,
      message: "Activity soft deleted successfully",
      data: deletedActivity,
    });

    void logSystemAction(
      req.userId ?? existingActivity.organizerId ?? null,
      "activity.soft_delete",
      {
        activityId: deletedActivity.id,
        title: deletedActivity.title,
      },
    );

    // Xóa chunks liên quan đến hoạt động này trong hệ thống RAG
    deleteChunksBySource("activity", deletedActivity.id).catch((err) =>
      console.error(
        `[RAG] Deleting chunks for activity ${deletedActivity.id} failed:`,
        err,
      ),
    );
  } catch (err) {
    return next(err);
  }
};

export const hardDeleteActivity = async (req, res, next) => {
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

    if (storedActivity.googleCalendarEventId) {
      await deleteGoogleCalendarEvent(
        Number(storedActivity.organizerId || req.userId),
        storedActivity.googleCalendarEventId,
      );
    }

    const deletedActivity = await prisma.activity.delete({
      where: { id: Number(id) },
    });

    res.status(200).json({
      success: true,
      message: "Activity deleted successfully",
      data: deletedActivity,
    });

    void logSystemAction(
      req.userId ?? storedActivity.organizerId ?? null,
      "activity.hard_delete",
      {
        activityId: deletedActivity.id,
        title: storedActivity.title,
      },
    );

    // Xóa chunks liên quan đến hoạt động này trong hệ thống RAG
    deleteChunksBySource("activity", deletedActivity.id).catch((err) =>
      console.error(
        `[RAG] Deleting chunks for activity ${deletedActivity.id} failed:`,
        err,
      ),
    );
  } catch (err) {
    return next(err);
  }
};

export const getActivitiesByUserId = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const activities = await prisma.activity.findMany({
      where: { organizerId: Number(userId) },
      include: activityIncludes,
    });

    res.status(200).json({
      success: true,
      message: "Get activities by user ID successfully",
      data: activities,
    });
  } catch (err) {
    return next(err);
  }
};

export const createActivityImage = async (req, res, next) => {
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

    void logSystemAction(
      req.userId ?? storedActivity.organizerId ?? null,
      "activity.image.create",
      {
        activityId: Number(activityId),
        imageId: createdImage.id,
      },
    );
  } catch (err) {
    return next(err);
  }
};

export const deleteActivityImage = async (req, res, next) => {
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

    void logSystemAction(
      req.userId ?? storedImage.activityId ?? null,
      "activity.image.delete",
      {
        activityId: storedImage.activityId,
        imageId: deletedImage.id,
      },
    );
  } catch (err) {
    return next(err);
  }
};

export const createActivityVideo = async (req, res, next) => {
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

    void logSystemAction(
      req.userId ?? storedActivity.organizerId ?? null,
      "activity.video.create",
      {
        activityId: Number(activityId),
        videoId: createdVideo.id,
      },
    );
  } catch (err) {
    return next(err);
  }
};

export const deleteActivityVideo = async (req, res, next) => {
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

    void logSystemAction(
      req.userId ?? storedVideo.activityId ?? null,
      "activity.video.delete",
      {
        activityId: storedVideo.activityId,
        videoId: deletedVideo.id,
      },
    );
  } catch (err) {
    return next(err);
  }
};

export const getICSFile = async (req, res, next) => {
  try {
    const userId = req.userId;
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

    const icsFileData = await exportICSFile(
      userId,
      storedActivity.id,
      storedActivity.googleCalendarEventId,
    );

    res.setHeader("Content-Type", "text/calendar");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=activity_${storedActivity.slug}.ics`,
    );
    res.status(200).send(icsFileData);
  } catch (err) {
    return next(err);
  }
};

export const restoreActivity = async (req, res, next) => {
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

    const restoredActivity = await prisma.activity.update({
      where: { id: Number(id) },
      data: {
        isDeleted: false,
      },
      include: activityIncludes,
    });

    res.status(200).json({
      success: true,
      message: "Activity restored successfully",
      data: restoredActivity,
    });

    void logSystemAction(
      req.userId ?? existingActivity.organizerId ?? null,
      "activity.restore",
      {
        activityId: restoredActivity.id,
        title: restoredActivity.title,
      },
    );
  } catch (err) {
    return next(err);
  }
};
