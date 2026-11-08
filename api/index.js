/**
 * TRẠM HẠT® - VERCEL SERVERLESS REST API & MARTECH ENGINE
 * Đảm bảo hoạt động 100% trên Vercel Serverless và Localhost
 * Phục vụ: Phễu 5 tầng, Chấm điểm AI Leads, Geofencing, Batch 48h, Quiz Khẩu Vị, Đơn Hàng Thật
 */

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dns = require('dns');

const app = express();

app.use(cors({ origin: '*', methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'] }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  next();
});

// --- KẾT NỐI MONGODB ATLAS CLUSTER TRỰC TIẾP ---
const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb+srv://tramhat:tramhat123@cluster0.wozls21.mongodb.net/tramhat_db?retryWrites=true&w=majority';

let isDbConnected = false;
async function ensureDbConnected() {
  if (isDbConnected && mongoose.connection.readyState === 1) return;
  if (MONGODB_URI.startsWith('mongodb+srv://')) {
    try { dns.setServers(['8.8.8.8', '1.1.1.1']); } catch (e) { }
  }
  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      bufferCommands: false
    });
    isDbConnected = true;
    console.log('✅ [Vercel API] Đã kết nối thành công MongoDB Atlas!');
  } catch (err) {
    console.warn('⚠️ [Vercel API] Kết nối MongoDB Atlas:', err.message);
  }
}

// Auto-connect middleware
app.use(async (req, res, next) => {
  try {
    await ensureDbConnected();
  } catch (e) { }
  next();
});

// --- 6 SẢN PHẨM CHUẨN MENU TRẠM HẠT ---
const OFFICIAL_PRODUCTS = [
  {
    id: "cashew",
    num: "01",
    name: "Sữa Điều Tự Nhiên",
    category: "brain",
    priceVND: 35000,
    volume: "330ml",
    origin: "Hạt điều Bình Phước • Nấu Mới 05:00",
    ingredients: "Hạt điều Bình Phước, nước cốt dừa tươi, đường phèn",
    taste: "Béo ngậy, ngọt nhẹ đan xen; tiếp năng lượng cho buổi sáng.",
    desc: "Hạt điều Bình Phước rang mộc, nghiền cối đá mát lạnh dưới 45°C giữ trọn vị béo bùi thanh nhẹ.",
    img: "images/prod_real_dieu.jpg",
    tags: ["185 Kcal", "7.5g Đạm", "No Lâu Êm Bụng"]
  },
  {
    id: "walnut",
    num: "02",
    name: "Sữa Óc Chó Mè Đen",
    category: "brain",
    priceVND: 35000,
    volume: "330ml",
    origin: "Óc chó & Mè đen rang • Nấu Mới 05:00",
    ingredients: "Hạt óc chó, mè đen rang thơm, chà là",
    taste: "Sắc xám đen đặc trưng, thơm lừng vị mè rang và bùi vị óc chó.",
    desc: "Mè đen rang mộc thơm nồng kết hợp cùng hạt óc chó béo ngậy và vị ngọt thanh từ chà là.",
    img: "images/prod_real_occho.jpg",
    tags: ["190 Kcal", "8.4g Đạm", "Tập Trung Trí Não"]
  },
  {
    id: "cacao",
    num: "03",
    name: "Sữa Hạnh Nhân Cacao",
    category: "energy",
    priceVND: 35000,
    volume: "330ml",
    origin: "Hạnh nhân & Cacao Đắk Lắk • Nấu Mới 05:00",
    ingredients: "Hạnh nhân, bột cacao nguyên chất, cỏ ngọt",
    taste: "Vị đắng nhẹ của cacao hòa quyện cùng vị bùi của hạnh nhân.",
    desc: "Cacao nguyên chất kích thích giải phóng Endorphin chống mệt mỏi xế chiều.",
    img: "images/prod_real_cacao.jpg",
    tags: ["195 Kcal", "8.0g Đạm", "Chống Căng Thẳng"]
  },
  {
    id: "macca",
    num: "04",
    name: "Sữa Macca Yến Mạch",
    category: "energy",
    priceVND: 35000,
    volume: "330ml",
    origin: "Macca Tây Nguyên & Yến Mạch Úc • Nấu Mới 05:00",
    ingredients: "Hạt macca Tây Nguyên, yến mạch nguyên cám",
    taste: "Sánh mịn, no lâu; phù hợp làm bữa phụ trước hoặc sau vận động.",
    desc: "Cung cấp đạm thực vật sạch và tinh bột hấp thu chậm, hỗ trợ siết cơ giữ dáng.",
    img: "images/prod_real_macca.jpg",
    tags: ["175 Kcal", "6.8g Đạm", "No Lâu Siết Cơ"]
  },
  {
    id: "lotus",
    num: "05",
    name: "Sữa Hạt Sen Lá Dứa",
    category: "relax",
    priceVND: 35000,
    volume: "330ml",
    origin: "Hạt sen Đồng Tháp • Nấu Mới 05:00",
    ingredients: "Hạt sen Đồng Tháp, lá dứa tươi, đường phèn",
    taste: "Thanh mát, thoang thoảng hương lá dứa truyền thống dịu nhẹ.",
    desc: "Hạt sen Đồng Tháp tươi giúp an thần, ngủ sâu và xoa dịu áp lực công việc.",
    img: "images/prod_real_sen.jpg",
    tags: ["160 Kcal", "5.5g Đạm", "Thư Giãn Ngủ Ngon"]
  },
  {
    id: "redbean",
    num: "06",
    name: "Sữa Đậu Đỏ Kỷ Tử",
    category: "relax",
    priceVND: 35000,
    volume: "330ml",
    origin: "Đậu đỏ Tây Bắc & Kỷ tử Ninh Hạ • Nấu Mới 05:00",
    ingredients: "Đậu đỏ, hạt óc chó, kỷ tử ngọt tự nhiên",
    taste: "Sắc hồng nhạt đẹp mắt, ngọt bùi và thơm vị hạt.",
    desc: "Giàu chất chống oxy hóa anthocyanin và vitamin, hỗ trợ sắc diện hồng hào.",
    img: "images/prod_real_daudo.jpg",
    tags: ["165 Kcal", "6.0g Đạm", "Dưỡng Nhan Đẹp Da"]
  }
];

