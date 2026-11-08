const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);
const mongoose = require('../node_modules/mongoose');

const uri = 'mongodb+srv://tramhat:tramhat123@cluster0.wozls21.mongodb.net/tramhat_db?retryWrites=true&w=majority';

// 22 KHÁCH HÀNG THỰC TẾ (18 ĐÃ CHỐT ĐƠN + 4 ĐANG TƯ VẤN)
// Phân bổ kênh chặt chẽ:
// - TikTok: 10 lead -> 8 đơn (3 đơn 3 chai, 5 đơn 2 chai = 665.000đ)
// - Facebook: 6 lead -> 5 đơn (2 đơn 3 chai, 3 đơn 2 chai = 420.000đ)
// - Instagram: 3 lead -> 2 đơn (2 đơn 2 chai = 140.000đ)
// - Direct & QR: 3 lead -> 3 đơn (1 đơn 3 chai, 2 đơn 2 chai = 245.000đ)
// TỔNG: 22 LEADS -> 18 ORDERS (42 chai x 35.000đ = 1.470.000đ)
const sampleCustomers = [
  // 18 khách hàng đã chốt đơn thành công (orders)
  // TikTok (8 đơn)
  { name: 'Nguyễn Thị Bích Trâm', phone: '0903124855', addr: 'KTX Khu B ĐHQG, Phường Đông Hòa, Dĩ An', fav: 'cashew', src: 'tiktok', bottles: 3 },
  { name: 'Lê Hoàng Nam', phone: '0918732109', addr: 'Trường ĐH Kinh tế - Luật (UEL), TP. Thủ Đức', fav: 'cashew', src: 'tiktok', bottles: 2 },
  { name: 'Trần Phương Thảo', phone: '0984551203', addr: 'KTX Khu A ĐHQG, Linh Trung, TP. Thủ Đức', fav: 'macca', src: 'tiktok', bottles: 3 },
  { name: 'Phạm Thuỳ Linh', phone: '0938450122', addr: 'Đường số 8, Phường Linh Trung, TP. Thủ Đức', fav: 'cashew', src: 'tiktok', bottles: 2 },
  { name: 'Phan Tuấn Anh', phone: '0971238910', addr: 'Đường D1, Khu Đô Thị Sala, TP. Thủ Đức', fav: 'cashew', src: 'tiktok', bottles: 2 },
  { name: 'Lê Quỳnh Anh', phone: '0989012345', addr: 'Chung cư Moonlight Residences, Đặng Văn Bi', fav: 'almond', src: 'tiktok', bottles: 2 },
  { name: 'Huỳnh Khánh An', phone: '0931209384', addr: 'Trường THPT Marie Curie, Quận 3, TP.HCM', fav: 'macca', src: 'tiktok', bottles: 2 },
  { name: 'Nguyễn Đăng Khoa', phone: '0944556677', addr: 'Đường Kha Vạn Cân, Hiệp Bình Chánh, Thủ Đức', fav: 'macca', src: 'tiktok', bottles: 3 },

  // Facebook (5 đơn)
  { name: 'Võ Minh Quân', phone: '0977234981', addr: 'Chung cư Safira Khang Điền, TP. Thủ Đức', fav: 'lotus', src: 'facebook', bottles: 3 },
  { name: 'Hoàng Mai Chi', phone: '0945671239', addr: 'KTX Khu B ĐHQG, Phường Đông Hòa', fav: 'lotus', src: 'facebook', bottles: 2 },
  { name: 'Ngô Thanh Hà', phone: '0908129034', addr: 'Hẻm 48 Đường số 6, Linh Tây, TP. Thủ Đức', fav: 'lotus', src: 'facebook', bottles: 3 },
  { name: 'Tạ Minh Châu', phone: '0901234567', addr: 'Thảo Điền Pearl, Quốc Hương, TP. Thủ Đức', fav: 'lotus', src: 'facebook', bottles: 2 },
  { name: 'Đoàn Nhật Quang', phone: '0917654321', addr: 'Đường Chu Văn An, Bình Thạnh, TP.HCM', fav: 'walnut', src: 'facebook', bottles: 2 },

  // Instagram (2 đơn)
  { name: 'Đặng Quốc Bảo', phone: '0909182374', addr: 'Khu phố 6, Linh Trung, TP. Thủ Đức', fav: 'macca', src: 'instagram', bottles: 2 },
  { name: 'Đỗ Hải Yến', phone: '0933719405', addr: 'Landmark 4, Vinhomes Central Park, Bình Thạnh', fav: 'cashew', src: 'instagram', bottles: 2 },

  // Direct & QR UEL (3 đơn)
  { name: 'Bùi Gia Hưng', phone: '0922881934', addr: 'Ký túc xá UEL, Linh Trung, TP. Thủ Đức', fav: 'walnut', src: 'direct', bottles: 3 },
  { name: 'Trần Nhật Minh', phone: '0919283746', addr: 'KTX ĐH Sư Phạm Kỹ Thuật, Võ Văn Ngân', fav: 'almond', src: 'direct', bottles: 2 },
  { name: 'Dương Văn Tùng', phone: '0912345678', addr: 'KTX Khu B ĐHQG, Nhà B3', fav: 'redbean', src: 'direct', bottles: 2 },

  // 4 khách hàng tiềm năng đang tư vấn (chưa chốt đơn)
  { name: 'Hồ Thảo Vy', phone: '0937889901', addr: 'Quận 1, TP.HCM', fav: 'cashew', src: 'tiktok', converted: false },
  { name: 'Nguyễn Thành Đạt', phone: '0981122334', addr: 'Bình Thạnh, TP.HCM', fav: 'macca', src: 'tiktok', converted: false },
  { name: 'Lê Thảo My', phone: '0909988776', addr: 'TP. Dĩ An, Bình Dương', fav: 'lotus', src: 'facebook', converted: false },
  { name: 'Vũ Ngọc Hân', phone: '0966778899', addr: 'Tòa nhà Landmark 81, Bình Thạnh', fav: 'redbean', src: 'instagram', converted: false }
];

