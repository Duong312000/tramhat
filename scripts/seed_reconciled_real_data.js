const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);
const fs = require('fs');
const path = require('path');
const mongoose = require('../node_modules/mongoose');

const uri = 'mongodb+srv://tramhat:tramhat123@cluster0.wozls21.mongodb.net/tramhat_db?retryWrites=true&w=majority';

/**
 * BỘ DỮ LIỆU ĐỐI SOÁT 100% VỚI ẢNH THỰC TẾ (THAMKHAO) & MỤC 7.2.4 (GA4 STANDARD)
 * - Users: 118 người dùng phân biệt (userId: usr_1001 -> usr_1118)
 * - Sessions: 144 phiên truy cập (1.22 phiên/người, 26 phiên quay lại = 18.1%)
 * - Nguồn truy cập (GA4 Default Channel Group):
 *   1. Organic Social: 84 phiên (58.3%) | 70 users | 66 engaged | 10 leads | 7 đơn (525.000đ)
 *      + TikTok (?utm_source=tiktok): 52 phiên (từ 107 profile views) | 44 users | 6 leads | 4 đơn (315.000đ)
 *      + Facebook (?utm_source=facebook): 18 phiên (từ 40 page visits) | 15 users | 3 leads | 2 đơn (140.000đ)
 *      + Instagram (?utm_source=instagram): 14 phiên (từ 57 viewers) | 11 users | 1 lead | 1 đơn (70.000đ)
 *   2. Direct (Trực tiếp & Quét QR bàn UEL): 32 phiên (22.2%) | 26 users | 22 engaged | 3 leads | 2 đơn (175.000đ)
 *   3. Organic Search (Google Search): 18 phiên (12.5%) | 14 users | 12 engaged | 2 leads | 1 đơn (105.000đ)
 *   4. Referral (Zalo / Link nhóm UEL): 10 phiên (7.0%) | 8 users | 6 engaged | 1 lead | 1 đơn (70.000đ)
 * - Mức độ quan tâm (Nhóm 2):
 *   + Thời gian tương tác TB: 1m 42s (102s)
 *   + Engagement Rate: 73.6% (106/144 phiên có tương tác thực; Bounce rate = 26.4%)
 *   + Số trang / phiên: 2.65 (382 pageviews / 144 phiên)
 *   + Top Pages: Home (144), Menu (108), Product Detail (64), Chọn hạt/Campaign (38), Góc Hạt/Blog (19), Về Trạm Hạt/Reviews (9) = 382 pageviews
 * - Phễu chuyển đổi 6 bước (Nhóm 3):
 *   1. Vào web: 144 (100%)
 *   2. Xem Menu: 108 (75.0%)
 *   3. Xem chi tiết: 64 (44.4%)
 *   4. Vào trang Đặt hàng: 28 (19.4%)
 *   5. Gửi form (Lead): 16 (11.1%)
 *   6. Đặt đơn thành công: 11 đơn (7.6% • 25 chai = 875.000đ)
 * - Kỹ thuật (Nhóm 4):
 *   + Mobile: 126 phiên (87.5%) | Desktop: 18 phiên (12.5%)
 *   + Tốc độ tải trang TB: 1.18s | Lỗi 404/500: 0
 */

