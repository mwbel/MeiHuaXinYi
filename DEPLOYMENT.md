# 梅花心易部署指南

## 🚀 部署状态

✅ **项目已完整部署到 Vercel**
- 前端界面：https://mei-hua-xin-yi.vercel.app
- API服务：https://mei-hua-xin-yi.vercel.app/api
- 数据库：MongoDB Atlas

## 📋 部署清单

### ✅ 已完成的功能

1. **核心算法**
   - ✅ 梅花易数算法实现
   - ✅ 八卦系统
   - ✅ 五行分析
   - ✅ 卦象数据库

2. **后端API**
   - ✅ 用户认证（注册/登录）
   - ✅ 占卜执行
   - ✅ 占卜历史
   - ✅ AI智能解读
   - ✅ 健康检查

3. **数据库**
   - ✅ MongoDB Atlas 连接
   - ✅ 用户模型
   - ✅ 占卜记录模型
   - ✅ 卦象模型

4. **前端界面**
   - ✅ 响应式设计
   - ✅ API客户端
   - ✅ 占卜服务
   - ✅ 用户界面

5. **部署配置**
   - ✅ Vercel 配置
   - ✅ 环境变量
   - ✅ 路由配置

## 🔧 环境变量配置

在 Vercel Dashboard 中需要配置以下环境变量：

```
MONGO_URI = mongodb+srv://my_first_database:lm369369@meihuaxinyi.lrzadq1.mongodb.net/?retryWrites=true&w=majority&appName=MeiHuaXinYi
JWT_SECRET = meihua_jwt_secret_key_2024
CLAUDE_API_KEY = 你的Claude API密钥（可选）
NODE_ENV = production
```

## 📱 访问地址

### 主要页面
- **首页**: https://mei-hua-xin-yi.vercel.app
- **完整应用**: https://mei-hua-xin-yi.vercel.app/design/prototypes/index.html

### API端点
- **健康检查**: https://mei-hua-xin-yi.vercel.app/api/health
- **API信息**: https://mei-hua-xin-yi.vercel.app/api
- **用户注册**: https://mei-hua-xin-yi.vercel.app/api/auth/register
- **用户登录**: https://mei-hua-xin-yi.vercel.app/api/auth/login
- **执行占卜**: https://mei-hua-xin-yi.vercel.app/api/divination/perform
- **占卜历史**: https://mei-hua-xin-yi.vercel.app/api/divination/history
- **AI解读**: https://mei-hua-xin-yi.vercel.app/api/ai/interpret

## 🧪 测试步骤

### 1. 基础连接测试
访问 https://mei-hua-xin-yi.vercel.app 并点击"测试API"按钮

### 2. API功能测试

#### 健康检查
```bash
curl https://mei-hua-xin-yi.vercel.app/api/health
```

#### 用户注册
```bash
curl -X POST https://mei-hua-xin-yi.vercel.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123"
  }'
```

#### 用户登录
```bash
curl -X POST https://mei-hua-xin-yi.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "test@example.com",
    "password": "password123"
  }'
```

### 3. 前端功能测试
1. 访问完整应用页面
2. 测试用户注册/登录
3. 测试占卜功能
4. 测试历史记录

## 🔄 重新部署

如果需要重新部署：

1. **推送代码到GitHub**（如果连接了GitHub）
2. **在Vercel Dashboard中手动重新部署**
3. **使用Vercel CLI**：
   ```bash
   vercel --prod
   ```

## 🐛 故障排除

### 问题1：访问根路径显示API响应而不是前端页面
**解决方案**：检查 `vercel.json` 中的路由配置，确保根路径指向正确的HTML文件

### 问题2：API返回数据库连接错误
**解决方案**：
1. 检查 `MONGO_URI` 环境变量是否正确配置
2. 确认MongoDB Atlas允许Vercel的IP访问
3. 检查数据库用户权限

### 问题3：AI功能不可用
**解决方案**：
1. 配置 `CLAUDE_API_KEY` 环境变量
2. 确认API密钥有效
3. 检查API调用限制

### 问题4：静态文件404错误
**解决方案**：检查 `vercel.json` 中的静态文件路由配置

## 📊 监控和维护

### 日志查看
在Vercel Dashboard的Functions标签页可以查看API调用日志

### 性能监控
- 响应时间
- 错误率
- 数据库连接状态

### 定期维护
- 检查数据库连接
- 更新依赖包
- 监控API使用量
- 备份重要数据

## 🎯 下一步计划

1. **获取Claude API密钥**以启用AI功能
2. **完善前端用户体验**
3. **添加更多占卜功能**
4. **优化性能和稳定性**
5. **添加用户反馈系统**

## 📞 技术支持

如果遇到问题，请检查：
1. Vercel部署日志
2. 浏览器开发者工具
3. API响应状态
4. 环境变量配置

---

**部署完成时间**: 2024年7月31日
**版本**: v2.0.0
**状态**: ✅ 生产就绪
