require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const { connectDB } = require('./config/db');
const apiRoutes = require('./routes/api');
const { autoSeedIfEmpty } = require('./seeds/seed');

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Đảm bảo mã hóa UTF-8 tuyệt đối cho tiếng Việt
app.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  next();
});

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'online',
    system: 'TRẠM HẠT® - REST API Server',
    database: 'MongoDB',
    timestamp: new Date().toISOString()
  });
});

// Main API Routes
app.use('/api', apiRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Endpoint ${req.originalUrl} không tồn tại trên server.` });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('[Server Lỗi]', err.stack);
  res.status(500).json({ success: false, message: 'Đã xảy ra lỗi nội bộ trên máy chủ.', error: err.message });
});

// Khởi chạy server và kết nối Database Server
const startServer = async () => {
  try {
    await connectDB();
    // Tự động seed dữ liệu nếu DB đang trống
    await autoSeedIfEmpty();

    app.listen(PORT, '0.0.0.0', () => {
      console.log('====================================================');
      console.log(`🚀 [BACKEND SERVER] Đang chạy tại cổng: ${PORT}`);
      console.log(`📡 [API ENDPOINTS]  /api/all`);
      console.log(`🩺 [HEALTH CHECK]   /health`);
      console.log('====================================================');
    });
  } catch (err) {
    console.error('[Server Không thể khởi động]:', err);
    process.exit(1);
  }
};

startServer();

module.exports = app;