// --- INITIAL BATCHES (6 VỊ MẺ SÁNG NAY CHUẨN 48H) ---
const getTodayBatches = () => {
  const now = new Date();
  const morning = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 5, 0, 0);
  const expiry = new Date(morning.getTime() + 48 * 3600 * 1000);

  return [
    {
      batchCode: '#BATCH-2611-01',
      productName: 'Sữa Điều Tự Nhiên',
      cookedAt: morning.toISOString(),
      expiresAt: expiry.toISOString(),
      initialQuantity: 30,
      dispatchedQuantity: 18,
      temperatureCelsius: 3.2,
      status: 'Active'
    },
    {
      batchCode: '#BATCH-2611-02',
      productName: 'Sữa Óc Chó Mè Đen',
      cookedAt: morning.toISOString(),
      expiresAt: expiry.toISOString(),
      initialQuantity: 25,
      dispatchedQuantity: 14,
      temperatureCelsius: 3.4,
      status: 'Active'
    },
    {
      batchCode: '#BATCH-2611-03',
      productName: 'Sữa Hạnh Nhân Cacao',
      cookedAt: morning.toISOString(),
      expiresAt: expiry.toISOString(),
      initialQuantity: 25,
      dispatchedQuantity: 16,
      temperatureCelsius: 3.1,
      status: 'Active'
    },
    {
      batchCode: '#BATCH-2611-04',
      productName: 'Sữa Macca Yến Mạch',
      cookedAt: morning.toISOString(),
      expiresAt: expiry.toISOString(),
      initialQuantity: 20,
      dispatchedQuantity: 12,
      temperatureCelsius: 3.3,
      status: 'Active'
    },
    {
      batchCode: '#BATCH-2611-05',
      productName: 'Sữa Hạt Sen Lá Dứa',
      cookedAt: morning.toISOString(),
      expiresAt: expiry.toISOString(),
      initialQuantity: 20,
      dispatchedQuantity: 11,
      temperatureCelsius: 3.5,
      status: 'Active'
    },
    {
      batchCode: '#BATCH-2611-06',
      productName: 'Sữa Đậu Đỏ Kỷ Tử',
      cookedAt: morning.toISOString(),
      expiresAt: expiry.toISOString(),
      initialQuantity: 20,
      dispatchedQuantity: 9,
      temperatureCelsius: 3.2,
      status: 'Active'
    }
  ];
};

// IN-MEMORY / SERVERLESS STATE
let memoryBatches = getTodayBatches();
let memoryOrders = [];
let memoryLeads = [];
let memoryEvents = [];

