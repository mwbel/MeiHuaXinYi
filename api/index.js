/**
 * 主API入口
 */

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

    // API信息
    if (method === 'GET' && (path === '/' || path === '')) {
      return res.status(200).json({
        name: '梅花心易 API',
        version: '2.0.0',
        description: '基于正宗梅花易数算法的AI智能占卜决策助手',
        status: 'running',
        database: 'connected',
        timestamp: new Date().toISOString(),
        endpoints: {
          health: 'GET /api/health - 健康检查',
          auth: {
            register: 'POST /api/auth/register - 用户注册',
            login: 'POST /api/auth/login - 用户登录'
          },
          divination: {
            perform: 'POST /api/divination/perform - 执行占卜',
            history: 'GET /api/divination/history - 占卜历史'
          },
          ai: {
            interpret: 'POST /api/ai/interpret - AI智能解读'
          }
        },
        documentation: 'https://mei-hua-xin-yi.vercel.app/api'
      });
    }

    // 404 处理
    res.status(404).json({
      error: 'API 端点未找到',
      message: '请检查请求路径和方法',
      path: path,
      method: method,
      availableEndpoints: [
        '/api/health',
        '/api/auth/register',
        '/api/auth/login',
        '/api/divination/perform',
        '/api/divination/history',
        '/api/ai/interpret'
      ],
      timestamp: new Date().toISOString()
    });

  } catch (err) {
    console.error('❌ API 错误:', err);
    res.status(500).json({
      error: 'API服务异常',
      message: err.message,
      timestamp: new Date().toISOString()
    });
  }
};
