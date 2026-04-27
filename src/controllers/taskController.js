import { prisma } from "../libs/prisma.js";
import {
  getTaskStatus,
  taskInclude,
  getAssigneeScopeValue,
  resolveAssigneeIds,
} from "../utils/taskUtil.js";
import { TASK_STATUS, ASSIGNEE_TASK_STATUS } from "../utils/constant.js";
import cloudinary from "../libs/cloudinary.js";
import {
  sendTaskAssignmentEmail,
  sendTaskUpdatedEmail,
  sendTaskCancelledEmail,
  sendTaskCompletionReviewEmail,
} from "../utils/emailUtil.js";
import { indexTask } from "../services/knowledgeIndexerService.js";
import { deleteChunksBySource } from "../services/documentChunkService.js";
import { logSystemAction } from "../services/auditLogService.js";
import {
  createNotificationSafe,
  createNotificationsForUsersSafe,
} from "../services/notificationService.js";
import { AppError, BadRequestError } from "../utils/AppError.js";

export const createTask = async (req, res, next) => {
  try {
    const taskData = req.body;

    const createdTask = await prisma.$transaction(async (prisma) => {
      const assigneeIds = await resolveAssigneeIds(prisma, taskData.target);

      if (assigneeIds.length === 0) {
        throw new Error("No valid assignees found for the specified target");
      }

      const newTask = await prisma.task.create({
        data: {
          title: taskData.title,
          description: taskData.description,
          dueDate: taskData.dueDate ? new Date(taskData.dueDate) : new Date(),
          status: getTaskStatus(taskData.status.trim().toLowerCase()),
          // Remove or modify this line if you want to handle assignee scope differently
          assigneeScope: getAssigneeScopeValue(
            taskData.assigneeScope.trim().toLowerCase(),
          ),
          assignorId: Number(taskData.assignorId),
          isCheckCf: taskData.isCheckCf || false,
        },
      });

      await prisma.assigneeTask.createMany({
        data: assigneeIds.map((assigneeId) => ({
          taskId: newTask.id,
          assigneeId: assigneeId,
          evidenceUrl: taskData.evidenceUrl || "",
          additionalComments: taskData.additionalComments || "",
          status: ASSIGNEE_TASK_STATUS.PENDING,
        })),
        skipDuplicates: true, // This option will skip creating a new record if the combination of taskId and assigneeId already exists
      });

      return prisma.task.findUnique({
        where: { id: newTask.id },
        include: taskInclude,
      });
    });

    const assignees = createdTask.assignees;
    for (const assignee of assignees) {
      await sendTaskAssignmentEmail(
        assignee.user.email,
        assignee.user.fullname,
        createdTask.title,
        createdTask.assignedBy.fullname ?? "Ad/Mod",
      ).catch(console.error);
    }

    res.status(201).json({
      success: true,
      message: "Task created successfully",
      data: createdTask,
    });

    void logSystemAction(
      req.userId ?? createdTask.assignorId ?? null,
      "task.create",
      {
        taskId: createdTask.id,
        title: createdTask.title,
      },
    );

    void createNotificationsForUsersSafe(
      createdTask.assignees.map((assignee) => assignee.assigneeId),
      {
        type: "TASK",
        message: `You have been assigned a new task: ${createdTask.title}`,
      },
    );

    // Index task mới tạo vào hệ thống RAG
    indexTask(createdTask.id).catch((err) =>
      console.error(`[RAG] Indexing task ${createdTask.id} failed:`, err),
    );
  } catch (err) {
    if (err.message === "No valid assignees found for the specified target") {
      return next(new BadRequestError(err.message));
    }
    return next(err);
  }
};

export const getTasks = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    const tasks = await prisma.task.findMany({
      skip: offset,
      take: Number(limit),
      include: taskInclude,
    });

    res.status(200).json({
      success: true,
      message: "Get all tasks successfully",
      data: tasks,
    });
  } catch (err) {
    return next(err);
  }
};

export const getTaskById = async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const task = await prisma.task.findUnique({
      where: { id: Number(taskId) },
      include: taskInclude,
    });
    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "Get task by ID successfully",
      data: task,
    });
  } catch (err) {
    return next(err);
  }
};

