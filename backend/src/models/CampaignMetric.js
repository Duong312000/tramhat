const mongoose = require('mongoose');

/**
 * CAMPAIGN METRIC MODEL - Quản lý chỉ số tổng hợp chiến dịch "Ghé Trạm Có Chuyện"
 * Dùng để tính toán thang điểm 100 điểm KPI và hiệu quả tài chính (CPM, CPC, CPL, CPS, ROAS)
 */
const campaignMetricSchema = new mongoose.Schema({
  campaignName: { type: String, default: 'Ghé Trạm Có Chuyện', unique: true },
  durationWeeks: { type: Number, default: 8 },
  
  // Tài chính & Ngân sách
  budgetApproved: { type: Number, default: 4000000 }, // Ngân sách phê duyệt: 4 triệu VNĐ
  adSpendActual: { type: Number, default: 0 },         // Chi phí quảng cáo thực tế
  productionCostActual: { type: Number, default: 0 },  // Chi phí sản xuất/đạo cụ
  toolsCostActual: { type: Number, default: 0 },       // Chi phí công cụ/phần mềm
  sampleCostActual: { type: Number, default: 0 },      // Chi phí mẫu thử nghiệm
  
  // Số liệu TikTok & Mạng xã hội (Nhóm 1 KPI: 35 điểm)
  tiktokVideoCount: { type: Number, default: 16 },
  tiktokViews: { type: Number, default: 0 },          // Mục tiêu: 8.000
  tiktokLikes: { type: Number, default: 0 },
  tiktokComments: { type: Number, default: 0 },
  tiktokShares: { type: Number, default: 0 },
  tiktokCompletionViews: { type: Number, default: 0 }, // Số lượt xem 100% video

  // Meta Ads / Instagram Metrics
  metaImpressions: { type: Number, default: 0 },
  metaReach: { type: Number, default: 0 },
  metaClicks: { type: Number, default: 0 },

  // Cấu hình benchmark ngành
  benchmarkER: { type: Number, default: 3.2 }, // 3.2%
  benchmarkVCR: { type: Number, default: 10.0 } // 10.0%
}, {
  timestamps: true
});

module.exports = mongoose.model('CampaignMetric', campaignMetricSchema);
