import { prisma } from "../libs/prisma.js";
import { TASK_STATUS } from "../utils/constant.js";

const getTaskStatus = (status) => {
  switch (status) {
    case "new":
      return TASK_STATUS.NEW;
    case "in_progress":
      return TASK_STATUS.IN_PROGRESS;
    case "done":
      return TASK_STATUS.DONE;
    case "cancelled":
      return TASK_STATUS.CANCELLED;
    case "on_hold":
      return TASK_STATUS.ON_HOLD;
    default:
      return TASK_STATUS.NEW;
  }
};

const taskInclude = {
  assigneeTasks: {
    include: {
      user: {
        select: {
          id: true,
          email: true,
          fullname: true,
          status: true,
        },
      },
    },
  },
};

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
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Internal server error / Create task error: ${error.message}`,
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
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Internal server error / Get tasks error: ${error.message}`,
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
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Internal server error / Get task by ID error: ${error.message}`,
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
        },
      });

      await prisma.assigneeTask.update({
        where: {
          taskId: task.id,
          assigneeId: task.assignedId,
        },
        data: {
          taskId: task.id,
          assigneeId: taskData.assignedId,
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
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Internal server error / Update task error: ${error.message}`,
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
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Internal server error / Delete task error: ${error.message}`,
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
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Internal server error / Delete task error: ${error.message}`,
    });
  }
};

export const getTasksByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    const tasks = await prisma.assigneeTask.findMany({
      where: { assigneeId: userId },
      include: {
        task: true,
      },
    });
    res.status(200).json({
      success: true,
      message: "Get tasks by user ID successfully",
      data: tasks,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Internal server error / Get tasks by user ID error: ${error.message}`,
    });
  }
};
