import express from 'express';
import {
  createTask,
  getTasks,
  getTaskById,
  getTasksByUserId,
  updateTask,
  softDeleteTask,
  hardDeleteTask,
} from '../controllers/taskController.js';
import { verifyAccessToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/', verifyAccessToken, createTask);
router.get('/', verifyAccessToken, getTasks);
router.get('/user/:userId', verifyAccessToken, getTasksByUserId);
router.get('/:taskId', verifyAccessToken, getTaskById);
router.put('/:taskId', verifyAccessToken, updateTask);
router.delete('/:taskId/soft', verifyAccessToken, softDeleteTask);
router.delete('/:taskId/hard', verifyAccessToken, hardDeleteTask);

export default router;