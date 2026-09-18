import express from 'express';
import {
  getRazorpayConfig,
  createRazorpayOrder,
  verifyRazorpayPaymentAndRenew,
  handleRazorpayWebhook,
  getMySubscription,
  getSubscriptionInvoice,
} from '../controllers/subscriptionController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

// Public routes for Razorpay
router.get('/config', getRazorpayConfig);
router.post('/razorpay-webhook', handleRazorpayWebhook);
router.post('/create-order', createRazorpayOrder);

// Protected routes (Admin & Super Admin)
router.use(protect);
router.post('/verify-payment', authorize('admin'), verifyRazorpayPaymentAndRenew);
router.get('/my-subscription', authorize('admin'), getMySubscription);
router.get('/invoice/:id', authorize('admin', 'super_admin'), getSubscriptionInvoice);

export default router;
