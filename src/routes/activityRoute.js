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

// router.post('/', verifyAccessToken, createActivity)
// router.get('/', verifyAccessToken, getActivities)
// router.get('/:id', verifyAccessToken, getActivityById)
// router.get('/:slug', verifyAccessToken, getActivitiesBySlug)
// router.put('/:id', verifyAccessToken, updateActivity)
// router.delete('/:id', verifyAccessToken, deleteActivity)
router.post('/', createActivity)
router.get('/', getActivities)
router.get('/:id', getActivityById)
router.get('/:slug', getActivitiesBySlug)
router.put('/:id', updateActivity)
router.delete('/:id', deleteActivity)

export default router