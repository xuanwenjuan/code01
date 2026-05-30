# 赛鸽繁育训放追踪管理后端服务

## 项目简介

基于 Node.js + Express + TypeScript 构建的赛鸽繁育训放管理系统后端服务，提供完整的赛鸽全生命周期管理、繁育记录、训放参赛工单、财务开销等功能。

## 技术栈

- **运行时**: Node.js
- **框架**: Express.js
- **类型系统**: TypeScript
- **ORM**: Sequelize
- **数据库**: MySQL
- **认证**: JWT (JSON Web Token)
- **日志**: Winston + Morgan
- **定时任务**: node-cron
- **参数校验**: Joi
- **安全**: Helmet + CORS

## 功能模块

### 1. 用户与权限管理
- 多角色权限：管理员(ADMIN)、繁育员(BREEDER)、训放员(TRAINER)、财务(FINANCE)
- JWT 认证登录
- 操作日志记录

### 2. 赛鸽品系类目模块
- 无限级树形分类结构
- 类目新增、编辑、删除
- 品类状态管理（启用/停用）
- 排序展示

### 3. 种鸽血统档案模块
- 赛鸽基础信息管理（足环号、血统、性别、出生日期等）
- 血统谱系管理（父鸽、母鸽关联）
- 健康状态追踪
- 防疫驱虫到期提醒
- 在棚/训放/参赛状态流转

### 4. 训放参赛工单模块
- 家飞训练、短途训放、正式赛事工单管理
- 工单状态流转（待确认→已确认→进行中→已完成→已取消）
- 超时工单自动取消
- 归巢登记、成绩录入

### 5. 繁育训放开销模块
- 鸽粮耗材、训放费用、赛事报名费等开销记录
- 按品系类别、时间范围统计
- 月度开销报表
- 财务对账追溯

## 项目结构

```
pigeon-breeding-management/
├── src/
│   ├── config/              # 配置文件
│   │   └── database.ts      # 数据库配置
│   ├── constants/           # 常量定义
│   │   └── enum.ts          # 枚举定义
│   ├── controllers/         # 控制器
│   │   ├── auth.controller.ts
│   │   ├── category.controller.ts
│   │   ├── pigeon.controller.ts
│   │   ├── workOrder.controller.ts
│   │   └── expense.controller.ts
│   ├── exceptions/          # 异常类
│   │   └── base.exception.ts
│   ├── middlewares/         # 中间件
│   │   ├── auth.middleware.ts
│   │   ├── errorHandler.middleware.ts
│   │   ├── validation.middleware.ts
│   │   └── operationLog.middleware.ts
│   ├── models/              # 数据模型
│   │   ├── User.model.ts
│   │   ├── Category.model.ts
│   │   ├── Pigeon.model.ts
│   │   ├── WorkOrder.model.ts
│   │   ├── Expense.model.ts
│   │   ├── OperationLog.model.ts
│   │   ├── BreedingRecord.model.ts
│   │   └── index.ts
│   ├── routes/              # 路由
│   │   ├── auth.routes.ts
│   │   ├── category.routes.ts
│   │   ├── pigeon.routes.ts
│   │   ├── workOrder.routes.ts
│   │   └── expense.routes.ts
│   ├── tasks/               # 定时任务
│   │   └── scheduler.ts
│   ├── types/               # 类型定义
│   ├── utils/               # 工具函数
│   │   ├── logger.ts
│   │   └── response.ts
│   └── app.ts               # 应用入口
├── .env                     # 环境变量
├── .env.example             # 环境变量示例
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

## 快速开始

### 环境要求

- Node.js >= 16.x
- MySQL >= 5.7

### 安装依赖

```bash
npm install
```

### 环境配置

复制 `.env.example` 为 `.env` 并修改配置：

```env
PORT=3000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=3306
DB_NAME=pigeon_management
DB_USER=root
DB_PASSWORD=your_password

JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

LOG_LEVEL=info
```

### 数据库准备

1. 创建 MySQL 数据库：
```sql
CREATE DATABASE pigeon_management CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

2. 项目启动后会自动创建数据表（开发环境）

### 启动项目

```bash
# 开发模式
npm run dev

# 构建
npm run build

# 生产模式
npm start
```

## API 接口

### 认证模块
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `GET /api/auth/me` - 获取当前用户信息

### 品类模块
- `GET /api/categories/tree` - 获取品类树
- `GET /api/categories/:id` - 获取品类详情
- `POST /api/categories` - 创建品类
- `PUT /api/categories/:id` - 更新品类
- `DELETE /api/categories/:id` - 删除品类

### 赛鸽模块
- `GET /api/pigeons` - 获取赛鸽列表
- `GET /api/pigeons/reminders` - 获取提醒列表
- `GET /api/pigeons/:id` - 获取赛鸽详情
- `POST /api/pigeons` - 创建赛鸽
- `PUT /api/pigeons/:id` - 更新赛鸽
- `DELETE /api/pigeons/:id` - 删除赛鸽

### 工单模块
- `GET /api/work-orders` - 获取工单列表
- `GET /api/work-orders/:id` - 获取工单详情
- `POST /api/work-orders` - 创建工单
- `PUT /api/work-orders/:id` - 更新工单
- `DELETE /api/work-orders/:id` - 删除工单

### 开销模块
- `GET /api/expenses` - 获取开销列表
- `GET /api/expenses/report` - 获取月度报表
- `GET /api/expenses/:id` - 获取开销详情
- `POST /api/expenses` - 创建开销
- `PUT /api/expenses/:id` - 更新开销
- `DELETE /api/expenses/:id` - 删除开销

### 系统
- `GET /health` - 健康检查

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
  "message": "错误信息",
  "success": false,
  "timestamp": 1699999999999
}
```

## 角色权限说明

| 角色 | 权限说明 |
|------|---------|
| ADMIN | 系统管理员，拥有所有权限 |
| BREEDER | 繁育员，可管理品类、赛鸽档案 |
| TRAINER | 训放员，可管理训放参赛工单 |
| FINANCE | 财务人员，可管理开销记录 |

## 定时任务

- **超时工单自动取消**: 每日 00:00 执行，自动取消超过 3 天未确认的工单

## 开发说明

### 添加新功能
1. 在 `src/models/` 创建数据模型
2. 在 `src/controllers/` 实现业务逻辑
3. 在 `src/routes/` 配置路由
4. 在 `src/middlewares/auth.middleware.ts` 配置权限（如需要）

### 数据库事务
使用 Sequelize 的事务功能保证数据一致性：

```typescript
const transaction = await sequelize.transaction();
try {
  // 数据库操作...
  await transaction.commit();
} catch (error) {
  await transaction.rollback();
  throw error;
}
```

## License

ISC
