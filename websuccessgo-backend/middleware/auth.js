const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

module.exports = (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Access token is required' });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Access token is required' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user info to request
    req.user = {
      id: decoded.id,
      role: decoded.role
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      logger.warn('Expired token used');
      return res.status(401).json({ message: 'Token has expired' });
    }

    if (error.name === 'JsonWebTokenError') {
      logger.warn('Invalid token used');
      return res.status(401).json({ message: 'Invalid token' });
    }

    logger.error('Auth middleware error:', error);
    return res.status(401).json({ message: 'Authentication failed' });
  }
};
