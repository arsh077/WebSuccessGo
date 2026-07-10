const logger = require('./logger');

const requiredEnvVars = [
  'PORT',
  'MONGO_URL',
  'JWT_SECRET',
  'FRONTEND_URL'
];

const optionalEnvVars = [
  'RAZORPAY_KEY',
  'RAZORPAY_SECRET',
  'RAZORPAY_WEBHOOK_SECRET',
  'CLOUD_NAME',
  'CLOUD_KEY',
  'CLOUD_SECRET',
  'EMAIL',
  'EMAIL_PASSWORD'
];

function validateEnv() {
  const missing = [];
  const warnings = [];

  // Check required variables
  requiredEnvVars.forEach(varName => {
    if (!process.env[varName]) {
      missing.push(varName);
    }
  });

  if (missing.length > 0) {
    logger.error(`Missing required environment variables: ${missing.join(', ')}`);
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  // Check optional but important variables
  optionalEnvVars.forEach(varName => {
    if (!process.env[varName]) {
      warnings.push(varName);
    }
  });

  if (warnings.length > 0) {
    logger.warn(`Missing optional environment variables: ${warnings.join(', ')}`);
    logger.warn('Some features may not work without these variables');
  }

  // Validate JWT_SECRET strength
  if (process.env.JWT_SECRET.length < 32) {
    logger.warn('JWT_SECRET should be at least 32 characters for better security');
  }

  // Validate PORT
  const port = parseInt(process.env.PORT);
  if (isNaN(port) || port < 1 || port > 65535) {
    throw new Error('PORT must be a valid number between 1 and 65535');
  }

  logger.info('Environment variables validated successfully');
  return true;
}

module.exports = validateEnv;
