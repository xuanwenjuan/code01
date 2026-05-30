# 自媒体达人接单招商后台后端服务

基于 Node.js + Express + TypeScript + MySQL + Sequelize 构建的自媒体达人接单平台后端服务。

## 技术栈

- **运行时**: Node.js
- **框架**: Express.js
- **语言**: TypeScript
- **数据库**: MySQL 8.0+
- **ORM**: Sequelize
- **认证**: JWT (JSON Web Token)
- **日志**: Winston
- **定时任务**: node-cron
- **参数校验**: Joi

## 功能模块

### 1. 内容赛道分类模块
- 多级分类树结构
- 分类增删改查
- 暂停/启用招商
- 排序权重配置

### 2. 达人账号档案模块
- 达人资料管理
- 粉丝量级记录
- 报价区间设置
- 擅长品类绑定
- 标签管理
- 资料审核流程
- 过往案例管理

### 3. 商家投放订单模块
- 订单发布管理
- 达人匹配洽谈
- 脚本确认流程
- 视频发布管理
- 订单验收流程
- 订单状态自动流转
- 超时订单自动失效

### 4. 平台佣金结算模块
- 达人收益计算
- 平台佣金计算
- 服务商分成
- 多维度对账统计
- 结算状态管理

## 项目结构

```
src/
├── config/              # 配置文件
│   ├── env.ts          # 环境变量配置
│   └── database.ts     # 数据库连接配置
├── models/              # 数据模型
│   ├── User.ts         # 用户模型
│   ├── Category.ts     # 分类模型
│   ├── Influencer.ts   # 达人模型
│   ├── Merchant.ts     # 商家模型
│   ├── Order.ts        # 订单模型
│   ├── Settlement.ts   # 结算模型
│   ├── OperationLog.ts # 操作日志模型
│   └── index.ts
├── controllers/         # 控制器
│   ├── auth.controller.ts
│   ├── category.controller.ts
│   ├── influencer.controller.ts
│   ├── order.controller.ts
│   └── settlement.controller.ts
├── middleware/          # 中间件
│   ├── auth.ts         # 认证中间件
│   ├── errorHandler.ts # 错误处理中间件
│   └── operationLog.ts # 操作日志中间件
├── utils/               # 工具函数
│   ├── response.ts     # 统一响应封装
│   ├── errors.ts       # 自定义错误类
│   ├── validate.ts     # 参数校验工具
│   ├── logger.ts       # 日志工具
│   └── constants.ts    # 常量定义
├── routes/              # 路由
│   └── index.ts
├── cron/                # 定时任务
│   └── index.ts
├── scripts/             # 脚本
│   └── initDB.ts       # 数据库初始化脚本
└── app.ts               # 应用入口
```

## 快速开始

### 环境要求

- Node.js >= 16.0.0
- MySQL >= 8.0
- npm >= 8.0.0

### 安装依赖

```bash
npm install
```

### 环境配置

复制 `.env` 文件并根据实际情况修改配置：

```env
PORT=3000
NODE_ENV=development

JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=7d

DB_HOST=localhost
DB_PORT=3306
DB_NAME=influencer_platform
DB_USER=root
DB_PASSWORD=your-password

LOG_LEVEL=info

DEFAULT_PAGE_SIZE=10
MAX_PAGE_SIZE=100
```

### 创建数据库

```sql
CREATE DATABASE influencer_platform CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 初始化数据库

```bash
npm run init-db
```

### 启动开发服务器

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

### 启动生产服务器

```bash
npm start
```

## API 文档

### 认证接口

- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `GET /api/auth/me` - 获取当前用户信息
- `PUT /api/auth/password` - 修改密码

### 分类接口

- `GET /api/categories/tree` - 获取分类树
- `GET /api/categories` - 获取分类列表
- `GET /api/categories/:id` - 获取分类详情
- `POST /api/categories` - 创建分类 (管理员)
- `PUT /api/categories/:id` - 更新分类 (管理员)
- `DELETE /api/categories/:id` - 删除分类 (管理员)
- `PUT /api/categories/:id/pause` - 暂停分类招商 (管理员)

### 达人接口

- `GET /api/influencers` - 获取达人列表
- `GET /api/influencers/me` - 获取当前达人资料
- `GET /api/influencers/:id` - 获取达人详情
- `POST /api/influencers` - 创建达人资料
- `PUT /api/influencers/:id` - 更新达人资料
- `PUT /api/influencers/:id/review` - 审核达人资料 (管理员)
- `PUT /api/influencers/tags` - 更新达人标签

### 订单接口

- `GET /api/orders` - 获取订单列表
- `GET /api/orders/:id` - 获取订单详情
- `POST /api/orders` - 创建订单 (商家)
- `PUT /api/orders/:id` - 更新订单
- `PUT /api/orders/:id/status` - 更新订单状态
- `PUT /api/orders/:id/match` - 匹配达人 (管理员)
- `PUT /api/orders/:id/cancel` - 取消订单
- `PUT /api/orders/:id/submit` - 提交视频 (达人)

### 结算接口

- `GET /api/settlements` - 获取结算列表
- `GET /api/settlements/statistics` - 获取结算统计
- `GET /api/settlements/:id` - 获取结算详情
- `PUT /api/settlements/:id/process` - 处理结算 (管理员)
- `PUT /api/settlements/:id/complete` - 完成结算 (管理员)

## 角色权限

- **管理员 (admin)**: 全权限
- **商家 (merchant)**: 发布订单、管理自己的订单
- **达人 (influencer)**: 管理自己的资料、提交视频
- **服务商 (service_provider)**: 预留角色

## 订单状态流转

```
草稿 -> 已发布 -> 匹配中 -> 洽谈中 -> 脚本确认 -> 拍摄中 -> 视频发布 -> 已完成
                                    |           |          |          |
                                    v           v          v          v
                                  已取消      已取消     已取消     已取消

已发布 (超时) -> 已过期
```

## 定时任务

1. **每小时执行**: 检查并处理超时订单
2. **每天凌晨1点执行**: 自动为已完成订单创建结算记录

## 操作日志

系统自动记录所有关键操作，包括：
- 操作人
- 操作模块
- 操作类型
- 请求参数
- 响应结果
- 耗时
- IP地址
- User-Agent

## 统一响应格式

### 成功响应
```json
{
  "code": 200,
  "message": "操作成功",
  "data": {},
  "success": true,
  "timestamp": 1699999999999
}
```

### 失败响应
```json
{
  "code": 400,
  "message": "请求参数错误",
  "success": false,
  "timestamp": 1699999999999
}
```

## 开发规范

1. 遵循 RESTful API 设计规范
2. 严格使用 TypeScript 类型约束
3. 使用 Joi 进行请求参数校验
4. 全局异常捕获和统一错误处理
5. 关键操作记录日志
6. 数据库事务保证数据一致性

## License

MIT
