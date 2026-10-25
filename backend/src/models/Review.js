const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  role: { type: String },
  avatar: { type: String, default: 'TH' },
  stars: { type: Number, default: 5 },
  date: { type: String },
  tag: { type: String },
  comment: { type: String, required: true }
}, {
  timestamps: true
});

module.exports = mongoose.model('Review', reviewSchema);
