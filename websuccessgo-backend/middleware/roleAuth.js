const logger = require('../utils/logger');

module.exports = (allowedRoles) => {
  return (req, res, next) => {
    // Check if user is authenticated (should be set by auth middleware)
    if (!req.user) {
      logger.error('roleAuth called without user object in request');
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Check if user role is in allowed roles
    if (!allowedRoles.includes(req.user.role)) {
      logger.warn(`Access denied for user ${req.user.id} with role ${req.user.role}`);
      return res.status(403).json({
        message: 'Access denied. Insufficient permissions.'
      });
    }

    next();
  };
};