const sampleCustomers = [
  // 11 KHÁCH ĐÃ ĐẶT ĐƠN HOÀN TẤT (Converted_Order)
  // TikTok (4 đơn - 9 chai = 315.000đ)
  { name: 'Nguyễn Thị Bích Trâm', phone: '0903124855', addr: 'KTX Khu B ĐHQG, Phường Đông Hòa, Dĩ An', district: 'TP. Dĩ An', fav: 'cashew', src: 'tiktok', channelGroup: 'Organic Social', bottles: 3, dateStr: '2026-10-14T10:15:00+07:00', note: 'Đặt combo 3 chai dùng thử sau khi xem clip TikTok' },
  { name: 'Lê Hoàng Nam', phone: '0918732109', addr: 'Trường ĐH Kinh tế - Luật (UEL), Khu phố 6, Linh Trung, TP. Thủ Đức', district: 'TP. Thủ Đức', fav: 'cashew', src: 'tiktok', channelGroup: 'Organic Social', bottles: 2, dateStr: '2026-10-20T09:30:00+07:00', note: 'Nhận sữa giờ giải lao tại sảnh UEL' },
  { name: 'Trần Phương Thảo', phone: '0984551203', addr: 'KTX Khu A ĐHQG, Linh Trung, TP. Thủ Đức', district: 'TP. Thủ Đức', fav: 'macca', src: 'tiktok', channelGroup: 'Organic Social', bottles: 2, dateStr: '2026-10-27T14:20:00+07:00', note: 'Chọn vị ít ngọt, giao lạnh kèm đá gel' },
  { name: 'Nguyễn Đăng Khoa', phone: '0944556677', addr: 'Đường Kha Vạn Cân, Hiệp Bình Chánh, TP. Thủ Đức', district: 'TP. Thủ Đức', fav: 'macca', src: 'tiktok', channelGroup: 'Organic Social', bottles: 2, dateStr: '2026-11-02T15:10:00+07:00', note: 'Đặt uống buổi chiều chống đói khi chạy deadline' },

  // Facebook (2 đơn - 4 chai = 140.000đ)
  { name: 'Võ Minh Quân', phone: '0977234981', addr: 'Chung cư Safira Khang Điền, Phú Hữu, TP. Thủ Đức', district: 'TP. Thủ Đức', fav: 'lotus', src: 'facebook', channelGroup: 'Organic Social', bottles: 2, dateStr: '2026-10-14T16:05:00+07:00', note: 'Xem bài đăng Sữa Hạt Sen Lá Dứa ngày 14/10 trên Fanpage' },
  { name: 'Hoàng Mai Chi', phone: '0945671239', addr: 'KTX Khu B ĐHQG, Phường Đông Hòa, Dĩ An', district: 'TP. Dĩ An', fav: 'lotus', src: 'facebook', channelGroup: 'Organic Social', bottles: 2, dateStr: '2026-10-24T11:40:00+07:00', note: 'Xem bài Menu 6 vị trên Fanpage và đặt qua form web' },

  // Instagram (1 đơn - 2 chai = 70.000đ)
  { name: 'Đỗ Hải Yến', phone: '0933719405', addr: 'Landmark 4, Vinhomes Central Park, Bình Thạnh', district: 'Bình Thạnh', fav: 'cashew', src: 'instagram', channelGroup: 'Organic Social', bottles: 2, dateStr: '2026-11-04T10:25:00+07:00', note: 'Nhấp Bio Link từ bài post Sữa Điều trên Instagram' },

  // Direct & QR UEL (2 đơn - 5 chai = 175.000đ)
  { name: 'Bùi Gia Hưng', phone: '0922881934', addr: 'Ký túc xá ĐH Kinh tế - Luật (UEL), Linh Trung, TP. Thủ Đức', district: 'TP. Thủ Đức', fav: 'walnut', src: 'direct', channelGroup: 'Direct', bottles: 3, dateStr: '2026-10-27T18:50:00+07:00', note: 'Quét mã QR standee tại bàn, gom đơn 3 chai cùng phòng' },
  { name: 'Trần Nhật Minh', phone: '0919283746', addr: 'ĐH Sư Phạm Kỹ Thuật, Số 1 Võ Văn Ngân, TP. Thủ Đức', district: 'TP. Thủ Đức', fav: 'almond', src: 'direct', channelGroup: 'Direct', bottles: 2, dateStr: '2026-10-31T13:45:00+07:00', note: 'Đặt dịp bài đăng Halloween Ghé Trạm Có Chuyện' },

  // Organic Search (1 đơn - 3 chai = 105.000đ)
  { name: 'Phan Tuấn Anh', phone: '0971238910', addr: 'Đường D1, Khu Đô Thị Sala, An Khánh, TP. Thủ Đức', district: 'TP. Thủ Đức', fav: 'cashew', src: 'google', channelGroup: 'Organic Search', bottles: 3, dateStr: '2026-10-27T08:30:00+07:00', note: 'Tìm kiếm từ khóa "Trạm Hạt sữa hạt tươi" trên Google' },

  // Referral (1 đơn - 2 chai = 70.000đ)
  { name: 'Đặng Quốc Bảo', phone: '0909182374', addr: 'Khu phố 6, Phường Linh Trung, TP. Thủ Đức', district: 'TP. Thủ Đức', fav: 'macca', src: 'zalo_referral', channelGroup: 'Referral', bottles: 2, dateStr: '2026-11-04T15:30:00+07:00', note: 'Bạn cùng lớp gửi link đặt thử qua nhóm Zalo' },

  // 5 KHÁCH ĐỂ LẠI THÔNG TIN TƯ VẤN NHƯNG CHƯA CHỐT ĐƠN NGAY (Qualified Lead)
  { name: 'Hồ Thảo Vy', phone: '0937889901', addr: 'Tòa nhà Bitexco, Quận 1, TP.HCM', district: 'Quận 1', fav: 'cashew', src: 'tiktok', channelGroup: 'Organic Social', converted: false, dateStr: '2026-10-27T11:20:00+07:00', note: 'Đắn đo phí ship lẻ 1 chai về Quận 1, chờ ghép đơn' },
  { name: 'Nguyễn Thành Đạt', phone: '0981122334', addr: 'Đường D2 (Nguyễn Gia Trí), Bình Thạnh, TP.HCM', district: 'Bình Thạnh', fav: 'macca', src: 'tiktok', channelGroup: 'Organic Social', converted: false, dateStr: '2026-11-02T16:40:00+07:00', note: 'Đang rủ đồng nghiệp đặt đủ 3 chai để nhận Freeship' },
  { name: 'Lê Thảo My', phone: '0909988776', addr: 'Làng Đại Học Quốc Gia, Đông Hòa, TP. Dĩ An', district: 'TP. Dĩ An', fav: 'lotus', src: 'facebook', channelGroup: 'Organic Social', converted: false, dateStr: '2026-10-31T20:10:00+07:00', note: 'Hỏi cách giữ lạnh sữa khi học cả ngày ở giảng đường' },
  { name: 'Trịnh Quốc Thắng', phone: '0978654321', addr: 'Đường số 8, Phường Linh Trung, TP. Thủ Đức', district: 'TP. Thủ Đức', fav: 'almond', src: 'direct', channelGroup: 'Direct', converted: false, dateStr: '2026-10-24T17:15:00+07:00', note: 'Hoàn thành trắc nghiệm chọn hạt, hẹn đặt vào tuần tới' },
  { name: 'Vũ Ngọc Hân', phone: '0966778899', addr: 'Thảo Điền, TP. Thủ Đức', district: 'TP. Thủ Đức', fav: 'redbean', src: 'google', channelGroup: 'Organic Search', converted: false, dateStr: '2026-11-04T21:00:00+07:00', note: 'Hỏi tư vấn chế độ 0% đường cho thực đơn Eat Clean' }
];

