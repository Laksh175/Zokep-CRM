import express from 'express';
import { getStaffDashboard } from '../controllers/staffController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(authorize('staff'));

router.get('/dashboard', getStaffDashboard);

export default router;
