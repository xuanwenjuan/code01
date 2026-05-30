# 企业级设备巡检与维保管理后端服务

基于 Node.js + Express + TypeScript 构建的企业级设备巡检与维保管理系统后端服务。

## 技术栈

- **运行时**: Node.js
- **框架**: Express.js
- **语言**: TypeScript
- **数据库**: MySQL + Sequelize ORM
- **鉴权**: JWT (JSON Web Token)
- **日志**: Winston
- **验证**: express-validator

## 功能模块

### 1. 用户认证与授权
- 用户注册/登录
- JWT 令牌鉴权
- 基于角色的权限控制
- 密码加密存储

### 2. 设备档案管理
- 设备分类管理（树形结构）
- 设备 CRUD 操作
- 设备状态管理（正常/故障/报废）
- 设备关联部门和分类

### 3. 巡检任务管理
- 巡检计划管理
- 巡检任务生成与分配
- 执行巡检并提交结果
- 巡检异常记录
- 巡检状态流转

### 4. 维保工单管理
- 故障上报
- 工单派单
- 维修处理
- 验收流程
- 工单关闭
- 工单状态与负责人联动

### 5. 数据统计报表
- 设备状态统计
- 巡检完成率统计
- 工单状态统计
- 按部门/时间维度统计
- 月度趋势分析

## 项目结构

```
src/
├── config/              # 配置文件
│   ├── database.ts      # 数据库配置
│   └── jwt.ts           # JWT 配置
├── controllers/         # 控制器层
│   ├── auth.controller.ts
│   ├── equipment.controller.ts
│   ├── equipmentCategory.controller.ts
│   ├── inspectionPlan.controller.ts
│   ├── inspectionTask.controller.ts
│   ├── statistics.controller.ts
│   └── workOrder.controller.ts
├── middleware/          # 中间件
│   ├── auth.middleware.ts
│   ├── error.middleware.ts
│   └── validation.middleware.ts
├── models/              # 数据模型
│   ├── User.ts
│   ├── Department.ts
│   ├── EquipmentCategory.ts
│   ├── Equipment.ts
│   ├── InspectionPlan.ts
│   ├── InspectionTask.ts
│   ├── WorkOrder.ts
│   └── index.ts
├── routes/              # 路由定义
│   ├── auth.routes.ts
│   ├── equipment.routes.ts
│   ├── equipmentCategory.routes.ts
│   ├── inspectionPlan.routes.ts
│   ├── inspectionTask.routes.ts
│   ├── statistics.routes.ts
│   └── workOrder.routes.ts
├── services/            # 业务逻辑层
│   ├── auth.service.ts
│   ├── equipment.service.ts
│   ├── equipmentCategory.service.ts
│   ├── inspectionPlan.service.ts
│   ├── inspectionTask.service.ts
│   ├── statistics.service.ts
│   └── workOrder.service.ts
├── types/               # 类型定义
│   └── index.ts
├── utils/               # 工具函数
│   ├── errors.ts        # 自定义异常
│   ├── generator.ts     # 编号生成器
│   ├── jwt.ts           # JWT 工具
│   ├── logger.ts        # 日志工具
│   ├── password.ts      # 密码加密
│   └── response.ts      # 统一响应格式
└── app.ts               # 应用入口
```

## 快速开始

### 环境要求

- Node.js >= 16.0.0
- MySQL >= 5.7 或 8.0

### 安装依赖

```bash
npm install
```

### 配置环境变量

复制 `.env.example` 为 `.env` 并修改配置：

```bash
cp .env.example .env
```

编辑 `.env`：

```env
NODE_ENV=development
PORT=3000

DB_HOST=localhost
DB_PORT=3306
DB_NAME=equipment_inspection
DB_USER=root
DB_PASSWORD=your_password

JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d

LOG_LEVEL=info
```

### 启动服务

开发模式（热重载）：

```bash
npm run dev
```

生产模式：

```bash
npm run build
npm start
```

### 代码检查

```bash
npm run lint
```

## API 文档

### 统一响应格式

所有接口返回格式统一：

```json
{
  "code": 200,
  "message": "操作成功",
  "data": {}
}
```

### 接口列表

