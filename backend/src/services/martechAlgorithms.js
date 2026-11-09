/**
 * THƯ MỤC DỊCH VỤ THUẬT TOÁN MARTECH & SALES CHUYỂN ĐỔI (CHƯƠNG 6)
 * Dự án: Trạm Hạt - Sữa hạt tươi thủ công (Accessible Premium)
 */

class MartechAlgorithmService {
  
  /**
   * THUẬT TOÁN 1: CHẤM ĐIỂM TIỀM NĂNG (WEIGHTED LEAD SCORING WITH TIME-DECAY)
   * Công thức: Total_Score = Tương tác + Quiz + Địa lý + Ý định - Suy giảm thời gian
   */
  static calculateLeadScore(userProfile = {}, activityEvents = {}, hoursSinceLastActive = 0) {
    let score = 0;
    const breakdown = {
      timeScore: 0,
      quizScore: 0,
      geoScore: 0,
      intentScore: 0,
      decayPenalty: 0
    };

    // 1. Điểm tương tác vi mô (Tối đa 15 điểm)
    const timeSpent = activityEvents.timeSpentSeconds || 0;
    const scrollDepth = activityEvents.scrollPercentage || 0;
    if (timeSpent >= 45) {
      score += 10;
      breakdown.timeScore += 10;
    }
    if (scrollDepth >= 70) {
      score += 5;
      breakdown.timeScore += 5;
    }

    // 2. Điểm hoàn thành Quiz khẩu vị (Tối đa 25 điểm)
    if (activityEvents.completedQuiz) {
      score += 25;
      breakdown.quizScore = 25;
    }

    // 3. Điểm định danh & vị trí địa lý nội thành TP.HCM (Tối đa 30 điểm)
    const district = (userProfile.district || '').toLowerCase();
    const validCentralDistricts = ['quận 1', 'q1', 'quận 3', 'q3', 'quận 4', 'quận 7', 'quận 10', 'bình thạnh', 'phú nhuận'];
    const isCentralHCM = validCentralDistricts.some(d => district.includes(d));

    if (userProfile.phone) {
      score += 15;
      breakdown.geoScore += 15;
    }
    if (isCentralHCM) {
      score += 15;
      breakdown.geoScore += 15;
    }

    // 4. Điểm bộc lộ ý định giao dịch (Tối đa 30 điểm)
    if (activityEvents.addedToCart) {
      score += 15;
      breakdown.intentScore += 15;
    }
    if (activityEvents.askedShippingFee) {
      score += 15;
      breakdown.intentScore += 15;
    }

    // 5. Hàm suy giảm thời gian (Time-decay factor)
    // Nếu quá 24h không tương tác, mỗi 12h tiếp theo giảm 5 điểm (tránh lưu trữ lead nguội)
    if (hoursSinceLastActive > 24) {
      const decayUnits = Math.floor((hoursSinceLastActive - 24) / 12);
      const penalty = decayUnits * 5;
      score = Math.max(0, score - penalty);
      breakdown.decayPenalty = penalty;
    }

    // Phân loại tầng phễu
    let stage = 'Visitor';
    let recommendedAction = 'Tiếp tục phân phối video ngắn phong cách sống; chưa mời chào trực tiếp.';

    if (score >= 90) {
      stage = 'Customer';
      recommendedAction = 'Gửi thiệp điện tử dặn trữ tủ mát 2-5°C và tích lũy điểm Trạm Xanh.';
    } else if (score >= 60) {
      stage = 'SQL';
      recommendedAction = 'Kích hoạt mã Freeship đơn đầu + Gửi link thanh toán VietQR Pro.';
    } else if (score >= 30) {
      stage = 'MQL';
      recommendedAction = 'AI Chatbot gửi menu điện tử tương tác và gợi ý 2 vị đối trọng.';
    }

    return {
      score: Math.min(100, Math.max(0, score)),
      stage,
      isHotLead: score >= 60,
      recommendedAction,
      breakdown
    };
  }

