import express from 'express';
import {
  registerForActivity,
  getRegistrations,
  getRegistrationById,
  getRegistrationsByUserId,
  updateRegistrationStatus,
  deleteRegistration
} from '../controllers/activityRegistrationController.js';
import { verifyAccessToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/register', verifyAccessToken, registerForActivity);
router.get('/', verifyAccessToken, getRegistrations);
router.get('/:registrationId', verifyAccessToken, getRegistrationById);
router.get('/user/:userId', verifyAccessToken, getRegistrationsByUserId);
router.put('/:registrationId/status', verifyAccessToken, updateRegistrationStatus);
router.delete('/:registrationId', verifyAccessToken, deleteRegistration);

export default router;