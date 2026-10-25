const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  num: { type: String },
  name: { type: String, required: true },
  category: { type: String, default: 'general' },
  categoryLabel: { type: String },
  categoryGroup: { type: String },
  priceVND: { type: Number, required: true },
  origin: { type: String },
  desc: { type: String },
  img: { type: String },
  nutrition: {
    kcal: { type: Number },
    protein: { type: String },
    fat: { type: String },
    special: { type: String }
  },
  tags: [{ type: String }],
  inStock: { type: Boolean, default: true }
}, {
  timestamps: true
});

module.exports = mongoose.model('Product', productSchema);
