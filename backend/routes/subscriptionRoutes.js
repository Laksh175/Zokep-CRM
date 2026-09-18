import {
  getRazorpayConfig,
  createRazorpayOrder,
  verifyRazorpayPaymentAndRenew,
  handleRazorpayWebhook,
  getMySubscription,
} from '../controllers/subscriptionController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

// Public routes for Razorpay
router.get('/config', getRazorpayConfig);
router.post('/razorpay-webhook', handleRazorpayWebhook);
router.post('/create-order', createRazorpayOrder);

// Protected routes (Admin)
router.use(protect);
router.post('/verify-payment', authorize('admin'), verifyRazorpayPaymentAndRenew);
router.get('/my-subscription', authorize('admin'), getMySubscription);

export default router;