  /**
   * THUẬT TOÁN 2: ĐỘNG CƠ GỢI Ý NGỮ CẢNH & TĂNG GIÁ TRỊ GIỎ HÀNG (CONTEXTUAL & BASKET UPSELL)
   */
  static getContextualRecommendation(currentHour, currentCartItems = [], userTastePreference = '') {
    // 1. Phân tích khung giờ
    let recommendedFlavor = '';
    let rationale = '';

    if (currentHour >= 6 && currentHour <= 10) {
      // Giờ sáng: Cần năng lượng no lâu thay bữa sáng nhanh
      recommendedFlavor = 'Sữa Điều Rang Mộc (29.000đ) hoặc Sữa Macca Yến Mạch (35.000đ)';
      rationale = 'Khung giờ sáng: Ưu tiên dòng sữa giàu tinh bột phức và protein lành mạnh giúp no lâu, tập trung làm việc.';
    } else if (currentHour >= 13 && currentHour <= 16) {
      // Giờ chiều: Cần giải tỏa căng thẳng và thanh nhiệt xế chiều
      recommendedFlavor = 'Sữa Hạnh Nhân Cacao Đắk Lắk (39.000đ) hoặc Sữa Điều Sen Tuyết (35.000đ)';
      rationale = 'Khung giờ xế chiều: Cacao nguyên chất kích thích giải phóng Endorphin chống mệt mỏi, hạt sen thanh mát nhẹ bụng.';
    } else {
      recommendedFlavor = 'Sữa Hạt Điều Sen Tuyết (35.000đ)';
      rationale = 'Thức uống nhẹ bụng, dễ tiêu hóa cho buổi tối thư giãn.';
    }

    // 2. Phân tích ngưỡng giỏ hàng (Basket Threshold Upsell)
    // Mục tiêu nâng AOV từ 35k lên 105k (tương đương đơn 3 chai để gom đơn văn phòng)
    const cartCount = currentCartItems.length;
    let upsellTrigger = null;

    if (cartCount === 1) {
      upsellTrigger = {
        message: 'Thêm 2 chai nữa để cả bàn cùng uống và được nhận ngay ưu đãi MIỄN PHÍ GIAO HÀNG tận sảnh!',
        discountTarget: 'Combo Bàn làm việc gắn kết'
      };
    } else if (cartCount === 2) {
      upsellTrigger = {
        message: 'Chỉ còn thiếu đúng 01 chai để kích hoạt Freeship bán kính 5km!',
        discountTarget: 'Freeship Threshold'
      };
    } else if (cartCount >= 3) {
      upsellTrigger = {
        message: 'Đơn hàng đã đủ điều kiện Freeship! Đã kích hoạt mã quà tặng Trạm Xanh.',
        discountTarget: 'Eligible for Freeship'
      };
    }

    return {
      recommendedFlavor,
      rationale,
      upsellTrigger
    };
  }

  /**
   * THUẬT TOÁN 3: ĐỊNH TUYẾN GIAO LẠNH NỘI THÀNH (GEOFENCING FRESH DELIVERY)
   */
  static checkFreshDeliveryEligibility(addressString, districtString) {
    const combined = `${addressString || ''} ${districtString || ''}`.toLowerCase();
    
    // Các quận nội thành TP.HCM nằm trong bán kính giao đá gel 1-2h
    const centralDistricts = [
      'quận 1', 'q.1', 'q1',
      'quận 3', 'q.3', 'q3',
      'quận 4', 'q.4', 'q4',
      'quận 7', 'q.7', 'q7',
      'quận 10', 'q.10', 'q10',
      'bình thạnh', 'phú nhuận'
    ];

    const isEligible = centralDistricts.some(d => combined.includes(d));

    if (isEligible) {
      return {
        eligible: true,
        estimatedDeliveryTime: '45 - 90 phút',
        packaging: 'Túi giữ nhiệt chuyên dụng kèm đá gel sinh học (2-5°C)',
        shippingFee: '20.000đ (Áp dụng mã FREESHIP đơn đầu 0đ)',
        message: 'Địa chỉ của bạn thuộc vùng giao lạnh tức thì trong ngày của Trạm Hạt!'
      };
    } else {
      return {
        eligible: false,
        estimatedDeliveryTime: 'Giao mẻ sáng hôm sau (8h00 - 9h00)',
        packaging: 'Thùng xốp bảo ôn đá gel kín khí',
        shippingFee: 'Theo biểu phí đối tác vận chuyển AhaMove/Grab',
        message: 'Địa chỉ ngoài bán kính giao lạnh tức thì. Trạm Hạt sẽ chuẩn bị mẻ nấu tươi sáng mai để giao đến bạn.'
      };
    }
  }

  /**
   * THUẬT TOÁN 4: MÁY TRẠNG THÁI PHỄU BÁN HÀNG (FUNNEL STATE-MACHINE TRANSITION)
   */
  static getNextFunnelState(currentState, eventType, data = {}) {
    switch (currentState) {
      case 'Visitor':
        if (eventType === 'quiz_completed' || eventType === 'view_catalog_deep') {
          return { nextState: 'MQL', triggerAlert: false };
        }
        return { nextState: 'Visitor', triggerAlert: false };

      case 'MQL':
        if (eventType === 'submit_phone' && data.districtEligible) {
          return { nextState: 'SQL', triggerAlert: true, alertType: 'PUSH_FREESHIP_CODE' };
        }
        return { nextState: 'MQL', triggerAlert: false };

      case 'SQL':
        if (eventType === 'payment_success' || eventType === 'order_confirmed') {
          return { nextState: 'Customer', triggerAlert: true, alertType: 'DISPATCH_TO_KITCHEN' };
        }
        return { nextState: 'SQL', triggerAlert: false };

      default:
        return { nextState: currentState, triggerAlert: false };
    }
  }
}

module.exports = MartechAlgorithmService;

