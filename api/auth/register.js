/**
 * 用户注册 API
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Joi = require('joi');
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

// 验证注册数据
const registerSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(20).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  nickname: Joi.string().max(30).optional(),
  profile: Joi.object({
    gender: Joi.string().valid('male', 'female', 'other').optional(),
    birthDate: Joi.date().optional(),
    location: Joi.object({
      city: Joi.string().optional(),
      province: Joi.string().optional(),
      country: Joi.string().optional()
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

  try {
    // 连接数据库
    await connectToDatabase();

    // 验证请求数据
    const { error, value } = registerSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: '数据验证失败',
        details: error.details.map(d => d.message)
      });
    }

    const { username, email, password, nickname, profile } = value;

    // 检查用户是否已存在
    const existingUser = await User.findByEmailOrUsername(email) || 
                         await User.findByEmailOrUsername(username);
    
    if (existingUser) {
      return res.status(409).json({
        error: '用户已存在',
        message: '邮箱或用户名已被注册'
      });
    }

    // 创建新用户
    const newUser = new User({
      username,
      email,
      password,
      nickname: nickname || username,
      profile: profile || {}
    });

    await newUser.save();

    // 返回成功响应（不包含密码）
    const userResponse = newUser.toSafeObject();

    res.status(201).json({
      success: true,
      message: '注册成功',
      user: userResponse,
      timestamp: new Date().toISOString()
    });

  } catch (err) {
    console.error('❌ 注册失败:', err);
    
    // 处理 MongoDB 重复键错误
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern)[0];
      return res.status(409).json({
        error: '注册失败',
        message: `${field === 'email' ? '邮箱' : '用户名'}已被使用`
      });
    }

    res.status(500).json({
      error: '服务器内部错误',
      message: '注册过程中发生错误，请稍后重试'
    });
  }
};
