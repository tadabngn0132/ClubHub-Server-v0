import express from 'express'
import {
  createUser,
  getUser,
  getUsers,
  updateUser,
  softDeleteUser,
  hardDeleteUser
} from '../controllers/userController.js'
import { verifyAccessToken } from '../middlewares/authMiddleware.js'

const router = express.Router()

router.post('/', verifyAccessToken, createUser)
router.get('/:id', verifyAccessToken, getUser)
router.get('/', verifyAccessToken, getUsers)
router.put('/:id', verifyAccessToken, updateUser)
router.delete('/:id/soft', verifyAccessToken, softDeleteUser)
router.delete('/:id/hard', verifyAccessToken, hardDeleteUser)

export default router