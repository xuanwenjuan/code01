# 新能源充电桩运营管理后端服务

基于 Node.js + Express + TypeScript + MySQL + Sequelize 构建的新能源充电桩运营管理系统后端服务。

## 技术栈

- **运行环境**: Node.js 18+
- **框架**: Express.js
- **语言**: TypeScript
- **数据库**: MySQL 8.0
- **ORM**: Sequelize
- **认证**: JWT
- **日志**: Winston
- **定时任务**: node-cron
- **Excel导出**: ExcelJS

## 功能特性

### 用户管理
- 分级权限：管理员(admin) / 运营人员(operator) / 普通用户(user)
- 用户注册、登录、余额管理

### 站点类目管理
- 按商圈、小区、高速服务区、工业园区划分
- 树形层级结构查询
- 站点新增、停运锁定
- 收费模板绑定

### 充电桩设备管理
- 桩号、功率类型、枪头数量管理
- 在线/离线/故障/运维状态管理
- 绑定所属站点
- 自定义计费规则配置
- 批量上下线管控

### 充电订单管理
- 扫码启动充电
- 实时计费
- 中途结束充电
- 订单结算
- 开票申请
- 异常订单处理
- 订单状态自动流转

### 运营收益对账
- 按站点、时间段、设备维度统计
- 充电量、营收金额、平台分成、运维分成统计
- 对账账单生成
- 明细追溯与Excel导出

### 系统特性
- 全局异常捕获
- 操作日志留痕
- 统一响应封装
- 数据库事务支持
- 定时任务自动结算

## 快速开始

### 环境要求

- Node.js >= 18.0.0
- MySQL >= 8.0
- npm 或 yarn

### 安装依赖

```bash
npm install
```

### 环境配置

复制 `.env.example` 为 `.env` 并修改配置：

```env
NODE_ENV=development
PORT=3000

DB_HOST=localhost
DB_PORT=3306
DB_NAME=charging_pile_db
DB_USER=root
DB_PASSWORD=your_password

JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=7d

LOG_LEVEL=info
```

### 数据库初始化

```bash
# 创建数据库
# 先手动在 MySQL 中创建数据库 charging_pile_db

# 运行初始化脚本（创建表结构和测试数据）
npm run init-db
```

### 启动服务

