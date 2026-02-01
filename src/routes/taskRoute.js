import express from 'express';
import {
  createTask,
  getTasks,
  getTaskById,
  getTasksByUserId,
  updateTask,
  deleteTask,
} from '../controllers/taskController.js';
import { verifyAccessToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/', verifyAccessToken, createTask);
router.get('/', verifyAccessToken, getTasks);
router.get('/:taskId', verifyAccessToken, getTaskById);
router.get('/user/:userId', verifyAccessToken, getTasksByUserId);
router.put('/:taskId', verifyAccessToken, updateTask);
router.delete('/:taskId', verifyAccessToken, deleteTask);

export default router;