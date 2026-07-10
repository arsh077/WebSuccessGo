const crypto = require('crypto');
const getRazorpay = require('../config/razorpay');
const Order = require('../models/Order');
const logger = require('../utils/logger');

/**
 * Create Razorpay payment order
 * Validation handled by middleware
 */
exports.createPayment = async (req, res, next) => {
  try {
    const { orderId, amount } = req.body;

    // Find order
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check authorization
    const isCustomer = req.user.role === 'customer';
    const isOrderOwner = String(order.customer) === req.user.id;
    const isAuthorized = isOrderOwner || ['admin', 'manager'].includes(req.user.role);

    if (!isAuthorized) {
      logger.warn(`Unauthorized payment creation attempt by user ${req.user.id} for order ${orderId}`);
      return res.status(403).json({ message: 'Access denied' });
    }

    // Calculate remaining amount
    const remainingAmount = order.amount - order.advancePaid;

    if (remainingAmount <= 0) {
      return res.status(400).json({ message: 'Order is already fully paid' });
    }

    // Use provided amount or default to 50% of order amount
    const paymentAmount = amount || Math.ceil(order.amount / 2);

    // Validate payment amount
    if (paymentAmount <= 0) {
      return res.status(400).json({ message: 'Invalid payment amount' });
    }

    if (paymentAmount > remainingAmount) {
      return res.status(400).json({
        message: `Payment amount cannot exceed remaining amount of ₹${remainingAmount}`
      });
    }

    // Create Razorpay order
    const gatewayOrder = await getRazorpay().orders.create({
      amount: Math.round(paymentAmount * 100), // Convert to paise
      currency: 'INR',
      receipt: order.orderNumber,
      notes: {
        orderId: order._id.toString(),
        customerId: req.user.id
      }
    });

    // Save Razorpay order ID
    order.razorpayOrderId = gatewayOrder.id;
    await order.save();

    logger.info(`Payment order created: ${gatewayOrder.id} for order ${order.orderNumber}`);

    res.json({
      gatewayOrder,
      key: process.env.RAZORPAY_KEY,
      amount: paymentAmount
    });
  } catch (error) {
    if (error.status === 503) {
      return res.status(503).json({ message: 'Payment service is not configured' });
    }
    logger.error('Create payment error:', error);
    next(error);
  }
};

/**
 * Verify Razorpay payment signature
 * Validation handled by middleware
 */
exports.verifyPayment = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, amount } = req.body;

    // Verify signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    const signatureBuffer = Buffer.from(razorpay_signature || '');
    const expectedBuffer = Buffer.from(expectedSignature);

    if (signatureBuffer.length !== expectedBuffer.length ||
        !crypto.timingSafeEqual(expectedBuffer, signatureBuffer)) {
      logger.warn(`Invalid payment signature for order ${razorpay_order_id}`);
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed'
      });
    }

    // Find order
    const order = await Order.findOne({ razorpayOrderId: razorpay_order_id });
    if (!order) {
      logger.error(`Order not found for Razorpay order ID: ${razorpay_order_id}`);
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if payment already processed
    if (order.razorpayPaymentId === razorpay_payment_id) {
      return res.json({
        success: true,
        message: 'Payment already processed',
        order
      });
    }

    // Update order with payment details
    const paidAmount = Number(amount) || 0;
    order.razorpayPaymentId = razorpay_payment_id;
    order.advancePaid = Math.min(order.amount, order.advancePaid + paidAmount);

    // Update payment status
    order.paymentStatus = order.advancePaid >= order.amount ? 'Paid' : 'Partial Paid';

    // Update project status if first payment
    if (order.projectStatus === 'Order Received') {
      order.projectStatus = 'Requirement Gathering';
    }

    // Add timeline entry
    order.timeline.push({
      title: 'Payment Received',
      description: `Payment of ₹${paidAmount} received successfully. Payment ID: ${razorpay_payment_id}`,
      date: new Date()
    });

    await order.save();

    logger.info(`Payment verified: ${razorpay_payment_id} for order ${order.orderNumber}`);

    res.json({
      success: true,
      message: 'Payment verified successfully',
      order
    });
  } catch (error) {
    logger.error('Verify payment error:', error);
    next(error);
  }
};

/**
 * Razorpay webhook handler
 * Processes payment events from Razorpay
 */
exports.webhook = async (req, res, next) => {
  try {
    const signature = req.headers['x-razorpay-signature'];

    if (!signature) {
      logger.warn('Webhook received without signature');
      return res.status(400).json({ message: 'Missing signature' });
    }

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
      .update(req.body)
      .digest('hex');

    const signatureBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expectedSignature);

    if (signatureBuffer.length !== expectedBuffer.length ||
        !crypto.timingSafeEqual(expectedBuffer, signatureBuffer)) {
      logger.warn('Invalid webhook signature');
      return res.status(400).json({ message: 'Invalid webhook signature' });
    }

    // Parse webhook event
    const event = JSON.parse(req.body.toString());

    logger.info(`Webhook received: ${event.event}`);

    // Handle payment captured event
    if (event.event === 'payment.captured') {
      const payment = event.payload.payment.entity;

      const order = await Order.findOne({ razorpayOrderId: payment.order_id });

      if (order && !order.razorpayPaymentId) {
        order.razorpayPaymentId = payment.id;
        order.advancePaid = Math.min(order.amount, order.advancePaid + (payment.amount / 100));
        order.paymentStatus = order.advancePaid >= order.amount ? 'Paid' : 'Partial Paid';

        if (order.projectStatus === 'Order Received') {
          order.projectStatus = 'Requirement Gathering';
        }

        order.timeline.push({
          title: 'Payment Captured',
          description: `Webhook: Payment captured ₹${payment.amount / 100}`,
          date: new Date()
        });

        await order.save();

        logger.info(`Webhook processed: Payment captured for order ${order.orderNumber}`);
      }
    }

    res.json({ status: 'ok' });
  } catch (error) {
    logger.error('Webhook error:', error);
    // Don't call next() for webhooks - return 200 to prevent retries
    res.status(200).json({ status: 'error received' });
  }
};