#### 认证接口
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `GET /api/auth/profile` - 获取当前用户信息
- `POST /api/auth/change-password` - 修改密码

#### 设备分类接口
- `GET /api/equipment-categories` - 获取分类列表
- `GET /api/equipment-categories/tree` - 获取分类树
- `GET /api/equipment-categories/:id` - 获取分类详情
- `POST /api/equipment-categories` - 创建分类
- `PUT /api/equipment-categories/:id` - 更新分类
- `DELETE /api/equipment-categories/:id` - 删除分类

#### 设备接口
- `GET /api/equipment` - 获取设备列表
- `GET /api/equipment/:id` - 获取设备详情
- `GET /api/equipment/statistics` - 获取设备统计
- `POST /api/equipment` - 创建设备
- `PUT /api/equipment/:id` - 更新设备
- `DELETE /api/equipment/:id` - 删除设备
- `PATCH /api/equipment/:id/status` - 更新设备状态

#### 巡检计划接口
- `GET /api/inspection-plans` - 获取计划列表
- `GET /api/inspection-plans/:id` - 获取计划详情
- `POST /api/inspection-plans` - 创建计划
- `PUT /api/inspection-plans/:id` - 更新计划
- `DELETE /api/inspection-plans/:id` - 删除计划
- `PATCH /api/inspection-plans/:id/toggle` - 切换计划状态

#### 巡检任务接口
- `GET /api/inspection-tasks` - 获取任务列表
- `GET /api/inspection-tasks/my` - 获取我的任务
- `GET /api/inspection-tasks/statistics` - 获取任务统计
- `GET /api/inspection-tasks/:id` - 获取任务详情
- `POST /api/inspection-tasks` - 创建任务
- `PUT /api/inspection-tasks/:id` - 更新任务
- `DELETE /api/inspection-tasks/:id` - 删除任务
- `PATCH /api/inspection-tasks/:id/start` - 开始巡检
- `PATCH /api/inspection-tasks/:id/submit` - 提交巡检结果

#### 维保工单接口
- `GET /api/work-orders` - 获取工单列表
- `GET /api/work-orders/my` - 获取我的工单
- `GET /api/work-orders/statistics` - 获取工单统计
- `GET /api/work-orders/statistics/type` - 按类型统计
- `GET /api/work-orders/:id` - 获取工单详情
- `POST /api/work-orders` - 创建工单
- `PUT /api/work-orders/:id` - 更新工单
- `DELETE /api/work-orders/:id` - 删除工单
- `PATCH /api/work-orders/:id/assign` - 派单
- `PATCH /api/work-orders/:id/start` - 开始维修
- `PATCH /api/work-orders/:id/complete` - 完成维修
- `PATCH /api/work-orders/:id/accept` - 验收
- `PATCH /api/work-orders/:id/close` - 关闭工单

#### 统计报表接口
- `GET /api/statistics/dashboard` - 仪表盘统计
- `GET /api/statistics/equipment` - 设备统计
- `GET /api/statistics/inspection` - 巡检统计
- `GET /api/statistics/work-order` - 工单统计
- `GET /api/statistics/equipment-by-department` - 按部门统计设备
- `GET /api/statistics/inspection-by-date` - 按日期统计巡检
- `GET /api/statistics/work-order-by-date` - 按日期统计工单
- `GET /api/statistics/monthly-trend` - 月度趋势统计

## 用户角色

系统支持以下用户角色：

- **admin (管理员)**: 拥有所有权限
- **manager (经理)**: 管理部门设备、工单、巡检计划
- **inspector (巡检员)**: 执行巡检任务
- **maintenance (维修员)**: 处理维保工单
- **user (普通用户)**: 查看设备、上报故障

## 数据库事务

关键业务操作支持数据库事务：
- 巡检结果提交（同时更新任务状态和设备状态）
- 工单验收（同时更新工单状态和设备状态）

## 日志系统

- 所有请求日志记录
- 错误日志单独记录
- 日志文件按大小和数量轮转
- 支持不同日志级别

## 安全特性

- JWT 无状态认证
- 密码 bcrypt 加密
- Helmet 安全头
- CORS 跨域支持
- 请求参数验证
- 统一异常处理

## License

MIT
