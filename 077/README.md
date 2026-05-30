# 办公设备租赁后台管理系统

基于 Node.js + Express + TypeScript + MySQL + Sequelize 构建的办公设备租赁管理系统。

## 技术栈

- **后端框架**: Express.js
- **开发语言**: TypeScript
- **数据库**: MySQL 8.0+
- **ORM**: Sequelize
- **鉴权**: JWT (JSON Web Token)
- **定时任务**: node-cron
- **其他工具**: bcryptjs, cors, helmet, morgan, joi, moment

## 功能模块

### 1. 用户与权限管理
- 用户注册、登录
- JWT 令牌鉴权
- 多角色分级权限控制
  - `super_admin`: 超级管理员
  - `admin`: 管理员
  - `finance`: 财务人员
  - `operator`: 运营人员

### 2. 设备产品类目管理
- 多级租赁类目体系（无限级）
- 类目新增、编辑、删除
- 类目停租禁用
- 前台展示排序
- 树形结构查询

### 3. 租赁设备档案管理
- 设备型号、配置参数登记
- 采购成本管理
- 在库/已租/维保/报废状态管理
- 租赁定价（日租、月租）
- 设备编号唯一管控
- 维保周期到期提醒

### 4. 客户租赁订单管理
- 企业客户信息管理
- 租期选择（日租、月租）
- 押金支付管理
- 设备出库流程
- 按期归还管理
- 逾期续租管理
- 破损赔付管理
- 订单状态自动流转
- 超时未付订单自动关闭
- 订单操作全链路留痕

### 5. 租赁财务结算管理
- 按客户维度统计租金收入
- 按租期维度统计收入
- 按设备维度统计收入
- 押金流水管理
- 逾期罚金管理
- 维保成本管理
- 月度结算报表生成
- 财务明细追溯
- 多维度报表统计

## 系统特性

- **统一响应封装**: 标准化 API 响应格式
- **全局异常捕获**: 统一错误处理机制
- **参数校验**: 使用 Joi 进行请求参数验证
- **数据库事务**: 确保数据一致性
- **操作日志**: 全链路操作留痕
- **定时任务**: 自动处理逾期订单、生成月报等

## 快速开始

### 环境要求

- Node.js >= 16.0.0
- MySQL >= 8.0
- npm >= 8.0.0

### 安装依赖

```bash
npm install
```

### 配置环境变量

复制 `.env.example` 为 `.env` 并修改配置：

```bash
cp .env.example .env
```

编辑 `.env` 文件：

```env
PORT=3000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=3306
DB_NAME=equipment_rental
DB_USER=root
DB_PASSWORD=your_password

JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=7d

LOG_LEVEL=info
```

### 初始化数据库

执行数据库初始化脚本：

```bash
mysql -u root -p < init.sql
```

或者手动创建数据库并执行 SQL 内容。

### 启动开发服务器

```bash
npm run dev
```

服务器将在 http://localhost:3000 启动

### 生产构建

```bash
npm run build
npm start
```

## API 接口文档

### 认证接口

| 方法 | 路径 | 描述 | 权限 |
|------|------|------|------|
| POST | /api/auth/register | 用户注册 | 公开 |
| POST | /api/auth/login | 用户登录 | 公开 |
| GET | /api/auth/me | 获取当前用户信息 | 已认证 |
| PUT | /api/auth/change-password | 修改密码 | 已认证 |

### 类目管理接口

| 方法 | 路径 | 描述 | 权限 |
|------|------|------|------|
| GET | /api/categories | 获取类目列表 | 公开 |
| GET | /api/categories/tree | 获取类目树形结构 | 公开 |
| GET | /api/categories/:id | 获取单个类目 | 公开 |
| POST | /api/categories | 创建类目 | 管理员 |
| PUT | /api/categories/:id | 更新类目 | 管理员 |
| DELETE | /api/categories/:id | 删除类目 | 管理员 |

### 设备管理接口

| 方法 | 路径 | 描述 | 权限 |
|------|------|------|------|
| GET | /api/equipments | 获取设备列表 | 公开 |
| GET | /api/equipments/:id | 获取单个设备 | 公开 |
| GET | /api/equipments/maintenance-reminder | 维保到期提醒 | 已认证 |
| POST | /api/equipments | 创建设备 | 运营/管理员 |
| PUT | /api/equipments/:id | 更新设备 | 运营/管理员 |
| PATCH | /api/equipments/:id/status | 更新设备状态 | 运营/管理员 |
| DELETE | /api/equipments/:id | 删除设备 | 运营/管理员 |

### 客户管理接口

| 方法 | 路径 | 描述 | 权限 |
|------|------|------|------|
| GET | /api/customers | 获取客户列表 | 已认证 |
| GET | /api/customers/:id | 获取单个客户 | 已认证 |
| POST | /api/customers | 创建客户 | 运营/管理员 |
| PUT | /api/customers/:id | 更新客户 | 运营/管理员 |
| DELETE | /api/customers/:id | 删除客户 | 运营/管理员 |

