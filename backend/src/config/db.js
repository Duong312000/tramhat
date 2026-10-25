const mongoose = require('mongoose');

let mongodInstance = null;

const connectDB = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/tramhat_db';

  try {
    console.log(`[Database] Đang kết nối tới Database Server tại: ${uri}...`);
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 4000,
    });
    console.log(`✅ [Database] Đã kết nối thành công Database Server: ${conn.connection.host}:${conn.connection.port}/${conn.connection.name}`);
    return conn;
  } catch (err) {
    console.warn(`⚠️ [Database Cảnh báo] Chưa thấy Database Server độc lập chạy tại ${uri} (${err.message}).`);
    console.log('💡 [Database Gợi ý] Hãy khởi động Database Server độc lập bằng lệnh: npm run start:database (hoặc cd database && npm start).');
    console.log('[Database Tự động] Đang kích hoạt máy chủ cơ sở dữ liệu tạm thời để bạn không bị gián đoạn công việc...');

    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongodInstance = await MongoMemoryServer.create({
        instance: { dbName: 'tramhat_db' }
      });
      const memUri = mongodInstance.getUri();
      const conn = await mongoose.connect(memUri);
      console.log(`✅ [Database Tạm thời] Cơ sở dữ liệu đang chạy tại: ${memUri}`);
      return conn;
    } catch (memErr) {
      console.error('❌ [Database Lỗi nghiêm trọng]:', memErr.message);
      process.exit(1);
    }
  }
};

const disconnectDB = async () => {
  await mongoose.disconnect();
  if (mongodInstance) {
    await mongodInstance.stop();
  }
};

module.exports = { connectDB, disconnectDB };
