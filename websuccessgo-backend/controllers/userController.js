const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../utils/logger');

// Helper function to create public user object (no sensitive data)
const publicUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  role: user.role,
  createdAt: user.createdAt
});

// Generate JWT token with shorter expiry for better security
const tokenFor = (user) => jwt.sign(
  { id: user._id, role: user.role },
  process.env.JWT_SECRET,
  { expiresIn: '24h' } // Changed from 7d to 24h for better security
);

// Refresh token with longer expiry
const refreshTokenFor = (user) => jwt.sign(
  { id: user._id, type: 'refresh' },
  process.env.JWT_SECRET,
  { expiresIn: '7d' }
);

/**
 * Register a new user
 * Validation is handled by middleware
 */
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;

    // Check if email already exists
    const existingUser = await User.exists({ email: email.toLowerCase() });
    if (existingUser) {
      logger.warn(`Registration attempt with existing email: ${email}`);
      // Generic message to prevent email enumeration
      return res.status(409).json({ message: 'Registration failed. Please try with different credentials.' });
    }

    // Hash password with higher cost factor
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      phone,
      password: hashedPassword
    });

    logger.info(`New user registered: ${user.email}`);

    res.status(201).json({
      message: 'Registration successful',
      token: tokenFor(user),
      refreshToken: refreshTokenFor(user),
      user: publicUser(user)
    });
  } catch (error) {
    logger.error('Registration error:', error);
    next(error);
  }
};

/**
 * Login user
 * Validation is handled by middleware
 */
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user and include password field
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    // Generic error message to prevent user enumeration
    if (!user) {
      logger.warn(`Login attempt with non-existent email: ${email}`);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      logger.warn(`Failed login attempt for user: ${email}`);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    logger.info(`User logged in: ${user.email}`);

    res.json({
      message: 'Login successful',
      token: tokenFor(user),
      refreshToken: refreshTokenFor(user),
      user: publicUser(user)
    });
  } catch (error) {
    logger.error('Login error:', error);
    next(error);
  }
};

/**
 * Get current user profile
 */
exports.me = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user: publicUser(user) });
  } catch (error) {
    logger.error('Get profile error:', error);
    next(error);
  }
};

/**
 * Refresh access token
 */
exports.refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ message: 'Refresh token is required' });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);

    if (decoded.type !== 'refresh') {
      return res.status(401).json({ message: 'Invalid token type' });
    }

    // Get user
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate new tokens
    res.json({
      token: tokenFor(user),
      refreshToken: refreshTokenFor(user)
    });
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Invalid or expired refresh token' });
    }
    logger.error('Refresh token error:', error);
    next(error);
  }
};

/**
 * Update user profile
 */
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, phone } = req.body;

    const updates = {};
    if (name) updates.name = name;
    if (phone) updates.phone = phone;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updates,
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    logger.info(`User profile updated: ${user.email}`);

    res.json({
      message: 'Profile updated successfully',
      user: publicUser(user)
    });
  } catch (error) {
    logger.error('Update profile error:', error);
    next(error);
  }
};

/**
 * Change password
 */
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current password and new password are required' });
    }

    // Get user with password
    const user = await User.findById(req.user.id).select('+password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    // Hash new password
    user.password = await bcrypt.hash(newPassword, 12);
    await user.save();

    logger.info(`Password changed for user: ${user.email}`);

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    logger.error('Change password error:', error);
    next(error);
  }
};
