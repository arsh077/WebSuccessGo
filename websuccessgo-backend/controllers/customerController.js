const Order = require('../models/Order');
const logger = require('../utils/logger');

/**
 * Get customer dashboard with statistics
 */
exports.dashboard = async (req, res, next) => {
  try {
    // Get all customer orders
    const orders = await Order.find({ customer: req.user.id })
      .populate('template', 'title category image')
      .populate('assignedDeveloper', 'name email')
      .sort('-createdAt');

    // Calculate statistics
    const totalOrders = orders.length;
    const activeOrders = orders.filter(
      order => !['Completed', 'Delivered', 'Cancelled'].includes(order.projectStatus)
    ).length;
    const completedOrders = orders.filter(
      order => ['Completed', 'Delivered'].includes(order.projectStatus)
    ).length;

    const totalSpent = orders.reduce((sum, order) => sum + order.advancePaid, 0);
    const pendingPayments = orders.reduce(
      (sum, order) => sum + (order.amount - order.advancePaid),
      0
    );

    res.json({
      totalOrders,
      activeOrders,
      completedOrders,
      totalSpent,
      pendingPayments,
      recentOrders: orders.slice(0, 5)
    });
  } catch (error) {
    logger.error('Customer dashboard error:', error);
    next(error);
  }
};
