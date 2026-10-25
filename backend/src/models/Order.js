const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  customer: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  items: { type: String, required: true },
  total: { type: String },
  totalVND: { type: Number, required: true },
  payment: { type: String, default: 'Chuyển Khoản VietQR' },
  time: { type: String },
  status: { type: String, default: 'Đang Xử Lý' },
  
  // Dữ liệu đo lường chiến dịch và nguồn đơn hàng
  sessionId: { type: String },
  utm: {
    source: { type: String, default: 'direct' },
    medium: { type: String, default: 'none' },
    campaign: { type: String, default: 'ghe_tram_co_chuyen' },
    content: { type: String }
  },
  channel: { type: String, default: 'Website' },
  ip: { type: String }
}, {
  timestamps: true
});

module.exports = mongoose.model('Order', orderSchema);
