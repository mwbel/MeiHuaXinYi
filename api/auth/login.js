/**
 * 用户登录 API
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Joi = require('joi');
const jwt = require('jsonwebtoken');
const User = require('../../models/User');

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

// 验证登录数据
const loginSchema = Joi.object({
  identifier: Joi.string().required(), // 可以是邮箱或用户名
  password: Joi.string().required()
});

// 生成 JWT Token
function generateToken(user) {
  const payload = {
    userId: user._id,
    username: user.username,
    email: user.email
  };
  
  return jwt.sign(payload, process.env.JWT_SECRET || 'meihua_secret_key', {
    expiresIn: '7d'
  });
}

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

  try {
    // 连接数据库
    await connectToDatabase();

    // 验证请求数据
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: '数据验证失败',
        details: error.details.map(d => d.message)
      });
    }

    const { identifier, password } = value;

    // 查找用户
    const user = await User.findByEmailOrUsername(identifier);
    if (!user) {
      return res.status(401).json({
        error: '登录失败',
        message: '用户名或密码错误'
      });
    }

    // 检查账户状态
    if (user.status !== 'active') {
      return res.status(403).json({
        error: '账户被禁用',
        message: '您的账户已被暂停，请联系客服'
      });
    }

    // 验证密码
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        error: '登录失败',
        message: '用户名或密码错误'
      });
    }

    // 更新登录时间
    await user.updateLastLogin();

    // 生成 Token
    const token = generateToken(user);

    // 返回成功响应
    const userResponse = user.toSafeObject();

    res.status(200).json({
      success: true,
      message: '登录成功',
      token,
      user: userResponse,
      expiresIn: '7d',
      timestamp: new Date().toISOString()
    });

  } catch (err) {
    console.error('❌ 登录失败:', err);
    res.status(500).json({
      error: '服务器内部错误',
      message: '登录过程中发生错误，请稍后重试'
    });
  }
};
