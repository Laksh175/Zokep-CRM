import crypto from 'crypto';
import Razorpay from 'razorpay';
import Plan from '../models/Plan.js';
import Subscription from '../models/Subscription.js';
import User from '../models/User.js';
import { formatDate } from '../utils/dateFormatter.js';

let razorpayInstance = null;

export const getRazorpayInstance = () => {
  const keyId = process.env.RAZORPAY_KEY_ID ? process.env.RAZORPAY_KEY_ID.trim() : '';
  const keySecret = process.env.RAZORPAY_KEY_SECRET ? process.env.RAZORPAY_KEY_SECRET.trim() : '';

  if (!razorpayInstance && keyId && keySecret && !keyId.includes('placeholder')) {
    try {
      razorpayInstance = new Razorpay({
        key_id: keyId,
        key_secret: keySecret,
      });
      console.log(`[Razorpay] Initialized SDK with Key ID: ${keyId}`);
    } catch (e) {
      console.warn('[Razorpay] Initialization warning:', e.message);
    }
  }
  return razorpayInstance;
};

// @desc    Get Razorpay Public Configuration
// @route   GET /api/subscriptions/config
// @access  Public
export const getRazorpayConfig = async (req, res) => {
  const keyId = process.env.RAZORPAY_KEY_ID ? process.env.RAZORPAY_KEY_ID.trim() : '';
  const isConfigured = Boolean(keyId && !keyId.includes('placeholder'));

  return res.json({
    success: true,
    keyId: isConfigured ? keyId : 'rzp_test_placeholder_key_id',
    isLive: isConfigured,
    currency: 'INR',
  });
};

// @desc    Create Razorpay Order for Plan Subscription / Renewal
// @route   POST /api/subscriptions/create-order
// @access  Public / Private
export const createRazorpayOrder = async (req, res) => {
  try {
    const { planId, billingCycle, tenantId: requestedTenantId, userEmail, companyName } = req.body;
    const currentTenantId = req.tenantId || req.user?._id || requestedTenantId;

    const plan = await Plan.findById(planId);
    if (!plan) {
      return res.status(404).json({ success: false, message: 'Subscription plan not found' });
    }

    const price = plan.price || 0;
    const amountInPaise = Math.round(price * 100);

    const rzp = getRazorpayInstance();
    const keyId = process.env.RAZORPAY_KEY_ID ? process.env.RAZORPAY_KEY_ID.trim() : '';
    const isLive = Boolean(rzp && keyId && !keyId.includes('placeholder'));

    let orderData = null;

    if (isLive && amountInPaise > 0) {
      const receiptId = `rcpt_${Date.now().toString().slice(-8)}_${Math.floor(100 + Math.random() * 900)}`;
      const options = {
        amount: amountInPaise,
        currency: plan.currency || 'INR',
        receipt: receiptId.slice(0, 40), // Razorpay max receipt length is 40 chars
        notes: {
          planId: plan._id.toString(),
          planName: plan.name,
          durationMonths: String(plan.durationMonths || 1),
          billingCycle: plan.billingCycle || billingCycle || 'monthly',
          tenantId: currentTenantId ? currentTenantId.toString() : '',
          userEmail: userEmail || req.user?.email || '',
          companyName: companyName || req.user?.companyName || '',
        },
      };
      orderData = await rzp.orders.create(options);
      console.log(`[Razorpay] Created live order: ${orderData.id} for ₹${price} (${plan.name})`);
    } else {
      // Test / Simulator / Free tier order
      orderData = {
        id: `order_sim_${Date.now()}`,
        amount: amountInPaise,
        currency: plan.currency || 'INR',
        receipt: `rcpt_sim_${Date.now().toString().slice(-6)}`,
        status: 'created',
        mockMode: !isLive,
      };
    }

    return res.json({
      success: true,
      order: orderData,
      keyId: isLive ? keyId : 'rzp_test_placeholder_key_id',
      isLive,
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
    console.error('[Razorpay] Create Order Error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Failed to initialize payment gateway order' });
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

    const keySecret = process.env.RAZORPAY_KEY_SECRET ? process.env.RAZORPAY_KEY_SECRET.trim() : '';

    // Verify HMAC signature if live Razorpay credentials are set
    if (
      keySecret &&
      !keySecret.includes('placeholder') &&
      razorpay_order_id &&
      !razorpay_order_id.startsWith('order_sim_')
    ) {
      const generated_signature = crypto
        .createHmac('sha256', keySecret)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex');

      if (generated_signature !== razorpay_signature) {
        console.error('[Razorpay] Verification signature mismatch:', {
          generated: generated_signature,
          received: razorpay_signature,
        });
        return res.status(400).json({
          success: false,
          message: 'Payment verification failed: Invalid Razorpay payment signature',
        });
      }

      // Verify payment capture status directly from Razorpay API
      const rzp = getRazorpayInstance();
      if (rzp && razorpay_payment_id) {
        try {
          const paymentEntity = await rzp.payments.fetch(razorpay_payment_id);
          console.log(`[Razorpay] Fetched live payment ${razorpay_payment_id} status: ${paymentEntity.status}`);
          if (paymentEntity.status !== 'captured' && paymentEntity.status !== 'authorized') {
            return res.status(400).json({
              success: false,
              message: `Payment status is ${paymentEntity.status}. Expected captured or authorized.`,
            });
          }
        } catch (fetchErr) {
          console.warn('[Razorpay] Payment fetch notice:', fetchErr.message);
        }
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
      invoiceNumber: `INV-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`,
      autoRenew: true,
    });

    return res.json({
      success: true,
      message: `Subscription successfully renewed for ${months} month(s) with ${plan.name} until ${formatDate(endDate)}!`,
      subscription,
    });
  } catch (error) {
    console.error('[Razorpay] Verify Payment Error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Payment verification processing error' });
  }
};

// @desc    Razorpay Webhook Handler
// @route   POST /api/subscriptions/razorpay-webhook
// @access  Public (Called by Razorpay server)
export const handleRazorpayWebhook = async (req, res) => {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET ? process.env.RAZORPAY_WEBHOOK_SECRET.trim() : '';
    const signature = req.headers['x-razorpay-signature'];

    if (secret && signature && !secret.includes('placeholder')) {
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
            invoiceNumber: `INV-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`,
            autoRenew: true,
          });

          console.log(`[Razorpay Webhook] Activated ${months}-month subscription for tenant: ${notes.tenantId}`);
        }
      }
    } else if (event === 'payment.failed') {
      const payment = req.body.payload?.payment?.entity;
      console.warn(`[Razorpay Webhook] Payment failed for order ${payment?.order_id}: ${payment?.error_description}`);
    }

    return res.json({ status: 'ok', received: true });
  } catch (error) {
    console.error('[Razorpay Webhook] Error:', error);
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

// @desc    Get Subscription Invoice / Receipt Details
// @route   GET /api/subscriptions/invoice/:id
// @access  Private (Admin or Super Admin)
export const getSubscriptionInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;

    const subscription = await Subscription.findById(id)
      .populate('tenantId', 'name email companyName phone businessType')
      .populate('planId');

    if (!subscription) {
      return res.status(404).json({ success: false, message: 'Invoice / Subscription record not found' });
    }

    // Check permission: Super Admin can view all; Admin can only view their own tenantId
    if (user.role !== 'super_admin') {
      const userTenantId = req.tenantId || user._id;
      if (String(subscription.tenantId?._id || subscription.tenantId) !== String(userTenantId)) {
        return res.status(403).json({ success: false, message: 'You do not have authorization to view this receipt' });
      }
    }

    return res.json({
      success: true,
      data: subscription,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};


