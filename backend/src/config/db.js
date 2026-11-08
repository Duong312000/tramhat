const mongoose = require('mongoose');
const dns = require('dns');

let mongodInstance = null;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb+srv://tramhat:tramhat123@cluster0.wozls21.mongodb.net/tramhat_db?retryWrites=true&w=majority';

  if (uri.startsWith('mongodb+srv://')) {
    try {
      dns.setServers(['8.8.8.8', '1.1.1.1']);
    } catch (e) { }
  }

  try {
    console.log(`[Database] Đang kết nối tới Database Server tại: ${uri.replace(/:[^:]*@/, ':****@')}...`);
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 8000,
    });
    console.log(`✅ [Database] Đã kết nối thành công Database Server (MongoDB Atlas): ${conn.connection.host}/${conn.connection.name}`);
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
