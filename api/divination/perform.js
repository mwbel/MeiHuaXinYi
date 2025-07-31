/**
 * 执行占卜 API
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
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return true;
  }
  return false;
}

// 简化的梅花易数算法
function performMeihuaDivination(question, method = 'time', params = {}) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const day = now.getDate();
  const hour = now.getHours();
  
  // 简化的起卦算法
  let upperGua, lowerGua, movingLine;
  
  if (method === 'time') {
    const baseNumber = (year + month + day) % 8 + 1;
    upperGua = baseNumber;
    lowerGua = (baseNumber + hour) % 8 + 1;
    movingLine = (baseNumber + hour) % 6 + 1;
  } else if (method === 'number') {
    const { number1, number2 } = params;
    upperGua = (number1 % 8) + 1;
    lowerGua = (number2 % 8) + 1;
    movingLine = ((number1 + number2) % 6) + 1;
  }
  
  // 八卦名称
  const baguaNames = ['', '乾', '兑', '离', '震', '巽', '坎', '艮', '坤'];
  const baguaSymbols = ['', '☰', '☱', '☲', '☳', '☴', '☵', '☶', '☷'];
  
  // 生成卦象
  const benGua = {
    upper: { name: baguaNames[upperGua], symbol: baguaSymbols[upperGua] },
    lower: { name: baguaNames[lowerGua], symbol: baguaSymbols[lowerGua] },
    name: `${baguaNames[upperGua]}${baguaNames[lowerGua]}`
  };
  
  // 简化的解读
  const interpretations = [
    '此卦显示当前状况稳定，宜保持现状',
    '变化在即，需要做好准备迎接新的机遇',
    '困难是暂时的，坚持下去会有好结果',
    '时机成熟，可以积极行动',
    '需要耐心等待，不宜急躁',
    '贵人相助，事情会有转机'
  ];
  
  const randomInterpretation = interpretations[Math.floor(Math.random() * interpretations.length)];
  
  return {
    benGua,
    movingLine,
    interpretation: randomInterpretation,
    fortune: ['excellent', 'good', 'neutral', 'poor'][Math.floor(Math.random() * 4)],
    advice: '保持积极心态，顺其自然',
    timestamp: now.toISOString()
  };
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

    const { question, questionType = 'general', method = 'time', parameters = {} } = req.body;

    // 基础验证
    if (!question || question.trim().length < 5) {
      return res.status(400).json({
        error: '问题验证失败',
        message: '问题内容至少需要5个字符'
      });
    }

    // 执行占卜
    const result = performMeihuaDivination(question, method, parameters);

    // 保存占卜记录
    const divination = new Divination({
      userId: req.headers.authorization || 'anonymous',
      question,
      questionType,
      method,
      result
    });

    await divination.save();

    // 返回结果
    res.status(200).json({
      success: true,
      message: '占卜完成',
      data: {
        id: divination._id,
        question,
        questionType,
        method,
        result,
        timestamp: divination.createdAt
      }
    });

  } catch (err) {
    console.error('❌ 占卜执行失败:', err);
    res.status(500).json({
      error: '占卜执行失败',
      message: err.message || '服务器内部错误'
    });
  }
};
