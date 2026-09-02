import express from 'express';
import {
  getAdminDashboard,
  getStaffMembers,
  createStaffMember,
  updateStaffMember,
  deleteStaffMember,
} from '../controllers/adminController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';
import { checkActiveSubscription } from '../middleware/subscriptionCheck.js';

const router = express.Router();

router.use(protect);
router.use(authorize('admin'));

router.get('/dashboard', getAdminDashboard);
router.get('/staff', getStaffMembers);
router.post('/staff', checkActiveSubscription, createStaffMember);
router.put('/staff/:id', updateStaffMember);
router.delete('/staff/:id', deleteStaffMember);

export default router;
