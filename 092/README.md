# 舞台演艺灯光音响设备租赁管控后端服务

## 技术栈

- **Node.js + Express + TypeScript** - 服务端框架
- **MySQL + Sequelize** - 数据库及 ORM
- **JWT** - 鉴权认证
- **node-cron** - 定时任务
- **express-validator** - 参数校验

## 功能模块

### 1. 演艺设备类目模块
- 多级设备分类管理（舞台灯光、专业音响、桁架舞美、视频大屏等）
- 类目新增、型号停产停用
- 租赁前台排序
- 无限级树形递归查询

### 2. 设备资产档案模块
- 设备品牌、功率规格、购置年限管理
- 维修记录管理
- 在库/已租/维修/报废状态管理
- 设备资产编号唯一管控
- 维保周期到期提醒

### 3. 演出租赁订单模块
- 活动方案选品
- 租期预约
- 定金签约
- 设备出库搭建
- 活动结束归还
- 破损赔付全流程
- 超时未付订单自动关闭
- 订单状态自动流转

### 4. 租赁营收核算模块
- 按设备类目、活动场次统计租赁收入
- 维修成本核算
- 闲置损耗统计
- 档期利用率分析
- 自动生成经营报表
- 订单明细与财务账单追溯

## 用户角色

- **ADMIN (管理员)** - 系统全权限
- **BUSINESS (业务员)** - 订单管理、客户管理
- **WAREHOUSE (仓库管理员)** - 设备管理、出入库操作
- **FINANCE (财务人员)** - 财务统计、账单管理

## 项目结构

```
src/
├── common/              # 公共模块
│   ├── enums.ts         # 枚举定义
│   ├── http-exception.ts # 异常类
│   └── response.ts      # 统一响应封装
├── config/              # 配置文件
│   └── database.ts      # 数据库配置
├── controllers/         # 控制器
│   ├── auth.controller.ts
│   ├── category.controller.ts
│   ├── equipment.controller.ts
│   ├── finance.controller.ts
│   ├── order.controller.ts
│   └── user.controller.ts
├── jobs/                # 定时任务
│   ├── order.job.ts
│   └── index.ts
├── middleware/          # 中间件
│   ├── auth.middleware.ts
│   ├── error-handler.middleware.ts
│   ├── operation-log.middleware.ts
│   ├── validation.middleware.ts
│   └── index.ts
├── models/              # 数据模型
│   ├── category.model.ts
│   ├── equipment.model.ts
│   ├── maintenance-record.model.ts
│   ├── operation-log.model.ts
│   ├── order-item.model.ts
│   ├── order.model.ts
│   ├── user.model.ts
│   └── index.ts
├── routes/              # 路由
│   ├── auth.routes.ts
│   ├── category.routes.ts
│   ├── equipment.routes.ts
│   ├── finance.routes.ts
│   ├── order.routes.ts
│   ├── user.routes.ts
│   └── index.ts
├── scripts/             # 脚本
│   └── init-admin.ts    # 初始化管理员
└── utils/               # 工具
    └── jwt.ts           # JWT 工具
```

## 快速开始

### 1. 环境配置

复制 `.env` 文件并配置数据库连接信息：

```env
NODE_ENV=development
PORT=3000

DB_HOST=localhost
DB_PORT=3306
DB_NAME=stage_equipment_rental
DB_USER=root
DB_PASSWORD=your_password

JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=7d
```

### 2. 安装依赖

```bash
npm install
```

### 3. 创建数据库

在 MySQL 中创建数据库：

```sql
CREATE DATABASE stage_equipment_rental CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 4. 初始化管理员账户

```bash
npm run init-admin
```

默认管理员账号：
- 用户名: `admin`
- 密码: `admin123`

### 5. 启动开发服务器

```bash
npm run dev
```

### 6. 构建生产版本

```bash
npm run build
npm start
```

## API 接口

### 认证接口
- `POST /api/auth/login` - 用户登录
- `POST /api/auth/register` - 用户注册
- `GET /api/auth/profile` - 获取当前用户信息

### 用户管理
- `GET /api/users` - 获取用户列表（管理员）
- `GET /api/users/:id` - 获取用户详情（管理员）
- `POST /api/users` - 创建用户（管理员）
- `PUT /api/users/:id` - 更新用户（管理员）
- `DELETE /api/users/:id` - 删除用户（管理员）
- `PUT /api/users/password/change` - 修改密码

### 设备分类
- `GET /api/categories/tree` - 获取分类树
- `GET /api/categories` - 获取分类列表
- `GET /api/categories/:id` - 获取分类详情
- `POST /api/categories` - 创建分类
- `PUT /api/categories/:id` - 更新分类
- `DELETE /api/categories/:id` - 删除分类

### 设备管理
- `GET /api/equipments` - 获取设备列表
- `GET /api/equipments/maintenance-reminder` - 维保提醒
- `GET /api/equipments/:id` - 获取设备详情
- `POST /api/equipments` - 创建设备
- `PUT /api/equipments/:id` - 更新设备
- `DELETE /api/equipments/:id` - 删除设备

### 订单管理
- `GET /api/orders` - 获取订单列表
- `GET /api/orders/:id` - 获取订单详情
- `POST /api/orders` - 创建订单
- `PUT /api/orders/:id/confirm` - 确认订单
- `PUT /api/orders/:id/outbound` - 设备出库
- `PUT /api/orders/:id/return` - 设备归还
- `PUT /api/orders/:id/complete` - 完成订单
- `PUT /api/orders/:id/cancel` - 取消订单

### 财务统计
- `GET /api/finance/revenue` - 收入统计
- `GET /api/finance/category` - 分类统计
- `GET /api/finance/utilization` - 设备利用率
- `GET /api/finance/summary` - 汇总统计

## 订单状态流转

```
待支付定金 (pending_deposit)
    ↓
已确认 (confirmed)
    ↓
已出库 (outbound)
    ↓
使用中 (in_use)  ← (定时任务自动更新)
    ↓
已归还 (returned)
    ↓
已完成 (completed)

(可取消) → 已取消 (cancelled)
(超时未付) → 已关闭 (closed) ← (定时任务自动关闭)
```

## 定时任务

- **订单状态自动更新** - 每小时执行，将已出库且已到开始时间的订单标记为"使用中"
- **超时订单自动关闭** - 每小时执行，关闭24小时未支付定金的订单

## 操作日志

系统自动记录所有关键操作，包括：
- 操作人
- 操作模块
- 操作类型
- 请求参数
- IP 地址
- 耗时
- 状态码

## 开发规范

- 遵循 RESTful API 设计规范
- 严格 TypeScript 类型约束
- 请求参数业务规则校验
- 统一异常处理与响应格式
- 数据库事务保证数据一致性
