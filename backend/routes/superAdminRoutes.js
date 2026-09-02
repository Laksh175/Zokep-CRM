import express from 'express';
import {
  getPlatformAnalytics,
  getAllAdmins,
  toggleAdminStatus,
  extendSubscription,
  getPlans,
  createPlan,
  updatePlan,
  deletePlan,
} from '../controllers/superAdminController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

// Public / Protected plan route
router.get('/plans', getPlans);

// Protected Super Admin routes
router.use(protect);
router.use(authorize('super_admin'));

router.get('/analytics', getPlatformAnalytics);
router.get('/admins', getAllAdmins);
router.put('/admins/:id/toggle-status', toggleAdminStatus);
router.post('/admins/:id/extend-subscription', extendSubscription);

router.post('/plans', createPlan);
router.put('/plans/:id', updatePlan);
router.delete('/plans/:id', deletePlan);

export default router;
