/**
 * 获取占卜历史 API
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Joi = require('joi');
const jwt = require('jsonwebtoken');
const User = require('../../models/User');
const Divination = require('../../models/Divination');

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

// 验证 JWT Token
function verifyToken(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  try {
    return jwt.verify(token, process.env.JWT_SECRET || 'meihua_secret_key');
  } catch (error) {
    return null;
  }
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

// 验证查询参数
const querySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(50).default(10),
  questionType: Joi.string().valid('career', 'relationship', 'health', 'wealth', 'study', 'general').optional(),
  sortBy: Joi.string().valid('createdAt', 'confidence', 'rating').default('createdAt'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
});

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

    // 验证用户身份
    const tokenPayload = verifyToken(req);
    if (!tokenPayload) {
      return res.status(401).json({
        error: '未授权',
        message: '请先登录'
      });
    }

    // 获取用户信息
    const user = await User.findById(tokenPayload.userId);
    if (!user) {
      return res.status(404).json({
        error: '用户不存在'
      });
    }

    // 解析查询参数
    const queryParams = parseQuery(req.url);
    const { error, value } = querySchema.validate(queryParams);
    if (error) {
      return res.status(400).json({
        error: '查询参数错误',
        details: error.details.map(d => d.message)
      });
    }

    const { page, limit, questionType, sortBy, sortOrder } = value;

    // 构建查询条件
    const filter = {
      userId: user._id,
      status: 'active'
    };

    if (questionType) {
      filter.questionType = questionType;
    }

    // 构建排序条件
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // 计算分页
    const skip = (page - 1) * limit;

    // 查询占卜记录
    const [divinations, total] = await Promise.all([
      Divination.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .select('-userId -__v')
        .lean(),
      Divination.countDocuments(filter)
    ]);

    // 计算分页信息
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    // 获取统计信息
    const stats = await Divination.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalCount: { $sum: 1 },
          avgConfidence: { $avg: '$confidence' },
          questionTypeDistribution: {
            $push: '$questionType'
          },
          fortuneDistribution: {
            $push: '$wuxingAnalysis.fortune'
          }
        }
      }
    ]);

    // 处理统计数据
    let statistics = {
      totalCount: 0,
      avgConfidence: 0,
      questionTypes: {},
      fortunes: {}
    };

    if (stats.length > 0) {
      const stat = stats[0];
      statistics.totalCount = stat.totalCount;
      statistics.avgConfidence = Math.round(stat.avgConfidence * 100) / 100;
      
      // 统计问题类型分布
      stat.questionTypeDistribution.forEach(type => {
        statistics.questionTypes[type] = (statistics.questionTypes[type] || 0) + 1;
      });
      
      // 统计运势分布
      stat.fortuneDistribution.forEach(fortune => {
        if (fortune) {
          statistics.fortunes[fortune] = (statistics.fortunes[fortune] || 0) + 1;
        }
      });
    }

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
      statistics,
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
