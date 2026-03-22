const express = require('express');
const { body } = require('express-validator');
const {
  processPayment,
  getPaymentById,
  getPaymentByOrderId,
} = require('../controllers/paymentController');
const { verifyAuth } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Payment:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         orderId:
 *           type: string
 *         userId:
 *           type: string
 *         amount:
 *           type: number
 *         currency:
 *           type: string
 *           enum: [USD, EUR, GBP, LKR]
 *         method:
 *           type: string
 *           enum: [credit_card, debit_card, paypal, bank_transfer]
 *         status:
 *           type: string
 *           enum: [pending, processing, completed, failed, refunded]
 *         transactionId:
 *           type: string
 *         cardLast4:
 *           type: string
 */

/**
 * @swagger
 * /api/payments:
 *   post:
 *     summary: Process a payment
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - orderId
 *               - amount
 *               - method
 *             properties:
 *               orderId:
 *                 type: string
 *               amount:
 *                 type: number
 *               currency:
 *                 type: string
 *               method:
 *                 type: string
 *               cardLast4:
 *                 type: string
 *     responses:
 *       201:
 *         description: Payment processed successfully
 *       400:
 *         description: Payment failed or validation error
 */
router.post(
  '/',
  verifyAuth,
  [
    body('orderId').notEmpty().withMessage('Order ID is required'),
    body('amount').isFloat({ min: 0.01 }).withMessage('Valid amount is required'),
    body('method')
      .isIn(['credit_card', 'debit_card', 'paypal', 'bank_transfer'])
      .withMessage('Valid payment method is required'),
  ],
  processPayment
);

/**
 * @swagger
 * /api/payments/{id}:
 *   get:
 *     summary: Get payment by ID
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Payment details
 *       404:
 *         description: Payment not found
 */
router.get('/:id', verifyAuth, getPaymentById);

/**
 * @swagger
 * /api/payments/order/{orderId}:
 *   get:
 *     summary: Get payment by order ID
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Payment details
 *       404:
 *         description: Payment not found
 */
router.get('/order/:orderId', verifyAuth, getPaymentByOrderId);

module.exports = router;
