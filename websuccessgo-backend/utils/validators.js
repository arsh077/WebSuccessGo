const Joi = require('joi');

// User validation schemas
exports.registerSchema = Joi.object({
  name: Joi.string().min(2).max(50).trim().required().messages({
    'string.min': 'Name must be at least 2 characters',
    'string.max': 'Name cannot exceed 50 characters',
    'any.required': 'Name is required'
  }),
  email: Joi.string().email().lowercase().trim().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required'
  }),
  password: Joi.string().min(8).max(128).required()
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .messages({
      'string.min': 'Password must be at least 8 characters',
      'string.pattern.base': 'Password must contain at least one uppercase, one lowercase, and one number',
      'any.required': 'Password is required'
    }),
  phone: Joi.string().pattern(/^[6-9]\d{9}$/).optional().messages({
    'string.pattern.base': 'Please provide a valid 10-digit Indian mobile number'
  })
});

exports.loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email',
    'any.required': 'Email is required'
  }),
  password: Joi.string().required().messages({
    'any.required': 'Password is required'
  })
});

// Order validation schemas
exports.createOrderSchema = Joi.object({
  template: Joi.string().length(24).hex().required().messages({
    'string.length': 'Invalid template ID',
    'any.required': 'Template is required'
  }),
  package: Joi.string().valid('Basic', 'Standard', 'Premium', 'Enterprise').required().messages({
    'any.only': 'Package must be one of: Basic, Standard, Premium, Enterprise',
    'any.required': 'Package is required'
  }),
  amount: Joi.number().min(0).max(1000000).required().messages({
    'number.min': 'Amount must be positive',
    'number.max': 'Amount exceeds maximum limit',
    'any.required': 'Amount is required'
  }),
  details: Joi.object().optional()
});

// Payment validation schemas
exports.createPaymentSchema = Joi.object({
  orderId: Joi.string().length(24).hex().required().messages({
    'string.length': 'Invalid order ID',
    'any.required': 'Order ID is required'
  }),
  amount: Joi.number().min(1).max(1000000).optional().messages({
    'number.min': 'Amount must be at least 1',
    'number.max': 'Amount exceeds maximum limit'
  })
});

exports.verifyPaymentSchema = Joi.object({
  razorpay_order_id: Joi.string().required(),
  razorpay_payment_id: Joi.string().required(),
  razorpay_signature: Joi.string().required(),
  amount: Joi.number().min(0).required()
});

// Template validation schemas
exports.templateSchema = Joi.object({
  title: Joi.string().min(3).max(100).trim().required().messages({
    'string.min': 'Title must be at least 3 characters',
    'any.required': 'Title is required'
  }),
  category: Joi.string().min(2).max(50).trim().required().messages({
    'any.required': 'Category is required'
  }),
  image: Joi.string().uri().optional(),
  demoLink: Joi.string().uri().optional(),
  price: Joi.number().min(0).max(1000000).required().messages({
    'number.min': 'Price must be positive',
    'any.required': 'Price is required'
  }),
  features: Joi.array().items(Joi.string().max(200)).optional()
});

// Admin validation schemas
exports.updateProjectStatusSchema = Joi.object({
  status: Joi.string().required().messages({
    'any.required': 'Status is required'
  }),
  note: Joi.string().max(500).optional().allow('')
});

exports.assignDeveloperSchema = Joi.object({
  developerId: Joi.string().length(24).hex().required().messages({
    'string.length': 'Invalid developer ID',
    'any.required': 'Developer ID is required'
  })
});

// Validation middleware
exports.validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));
      return res.status(400).json({
        message: 'Validation failed',
        errors
      });
    }

    req.body = value;
    next();
  };
};
