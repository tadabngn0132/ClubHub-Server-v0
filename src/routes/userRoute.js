import express from 'express'
import {
  createUser,
  getUser,
  getUsers,
  updateUser,
  deleteUser
} from '../controllers/userController.js'
import { verifyAccessToken } from '../middlewares/authentication.js'

const router = express.Router()

router.post('/', verifyAccessToken, createUser)
router.get('/:id', verifyAccessToken, getUser)
router.get('/', verifyAccessToken, getUsers)
router.put('/:id', verifyAccessToken, updateUser)
router.delete('/:id', verifyAccessToken, deleteUser)

export default router