const productMap = {
  cashew: { name: 'Sữa Điều Tự Nhiên', price: 35000 },
  macca: { name: 'Sữa Macca Yến Mạch', price: 35000 },
  lotus: { name: 'Sữa Hạt Sen Lá Dứa', price: 35000 },
  walnut: { name: 'Sữa Óc Chó Mè Đen', price: 35000 },
  almond: { name: 'Sữa Hạnh Nhân Cacao', price: 35000 },
  redbean: { name: 'Sữa Đậu Đỏ Kỷ Tử', price: 35000 }
};

// Phân bổ ngày theo đúng các đợt đăng bài trong thamkhao
const campaignDatesPool = [
  ...Array(6).fill('2026-10-11'),
  ...Array(3).fill('2026-10-13'),
  ...Array(16).fill('2026-10-14'), // Đỉnh bài Sữa Hạt Sen FB (143 views)
  ...Array(4).fill('2026-10-16'),
  ...Array(5).fill('2026-10-18'),
  ...Array(12).fill('2026-10-20'), // Bài 20/10 FB & IG Menu
  ...Array(4).fill('2026-10-22'),
  ...Array(14).fill('2026-10-24'), // Bài Menu 6 vị FB
  ...Array(28).fill('2026-10-27'), // Đỉnh viral TikTok (447 người xem)
  ...Array(6).fill('2026-10-29'),
  ...Array(13).fill('2026-10-31'), // Bài Halloween Ghé Trạm Có Chuyện
  ...Array(15).fill('2026-11-02'), // Bài Sữa Điều IG (132 views) & TikTok
  ...Array(13).fill('2026-11-04'), // Bài Sữa Macca IG (115 views) & TikTok
  ...Array(5).fill('2026-11-07')
]; // Tổng = 144 phiên

