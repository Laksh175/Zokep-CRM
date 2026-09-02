import crypto from 'crypto';
import Razorpay from 'razorpay';
import Plan from '../models/Plan.js';
import Subscription from '../models/Subscription.js';
import User from '../models/User.js';
import { formatDate } from '../utils/dateFormatter.js';

let razorpayInstance = null;

const getRazorpayInstance = () => {
  if (!razorpayInstance && process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
    try {
      razorpayInstance = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
      });
    } catch (e) {
      console.warn('Razorpay init notice:', e.message);
    }
  }
  return razorpayInstance;
};

// @desc    Create Razorpay Order for Plan Subscription / Renewal
// @route   POST /api/subscriptions/create-order
// @access  Public / Private
export const createRazorpayOrder = async (req, res) => {
  try {
    const { planId, billingCycle } = req.body;

    const plan = await Plan.findById(planId);
    if (!plan) {
      return res.status(404).json({ success: false, message: 'Plan not found' });
    }

    const price = plan.price || 0;
    const amountInPaise = Math.round(price * 100);

    const rzp = getRazorpayInstance();
    let orderData = null;

    if (rzp && process.env.RAZORPAY_KEY_ID !== 'rzp_test_placeholder_key_id') {
      const options = {
        amount: amountInPaise,
        currency: plan.currency || 'INR',
        receipt: `rcpt_${Date.now().toString().slice(-8)}`,
        notes: {
          planId: plan._id.toString(),
          planName: plan.name,
          durationMonths: plan.durationMonths || 1,
          billingCycle: plan.billingCycle || `${plan.durationMonths || 1} months`,
        },
      };
      orderData = await rzp.orders.create(options);
    } else {
      // Test / Simulator order
      orderData = {
        id: `order_sim_${Date.now()}`,
        amount: amountInPaise,
        currency: plan.currency || 'INR',
        receipt: `rcpt_sim_${Date.now().toString().slice(-6)}`,
        status: 'created',
        mockMode: true,
      };
    }

    return res.json({
      success: true,
      order: orderData,
      keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder_key_id',
      plan: {
        id: plan._id,
        name: plan.name,
        price: plan.price,
        durationMonths: plan.durationMonths || 1,
        billingCycle: plan.billingCycle,
        currency: plan.currency,
      },
    });
  } catch (error) {
    console.error('Create Razorpay Order Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Verify Razorpay Payment Signature and Activate / Renew Subscription
// @route   POST /api/subscriptions/verify-payment
// @access  Private (Admin)
export const verifyRazorpayPaymentAndRenew = async (req, res) => {
  try {
    const tenantId = req.tenantId || req.user?._id;
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      planId,
    } = req.body;

    if (!tenantId) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const plan = await Plan.findById(planId);
    if (!plan) {
      return res.status(404).json({ success: false, message: 'Plan not found' });
    }

    // Verify signature if secret is configured and not mock
    if (
      process.env.RAZORPAY_KEY_SECRET &&
      process.env.RAZORPAY_KEY_SECRET !== 'rzp_test_placeholder_key_secret' &&
      !razorpay_order_id?.startsWith('order_sim_')
    ) {
      const generated_signature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex');

      if (generated_signature !== razorpay_signature) {
        return res.status(400).json({ success: false, message: 'Invalid payment signature verification failed' });
      }
    }

    // Determine new subscription duration in months
    const months = Number(plan.durationMonths) || (plan.billingCycle === 'yearly' ? 12 : 1);

    // Check existing active subscription to append dates or start fresh
    const existingSub = await Subscription.findOne({ tenantId }).sort({ endDate: -1 });
    let startDate = new Date();
    if (existingSub && new Date(existingSub.endDate) > new Date()) {
      startDate = new Date(existingSub.endDate);
    }
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + months);

    const subscription = await Subscription.create({
      tenantId,
      planId: plan._id,
      status: 'active',
      startDate: new Date(),
      endDate,
      amountPaid: plan.price || 0,
      currency: plan.currency || 'INR',
      paymentMethod: 'razorpay',
      razorpayOrderId: razorpay_order_id || '',
      razorpayPaymentId: razorpay_payment_id || `pay_sim_${Date.now()}`,
      razorpaySignature: razorpay_signature || '',
      autoRenew: true,
    });

    return res.json({
      success: true,
      message: `Subscription successfully renewed for ${months} month(s) with ${plan.name} until ${formatDate(endDate)}!`,
      subscription,
    });
  } catch (error) {
    console.error('Verify Payment Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Razorpay Webhook Handler
// @route   POST /api/subscriptions/razorpay-webhook
// @access  Public (Called by Razorpay server)
export const handleRazorpayWebhook = async (req, res) => {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET || 'rzp_webhook_secret_placeholder';
    const signature = req.headers['x-razorpay-signature'];

    if (secret && signature && secret !== 'rzp_webhook_secret_placeholder') {
      const shasum = crypto.createHmac('sha256', secret);
      shasum.update(JSON.stringify(req.body));
      const digest = shasum.digest('hex');

      if (digest !== signature) {
        console.warn('[Razorpay Webhook] Signature verification failed');
        return res.status(400).json({ status: 'Invalid signature' });
      }
    }

    const event = req.body.event;
    console.log(`[Razorpay Webhook] Verified event received: ${event}`);

    // Handle payment.captured or order.paid
    if (event === 'payment.captured' || event === 'order.paid') {
      const payment = req.body.payload?.payment?.entity;
      const notes = payment?.notes || {};
      if (notes.tenantId && notes.planId) {
        const plan = await Plan.findById(notes.planId);
        if (plan) {
          const months = Number(plan.durationMonths) || (plan.billingCycle === 'yearly' ? 12 : 1);
          
          const existingSub = await Subscription.findOne({ tenantId: notes.tenantId }).sort({ endDate: -1 });
          let startDate = new Date();
          if (existingSub && new Date(existingSub.endDate) > new Date()) {
            startDate = new Date(existingSub.endDate);
          }
          const endDate = new Date(startDate);
          endDate.setMonth(endDate.getMonth() + months);

          await Subscription.create({
            tenantId: notes.tenantId,
            planId: plan._id,
            status: 'active',
            startDate: new Date(),
            endDate,
            amountPaid: (payment.amount || 0) / 100,
            currency: payment.currency || 'INR',
            paymentMethod: 'razorpay',
            razorpayOrderId: payment.order_id || '',
            razorpayPaymentId: payment.id || '',
            autoRenew: true,
          });

          console.log(`[Razorpay Webhook] Activated ${months}-month subscription for tenant: ${notes.tenantId}`);
        }
      }
    }

    return res.json({ status: 'ok', received: true });
  } catch (error) {
    console.error('Razorpay Webhook Error:', error);
    return res.status(500).json({ status: 'error', message: error.message });
  }
};

// @desc    Get Tenant's current subscription details & billing history
// @route   GET /api/subscriptions/my-subscription
// @access  Private (Admin)
export const getMySubscription = async (req, res) => {
  try {
    const tenantId = req.tenantId;

    const currentSub = await Subscription.findOne({ tenantId })
      .populate('planId')
      .sort({ endDate: -1 });

    const history = await Subscription.find({ tenantId })
      .populate('planId', 'name billingCycle price')
      .sort({ createdAt: -1 });

    const now = new Date();
    const isExpired = currentSub ? new Date(currentSub.endDate) < now : true;
    const daysRemaining = currentSub && !isExpired
      ? Math.ceil((new Date(currentSub.endDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      : 0;

    return res.json({
      success: true,
      data: {
        current: currentSub
          ? {
              id: currentSub._id,
              status: isExpired ? 'expired' : currentSub.status,
              isExpired,
              daysRemaining,
              startDate: currentSub.startDate,
              endDate: currentSub.endDate,
              amountPaid: currentSub.amountPaid,
              invoiceNumber: currentSub.invoiceNumber,
              plan: currentSub.planId,
            }
          : null,
        history,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
