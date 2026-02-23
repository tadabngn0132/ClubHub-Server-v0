import express from 'express'
import {
  createMemberApplication,
  getMemberApplications,
  getMemberApplicationById,
  deleteMemberApplication,
  approveMemberApplication,
  rejectMemberApplication
} from '../controllers/memberApplicationController.js';
import { verifyAccessToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/', createMemberApplication);
router.get('/', verifyAccessToken, getMemberApplications);
router.get('/:id', verifyAccessToken, getMemberApplicationById);
router.delete('/:id', verifyAccessToken, deleteMemberApplication);
router.post('/:id/approve', verifyAccessToken, approveMemberApplication);
router.post('/:id/reject', verifyAccessToken, rejectMemberApplication);

export default router;