/**
 * 用户登录 API
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
  totalDivinations: { type: Number, default: 0 },
  lastLoginAt: { type: Date }
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

    const { identifier, password } = req.body;

    // 基础验证
    if (!identifier || !password) {
      return res.status(400).json({
        error: '缺少必要字段',
        message: '用户名/邮箱和密码都是必需的'
      });
    }

    // 查找用户（可以用邮箱或用户名登录）
    const user = await User.findOne({
      $or: [
        { email: identifier },
        { username: identifier }
      ]
    });

    if (!user) {
      return res.status(401).json({
        error: '登录失败',
        message: '用户名或密码错误'
      });
    }

    // 验证密码（注意：在生产环境中应该使用加密密码比较）
    if (user.password !== password) {
      return res.status(401).json({
        error: '登录失败',
        message: '用户名或密码错误'
      });
    }

    // 更新登录时间
    user.lastLoginAt = new Date();
    await user.save();

    // 生成简单的token（实际应用中应该使用JWT）
    const token = `token_${user._id}_${Date.now()}`;

    // 返回成功响应
    res.status(200).json({
      success: true,
      message: '登录成功',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        freeCount: user.freeCount,
        totalDivinations: user.totalDivinations,
        lastLoginAt: user.lastLoginAt
      }
    });

  } catch (err) {
    console.error('❌ 登录失败:', err);
    res.status(500).json({
      error: '服务器内部错误',
      message: '登录过程中发生错误，请稍后重试'
    });
  }
};
