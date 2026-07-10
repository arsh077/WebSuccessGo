const Razorpay = require('razorpay');

module.exports = function getRazorpay() {
  if (!process.env.RAZORPAY_KEY || !process.env.RAZORPAY_SECRET) {
    const error = new Error('Razorpay is not configured');
    error.status = 503;
    throw error;
  }
  return new Razorpay({ key_id: process.env.RAZORPAY_KEY, key_secret: process.env.RAZORPAY_SECRET });
};
