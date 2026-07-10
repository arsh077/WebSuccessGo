const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();
const connectDB = require('./database/connect');
const logger = require('./utils/logger');
const validateEnv = require('./utils/envValidator');

// Validate environment variables at startup
try {
  validateEnv();
} catch (error) {
  logger.error('Environment validation failed:', error.message);
  process.exit(1);
}

const app = express();

// Security middleware
app.use(helmet({ 
  crossOriginResourcePolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    }
  }
}));

// CORS configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL?.split(',').map(url => url.trim()) || 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Rate limiting
const limiter = rateLimit({ 
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 100 : 200, // More strict in production
  standardHeaders: true, 
  legacyHeaders: false,
  message: 'Too many requests from this IP, please try again later.',
  handler: (req, res) => {
    logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({ message: 'Too many requests, please try again later.' });
  }
});
app.use('/api/', limiter);

// Body parsing - webhook route needs raw body, so it's registered before JSON parser
app.use('/api/payments/webhook', require('./routes/paymentRoutes'));

// JSON body parser for all other routes
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// Static file serving
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/invoices', express.static(path.join(__dirname, 'invoices')));

// API Routes
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/templates', require('./routes/templateRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/customer', require('./routes/customerRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));

// Health check route
app.get('/', (req, res) => res.json({ 
  name: 'WebSuccessGo API', 
  status: 'Running',
  version: '1.0.0',
  environment: process.env.NODE_ENV || 'development'
}));

// 404 handler
app.use((req, res) => {
  logger.warn(`404 - Route not found: ${req.method} ${req.url}`);
  res.status(404).json({ message: 'Route not found' });
});

// Global error handler
app.use((error, req, res, next) => {
  logger.error('Error:', {
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip
  });

  // Don't leak error details in production
  const message = process.env.NODE_ENV === 'production' 
    ? 'Internal server error' 
    : error.message;

  res.status(error.status || 500).json({ 
    message,
    ...(process.env.NODE_ENV !== 'production' && { stack: error.stack })
  });
});

const port = Number(process.env.PORT) || 5000;

// Start server
app.listen(port, () => {
  logger.info(`Server running on port ${port} in ${process.env.NODE_ENV || 'development'} mode`);
});

// Connect to database
connectDB()
  .then(() => logger.info('Database connected successfully'))
  .catch((error) => {
    logger.error('Database connection failed:', error.message);
    logger.warn('Server is running but database operations will fail');
  });

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT signal received: closing HTTP server');
  process.exit(0);
});
