const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone: { type: String, trim: true },
  password: { type: String, required: true, select: false },
  role: { type: String, enum: ['admin', 'manager', 'developer', 'customer'], default: 'customer' },
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
