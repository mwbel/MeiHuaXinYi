# 梅花心易 - AI智能占卜决策助手

基于正宗梅花易数算法的AI智能占卜决策助手，专为18-35岁年轻决策者打造。

## 🌟 产品特色

- **正宗算法**：基于传统梅花易数理论，实现完整的起卦、排卦、解卦流程
- **AI解读**：集成Claude AI，提供专业的智能解读和建议
- **移动优先**：响应式设计，完美适配手机、平板、桌面设备
- **高性价比**：免费体验 + VIP增值服务的灵活定价模式

## 🚀 在线体验

- **生产环境**：https://mei-hua-xin-yi.vercel.app
- **API文档**：https://mei-hua-xin-yi.vercel.app/api

## 📱 功能特性

### 核心功能
- ✅ 时间起卦 - 基于当前时间自动起卦
- ✅ 数字起卦 - 用户输入两个数字起卦
- ✅ 三卦分析 - 本卦、互卦、变卦完整分析
- ✅ 五行分析 - 专业的五行生克关系分析
- ✅ AI智能解读 - Claude AI提供个性化解读

### 用户功能
- ✅ 用户注册登录
- ✅ 占卜历史记录
- ✅ 个人资料管理
- ✅ 免费次数管理
- ✅ VIP会员系统

### 技术特性
- ✅ 响应式设计
- ✅ PWA支持
- ✅ 离线缓存
- ✅ 实时数据同步
- ✅ 安全认证

## 🛠 技术架构

### 前端技术栈
- **HTML5/CSS3/JavaScript** - 原生Web技术
- **响应式设计** - 移动优先的UI设计
- **PWA** - 渐进式Web应用
- **本地存储** - 离线数据缓存

### 后端技术栈
- **Node.js** - 服务端运行环境
- **Express.js** - Web框架
- **MongoDB** - 数据库
- **Mongoose** - ODM对象映射
- **JWT** - 用户认证
- **bcryptjs** - 密码加密

### AI集成
- **Claude API** - Anthropic Claude 3 Sonnet
- **智能提示词** - 专业的占卜解读模板
- **上下文理解** - 基于用户问题的个性化解读

### 部署架构
- **Vercel** - 前端和API部署
- **MongoDB Atlas** - 云数据库
- **CDN** - 静态资源加速
- **SSL** - 全站HTTPS加密

## 📦 项目结构

```
MeiHuaXinYi/
├── api/                          # Vercel API路由
│   ├── auth/                     # 认证相关API
│   │   ├── login.js             # 用户登录
│   │   └── register.js          # 用户注册
│   ├── divination/              # 占卜相关API
│   │   ├── perform.js           # 执行占卜
│   │   └── history.js           # 占卜历史
│   ├── ai/                      # AI相关API
│   │   └── interpret.js         # AI解读
│   ├── health.js                # 健康检查
│   ├── test.js                  # 测试接口
│   └── index.js                 # 主API路由
├── lib/                         # 核心算法库
│   ├── core/                    # 梅花易数核心
│   │   ├── MeihuaDivinationCore.js  # 占卜核心算法
│   │   ├── BaguaSystem.js           # 八卦系统
│   │   ├── FiveElementsSystem.js   # 五行系统
│   │   └── HexagramDatabase.js      # 卦象数据库
│   └── ai/                      # AI集成
│       └── ClaudeAI.js          # Claude AI客户端
├── models/                      # 数据模型
│   ├── User.js                  # 用户模型
│   ├── Divination.js            # 占卜记录模型
│   └── Hexagram.js              # 卦象模型
├── design/prototypes/           # 前端原型
│   ├── js/                      # JavaScript文件
│   │   ├── api-client.js        # API客户端
│   │   ├── divination-service.js # 占卜服务
│   │   ├── app-core.js          # 应用核心
│   │   ├── app-state.js         # 状态管理
│   │   ├── router.js            # 路由系统
│   │   └── utils.js             # 工具函数
│   ├── css/                     # 样式文件
│   └── index.html               # 主页面
├── scripts/                     # 脚本文件
│   └── init-database.js         # 数据库初始化
├── vercel.json                  # Vercel部署配置
├── package.json                 # 项目依赖
└── README.md                    # 项目说明
```

## 🚀 快速开始

### 环境要求
- Node.js 16+
- MongoDB 4.4+
- 现代浏览器

### 本地开发

1. **克隆项目**
```bash
git clone https://github.com/your-username/MeiHuaXinYi.git
cd MeiHuaXinYi
```

2. **安装依赖**
```bash
npm install
```

3. **配置环境变量**
```bash
# 创建 .env 文件
cp .env.example .env

# 编辑环境变量
MONGO_URI=mongodb+srv://your-connection-string
JWT_SECRET=your-jwt-secret
CLAUDE_API_KEY=your-claude-api-key
```

4. **初始化数据库**
```bash
node scripts/init-database.js
```

5. **启动开发服务器**
```bash
npm run dev
```

6. **访问应用**
- 前端：http://localhost:3000
- API：http://localhost:3000/api

### 部署到Vercel

1. **安装Vercel CLI**
```bash
npm i -g vercel
```

2. **登录Vercel**
```bash
vercel login
```

3. **部署项目**
```bash
vercel --prod
```

4. **配置环境变量**
在Vercel Dashboard中配置：
- `MONGO_URI`
- `JWT_SECRET`
- `CLAUDE_API_KEY`

## 📖 API文档

### 认证接口

#### 用户注册
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "testuser",
  "email": "test@example.com",
  "password": "password123",
  "nickname": "测试用户"
}
```

#### 用户登录
```http
POST /api/auth/login
Content-Type: application/json

{
  "identifier": "test@example.com",
  "password": "password123"
}
```

### 占卜接口

#### 执行占卜
```http
POST /api/divination/perform
Authorization: Bearer <token>
Content-Type: application/json

{
  "question": "我的事业发展如何？",
  "questionType": "career",
  "method": "time"
}
```

#### 获取历史
```http
GET /api/divination/history?page=1&limit=10
Authorization: Bearer <token>
```

### AI接口

#### 生成AI解读
```http
POST /api/ai/interpret
Authorization: Bearer <token>
Content-Type: application/json

{
  "divinationId": "占卜记录ID",
  "userContext": {
    "focusArea": "重点关注的方面"
  }
}
```

## 🔧 配置说明

### 环境变量

| 变量名 | 说明 | 必需 |
|--------|------|------|
| `MONGO_URI` | MongoDB连接字符串 | ✅ |
| `JWT_SECRET` | JWT签名密钥 | ✅ |
| `CLAUDE_API_KEY` | Claude API密钥 | ❌ |
| `NODE_ENV` | 运行环境 | ❌ |

### Vercel配置

项目使用 `vercel.json` 配置文件进行部署配置：
- API路由映射
- 静态文件服务
- 函数超时设置
- 环境变量配置

## 🤝 贡献指南

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 📞 联系我们

- 项目主页：https://github.com/your-username/MeiHuaXinYi
- 问题反馈：https://github.com/your-username/MeiHuaXinYi/issues
- 邮箱：contact@meihuaxinyi.com

## 🙏 致谢

- 感谢 [Anthropic](https://www.anthropic.com/) 提供的Claude AI服务
- 感谢 [Vercel](https://vercel.com/) 提供的部署平台
- 感谢 [MongoDB](https://www.mongodb.com/) 提供的数据库服务
- 感谢所有贡献者和用户的支持

---

**梅花心易** - 让古老智慧与现代AI完美结合 ✨