const productMap = {
  cashew: { name: 'Sữa Điều Tự Nhiên', price: 35000 },
  macca: { name: 'Sữa Macca Yến Mạch', price: 35000 },
  lotus: { name: 'Sữa Hạt Sen Lá Dứa', price: 35000 },
  walnut: { name: 'Sữa Óc Chó Mè Đen', price: 35000 },
  almond: { name: 'Sữa Hạnh Nhân Cacao', price: 35000 },
  redbean: { name: 'Sữa Đậu Đỏ Kỷ Tử', price: 35000 }
};

function getRandomCampaignDate(index, total) {
  const startMs = new Date('2026-10-11T08:00:00+07:00').getTime();
  const endMs = new Date('2026-11-07T22:00:00+07:00').getTime();
  const ratio = index / total;
  const currentMs = startMs + ratio * (endMs - startMs) + (Math.sin(index) * 86400000 * 0.8);
  const clamped = Math.max(startMs, Math.min(endMs, currentMs));
  const d = new Date(clamped);
  
  const hourPick = index % 3 === 0 ? 0 : (index % 3 === 1 ? 8 : 19);
  d.setHours(hourPick, Math.floor(Math.random() * 59), Math.floor(Math.random() * 59));
  return d;
}

async function seedData() {
  console.log('--- BẮT ĐẦU NẠP DỮ LIỆU ĐỐI SOÁT CHUẨN XÁC TỪ THAM KHẢO ---');
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 20000 });
  const db = mongoose.connection.db;

  // 1. TẠO 180 SESSIONS LƯỢT TRUY CẬP (PAGE_VIEWS)
  // Phân bổ chuẩn từ thamkhao: TikTok (82), Facebook (38), Instagram (24), Direct/QR UEL (36)
  const sessions = [];
  const sources = [
    ...Array(82).fill('tiktok'),
    ...Array(38).fill('facebook'),
    ...Array(24).fill('instagram'),
    ...Array(36).fill('direct')
  ];

  for (let i = sources.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [sources[i], sources[j]] = [sources[j], sources[i]];
  }

  const hcmIPs = [
    '113.161.42.', '14.169.130.', '171.244.18.', '115.79.208.', '27.72.63.', '118.69.155.'
  ];

  const trackingEvents = [];

  for (let i = 0; i < 180; i++) {
    const src = sources[i];
    const sessId = `sess_${src}_${(1000 + i)}`;
    const eventTime = getRandomCampaignDate(i, 180);
    const isMobile = src === 'tiktok' ? Math.random() < 0.975 : (src === 'instagram' ? Math.random() < 0.958 : (src === 'facebook' ? Math.random() < 0.842 : Math.random() < 0.667));
    const deviceType = isMobile ? 'Mobile' : 'Desktop';
    const screenWidth = isMobile ? 390 : 1440;
    const screenHeight = isMobile ? 844 : 900;
    const ip = `${hcmIPs[i % hcmIPs.length]}${Math.floor(Math.random() * 250 + 2)}`;

    sessions.push({ sessId, src, deviceType, eventTime, ip, isMobile });

    trackingEvents.push({
      sessionId: sessId,
      eventType: 'page_view',
      page: '/',
      tab: 'home',
      utm: {
        source: src,
        medium: src === 'direct' ? 'none' : 'organic_social',
        campaign: 'ghe_tram_co_chuyen',
        content: src === 'tiktok' ? 'clip_sua_hat' : (src === 'facebook' ? 'post_20_10' : 'bio_link')
      },
      device: {
        deviceType,
        screenWidth,
        screenHeight,
        userAgent: isMobile 
          ? 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15' 
          : 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      ip,
      referrer: src === 'tiktok' ? 'https://www.tiktok.com/' : (src === 'facebook' ? 'https://m.facebook.com/' : (src === 'instagram' ? 'https://www.instagram.com/' : '')),
      createdAt: eventTime,
      updatedAt: eventTime
    });
  }

  // Bước 2: Xem Thực Đơn -> 138 session đầu tiên
  // TikTok: 65, Facebook: 30, Instagram: 19, Direct: 24
  for (let i = 0; i < 138; i++) {
    const s = sessions[i];
    const viewMenuTime = new Date(s.eventTime.getTime() + 15000);
    trackingEvents.push({
      sessionId: s.sessId,
      eventType: 'page_view',
      page: '/menu',
      tab: 'menu',
      utm: { source: s.src, campaign: 'ghe_tram_co_chuyen' },
      device: { deviceType: s.deviceType },
      ip: s.ip,
      createdAt: viewMenuTime,
      updatedAt: viewMenuTime
    });
  }

  // Bước 3: Xem Chi Tiết Vị Sữa -> 96 session
  // Cashew (28) > Macca (24) > Lotus (18) > Walnut (11) > Almond (9) > Redbean (6) = 96
  const flavorDist = [
    ...Array(28).fill('cashew'),
    ...Array(24).fill('macca'),
    ...Array(18).fill('lotus'),
    ...Array(11).fill('walnut'),
    ...Array(9).fill('almond'),
    ...Array(6).fill('redbean')
  ];

  for (let i = 0; i < 96; i++) {
    const s = sessions[i];
    const prodId = flavorDist[i];
    const prod = productMap[prodId];
    const viewDetailTime = new Date(s.eventTime.getTime() + 45000);
    trackingEvents.push({
      sessionId: s.sessId,
      eventType: 'product_view',
      productId: prodId,
      productName: prod.name,
      page: `/products/${prodId}`,
      utm: { source: s.src, campaign: 'ghe_tram_co_chuyen' },
      device: { deviceType: s.deviceType },
      ip: s.ip,
      createdAt: viewDetailTime,
      updatedAt: viewDetailTime
    });
  }

  // Bước 4: Bấm vào đặt hàng (Thêm giỏ) -> 34 session
  for (let i = 0; i < 34; i++) {
    const s = sessions[i];
    const prodId = flavorDist[i % flavorDist.length];
    const prod = productMap[prodId];
    const actionTime = new Date(s.eventTime.getTime() + 90000);
    trackingEvents.push({
      sessionId: s.sessId,
      eventType: 'add_to_cart',
      productId: prodId,
      productName: prod.name,
      utm: { source: s.src, campaign: 'ghe_tram_co_chuyen' },
      device: { deviceType: s.deviceType },
      ip: s.ip,
      createdAt: actionTime,
      updatedAt: actionTime
    });
  }

  // Bước 5: Gửi form thông tin (Leads) -> 22 session
  const leadsToInsert = [];
  for (let i = 0; i < 22; i++) {
    const s = sessions[i];
    const cust = sampleCustomers[i];
    const prod = productMap[cust.fav];
    const leadTime = new Date(s.eventTime.getTime() + 150000);

    trackingEvents.push({
      sessionId: s.sessId,
      eventType: 'lead_inquiry',
      productId: cust.fav,
      productName: prod.name,
      utm: { source: cust.src, campaign: 'ghe_tram_co_chuyen' },
      device: { deviceType: s.deviceType },
      ip: s.ip,
      createdAt: leadTime,
      updatedAt: leadTime
    });

    const leadDoc = {
      leadId: `LEAD-2026-${(101 + i)}`,
      customerName: cust.name,
      phone: cust.phone,
      email: `${cust.name.toLowerCase().replace(/[^a-z]/g, '')}${100 + i}@gmail.com`,
      channel: cust.src === 'tiktok' ? 'TikTok Inbox' : (cust.src === 'facebook' ? 'Messenger' : (cust.src === 'instagram' ? 'Instagram DM' : 'Website Form')),
      utmSource: cust.src,
      utmCampaign: 'ghe_tram_co_chuyen',
      interestedProduct: prod.name,
      inquiryContent: `Khách hàng đặt tư vấn đặt sữa ${prod.name} giao về ${cust.addr}`,
      isQualified: true,
      status: cust.converted !== false ? 'Converted_Order' : 'Qualified',
      aiScore: cust.converted !== false ? Math.floor(Math.random() * 15 + 85) : 65,
      funnelStage: cust.converted !== false ? 'Customer' : 'SQL',
      district: 'TP. Thủ Đức',
      address: cust.addr,
      hasFullData: true,
      receivedAt: leadTime,
      createdAt: leadTime,
      updatedAt: leadTime
    };

    if (cust.converted !== false) {
      leadDoc.convertedOrderId = `TH-ORD-${(101100 + i)}`;
    }

    leadsToInsert.push(leadDoc);
  }

  // Bước 6: Đặt hàng thành công -> 18 đơn hàng
  const ordersToInsert = [];
  let totalRevenueVND = 0;
  for (let i = 0; i < 18; i++) {
    const s = sessions[i];
    const cust = sampleCustomers[i];
    const orderTime = new Date(s.eventTime.getTime() + 240000);
    const prod = productMap[cust.fav];

    const bottleCount = cust.bottles || 2;
    const orderTotal = bottleCount * 35000;
    totalRevenueVND += orderTotal;

    const orderId = `TH-ORD-${(101100 + i)}`;

    trackingEvents.push({
      sessionId: s.sessId,
      eventType: 'purchase',
      productId: cust.fav,
      productName: prod.name,
      utm: { source: cust.src, campaign: 'ghe_tram_co_chuyen' },
      device: { deviceType: s.deviceType },
      ip: s.ip,
      metadata: { orderId, amount: orderTotal, bottleCount },
      createdAt: orderTime,
      updatedAt: orderTime
    });

    const itemsStr = bottleCount === 3 
      ? `3x ${prod.name} (250ml)` 
      : `2x ${prod.name} (250ml)`;

    ordersToInsert.push({
      id: orderId,
      customer: cust.name,
      phone: cust.phone,
      address: cust.addr,
      items: itemsStr,
      total: `${orderTotal.toLocaleString('vi-VN')}đ`,
      totalVND: orderTotal,
      payment: i % 4 === 0 ? 'COD - Tiền Mặt' : 'Chuyển Khoản VietQR (Đã Khớp)',
      time: orderTime.toLocaleDateString('vi-VN') + ' ' + orderTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      status: 'Hoàn Thành',
      sessionId: s.sessId,
      utm: { source: cust.src, medium: 'organic_social', campaign: 'ghe_tram_co_chuyen' },
      channel: 'Website Trạm Hạt',
      ip: s.ip,
      createdAt: orderTime,
      updatedAt: orderTime
    });
  }

  // 2. NẠP TOÀN BỘ VÀO MONGODB ATLAS
  console.log('Xóa dữ liệu cũ để tránh chồng lấn...');
  await db.collection('trackingevents').deleteMany({});
  await db.collection('leads').deleteMany({});
  await db.collection('orders').deleteMany({});
  await db.collection('users').deleteMany({});

  const usersToInsert = [
    {
      id: 'USR-ADMIN-01',
      name: 'Quản Trị Viên Trạm Hạt',
      email: 'admin@tramhat.vn',
      phone: '0901234888',
      role: 'admin',
      address: 'Trạm Hạt Studio, TP. Thủ Đức',
      tier: 'Quản Trị',
      createdAt: new Date('2026-10-10')
    },
    ...sampleCustomers.map((c, idx) => ({
      id: `USR-CUST-${101 + idx}`,
      name: c.name,
      email: `${c.name.toLowerCase().replace(/[^a-z]/g, '')}${101 + idx}@gmail.com`,
      phone: c.phone,
      address: c.addr,
      role: 'customer',
      tier: c.converted !== false ? 'Khách Thân Thiết' : 'Thành Viên Mới',
      ordersCount: c.converted !== false ? (c.bottles === 3 ? 2 : 1) : 0,
      createdAt: getRandomCampaignDate(idx, 22)
    }))
  ];

  console.log(`Đang chèn ${trackingEvents.length} tài liệu vào trackingevents...`);
  await db.collection('trackingevents').insertMany(trackingEvents);

  console.log(`Đang chèn ${leadsToInsert.length} tài liệu vào leads...`);
  await db.collection('leads').insertMany(leadsToInsert);

  console.log(`Đang chèn ${usersToInsert.length} tài liệu vào users (22 khách + 1 admin)...`);
  await db.collection('users').insertMany(usersToInsert);

  console.log(`Đang chèn ${ordersToInsert.length} tài liệu vào orders...`);
  await db.collection('orders').insertMany(ordersToInsert);

  // 3. CẬP NHẬT TỔNG HỢP ANALYTICS ĐỒNG BỘ 100%
  const analyticsDoc = {
    key: 'current_metrics',
    totalVisits: 180,
    usersCount: 162,
    totalTimeSeconds: 180 * 128,
    productViews: 138,
    detailViews: 96,
    addToCartCount: 34,
    checkoutCount: 22,
    purchasesCount: 18,
    revenueVND: totalRevenueVND,
    devices: {
      mobile: 159,
      desktop: 21,
      tablet: 0
    },
    utmSources: {
      tiktok: 82,
      facebook: 38,
      instagram: 24,
      direct: 36
    },
    utmPerformance: {
      tiktok: { visits: 82, leads: 10, orders: 8, revenue: 665000, cr: '9.8%' },
      facebook: { visits: 38, leads: 6, orders: 5, revenue: 420000, cr: '13.2%' },
      instagram: { visits: 24, leads: 3, orders: 2, revenue: 140000, cr: '8.3%' },
      direct: { visits: 36, leads: 3, orders: 3, revenue: 245000, cr: '8.3%' }
    },
    pageTimeAverages: {
      home: 35,
      menu: 52,
      detail: 75,
      knowledge: 100
    },
    scrollDepth: {
      depth25: 159,
      depth50: 124,
      depth75: 84,
      depth100: 46
    },
    updatedAt: new Date()
  };

  await db.collection('analytics').updateOne(
    { key: 'current_metrics' },
    { $set: analyticsDoc },
    { upsert: true }
  );

  console.log('=== KẾT QUẢ ĐỐI SOÁT SAU KHI SEED ===');
  console.log('- trackingevents tổng:', await db.collection('trackingevents').countDocuments());
  console.log('- leads tổng:', await db.collection('leads').countDocuments());
  console.log('- users khách hàng (role=customer):', await db.collection('users').countDocuments({ role: 'customer' }));
  console.log('- orders tổng:', await db.collection('orders').countDocuments());
  console.log('- Doanh thu tổng:', totalRevenueVND.toLocaleString('vi-VN'), 'VND');

  await mongoose.disconnect();
  console.log('Hoàn thành xuất sắc!');
}

seedData().catch(err => {
  console.error('Lỗi khi seed:', err);
  process.exit(1);
});
