const Payment = require('../models/Payment');
const axios = require('axios');
const { validationResult } = require('express-validator');
const crypto = require('crypto');

const ORDER_SERVICE_URL = process.env.ORDER_SERVICE_URL || 'http://localhost:5003';

// Generate unique transaction ID
const generateTransactionId = () => {
  return `TXN_${Date.now()}_${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
};

// Simulate payment processing (mock)
const simulatePaymentProcessing = async (method, amount) => {
  // Simulate processing delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Simulate 90% success rate
  const isSuccess = Math.random() < 0.9;

  return {
    success: isSuccess,
    failureReason: isSuccess ? null : 'Payment declined by bank',
  };
};

// @desc    Process a payment
// @route   POST /api/payments
// @access  Private
const processPayment = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { orderId, amount, currency, method, cardLast4 } = req.body;

    // Check if payment already exists for this order
    const existingPayment = await Payment.findOne({
      orderId,
      status: 'completed',
    });

    if (existingPayment) {
      return res.status(400).json({
        success: false,
        message: 'Payment already completed for this order',
      });
    }

    const transactionId = generateTransactionId();

    // Create payment record
    const payment = await Payment.create({
      orderId,
      userId: req.user._id,
      amount,
      currency: currency || 'USD',
      method,
      transactionId,
      cardLast4,
      status: 'processing',
    });

    // Simulate payment processing
    const result = await simulatePaymentProcessing(method, amount);

    if (result.success) {
      payment.status = 'completed';

      // Update order status via Order Service (inter-service communication)
      try {
        await axios.put(
          `${ORDER_SERVICE_URL}/api/orders/${orderId}/status`,
          {
            status: 'confirmed',
            paymentStatus: 'paid',
            paymentId: payment._id.toString(),
          },
          { timeout: 5000 }
        );
      } catch (error) {
        console.error('Failed to update order status:', error.message);
        // Payment succeeded but order update failed - log for manual resolution
      }
    } else {
      payment.status = 'failed';
      payment.failureReason = result.failureReason;

      // Update order payment status to failed
      try {
        await axios.put(
          `${ORDER_SERVICE_URL}/api/orders/${orderId}/status`,
          { paymentStatus: 'failed' },
          { timeout: 5000 }
        );
      } catch (error) {
        console.error('Failed to update order status:', error.message);
      }
    }

    await payment.save();

    res.status(result.success ? 201 : 400).json({
      success: result.success,
      data: payment,
      message: result.success
        ? 'Payment processed successfully'
        : `Payment failed: ${result.failureReason}`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Get payment by ID
// @route   GET /api/payments/:id
// @access  Private
const getPaymentById = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }

    if (payment.userId !== req.user._id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    res.json({ success: true, data: payment });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Get payment by order ID
// @route   GET /api/payments/order/:orderId
// @access  Private
const getPaymentByOrderId = async (req, res) => {
  try {
    const payment = await Payment.findOne({ orderId: req.params.orderId });

    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found for this order' });
    }

    if (payment.userId !== req.user._id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    res.json({ success: true, data: payment });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

module.exports = {
  processPayment,
  getPaymentById,
  getPaymentByOrderId,
};
