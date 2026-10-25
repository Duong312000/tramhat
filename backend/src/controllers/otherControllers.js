const Review = require('../models/Review');
const Article = require('../models/Article');
const Analytics = require('../models/Analytics');
const Content = require('../models/Content');
const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');

// --- REVIEWS ---
exports.getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find().sort({ id: 1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createReview = async (req, res) => {
  try {
    const count = await Review.countDocuments();
    const review = new Review({ ...req.body, id: count + 1 });
    const saved = await review.save();
    res.status(201).json({ success: true, data: saved });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// --- ARTICLES ---
exports.getAllArticles = async (req, res) => {
  try {
    const articles = await Article.find().sort({ createdAt: -1 });
    res.json(articles);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getArticleById = async (req, res) => {
  try {
    const article = await Article.findOne({ id: req.params.id });
    if (!article) return res.status(404).json({ success: false, message: 'Không tìm thấy bài viết' });
    res.json(article);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createArticle = async (req, res) => {
  try {
    const article = new Article(req.body);
    const saved = await article.save();
    res.status(201).json({ success: true, data: saved });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// --- ANALYTICS ---
exports.getAnalytics = async (req, res) => {
  try {
    let analytics = await Analytics.findOne({ key: 'current_metrics' });
    if (!analytics) {
      analytics = await Analytics.create({ key: 'current_metrics' });
    }
    res.json(analytics);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.trackEvent = async (req, res) => {
  try {
    const { action, detail, tab, device } = req.body;
    let analytics = await Analytics.findOne({ key: 'current_metrics' });
    if (!analytics) {
      analytics = new Analytics({ key: 'current_metrics' });
    }

    // Tăng lượt truy cập chung
    analytics.totalVisits = (analytics.totalVisits || 0) + 1;

    // Cập nhật sự kiện mới
    const eventTime = new Date().toLocaleTimeString('vi-VN');
    analytics.events.unshift({ time: eventTime, action, detail, tab, device: device || 'Web' });

    if (analytics.events.length > 50) {
      analytics.events = analytics.events.slice(0, 50);
    }

    await analytics.save();
    res.json({ success: true, analytics });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// --- CONTENT ---
exports.getContent = async (req, res) => {
  try {
    const content = await Content.findOne({ key: 'site_content' });
    res.json(content || {});
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateContent = async (req, res) => {
  try {
    const content = await Content.findOneAndUpdate(
      { key: 'site_content' },
      req.body,
      { new: true, upsert: true }
    );
    res.json({ success: true, data: content });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// --- TẤT CẢ DỮ LIỆU TẬP TRUNG (UNIFIED TRAMHAT_DATA) ---
exports.getAllData = async (req, res) => {
  try {
    const [products, content, analytics, orders, reviews, users, articles] = await Promise.all([
      Product.find().sort({ num: 1 }),
      Content.findOne({ key: 'site_content' }),
      Analytics.findOne({ key: 'current_metrics' }),
      Order.find().sort({ createdAt: -1 }),
      Review.find().sort({ id: 1 }),
      User.find().select('-password'),
      Article.find().sort({ createdAt: -1 })
    ]);

    res.json({
      products: products || [],
      content: content || {},
      analytics: analytics || {},
      orders: orders || [],
      reviews: reviews || [],
      users: users || [],
      articles: articles || []
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
