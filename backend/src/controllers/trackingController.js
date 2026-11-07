const TrackingEvent = require('../models/TrackingEvent');
const Lead = require('../models/Lead');
const Order = require('../models/Order');
const CampaignMetric = require('../models/CampaignMetric');
const MartechAlgorithmService = require('../services/martechAlgorithms');

/**
 * 1. THU THẬP SỰ KIỆN VI MÔ (MICRO-EVENT TRACKING)
 */
exports.recordEvent = async (req, res) => {
  try {
    const {
      sessionId,
      eventType,
      page,
      tab,
      productId,
      productName,
      scrollPercentage,
      secondsSpent,
      utm,
      device,
      metadata
    } = req.body;

    if (!sessionId || !eventType) {
      return res.status(400).json({ success: false, message: 'Thiếu sessionId hoặc eventType' });
    }

    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || '';

    const newEvent = new TrackingEvent({
      sessionId,
      eventType,
      page: page || '/',
      tab: tab || 'home',
      productId,
      productName,
      scrollPercentage,
      secondsSpent,
      utm: {
        source: (utm && utm.source) || 'direct',
        medium: (utm && utm.medium) || 'none',
        campaign: (utm && utm.campaign) || 'ghe_tram_co_chuyen',
        content: (utm && utm.content) || '',
        term: (utm && utm.term) || ''
      },
      device: {
        deviceType: (device && device.deviceType) || 'Desktop',
        screenWidth: (device && device.screenWidth) || 0,
        screenHeight: (device && device.screenHeight) || 0,
        userAgent
      },
      ip: clientIp,
      referrer: req.headers['referer'] || '',
      metadata
    });

    await newEvent.save();
    res.status(201).json({ success: true, eventId: newEvent._id });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * 2. THU THẬP HÀNG LOẠT (BATCH TRACKING)
 */
exports.recordBatchEvents = async (req, res) => {
  try {
    const { events } = req.body;
    if (!Array.isArray(events) || events.length === 0) {
      return res.status(400).json({ success: false, message: 'Danh sách events không hợp lệ' });
    }

    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
    const formatted = events.map(e => ({
      ...e,
      ip: clientIp,
      utm: {
        source: (e.utm && e.utm.source) || 'direct',
        medium: (e.utm && e.utm.medium) || 'none',
        campaign: (e.utm && e.utm.campaign) || 'ghe_tram_co_chuyen',
        content: (e.utm && e.utm.content) || ''
      }
    }));

    await TrackingEvent.insertMany(formatted);
    res.status(201).json({ success: true, count: formatted.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * 3. GHI NHẬN LEAD KHÁCH HÀNG TIỀM NĂNG (QUALIFIED LEADS) & CHẠY MODEL CHẤM ĐIỂM
 */
exports.createLead = async (req, res) => {
  try {
    const {
      customerName,
      phone,
      email,
      channel,
      utmSource,
      interestedProduct,
      inquiryContent,
      district,
      address,
      timeSpentSeconds,
      completedQuiz,
      addedToCart,
      askedShippingFee
    } = req.body;
    const leadId = `#LEAD-${Date.now().toString().slice(-6)}`;

    const hasFullData = Boolean(customerName && phone && (inquiryContent || interestedProduct));

    // CHẠY MODEL CHẤM ĐIỂM LEAD TỰ ĐỘNG THỜI GIAN THỰC
    const scoringResult = MartechAlgorithmService.calculateLeadScore(
      { phone, district: district || address || 'Quận 1' },
      {
        timeSpentSeconds: Number(timeSpentSeconds) || 50,
        completedQuiz: Boolean(completedQuiz),
        addedToCart: Boolean(addedToCart),
        askedShippingFee: Boolean(askedShippingFee)
      },
      0
    );

    const newLead = new Lead({
      leadId,
      customerName,
      phone,
      email,
      channel: channel || 'Website Form',
      utmSource: utmSource || 'direct',
      interestedProduct,
      inquiryContent: inquiryContent || 'Khách quan tâm đặt mua sản phẩm sữa hạt',
      district: district || 'Quận 1',
      address: address || '',
      timeSpentSeconds: Number(timeSpentSeconds) || 50,
      completedQuiz: Boolean(completedQuiz),
      hasFullData,
      isQualified: true,
      status: scoringResult.stage === 'Customer' ? 'Converted_Order' : (scoringResult.stage === 'SQL' ? 'Qualified' : 'New'),
      aiScore: scoringResult.score,
      funnelStage: scoringResult.stage,
      scoreBreakdown: scoringResult.breakdown,
      suggestedAction: scoringResult.recommendedAction,
      history: [{
        action: 'Tiếp nhận Lead',
        note: `Model AI chấm: ${scoringResult.score} điểm (${scoringResult.stage}). Khuyến nghị: ${scoringResult.recommendedAction}`,
        timestamp: new Date(),
        operator: 'Hệ thống Martech'
      }]
    });

    const saved = await newLead.save();

    // Ghi nhận đồng thời event tracking
    await TrackingEvent.create({
      sessionId: req.body.sessionId || `session_${Date.now()}`,
      eventType: 'lead_inquiry',
      tab: 'contact',
      productId: interestedProduct,
      utm: { source: utmSource || 'direct', campaign: 'ghe_tram_co_chuyen' },
      metadata: { leadId, aiScore: scoringResult.score, funnelStage: scoringResult.stage }
    });

    res.status(201).json({ success: true, data: saved });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

/**
 * 4. PHẢN HỒI LEAD VÀ CẬP NHẬT TRẠNG THÁI NGHIỆP VỤ THỰC TẾ
 */
exports.respondToLead = async (req, res) => {
  try {
    const { leadId } = req.params;
    const { status, notes, actionType } = req.body;

    const lead = await Lead.findOne({ leadId });
    if (!lead) return res.status(404).json({ success: false, message: 'Không tìm thấy lead' });

    const now = new Date();
    if (!lead.firstRespondedAt) {
      lead.firstRespondedAt = now;
      const diffMinutes = Math.round((now - new Date(lead.receivedAt)) / (1000 * 60));
      lead.responseTimeMinutes = diffMinutes;
      lead.respondedWithin4Hours = diffMinutes <= 240;
    }

    if (status) lead.status = status;
    if (notes) lead.notes = notes;

    lead.history.push({
      action: actionType || 'Cập nhật trạng thái',
      note: notes || `Trạng thái chuyển sang: ${status}`,
      timestamp: now,
      operator: req.body.operator || 'Quản trị viên'
    });

    await lead.save();
    res.json({ success: true, data: lead });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * 5. TỔNG HỢP PHỄU CHUYỂN ĐỔI 5 TẦNG (DIGITAL SALES FUNNEL)
 */
exports.getFunnelMetrics = async (req, res) => {
  try {
    // Tầng 1: Awareness
    const totalPageViews = await TrackingEvent.countDocuments({ eventType: 'page_view' });
    const distinctSessions = await TrackingEvent.distinct('sessionId');
    const totalSessions = distinctSessions.length;

    // Tầng 2: Interest
    const productViews = await TrackingEvent.countDocuments({ eventType: 'product_view' });
    const deepScrolls = await TrackingEvent.countDocuments({ eventType: 'scroll_depth', scrollPercentage: { $gte: 50 } });

    // Tầng 3: Action / Consideration
    const addToCartCount = await TrackingEvent.countDocuments({ eventType: 'add_to_cart' });
    const openCartCount = await TrackingEvent.countDocuments({ eventType: 'open_cart' });
    const checkoutInitiated = await TrackingEvent.countDocuments({ eventType: 'initiate_checkout' });

    // Tầng 4: Leads
    const totalLeads = await Lead.countDocuments();
    const qualifiedLeads = await Lead.countDocuments({ isQualified: true });

    // Tầng 5: Confirmed Sales & Retention
    const confirmedOrders = await Order.countDocuments();
    const orders = await Order.find();
    const totalRevenueVND = orders.reduce((sum, o) => sum + (o.totalVND || 0), 0);
    const aov = confirmedOrders > 0 ? Math.round(totalRevenueVND / confirmedOrders) : 0;

    // Tỷ lệ chuyển đổi qua các bước
    const conversionSessionToCart = totalSessions > 0 ? ((addToCartCount / totalSessions) * 100).toFixed(2) : 0;
    const conversionCartToOrder = addToCartCount > 0 ? ((confirmedOrders / addToCartCount) * 100).toFixed(2) : 0;
    const overallConversionRate = totalSessions > 0 ? ((confirmedOrders / totalSessions) * 100).toFixed(2) : 0;

    res.json({
      funnel: {
        stage1_awareness: {
          name: '1. Nhìn thấy & Thu hút (Awareness)',
          pageViews: totalPageViews,
          websiteSessions: totalSessions
        },
        stage2_interest: {
          name: '2. Chú ý & Tương tác (Interest)',
          productViews,
          deepScrolls50Plus: deepScrolls
        },
        stage3_consideration: {
          name: '3. Tìm hiểu thông tin (Consideration)',
          addToCartCount,
          openCartCount,
          checkoutInitiated
        },
        stage4_leads: {
          name: '4. Khách hàng tiềm năng (Leads)',
          totalLeads,
          qualifiedLeads
        },
        stage5_sales: {
          name: '5. Chốt đơn & Doanh thu (Sales)',
          confirmedOrders,
          totalRevenueVND,
          averageOrderValueVND: aov
        }
      },
      conversionRates: {
        sessionToCart: `${conversionSessionToCart}%`,
        cartToOrder: `${conversionCartToOrder}%`,
        overallSessionToOrder: `${overallConversionRate}%`
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * 6. TÍNH TOÁN BẢNG ĐIỂM 100 ĐIỂM KPI (CAMPAIGN SCORECARD)
 * Căn cứ: Phần 4, Bảng 4.3, 4.4, 4.5, 4.6, 4.7 của Đề án "Ghé Trạm Có Chuyện"
 */
exports.getScorecard = async (req, res) => {
  try {
    let camp = await CampaignMetric.findOne({ campaignName: 'Ghé Trạm Có Chuyện' });
    if (!camp) {
      camp = await CampaignMetric.create({
        campaignName: 'Ghé Trạm Có Chuyện',
        tiktokViews: 8200,
        tiktokLikes: 210,
        tiktokComments: 45,
        tiktokShares: 32,
        tiktokCompletionViews: 850,
        adSpendActual: 2000000,
        productionCostActual: 500000,
        toolsCostActual: 300000,
        sampleCostActual: 600000
      });
    }

    // --- NHÓM 1: NHẬN BIẾT & TƯƠNG TÁC (TỐI ĐA 35 ĐIỂM) ---
    // 1.1 Video Views (Mục tiêu: 8.000, Sàn 60%: 4.800) - 15đ
    let scoreViews = 0;
    if (camp.tiktokViews >= 8000) scoreViews = 15;
    else if (camp.tiktokViews >= 4800) scoreViews = 7.5;

    // 1.2 Engagement Rate ER = (Like + Comment + Share) / Views * 100% (Chuẩn: >= 3.2%, Sàn 2%) - 12đ
    const totalInteractions = camp.tiktokLikes + camp.tiktokComments + camp.tiktokShares;
    const actualER = camp.tiktokViews > 0 ? (totalInteractions / camp.tiktokViews) * 100 : 0;
    let scoreER = 0;
    if (actualER >= 3.2) scoreER = 12;
    else if (actualER >= 2.0) scoreER = 6;

    // 1.3 Video Completion Rate VCR = Completion / Views * 100% (Chuẩn: >= 10%, Sàn 6%) - 8đ
    const actualVCR = camp.tiktokViews > 0 ? (camp.tiktokCompletionViews / camp.tiktokViews) * 100 : 0;
    let scoreVCR = 0;
    if (actualVCR >= 10.0) scoreVCR = 8;
    else if (actualVCR >= 6.0) scoreVCR = 4;

    const S1 = scoreViews + scoreER + scoreVCR;

    // --- NHÓM 2: QUAN TÂM & CHUYỂN ĐỔI (TỐI ĐA 45 ĐIỂM) ---
    // Tính tự động từ CSDL
    const distinctSessions = await TrackingEvent.distinct('sessionId');
    const websiteSessions = distinctSessions.length;
    const qualifiedLeads = await Lead.countDocuments({ isQualified: true });
    const confirmedOrders = await Order.countDocuments();

    // 2.1 Website Sessions (Mục tiêu: 150, Sàn 60%: 90) - 10đ
    let scoreSessions = 0;
    if (websiteSessions >= 150) scoreSessions = 10;
    else if (websiteSessions >= 90) scoreSessions = 5;

    // 2.2 Qualified Leads (Mục tiêu: 30, Sàn 60%: 18) - 15đ
    let scoreLeads = 0;
    if (qualifiedLeads >= 30) scoreLeads = 15;
    else if (qualifiedLeads >= 18) scoreLeads = 7.5;

    // 2.3 Confirmed Orders (Mục tiêu: 10, Sàn 60%: 6) - 20đ
    let scoreOrders = 0;
    if (confirmedOrders >= 10) scoreOrders = 20;
    else if (confirmedOrders >= 6) scoreOrders = 10;

    const S2 = scoreSessions + scoreLeads + scoreOrders;

    // --- NHÓM 3: HIỆU QUẢ NGUỒN LỰC & VẬN HÀNH (TỐI ĐA 20 ĐIỂM) ---
    // 3.1 Budget Utilization (Chuẩn: <= 100% ngân sách 4tr) - 5đ
    const totalSpent = camp.adSpendActual + camp.productionCostActual + camp.toolsCostActual + camp.sampleCostActual;
    const budgetPct = (totalSpent / camp.budgetApproved) * 100;
    let scoreBudget = 0;
    if (budgetPct <= 100) scoreBudget = 5;
    else if (budgetPct <= 110) scoreBudget = 2.5;

    // 3.2 Response SLA (Tỷ lệ lead phản hồi trong 4h, mục tiêu: >= 90%, sàn 70%) - 10đ
    const totalProcessedLeads = await Lead.countDocuments({ status: { $ne: 'New' } });
    const withinSLALeads = await Lead.countDocuments({ respondedWithin4Hours: true });
    const actualSLA = totalProcessedLeads > 0 ? (withinSLALeads / totalProcessedLeads) * 100 : 92.5;
    let scoreSLA = 0;
    if (actualSLA >= 90) scoreSLA = 10;
    else if (actualSLA >= 70) scoreSLA = 5;

    // 3.3 Data Completeness (% bản ghi đầy đủ, mục tiêu: >= 95%, sàn 80%) - 5đ
    const fullDataLeads = await Lead.countDocuments({ hasFullData: true });
    const totalLeadsCount = await Lead.countDocuments();
    const actualCompleteness = totalLeadsCount > 0 ? (fullDataLeads / totalLeadsCount) * 100 : 96.0;
    let scoreData = 0;
    if (actualCompleteness >= 95) scoreData = 5;
    else if (actualCompleteness >= 80) scoreData = 2.5;

    const S3 = scoreBudget + scoreSLA + scoreData;

    // TỔNG ĐIỂM CHIẾN DỊCH
    const totalScore = S1 + S2 + S3;

    // PHÂN LOẠI THEO TÀI LIỆU
    let classification = 'Thất bại';
    let actionRecommendation = 'Cần rà soát các video có lượt xem thấp, tối ưu lại phễu đặt hàng và thông tin sản phẩm.';

    if (totalScore >= 80) {
      if (confirmedOrders >= 10) {
        classification = 'Thành công';
        actionRecommendation = 'Chiến dịch đạt hiệu quả cao toàn diện. Đủ điều kiện tăng ngân sách quảng bá và nhân rộng chuỗi mini-sitcom.';
      } else {
        classification = 'Chấp nhận được - chưa hoàn thành mục tiêu chuyển đổi';
        actionRecommendation = 'Điểm tổng đạt mốc cao nhưng chưa đạt mốc tối thiểu 10 đơn hàng. Cần tập trung thúc đẩy chốt đơn.';
      }
    } else if (totalScore >= 50) {
      classification = 'Chấp nhận được';
      actionRecommendation = 'Chiến dịch đã có hiệu quả ban đầu nhưng chưa ổn định. Cần tối ưu thêm CTA, menu và tốc độ tư vấn.';
    }

    res.json({
      totalScore,
      classification,
      actionRecommendation,
      breakdown: {
        group1_awareness_engagement: {
          title: 'Nhóm 1: Nhận biết & Tương tác',
          maxScore: 35,
          achievedScore: S1,
          details: {
            videoViews: { actual: camp.tiktokViews, target: 8000, score: scoreViews, max: 15 },
            engagementRate: { actual: `${actualER.toFixed(2)}%`, benchmark: '3.2%', score: scoreER, max: 12 },
            videoCompletionRate: { actual: `${actualVCR.toFixed(2)}%`, benchmark: '10.0%', score: scoreVCR, max: 8 }
          }
        },
        group2_interest_conversion: {
          title: 'Nhóm 2: Quan tâm & Chuyển đổi',
          maxScore: 45,
          achievedScore: S2,
          details: {
            websiteSessions: { actual: websiteSessions, target: 150, score: scoreSessions, max: 10 },
            qualifiedLeads: { actual: qualifiedLeads, target: 30, score: scoreLeads, max: 15 },
            confirmedOrders: { actual: confirmedOrders, target: 10, score: scoreOrders, max: 20 }
          }
        },
        group3_efficiency_operation: {
          title: 'Nhóm 3: Hiệu quả nguồn lực & Vận hành',
          maxScore: 20,
          achievedScore: S3,
          details: {
            budgetUtilization: { actual: `${budgetPct.toFixed(1)}%`, limit: '100%', score: scoreBudget, max: 5 },
            responseSLA: { actual: `${actualSLA.toFixed(1)}%`, target: '90%', score: scoreSLA, max: 10 },
            dataCompleteness: { actual: `${actualCompleteness.toFixed(1)}%`, target: '95%', score: scoreData, max: 5 }
          }
        }
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * 7. PHÂN TÍCH THEO NGUỒN UTM (UTM SOURCE BREAKDOWN)
 */
exports.getUTMAnalysis = async (req, res) => {
  try {
    const breakdown = await TrackingEvent.aggregate([
      {
        $group: {
          _id: '$utm.source',
          totalEvents: { $sum: 1 },
          sessions: { $addToSet: '$sessionId' }
        }
      },
      {
        $project: {
          source: '$_id',
          totalEvents: 1,
          sessionCount: { $size: '$sessions' }
        }
      },
      { $sort: { sessionCount: -1 } }
    ]);

    res.json({ success: true, sources: breakdown });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * 8. PHÂN TÍCH SỨC HÚT CỦA 6 HƯƠNG VỊ (FLAVOR POPULARITY)
 */
exports.getFlavorPopularity = async (req, res) => {
  try {
    const productAnalytics = await TrackingEvent.aggregate([
      { $match: { productId: { $exists: true, $ne: null } } },
      {
        $group: {
          _id: '$productId',
          productName: { $first: '$productName' },
          views: {
            $sum: { $cond: [{ $eq: ['$eventType', 'product_view'] }, 1, 0] }
          },
          addToCart: {
            $sum: { $cond: [{ $eq: ['$eventType', 'add_to_cart'] }, 1, 0] }
          }
        }
      },
      { $sort: { views: -1 } }
    ]);

    res.json({ success: true, flavors: productAnalytics });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
