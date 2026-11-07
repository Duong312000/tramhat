const mongoose = require('mongoose');

/**
 * LEAD MODEL - Quản lý Khách Hàng Tiềm Năng (Tầng 4 Phễu Chuyển Đổi)
 * Phục vụ đo lường Qualified Leads, Response SLA và Data Completeness
 */
const leadSchema = new mongoose.Schema({
  leadId: { type: String, required: true, unique: true },
  customerName: { type: String, required: true },
  phone: { type: String, index: true },
  email: { type: String },
  channel: {
    type: String,
    enum: ['Website Form', 'Messenger', 'Zalo Chat', 'TikTok Inbox', 'Instagram DM', 'Hotline'],
    default: 'Website Form'
  },
  utmSource: { type: String, default: 'direct' },
  utmCampaign: { type: String, default: 'ghe_tram_co_chuyen' },
  interestedProduct: { type: String }, // Hương vị quan tâm
  inquiryContent: { type: String, required: true }, // Nội dung hỏi giá/thành phần/giao hàng
  
  // Phân loại Lead
  isQualified: { type: Boolean, default: true }, // Có phải lượt hỏi mua hợp lệ không
  status: {
    type: String,
    enum: ['New', 'Contacted', 'Qualified', 'Converted_Order', 'Lost'],
    default: 'New'
  },

  // THUẬT TOÁN MARTECH & AI SCORING (CHƯƠNG 6)
  aiScore: { type: Number, default: 50 },
  funnelStage: {
    type: String,
    enum: ['Visitor', 'MQL', 'SQL', 'Customer'],
    default: 'MQL'
  },
  scoreBreakdown: {
    timeScore: { type: Number, default: 0 },
    quizScore: { type: Number, default: 0 },
    geoScore: { type: Number, default: 0 },
    intentScore: { type: Number, default: 0 },
    decayPenalty: { type: Number, default: 0 }
  },
  suggestedAction: { type: String },
  district: { type: String },
  address: { type: String },
  timeSpentSeconds: { type: Number, default: 0 },
  completedQuiz: { type: Boolean, default: false },
  history: [{
    action: { type: String },
    timestamp: { type: Date, default: Date.now },
    note: { type: String },
    operator: { type: String, default: 'Hệ thống Martech' }
  }],
  
  // Chỉ số Response SLA (Thời gian phản hồi)
  receivedAt: { type: Date, default: Date.now },
  firstRespondedAt: { type: Date },
  responseTimeMinutes: { type: Number },
  respondedWithin4Hours: { type: Boolean, default: false },

  // Chỉ số Data Completeness (Độ đầy đủ dữ liệu)
  hasFullData: { type: Boolean, default: false }, // Có đủ Tên, SĐT, Kênh, Nội dung hỏi

  notes: { type: String },
  convertedOrderId: { type: String }
}, {
  timestamps: true
});

module.exports = mongoose.model('Lead', leadSchema);
