# 古法香材炮制仓储溯源后端服务

基于 Node.js + Express + TypeScript + MySQL + Sequelize 的香材炮制仓储溯源管理系统后端服务。

## 技术栈

- **运行环境**: Node.js
- **框架**: Express.js
- **语言**: TypeScript
- **数据库**: MySQL 8.0+
- **ORM**: Sequelize
- **鉴权**: JWT (JSON Web Token)
- **日志**: Winston + Morgan
- **定时任务**: node-cron
- **参数校验**: express-validator

## 功能模块

### 1. 用户与权限管理
- 多角色支持：管理员、运营、仓储、炮制师
- JWT 身份认证
- 基于角色的权限控制 (RBAC)
- 用户登录/注册

### 2. 香材原料类目管理
- 支持木质香材、草本香材、树脂香材、复合香材
- 无限级树形分类结构
- 类目新增/编辑/删除
- 停采封存功能
- 仓储排序配置
- 树形递归查询

### 3. 原材入库档案管理
- 香材产地、采收年份、炮制工艺、含水率登记
- 唯一批次编号管理
- 完好/待炮制/封存陈化等状态管理
- 陈化周期到期提醒
- 仓库位置管理

### 4. 香材炮制加工管理
- 原料拣选、古法炮制、阴干陈化、分装入库、订单配料出库全流程
- 加工状态自动流转
- 不合格批次自动隔离
- 投入/产出数量记录
- 损耗统计
- 加工链追溯

### 5. 仓储流转台账管理
- 按类目、批次统计入库量
- 炮制损耗统计
- 陈化存量管理
- 出库销量统计
- 原料加工出库全程溯源
- 库存汇总报表

### 6. 系统功能
- 全局异常捕获
- 操作日志留痕
- 统一响应封装
- 数据库事务支持
- 定时任务调度
- 健康检查接口

## 项目结构

```
src/
├── config/              # 配置文件
│   ├── env.ts          # 环境变量配置
│   ├── database.ts     # 数据库连接配置
│   └── logger.ts       # 日志配置
├── constants/           # 常量定义
│   ├── role.constants.ts      # 角色权限常量
│   └── material.constants.ts  # 香材相关常量
├── models/              # 数据模型
│   ├── user.model.ts
│   ├── material-category.model.ts
│   ├── material.model.ts
│   ├── process-record.model.ts
│   ├── inventory-ledger.model.ts
│   └── operation-log.model.ts
├── middlewares/         # 中间件
│   ├── auth.middleware.ts          # 认证中间件
│   ├── error-handler.middleware.ts # 错误处理中间件
│   ├── validation.middleware.ts    # 参数校验中间件
│   └── operation-log.middleware.ts # 操作日志中间件
├── controllers/         # 控制器
│   ├── auth.controller.ts
│   ├── category.controller.ts
│   ├── material.controller.ts
│   ├── process.controller.ts
│   ├── inventory.controller.ts
│   └── task.controller.ts
├── services/           # 业务逻辑层
│   ├── auth.service.ts
│   ├── category.service.ts
│   ├── material.service.ts
│   ├── process.service.ts
│   ├── inventory.service.ts
│   └── task.service.ts
├── routes/            # 路由定义
│   ├── auth.routes.ts
│   ├── category.routes.ts
│   ├── material.routes.ts
│   ├── process.routes.ts
│   ├── inventory.routes.ts
│   ├── task.routes.ts
│   └── index.ts
├── utils/             # 工具函数
│   └── response.ts   # 统一响应封装
├── exceptions/        # 自定义异常
│   └── base.exception.ts
└── app.ts            # 应用入口
```

## 快速开始

### 环境要求

- Node.js 16+
- MySQL 8.0+
- npm 或 yarn

### 安装依赖

```bash
npm install
```

### 环境配置

复制 `.env.example` 为 `.env` 并修改配置：

```bash
cp .env.example .env
```

配置内容：

```env
PORT=3000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=3306
DB_NAME=incense_traceability
DB_USER=root
DB_PASSWORD=your_password

JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d

LOG_LEVEL=info
```

### 初始化数据库

确保 MySQL 服务已启动，创建数据库：

```sql
CREATE DATABASE incense_traceability CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 启动开发服务器

```bash
npm run dev
```

服务器将在 `http://localhost:3000` 启动。

### 构建生产版本

```bash
npm run build
```

### 启动生产服务器

```bash
npm start
```

## 默认账号

系统启动时会自动创建管理员账号：

- 用户名: `admin`
- 密码: `admin123`

## API 接口文档

### 认证接口

- `POST /api/auth/login` - 用户登录
- `POST /api/auth/register` - 用户注册
- `GET /api/auth/me` - 获取当前用户信息

### 类目管理接口

- `GET /api/categories` - 获取类目列表（树形）
- `GET /api/categories/:id` - 获取类目详情
- `POST /api/categories` - 创建类目
- `PUT /api/categories/:id` - 更新类目
- `DELETE /api/categories/:id` - 删除类目
- `PATCH /api/categories/:id/seal` - 切换封存状态
- `POST /api/categories/sort` - 更新排序

### 原料档案接口

- `GET /api/materials` - 获取原料列表（分页）
- `GET /api/materials/:id` - 获取原料详情
- `GET /api/materials/traceability/:batchNo` - 获取批次溯源
- `POST /api/materials` - 创建原料档案
- `PUT /api/materials/:id` - 更新原料档案
- `PATCH /api/materials/:id/status` - 更新原料状态
- `POST /api/materials/:id/aging` - 开始陈化

### 加工记录接口

- `GET /api/process` - 获取加工记录列表
- `GET /api/process/:id` - 获取加工记录详情
- `GET /api/process/chain/:materialId` - 获取加工链
- `POST /api/process` - 创建加工记录
- `PATCH /api/process/:id/status` - 更新加工状态
- `PUT /api/process/:id/details` - 更新加工详情

### 仓储台账接口

- `GET /api/inventory/ledgers` - 获取台账列表
- `GET /api/inventory/summary` - 获取类目汇总统计
- `GET /api/inventory/material/:materialId` - 获取原料台账记录
- `POST /api/inventory/stock-out` - 原料出库

### 定时任务接口

- `GET /api/tasks/expiring-materials` - 获取即将到期陈化原料

### 系统接口

- `GET /health` - 健康检查

## 角色权限说明

| 角色 | 权限 |
|------|------|
| 管理员 (admin) | 所有权限 |
| 运营 (operation) | 类目管理、原料管理、订单管理、查看统计 |
| 仓储 (warehouse) | 原料入库、出库、状态更新、库存管理 |
| 炮制师 (processor) | 加工记录管理、加工状态更新 |

## 状态流转

### 原料状态

- `good` - 完好
- `pending_process` - 待炮制
- `processing` - 加工中
- `sealed` - 封存陈化
- `processed` - 已加工
- `isolated` - 已隔离

### 加工状态

- `pending_selection` - 待拣选
- `selecting` - 拣选中
- `selected` - 已拣选
- `processing` - 炮制中
- `processed` - 已炮制
- `drying` - 阴干中
- `dried` - 已阴干
- `packaged` - 已分装
- `failed` - 加工失败

## 开发规范

- 遵循 RESTful API 设计规范
- TypeScript 强类型约束
- 使用 express-validator 进行参数校验
- 使用 Winston 进行日志记录
- 所有业务异常使用自定义异常类
- 数据库操作使用事务保证数据一致性

## License

MIT
