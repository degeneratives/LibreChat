const axios = require('axios');
const { logger } = require('@librechat/data-schemas');

class XenditService {
  constructor() {
    this.secretKey = process.env.XENDIT_SECRET_KEY;
    this.publicKey = process.env.XENDIT_PUBLIC_KEY;
    this.webhookToken = process.env.XENDIT_WEBHOOK_TOKEN;
    this.environment = process.env.XENDIT_ENVIRONMENT || 'test';
    this.baseURL = this.environment === 'live' 
      ? 'https://api.xendit.co' 
      : 'https://api.xendit.co'; // Xendit uses same URL for both
    
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Authorization': `Basic ${Buffer.from(this.secretKey + ':').toString('base64')}`,
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Create an invoice for subscription payment
   * @param {Object} params - Invoice parameters
   * @returns {Promise<Object>} Invoice response
   */
  async createInvoice({
    externalId,
    amount,
    description,
    customerEmail,
    customerName,
    successRedirectUrl,
    failureRedirectUrl,
    currency = 'PHP',
    invoiceDuration = 86400, // 24 hours in seconds
  }) {
    try {
      const payload = {
        external_id: externalId,
        amount,
        description,
        invoice_duration: invoiceDuration,
        customer: {
          given_names: customerName,
          email: customerEmail,
        },
        customer_notification_preference: {
          invoice_created: ['email'],
          invoice_reminder: ['email'],
          invoice_paid: ['email'],
          invoice_expired: ['email'],
        },
        success_redirect_url: successRedirectUrl,
        failure_redirect_url: failureRedirectUrl,
        currency,
        items: [
          {
            name: description,
            quantity: 1,
            price: amount,
          },
        ],
      };

      const response = await this.client.post('/v2/invoices', payload);
      logger.info('Xendit invoice created successfully', { 
        invoiceId: response.data.id,
        externalId 
      });
      
      return response.data;
    } catch (error) {
      logger.error('Failed to create Xendit invoice', {
        error: error.response?.data || error.message,
        externalId,
      });
      throw new Error(`Failed to create invoice: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Get invoice details
   * @param {string} invoiceId - The invoice ID
   * @returns {Promise<Object>} Invoice details
   */
  async getInvoice(invoiceId) {
    try {
      const response = await this.client.get(`/v2/invoices/${invoiceId}`);
      return response.data;
    } catch (error) {
      logger.error('Failed to get Xendit invoice', {
        error: error.response?.data || error.message,
        invoiceId,
      });
      throw new Error(`Failed to get invoice: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Expire an invoice
   * @param {string} invoiceId - The invoice ID
   * @returns {Promise<Object>} Expired invoice details
   */
  async expireInvoice(invoiceId) {
    try {
      const response = await this.client.post(`/v2/invoices/${invoiceId}/expire`);
      logger.info('Xendit invoice expired successfully', { invoiceId });
      return response.data;
    } catch (error) {
      logger.error('Failed to expire Xendit invoice', {
        error: error.response?.data || error.message,
        invoiceId,
      });
      throw new Error(`Failed to expire invoice: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Verify webhook signature
   * @param {string} rawBody - Raw request body
   * @param {string} signature - X-CALLBACK-TOKEN header
   * @returns {boolean} Whether signature is valid
   */
  verifyWebhookSignature(rawBody, signature) {
    try {
      // Xendit uses X-CALLBACK-TOKEN for webhook verification
      return signature === this.webhookToken;
    } catch (error) {
      logger.error('Failed to verify webhook signature', { error: error.message });
      return false;
    }
  }

  /**
   * Get payment details
   * @param {string} paymentId - The payment ID
   * @returns {Promise<Object>} Payment details
   */
  async getPayment(paymentId) {
    try {
      const response = await this.client.get(`/v2/payments/${paymentId}`);
      return response.data;
    } catch (error) {
      logger.error('Failed to get Xendit payment', {
        error: error.response?.data || error.message,
        paymentId,
      });
      throw new Error(`Failed to get payment: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Create a refund
   * @param {Object} params - Refund parameters
   * @returns {Promise<Object>} Refund response
   */
  async createRefund({ paymentId, amount, reason, externalId }) {
    try {
      const payload = {
        payment_id: paymentId,
        amount,
        reason,
        external_id: externalId,
      };

      const response = await this.client.post('/v2/refunds', payload);
      logger.info('Xendit refund created successfully', { 
        refundId: response.data.id,
        paymentId,
        amount 
      });
      
      return response.data;
    } catch (error) {
      logger.error('Failed to create Xendit refund', {
        error: error.response?.data || error.message,
        paymentId,
      });
      throw new Error(`Failed to create refund: ${error.response?.data?.message || error.message}`);
    }
  }
}

module.exports = XenditService;