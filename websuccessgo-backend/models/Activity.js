const mongoose = require('mongoose');
module.exports = mongoose.model('Activity', new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  action: { type: String, required: true },
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
}, { timestamps: true }));
