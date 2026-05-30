# 同城家政服务平台后端服务

基于 Node.js + Express + TypeScript + MySQL + Sequelize 开发的家政服务平台后端系统。

## 技术栈

- **运行时**: Node.js
- **框架**: Express
- **语言**: TypeScript
- **数据库**: MySQL + Sequelize ORM
- **鉴权**: JWT
- **其他**: bcrypt、node-cron、joi、helmet、cors 等

## 功能模块

### 1. 家政服务类目模块
- 多级服务类目管理（无限级分类）
- 价格基准配置
- 服务上下架
- 树形层级查询
- 排序管理

### 2. 家政阿姨档案模块
- 阿姨实名认证
- 技能标签绑定
- 服务年限管理
- 接单状态管理
- 服务评价汇总
- 服务范围划定
- 信息审核与状态管控

### 3. 用户下单订单模块
- 用户发布家政需求
- 平台派单
- 阿姨接单
- 上门服务
- 服务完成
- 订单评价
- 订单状态自动流转
- 超时订单自动处理
- 订单全链路留痕

### 4. 平台佣金结算模块
- 按订单金额抽取平台佣金
- 阿姨收益核算
- 待结算/已结算状态管理
- 按日期、服务类目、阿姨维度多维度对账统计

## 项目结构

```
├── src/
│   ├── config/              # 配置文件
│   │   └── index.ts
│   ├── controllers/         # 控制器
│   │   ├── auth.controller.ts
│   │   ├── category.controller.ts
│   │   ├── aunt.controller.ts
│   │   ├── order.controller.ts
│   │   └── settlement.controller.ts
│   ├── database/            # 数据库连接
│   │   └── index.ts
│   ├── exceptions/          # 异常处理
│   │   └── HttpException.ts
│   ├── middlewares/         # 中间件
│   │   ├── auth.ts
│   │   ├── errorHandler.ts
│   │   ├── operationLog.ts
│   │   └── validate.ts
│   ├── models/              # 数据模型
│   │   ├── User.ts
│   │   ├── ServiceCategory.ts
│   │   ├── AuntProfile.ts
│   │   ├── Order.ts
│   │   ├── OrderStatusLog.ts
│   │   ├── OrderReview.ts
│   │   ├── Settlement.ts
│   │   └── index.ts
│   ├── routes/              # 路由
│   │   ├── auth.routes.ts
│   │   ├── category.routes.ts
│   │   ├── aunt.routes.ts
│   │   ├── order.routes.ts
│   │   └── settlement.routes.ts
│   ├── tasks/               # 定时任务
│   │   └── orderTasks.ts
│   ├── types/               # 类型定义
│   │   └── index.ts
│   ├── utils/               # 工具类
│   │   ├── jwt.ts
│   │   ├── password.ts
│   │   └── response.ts
│   └── app.ts               # 应用入口
├── .env                     # 环境变量
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

## 快速开始

### 1. 环境准备

- Node.js >= 16.0.0
- MySQL >= 5.7

### 2. 安装依赖

```bash
npm install
```

### 3. 配置环境变量

复制并修改 `.env` 文件：

```env
NODE_ENV=development
PORT=3000

DB_HOST=localhost
DB_PORT=3306
DB_NAME=home_service_db
DB_USER=root
DB_PASSWORD=your_password

JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=7d

BCRYPT_SALT_ROUNDS=10

PLATFORM_COMMISSION_RATE=0.15
```

### 4. 创建数据库

在 MySQL 中创建数据库：

```sql
CREATE DATABASE home_service_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 5. 启动项目

```bash
# 开发模式（热重载）
npm run dev

# 构建
npm run build

# 生产模式
npm start
```

## API 接口文档

### 认证接口

| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| POST | /api/auth/register | 用户注册 | 公开 |
| POST | /api/auth/login | 用户登录 | 公开 |
| GET | /api/auth/me | 获取当前用户信息 | 已登录 |

### 服务类目接口

| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| GET | /api/categories/tree | 获取类目树 | 公开 |
| GET | /api/categories/list | 获取类目列表 | 公开 |
| GET | /api/categories/:id | 获取类目详情 | 公开 |
| POST | /api/categories | 创建类目 | 管理员 |
| PUT | /api/categories/:id | 更新类目 | 管理员 |
| DELETE | /api/categories/:id | 删除类目 | 管理员 |

### 阿姨档案接口

| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| GET | /api/aunts/list | 获取阿姨列表 | 公开 |
| GET | /api/aunts/detail/:id | 获取阿姨详情 | 公开 |
| GET | /api/aunts/my/profile | 获取我的阿姨档案 | 已登录 |
| POST | /api/aunts | 创建阿姨档案 | 已登录 |
| PUT | /api/aunts/:id | 更新阿姨档案 | 已登录 |
| PUT | /api/aunts/:id/review | 审核阿姨档案 | 管理员 |

### 订单接口

| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| POST | /api/orders | 创建订单 | 已登录 |
| POST | /api/orders/:id/pay | 支付订单 | 已登录 |
| POST | /api/orders/:id/accept | 接单 | 阿姨 |
| POST | /api/orders/:id/start | 开始服务 | 阿姨 |
| POST | /api/orders/:id/complete | 完成订单 | 已登录 |
| POST | /api/orders/:id/cancel | 取消订单 | 已登录 |
| POST | /api/orders/:id/review | 评价订单 | 用户 |
| GET | /api/orders/my | 获取我的订单 | 已登录 |
| GET | /api/orders/:id | 获取订单详情 | 已登录 |
| GET | /api/orders/:id/logs | 获取订单状态日志 | 已登录 |
| GET | /api/orders | 获取所有订单 | 管理员 |
| PUT | /api/orders/:id/assign | 派单 | 管理员 |

### 结算接口

| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| GET | /api/settlements/my | 获取我的结算记录 | 已登录 |
| GET | /api/settlements/statistics | 获取结算统计 | 已登录 |
| GET | /api/settlements/:id | 获取结算详情 | 已登录 |
| GET | /api/settlements | 获取所有结算记录 | 管理员 |
| POST | /api/settlements/:id/settle | 确认结算 | 管理员 |

## 用户角色

- **admin**: 管理员，拥有所有权限
- **user**: 普通用户，可以下单、评价等
- **aunt**: 阿姨，可以接单、服务等

## 订单状态流转

```
待支付 (pending_payment)
    ↓ (支付/超时)
待派单 (pending_dispatch)  ← 过期 (expired)
    ↓ (平台派单)
已派单 (dispatched)
    ↓ (阿姨接单)
已接单 (accepted)
    ↓ (开始服务)
服务中 (in_service)
    ↓ (完成服务)
已完成 (completed)
    ↓ (取消)
已取消 (cancelled)
```

## 定时任务

- **超时订单处理**：每 5 分钟执行一次，自动取消超时未支付的订单

## 开发规范

1. 使用 TypeScript 强类型约束
2. 遵循 RESTful API 设计规范
3. 使用 Joi 进行请求参数验证
4. 使用统一响应格式封装
5. 全局异常捕获处理
6. 操作日志留痕
7. 数据库事务处理

## License

MIT
