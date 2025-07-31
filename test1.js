require('dotenv').config();
console.log("🔍 测试脚本开始运行");
const mongoose = require('mongoose');

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000
    });
    console.log('✅ 本地连接成功');
    await mongoose.disconnect();
  } catch (err) {
    console.error('❌ 本地连接失败:', err.message);
  }
})();
