const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
  key: { type: String, default: 'current_metrics', unique: true },
  totalVisits: { type: Number, default: 0 },
  totalTimeSeconds: { type: Number, default: 0 },
  productViews: { type: Number, default: 0 },
  addToCartCount: { type: Number, default: 0 },
  checkoutCount: { type: Number, default: 0 },
  purchasesCount: { type: Number, default: 0 },
  revenueVND: { type: Number, default: 0 },
  pageViews: { type: mongoose.Schema.Types.Mixed, default: {} },
  scrollDepth: { type: mongoose.Schema.Types.Mixed, default: {} },
  devices: { type: mongoose.Schema.Types.Mixed, default: {} },
  events: [{ type: mongoose.Schema.Types.Mixed }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Analytics', analyticsSchema);
