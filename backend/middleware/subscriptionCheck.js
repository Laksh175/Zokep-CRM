import Subscription from '../models/Subscription.js';

export const checkActiveSubscription = async (req, res, next) => {
  // Super admin doesn't need a subscription
  if (req.user && req.user.role === 'super_admin') {
    return next();
  }

  const tenantId = req.tenantId;
  if (!tenantId) {
    return res.status(403).json({
      success: false,
      message: 'No tenant context found.',
    });
  }

  try {
    const subscription = await Subscription.findOne({
      tenantId,
      status: { $in: ['active', 'grace_period'] },
    }).sort({ endDate: -1 });

    if (!subscription) {
      return res.status(403).json({
        success: false,
        subscriptionExpired: true,
        message: 'Your CRM subscription has expired or is inactive. Please renew your plan to continue adding data.',
      });
    }

    const now = new Date();
    if (new Date(subscription.endDate) < now) {
      // Mark as expired in DB
      subscription.status = 'expired';
      await subscription.save();

      return res.status(403).json({
        success: false,
        subscriptionExpired: true,
        message: 'Your CRM subscription has expired. Please renew your plan to continue using all features.',
      });
    }

    req.subscription = subscription;
    next();
  } catch (error) {
    console.error('Subscription check error:', error);
    next(); // Fallback allow to not block in unforeseen edge-cases
  }
};
