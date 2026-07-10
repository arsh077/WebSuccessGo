const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const controller = require('../controllers/paymentController');
const { validate, createPaymentSchema, verifyPaymentSchema } = require('../utils/validators');

// Webhook must be registered separately with raw body parser in server.js
// This route handles only the webhook endpoint
router.post('/webhook', express.raw({ type: 'application/json' }), controller.webhook);

// Protected payment routes
router.post('/create', auth, validate(createPaymentSchema), controller.createPayment);
router.post('/verify', auth, validate(verifyPaymentSchema), controller.verifyPayment);

module.exports = router;
