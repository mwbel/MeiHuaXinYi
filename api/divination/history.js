/**
 * 获取占卜历史 API
 */

require('dotenv').config();
const mongoose = require('mongoose');

// MongoDB 连接状态
let isConnected = false;

// 连接到 MongoDB
async function connectToDatabase() {
  if (isConnected) return;

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

// 占卜记录模型
const DivinationSchema = new mongoose.Schema({
  userId: String,
  question: String,
  questionType: String,
  method: String,
  result: Object,
  createdAt: { type: Date, default: Date.now }
});

const Divination = mongoose.models.Divination || mongoose.model('Divination', DivinationSchema);

// CORS 处理
function enableCors(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return true;
  }
  return false;
}

// 解析查询参数
function parseQuery(url) {
  const urlObj = new URL(url, 'http://localhost');
  const params = {};
  
  urlObj.searchParams.forEach((value, key) => {
    params[key] = value;
  });
  
  return params;
}

module.exports = async (req, res) => {
  // 处理 CORS
  if (enableCors(req, res)) return;

  // 只允许 GET 请求
  if (req.method !== 'GET') {
    return res.status(405).json({
      error: '方法不允许',
      allowedMethods: ['GET']
    });
  }

  try {
    // 连接数据库
    await connectToDatabase();

    // 解析查询参数
    const queryParams = parseQuery(req.url);
    const page = parseInt(queryParams.page) || 1;
    const limit = parseInt(queryParams.limit) || 10;
    const questionType = queryParams.questionType;

    // 构建查询条件
    const filter = {};
    if (questionType) {
      filter.questionType = questionType;
    }

    // 计算分页
    const skip = (page - 1) * limit;

    // 查询占卜记录
    const [divinations, total] = await Promise.all([
      Divination.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Divination.countDocuments(filter)
    ]);

    // 计算分页信息
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    // 返回结果
    res.status(200).json({
      success: true,
      data: divinations,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: total,
        itemsPerPage: limit,
        hasNextPage,
        hasPrevPage
      },
      timestamp: new Date().toISOString()
    });

  } catch (err) {
    console.error('❌ 获取历史记录失败:', err);
    res.status(500).json({
      error: '获取历史记录失败',
      message: err.message || '服务器内部错误'
    });
  }
};
