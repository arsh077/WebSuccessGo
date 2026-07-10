const mongoose = require('mongoose');

const TemplateSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  category: { type: String, required: true, trim: true },
  image: String,
  demoLink: String,
  price: { type: Number, required: true, min: 0 },
  features: [String],
}, { timestamps: true });

module.exports = mongoose.model('Template', TemplateSchema);
