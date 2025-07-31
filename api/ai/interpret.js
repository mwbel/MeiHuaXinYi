/**
 * AI智能解读 API
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Joi = require('joi');
const jwt = require('jsonwebtoken');
const User = require('../../models/User');
const Divination = require('../../models/Divination');
const ClaudeAI = require('../../lib/ai/ClaudeAI');

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

// 验证请求数据
const interpretSchema = Joi.object({
  divinationId: Joi.string().required(),
  userContext: Joi.object({
    questionType: Joi.string().valid('career', 'relationship', 'health', 'wealth', 'study', 'general').optional(),
    focusArea: Joi.string().max(100).optional(),
    additionalInfo: Joi.string().max(200).optional()
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

    // 验证请求数据
    const { error, value } = interpretSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: '数据验证失败',
        details: error.details.map(d => d.message)
      });
    }

    const { divinationId, userContext = {} } = value;

    // 获取占卜记录
    const divination = await Divination.findOne({
      _id: divinationId,
      userId: user._id,
      status: 'active'
    });

    if (!divination) {
      return res.status(404).json({
        error: '占卜记录不存在',
        message: '未找到指定的占卜记录或无权限访问'
      });
    }

    // 检查是否已有AI解读
    if (divination.aiInterpretation && divination.aiInterpretation.content) {
      return res.status(200).json({
        success: true,
        message: 'AI解读已存在',
        data: {
          interpretation: divination.aiInterpretation,
          cached: true,
          processingTime: 0
        }
      });
    }

    // 检查用户是否有AI解读权限（VIP功能）
    if (!user.isVip && user.usage.totalDivinations > 1) {
      return res.status(403).json({
        error: 'AI解读需要VIP权限',
        message: '免费用户仅可体验一次AI解读，请升级VIP获得无限次AI解读',
        isVip: user.isVip
      });
    }

    // 准备占卜结果数据
    const divinationResult = {
      question: divination.question,
      questionType: divination.questionType,
      hexagrams: divination.hexagrams,
      movingLine: divination.movingLine,
      wuxingAnalysis: divination.wuxingAnalysis,
      basicInterpretation: divination.basicInterpretation
    };

    // 合并用户上下文
    const fullUserContext = {
      questionType: divination.questionType,
      ...userContext,
      userProfile: {
        isVip: user.isVip,
        totalDivinations: user.usage.totalDivinations
      }
    };

    // 调用Claude AI生成解读
    const claudeAI = new ClaudeAI();
    const aiInterpretation = await claudeAI.generateInterpretation(divinationResult, fullUserContext);

    // 更新占卜记录
    divination.aiInterpretation = aiInterpretation;
    await divination.save();

    // 返回结果
    res.status(200).json({
      success: true,
      message: 'AI解读生成成功',
      data: {
        interpretation: aiInterpretation,
        cached: false,
        processingTime: Date.now() - startTime
      },
      usage: {
        model: aiInterpretation.model,
        tokens: aiInterpretation.tokens,
        confidence: aiInterpretation.confidence
      }
    });

  } catch (err) {
    console.error('❌ AI解读生成失败:', err);
    
    // 特殊错误处理
    if (err.message.includes('Claude API Key')) {
      return res.status(503).json({
        error: 'AI服务暂时不可用',
        message: 'AI解读功能正在维护中，请稍后重试'
      });
    }

    if (err.message.includes('API 错误')) {
      return res.status(502).json({
        error: 'AI服务异常',
        message: 'AI解读服务暂时异常，请稍后重试'
      });
    }

    res.status(500).json({
      error: 'AI解读生成失败',
      message: err.message || '服务器内部错误',
      processingTime: Date.now() - startTime
    });
  }
};
