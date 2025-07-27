const { createSubscriptionModel } = require('@librechat/data-schemas');
const { connectDb } = require('../db/connect');

let Subscription;

const getSubscriptionModel = async () => {
  if (!Subscription) {
    const db = await connectDb();
    Subscription = createSubscriptionModel(db);
  }
  return Subscription;
};

/**
 * Create a new subscription
 * @param {Object} subscriptionData - The subscription data
 * @returns {Promise<Object>} The created subscription
 */
const createSubscription = async (subscriptionData) => {
  const Subscription = await getSubscriptionModel();
  return await Subscription.create(subscriptionData);
};

/**
 * Find subscription by ID
 * @param {string} subscriptionId - The subscription ID
 * @returns {Promise<Object|null>} The subscription or null
 */
const findSubscriptionById = async (subscriptionId) => {
  const Subscription = await getSubscriptionModel();
  return await Subscription.findById(subscriptionId);
};

/**
 * Find subscription by Xendit invoice ID
 * @param {string} xenditInvoiceId - The Xendit invoice ID
 * @returns {Promise<Object|null>} The subscription or null
 */
const findSubscriptionByInvoiceId = async (xenditInvoiceId) => {
  const Subscription = await getSubscriptionModel();
  return await Subscription.findOne({ xenditInvoiceId });
};

/**
 * Find active subscription for user
 * @param {string} userId - The user ID
 * @returns {Promise<Object|null>} The active subscription or null
 */
const findActiveSubscription = async (userId) => {
  const Subscription = await getSubscriptionModel();
  return await Subscription.findOne({
    userId,
    status: 'active',
    endDate: { $gt: new Date() },
  }).sort({ endDate: -1 });
};

/**
 * Find all subscriptions for user
 * @param {string} userId - The user ID
 * @param {Object} options - Query options
 * @returns {Promise<Array>} Array of subscriptions
 */
const findUserSubscriptions = async (userId, options = {}) => {
  const Subscription = await getSubscriptionModel();
  const { limit = 10, skip = 0, sort = { createdAt: -1 } } = options;
  
  return await Subscription.find({ userId })
    .sort(sort)
    .limit(limit)
    .skip(skip);
};

/**
 * Update subscription
 * @param {string} subscriptionId - The subscription ID
 * @param {Object} updateData - The update data
 * @returns {Promise<Object|null>} The updated subscription
 */
const updateSubscription = async (subscriptionId, updateData) => {
  const Subscription = await getSubscriptionModel();
  return await Subscription.findByIdAndUpdate(
    subscriptionId,
    updateData,
    { new: true, runValidators: true }
  );
};

/**
 * Update subscription by Xendit invoice ID
 * @param {string} xenditInvoiceId - The Xendit invoice ID
 * @param {Object} updateData - The update data
 * @returns {Promise<Object|null>} The updated subscription
 */
const updateSubscriptionByInvoiceId = async (xenditInvoiceId, updateData) => {
  const Subscription = await getSubscriptionModel();
  return await Subscription.findOneAndUpdate(
    { xenditInvoiceId },
    updateData,
    { new: true, runValidators: true }
  );
};

/**
 * Find expired subscriptions
 * @returns {Promise<Array>} Array of expired subscriptions
 */
const findExpiredSubscriptions = async () => {
  const Subscription = await getSubscriptionModel();
  return await Subscription.find({
    status: 'active',
    endDate: { $lt: new Date() },
  });
};

/**
 * Cancel subscription
 * @param {string} subscriptionId - The subscription ID
 * @returns {Promise<Object|null>} The cancelled subscription
 */
const cancelSubscription = async (subscriptionId) => {
  const Subscription = await getSubscriptionModel();
  return await Subscription.findByIdAndUpdate(
    subscriptionId,
    {
      status: 'cancelled',
      cancelledAt: new Date(),
    },
    { new: true }
  );
};

module.exports = {
  createSubscription,
  findSubscriptionById,
  findSubscriptionByInvoiceId,
  findActiveSubscription,
  findUserSubscriptions,
  updateSubscription,
  updateSubscriptionByInvoiceId,
  findExpiredSubscriptions,
  cancelSubscription,
};