async function seedData() {
  console.log('--- BẮT ĐẦU NẠP DỮ LIỆU CHUẨN MỤC 7.2.4 & ĐỐI SOÁT THAMKHAO ---');
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 20000 });
  const db = mongoose.connection.db;

  // 144 phiên từ 6 nguồn cụ thể (thuộc 4 nhóm kênh GA4)
  const sources = [
    ...Array(52).fill({ src: 'tiktok', group: 'Organic Social', medium: 'social_bio' }),
    ...Array(18).fill({ src: 'facebook', group: 'Organic Social', medium: 'social_post' }),
    ...Array(14).fill({ src: 'instagram', group: 'Organic Social', medium: 'social_bio' }),
    ...Array(32).fill({ src: 'direct', group: 'Direct', medium: 'none' }),
    ...Array(18).fill({ src: 'google', group: 'Organic Search', medium: 'organic' }),
    ...Array(10).fill({ src: 'zalo_referral', group: 'Referral', medium: 'referral' })
  ]; // Tổng = 144

  // Tạo 118 userId phân biệt (26 phiên là khách quay lại lần 2)
  const userIdsPool = [];
  for (let u = 1; u <= 118; u++) {
    userIdsPool.push(`usr_${1000 + u}`);
  }
  for (let r = 1; r <= 26; r++) {
    userIdsPool.push(`usr_${1000 + r}`); // 26 lượt quay lại từ nhóm 26 khách đầu
  }

  // Thiết bị: 126 Mobile (87.5%) + 18 Desktop (12.5%) = 144
  const devicesPool = [
    ...Array(126).fill('Mobile'),
    ...Array(18).fill('Desktop')
  ];

  const hcmIPs = [
    '113.161.42.', '14.169.130.', '171.244.18.', '115.79.208.', '27.72.63.', '118.69.155.'
  ];

  const sessions = [];
  const trackingEvents = [];

  // BƯỚC 1: 144 PHIÊN VÀO TRANG CHỦ (/#home) -> 144 page_views
  for (let i = 0; i < 144; i++) {
    const sInfo = sources[i];
    const userId = userIdsPool[i];
    const sessId = `sess_${sInfo.src}_${1001 + i}`;
    const dayStr = campaignDatesPool[i] || '2026-10-27';
    const hour = 8 + (i % 13);
    const minute = (i * 7) % 60;
    const eventTime = new Date(`${dayStr}T${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00+07:00`);
    const deviceType = devicesPool[i];
    const isMobile = deviceType === 'Mobile';
    const ip = `${hcmIPs[i % hcmIPs.length]}${(i % 240) + 10}`;
    const isEngaged = i < 106; // 106/144 phiên có tương tác thực (73.6% Engagement Rate)

    sessions.push({
      sessId,
      userId,
      src: sInfo.src,
      channelGroup: sInfo.group,
      medium: sInfo.medium,
      deviceType,
      isMobile,
      eventTime,
      ip,
      isEngaged
    });

    trackingEvents.push({
      userId,
      sessionId: sessId,
      eventType: 'page_view',
      page: '/#home',
      tab: 'home',
      pageTitle: 'Trang chủ - Tổng quan & Vùng nguyên liệu',
      secondsSpent: isEngaged ? 32 : 6,
      isEngagedSession: isEngaged,
      channelGroup: sInfo.group,
      utm: {
        source: sInfo.src,
        medium: sInfo.medium,
        campaign: 'ghe_tram_co_chuyen'
      },
      device: {
        deviceType,
        screenWidth: isMobile ? 390 : 1440,
        screenHeight: isMobile ? 844 : 900
      },
      ip,
      createdAt: eventTime,
      updatedAt: eventTime
    });
  }

  // BƯỚC 2: 108 PHIÊN XEM MENU (/#menu) -> 108 page_views
  for (let i = 0; i < 108; i++) {
    const s = sessions[i];
    const t = new Date(s.eventTime.getTime() + 25000);
    trackingEvents.push({
      userId: s.userId,
      sessionId: s.sessId,
      eventType: 'page_view',
      page: '/#menu',
      tab: 'menu',
      pageTitle: 'Thực đơn 6 vị sữa hạt tươi',
      secondsSpent: 58,
      isEngagedSession: true,
      channelGroup: s.channelGroup,
      utm: { source: s.src, medium: s.medium, campaign: 'ghe_tram_co_chuyen' },
      device: { deviceType: s.deviceType },
      ip: s.ip,
      createdAt: t,
      updatedAt: t
    });
  }

  // BƯỚC 3: 64 PHIÊN XEM CHI TIẾT VỊ SỮA (/#product-detail) -> 64 page_views
  // Phân bổ 6 vị khớp đúng top view: Điều (22), Macca (18), Sen (12), Óc Chó (5), Hạnh Nhân (4), Đậu Đỏ (3) = 64
  const flavorDist = [
    ...Array(22).fill('cashew'),
    ...Array(18).fill('macca'),
    ...Array(12).fill('lotus'),
    ...Array(5).fill('walnut'),
    ...Array(4).fill('almond'),
    ...Array(3).fill('redbean')
  ];

  for (let i = 0; i < 64; i++) {
    const s = sessions[i];
    const prodId = flavorDist[i];
    const prod = productMap[prodId];
    const t = new Date(s.eventTime.getTime() + 65000);
    trackingEvents.push({
      userId: s.userId,
      sessionId: s.sessId,
      eventType: 'page_view',
      subEventType: 'product_view',
      page: `/#product-detail/${prodId}`,
      tab: 'product-detail',
      pageTitle: `Chi tiết vị: ${prod.name}`,
      productId: prodId,
      productName: prod.name,
      secondsSpent: 75,
      isEngagedSession: true,
      channelGroup: s.channelGroup,
      utm: { source: s.src, medium: s.medium, campaign: 'ghe_tram_co_chuyen' },
      device: { deviceType: s.deviceType },
      ip: s.ip,
      createdAt: t,
      updatedAt: t
    });
  }

  // CÁC TRANG NỘI DUNG KHÁC TRONG NHÓM 2 (ĐỂ TỔNG PAGEVIEWS = 382, TỨC 2.65 TRANG/PHIÊN):
  // - Chọn hạt theo nhu cầu / Chiến dịch (/#campaign): 38 lượt xem
  for (let i = 0; i < 38; i++) {
    const s = sessions[i * 2];
    const t = new Date(s.eventTime.getTime() + 95000);
    trackingEvents.push({
      userId: s.userId,
      sessionId: s.sessId,
      eventType: 'page_view',
      page: '/#campaign',
      tab: 'campaign',
      pageTitle: 'Chiến dịch Ghé Trạm Có Chuyện - Chọn hạt theo nhu cầu',
      secondsSpent: 84,
      isEngagedSession: true,
      channelGroup: s.channelGroup,
      utm: { source: s.src, medium: s.medium, campaign: 'ghe_tram_co_chuyen' },
      device: { deviceType: s.deviceType },
      ip: s.ip,
      createdAt: t,
      updatedAt: t
    });
  }

  // - Góc Hạt / Blog kiến thức & bảo quản 48h (/#knowledge): 19 lượt xem
  for (let i = 0; i < 19; i++) {
    const s = sessions[i * 3];
    const t = new Date(s.eventTime.getTime() + 120000);
    trackingEvents.push({
      userId: s.userId,
      sessionId: s.sessId,
      eventType: 'page_view',
      page: '/#knowledge',
      tab: 'knowledge',
      pageTitle: 'Góc Hạt - Blog kiến thức & Quy tắc bảo quản lạnh 48h',
      secondsSpent: 108,
      isEngagedSession: true,
      channelGroup: s.channelGroup,
      utm: { source: s.src, medium: s.medium, campaign: 'ghe_tram_co_chuyen' },
      device: { deviceType: s.deviceType },
      ip: s.ip,
      createdAt: t,
      updatedAt: t
    });
  }

  // - Về Trạm Hạt & Cảm nhận khách hàng (/#about, /#reviews): 9 lượt xem
  for (let i = 0; i < 9; i++) {
    const s = sessions[i * 5];
    const t = new Date(s.eventTime.getTime() + 140000);
    trackingEvents.push({
      userId: s.userId,
      sessionId: s.sessId,
      eventType: 'page_view',
      page: '/#about',
      tab: 'about',
      pageTitle: 'Về Trạm Hạt & Cảm nhận khách hàng',
      secondsSpent: 45,
      isEngagedSession: true,
      channelGroup: s.channelGroup,
      utm: { source: s.src, medium: s.medium, campaign: 'ghe_tram_co_chuyen' },
      device: { deviceType: s.deviceType },
      ip: s.ip,
      createdAt: t,
      updatedAt: t
    });
  }

  // BƯỚC 4 PHỄU: VÀO TRANG ĐẶT HÀNG / GIỎ HÀNG (checkout_view) -> 28 phiên
  for (let i = 0; i < 28; i++) {
    const s = sessions[i];
    const prodId = flavorDist[i % flavorDist.length];
    const prod = productMap[prodId];
    const t = new Date(s.eventTime.getTime() + 150000);
    trackingEvents.push({
      userId: s.userId,
      sessionId: s.sessId,
      eventType: 'checkout_view',
      page: '/#checkout',
      tab: 'checkout',
      productId: prodId,
      productName: prod.name,
      channelGroup: s.channelGroup,
      utm: { source: s.src, medium: s.medium, campaign: 'ghe_tram_co_chuyen' },
      device: { deviceType: s.deviceType },
      ip: s.ip,
      createdAt: t,
      updatedAt: t
    });
  }

  // BƯỚC 5 PHỄU: GỬI FORM THÔNG TIN (LEAD TỪ FORM) -> 16 KHÁCH
  const leadsToInsert = [];
  for (let i = 0; i < 16; i++) {
    const cust = sampleCustomers[i];
    const prod = productMap[cust.fav];
    const leadTime = new Date(cust.dateStr);
    const s = sessions[i];

    trackingEvents.push({
      userId: s.userId,
      sessionId: s.sessId,
      eventType: 'lead_inquiry',
      page: '/#checkout-form',
      productId: cust.fav,
      productName: prod.name,
      channelGroup: cust.channelGroup,
      utm: { source: cust.src, campaign: 'ghe_tram_co_chuyen' },
      device: { deviceType: s.deviceType },
      ip: s.ip,
      createdAt: leadTime,
      updatedAt: leadTime
    });

    const isConverted = cust.converted !== false;
    const channelLabel = cust.src === 'tiktok' ? 'TikTok Bio (UTM)' 
      : (cust.src === 'facebook' ? 'Facebook Page (UTM)' 
      : (cust.src === 'instagram' ? 'Instagram Bio (UTM)' 
      : (cust.src === 'google' ? 'Google Search' 
      : (cust.src === 'zalo_referral' ? 'Zalo Referral' : 'Direct / QR UEL'))));

    const leadDoc = {
      leadId: `LEAD-2026-${101 + i}`,
      customerName: cust.name,
      phone: cust.phone,
      email: `${cust.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z]/g, '')}${101 + i}@gmail.com`,
      channel: channelLabel,
      channelGroup: cust.channelGroup,
      utmSource: cust.src,
      utmCampaign: 'ghe_tram_co_chuyen',
      interestedProduct: prod.name,
      inquiryContent: cust.note,
      isQualified: true,
      status: isConverted ? 'Converted_Order' : 'Qualified',
      aiScore: isConverted ? 92 : 70,
      funnelStage: isConverted ? 'Customer' : 'SQL',
      district: cust.district,
      address: cust.addr,
      notes: cust.note,
      hasFullData: true,
      receivedAt: leadTime,
      createdAt: leadTime,
      updatedAt: leadTime
    };

    if (isConverted) {
      leadDoc.convertedOrderId = `TH-2610-${String(i + 1).padStart(2, '0')}`;
    }

    leadsToInsert.push(leadDoc);
  }

  // BƯỚC 6 PHỄU: ĐẶT ĐƠN HÀNG THÀNH CÔNG -> 11 ĐƠN (25 CHAI = 875.000đ)
  const ordersToInsert = [];
  let totalRevenueVND = 0;
  let totalBottles = 0;

  for (let i = 0; i < 11; i++) {
    const cust = sampleCustomers[i];
    const prod = productMap[cust.fav];
    const orderTime = new Date(new Date(cust.dateStr).getTime() + 180000);
    const s = sessions[i];

    const bottleCount = cust.bottles || 2;
    const orderTotal = bottleCount * 35000;
    totalRevenueVND += orderTotal;
    totalBottles += bottleCount;

    const orderId = `TH-2610-${String(i + 1).padStart(2, '0')}`;

    trackingEvents.push({
      userId: s.userId,
      sessionId: s.sessId,
      eventType: 'purchase',
      page: '/#order-success',
      productId: cust.fav,
      productName: prod.name,
      channelGroup: cust.channelGroup,
      utm: { source: cust.src, campaign: 'ghe_tram_co_chuyen' },
      device: { deviceType: s.deviceType },
      ip: s.ip,
      metadata: { orderId, amount: orderTotal, bottleCount },
      createdAt: orderTime,
      updatedAt: orderTime
    });

    ordersToInsert.push({
      id: orderId,
      orderId: orderId,
      customer: cust.name,
      customerName: cust.name,
      phone: cust.phone,
      district: cust.district,
      address: cust.addr,
      items: `${bottleCount}x ${prod.name} (250ml)`,
      bottles: bottleCount,
      total: `${orderTotal.toLocaleString('vi-VN')}đ`,
      totalVND: orderTotal,
      payment: i % 3 === 0 ? 'COD - Nhận hàng trả tiền' : 'Chuyển khoản VietQR',
      time: orderTime.toLocaleDateString('vi-VN') + ' ' + orderTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      status: 'Hoàn Thành',
      sessionId: s.sessId,
      channelGroup: cust.channelGroup,
      utmSource: cust.src,
      utm: { source: cust.src, campaign: 'ghe_tram_co_chuyen' },
      note: cust.note,
      createdAt: orderTime,
      updatedAt: orderTime
    });
  }

  // USERS COLLECTION: 16 KHÁCH HÀNG + 1 ADMIN
  const usersToInsert = [
    {
      id: 'USR-ADMIN-01',
      name: 'Quản Trị Viên Trạm Hạt',
      email: 'admin@tramhat.vn',
      phone: '0901234888',
      role: 'admin',
      address: 'Trạm Hạt Studio, Khu Đô Thị ĐHQG, TP. Thủ Đức',
      tier: 'Quản Trị',
      createdAt: new Date('2026-10-10T08:00:00+07:00')
    },
    ...sampleCustomers.map((c, idx) => ({
      id: `USR-CUST-${101 + idx}`,
      name: c.name,
      email: `${c.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z]/g, '')}${101 + idx}@gmail.com`,
      phone: c.phone,
      address: c.addr,
      district: c.district,
      role: 'customer',
      source: c.src,
      channelGroup: c.channelGroup,
      favoriteProduct: productMap[c.fav].name,
      tier: c.converted !== false ? 'Khách Đã Mua' : 'Khách Tiềm Năng (Lead)',
      ordersCount: c.converted !== false ? 1 : 0,
      bottlesBought: c.bottles || 0,
      note: c.note,
      createdAt: new Date(c.dateStr)
    }))
  ];

  // TỔNG HỢP ANALYTICS DOCUMENT TRONG MONGODB
  const analyticsDoc = {
    key: 'current_metrics',
    campaignPeriod: '11/10/2026 - 07/11/2026 (28 ngày)',
    usersCount: 118,
    returningSessions: 26,
    totalVisits: 144,
    totalPageViews: 382,
    pagesPerSession: 2.65,
    engagedSessions: 106,
    engagementRatePct: 73.6,
    bounceRatePct: 26.4,
    avgEngagementSeconds: 102,
    avgEngagementFormatted: '1m 42s',
    menuViews: 108,
    detailViews: 64,
    checkoutViews: 28,
    leadsCount: 16,
    leadPerSessionPct: 11.1,
    purchasesCount: 11,
    orderPerSessionPct: 7.6,
    leadToOrderPct: 68.8,
    totalBottles: totalBottles,
    revenueVND: totalRevenueVND,
    devices: {
      mobile: 126,
      mobilePct: 87.5,
      desktop: 18,
      desktopPct: 12.5,
      tablet: 0
    },
    technical: {
      avgLoadTimeSec: 1.18,
      fcpSec: 0.78,
      lcpSec: 1.18,
      errorPagesCount: 0,
      uptimePct: 100
    },
    channelGroups: [
      { group: 'Organic Social', sessions: 84, pct: 58.3, users: 70, engaged: 66, engagementRate: '78,6%', leads: 10, orders: 7, revenue: 525000 },
      { group: 'Direct (Trực tiếp & QR UEL)', sessions: 32, pct: 22.2, users: 26, engaged: 22, engagementRate: '68,8%', leads: 3, orders: 2, revenue: 175000 },
      { group: 'Organic Search (Google)', sessions: 18, pct: 12.5, users: 14, engaged: 12, engagementRate: '66,7%', leads: 2, orders: 1, revenue: 105000 },
      { group: 'Referral (Link chia sẻ Zalo)', sessions: 10, pct: 7.0, users: 8, engaged: 6, engagementRate: '60,0%', leads: 1, orders: 1, revenue: 70000 }
    ],
    socialUtmBreakdown: [
      { source: 'TikTok', utm: '?utm_source=tiktok', socialViews: 5700, profileVisits: 107, sessions: 52, shareOfSocialPct: 61.9, ctrFromProfilePct: 48.6, users: 44, leads: 6, orders: 4, revenue: 315000 },
      { source: 'Facebook', utm: '?utm_source=facebook', socialViews: 289, profileVisits: 40, sessions: 18, shareOfSocialPct: 21.4, ctrFromProfilePct: 45.0, users: 15, leads: 3, orders: 2, revenue: 140000 },
      { source: 'Instagram', utm: '?utm_source=instagram', socialViews: 329, profileVisits: 57, sessions: 14, shareOfSocialPct: 16.7, ctrFromProfilePct: 24.6, users: 11, leads: 1, orders: 1, revenue: 70000 }
    ],
    topPages: [
      { rank: 1, path: '/#home', title: 'Trang chủ (Landing & Tổng quan)', views: 144, sessionsPct: 100.0, avgTime: '32 giây', note: 'Điểm đáp đầu tiên từ Bio Link & QR; 75% đi tiếp vào Thực đơn' },
      { rank: 2, path: '/#menu', title: 'Thực đơn 6 vị sữa hạt tươi', views: 108, sessionsPct: 75.0, avgTime: '58 giây', note: 'Trang hút người xem nhất; khách đối chiếu giá 35.000đ và 6 hương vị' },
      { rank: 3, path: '/#product-detail', title: 'Chi tiết vị sữa & Bảng dinh dưỡng', views: 64, sessionsPct: 44.4, avgTime: '1 phút 15 giây', note: 'Đọc kỹ thành phần hạt & calo (Top: Sữa Điều 22, Macca 18, Hạt Sen 12)' },
      { rank: 4, path: '/#campaign', title: 'Chọn hạt theo nhu cầu (Chiến dịch)', views: 38, sessionsPct: 26.4, avgTime: '1 phút 24 giây', note: 'Tương tác gợi ý vị theo nhu cầu (Tỉnh táo, Giữ dáng, Thanh nhiệt)' },
      { rank: 5, path: '/#knowledge', title: 'Góc Hạt (Blog kiến thức & Bảo quản 48h)', views: 19, sessionsPct: 13.2, avgTime: '1 phút 48 giây', note: 'Thời gian đọc lâu nhất; tìm hiểu hiện tượng tách lớp & hạn dùng 48h' },
      { rank: 6, path: '/#about', title: 'Về Trạm Hạt & Cảm nhận khách hàng', views: 9, sessionsPct: 6.3, avgTime: '45 giây', note: 'Kiểm chứng vùng nguyên liệu Bình Phước, Tây Nguyên, Đồng Tháp' }
    ],
    utmSources: {
      tiktok: 52,
      facebook: 18,
      instagram: 14,
      direct: 32,
      google: 18,
      referral: 10
    },
    updatedAt: new Date()
  };

  console.log('Xóa dữ liệu cũ trên MongoDB Atlas...');
  await db.collection('trackingevents').deleteMany({});
  await db.collection('leads').deleteMany({});
  await db.collection('orders').deleteMany({});
  await db.collection('users').deleteMany({});

  await db.collection('trackingevents').insertMany(trackingEvents);
  await db.collection('leads').insertMany(leadsToInsert);
  await db.collection('orders').insertMany(ordersToInsert);
  await db.collection('users').insertMany(usersToInsert);
  await db.collection('analytics').updateOne(
    { key: 'current_metrics' },
    { $set: analyticsDoc },
    { upsert: true }
  );

  // ĐỒNG BỘ CẢ FILE LOCAL JSON TRONG FRONTEND/DATA
  const dataDir = path.join(__dirname, '../frontend/data');
  fs.writeFileSync(path.join(dataDir, 'users.json'), JSON.stringify(usersToInsert, null, 2), 'utf8');
  fs.writeFileSync(path.join(dataDir, 'orders.json'), JSON.stringify(ordersToInsert, null, 2), 'utf8');
  fs.writeFileSync(path.join(dataDir, 'analytics.json'), JSON.stringify(analyticsDoc, null, 2), 'utf8');

  console.log('=== KẾT QUẢ ĐỐI SOÁT MONGODB ATLAS & LOCAL JSON ===');
  console.log('- Users (role=customer):', await db.collection('users').countDocuments({ role: 'customer' }));
  console.log('- Distinct Visitors (userId):', (await db.collection('trackingevents').distinct('userId')).length);
  console.log('- Distinct Sessions (sessionId):', (await db.collection('trackingevents').distinct('sessionId')).length);
  console.log('- Total Pageviews (eventType=page_view):', await db.collection('trackingevents').countDocuments({ eventType: 'page_view' }));
  console.log('- Total Tracking Events:', await db.collection('trackingevents').countDocuments());
  console.log('- Leads từ form:', await db.collection('leads').countDocuments());
  console.log('- Đơn đặt hàng (Orders):', await db.collection('orders').countDocuments());
  console.log('- Tổng số chai:', totalBottles, 'chai | Tổng doanh thu:', totalRevenueVND.toLocaleString('vi-VN'), 'đ');

  await mongoose.disconnect();
}

seedData().catch(err => {
  console.error('Lỗi seed:', err);
  process.exit(1);
});
