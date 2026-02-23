// TODO: Need to review and modify task controller functions for better business logic and exact prisma model
import { prisma } from '../libs/prisma';

export const createTask = async (req, res) => {
  try {
    const { title, description, assignedTo, dueDate } = req.body;
    
    const newTask = await prisma.task.create({
      title,
      description,
      assignedTo,
      dueDate,
      status: 'pending',
    });
    
    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: newTask
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Internal server error / Create task error: ${error.message}`
    });
  }
};

export const getTasks = async (req, res) => {
  try {
    const tasks = await prisma.task.findMany();
    res.status(200).json({
      success: true,
      message: 'Get all tasks successfully',
      data: tasks
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Internal server error / Get tasks error: ${error.message}`
    });
  }
};

export const getTaskById = async (req, res) => {
  try {
    const { taskId } = req.params;
    const task = await prisma.task.findUnique({
      where: { id: Number(taskId) },
    });
    if (!task) {
      return res.status(404).json({ 
        success: false,
        message: 'Task not found' 
      });
    }
    res.status(200).json({
      success: true,
      message: 'Get task by ID successfully',
      data: task
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Internal server error / Get task by ID error: ${error.message}`
    });
  }
};

export const updateTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { title, description, assignedTo, dueDate, status } = req.body;
    const task = await prisma.task.findUnique({
      where: { id: Number(taskId) },
    });
    if (!task) {
      return res.status(404).json({ 
        success: false,
        message: 'Task not found' 
      });
    }
    const updatedTask = await prisma.task.update({
      where: { id: Number(taskId) },
      data: {
        title: title || task.title,
        description: description || task.description,
        assignedTo: assignedTo || task.assignedTo,
        dueDate: dueDate || task.dueDate,
        status: status || task.status,
      },
    });
    res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      data: updatedTask
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Internal server error / Update task error: ${error.message}`
    });
  }
};

export const deleteTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const task = await prisma.task.delete({
      where: { id: Number(taskId) },
    });
    if (!task) {
      return res.status(404).json({ 
        success: false,
        message: 'Task not found' 
      });
    }
    res.status(200).json({ 
      success: true,
      message: 'Task deleted successfully' 
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Internal server error / Delete task error: ${error.message}`
    });
  }
};

export const getTasksByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    const tasks = await prisma.task.findMany({
      where: { assignedTo: userId },
    });
    res.status(200).json({
      success: true,
      message: 'Get tasks by user ID successfully',
      data: tasks
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Internal server error / Get tasks by user ID error: ${error.message}`
    });
  }
};