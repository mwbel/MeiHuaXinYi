# 梅花心易部署指南

## 🎯 部署目标

将现有的HTML5原型应用部署到MongoDB和Vercel，实现：
- 前端：`/Users/Min369/Documents/augment-projects/MeiHuaXinYi/design/prototypes/index.html`
- 后端：完整的API服务
- 数据库：MongoDB Atlas

## 📋 部署清单

### ✅ 已完成配置

1. **Vercel配置** (`vercel.json`)
   - ✅ 正确的路由配置
   - ✅ 静态文件服务
   - ✅ API函数配置

2. **后端API服务**
   - ✅ `/api/health.js` - 健康检查
   - ✅ `/api/auth/register.js` - 用户注册
   - ✅ `/api/auth/login.js` - 用户登录
   - ✅ `/api/divination/perform.js` - 执行占卜
   - ✅ `/api/divination/history.js` - 占卜历史
   - ✅ `/api/ai/interpret.js` - AI解读
   - ✅ `/api/index.js` - 主API入口

3. **前端集成**
   - ✅ API客户端 (`design/prototypes/js/api-client.js`)
   - ✅ 前端HTML已引入API客户端

4. **项目配置**
   - ✅ `package.json` 更新
   - ✅ 依赖项配置

## 🚀 部署步骤

### 1. 环境变量配置

在Vercel Dashboard中配置以下环境变量：

```
MONGO_URI = mongodb+srv://my_first_database:lm369369@meihuaxinyi.lrzadq1.mongodb.net/?retryWrites=true&w=majority&appName=MeiHuaXinYi
NODE_ENV = production
```

### 2. 部署到Vercel

#### 方法1：通过GitHub（推荐）
1. 将代码推送到GitHub仓库
2. 在Vercel Dashboard中连接GitHub仓库
3. 自动部署

#### 方法2：使用Vercel CLI
```bash
# 安装Vercel CLI
npm i -g vercel

# 登录Vercel
vercel login

# 部署项目
vercel --prod
```

### 3. 验证部署

部署完成后，访问以下URL验证：

- **主页**: https://mei-hua-xin-yi.vercel.app
- **API健康检查**: https://mei-hua-xin-yi.vercel.app/api/health
- **API信息**: https://mei-hua-xin-yi.vercel.app/api

## 📱 访问地址

### 前端应用
- **主页**: https://mei-hua-xin-yi.vercel.app
- **原型应用**: https://mei-hua-xin-yi.vercel.app/design/prototypes/index.html

### API端点
- **健康检查**: `GET /api/health`
- **用户注册**: `POST /api/auth/register`
- **用户登录**: `POST /api/auth/login`
- **执行占卜**: `POST /api/divination/perform`
- **占卜历史**: `GET /api/divination/history`
- **AI解读**: `POST /api/ai/interpret`

## 🧪 测试API

### 健康检查
```bash
curl https://mei-hua-xin-yi.vercel.app/api/health
```

### 用户注册
```bash
curl -X POST https://mei-hua-xin-yi.vercel.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123"
  }'
```

### 执行占卜
```bash
curl -X POST https://mei-hua-xin-yi.vercel.app/api/divination/perform \
  -H "Content-Type: application/json" \
  -d '{
    "question": "我的事业发展如何？",
    "questionType": "career",
    "method": "time"
  }'
```

## 🔧 前端功能

现在前端应用具备以下功能：

1. **用户认证**
   - 注册新用户
   - 用户登录/登出
   - Token管理

2. **占卜功能**
   - 时间起卦
   - 数字起卦
   - 问题分类
   - 结果显示

3. **历史记录**
   - 查看占卜历史
   - 分页显示
   - 筛选功能

4. **AI解读**
   - 智能解读生成
   - 个性化建议

## 📊 数据库结构

### 用户集合 (users)
```javascript
{
  username: String,
  email: String,
  password: String,
  createdAt: Date,
  freeCount: Number,
  totalDivinations: Number
}
```

### 占卜记录集合 (divinations)
```javascript
{
  userId: String,
  question: String,
  questionType: String,
  method: String,
  result: Object,
  createdAt: Date
}
```

## 🔍 故障排除

### 问题1：前端无法访问
**检查项**：
- Vercel路由配置是否正确
- 静态文件是否正确部署

### 问题2：API调用失败
**检查项**：
- 环境变量是否正确配置
- MongoDB连接是否正常
- CORS设置是否正确

### 问题3：数据库连接失败
**检查项**：
- `MONGO_URI` 是否正确
- MongoDB Atlas网络访问设置
- 数据库用户权限

## 📈 监控和维护

### 日志查看
- Vercel Dashboard > Functions > View Function Logs

### 性能监控
- 响应时间
- 错误率
- 数据库连接状态

### 定期维护
- 检查API响应时间
- 监控数据库使用量
- 更新依赖包

## 🎉 部署完成

完成以上步骤后，你的梅花心易应用将：

1. ✅ 前端正常显示和交互
2. ✅ 后端API正常响应
3. ✅ 数据库正常连接和存储
4. ✅ 用户可以注册、登录、占卜
5. ✅ 占卜结果正常显示和保存

现在你可以：
- 访问 https://mei-hua-xin-yi.vercel.app 使用应用
- 分享给其他用户体验
- 继续开发更多功能

---

**部署时间**: 2024年7月31日  
**版本**: v2.0.0  
**状态**: ✅ 生产就绪
