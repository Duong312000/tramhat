/**
 * TRẠM HẠT® - FRONTEND API & AUTOMATED MARKETING TRACKER SDK
 * Kết nối REST API Backend Server (Cổng 5000) & MongoDB Database Server
 * Tự động thu thập: UTM Parameters, Session ID, Page Views, Scroll Depth (25-100%),
 * Time-on-page, Click 6 vị sữa hạt, Phễu chuyển đổi 5 tầng và Bảng tính điểm KPI 100 điểm.
 */

(function () {
  const API_BASE_URL = window.TRAMHAT_API_URL || (
    window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
      ? (window.location.port === '5000' ? '/api' : 'http://localhost:5000/api')
      : '/api'
  );

  // --- 1. QUẢN LÝ SESSION & UTM PARAMETERS ---
  function getOrCreateSessionId() {
    let sId = sessionStorage.getItem('tramhat_session_id');
    if (!sId) {
      sId = 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      sessionStorage.setItem('tramhat_session_id', sId);
    }
    return sId;
  }

  function parseUTMParams() {
    const urlParams = new URLSearchParams(window.location.search);
    const utmKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];
    let utmData = {};

    let hasUrlUTM = false;
    utmKeys.forEach(key => {
      if (urlParams.has(key)) {
        utmData[key.replace('utm_', '')] = urlParams.get(key);
        hasUrlUTM = true;
      }
    });

    // Nếu trên URL có UTM -> Lưu vào sessionStorage
    if (hasUrlUTM) {
      sessionStorage.setItem('tramhat_utm', JSON.stringify(utmData));
    } else {
      // Nếu không có trên URL -> Lấy từ sessionStorage (khách đã duyệt qua nhiều trang)
      const cached = sessionStorage.getItem('tramhat_utm');
      if (cached) {
        try { utmData = JSON.parse(cached); } catch (e) {}
      }
    }

    return {
      source: utmData.source || 'direct',
      medium: utmData.medium || 'organic',
      campaign: utmData.campaign || 'ghe_tram_co_chuyen',
      content: utmData.content || '',
      term: utmData.term || ''
    };
  }

  const currentSessionId = getOrCreateSessionId();
  const currentUTM = parseUTMParams();

  function getDeviceInfo() {
    return {
      deviceType: window.innerWidth < 768 ? 'Mobile' : (window.innerWidth < 1024 ? 'Tablet' : 'Desktop'),
      screenWidth: window.innerWidth,
      screenHeight: window.innerHeight
    };
  }

  // --- 2. API CLIENT OBJECT ---
  const TramHatAPI = {
    sessionId: currentSessionId,
    utm: currentUTM,

    // Lấy toàn bộ dữ liệu từ Backend REST API (hoặc fallback)
    async getUnifiedData() {
      try {
        console.log(`[Frontend API] Đang kết nối Backend Server: ${API_BASE_URL}/all ...`);
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2500);

        const res = await fetch(`${API_BASE_URL}/all`, { signal: controller.signal });
        clearTimeout(timeoutId);

        if (res.ok) {
          const data = await res.json();
          console.log('[Frontend API] Đã tải dữ liệu thời gian thực từ Backend & MongoDB thành công!');
          return { source: 'backend_api', data };
        }
      } catch (err) {
        console.warn('[Frontend API] Chế độ dự phòng: Dùng dữ liệu cục bộ.');
      }

      // Fallback cục bộ
      try {
        const [prodRes, contentRes, analyticsRes, ordersRes, reviewsRes, usersRes, articlesRes] = await Promise.all([
          fetch('data/products.json?v=' + Date.now()).then(r => r.json()),
          fetch('data/content.json?v=' + Date.now()).then(r => r.json()),
          fetch('data/analytics.json?v=' + Date.now()).then(r => r.json()),
          fetch('data/orders.json?v=' + Date.now()).then(r => r.json()),
          fetch('data/reviews.json?v=' + Date.now()).then(r => r.json()),
          fetch('data/users.json?v=' + Date.now()).then(r => r.json()),
          fetch('data/articles.json?v=' + Date.now()).then(r => r.json())
        ]);

        return {
          source: 'local_json',
          data: {
            products: prodRes,
            content: contentRes,
            analytics: analyticsRes,
            orders: ordersRes,
            reviews: reviewsRes,
            users: usersRes,
            articles: articlesRes
          }
        };
      } catch (localErr) {
        return { source: 'bundled_fallback', data: window.TRAMHAT_DATA || {} };
      }
    },

    // Gửi sự kiện vi mô lên Database Server (Tracking Engine)
    async sendEvent(eventType, extraData = {}) {
      try {
        // TUYỆT ĐỐI LOẠI TRỪ ADMIN: Khi đăng nhập Admin sẽ không thu thập bất kỳ dữ liệu nào
        if (
          sessionStorage.getItem('tramhat_admin_auth') === 'true' ||
          localStorage.getItem('tramhat_admin_auth') === 'true' ||
          sessionStorage.getItem('tramhat_is_admin') === 'true' ||
          (window.currentUser && window.currentUser.role === 'admin') ||
          window.location.hash === '#admin'
        ) {
          return;
        }

        const payload = {
          sessionId: currentSessionId,
          eventType,
          page: window.location.pathname,
          utm: currentUTM,
          device: getDeviceInfo(),
          ...extraData
        };

        // Gửi ngầm không làm chậm giao diện
        fetch(`${API_BASE_URL}/tracking/event`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          keepalive: true
        }).catch(() => {});
      } catch (e) {}
    },

    // Ghi nhận khi khách xem chi tiết 1 trong 6 hương vị
    trackProductView(productId, productName) {
      this.sendEvent('product_view', { productId, productName, tab: 'product-detail' });
    },

    // Ghi nhận khi thêm vào giỏ hàng
    trackAddToCart(productId, productName, quantity = 1) {
      this.sendEvent('add_to_cart', { productId, productName, metadata: { quantity } });
    },

    // Ghi nhận khi mở giỏ hàng
    trackOpenCart() {
      this.sendEvent('open_cart');
    },

    recordCheckoutStart() {
      this.sendEvent('initiate_checkout');
    },

    // Gửi Quiz Khẩu Vị 30s
    async submitQuiz(quizData) {
      try {
        const payload = {
          sessionId: currentSessionId,
          utm: currentUTM,
          ...quizData
        };
        const res = await fetch(`${API_BASE_URL}/quiz/submit`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        this.sendEvent('quiz_completed', { recommendation: data.recommendation?.name });
        return data;
      } catch (err) {
        console.warn('[Quiz API Fallback]', err);
        return {
          success: true,
          recommendation: { name: 'Sữa Điều Tự Nhiên', priceVND: 35000, img: 'images/prod_real_dieu.jpg' },
          reason: 'Lựa chọn cân bằng, êm bụng tuyệt đối cho ngày làm việc.',
          coupon: 'TRAMHAT15K'
        };
      }
    },

    // Lấy danh sách Mẻ sữa 48h
    async getBatches() {
      try {
        const res = await fetch(`${API_BASE_URL}/kitchen/batches`);
        return await res.json();
      } catch (e) {
        return [];
      }
    },

    // Ghi nhận khi bắt đầu bấm nút Đặt Hàng (Checkout)
    trackInitiateCheckout(cartTotalVND) {
      this.sendEvent('initiate_checkout', { metadata: { cartTotalVND } });
    },

    // Tạo đơn hàng mới (Lưu trực tiếp vào MongoDB kèm UTM tags)
    async createOrder(order) {
      try {
        const orderPayload = {
          ...order,
          sessionId: currentSessionId,
          utm: currentUTM,
          channel: 'Website Trạm Hạt'
        };

        const res = await fetch(`${API_BASE_URL}/orders`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(orderPayload)
        });

        const data = await res.json();
        // Ghi nhận đồng thời event purchase
        this.sendEvent('purchase', {
          metadata: { orderId: orderPayload.id, totalVND: orderPayload.totalVND }
        });
        return data;
      } catch (err) {
        console.warn('[Frontend API Lỗi createOrder]:', err);
        return { success: false, offline: true, data: order };
      }
    },

    // Gửi Lead (Khách cần tư vấn/hỏi mua qua form hoặc chat)
    async submitLead(leadData) {
      try {
        const payload = {
          sessionId: currentSessionId,
          utmSource: currentUTM.source,
          utmCampaign: currentUTM.campaign,
          ...leadData
        };

        const res = await fetch(`${API_BASE_URL}/leads`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        return await res.json();
      } catch (err) {
        return { success: false, message: 'Lỗi gửi yêu cầu' };
      }
    },

    // Đăng nhập tài khoản & nhận mã phiên (Session Token)
    async login(emailOrPhone, password, rememberMe = true) {
      try {
        const res = await fetch(`${API_BASE_URL}/users/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ emailOrPhone, password, rememberMe })
        });
        return await res.json();
      } catch (err) {
        return { success: false, message: 'Không thể kết nối đến máy chủ.' };
      }
    },

    // Kiểm tra tính hợp lệ của phiên trên máy chủ
    async validateSession(token) {
      try {
        const res = await fetch(`${API_BASE_URL}/users/validate-session`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        return await res.json();
      } catch (err) {
        return { success: false, offline: true };
      }
    },

    // Lấy Phễu Chuyển Đổi 5 Tầng (Digital Sales Funnel)
    async getFunnelMetrics() {
      try {
        const res = await fetch(`${API_BASE_URL}/analytics/funnel`);
        return await res.json();
      } catch (e) {
        return null;
      }
    },

    // Lấy Bảng Điểm 100 Điểm KPI (Campaign Scorecard)
    async getScorecard() {
      try {
        const res = await fetch(`${API_BASE_URL}/analytics/scorecard`);
        return await res.json();
      } catch (e) {
        return null;
      }
    }
  };

  // --- 3. TỰ ĐỘNG THU THẬP SỰ KIỆN KHI NGƯỜI DÙNG DUYỆT WEB ---
  window.addEventListener('DOMContentLoaded', () => {
    function isAdminActive() {
      try {
        return (
          sessionStorage.getItem('tramhat_admin_auth') === 'true' ||
          localStorage.getItem('tramhat_admin_auth') === 'true' ||
          sessionStorage.getItem('tramhat_is_admin') === 'true' ||
          (window.currentUser && window.currentUser.role === 'admin') ||
          window.location.hash === '#admin'
        );
      } catch(e) { return false; }
    }

    if (isAdminActive()) return; // Tuyệt đối KHÔNG tự động thu thập sự kiện nếu là Admin

    // 3.1 Ghi nhận Page View ngay khi vào trang
    TramHatAPI.sendEvent('page_view', { tab: 'home' });

    // 3.2 Tự động theo dõi Scroll Depth (25%, 50%, 75%, 100%)
    const scrollMilestones = { 25: false, 50: false, 75: false, 100: false };
    window.addEventListener('scroll', () => {
      if (isAdminActive()) return;
      const h = document.documentElement,
            b = document.body,
            st = 'scrollTop',
            sh = 'scrollHeight';
      const percent = Math.round(((h[st] || b[st]) / ((h[sh] || b[sh]) - h.clientHeight)) * 100);

      [25, 50, 75, 100].forEach(mark => {
        if (percent >= mark && !scrollMilestones[mark]) {
          scrollMilestones[mark] = true;
          TramHatAPI.sendEvent('scroll_depth', { scrollPercentage: mark });
        }
      });
    }, { passive: true });

    // 3.3 Tự động đo thời gian người dùng ở lại trang (Time on page)
    let secondsSpent = 0;
    setInterval(() => {
      if (isAdminActive()) return;
      secondsSpent += 15;
      if (secondsSpent === 30 || secondsSpent === 60 || secondsSpent === 180) {
        TramHatAPI.sendEvent('time_spent', { secondsSpent });
      }
    }, 15000);

    // 3.4 Bắt sự kiện khi click vào nút Chat Messenger
    document.querySelectorAll('a[href*="m.me"]').forEach(el => {
      el.addEventListener('click', () => {
        if (isAdminActive()) return;
        TramHatAPI.sendEvent('inbox_click', { metadata: { href: el.href } });
      });
    });
  });

  window.TramHatAPI = TramHatAPI;
  window.TramHatTracker = window.TramHatTracker || TramHatAPI;
})();
