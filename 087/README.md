# 气象观测站点设备运维管理系统后端服务

## 项目简介

基于 Node.js + Express + TypeScript + MySQL + Sequelize 构建的气象观测站点设备运维管理系统后端服务，提供设备类目管理、观测站点档案、巡检工单管理、运维耗材台账等功能模块。

## 技术栈

- **运行环境**: Node.js 16+
- **框架**: Express.js
- **语言**: TypeScript
- **数据库**: MySQL 8.0+
- **ORM**: Sequelize
- **认证**: JWT (JSON Web Token)
- **定时任务**: node-cron
- **日志**: Winston
- **参数校验**: express-validator

## 功能模块

### 1. 用户认证与权限管理
- 登录/注册
- JWT 鉴权
- 多角色权限控制（管理员/运维人员/巡检人员）
- 密码修改
- 操作日志记录

### 2. 气象设备类目模块
- 多级设备分类管理
- 类目新增/编辑/删除
- 型号停产停用状态管理
- 树形递归查询
- 排序配置

### 3. 观测站点档案模块
- 站点信息管理（经纬度、归属辖区、建站时间等）
- 站点状态管理（正常/故障/维护中）
- 站点编号唯一管控
- 定期巡检到期提醒
- 站点统计分析

### 4. 设备巡检工单模块
- 巡检任务创建与分配
- 到站数据核验（温湿度、风速风向、气压辐射等）
- 设备故障上报
- 维修更换记录
- 复检闭环归档
- 工单状态自动流转（待处理→进行中→故障上报→维修中→复检→已完成）
- 超时未巡检自动预警

### 5. 运维耗材台账模块
- 耗材出入库管理
- 按设备类型统计消耗
- 按辖区站点统计消耗
- 备件库存余量监控
- 运维耗材消耗报表统计
- 巡检明细与耗材对账追溯

## 项目结构

```
meteorological-equipment-maintenance/
├── src/
│   ├── config/              # 配置文件
│   │   ├── database.ts     # 数据库配置
│   │   └── jwt.ts          # JWT 配置
│   ├── controllers/         # 控制器
│   ├── exceptions/          # 异常类
│   ├── middleware/          # 中间件
│   ├── models/              # 数据模型
│   ├── routes/              # 路由
│   ├── services/            # 业务逻辑
│   ├── types/               # 类型定义
│   ├── utils/               # 工具函数
│   ├── scripts/             # 脚本文件
│   └── app.ts              # 应用入口
├── logs/                    # 日志目录
├── .env                     # 环境变量
├── tsconfig.json           # TypeScript 配置
├── package.json            # 项目依赖
└── README.md               # 项目说明
```

## 快速开始

### 环境要求

- Node.js 16.0+
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
DB_NAME=meteorological_maintenance
DB_USER=root
DB_PASSWORD=your_password

JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=24h

