# 赛马驯养草料物资统筹后端服务

基于 Node.js + Express + TypeScript + MySQL + Sequelize 的赛马驯养草料物资统筹管理系统。

## 技术栈

- **Node.js** - 运行环境
- **Express** - Web 框架
- **TypeScript** - 类型系统
- **MySQL** - 数据库
- **Sequelize** - ORM 框架
- **JWT** - 身份认证
- **node-cron** - 定时任务
- **winston** - 日志系统
- **joi** - 参数校验

## 功能模块

### 1. 用户权限管理
- 多角色支持：管理员、驯养员、仓管、采购员
- JWT 身份认证
- 基于角色的权限控制

### 2. 饲草料类目管理
- 精粮饲料、青储牧草、营养补剂、驱虫药剂四大类目
- 无限级树形分类
- 类目新增、编辑、停用
- 库房存放排序
- 库存管理

### 3. 种马存栏档案管理
- 马匹品系登记
- 年龄、体重、驯养等级管理
- 健康/休养/参赛状态管理
- 日粮标准配置
- 防疫周期到期提醒

### 4. 日粮配比申领管理
- 按马舍批量申领草料
- 定制饲喂配方
- 申领审批流程
- 定时投放登记
- 剩余物料退回
- 变质食材报损
- 超时未申领自动作废
- 单据状态流转

### 5. 驯养成本核算
- 按草料品类统计消耗量
- 按马舍分区统计成本
- 采购均价计算
- 饲喂损耗统计
- 整体驯养开支分析
- 成本报表生成
- 领用明细与财务对账追溯

## 快速开始

### 环境要求

- Node.js >= 16.0.0
- MySQL >= 8.0

### 安装依赖

```bash
npm install
```

### 配置环境变量

复制 `.env.example` 为 `.env` 并修改配置：

```bash
cp .env.example .env
```

配置说明：
```env
PORT=3000                      # 服务端口
NODE_ENV=development           # 运行环境

DB_HOST=localhost              # 数据库主机
DB_PORT=3306                   # 数据库端口
DB_NAME=horse_forage_management  # 数据库名称
DB_USER=root                   # 数据库用户名
DB_PASSWORD=password           # 数据库密码

JWT_SECRET=your_jwt_secret     # JWT 密钥
JWT_EXPIRES_IN=7d              # JWT 过期时间

LOG_LEVEL=info                 # 日志级别
```

### 初始化数据库

