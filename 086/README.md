# 同城家政服务派单后端服务

基于 Node.js + Express + TypeScript 构建的家政服务派单系统后端。

## 技术栈

- **后端框架**: Express.js
- **编程语言**: TypeScript
- **ORM**: Sequelize
- **数据库**: MySQL
- **认证**: JWT (JSON Web Token)
- **其他**: node-cron (定时任务), helmet (安全头), cors (跨域)

## 功能模块

### 1. 家政服务类目模块
- 多级服务分类（无限级树形结构）
- 类目新增、编辑、删除
- 前台排序配置
- 服务类目启用/停用
- 佣金比例配置

### 2. 家政师傅档案模块
- 师傅资质登记与管理
- 擅长工种、服务区域配置
- 在岗/休息/封禁状态管理
- 证件到期提醒
- 多条件精准检索

### 3. 用户家政订单模块
- 用户下单选择服务
- 填写地址与服务时间
- 支付流程
- 平台派单功能
- 师傅上门服务
- 服务验收与评价
- 订单状态自动流转
- 超时未接单自动改派

### 4. 平台师傅结算模块
- 按服务类目自动抽取佣金
- 核算师傅到手收入
- 月度接单统计
- 结算账单生成
- 提现记录追溯

## 项目结构

```
src/
├── config/              # 配置文件
│   ├── env.ts          # 环境变量
│   └── database.ts     # 数据库配置
├── models/             # 数据模型
│   ├── User.ts
│   ├── ServiceCategory.ts
│   ├── Worker.ts
│   ├── Order.ts
│   ├── Settlement.ts
│   ├── OperationLog.ts
│   └── OrderStatusHistory.ts
├── controllers/        # 控制器
├── services/          # 业务逻辑层
├── middleware/        # 中间件
│   ├── auth.ts        # 认证中间件
│   ├── validation.ts  # 参数验证中间件
│   ├── errorHandler.ts # 异常处理中间件
│   └── operationLog.ts # 操作日志中间件
├── routes/            # 路由定义
├── types/             # 类型定义
├── utils/             # 工具函数
│   ├── response.ts    # 统一响应封装
│   ├── logger.ts      # 日志工具
│   └── scheduler.ts   # 定时任务
├── exceptions/        # 异常类
└── app.ts             # 应用入口
```

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env` 并修改配置：

```env
NODE_ENV=development
PORT=3000

DB_HOST=localhost
DB_PORT=3306
DB_NAME=housekeeping_service
DB_USER=root
DB_PASSWORD=your_password

JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=7d
```

### 3. 创建数据库

在 MySQL 中创建数据库：

```sql
CREATE DATABASE housekeeping_service CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 4. 启动项目

开发模式：
```bash
npm run dev
```

生产模式：
```bash
npm run build
npm start
```

## API 接口

### 认证接口
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `GET /api/auth/me` - 获取当前用户信息

### 服务类目接口
- `GET /api/service-categories/tree` - 获取类目树
- `GET /api/service-categories` - 获取类目列表
- `GET /api/service-categories/:id` - 获取类目详情
- `POST /api/service-categories` - 创建类目 (管理员)
- `PUT /api/service-categories/:id` - 更新类目 (管理员)
- `DELETE /api/service-categories/:id` - 删除类目 (管理员)

### 师傅档案接口
- `GET /api/workers` - 获取师傅列表
- `GET /api/workers/dispatch` - 获取可派单师傅
- `GET /api/workers/:id` - 获取师傅详情
- `POST /api/workers` - 创建师傅档案 (管理员)
- `PUT /api/workers/:id` - 更新师傅档案 (管理员)
- `PATCH /api/workers/:id/status` - 更新师傅状态

### 订单接口
- `POST /api/orders` - 创建订单
- `GET /api/orders/my` - 获取我的订单（客户）
- `GET /api/orders/worker` - 获取我的订单（师傅）
- `GET /api/orders/:orderId` - 获取订单详情
- `PATCH /api/orders/:orderId/pay` - 支付订单
- `PATCH /api/orders/:orderId/assign` - 派单 (管理员)
- `PATCH /api/orders/:orderId/status/:status` - 更新订单状态

### 结算接口
- `GET /api/settlements` - 获取结算列表
- `GET /api/settlements/:id` - 获取结算详情
- `GET /api/settlements/worker/:workerId/summary` - 获取师傅结算汇总
- `GET /api/settlements/worker/:workerId/withdraw-history` - 获取提现记录
- `POST /api/settlements/withdraw` - 申请提现
- `POST /api/settlements/settle-all` - 批量结算 (管理员)

## 角色权限

- **ADMIN (管理员)**: 系统管理、类目管理、订单派单、结算管理
- **WORKER (师傅)**: 接单管理、服务管理、收入结算
- **CUSTOMER (客户)**: 下单、支付、评价

## 订单状态流转

```
待支付 → 待派单 → 已派单 → 师傅已出发 → 服务中 → 已完成
                         ↓
                       已取消
```

## 定时任务

- 每5分钟检查超时未接单订单
- 支持定期结算处理

## 操作日志

系统自动记录所有用户操作，包括：
- 操作人
- 操作时间
- 操作模块
- 请求参数
- 响应结果
- 操作状态

## 开发说明

- 遵循 RESTful API 规范
- 严格的 TypeScript 类型约束
- 统一的响应格式
- 全局异常捕获
- 数据库事务支持
- 操作日志留痕

## 许可证

MIT
