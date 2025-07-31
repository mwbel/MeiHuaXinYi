/**
 * 执行占卜 API
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Joi = require('joi');
const jwt = require('jsonwebtoken');
const User = require('../../models/User');
const Divination = require('../../models/Divination');
const MeihuaDivinationCore = require('../../lib/core/MeihuaDivinationCore');

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
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
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

// 验证占卜请求数据
const divinationSchema = Joi.object({
  question: Joi.string().min(5).max(500).required(),
  questionType: Joi.string().valid('career', 'relationship', 'health', 'wealth', 'study', 'general').default('general'),
  method: Joi.string().valid('time', 'number').default('time'),
  parameters: Joi.object({
    time: Joi.object({
      year: Joi.number().integer().min(1900).max(2100).optional(),
      month: Joi.number().integer().min(1).max(12).optional(),
      day: Joi.number().integer().min(1).max(31).optional(),
      hour: Joi.number().integer().min(0).max(23).optional()
    }).optional(),
    numbers: Joi.object({
      number1: Joi.number().integer().min(1).max(999).optional(),
      number2: Joi.number().integer().min(1).max(999).optional()
    }).optional()
  }).optional()
});

module.exports = async (req, res) => {
  // 处理 CORS
  if (enableCors(req, res)) return;

  // 只允许 POST 请求
  if (req.method !== 'POST') {
    return res.status(405).json({
      error: '方法不允许',
      allowedMethods: ['POST']
    });
  }

  const startTime = Date.now();

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

    // 检查占卜次数
    if (!user.canDivination) {
      return res.status(403).json({
        error: '占卜次数不足',
        message: '您的免费占卜次数已用完，请升级会员或等待次日重置',
        freeCount: user.usage.freeCount,
        isVip: user.isVip
      });
    }

    // 验证请求数据
    const { error, value } = divinationSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: '数据验证失败',
        details: error.details.map(d => d.message)
      });
    }

    const { question, questionType, method, parameters } = value;

    // 验证数字起卦参数
    if (method === 'number') {
      if (!parameters || !parameters.numbers || !parameters.numbers.number1 || !parameters.numbers.number2) {
        return res.status(400).json({
          error: '数字起卦需要提供两个数字'
        });
      }
    }

    // 执行占卜
    const divinationCore = new MeihuaDivinationCore();
    const result = await divinationCore.performDivination(question, method, parameters);

    // 保存占卜记录
    const divinationRecord = new Divination({
      userId: user._id,
      question,
      questionType,
      method,
      parameters,
      hexagrams: result.hexagrams,
      movingLine: result.movingLine,
      wuxingAnalysis: result.wuxingAnalysis,
      basicInterpretation: result.basicInterpretation,
      confidence: result.confidence,
      processingTime: Date.now() - startTime
    });

    await divinationRecord.save();

    // 消费占卜次数
    await user.consumeDivination();

    // 返回结果
    res.status(200).json({
      success: true,
      message: '占卜完成',
      data: {
        id: divinationRecord._id,
        question,
        questionType,
        timestamp: divinationRecord.createdAt,
        hexagrams: result.hexagrams,
        movingLine: result.movingLine,
        wuxingAnalysis: result.wuxingAnalysis,
        interpretation: result.basicInterpretation,
        confidence: result.confidence,
        processingTime: Date.now() - startTime
      },
      user: {
        freeCount: user.usage.freeCount,
        totalDivinations: user.usage.totalDivinations,
        isVip: user.isVip
      }
    });

  } catch (err) {
    console.error('❌ 占卜执行失败:', err);
    res.status(500).json({
      error: '占卜执行失败',
      message: err.message || '服务器内部错误',
      processingTime: Date.now() - startTime
    });
  }
};
