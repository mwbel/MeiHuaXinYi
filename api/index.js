require('dotenv').config();
const mongoose = require('mongoose');
const cors = require('cors');

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
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    isConnected = true;
    console.log('✅ MongoDB 已连接');
  } catch (error) {
    console.error('❌ MongoDB 连接失败:', error);
    throw error;
  }
}

// CORS 中间件
function enableCors(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return true;
  }
  return false;
}

module.exports = async (req, res) => {
  // 处理 CORS
  if (enableCors(req, res)) return;

  try {
    // 确保数据库连接
    await connectToDatabase();

    // API 路由
    const { method, url } = req;
    const path = url.split('?')[0];

    // 健康检查
    if (method === 'GET' && path === '/') {
      return res.status(200).json({
        message: '梅花心易 API 服务正常运行',
        version: '2.0.0',
        timestamp: new Date().toISOString(),
        endpoints: [
          'GET /health - 健康检查',
          'POST /divination - 执行占卜',
          'GET /divination/history - 占卜历史',
          'POST /auth/register - 用户注册',
          'POST /auth/login - 用户登录'
        ]
      });
    }

    // 健康检查端点
    if (method === 'GET' && path === '/health') {
      return res.status(200).json({
        status: 'healthy',
        database: 'connected',
        timestamp: new Date().toISOString()
      });
    }

    // 404 处理
    res.status(404).json({
      error: 'API 端点未找到',
      path: path,
      method: method,
      timestamp: new Date().toISOString()
    });

  } catch (err) {
    console.error('❌ API 错误:', err);
    res.status(500).json({
      error: err.message,
      timestamp: new Date().toISOString()
    });
  }
};
