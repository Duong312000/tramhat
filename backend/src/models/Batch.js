const mongoose = require('mongoose');

/**
 * BATCH MODEL - Quản lý Mẻ Nấu Tươi Thủ Công & Hạn Lưu Trữ Mát 48 Giờ
 * Chuẩn bảo quản: 2 - 5°C, Hạn dùng: Đúng 48 giờ kể từ thời điểm nấu xong
 */
const batchSchema = new mongoose.Schema({
  batchCode: { type: String, required: true, unique: true }, // e.g. #BATCH-20261107-01
  productName: { type: String, required: true }, // Tên dòng sữa hạt
  cookedAt: { type: Date, default: Date.now }, // Thời điểm nấu hoàn tất
  expiresAt: { type: Date, required: true }, // cookedAt + 48 hours
  initialQuantity: { type: Number, required: true }, // Số chai đã nấu
  dispatchedQuantity: { type: Number, default: 0 }, // Số chai đã xuất theo đơn
  temperatureCelsius: { type: Number, default: 3.5 }, // Nhiệt độ tủ bảo quản thực tế
  status: {
    type: String,
    enum: ['Active', 'Depleted', 'Expired'],
    default: 'Active'
  },
  cookStaff: { type: String, default: 'Trần Văn Bếp (Trưởng ca)' },
  notes: { type: String }
}, {
  timestamps: true
});

module.exports = mongoose.model('Batch', batchSchema);