```bash
# 开发模式
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
| POST | /api/users/register | 用户注册 | 公开 |
| POST | /api/users/login | 用户登录 | 公开 |
| GET | /api/users/me | 获取当前用户信息 | 已认证 |

### 用户管理

| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| GET | /api/users | 用户列表 | 管理员 |
| GET | /api/users/:id | 用户详情 | 管理员 |
| PUT | /api/users/:id | 更新用户 | 管理员 |
| PATCH | /api/users/:id/balance | 更新余额 | 管理员 |
| DELETE | /api/users/:id | 删除用户 | 管理员 |

### 站点分类

| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| GET | /api/site-categories/tree | 分类树形结构 | 公开 |
| GET | /api/site-categories | 分类列表 | 公开 |
| GET | /api/site-categories/:id | 分类详情 | 公开 |
| POST | /api/site-categories | 新增分类 | 管理员/运营 |
| PUT | /api/site-categories/:id | 更新分类 | 管理员/运营 |
| DELETE | /api/site-categories/:id | 删除分类 | 管理员 |

### 收费模板

| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| GET | /api/fee-templates/active | 激活模板列表 | 公开 |
| GET | /api/fee-templates | 模板列表 | 公开 |
| GET | /api/fee-templates/:id | 模板详情 | 公开 |
| POST | /api/fee-templates | 新增模板 | 管理员 |
| PUT | /api/fee-templates/:id | 更新模板 | 管理员 |
| DELETE | /api/fee-templates/:id | 删除模板 | 管理员 |

### 充电站站点

| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| GET | /api/charging-sites | 站点列表 | 公开 |
| GET | /api/charging-sites/:id | 站点详情 | 公开 |
| POST | /api/charging-sites | 新增站点 | 管理员/运营 |
| PUT | /api/charging-sites/:id | 更新站点 | 管理员/运营 |
| DELETE | /api/charging-sites/:id | 删除站点 | 管理员 |

### 充电桩设备

| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| GET | /api/charging-piles | 设备列表 | 公开 |
| GET | /api/charging-piles/:id | 设备详情 | 公开 |
| POST | /api/charging-piles | 新增设备 | 管理员/运营 |
| PUT | /api/charging-piles/:id | 更新设备 | 管理员/运营 |
| POST | /api/charging-piles/batch/status | 批量更新状态 | 管理员/运营 |
| DELETE | /api/charging-piles/:id | 删除设备 | 管理员 |

### 充电订单

| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| GET | /api/charging-orders | 订单列表 | 已认证 |
| GET | /api/charging-orders/statistics | 订单统计 | 管理员/运营 |
| GET | /api/charging-orders/:id | 订单详情 | 已认证 |
| POST | /api/charging-orders/start | 开始充电 | 已认证 |
| POST | /api/charging-orders/:id/end | 结束充电 | 已认证 |
| POST | /api/charging-orders/:id/cancel | 取消订单 | 已认证 |

### 对账结算

| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| GET | /api/settlements | 结算单列表 | 管理员/运营 |
| GET | /api/settlements/statistics | 结算统计 | 管理员/运营 |
| GET | /api/settlements/export | 导出Excel | 管理员/运营 |
| GET | /api/settlements/:id | 结算单详情 | 管理员/运营 |
| POST | /api/settlements/generate | 生成日结算 | 管理员 |
| POST | /api/settlements/:id/confirm | 确认结算 | 管理员 |

### 操作日志

| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| GET | /api/operation-logs | 日志列表 | 管理员 |
| GET | /api/operation-logs/:id | 日志详情 | 管理员 |

## 项目结构

```
src/
├── config/              # 配置文件
│   ├── database.ts      # 数据库配置
│   └── logger.ts        # 日志配置
├── controllers/         # 控制器
│   ├── user.controller.ts
│   ├── siteCategory.controller.ts
│   ├── feeTemplate.controller.ts
│   ├── chargingSite.controller.ts
│   ├── chargingPile.controller.ts
│   ├── chargingOrder.controller.ts
│   ├── settlement.controller.ts
│   └── operationLog.controller.ts
├── middleware/          # 中间件
│   ├── auth.middleware.ts
│   ├── error.middleware.ts
│   ├── validation.middleware.ts
│   └── operationLog.middleware.ts
├── models/              # 数据库模型
│   ├── User.ts
│   ├── SiteCategory.ts
│   ├── FeeTemplate.ts
│   ├── ChargingSite.ts
│   ├── ChargingPile.ts
│   ├── ChargingOrder.ts
│   ├── Settlement.ts
│   ├── OperationLog.ts
│   └── index.ts
├── services/            # 业务逻辑层
│   ├── user.service.ts
│   ├── siteCategory.service.ts
│   ├── feeTemplate.service.ts
│   ├── chargingSite.service.ts
│   ├── chargingPile.service.ts
│   ├── chargingOrder.service.ts
│   ├── settlement.service.ts
│   └── operationLog.service.ts
├── routes/              # 路由
│   ├── user.routes.ts
│   ├── siteCategory.routes.ts
│   ├── feeTemplate.routes.ts
│   ├── chargingSite.routes.ts
│   ├── chargingPile.routes.ts
│   ├── chargingOrder.routes.ts
│   ├── settlement.routes.ts
│   └── operationLog.routes.ts
├── types/               # 类型定义
│   └── index.ts
├── utils/               # 工具函数
│   ├── response.ts
│   ├── jwt.ts
│   └── password.ts
├── cron/                # 定时任务
│   └── settlement.cron.ts
├── scripts/             # 脚本
│   └── initDB.ts
└── app.ts               # 应用入口
```

## 数据库表结构

- **users**: 用户表
- **site_categories**: 站点分类表
- **fee_templates**: 收费模板表
- **charging_sites**: 充电站站点表
- **charging_piles**: 充电桩设备表
- **charging_orders**: 充电订单表
- **settlements**: 结算单表
- **operation_logs**: 操作日志表

## 开发说明

### 添加新功能

1. 在 `types/index.ts` 定义相关类型和枚举
2. 在 `models/` 目录创建对应数据模型
3. 在 `services/` 目录创建业务逻辑
4. 在 `controllers/` 目录创建控制器
5. 在 `routes/` 目录配置路由
6. 在 `app.ts` 中注册路由

### 数据库迁移

开发环境可使用 `sequelize.sync({ alter: true })` 自动同步表结构，生产环境建议使用迁移脚本。

## 许可证

MIT