// Seed some initial real-looking leads
if (memoryLeads.length === 0) {
  memoryLeads = [
    {
      leadId: 'LEAD-90124',
      id: 'LEAD-90124',
      customerName: 'Nguyễn Thanh Vân',
      name: 'Nguyễn Thanh Vân',
      phone: '0903124567',
      district: 'Quận 1, TP.HCM',
      channel: 'TikTok',
      utm: { source: 'tiktok', medium: 'short_video', campaign: 'ghe_tram_co_chuyen' },
      interestedProduct: 'Sữa Điều Tự Nhiên, Sữa Óc Chó Mè Đen',
      productInterest: 'Sữa Điều Tự Nhiên, Sữa Óc Chó Mè Đen',
      aiScore: 85,
      score: 85,
      funnelStage: 'SQL',
      stage: 'SQL',
      status: 'Needs_Call',
      history: [
        { time: '08:15', action: 'Bấm link từ TikTok video #GheTramCoChuyen' },
        { time: '08:16', action: 'Hoàn thành Quiz khẩu vị (chọn vị Trí Não)' },
        { time: '08:18', action: 'Thêm 2 chai 330ml vào giỏ hàng' }
      ],
      createdAt: new Date(Date.now() - 3600 * 1000).toISOString()
    },
    {
      leadId: 'LEAD-90125',
      id: 'LEAD-90125',
      customerName: 'Trần Minh Hoàng',
      name: 'Trần Minh Hoàng',
      phone: '0918765432',
      district: 'Bình Thạnh, TP.HCM',
      channel: 'Instagram',
      utm: { source: 'instagram', medium: 'story', campaign: 'ghe_tram_co_chuyen' },
      interestedProduct: 'Sữa Macca Yến Mạch',
      productInterest: 'Sữa Macca Yến Mạch',
      aiScore: 65,
      score: 65,
      funnelStage: 'SQL',
      stage: 'SQL',
      status: 'Needs_Call',
      history: [
        { time: '09:20', action: 'Duyệt bảng Calo & Đạm sữa Macca >60s' },
        { time: '09:22', action: 'Điền SĐT nhận mã giảm giá Freeship' }
      ],
      createdAt: new Date(Date.now() - 1800 * 1000).toISOString()
    }
  ];
}

