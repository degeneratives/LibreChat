const { logger } = require('@librechat/data-schemas');
const { updateUser } = require('~/models');
const {
  createSubscription,
  findSubscriptionByInvoiceId,
  updateSubscriptionByInvoiceId,
  findActiveSubscription,
  findUserSubscriptions,
  cancelSubscription,
} = require('~/models/Subscription');
const XenditService = require('~/server/services/XenditService');

const xenditService = new XenditService();

/**
 * Create a subscription invoice
 */
const createSubscriptionInvoice = async (req, res) => {
  try {
    const { type } = req.body; // 'daily' or 'weekly'
    const userId = req.user.id;
    const user = req.user;

    if (!type || !['daily', 'weekly'].includes(type)) {
      return res.status(400).json({
        error: 'Invalid subscription type. Must be "daily" or "weekly"',
      });
    }

    // Check if user already has an active subscription
    const activeSubscription = await findActiveSubscription(userId);
    if (activeSubscription) {
      return res.status(400).json({
        error: 'User already has an active subscription',
        subscription: activeSubscription,
      });
    }

    // Get pricing
    const amount = type === 'daily' 
      ? parseInt(process.env.DAILY_SUBSCRIPTION_PRICE) || 99
      : parseInt(process.env.WEEKLY_SUBSCRIPTION_PRICE) || 499;

    const description = `Alfy ${type.charAt(0).toUpperCase() + type.slice(1)} Subscription`;
    const externalId = `sub_${userId}_${type}_${Date.now()}`;

    // Calculate subscription period
    const startDate = new Date();
    const endDate = new Date();
    if (type === 'daily') {
      endDate.setDate(endDate.getDate() + 1);
    } else {
      endDate.setDate(endDate.getDate() + 7);
    }

    // Create Xendit invoice
    const invoice = await xenditService.createInvoice({
      externalId,
      amount,
      description,
      customerEmail: user.email,
      customerName: user.name || user.username || 'User',
      successRedirectUrl: `${process.env.DOMAIN_CLIENT}/subscription/success`,
      failureRedirectUrl: `${process.env.DOMAIN_CLIENT}/subscription/failed`,
      currency: 'PHP',
      invoiceDuration: 86400, // 24 hours
    });

    // Create subscription record
    const subscription = await createSubscription({
      userId,
      type,
      xenditInvoiceId: invoice.id,
      amount,
      startDate,
      endDate,
      status: 'pending',
    });

    logger.info('Subscription invoice created', {
      userId,
      subscriptionId: subscription._id,
      invoiceId: invoice.id,
      type,
      amount,
    });

    res.json({
      success: true,
      subscription,
      invoice: {
        id: invoice.id,
        invoice_url: invoice.invoice_url,
        amount,
        currency: 'PHP',
        description,
        expires_at: invoice.expiry_date,
      },
    });
  } catch (error) {
    logger.error('Failed to create subscription invoice', {
      error: error.message,
      userId: req.user?.id,
    });
    res.status(500).json({
      error: 'Failed to create subscription invoice',
      message: error.message,
    });
  }
};

/**
 * Get user's subscription status
 */
const getSubscriptionStatus = async (req, res) => {
  try {
    const userId = req.user.id;

    const activeSubscription = await findActiveSubscription(userId);
    const subscriptionHistory = await findUserSubscriptions(userId, { limit: 5 });

    res.json({
      success: true,
      activeSubscription,
      subscriptionHistory,
      hasActiveSubscription: !!activeSubscription,
    });
  } catch (error) {
    logger.error('Failed to get subscription status', {
      error: error.message,
      userId: req.user?.id,
    });
    res.status(500).json({
      error: 'Failed to get subscription status',
      message: error.message,
    });
  }
};

/**
 * Cancel user's subscription
 */
