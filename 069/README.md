# 公路物流货运调度管理后端服务

基于 Node.js + Express + TypeScript + MySQL + Sequelize 构建的物流货运调度管理系统后端服务。

## 技术栈

- **运行时**: Node.js
- **框架**: Express.js
- **语言**: TypeScript
- **数据库**: MySQL 8.0+
- **ORM**: Sequelize
- **认证**: JWT (JSON Web Token)
- **任务调度**: node-cron
- **日志**: 自定义 Logger + morgan
- **参数校验**: Joi
- **安全**: Helmet, CORS, bcryptjs

## 功能模块

### 1. 用户认证与权限管理
- 用户注册/登录
- JWT Token 认证
- 多角色分级权限（管理员、经理、调度员、司机、客户）
- 密码加密存储
- 密码修改

### 2. 线路网点分类管理
- 网点增删改查
- 网点类型（干线线路、省内支线、同城配送）
- 树形层级结构
- 上级网点绑定
- 网点状态管理（运营中、停运、注销）

### 3. 货运车辆档案管理
- 车辆信息管理（车牌号、车型、载重等）
- 司机信息管理
- 营运证件管理
- 车辆状态管理（空闲、在途、维保）
- 车辆归属网点绑定
- 证件到期预警（自动定时检查）

### 4. 货运托运订单管理
- 货主下单
- 订单全流程状态流转（待揽收→已揽收→干线运输→中转分拨→末端派送→已送达→已签收）
- 异常订单标记
- 订单操作日志全链路追踪
- 订单统计分析

### 5. 运费结算对账管理
- 按线路/车辆/网点自动核算运费
- 网点提成计算（默认10%）
- 司机运费计算（默认60%）
- 结算单生成与管理
- 未结算/已结算状态管控
- 结算明细追溯
- 自动月度结算（每月1日）

## 系统特性

### 全局异常捕获
- 统一的错误处理中间件
- 标准化错误响应格式
- 错误日志记录

### 操作日志留痕
- 所有关键操作自动记录
- 包含操作人、操作时间、IP地址等
- 支持按模块、操作类型查询

### 统一响应封装
- 标准化 API 响应格式
- 统一的成功/失败处理
- 响应时间戳

### 数据库事务
- 关键业务操作支持事务
- 保证数据一致性

### 定时任务
- 车辆证件到期检查（每天9:00）
- 自动月度结算（每月1日2:00）
- 订单状态自动清理（每天3:00）

## 项目结构

```
src/
├── config/              # 配置文件
│   └── database.ts     # 数据库配置
├── controllers/         # 控制器
│   ├── authController.ts
│   ├── branchController.ts
│   ├── vehicleController.ts
│   ├── orderController.ts
│   └── settlementController.ts
├── middleware/          # 中间件
│   ├── auth.ts         # 认证中间件
│   ├── errorHandler.ts # 错误处理中间件
│   └── operationLog.ts # 操作日志中间件
├── models/              # 数据模型
│   ├── Role.ts
│   ├── User.ts
│   ├── OperationLog.ts
│   ├── Branch.ts
│   ├── Vehicle.ts
│   ├── Order.ts
│   ├── OrderLog.ts
│   ├── Settlement.ts
│   └── SettlementItem.ts
├── routes/              # 路由
│   ├── auth.ts
│   ├── branches.ts
│   ├── vehicles.ts
│   ├── orders.ts
│   └── settlements.ts
├── services/            # 业务逻辑
│   ├── authService.ts
│   ├── branchService.ts
│   ├── vehicleService.ts
│   ├── orderService.ts
│   ├── settlementService.ts
│   └── schedulerService.ts
├── utils/               # 工具函数
│   ├── errors.ts       # 自定义错误类
│   ├── logger.ts       # 日志工具
│   ├── response.ts     # 响应工具
│   └── validation.ts   # 参数校验工具
└── app.ts               # 应用入口
```

## 快速开始

### 环境要求

- Node.js 16+
- MySQL 8.0+

### 安装依赖

```bash
npm install
```

### 配置环境变量

复制 `.env` 文件并根据实际情况修改：

```env
PORT=3000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=3306
DB_NAME=logistics_dispatch
DB_USER=root
DB_PASSWORD=your_password

JWT_SECRET=your-secret-key-here-change-in-production
JWT_EXPIRES_IN=24h
```

### 初始化数据库

首先创建数据库：

