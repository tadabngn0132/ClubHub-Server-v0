import { prisma } from "../libs/prisma.js";
import { getTaskStatus, taskInclude, getAssigneeScopeValue } from "../utils/taskUtil.js";
import { TASK_STATUS, ASSIGNEE_SCOPE } from "../utils/constant.js";

export const createTask = async (req, res) => {
  try {
    const taskData = req.body;

    if (!taskData.title) {
      return res.status(400).json({
        success: false,
        message: "Task title is required",
      });
    }

    if (!taskData.assignedId) {
      return res.status(400).json({
        success: false,
        message: "Assigned user ID is required",
      });
    }

    const createdTask = await prisma.$transaction(async (prisma) => {
      const newTask = await prisma.task.create({
        data: {
          title: taskData.title,
          description: taskData.description,
          dueDate: taskData.dueDate ? new Date(taskData.dueDate) : new Date(),
          status: getTaskStatus(taskData.status.trim().toLowerCase()),
          assigneeScope: getAssigneeScopeValue(taskData.assigneeScope.trim().toLowerCase()),
          assignorId: taskData.assignorId,
          isCheckCf: taskData.isCheckCf || false,
        },
      });

      await prisma.assigneeTask.create({
        data: {
          taskId: newTask.id,
          assigneeId: taskData.assignedId,
          evidenceUrl: taskData.evidenceUrl || "",
          additionalComments: taskData.additionalComments || "",
        },
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
    const tasks = await prisma.task.findMany({
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
      const task = await prisma.task.update({
        where: {
          id: Number(taskId),
        },
        data: {
          title: taskData.title,
          description: taskData.description,
          dueDate: taskData.dueDate ? new Date(taskData.dueDate) : new Date(),
          status: getTaskStatus(taskData.status.trim().toLowerCase()),
          assigneeScope: getAssigneeScopeValue(taskData.assigneeScope.trim().toLowerCase()),
          assignorId: taskData.assignorId,
          isCheckCf: taskData.isCheckCf || false,
        },
      });

      await prisma.assigneeTask.update({
        where: {
          taskId: task.id,
          assigneeId: Number(task.assignedId),
        },
        data: {
          taskId: task.id,
          assigneeId: Number(taskData.assignedId),
          evidenceUrl: taskData.evidenceUrl || "",
          additionalComments: taskData.additionalComments || "",
        },
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
      data: { status: TASK_STATUS.CANCELLED },
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
