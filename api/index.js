require('dotenv').config();
const mongoose = require('mongoose');

// MongoDB 连接状态
let isConnected = false;

// 连接到 MongoDB
async function connectToDatabase() {
  if (isConnected) {
    return;
  }

  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // 5秒超时
      socketTimeoutMS: 45000, // 45秒超时
    });
    isConnected = true;
    console.log('✅ MongoDB 已连接');
  } catch (error) {
    console.error('❌ MongoDB 连接失败:', error);
    throw error;
  }
}

const TestSchema = new mongoose.Schema({
  name: String,
  createdAt: { type: Date, default: Date.now }
});
const Test = mongoose.models.Test || mongoose.model('Test', TestSchema);

module.exports = async (req, res) => {
  try {
    // 确保数据库连接
    await connectToDatabase();

    // 插入测试数据
    const doc = await Test.create({ name: 'Hello MongoDB from Vercel' });
    console.log('✅ 已插入测试数据');

    // 查询最近的5条数据
    const docs = await Test.find().sort({ createdAt: -1 }).limit(5);
    console.log('📌 查询结果:', docs);

    res.status(200).json({
      message: '✅ MongoDB 连接成功!',
      inserted: doc,
      recent_records: docs,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error('❌ 操作失败:', err);
    res.status(500).json({
      error: err.message,
      timestamp: new Date().toISOString()
    });
  }
};
