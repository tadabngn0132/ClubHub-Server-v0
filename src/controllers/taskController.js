import { prisma } from "../libs/prisma.js";
import { getTaskStatus, taskInclude, getAssigneeScopeValue, resolveAssigneeIds } from "../utils/taskUtil.js";
import { TASK_STATUS, ASSIGNEE_SCOPE } from "../utils/constant.js";

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
          assigneeScope: getAssigneeScopeValue(taskData.assigneeScope.trim().toLowerCase()),
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
        })),
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
          assigneeScope: getAssigneeScopeValue(taskData.assigneeScope.trim().toLowerCase()),
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
          evidenceUrl: taskData.evidenceUrl || "",
          additionalComments: taskData.additionalComments || "",
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
