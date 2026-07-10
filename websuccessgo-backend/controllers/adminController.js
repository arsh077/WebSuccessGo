const Order = require('../models/Order');
const User = require('../models/User');
const Activity = require('../models/Activity');
const createInvoice = require('../utils/invoice');
const logger = require('../utils/logger');

/**
 * Get all orders with filters and pagination (Admin/Manager)
 */
exports.getOrders = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Build query
    const query = {};

    // Add filters
    if (req.query.status) {
      query.projectStatus = req.query.status;
    }
    if (req.query.paymentStatus) {
      query.paymentStatus = req.query.paymentStatus;
    }
    if (req.query.developer) {
      query.assignedDeveloper = req.query.developer;
    }

    // Get orders with pagination
    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate('customer', 'name email phone')
        .populate('template', 'title category price')
        .populate('assignedDeveloper', 'name email phone')
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
 * Get all users with filters (Admin/Manager)
 */
exports.getUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Build query
    const query = {};

    // Add role filter
    if (req.query.role) {
      query.role = req.query.role;
    }

    // Get users with pagination
    const [users, total] = await Promise.all([
      User.find(query)
        .select('-password')
        .sort('-createdAt')
        .skip(skip)
        .limit(limit),
      User.countDocuments(query)
    ]);

    res.json({
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    logger.error('Get users error:', error);
    next(error);
  }
};

/**
 * Update project status (Admin/Manager)
 * Validation handled by middleware
 */
exports.updateProject = async (req, res, next) => {
  try {
    const { status, note = '' } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Update status
    order.projectStatus = status;

    // Add timeline entry
    order.timeline.push({
      title: status,
      description: note || `Project status updated to ${status}`,
      date: new Date()
    });

    await order.save();

    // Log activity
    await Activity.create({
      user: req.user.id,
      action: `Updated project status to ${status}`,
      order: order._id
    });

    logger.info(`Order ${order.orderNumber} status updated to ${status} by user ${req.user.id}`);

    res.json({
      message: 'Project status updated successfully',
      order
    });
  } catch (error) {
    logger.error('Update project error:', error);
    next(error);
  }
};

/**
 * Assign developer to order (Admin/Manager)
 * Validation handled by middleware
 */
exports.assignDeveloper = async (req, res, next) => {
  try {
    const { developerId } = req.body;

    // Verify developer exists and has correct role
    const developer = await User.findOne({
      _id: developerId,
      role: 'developer'
    });

    if (!developer) {
      return res.status(400).json({ message: 'Developer not found or invalid role' });
    }

    // Update order
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { assignedDeveloper: developer._id },
      { new: true }
    ).populate('assignedDeveloper', 'name email');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Add timeline entry
    order.timeline.push({
      title: 'Developer Assigned',
      description: `${developer.name} has been assigned to this project`,
      date: new Date()
    });

    await order.save();

    // Log activity
    await Activity.create({
      user: req.user.id,
      action: `Assigned ${developer.name} to project`,
      order: order._id
    });

    logger.info(`Developer ${developer.name} assigned to order ${order.orderNumber} by user ${req.user.id}`);

    res.json({
      message: 'Developer assigned successfully',
      order
    });
  } catch (error) {
    logger.error('Assign developer error:', error);
    next(error);
  }
};

/**
 * Get admin dashboard statistics
 */
exports.dashboard = async (req, res, next) => {
  try {
    // Get various statistics
    const [
      totalOrders,
      revenueData,
      pendingProjects,
      completedProjects,
      totalCustomers,
      recentOrders
    ] = await Promise.all([
      Order.countDocuments(),
      Order.aggregate([
        {
          $match: {
            paymentStatus: { $in: ['Paid', 'Partial Paid'] }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$advancePaid' },
            pending: {
              $sum: {
                $subtract: ['$amount', '$advancePaid']
              }
            }
          }
        }
      ]),
      Order.countDocuments({ projectStatus: { $nin: ['Completed', 'Delivered'] } }),
      Order.countDocuments({ projectStatus: { $in: ['Completed', 'Delivered'] } }),
      User.countDocuments({ role: 'customer' }),
      Order.find()
        .populate('customer', 'name email')
        .populate('template', 'title')
        .sort('-createdAt')
        .limit(10)
    ]);

    const revenue = revenueData[0] || { total: 0, pending: 0 };

    res.json({
      totalOrders,
      totalRevenue: revenue.total,
      pendingRevenue: revenue.pending,
      pendingProjects,
      completedProjects,
      totalCustomers,
      recentOrders
    });
  } catch (error) {
    logger.error('Dashboard error:', error);
    next(error);
  }
};

/**
 * Generate invoice for an order
 */
exports.generateInvoice = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('customer', 'name email phone')
      .populate('template', 'title');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if invoice already exists
    if (order.invoice) {
      return res.json({
        message: 'Invoice already exists',
        invoice: order.invoice
      });
    }

    // Generate invoice
    const invoicePath = createInvoice(order);
    order.invoice = invoicePath;

    // Add timeline entry
    order.timeline.push({
      title: 'Invoice Generated',
      description: 'Invoice has been generated for this order',
      date: new Date()
    });

    await order.save();

    logger.info(`Invoice generated for order ${order.orderNumber} by user ${req.user.id}`);

    res.json({
      message: 'Invoice generated successfully',
      invoice: order.invoice
    });
  } catch (error) {
    logger.error('Generate invoice error:', error);
    next(error);
  }
};