```sql
CREATE DATABASE logistics_dispatch CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 启动服务

#### 开发模式

```bash
npm run dev
```

#### 构建生产版本

```bash
npm run build
npm start
```

### 系统初始化

首次启动后，调用初始化接口创建默认角色和管理员账号：

```bash
POST http://localhost:3000/api/auth/init
```

默认管理员账号：
- 用户名：`admin`
- 密码：`123456`

## API 接口文档

### 认证接口

| 方法 | 路径 | 描述 | 权限 |
|------|------|------|------|
| POST | /api/auth/register | 用户注册 | 公开 |
| POST | /api/auth/login | 用户登录 | 公开 |
| GET | /api/auth/me | 获取当前用户信息 | 已认证 |
| POST | /api/auth/change-password | 修改密码 | 已认证 |
| POST | /api/auth/init | 系统初始化 | 公开 |

### 网点管理接口

| 方法 | 路径 | 描述 | 权限 |
|------|------|------|------|
| POST | /api/branches | 创建网点 | 管理员/经理 |
| PUT | /api/branches/:id | 更新网点 | 管理员/经理 |
| DELETE | /api/branches/:id | 删除网点 | 管理员 |
| GET | /api/branches/:id | 获取网点详情 | 已认证 |
| GET | /api/branches | 获取网点列表 | 已认证 |
| GET | /api/branches/tree | 获取网点树 | 已认证 |
| PATCH | /api/branches/:id/status | 更新网点状态 | 管理员/经理 |
| PATCH | /api/branches/:id/parent | 绑定上级网点 | 管理员/经理 |

### 车辆管理接口

| 方法 | 路径 | 描述 | 权限 |
|------|------|------|------|
| POST | /api/vehicles | 创建车辆 | 管理员/经理 |
| PUT | /api/vehicles/:id | 更新车辆 | 管理员/经理 |
| DELETE | /api/vehicles/:id | 删除车辆 | 管理员 |
| GET | /api/vehicles/:id | 获取车辆详情 | 已认证 |
| GET | /api/vehicles | 获取车辆列表 | 已认证 |
| PATCH | /api/vehicles/:id/status | 更新车辆状态 | 管理员/经理/调度员 |
| PATCH | /api/vehicles/:id/branch | 绑定网点 | 管理员/经理 |
| GET | /api/vehicles/expiring | 获取即将到期证件车辆 | 管理员/经理 |
| GET | /api/vehicles/available | 获取空闲车辆 | 已认证 |

### 订单管理接口

| 方法 | 路径 | 描述 | 权限 |
|------|------|------|------|
| POST | /api/orders | 创建订单 | 已认证 |
| PUT | /api/orders/:id | 更新订单 | 管理员/经理/调度员 |
| GET | /api/orders/:id | 获取订单详情 | 已认证 |
| GET | /api/orders | 获取订单列表 | 已认证 |
| GET | /api/orders/statistics | 获取订单统计 | 已认证 |
| PATCH | /api/orders/:id/pickup | 揽收订单 | 管理员/经理/调度员 |
| PATCH | /api/orders/:id/transit | 开始干线运输 | 管理员/经理/调度员 |
| PATCH | /api/orders/:id/transfer | 中转分拨 | 管理员/经理/调度员 |
| PATCH | /api/orders/:id/delivery | 开始派送 | 管理员/经理/调度员 |
| PATCH | /api/orders/:id/sign | 签收订单 | 管理员/经理/调度员 |
| PATCH | /api/orders/:id/abnormal | 标记异常 | 管理员/经理/调度员 |
| PATCH | /api/orders/:id/cancel | 取消订单 | 管理员/经理 |
| GET | /api/orders/:id/logs | 获取订单操作日志 | 已认证 |

### 结算管理接口

| 方法 | 路径 | 描述 | 权限 |
|------|------|------|------|
| POST | /api/settlements | 创建结算单 | 管理员/经理 |
| GET | /api/settlements | 获取结算单列表 | 已认证 |
| GET | /api/settlements/statistics | 获取结算统计 | 已认证 |
| GET | /api/settlements/:id | 获取结算单详情 | 已认证 |
| GET | /api/settlements/:id/items | 获取结算明细 | 已认证 |
| PATCH | /api/settlements/:id/confirm | 确认结算 | 管理员/经理 |
| PATCH | /api/settlements/:id/cancel | 取消结算 | 管理员/经理 |

## 统一响应格式

### 成功响应

```json
{
  "code": 200,
  "message": "操作成功",
  "data": { /* 数据对象 */ },
  "success": true,
  "timestamp": 1699999999999
}
```

### 失败响应

```json
{
  "code": 400,
  "message": "错误描述",
  "success": false,
  "timestamp": 1699999999999
}
```

## 角色权限说明

- **admin (超级管理员)**: 拥有所有权限
- **manager (经理)**: 网点、车辆、订单、结算的管理权限
- **dispatcher (调度员)**: 订单调度、车辆查看权限
- **driver (司机)**: 订单、车辆查看权限
- **customer (客户)**: 创建订单、查看订单权限

## 定时任务说明

1. **车辆证件到期检查**：每天 9:00 执行，检查 30 天内证件即将到期的车辆
2. **自动月度结算**：每月 1 日 2:00 执行，为所有网点自动生成上月结算单
3. **订单状态清理**：每天 3:00 执行，自动签收送达超过 30 天的订单

## 开发说明

### TypeScript 编译

```bash
npm run build
```

### 代码检查

```bash
npm run lint
```

## 许可证

MIT
