const mongoose = require('mongoose');

/**
 * TRACKING EVENT MODEL - Thu thập chi tiết từng hành vi vi mô của người dùng
 * Đáp ứng yêu cầu đo lường Digital Sales Funnel và UTM Tracking theo tài liệu đề án
 */
const trackingEventSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, index: true },
  eventType: {
    type: String,
    required: true,
    enum: [
      'page_view',          // Xem trang
      'product_view',       // Xem chi tiết 1 trong 6 vị
      'scroll_depth',       // Độ sâu cuộn trang (25%, 50%, 75%, 100%)
      'time_spent',         // Thời gian dừng lại trên trang
      'add_to_cart',        // Thêm vào giỏ hàng
      'open_cart',          // Mở giỏ hàng
      'initiate_checkout',  // Bắt đầu bấm nút đặt hàng
      'lead_inquiry',       // Khách gửi câu hỏi/tư vấn
      'inbox_click',        // Bấm nút chuyển sang chat Messenger/Zalo
      'outbound_click',     // Nhấp vào liên kết ngoài (TikTok/Instagram)
      'purchase'            // Đặt hàng thành công
    ],
    index: true
  },
  page: { type: String, default: '/' },
  tab: { type: String }, // home, menu, about, campaign, knowledge, reviews, profile
  productId: { type: String }, // cashew, walnut, almond, macca, lotus, redbean
  productName: { type: String },
  scrollPercentage: { type: Number }, // 25, 50, 75, 100
  secondsSpent: { type: Number }, // Số giây đã ở lại trang
  
  // UTM Tracking - Nhận diện chính xác chiến dịch "Ghé Trạm Có Chuyện"
  utm: {
    source: { type: String, default: 'direct', index: true },     // tiktok, facebook, instagram, zalo
    medium: { type: String, default: 'none' },                     // organic_social, cpc, referral
    campaign: { type: String, default: 'ghe_tram_co_chuyen' },    // Tên chiến dịch
    content: { type: String },                                     // video_01, video_02, menu_post
    term: { type: String }
  },

  // Dữ liệu thiết bị & kỹ thuật
  device: {
    deviceType: { type: String, enum: ['Mobile', 'Tablet', 'Desktop'], default: 'Desktop' },
    screenWidth: { type: Number },
    screenHeight: { type: Number },
    userAgent: { type: String }
  },
  ip: { type: String },
  referrer: { type: String },
  metadata: { type: mongoose.Schema.Types.Mixed }
}, {
  timestamps: true
});

// Chỉ mục hỗ trợ truy vấn thống kê tốc độ cao
trackingEventSchema.index({ eventType: 1, createdAt: -1 });
trackingEventSchema.index({ 'utm.source': 1, createdAt: -1 });
trackingEventSchema.index({ productId: 1 });

module.exports = mongoose.model('TrackingEvent', trackingEventSchema);
