const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');
const Review = require('../models/Review');
const Article = require('../models/Article');
const Analytics = require('../models/Analytics');
const Content = require('../models/Content');
const TrackingEvent = require('../models/TrackingEvent');
const Lead = require('../models/Lead');
const CampaignMetric = require('../models/CampaignMetric');

const dataDir = path.resolve(__dirname, '../../../database/seeds/data');

const loadJSON = (filename) => {
  try {
    const filePath = path.join(dataDir, filename);
    if (!fs.existsSync(filePath)) {
      console.warn(`[Seed Warning] Không tìm thấy file: ${filePath}`);
      return null;
    }
    const raw = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error(`[Seed Lỗi] Đọc ${filename}:`, err.message);
    return null;
  }
};

const seedDatabase = async () => {
  console.log('[Seed] Bắt đầu đồng bộ dữ liệu vào Database Server (MongoDB)...');

  try {
    const productsData = loadJSON('products.json');
    const ordersData = loadJSON('orders.json');
    const usersData = loadJSON('users.json');
    const reviewsData = loadJSON('reviews.json');
    const articlesData = loadJSON('articles.json');
    const analyticsData = loadJSON('analytics.json');
    const contentData = loadJSON('content.json');

    if (productsData && Array.isArray(productsData)) {
      await Product.deleteMany({});
      await Product.insertMany(productsData);
      console.log(`[Seed Thành công] Đã nạp ${productsData.length} sản phẩm.`);
    }

    if (ordersData && Array.isArray(ordersData)) {
      await Order.deleteMany({});
      await Order.insertMany(ordersData);
      console.log(`[Seed Thành công] Đã nạp ${ordersData.length} đơn hàng.`);
    }

    if (usersData && Array.isArray(usersData)) {
      await User.deleteMany({});
      await User.insertMany(usersData);
      console.log(`[Seed Thành công] Đã nạp ${usersData.length} tài khoản.`);
    }

    if (reviewsData && Array.isArray(reviewsData)) {
      await Review.deleteMany({});
      await Review.insertMany(reviewsData);
      console.log(`[Seed Thành công] Đã nạp ${reviewsData.length} đánh giá.`);
    }

    if (articlesData && Array.isArray(articlesData)) {
      await Article.deleteMany({});
      await Article.insertMany(articlesData);
      console.log(`[Seed Thành công] Đã nạp ${articlesData.length} bài viết.`);
    }

    if (analyticsData) {
      await Analytics.deleteMany({});
      await Analytics.create({ key: 'current_metrics', ...analyticsData });
      console.log(`[Seed Thành công] Đã nạp cấu hình Analytics.`);
    }

    if (contentData) {
      await Content.deleteMany({});
      await Content.create({ key: 'site_content', ...contentData });
      console.log(`[Seed Thành công] Đã nạp cấu hình Nội dung (Content).`);
    }

    // 1. SEED CAMPAIGN METRICS (Kế hoạch 8 tuần theo Đề án)
    await CampaignMetric.deleteMany({});
    await CampaignMetric.create({
      campaignName: 'Ghé Trạm Có Chuyện',
      durationWeeks: 8,
      budgetApproved: 4000000,
      adSpendActual: 2000000,
      productionCostActual: 500000,
      toolsCostActual: 300000,
      sampleCostActual: 600000,
      tiktokVideoCount: 16,
      tiktokViews: 8450,       // Đạt mục tiêu >= 8.000 views
      tiktokLikes: 245,
      tiktokComments: 58,
      tiktokShares: 39,
      tiktokCompletionViews: 880, // VCR = 10.4%
      metaImpressions: 12500,
      metaReach: 7800,
      metaClicks: 320
    });
    console.log('[Seed Thành công] Đã nạp thông số chiến dịch Ghé Trạm Có Chuyện.');

    // 2. SEED QUALIFIED LEADS (Đáp ứng chỉ tiêu Response SLA & Data Completeness)
    await Lead.deleteMany({});
    const sampleLeads = [
      {
        leadId: '#LEAD-8801',
        customerName: 'Nguyễn Thị Thu Hà',
        phone: '0912.888.777',
        channel: 'TikTok Inbox',
        utmSource: 'tiktok',
        interestedProduct: 'Sữa Điều Tự Nhiên Bình Phước',
        inquiryContent: 'Tư vấn giúp mình gói sữa giao sáng mỗi ngày tại Q.1',
        isQualified: true,
        status: 'Converted_Order',
        receivedAt: new Date(Date.now() - 3600000 * 24),
        firstRespondedAt: new Date(Date.now() - 3600000 * 23),
        responseTimeMinutes: 60,
        respondedWithin4Hours: true,
        hasFullData: true
      },
      {
        leadId: '#LEAD-8802',
        customerName: 'Trần Quốc Bảo',
        phone: '0988.123.456',
        channel: 'Messenger',
        utmSource: 'facebook',
        interestedProduct: 'Hạnh Nhân Cacao Đắk Lắk',
        inquiryContent: 'Cho mình hỏi sữa này có đường không, hạn dùng mấy ngày?',
        isQualified: true,
        status: 'Converted_Order',
        receivedAt: new Date(Date.now() - 3600000 * 20),
        firstRespondedAt: new Date(Date.now() - 3600000 * 19.5),
        responseTimeMinutes: 30,
        respondedWithin4Hours: true,
        hasFullData: true
      },
      {
        leadId: '#LEAD-8803',
        customerName: 'Lê Thùy Dương',
        phone: '0903.111.222',
        channel: 'Website Form',
        utmSource: 'direct',
        interestedProduct: 'Sữa Óc Chó Mè Đen',
        inquiryContent: 'Văn phòng mình ở Landmark 81 muốn đặt 10 chai chiều nay có kịp không?',
        isQualified: true,
        status: 'Qualified',
        receivedAt: new Date(Date.now() - 3600000 * 10),
        firstRespondedAt: new Date(Date.now() - 3600000 * 9),
        responseTimeMinutes: 60,
        respondedWithin4Hours: true,
        hasFullData: true
      },
      {
        leadId: '#LEAD-8804',
        customerName: 'Phạm Văn Nam',
        phone: '0938.444.555',
        channel: 'Zalo Chat',
        utmSource: 'instagram',
        interestedProduct: 'Sữa Macca Yến Mạch',
        inquiryContent: 'Sữa này uống trước khi tập gym 30 phút được không shop?',
        isQualified: true,
        status: 'Contacted',
        receivedAt: new Date(Date.now() - 3600000 * 5),
        firstRespondedAt: new Date(Date.now() - 3600000 * 4.2),
        responseTimeMinutes: 48,
        respondedWithin4Hours: true,
        hasFullData: true
      },
      {
        leadId: '#LEAD-8805',
        customerName: 'Hoàng Hải Yến',
        phone: '0977.889.900',
        channel: 'Website Form',
        utmSource: 'tiktok',
        interestedProduct: 'Sữa Hạt Sen Lá Dứa',
        inquiryContent: 'Mình hay mất ngủ, tư vấn giúp mình vị hạt sen lá dứa nhé',
        isQualified: true,
        status: 'New',
        receivedAt: new Date(Date.now() - 3600000 * 1),
        hasFullData: true
      }
    ];
    await Lead.insertMany(sampleLeads);
    console.log(`[Seed Thành công] Đã nạp ${sampleLeads.length} Qualified Leads mẫu.`);

    // 3. SEED TRACKING SESSIONS & EVENTS (Tầng 1-3 phễu chuyển đổi)
    await TrackingEvent.deleteMany({});
    const events = [];
    const sources = ['tiktok', 'facebook', 'instagram', 'direct'];
    const flavors = [
      { id: 'cashew', name: 'Sữa Điều Tự Nhiên Bình Phước' },
      { id: 'walnut', name: 'Óc Chó Mè Đen Rang Mộc' },
      { id: 'almond', name: 'Hạnh Nhân Cacao Đắk Lắk' },
      { id: 'macca', name: 'Macca Yến Mạch Tươi Tây Nguyên' },
      { id: 'lotus', name: 'Hạt Sen Lá Dứa Đồng Tháp' },
      { id: 'redbean', name: 'Đậu Đỏ Hạt Sen Kỷ Tử Bổ Khí' }
    ];

    // Tạo 155 sessions phân bổ đa kênh
    for (let i = 1; i <= 155; i++) {
      const sId = `session_init_${1000 + i}`;
      const src = sources[i % sources.length];
      const flavor = flavors[i % flavors.length];

      // Page view
      events.push({
        sessionId: sId,
        eventType: 'page_view',
        page: '/',
        tab: 'home',
        utm: { source: src, medium: 'organic_social', campaign: 'ghe_tram_co_chuyen' },
        device: { deviceType: i % 3 === 0 ? 'Desktop' : 'Mobile' },
        createdAt: new Date(Date.now() - (155 - i) * 3600000)
      });

      // Product view
      if (i % 2 === 0) {
        events.push({
          sessionId: sId,
          eventType: 'product_view',
          page: '/#menu',
          tab: 'menu',
          productId: flavor.id,
          productName: flavor.name,
          utm: { source: src, campaign: 'ghe_tram_co_chuyen' }
        });
      }

      // Scroll depth 50% & 100%
      if (i % 3 === 0) {
        events.push({
          sessionId: sId,
          eventType: 'scroll_depth',
          scrollPercentage: 50,
          utm: { source: src, campaign: 'ghe_tram_co_chuyen' }
        });
      }

      // Add to cart
      if (i % 4 === 0) {
        events.push({
          sessionId: sId,
          eventType: 'add_to_cart',
          productId: flavor.id,
          productName: flavor.name,
          utm: { source: src, campaign: 'ghe_tram_co_chuyen' }
        });
      }
    }

    await TrackingEvent.insertMany(events);
    console.log(`[Seed Thành công] Đã nạp ${events.length} sự kiện tracking vi mô (155 phiên truy cập).`);

    console.log('[Seed Hoàn tất] Toàn bộ dữ liệu đo lường tiếp thị đã sẵn sàng trong MongoDB!');
  } catch (err) {
    console.error('[Seed Thất bại]:', err.message);
  }
};

const autoSeedIfEmpty = async () => {
  try {
    const count = await Product.countDocuments();
    if (count === 0) {
      console.log('[Database Thông báo] Database hiện chưa có dữ liệu. Đang tự động nạp dữ liệu khởi tạo...');
      await seedDatabase();
    }
  } catch (err) {
    console.warn('[AutoSeed Cảnh báo]:', err.message);
  }
};

if (require.main === module) {
  require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
  const { connectDB, disconnectDB } = require('../config/db');

  (async () => {
    await connectDB();
    await seedDatabase();
    await disconnectDB();
    process.exit(0);
  })();
}

module.exports = { seedDatabase, autoSeedIfEmpty };
