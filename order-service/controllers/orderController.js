const Order = require('../models/Order');
const axios = require('axios');
const { validationResult } = require('express-validator');

const PRODUCT_SERVICE_URL = process.env.PRODUCT_SERVICE_URL || 'http://localhost:5002';

// @desc    Create a new order
// @route   POST /api/orders
// @access  Private
const createOrder = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { items, shippingAddress } = req.body;
    let totalAmount = 0;
    const orderItems = [];

    // Verify products and check stock via Product Service
    for (const item of items) {
      try {
        const productRes = await axios.get(
          `${PRODUCT_SERVICE_URL}/api/products/${item.productId}`,
          { timeout: 5000 }
        );

        const product = productRes.data.data;

        if (!product) {
          return res.status(404).json({
            success: false,
            message: `Product ${item.productId} not found`,
          });
        }

        if (product.stock < item.quantity) {
          return res.status(400).json({
            success: false,
            message: `Insufficient stock for ${product.name}. Available: ${product.stock}`,
          });
        }

        orderItems.push({
          productId: product._id,
          name: product.name,
          price: product.price,
          quantity: item.quantity,
        });

        totalAmount += product.price * item.quantity;
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: `Could not verify product ${item.productId}: ${error.message}`,
        });
      }
    }

    // Create order
    const order = await Order.create({
      userId: req.user._id,
      items: orderItems,
      totalAmount,
      shippingAddress,
    });

    // Decrement stock in Product Service
    for (const item of orderItems) {
      try {
        await axios.put(
          `${PRODUCT_SERVICE_URL}/api/products/${item.productId}/stock`,
          { quantity: -item.quantity },
          { timeout: 5000 }
        );
      } catch (error) {
        console.error(`Failed to update stock for product ${item.productId}:`, error.message);
      }
    }

    res.status(201).json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Get user's orders
// @route   GET /api/orders
// @access  Private
const getOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const query = { userId: req.user._id };
    if (status) query.status = status;

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({
      success: true,
      data: orders,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Ensure user can only see their own orders
    if (order.userId !== req.user._id) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this order' });
    }

    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Update order status (internal endpoint for Payment Service)
// @route   PUT /api/orders/:id/status
// @access  Internal
const updateOrderStatus = async (req, res) => {
  try {
    const { status, paymentStatus, paymentId } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (status) order.status = status;
    if (paymentStatus) order.paymentStatus = paymentStatus;
    if (paymentId) order.paymentId = paymentId;

    const updatedOrder = await order.save();
    res.json({ success: true, data: updatedOrder });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.userId !== req.user._id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (['shipped', 'delivered'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel order that has been shipped or delivered',
      });
    }

    order.status = 'cancelled';
    const updatedOrder = await order.save();

    // Restore stock in Product Service
    for (const item of order.items) {
      try {
        await axios.put(
          `${PRODUCT_SERVICE_URL}/api/products/${item.productId}/stock`,
          { quantity: item.quantity },
          { timeout: 5000 }
        );
      } catch (error) {
        console.error(`Failed to restore stock for product ${item.productId}:`, error.message);
      }
    }

    res.json({ success: true, data: updatedOrder });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

module.exports = {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
};
