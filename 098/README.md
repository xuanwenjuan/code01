# 城市园林绿植养护管理后端服务

## 技术栈

- Node.js + Express
- TypeScript
- MySQL + Sequelize ORM
- JWT 身份认证
- node-cron 定时任务

## 功能模块

### 1. 园林绿植类目管理
- 支持多级树形分类（乔木、灌木、水生植物、地被草皮等）
- 类目新增、编辑、停用
- 园区展示排序
- 树形递归查询

### 2. 园区绿植档案管理
- 绿植唯一编号管理
- 登记种植区域、树龄规格、栽种时间
- 养护周期配置
- 健康长势状态跟踪
- 病虫害预警提醒

### 3. 养护作业派单管理
- 工单创建、分配、接单、执行、完工、核验全流程
- 现场打卡签到
- 超时未处理工单自动提醒
- 工单状态自动流转
- 操作日志留痕

### 4. 养护物资消耗管理
- 农药肥料、工具耗材库存管理
- 物资领用登记
- 按品类、片区统计消耗
- 养护人力成本核算
- 自动生成养护报表
- 作业明细与物资对账追溯

## 角色权限

- **ADMIN (管理员)**: 系统全权限
- **AREA_MANAGER (片区主管)**: 片区绿植、工单管理
- **PURCHASER (采购)**: 物资库存、报表管理
- **MAINTENANCE_WORKER (养护员)**: 工单执行、物资领用

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制 `.env` 文件并配置数据库连接信息：

```env
NODE_ENV=development
PORT=3000

DB_HOST=localhost
DB_PORT=3306
DB_NAME=garden_maintenance
DB_USER=root
DB_PASSWORD=your_password

JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
```

### 3. 初始化数据库

```bash
npm run init-db
```

### 4. 启动开发服务器

```bash
npm run dev
```

### 5. 构建生产版本

```bash
npm run build
npm start
```

## 默认账号

- 用户名: `admin`
- 密码: `123456`

## API 接口文档

### 认证接口
- `POST /api/auth/login` - 用户登录
- `GET /api/auth/me` - 获取当前用户信息

### 绿植分类接口
- `GET /api/plant-categories` - 获取分类列表（支持树形）
- `GET /api/plant-categories/:id` - 获取分类详情
- `POST /api/plant-categories` - 创建分类
- `PUT /api/plant-categories/:id` - 更新分类
- `DELETE /api/plant-categories/:id` - 删除分类

### 绿植档案接口
- `GET /api/plants` - 获取绿植列表（分页、筛选）
- `GET /api/plants/:id` - 获取绿植详情
- `POST /api/plants` - 创建绿植档案
- `PUT /api/plants/:id` - 更新绿植档案
- `DELETE /api/plants/:id` - 删除绿植档案
- `PATCH /api/plants/:id/health-status` - 更新健康状态

### 工单接口
- `GET /api/work-orders` - 获取工单列表
- `GET /api/work-orders/:id` - 获取工单详情
- `POST /api/work-orders` - 创建工单
- `PATCH /api/work-orders/:id/assign` - 分配工单
- `PATCH /api/work-orders/:id/accept` - 接单
- `PATCH /api/work-orders/:id/start` - 开始执行（打卡）
- `PATCH /api/work-orders/:id/complete` - 完工
- `PATCH /api/work-orders/:id/verify` - 核验

### 物资接口
- `GET /api/materials` - 获取物资列表
- `GET /api/materials/statistics` - 获取物资统计报表
- `GET /api/materials/:id` - 获取物资详情
- `POST /api/materials` - 创建物资
- `PUT /api/materials/:id` - 更新物资
- `DELETE /api/materials/:id` - 删除物资
- `POST /api/materials/use` - 领用物资
- `GET /api/material-usages` - 获取领用记录

## 项目结构

```
src/
├── app.ts                 # 应用入口
├── config/                # 配置文件
│   └── database.ts        # 数据库配置
├── types/                 # 类型定义
│   └── index.ts
├── models/                # 数据模型
│   ├── User.ts
│   ├── Area.ts
│   ├── PlantCategory.ts
│   ├── Plant.ts
│   ├── WorkOrder.ts
│   ├── WorkOrderLog.ts
│   ├── Material.ts
│   ├── MaterialUsage.ts
│   ├── OperationLog.ts
│   └── index.ts
├── controllers/           # 控制器
│   ├── authController.ts
│   ├── plantCategoryController.ts
│   ├── plantController.ts
│   ├── workOrderController.ts
│   └── materialController.ts
├── routes/                # 路由
│   └── index.ts
├── middlewares/           # 中间件
│   ├── auth.ts
│   ├── validation.ts
│   ├── errorHandler.ts
│   └── logger.ts
├── exceptions/            # 异常类
│   └── HttpException.ts
├── utils/                 # 工具类
│   └── response.ts
├── jobs/                  # 定时任务
│   └── scheduler.ts
└── scripts/               # 脚本
    └── init-db.ts
```
