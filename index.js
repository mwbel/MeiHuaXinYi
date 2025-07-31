require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');  // 引入模型

async function main() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB 已连接');

    // 定义测试数据模型
    const TestSchema = new mongoose.Schema({ name: String });
    const Test = mongoose.model('Test', TestSchema);

    // 插入测试数据
    await Test.create({ name: 'Hello MongoDB' });
    console.log('✅ 已插入测试数据');

    // 查询数据
    const docs = await Test.find();
    console.log('📌 查询结果:', docs);

    await mongoose.disconnect();
    console.log('🔌 连接已关闭');
  } catch (err) {
    console.error('❌ 连接失败', err);
  }
}

main();