创建数据库：
```sql
CREATE DATABASE horse_forage_management CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

初始化数据（创建默认账户）：
```bash
npm run init
```

默认账户：
- 管理员: admin / admin123
- 驯养员: trainer / trainer123
- 仓管: warehouse / warehouse123
- 采购: purchaser / purchaser123

### 启动开发服务

```bash
npm run dev
```

服务将在 http://localhost:3000 启动

### 生产构建

```bash
npm run build
npm start
```

## API 接口文档

### 认证相关

| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| POST | /api/auth/login | 用户登录 | 公开 |
| POST | /api/auth/register | 创建用户 | 管理员 |
| GET | /api/auth/profile | 获取当前用户信息 | 已登录 |
| GET | /api/auth/users | 获取用户列表 | 管理员 |
| GET | /api/auth/users/:id | 获取用户详情 | 管理员 |
| PUT | /api/auth/users/:id | 更新用户信息 | 管理员 |
| DELETE | /api/auth/users/:id | 删除用户 | 管理员 |

### 饲草料类目

| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| POST | /api/forage/categories | 创建类目 | 管理员/仓管 |
| GET | /api/forage/categories/tree | 获取分类树 | 已登录 |
| GET | /api/forage/categories | 获取类目列表 | 已登录 |
| GET | /api/forage/categories/:id | 获取类目详情 | 已登录 |
| PUT | /api/forage/categories/:id | 更新类目 | 管理员/仓管 |
| DELETE | /api/forage/categories/:id | 删除类目 | 管理员 |
| PUT | /api/forage/categories/:id/inventory | 更新库存 | 管理员/仓管 |

### 马匹管理

| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| POST | /api/horses | 创建马匹档案 | 管理员/驯养员 |
| GET | /api/horses | 获取马匹列表 | 已登录 |
| GET | /api/horses/vaccination-reminders | 获取防疫提醒 | 已登录 |
| GET | /api/horses/:id | 获取马匹详情 | 已登录 |
| PUT | /api/horses/:id | 更新马匹信息 | 管理员/驯养员 |
| DELETE | /api/horses/:id | 删除马匹档案 | 管理员 |

### 日粮申领

| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| POST | /api/applications | 创建申领单 | 管理员/驯养员 |
| GET | /api/applications | 获取申领单列表 | 已登录 |
| GET | /api/applications/:id | 获取申领单详情 | 已登录 |
| PUT | /api/applications/:id/approve | 审批申领单 | 管理员/仓管 |
| PUT | /api/applications/:id/deliver | 出库发放 | 管理员/仓管 |
| PUT | /api/applications/:id/return | 物料退回 | 管理员/仓管 |
| PUT | /api/applications/:id/damage | 物料报损 | 管理员/仓管 |
| PUT | /api/applications/:id/complete | 完成申领单 | 管理员/驯养员/仓管 |
| PUT | /api/applications/:id/reject | 驳回申领单 | 管理员/仓管 |
| PUT | /api/applications/:id/cancel | 取消申领单 | 管理员/驯养员 |

### 成本核算

| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| POST | /api/costs/generate-daily | 生成日报 | 管理员/仓管/采购 |
| GET | /api/costs/report | 获取成本报表 | 管理员/仓管/采购 |
| GET | /api/costs/category-stats | 获取类目消耗统计 | 管理员/仓管/采购 |
| GET | /api/costs/stable-stats | 获取马舍成本统计 | 管理员/仓管/采购 |
| GET | /api/costs/monthly-trend | 获取月度趋势 | 管理员/仓管/采购 |

## 定时任务

系统内置以下定时任务：

1. **每小时执行** - 处理过期申领单
2. **每天凌晨 1 点执行** - 生成每日成本报告

## 项目结构

```
src/
├── config/              # 配置文件
│   └── index.ts
├── controllers/         # 控制器
│   ├── auth.controller.ts
│   ├── forage.controller.ts
│   ├── horse.controller.ts
│   ├── application.controller.ts
│   └── cost.controller.ts
├── database/            # 数据库配置
│   └── index.ts
├── middlewares/         # 中间件
│   ├── auth.ts
│   ├── errorHandler.ts
│   └── validation.ts
├── models/              # 数据模型
│   ├── User.ts
│   ├── ForageCategory.ts
│   ├── Horse.ts
│   ├── Stable.ts
│   ├── ForageApplication.ts
│   ├── ApplicationItem.ts
│   ├── ForageInventory.ts
│   ├── CostRecord.ts
│   ├── OperationLog.ts
│   └── index.ts
├── routes/              # 路由配置
│   ├── auth.routes.ts
│   ├── forage.routes.ts
│   ├── horse.routes.ts
│   ├── application.routes.ts
│   └── cost.routes.ts
├── services/            # 业务逻辑
│   ├── auth.service.ts
│   ├── forage.service.ts
│   ├── horse.service.ts
│   ├── application.service.ts
│   ├── cost.service.ts
│   └── cron.service.ts
├── utils/               # 工具函数
│   ├── response.ts
│   └── logger.ts
├── constants/           # 常量定义
│   └── index.ts
├── validations/         # 验证规则
│   ├── auth.validation.ts
│   └── forage.validation.ts
├── scripts/             # 脚本文件
│   └── init.ts
└── app.ts               # 应用入口
```

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

### 分页响应
```json
{
  "code": 200,
  "message": "查询成功",
  "data": {
    "list": [],
    "total": 100,
    "page": 1,
    "pageSize": 10,
    "totalPages": 10
  },
  "success": true,
  "timestamp": 1699999999999
}
```

### 错误响应
```json
{
  "code": 400,
  "message": "错误信息",
  "success": false,
  "timestamp": 1699999999999
}
```

## 业务状态流转

### 申领单状态流转

```
待审核(pending)
    ↓
┌───┴───┐
↓       ↓
已批准  已拒绝(rejected)
(approved)
    ↓
  已发货(delivered)
    ↓
  已完成(completed)

* 待审核/已批准状态可取消(cancelled)
* 超过24小时未审批自动过期(expired)
```

### 马匹状态流转

```
healthy(健康) → resting(休养) → racing(参赛)
    ↑              ↓              ↑
    └──────────────┴──────────────┘
                    ↓
                 sick(生病)
```

## 开发说明

### 新增模块

1. 在 `src/models/` 创建数据模型
2. 在 `src/services/` 创建业务逻辑
3. 在 `src/controllers/` 创建控制器
4. 在 `src/routes/` 创建路由配置
5. 在 `src/app.ts` 注册路由

### 权限控制

使用中间件进行权限控制：
- `authenticate` - 验证 JWT token
- `requireRole('admin', 'trainer')` - 验证角色权限

### 日志记录

使用 winston 进行日志记录：
- `logger.info()` - 信息日志
- `logger.error()` - 错误日志
- `logger.debug()` - 调试日志

## 许可证

ISC
