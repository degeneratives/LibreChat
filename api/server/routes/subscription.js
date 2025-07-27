const express = require('express');
const {
  createSubscriptionInvoice,
  getSubscriptionStatus,
  cancelUserSubscription,
  handleWebhook,
} = require('~/server/controllers/SubscriptionController');
const { requireJwtAuth } = require('~/server/middleware');

const router = express.Router();

// Protected routes (require authentication)
router.get('/status', requireJwtAuth, getSubscriptionStatus);
router.post('/create', requireJwtAuth, createSubscriptionInvoice);
router.post('/cancel/:subscriptionId', requireJwtAuth, cancelUserSubscription);

// Webhook route (no auth required)
router.post('/webhook', handleWebhook);

module.exports = router;