### 订单管理接口

| 方法 | 路径 | 描述 | 权限 |
|------|------|------|------|
| GET | /api/orders | 获取订单列表 | 已认证 |
| GET | /api/orders/:id | 获取单个订单 | 已认证 |
| GET | /api/orders/:id/logs | 获取订单操作日志 | 已认证 |
| POST | /api/orders | 创建订单 | 运营/管理员 |
| PUT | /api/orders/:id | 更新订单 | 运营/管理员 |
| DELETE | /api/orders/:id/cancel | 取消订单 | 运营/管理员 |
| POST | /api/orders/:id/pay-deposit | 押金支付 | 运营/管理员 |
| POST | /api/orders/:id/deliver | 设备出库 | 运营/管理员 |
| POST | /api/orders/:id/start-rental | 开始租赁 | 运营/管理员 |
| POST | /api/orders/:id/return | 设备归还 | 运营/管理员 |
| POST | /api/orders/:id/pay-rent | 租金结算 | 运营/管理员 |

### 财务接口

| 方法 | 路径 | 描述 | 权限 |
|------|------|------|------|
| GET | /api/finance/payments | 获取支付记录列表 | 财务/管理员 |
| GET | /api/finance/income-statistics | 获取收入统计 | 财务/管理员 |
| GET | /api/finance/customer/:customerId | 客户财务明细 | 财务/管理员 |
| GET | /api/finance/equipment/:equipmentId | 设备财务明细 | 财务/管理员 |
| GET | /api/finance/reports | 获取报表列表 | 财务/管理员 |
| GET | /api/finance/reports/monthly/:year/:month | 获取月度报表 | 财务/管理员 |
| POST | /api/finance/reports/monthly/generate | 生成月度报表 | 财务/管理员 |

## 项目结构

```
src/
├── app.ts                      # 应用入口
├── config/                     # 配置文件
│   └── index.ts
├── types/                      # 类型定义
│   └── index.ts
├── database/                   # 数据库相关
│   ├── index.ts               # 数据库连接
│   ├── associations.ts        # 模型关联
│   └── models/                # 数据模型
│       ├── User.model.ts
│       ├── Category.model.ts
│       ├── Equipment.model.ts
│       ├── Customer.model.ts
│       ├── RentalOrder.model.ts
│       ├── OrderLog.model.ts
│       ├── PaymentRecord.model.ts
│       ├── FinancialReport.model.ts
│       └── OperationLog.model.ts
├── controllers/                # 控制器
│   ├── auth.controller.ts
│   ├── category.controller.ts
│   ├── equipment.controller.ts
│   ├── customer.controller.ts
│   ├── order.controller.ts
│   └── finance.controller.ts
├── routes/                     # 路由
│   ├── auth.routes.ts
│   ├── category.routes.ts
│   ├── equipment.routes.ts
│   ├── customer.routes.ts
│   ├── order.routes.ts
│   └── finance.routes.ts
├── middlewares/                # 中间件
│   ├── auth.middleware.ts
│   └── errorHandler.middleware.ts
├── exceptions/                 # 异常类
│   └── http.exception.ts
├── utils/                      # 工具函数
│   ├── response.ts
│   ├── validate.ts
│   └── orderNo.ts
└── scheduledTasks.ts           # 定时任务
```

## 订单状态流转

```
待支付押金(PENDING_PAYMENT)
    │
    ├─> 支付押金 ──> 已支付(PAID) ──> 设备出库 ──> 已出库(DELIVERED)
    │                                                        │
    │                                                        └─> 客户确认 ──> 租赁中(IN_USE)
    │                                                                     │
    │                                                                     ├─> [到期] ──> 租赁中(IN_USE)
    │                                                                     │      │
    │                                                                     │      └─> [逾期] ──> 已逾期(OVERDUE)
    │                                                                     │             │
    │                                                                     └─────────────┴─> 归还设备 ──> 已归还(RETURNED)
    │                                                                                                  │
    │                                                                                                  └─> 租金结算 ──> 已完成(COMPLETED)
    │
    └─> [超时/取消] ──> 已取消(CANCELLED)
```

## 定时任务

系统内置以下定时任务：

1. **逾期订单检查**: 每小时执行，自动将到期未还的订单标记为逾期
2. **即将到期提醒**: 每天 9:00 执行，提醒即将到期的订单
3. **维保到期提醒**: 每天 10:00 执行，提醒即将需要维保的设备
4. **月度报表生成**: 每月 1 日凌晨 2:00 执行，自动生成上月财务报表

## 开发说明

### 响应格式

所有 API 响应遵循统一格式：

```json
{
  "code": 200,
  "message": "操作成功",
  "data": {},
  "success": true
}
```

分页响应：

```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "list": [],
    "total": 100,
    "page": 1,
    "pageSize": 10
  },
  "success": true
}
```

### 错误码

- `200`: 成功
- `400`: 请求参数错误
- `401`: 未授权
- `403`: 无权限
- `404`: 资源不存在
- `500`: 服务器内部错误

## 许可证

ISC
