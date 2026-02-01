// TODO: Need to review and modify task controller functions for better business logic and exact prisma model

export const createTask = async (req, res) => {
  try {
    const { title, description, assignedTo, dueDate } = req.body;
    
    const newTask = await Task.create({
      title,
      description,
      assignedTo,
      dueDate,
      status: 'pending',
    });
    
    res.status(201).json(newTask);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

export const getTasks = async (req, res) => {
  try {
    const tasks = await Task.find();
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

export const getTaskById = async (req, res) => {
  try {
    const { taskId } = req.params;
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.status(200).json(task);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

export const updateTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { title, description, assignedTo, dueDate, status } = req.body;
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    task.title = title || task.title;
    task.description = description || task.description;
    task.assignedTo = assignedTo || task.assignedTo;
    task.dueDate = dueDate || task.dueDate;
    task.status = status || task.status;
    await task.save();
    res.status(200).json(task);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

export const deleteTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const task = await Task.findByIdAndDelete(taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.status(200).json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

export const getTasksByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    const tasks = await Task.find({ assignedTo: userId });
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};