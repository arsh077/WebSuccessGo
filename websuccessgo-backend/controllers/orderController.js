const Order = require('../models/Order');
const Template = require('../models/Template');
const logger = require('../utils/logger');

/**
 * Create a new order
 * Validation handled by middleware
 */
exports.createOrder = async (req, res, next) => {
  try {
    const { template, package: packageName, amount, details = {} } = req.body;

    // Verify template exists
    const templateExists = await Template.exists({ _id: template });
    if (!templateExists) {
      return res.status(404).json({ message: 'Template not found' });
    }

    // Generate unique order number
    const orderNumber = `WSG-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Create order
    const order = await Order.create({
      orderNumber,
      customer: req.user.id,
      template,
      package: packageName,
      amount,
      details,
      timeline: [{
        title: 'Order Received',
        description: 'Your order has been created successfully.',
        date: new Date()
      }]
    });

    // Populate template info
    await order.populate('template');

    logger.info(`Order created: ${orderNumber} by user ${req.user.id}`);

    res.status(201).json({
      message: 'Order created successfully',
      order
    });
  } catch (error) {
    logger.error('Create order error:', error);
    next(error);
  }
};

/**
 * Get all orders for current user with pagination
 */
exports.getMyOrders = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build query
    const query = { customer: req.user.id };

    // Add filters if provided
    if (req.query.status) {
      query.projectStatus = req.query.status;
    }
    if (req.query.paymentStatus) {
      query.paymentStatus = req.query.paymentStatus;
    }

    // Get orders with pagination
    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate('template', 'title category image price')
        .populate('assignedDeveloper', 'name email')
        .sort('-createdAt')
        .skip(skip)
        .limit(limit),
      Order.countDocuments(query)
    ]);

    res.json({
      orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    logger.error('Get orders error:', error);
    next(error);
  }
};

/**
 * Get single order by ID
 */
exports.getOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('template')
      .populate('customer', 'name email phone')
      .populate('assignedDeveloper', 'name email phone');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check authorization
    const isCustomer = req.user.role === 'customer';
    const isOrderOwner = String(order.customer._id) === req.user.id;

    if (isCustomer && !isOrderOwner) {
      logger.warn(`Unauthorized order access attempt by user ${req.user.id} for order ${req.params.id}`);
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(order);
  } catch (error) {
    logger.error('Get order error:', error);
    next(error);
  }
};

/**
 * Upload files for an order
 */
exports.uploadFiles = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check authorization
    const isCustomer = req.user.role === 'customer';
    const isOrderOwner = String(order.customer) === req.user.id;

    if (isCustomer && !isOrderOwner) {
      logger.warn(`Unauthorized file upload attempt by user ${req.user.id} for order ${req.params.id}`);
      return res.status(403).json({ message: 'Access denied' });
    }

    // Process uploaded files
    const files = req.files.map(file => file.path || `/uploads/${file.filename}`);
    order.files.push(...files);

    // Add timeline entry
    order.timeline.push({
      title: 'Files Uploaded',
      description: `${files.length} file(s) uploaded by ${req.user.role}`,
      date: new Date()
    });

    await order.save();

    logger.info(`Files uploaded for order ${order.orderNumber}: ${files.length} files`);

    res.json({
      message: 'Files uploaded successfully',
      files: order.files
    });
  } catch (error) {
    logger.error('Upload files error:', error);
    next(error);
  }
};
