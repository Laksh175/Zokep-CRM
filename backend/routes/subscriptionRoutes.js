import express from 'express';
import {
  createRazorpayOrder,
  verifyRazorpayPaymentAndRenew,
  handleRazorpayWebhook,
  getMySubscription,
} from '../controllers/subscriptionController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

// Webhook from Razorpay (public)
router.post('/razorpay-webhook', handleRazorpayWebhook);

// Order creation can be public (for new registrations) or private (for renewals)
router.post('/create-order', createRazorpayOrder);

// Protected routes
router.use(protect);
router.post('/verify-payment', authorize('admin'), verifyRazorpayPaymentAndRenew);
router.get('/my-subscription', authorize('admin'), getMySubscription);

export default router;