LOG_LEVEL=info
```

### 初始化数据库

```bash
npx ts-node src/scripts/initDB.ts
```

该命令会自动创建数据库表并生成默认管理员账号：
- 账号: `admin`
- 密码: `admin123`

### 启动开发服务

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

### 启动生产服务

```bash
npm start
```

## API 接口文档

### 认证相关

| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| POST | /api/auth/login | 用户登录 | 公开 |
| POST | /api/auth/register | 用户注册 | 管理员 |
| POST | /api/auth/change-password | 修改密码 | 已认证 |
| GET | /api/auth/user-info | 获取用户信息 | 已认证 |
| GET | /api/auth/users | 用户列表 | 管理员 |
| PUT | /api/auth/users/:id | 更新用户信息 | 管理员 |
| DELETE | /api/auth/users/:id | 删除用户 | 管理员 |

### 设备类目

| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| POST | /api/equipment-categories | 创建类目 | 管理员/运维 |
| PUT | /api/equipment-categories/:id | 更新类目 | 管理员/运维 |
| DELETE | /api/equipment-categories/:id | 删除类目 | 管理员 |
| GET | /api/equipment-categories/:id | 获取类目详情 | 已认证 |
| GET | /api/equipment-categories | 类目列表 | 已认证 |
| GET | /api/equipment-categories/tree/data | 类目树 | 已认证 |
| PATCH | /api/equipment-categories/:id/status | 更新状态 | 管理员/运维 |

### 观测站点

| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| POST | /api/observation-sites | 创建站点 | 管理员/运维 |
| PUT | /api/observation-sites/:id | 更新站点 | 管理员/运维 |
| DELETE | /api/observation-sites/:id | 删除站点 | 管理员 |
| GET | /api/observation-sites/:id | 获取站点详情 | 已认证 |
| GET | /api/observation-sites | 站点列表 | 已认证 |
| PATCH | /api/observation-sites/:id/status | 更新状态 | 管理员/运维 |
| GET | /api/observation-sites/needing-inspection/list | 待巡检站点 | 已认证 |
| GET | /api/observation-sites/statistics/data | 站点统计 | 已认证 |

### 巡检工单

| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| POST | /api/inspection-work-orders | 创建工单 | 管理员/运维 |
| POST | /api/inspection-work-orders/batch/create | 批量创建工单 | 管理员/运维 |
| PUT | /api/inspection-work-orders/:id | 更新工单 | 管理员/运维 |
| DELETE | /api/inspection-work-orders/:id | 删除工单 | 管理员 |
| GET | /api/inspection-work-orders/:id | 获取工单详情 | 已认证 |
| GET | /api/inspection-work-orders | 工单列表 | 已认证 |
| PATCH | /api/inspection-work-orders/:id/start | 开始巡检 | 管理员/巡检 |
| PATCH | /api/inspection-work-orders/:id/submit-inspection | 提交巡检结果 | 管理员/巡检 |
| PATCH | /api/inspection-work-orders/:id/assign-maintenance | 分配维修 | 管理员/运维 |
| PATCH | /api/inspection-work-orders/:id/submit-maintenance | 提交维修结果 | 管理员/运维 |
| PATCH | /api/inspection-work-orders/:id/submit-reinspection | 提交复检结果 | 管理员/巡检 |
| GET | /api/inspection-work-orders/overdue/list | 超时工单 | 已认证 |
| GET | /api/inspection-work-orders/statistics/data | 工单统计 | 已认证 |

### 耗材台账

| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| POST | /api/consumable-records | 创建记录 | 管理员/运维 |
| PUT | /api/consumable-records/:id | 更新记录 | 管理员/运维 |
| DELETE | /api/consumable-records/:id | 删除记录 | 管理员 |
| GET | /api/consumable-records/:id | 获取记录详情 | 已认证 |
| GET | /api/consumable-records | 记录列表 | 已认证 |
| GET | /api/consumable-records/inventory/statistics | 库存统计 | 已认证 |
| GET | /api/consumable-records/consumption/by-site | 按站点消耗统计 | 已认证 |
| GET | /api/consumable-records/consumption/by-category | 按分类消耗统计 | 已认证 |
| GET | /api/consumable-records/consumption/report | 消耗报表 | 已认证 |

## 用户角色说明

### 管理员 (admin)
- 拥有系统所有权限
- 用户管理
- 系统配置

### 运维人员 (maintenance)
- 设备类目管理
- 站点管理
- 维修工单处理
- 耗材管理

### 巡检人员 (inspection)
- 执行巡检任务
- 提交巡检结果
- 故障上报
- 复检任务

## 定时任务

系统内置以下定时任务（每天凌晨0点执行）：

1. **超时工单检查** - 自动标记超期未处理的工单

## 开发说明

### 代码规范

项目使用 ESLint 进行代码规范检查，执行以下命令：

```bash
# 检查代码规范
npm run lint

# 自动修复
npm run lint:fix
```

### 数据库模型

所有模型定义在 `src/models/` 目录下，使用 Sequelize 定义模型及关联关系。

### 业务逻辑

业务逻辑统一放在 `src/services/` 目录，控制器只负责请求参数处理和响应格式化。

### 异常处理

统一异常处理中间件会捕获所有异常，返回统一格式的错误响应。

### 日志管理

- 系统日志输出到 `logs/` 目录
- 操作日志记录到数据库 `operation_logs` 表

## 许可证

MIT