export const updateTask = async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const taskData = req.body;
    const task = await prisma.task.findUnique({
      where: { id: Number(taskId) },
      include: taskInclude,
    });
    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }
    const updatedTask = await prisma.$transaction(async (prisma) => {
      const assigneeIds = await resolveAssigneeIds(prisma, taskData.target);

      if (assigneeIds.length === 0) {
        throw new Error("No valid assignees found for the specified target");
      }

      const task = await prisma.task.update({
        where: {
          id: Number(taskId),
        },
        data: {
          title: taskData.title,
          description: taskData.description,
          dueDate: taskData.dueDate ? new Date(taskData.dueDate) : new Date(),
          status: getTaskStatus(taskData.status.trim().toLowerCase()),
          // Remove or modify this line if you want to handle assignee scope differently
          assigneeScope: getAssigneeScopeValue(
            taskData.assigneeScope.trim().toLowerCase(),
          ),
          assignorId: taskData.assignorId,
          isCheckCf: taskData.isCheckCf || false,
        },
      });

      await prisma.assigneeTask.deleteMany({
        where: {
          taskId: task.id,
        },
      });

      await prisma.assigneeTask.createMany({
        data: assigneeIds.map((assigneeId) => ({
          taskId: task.id,
          assigneeId,
          status: ASSIGNEE_TASK_STATUS.PENDING,
        })),
        skipDuplicates: true, // This option will skip creating a new record if the combination of taskId and assigneeId already exists
      });

      return prisma.task.findUnique({
        where: { id: task.id },
        include: taskInclude,
      });
    });

    res.status(200).json({
      success: true,
      message: "Task updated successfully",
      data: updatedTask,
    });

    void logSystemAction(
      req.userId ?? updatedTask.assignorId ?? null,
      "task.update",
      {
        taskId: updatedTask.id,
        title: updatedTask.title,
      },
    );

    void createNotificationsForUsersSafe(
      updatedTask.assignees.map((assignee) => assignee.assigneeId),
      {
        type: "TASK",
        message: `Task has been updated: ${updatedTask.title}`,
      },
    );

    for (const assignee of updatedTask.assignees) {
      await sendTaskUpdatedEmail(
        assignee.user.email,
        assignee.user.fullname,
        updatedTask.title,
        updatedTask.assignedBy?.fullname ?? "Ad/Mod",
      ).catch(console.error);
    }

    // Index task mới tạo vào hệ thống RAG
    indexTask(updatedTask.id).catch((err) =>
      console.error(`[RAG] Indexing task ${updatedTask.id} failed:`, err),
    );
  } catch (err) {
    if (err.message === "No valid assignees found for the specified target") {
      return next(new BadRequestError(err.message));
    }
    return next(err);
  }
};

export const softDeleteTask = async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const task = await prisma.task.update({
      where: { id: Number(taskId) },
      data: {
        status: TASK_STATUS.CANCELLED,
        isDeleted: true,
      },
    });
    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "Task deleted successfully",
    });

    void logSystemAction(
      req.userId ?? task.assignorId ?? null,
      "task.soft_delete",
      {
        taskId: task.id,
        title: task.title,
      },
    );

    const assignees = await prisma.assigneeTask.findMany({
      where: { taskId: task.id },
      include: {
        user: {
          select: {
            email: true,
            fullname: true,
          },
        },
      },
    });

    void createNotificationsForUsersSafe(
      assignees.map((item) => item.assigneeId),
      {
        type: "TASK",
        message: `Task has been cancelled: ${task.title}`,
      },
    );

    for (const assignee of assignees) {
      await sendTaskCancelledEmail(
        assignee.user.email,
        assignee.user.fullname,
        task.title,
      ).catch(console.error);
    }

    // Xóa chunks liên quan đến task này trong hệ thống RAG
    deleteChunksBySource("task", task.id).catch((err) =>
      console.error(`[RAG] Deleting chunks for task ${task.id} failed:`, err),
    );
  } catch (err) {
    return next(err);
  }
};