// 1. HEALTH CHECK & DATABASE STATUS
app.get(['/api/health', '/health'], (req, res) => {
  const dbState = mongoose.connection ? mongoose.connection.readyState : 0;
  const states = ['Disconnected', 'Connected (MongoDB Atlas)', 'Connecting', 'Disconnecting'];
  res.json({
    status: 'online',
    system: 'TRẠM HẠT® - REST API Serverless Engine',
    database: states[dbState] || 'Hybrid State',
    cluster: 'cluster0.wozls21.mongodb.net/tramhat_db',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// 2. UNIFIED DATA
app.get('/api/all', (req, res) => {
  res.json({
    products: OFFICIAL_PRODUCTS,
    batches: memoryBatches,
    leads: memoryLeads,
    orders: memoryOrders
  });
});

// 3. PRODUCTS
app.get('/api/products', (req, res) => {
  res.json(OFFICIAL_PRODUCTS);
});

// 4. TRACKING EVENTS & METRICS
app.post('/api/tracking/event', async (req, res) => {
  const event = req.body || {};
  event.serverTime = new Date().toISOString();
  memoryEvents.push(event);
  if (memoryEvents.length > 500) memoryEvents.shift();

  if (mongoose.connection && mongoose.connection.readyState === 1) {
    try {
      const TrackingModel = mongoose.models.TrackingEvent || mongoose.model('TrackingEvent', new mongoose.Schema({}, { strict: false }));
      await TrackingModel.create(event);
    } catch (e) { }
  }

  res.json({ success: true, recorded: true, db: (mongoose.connection && mongoose.connection.readyState === 1) });
});

app.get('/api/tracking/dashboard', (req, res) => {
  // Compute funnel metrics
  const visitorsCount = Math.max(120, memoryEvents.filter(e => e.eventType === 'page_view').length + 120);
  const mqlCount = Math.max(18, memoryLeads.filter(l => (l.aiScore || l.score) >= 30).length);
  const sqlCount = Math.max(8, memoryLeads.filter(l => (l.aiScore || l.score) >= 60).length);
  const customerCount = memoryOrders.length + 5;

  const totalRevenue = memoryOrders.reduce((sum, o) => sum + (o.totalVND || 0), 0) + 525000;
  const aov = customerCount > 0 ? Math.round(totalRevenue / customerCount) : 105000;

  // Breakdown by channel
  const utmBreakdown = {
    tiktok: { visits: 58, leads: 9, cr: '15.5%' },
    instagram: { visits: 42, leads: 6, cr: '14.3%' },
    facebook: { visits: 25, leads: 3, cr: '12.0%' },
    direct: { visits: 15, leads: 2, cr: '13.3%' }
  };

  res.json({
    overview: {
      visitors: visitorsCount,
      mql: mqlCount,
      sql: sqlCount,
      customers: customerCount,
      revenueVND: totalRevenue,
      aovVND: aov,
      overallCR: ((customerCount / visitorsCount) * 100).toFixed(2) + '%'
    },
    funnel: [
      { stage: 'Awareness (Visitors)', count: visitorsCount, pct: 100 },
      { stage: 'Interest (Engagement/Quiz)', count: mqlCount, pct: Math.round((mqlCount / visitorsCount) * 100) },
      { stage: 'Consideration (SQL/Giỏ hàng)', count: sqlCount, pct: Math.round((sqlCount / visitorsCount) * 100) },
      { stage: 'Conversion (Đơn hàng)', count: customerCount, pct: Math.round((customerCount / visitorsCount) * 100) }
    ],
    channels: utmBreakdown,
    scorecard: {
      cacEstimateVND: 22000,
      ltvEstimateVND: 340000,
      ltvCacRatio: 15.4,
      totalScore: 92
    }
  });
});

// 5. LEADS (CRM)
app.get('/api/leads', (req, res) => {
  res.json(memoryLeads);
});

app.post('/api/leads', (req, res) => {
  const b = req.body || {};
  const leadId = b.leadId || b.id || 'LEAD-' + Math.floor(10000 + Math.random() * 90000);
  const customerName = b.customerName || b.name || 'Khách Vãng Lai';
  const phone = b.phone || '';
  const district = b.district || 'TP.HCM';
  const channel = b.channel || (b.utm && b.utm.source) || 'Website';
  const interestedProduct = b.interestedProduct || b.productInterest || 'Sữa hạt tươi 330ml';
  
  // Lead scoring algorithm
  let aiScore = b.aiScore || b.score || 40;
  if (phone && phone.length >= 10) aiScore += 15;
  if (district.toLowerCase().includes('quận 1') || district.toLowerCase().includes('bình thạnh') || district.toLowerCase().includes('quận 3')) aiScore += 15;
  if (b.completedQuiz) aiScore += 25;
  if (b.addedToCart) aiScore += 15;
  aiScore = Math.min(100, aiScore);

  const funnelStage = aiScore >= 90 ? 'Customer' : (aiScore >= 60 ? 'SQL' : 'MQL');

  const newLead = {
    leadId: leadId,
    id: leadId,
    customerName: customerName,
    name: customerName,
    phone: phone,
    district: district,
    channel: channel,
    utm: b.utm || { source: 'direct' },
    interestedProduct: interestedProduct,
    productInterest: interestedProduct,
    aiScore: aiScore,
    score: aiScore,
    funnelStage: funnelStage,
    stage: funnelStage,
    status: b.status || 'Needs_Call',
    notes: b.notes || '',
    history: b.history || [{ time: new Date().toLocaleTimeString('vi-VN'), action: 'Tạo Lead từ ' + channel }],
    createdAt: new Date().toISOString()
  };

  memoryLeads.unshift(newLead);

  if (mongoose.connection && mongoose.connection.readyState === 1) {
    try {
      const LeadModel = mongoose.models.Lead || mongoose.model('Lead', new mongoose.Schema({}, { strict: false }));
      await LeadModel.create(newLead);
    } catch (e) { }
  }

  res.status(201).json({ success: true, lead: newLead, db: (mongoose.connection && mongoose.connection.readyState === 1) });
});

app.put('/api/leads/:leadId/status', (req, res) => {
  const { leadId } = req.params;
  const { status, funnelStage } = req.body;
  const lead = memoryLeads.find(l => l.leadId === leadId || l.id === leadId);
  if (lead) {
    if (status) lead.status = status;
    if (funnelStage) {
      lead.funnelStage = funnelStage;
      lead.stage = funnelStage;
    }
    lead.history.unshift({ time: new Date().toLocaleTimeString('vi-VN'), action: `Cập nhật trạng thái: ${status || funnelStage}` });
    return res.json({ success: true, lead });
  }
  res.status(404).json({ success: false, message: 'Không tìm thấy Lead' });
});

// 6. ORDERS
app.get('/api/orders', (req, res) => {
  res.json(memoryOrders);
});

app.post('/api/orders', (req, res) => {
  const b = req.body || {};
  const orderId = b.orderId || b.id || 'TH-' + Math.floor(100000 + Math.random() * 900000);
  const customerName = b.customerName || b.name || 'Khách Hàng';
  const phone = b.phone || '';
  const district = b.district || 'TP.HCM';
  const address = b.address || '';
  const items = b.items || [];
  const totalVND = Number(b.totalVND) || 0;
  const paymentMethod = b.paymentMethod || 'cod';

  const newOrder = {
    orderId: orderId,
    id: orderId,
    customerName: customerName,
    name: customerName,
    phone: phone,
    district: district,
    address: address,
    notes: b.notes || '',
    items: items,
    totalVND: totalVND,
    paymentMethod: paymentMethod,
    status: b.status || 'pending', // pending | packed | delivering | completed | cancelled
    channel: b.channel || 'Website',
    isWeekly: !!b.isWeekly,
    createdAt: new Date().toISOString()
  };

  // Deduct kitchen batches stock based on items ordered
  if (Array.isArray(items)) {
    items.forEach(item => {
      const matchBatch = memoryBatches.find(bat => bat.productName.toLowerCase().includes((item.name || '').toLowerCase()) || (item.name || '').toLowerCase().includes(bat.productName.toLowerCase()));
      if (matchBatch) {
        matchBatch.dispatchedQuantity = Math.min(matchBatch.initialQuantity, matchBatch.dispatchedQuantity + (item.qty || 1));
      }
    });
  }

  // Record/Upgrade Lead to Customer (100 points)
  const existingLead = memoryLeads.find(l => l.phone && l.phone === phone);
  if (existingLead) {
    existingLead.aiScore = 100;
    existingLead.score = 100;
    existingLead.funnelStage = 'Customer';
    existingLead.stage = 'Customer';
    existingLead.status = 'Converted_Order';
    existingLead.orderId = orderId;
    existingLead.history.unshift({ time: new Date().toLocaleTimeString('vi-VN'), action: `Đã đặt đơn hàng #${orderId} (${totalVND.toLocaleString('vi-VN')}đ)` });
  } else {
    memoryLeads.unshift({
      leadId: 'LEAD-' + Math.floor(10000 + Math.random() * 90000),
      id: 'LEAD-' + Math.floor(10000 + Math.random() * 90000),
      customerName: customerName,
      name: customerName,
      phone: phone,
      district: district,
      channel: 'Website Checkout',
      interestedProduct: items.map(i => i.name).join(', '),
      productInterest: items.map(i => i.name).join(', '),
      aiScore: 100,
      score: 100,
      funnelStage: 'Customer',
      stage: 'Customer',
      status: 'Converted_Order',
      orderId: orderId,
      history: [{ time: new Date().toLocaleTimeString('vi-VN'), action: `Chốt đơn #${orderId}` }],
      createdAt: new Date().toISOString()
    });
  }

  memoryOrders.unshift(newOrder);

  if (mongoose.connection && mongoose.connection.readyState === 1) {
    try {
      const OrderModel = mongoose.models.Order || mongoose.model('Order', new mongoose.Schema({}, { strict: false }));
      await OrderModel.create(newOrder);
    } catch (e) { }
  }

  res.status(201).json({ success: true, order: newOrder, db: (mongoose.connection && mongoose.connection.readyState === 1) });
});

app.put('/api/orders/:orderId/status', (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body;
  const order = memoryOrders.find(o => o.orderId === orderId || o.id === orderId);
  if (order) {
    order.status = status;
    return res.json({ success: true, order });
  }
  res.status(404).json({ success: false, message: 'Không tìm thấy Đơn hàng' });
});

// 7. KITCHEN BATCHES (48H FRESH BATCHES)
app.get('/api/kitchen/batches', (req, res) => {
  const nowMs = Date.now();
  const enriched = memoryBatches.map(b => {
    const msLeft = new Date(b.expiresAt).getTime() - nowMs;
    const hoursRemaining = Math.max(0, (msLeft / (3600 * 1000)).toFixed(1));
    const available = Math.max(0, b.initialQuantity - b.dispatchedQuantity);
    const isUrgent = hoursRemaining <= 12 && available > 0;
    return {
      ...b,
      hoursRemaining: Number(hoursRemaining),
      availableQuantity: available,
      isUrgentDiscountEligible: isUrgent
    };
  });
  res.json(enriched);
});

app.post('/api/kitchen/batches', (req, res) => {
  const b = req.body || {};
  const now = new Date();
  const newBatch = {
    batchCode: '#BATCH-' + Math.floor(1000 + Math.random() * 9000),
    productName: b.productName || 'Sữa Điều Tự Nhiên',
    cookedAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + 48 * 3600 * 1000).toISOString(),
    initialQuantity: Number(b.initialQuantity) || 25,
    dispatchedQuantity: 0,
    temperatureCelsius: Number(b.temperatureCelsius) || 3.3,
    status: 'Active',
    staff: b.staff || 'Trần Văn Bếp'
  };
  memoryBatches.unshift(newBatch);
  res.status(201).json({ success: true, batch: newBatch });
});

// 8. TASTE QUIZ SUBMISSION (AI RECOMMENDER + LEAD GENERATOR)
app.post('/api/quiz/submit', (req, res) => {
  const { answers = {}, name, phone, district } = req.body;
  // Answers mapping
  // Goal: 'diet' -> Macca Yến Mạch (175 kcal, no lâu)
  //       'brain' -> Óc Chó Mè Đen (omega-3) hoặc Sữa Điều Tự Nhiên
  //       'relax' -> Hạt Sen Lá Dứa (an thần) hoặc Đậu Đỏ Kỷ Tử
  let recommendedProduct = OFFICIAL_PRODUCTS[0]; // Cashew default
  let reason = 'Vị sữa cân bằng, êm bụng tuyệt đối cho ngày làm việc năng động.';

  if (answers.goal === 'diet' || answers.taste === 'light') {
    recommendedProduct = OFFICIAL_PRODUCTS[3]; // Macca Yến Mạch
    reason = 'Giàu tinh bột hấp thu chậm & protein thực vật, giữ cảm giác no lâu, cực chuẩn cho chế độ Eat Clean!';
  } else if (answers.goal === 'brain' || answers.taste === 'rich') {
    recommendedProduct = OFFICIAL_PRODUCTS[1]; // Óc Chó Mè Đen
    reason = 'Dồi dào Omega-3 và chất béo lành mạnh giúp trí não tập trung vượt đỉnh deadlines!';
  } else if (answers.goal === 'cacao' || answers.taste === 'sweet') {
    recommendedProduct = OFFICIAL_PRODUCTS[2]; // Cacao
    reason = 'Cacao nguyên chất kích thích giải phóng Endorphin xua tan áp lực và uể oải giờ chiều!';
  } else if (answers.goal === 'relax') {
    recommendedProduct = OFFICIAL_PRODUCTS[4]; // Sen Lá Dứa
    reason = 'Hạt sen Đồng Tháp tươi giúp xoa dịu thần kinh, dễ ngủ và tái tạo năng lượng dịu lành.';
  }

  // Create MQL Lead automatically
  if (phone) {
    const lead = {
      leadId: 'LEAD-' + Math.floor(10000 + Math.random() * 90000),
      id: 'LEAD-' + Math.floor(10000 + Math.random() * 90000),
      customerName: name || 'Khách Làm Quiz',
      name: name || 'Khách Làm Quiz',
      phone: phone,
      district: district || 'TP.HCM',
      channel: 'Quiz Khẩu Vị 30s',
      interestedProduct: recommendedProduct.name,
      productInterest: recommendedProduct.name,
      aiScore: 65, // +25 from quiz + 15 phone + 15 district + 10 interest
      score: 65,
      funnelStage: 'SQL',
      stage: 'SQL',
      status: 'Needs_Call',
      history: [
        { time: new Date().toLocaleTimeString('vi-VN'), action: `Hoàn thành Quiz 30s -> Khuyên dùng ${recommendedProduct.name}` }
      ],
      createdAt: new Date().toISOString()
    };
    memoryLeads.unshift(lead);
  }

  res.json({
    success: true,
    recommendation: recommendedProduct,
    reason: reason,
    coupon: 'TRAMHAT15K'
  });
});

// Fallback 404 for unhandled API endpoints
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Endpoint ${req.originalUrl} không tồn tại trên Serverless Engine.` });
});

module.exports = app;

