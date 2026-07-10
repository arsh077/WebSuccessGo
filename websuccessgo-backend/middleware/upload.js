const multer = require('multer');
const path = require('path');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');
const logger = require('../utils/logger');

// Allowed file extensions and MIME types
const allowedExtensions = /jpeg|jpg|png|pdf|webp|doc|docx/;
const allowedMimeTypes = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];

// File filter function with security checks
const fileFilter = (req, file, cb) => {
  // Check file extension
  const extname = path.extname(file.originalname).toLowerCase();
  const isExtensionValid = allowedExtensions.test(extname);

  // Check MIME type
  const isMimeValid = allowedMimeTypes.includes(file.mimetype);

  if (isExtensionValid && isMimeValid) {
    return cb(null, true);
  } else {
    logger.warn(`File upload rejected: ${file.originalname} (${file.mimetype})`);
    cb(new Error(`File type not allowed. Allowed types: ${allowedExtensions}`));
  }
};

// Storage configuration
let storage;

if (process.env.CLOUD_NAME && process.env.CLOUD_KEY && process.env.CLOUD_SECRET) {
  // Use Cloudinary storage if configured
  storage = new CloudinaryStorage({
    cloudinary,
    params: {
      folder: 'websuccessgo',
      allowed_formats: ['jpg', 'jpeg', 'png', 'pdf', 'webp'],
      resource_type: 'auto',
      // Generate unique filename
      public_id: (req, file) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        return `file-${uniqueSuffix}`;
      }
    }
  });
  logger.info('Using Cloudinary storage for file uploads');
} else {
  // Use local disk storage as fallback
  storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
      // Sanitize filename - remove special characters and spaces
      const sanitizedName = file.originalname
        .replace(/\s+/g, '-')
        .replace(/[^a-zA-Z0-9.-]/g, '');
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, `${uniqueSuffix}-${sanitizedName}`);
    }
  });
  logger.info('Using local disk storage for file uploads');
}

// Configure multer
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max file size
    files: 5 // Maximum 5 files per request
  }
});

// Error handling middleware for multer errors
upload.errorHandler = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    logger.error('Multer error:', err);

    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File size exceeds 10MB limit' });
    }

    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ message: 'Maximum 5 files allowed per request' });
    }

    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({ message: 'Unexpected file field' });
    }

    return res.status(400).json({ message: err.message });
  }

  if (err) {
    logger.error('File upload error:', err);
    return res.status(400).json({ message: err.message });
  }

  next();
};

module.exports = upload;
