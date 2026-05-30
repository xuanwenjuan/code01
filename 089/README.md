# 特种农业菌种培育溯源管理后端服务

基于 Node.js + Express + TypeScript + MySQL 的菌种培育溯源管理系统。

## 技术栈

- **框架**: Express.js 4.x
- **语言**: TypeScript 5.x
- **数据库**: MySQL 8.0 + Sequelize 6.x
- **鉴权**: JWT (jsonwebtoken)
- **日志**: Winston
- **定时任务**: node-cron
- **参数校验**: express-validator

## 功能模块

### 1. 菌种品类类目管理
- 多级分类树形结构
- 类目新增、编辑、删除
- 品种退市封存
- 培育批次排序

### 2. 菌种母种档案管理
- 菌种品系登记
- 培养基配方记录
- 保存温度管理
- 繁育/休眠/退化报废状态流转
- 种质活性到期预警

### 3. 培育批次生产管理
- 母种扩繁接种
- 恒温培育跟踪
- 质检抽检记录
- 分装入库管理
- 订单出苗发货
- 批次异常标记

### 4. 种质溯源台账管理
- 按品类统计繁育数量
- 报废损耗统计
- 质检合格率统计
- 成本消耗统计
- 批次流转全链路追溯

### 5. 用户权限管理
- 多角色权限（管理员、培育员、质检员、研究员）
- JWT 鉴权
- 操作日志记录

## 项目结构

```
src/
├── config/              # 配置文件
│   ├── database.ts      # 数据库配置
│   └── logger.ts        # 日志配置
├── controllers/         # 控制器
│   ├── auth.controller.ts
│   ├── user.controller.ts
│   ├── category.controller.ts
│   ├── motherStrain.controller.ts
│   ├── cultivationBatch.controller.ts
│   └── traceability.controller.ts
├── middleware/          # 中间件
│   ├── auth.ts          # 鉴权中间件
│   ├── errorHandler.ts  # 错误处理
│   ├── operationLog.ts  # 操作日志
│   └── validate.ts      # 参数校验
├── models/              # 数据模型
│   ├── User.ts
│   ├── StrainCategory.ts
│   ├── MotherStrain.ts
│   ├── CultivationBatch.ts
│   ├── TraceabilityRecord.ts
│   ├── OperationLog.ts
│   └── index.ts
├── routes/              # 路由定义
│   ├── auth.routes.ts
│   ├── user.routes.ts
│   ├── category.routes.ts
│   ├── motherStrain.routes.ts
│   ├── cultivationBatch.routes.ts
│   └── traceability.routes.ts
├── services/            # 业务服务
│   └── cron.service.ts  # 定时任务服务
├── types/               # 类型定义
│   └── index.ts
├── utils/               # 工具函数
│   ├── error.ts         # 自定义错误类
│   └── response.ts      # 统一响应封装
└── app.ts               # 应用入口
```

## 快速开始

### 环境要求
- Node.js >= 16.0
- MySQL >= 8.0

### 安装依赖

```bash
npm install
```

### 配置环境变量

复制 `.env.example` 为 `.env` 并修改配置：

```env
PORT=3000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=3306
DB_NAME=strain_cultivation
DB_USER=root
DB_PASSWORD=your_password

JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=24h

LOG_LEVEL=info
```

### 启动开发服务器

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
npm start
```

## 初始化管理员

首次启动后，调用接口初始化管理员：

```
POST /api/auth/init-admin
```

默认账号：`admin` / `admin123`

## API 文档

### 认证接口
- `POST /api/auth/login` - 用户登录
- `GET /api/auth/me` - 获取当前用户信息
- `POST /api/auth/init-admin` - 初始化管理员

### 用户管理
- `GET /api/users` - 用户列表（管理员）
- `POST /api/users` - 创建用户（管理员）
- `GET /api/users/:id` - 用户详情（管理员）
- `PUT /api/users/:id` - 更新用户（管理员）
- `DELETE /api/users/:id` - 删除用户（管理员）
- `POST /api/users/change-password` - 修改密码

### 菌种分类
- `GET /api/categories/tree` - 分类树形结构
- `POST /api/categories` - 创建分类
- `GET /api/categories/:id` - 分类详情
- `PUT /api/categories/:id` - 更新分类
- `PUT /api/categories/:id/deactivate` - 封存分类
- `DELETE /api/categories/:id` - 删除分类

### 母种档案
- `GET /api/mother-strains` - 母种列表
- `POST /api/mother-strains` - 创建母种
- `GET /api/mother-strains/expiring` - 到期预警列表
- `GET /api/mother-strains/:id` - 母种详情
- `PUT /api/mother-strains/:id` - 更新母种
- `PUT /api/mother-strains/:id/status` - 更新状态
- `DELETE /api/mother-strains/:id` - 删除母种

### 培育批次
- `GET /api/batches` - 批次列表
- `POST /api/batches` - 创建批次
- `GET /api/batches/:id` - 批次详情
- `PUT /api/batches/:id/status` - 更新状态
- `POST /api/batches/:id/qc` - 提交质检
- `POST /api/batches/:id/package` - 分装
- `POST /api/batches/:id/ship` - 出库发货
- `POST /api/batches/:id/abnormal` - 标记异常

### 溯源台账
- `GET /api/traceability` - 台账列表
- `POST /api/traceability/generate` - 生成溯源报告
- `GET /api/traceability/statistics` - 统计数据
- `GET /api/traceability/:id` - 台账详情
- `GET /api/traceability/batch/:batchCode` - 批次追溯

## 用户角色说明

| 角色 | 代码 | 权限 |
|------|------|------|
| 管理员 | admin | 所有权限 |
| 培育员 | cultivator | 批次创建、培育操作、分装、出库 |
| 质检员 | qc | 质检操作、查看数据 |
| 研究员 | researcher | 分类管理、母种管理、溯源分析 |

## 开发规范

- 使用 TypeScript 严格类型检查
- 遵循 RESTful API 设计规范
- 统一响应格式：`{ code, message, data, success }`
- 全局异常捕获，统一错误处理
- 所有操作自动记录日志
- 数据库操作使用事务保证数据一致性

## 定时任务

- **菌种活性到期预警**: 每天上午9点自动检查30天内即将到期的菌种

## License

MIT