import express from 'express'
import {
  createActivity,
  getActivities,
  getActivityById,
  getActivitiesBySlug,
  updateActivity,
  deleteActivity
} from '../controllers/activityController.js'
import { verifyAccessToken } from '../middlewares/authMiddleware.js'

const router = express.Router()

router.post('/', verifyAccessToken, createActivity)
router.get('/', verifyAccessToken, getActivities)
router.get('/:id', verifyAccessToken, getActivityById)
router.get('/:slug', verifyAccessToken, getActivitiesBySlug)
router.put('/:id', verifyAccessToken, updateActivity)
router.delete('/:id', verifyAccessToken, deleteActivity)

export default router