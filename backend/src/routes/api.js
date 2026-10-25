const express = require('express');
const router = express.Router();

const productsController = require('../controllers/productsController');
const ordersController = require('../controllers/ordersController');
const usersController = require('../controllers/usersController');
const otherControllers = require('../controllers/otherControllers');
const trackingController = require('../controllers/trackingController');
const Lead = require('../models/Lead');

// --- UNIFIED DATA ---
router.get('/all', otherControllers.getAllData);

// --- PRODUCTS ---
router.get('/products', productsController.getAllProducts);
router.get('/products/:id', productsController.getProductById);
router.post('/products', productsController.createProduct);
router.put('/products/:id', productsController.updateProduct);
router.delete('/products/:id', productsController.deleteProduct);

// --- ORDERS ---
router.get('/orders', ordersController.getAllOrders);
router.post('/orders', ordersController.createOrder);
router.put('/orders/:id/status', ordersController.updateOrderStatus);

// --- USERS ---
router.get('/users', usersController.getAllUsers);
router.post('/users/login', usersController.login);
router.post('/users/register', usersController.register);
router.put('/users/:id', usersController.updateProfile);

// --- REVIEWS ---
router.get('/reviews', otherControllers.getAllReviews);
router.post('/reviews', otherControllers.createReview);

// --- ARTICLES ---
router.get('/articles', otherControllers.getAllArticles);
router.get('/articles/:id', otherControllers.getArticleById);
router.post('/articles', otherControllers.createArticle);

// --- CHUYÊN SÂU: TRACKING VI MÔ & PHÂN TÍCH TIẾP THỊ (MARKETING ENGINE) ---
// 1. Ghi nhận sự kiện vi mô theo thời gian thực (page_view, scroll, click, time)
router.post('/tracking/event', trackingController.recordEvent);
router.post('/tracking/batch', trackingController.recordBatchEvents);

// 2. Khách hàng tiềm năng & Tối ưu Response SLA (Leads)
router.post('/leads', trackingController.createLead);
router.put('/leads/:leadId/respond', trackingController.respondToLead);
router.get('/leads', async (req, res) => {
  try {
    const leads = await Lead.find().sort({ createdAt: -1 });
    res.json(leads);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 3. Phễu chuyển đổi bán hàng 5 tầng (Digital Sales Funnel: Awareness -> Interest -> Consideration -> Leads -> Sales)
router.get('/analytics/funnel', trackingController.getFunnelMetrics);

// 4. Bảng tính điểm 100 điểm KPI & Đánh giá chiến dịch (Campaign Scorecard)
router.get('/analytics/scorecard', trackingController.getScorecard);

// 5. Phân tích lưu lượng theo nguồn chiến dịch (UTM Sources: TikTok, Facebook, Instagram)
router.get('/analytics/utm', trackingController.getUTMAnalysis);

// 6. Phân tích mức độ quan tâm của 6 vị sữa hạt (Flavor Analytics)
router.get('/analytics/flavors', trackingController.getFlavorPopularity);

// --- TỔNG HỢP ANALYTICS & CONTENT CŨ (TƯƠNG THÍCH NGƯỢC) ---
router.get('/analytics', otherControllers.getAnalytics);
router.post('/analytics/track', otherControllers.trackEvent);
router.get('/content', otherControllers.getContent);
router.put('/content', otherControllers.updateContent);

module.exports = router;
