const Template = require('../models/Template');
const logger = require('../utils/logger');

/**
 * Get all templates with pagination and filters
 */
exports.getTemplates = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Build query
    const query = {};

    // Add category filter
    if (req.query.category) {
      query.category = req.query.category;
    }

    // Add price range filter
    if (req.query.minPrice || req.query.maxPrice) {
      query.price = {};
      if (req.query.minPrice) query.price.$gte = Number(req.query.minPrice);
      if (req.query.maxPrice) query.price.$lte = Number(req.query.maxPrice);
    }

    // Add search by title
    if (req.query.search) {
      query.title = { $regex: req.query.search, $options: 'i' };
    }

    // Get templates with pagination
    const [templates, total] = await Promise.all([
      Template.find(query)
        .sort(req.query.sort || '-createdAt')
        .skip(skip)
        .limit(limit),
      Template.countDocuments(query)
    ]);

    res.json({
      templates,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    logger.error('Get templates error:', error);
    next(error);
  }
};

/**
 * Get single template by ID
 */
exports.getTemplate = async (req, res, next) => {
  try {
    const template = await Template.findById(req.params.id);

    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }

    res.json(template);
  } catch (error) {
    logger.error('Get template error:', error);
    next(error);
  }
};

/**
 * Add new template (Admin/Manager only)
 * Validation handled by middleware
 */
exports.addTemplate = async (req, res, next) => {
  try {
    const template = await Template.create(req.body);

    logger.info(`Template created: ${template.title} by user ${req.user.id}`);

    res.status(201).json({
      message: 'Template created successfully',
      template
    });
  } catch (error) {
    logger.error('Add template error:', error);
    next(error);
  }
};

/**
 * Update template (Admin/Manager only)
 * Validation handled by middleware
 */
exports.updateTemplate = async (req, res, next) => {
  try {
    const template = await Template.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }

    logger.info(`Template updated: ${template.title} by user ${req.user.id}`);

    res.json({
      message: 'Template updated successfully',
      template
    });
  } catch (error) {
    logger.error('Update template error:', error);
    next(error);
  }
};

/**
 * Delete template (Admin only)
 */
exports.deleteTemplate = async (req, res, next) => {
  try {
    const template = await Template.findByIdAndDelete(req.params.id);

    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }

    logger.info(`Template deleted: ${template.title} by user ${req.user.id}`);

    res.status(204).end();
  } catch (error) {
    logger.error('Delete template error:', error);
    next(error);
  }
};