export const hardDeleteTask = async (req, res, next) => {
  try {
    const { taskId } = req.params;

    const assignees = await prisma.assigneeTask.findMany({
      where: { taskId: Number(taskId) },
      select: { assigneeId: true },
    });

    const task = await prisma.task.delete({
      where: { id: Number(taskId) },
    });
    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "Task deleted successfully",
    });

    void createNotificationsForUsersSafe(
      assignees.map((item) => item.assigneeId),
      {
        type: "TASK",
        message: `Task has been removed: ${task.title}`,
      },
    );

    // Xóa chunks liên quan đến task này trong hệ thống RAG
    deleteChunksBySource("task", task.id).catch((err) =>
      console.error(`[RAG] Deleting chunks for task ${task.id} failed:`, err),
    );
  } catch (err) {
    return next(err);
  }
};

export const getTasksByUserId = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const tasks = await prisma.assigneeTask.findMany({
      where: { assigneeId: Number(userId) },
      include: {
        task: true,
      },
    });
    res.status(200).json({
      success: true,
      message: "Get tasks by user ID successfully",
      data: tasks,
    });
  } catch (err) {
    return next(err);
  }
};

export const confirmTaskCompletion = async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const taskCfData = req.body;
    const file = req.file;

    const assigneeTask = await prisma.assigneeTask.findFirst({
      where: {
        taskId: Number(taskId),
        assigneeId: Number(taskCfData.assigneeId),
      },
    });

    if (!assigneeTask) {
      return res.status(404).json({
        success: false,
        message: "Assignee task not found",
      });
    }

    if (file) {
      const base64 = `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;

      try {
        const uploadResult = await cloudinary.uploader.upload(base64, {
          folder: `clubhub/tasks/evidence/task_${taskId}`,
          public_id: `assignee_${taskCfData.assigneeId}_${Date.now()}`,
          resource_type: "image",
        });

        taskCfData.evidenceUrl = uploadResult.secure_url;
        taskCfData.evidencePublicId = uploadResult.public_id;

        if (assigneeTask.evidencePublicId) {
          await cloudinary.uploader.destroy(
            assigneeTask.evidencePublicId,
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
        throw new AppError("Failed to upload evidence image", 500);
      }
    }

    const updatedAssigneeTask = await prisma.assigneeTask.update({
      where: { id: assigneeTask.id },
      data: {
        confirmedAt: new Date(),
        evidenceUrl: taskCfData.evidenceUrl,
        evidencePublicId: taskCfData.evidencePublicId,
        additionalComments: taskCfData.additionalComments,
        status: ASSIGNEE_TASK_STATUS.CONFIRMED,
      },
    });

    res.status(200).json({
      success: true,
      message: "Task completion confirmed successfully",
      data: updatedAssigneeTask,
    });
  } catch (err) {
    return next(err);
  }
};

export const verifyTaskCompletion = async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const taskVerifyData = req.body;

    const assigneeTask = await prisma.assigneeTask.findFirst({
      where: {
        taskId: Number(taskId),
        assigneeId: Number(taskVerifyData.assigneeId),
      },
      include: {
        user: {
          select: {
            email: true,
            fullname: true,
          },
        },
        task: {
          select: {
            title: true,
          },
        },
      },
    });

    if (!assigneeTask) {
      return res.status(404).json({
        success: false,
        message: "Assignee task not found",
      });
    }

    const updatedAssigneeTask = await prisma.assigneeTask.update({
      where: { id: assigneeTask.id },
      data: {
        status: taskVerifyData.isVerified
          ? ASSIGNEE_TASK_STATUS.VERIFIED
          : ASSIGNEE_TASK_STATUS.REJECTED,
        reviewerComments: taskVerifyData.reviewerComments || "",
      },
    });

    res.status(200).json({
      success: true,
      message: "Task completion verified successfully",
      data: updatedAssigneeTask,
    });

    void createNotificationSafe({
      userId: assigneeTask.assigneeId,
      type: "TASK",
      message: taskVerifyData.isVerified
        ? `Your task completion has been approved (Task #${taskId}).`
        : `Your task completion needs revision (Task #${taskId}).`,
    });

    await sendTaskCompletionReviewEmail(
      assigneeTask.user.email,
      assigneeTask.user.fullname,
      assigneeTask.task?.title ?? `Task #${taskId}`,
      Boolean(taskVerifyData.isVerified),
      taskVerifyData.reviewerComments || "",
    ).catch(console.error);
  } catch (err) {
    return next(err);
  }
};
