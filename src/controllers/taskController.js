import { prisma } from "../libs/prisma.js";
import {
  getTaskStatus,
  taskInclude,
  getAssigneeScopeValue,
  resolveAssigneeIds,
} from "../utils/taskUtil.js";
import { TASK_STATUS, ASSIGNEE_TASK_STATUS } from "../utils/constant.js";

export const createTask = async (req, res) => {
  try {
    const taskData = req.body;

    const createdTask = await prisma.$transaction(async (prisma) => {
      const assigneeIds = await resolveAssigneeIds(prisma, taskData.target);

      if (assigneeIds.length === 0) {
        return res.status(400).json({
          success: false,
          message: "No valid assignees found for the specified target",
        });
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

    res.status(201).json({
      success: true,
      message: "Task created successfully",
      data: createdTask,
    });
  } catch (err) {
    console.error("Error in createTask function:", err);
    res.status(500).json({
      success: false,
      message: `Internal server error / Create task error: ${err.message}`,
    });
  }
};

export const getTasks = async (req, res) => {
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
    console.error("Error in getTasks function:", err);
    res.status(500).json({
      success: false,
      message: `Internal server error / Get tasks error: ${err.message}`,
    });
  }
};

export const getTaskById = async (req, res) => {
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
    console.error("Error in getTaskById function:", err);
    res.status(500).json({
      success: false,
      message: `Internal server error / Get task by ID error: ${err.message}`,
    });
  }
};

export const updateTask = async (req, res) => {
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
        return res.status(400).json({
          success: false,
          message: "No valid assignees found for the specified target",
        });
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
  } catch (err) {
    console.error("Error in updateTask function:", err);
    res.status(500).json({
      success: false,
      message: `Internal server error / Update task error: ${err.message}`,
    });
  }
};

export const softDeleteTask = async (req, res) => {
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
  } catch (err) {
    console.error("Error in softDeleteTask function:", err);
    res.status(500).json({
      success: false,
      message: `Internal server error / Delete task error: ${err.message}`,
    });
  }
};

export const hardDeleteTask = async (req, res) => {
  try {
    const { taskId } = req.params;
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
  } catch (err) {
    console.error("Error in hardDeleteTask function:", err);
    res.status(500).json({
      success: false,
      message: `Internal server error / Delete task error: ${err.message}`,
    });
  }
};

export const getTasksByUserId = async (req, res) => {
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
    console.error("Error in getTasksByUserId function:", err);
    res.status(500).json({
      success: false,
      message: `Internal server error / Get tasks by user ID error: ${err.message}`,
    });
  }
};

export const confirmTaskCompletion = async (req, res) => {
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
          folder: "task_evidence",
          public_id: `task_${taskId}_assignee_${taskCfData.assigneeId}_${Date.now()}`,
          resource_type: "image",
        });

        taskCfData.evidenceUrl = uploadResult.secure_url;
        taskCfData.evidencePublicId = uploadResult.public_id;
      } catch (error) {
        console.error("Cloudinary upload error:", error);
        return res.status(500).json({
          success: false,
          message: "Failed to upload evidence image",
        });
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
    console.error("Error in confirmTaskCompletion function:", err);
    res.status(500).json({
      success: false,
      message: `Internal server error / Confirm task completion error: ${err.message}`,
    });
  }
};

export const verifyTaskCompletion = async (req, res) => {
  try {
    const { taskId } = req.params;
    const taskVerifyData = req.body;

    const assigneeTask = await prisma.assigneeTask.findFirst({
      where: {
        taskId: Number(taskId),
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
  } catch (err) {
    console.error("Error in verifyTaskCompletion function:", err);
    res.status(500).json({
      success: false,
      message: `Internal server error / Verify task completion error: ${err.message}`,
    });
  }
};
