const path = require('path');
const fs = require('fs');

// Lấy module MongoMemoryServer từ backend/node_modules
const { MongoMemoryServer } = require(path.resolve(__dirname, '../backend/node_modules/mongodb-memory-server'));

const PORT = 27017;
const DB_NAME = 'tramhat_db';
const STORAGE_DIR = path.resolve(__dirname, 'storage');

// Đảm bảo thư mục lưu trữ persistent tồn tại
if (!fs.existsSync(STORAGE_DIR)) {
  fs.mkdirSync(STORAGE_DIR, { recursive: true });
}

let mongodServer = null;

async function startDatabaseServer() {
  console.log('===============================================================');
  console.log('🍃 [DATABASE SERVER] Đang khởi động máy chủ MongoDB độc lập...');
  console.log('🚫 [NO DOCKER] Chạy Native trực tiếp trên hệ điều hành (Port 27017)');
  console.log(`💾 [STORAGE] Dữ liệu được lưu trữ tại: ${STORAGE_DIR}`);
  console.log('===============================================================');

  try {
    mongodServer = await MongoMemoryServer.create({
      instance: {
        port: PORT,
        dbName: DB_NAME,
        dbPath: STORAGE_DIR,
        storageEngine: 'wiredTiger' // Lưu trữ bền vững xuống đĩa
      }
    });

    const uri = mongodServer.getUri();
    console.log(`✅ [DATABASE SERVER ONLINE] Sẵn sàng tại: ${uri}${DB_NAME}`);
    console.log('📡 [KẾT NỐI] Backend kết nối trực tiếp qua: mongodb://127.0.0.1:27017/tramhat_db');
    console.log('📌 Nhấn Ctrl + C để dừng máy chủ cơ sở dữ liệu an toàn.');

    // Tự động kiểm tra và seed dữ liệu khởi tạo nếu database mới tinh
    try {
      const { autoSeedIfEmpty } = require(path.resolve(__dirname, '../backend/src/seeds/seed'));
      const mongoose = require(path.resolve(__dirname, '../backend/node_modules/mongoose'));
      
      const conn = await mongoose.connect(`mongodb://127.0.0.1:${PORT}/${DB_NAME}`);
      await autoSeedIfEmpty();
      await mongoose.disconnect();
    } catch (seedErr) {
      // Bỏ qua nếu backend seed chưa sẵn sàng
    }

  } catch (err) {
    if (err.message.includes('EADDRINUSE')) {
      console.log(`ℹ️ [THÔNG BÁO] Cổng ${PORT} đã có một tiến trình MongoDB đang chạy.`);
      console.log('Backend có thể kết nối trực tiếp ngay bây giờ!');
    } else {
      console.error('❌ [DATABASE LỖI]:', err.message);
      process.exit(1);
    }
  }
}

// Xử lý tắt máy chủ an toàn (Graceful Shutdown)
process.on('SIGINT', async () => {
  console.log('\n🛑 [DATABASE SERVER] Đang lưu trữ và tắt máy chủ an toàn...');
  if (mongodServer) {
    await mongodServer.stop();
  }
  console.log('👋 [DATABASE SERVER] Đã tắt thành công.');
  process.exit(0);
});

startDatabaseServer();