const cancelUserSubscription = async (req, res) => {
  try {
    const userId = req.user.id;
    const { subscriptionId } = req.params;

    const subscription = await findSubscriptionById(subscriptionId);
    if (!subscription) {
      return res.status(404).json({
        error: 'Subscription not found',
      });
    }

    if (subscription.userId.toString() !== userId) {
      return res.status(403).json({
        error: 'Not authorized to cancel this subscription',
      });
    }

    if (subscription.status !== 'active') {
      return res.status(400).json({
        error: 'Subscription is not active',
      });
    }

    // Cancel the subscription
    const cancelledSubscription = await cancelSubscription(subscriptionId);

    // Update user subscription status
    await updateUser(userId, {
      'subscription.isActive': false,
    });

    logger.info('Subscription cancelled', {
      userId,
      subscriptionId,
    });

    res.json({
      success: true,
      subscription: cancelledSubscription,
    });
  } catch (error) {
    logger.error('Failed to cancel subscription', {
      error: error.message,
      userId: req.user?.id,
      subscriptionId: req.params?.subscriptionId,
    });
    res.status(500).json({
      error: 'Failed to cancel subscription',
      message: error.message,
    });
  }
};

/**
 * Handle Xendit webhook
 */
const handleWebhook = async (req, res) => {
  try {
    const signature = req.headers['x-callback-token'];
    const rawBody = JSON.stringify(req.body);

    // Verify webhook signature
    if (!xenditService.verifyWebhookSignature(rawBody, signature)) {
      logger.warn('Invalid webhook signature', { signature });
      return res.status(401).json({ error: 'Invalid signature' });
    }

    const { event, data } = req.body;

    logger.info('Received Xendit webhook', { event, invoiceId: data?.id });

    switch (event) {
      case 'invoice.paid':
        await handleInvoicePaid(data);
        break;
      case 'invoice.expired':
        await handleInvoiceExpired(data);
        break;
      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(data);
        break;
      default:
        logger.info('Unhandled webhook event', { event });
    }

    res.json({ success: true });
  } catch (error) {
    logger.error('Failed to handle webhook', {
      error: error.message,
      body: req.body,
    });
    res.status(500).json({
      error: 'Failed to handle webhook',
      message: error.message,
    });
  }
};

/**
 * Handle invoice paid event
 */
const handleInvoicePaid = async (invoiceData) => {
  try {
    const subscription = await findSubscriptionByInvoiceId(invoiceData.id);
    if (!subscription) {
      logger.warn('Subscription not found for paid invoice', { invoiceId: invoiceData.id });
      return;
    }

    // Update subscription status
    await updateSubscriptionByInvoiceId(invoiceData.id, {
      status: 'active',
      paidAt: new Date(),
      xenditPaymentId: invoiceData.payment_id,
    });

    // Update user subscription status
    await updateUser(subscription.userId, {
      'subscription.isActive': true,
      'subscription.type': subscription.type,
      'subscription.endDate': subscription.endDate,
      'subscription.lastPayment': new Date(),
    });

    logger.info('Subscription activated', {
      subscriptionId: subscription._id,
      userId: subscription.userId,
      invoiceId: invoiceData.id,
    });
  } catch (error) {
    logger.error('Failed to handle invoice paid', {
      error: error.message,
      invoiceId: invoiceData.id,
    });
  }
};

/**
 * Handle invoice expired event
 */
const handleInvoiceExpired = async (invoiceData) => {
  try {
    const subscription = await findSubscriptionByInvoiceId(invoiceData.id);
    if (!subscription) {
      logger.warn('Subscription not found for expired invoice', { invoiceId: invoiceData.id });
      return;
    }

    // Update subscription status
    await updateSubscriptionByInvoiceId(invoiceData.id, {
      status: 'expired',
    });

    logger.info('Subscription expired', {
      subscriptionId: subscription._id,
      userId: subscription.userId,
      invoiceId: invoiceData.id,
    });
  } catch (error) {
    logger.error('Failed to handle invoice expired', {
      error: error.message,
      invoiceId: invoiceData.id,
    });
  }
};

/**
 * Handle invoice payment failed event
 */
const handleInvoicePaymentFailed = async (invoiceData) => {
  try {
    const subscription = await findSubscriptionByInvoiceId(invoiceData.id);
    if (!subscription) {
      logger.warn('Subscription not found for failed payment', { invoiceId: invoiceData.id });
      return;
    }

    logger.info('Subscription payment failed', {
      subscriptionId: subscription._id,
      userId: subscription.userId,
      invoiceId: invoiceData.id,
    });
  } catch (error) {
    logger.error('Failed to handle payment failed', {
      error: error.message,
      invoiceId: invoiceData.id,
    });
  }
};

module.exports = {
  createSubscriptionInvoice,
  getSubscriptionStatus,
  cancelUserSubscription,
  handleWebhook,
};