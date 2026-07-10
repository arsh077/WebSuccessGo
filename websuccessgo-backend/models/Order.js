const mongoose = require('mongoose');

const TimelineSchema = new mongoose.Schema({
  title: String, description: String,
  status: { type: String, default: 'completed' },
  date: { type: Date, default: Date.now },
}, { _id: false });

const OrderSchema = new mongoose.Schema({
  orderNumber: { type: String, unique: true, required: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  template: { type: mongoose.Schema.Types.ObjectId, ref: 'Template', required: true },
  package: { type: String, required: true },
  amount: { type: Number, required: true, min: 0 },
  advancePaid: { type: Number, default: 0, min: 0 },
  paymentStatus: { type: String, enum: ['Pending', 'Partial Paid', 'Paid', 'Refunded'], default: 'Pending' },
  projectStatus: { type: String, default: 'Order Received' },
  details: { type: mongoose.Schema.Types.Mixed, default: {} },
  timeline: [TimelineSchema], files: [String], invoice: String,
  assignedDeveloper: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  razorpayOrderId: String, razorpayPaymentId: String,
}, { timestamps: true });

module.exports = mongoose.model('Order', OrderSchema);
