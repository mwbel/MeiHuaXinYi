/**
 * 用户注册 API
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

// 简化的用户模型
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  freeCount: { type: Number, default: 3 },
  totalDivinations: { type: Number, default: 0 }
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);

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

    const { username, email, password } = req.body;

    // 基础验证
    if (!username || !email || !password) {
      return res.status(400).json({
        error: '缺少必要字段',
        message: '用户名、邮箱和密码都是必需的'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        error: '密码太短',
        message: '密码至少需要6个字符'
      });
    }

    // 检查用户是否已存在
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });
    
    if (existingUser) {
      return res.status(409).json({
        error: '用户已存在',
        message: '邮箱或用户名已被注册'
      });
    }

    // 创建新用户（注意：在生产环境中应该加密密码）
    const newUser = new User({
      username,
      email,
      password // 实际应用中需要使用 bcrypt 加密
    });

    await newUser.save();

    // 返回成功响应（不包含密码）
    res.status(201).json({
      success: true,
      message: '注册成功',
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        freeCount: newUser.freeCount,
        createdAt: newUser.createdAt
      }
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
