# 非遗手工漆器工坊订单物料管理后端服务

## 项目简介

本项目是为非遗手工漆器工坊定制的订单物料管理系统，提供完整的物料类目管理、物料档案管理、定制工单管理、物料消耗成本统计等功能。

## 技术栈

- **Node.js** + **Express** + **TypeScript** - 后端框架
- **MySQL** + **Sequelize** - 数据库及 ORM
- **JWT** - 身份认证
- **node-cron** - 定时任务
- **Winston** - 日志管理
- **Joi** - 参数校验
- **Helmet** + **CORS** - 安全防护

## 核心功能

### 1. 漆器物料类目模块
- 支持多级物料分类（原木胎料、天然大漆、矿物色粉、装饰镶嵌辅料等）
- 类目新增、编辑、删除
- 物料停采停用管理
- 工坊展示排序
- 无限级树形递归查询

### 2. 工坊物料档案模块
- 登记物料产地、品级规格、采购批次、存放仓位
- 充足/低位/耗尽状态自动管理
- 物料编号唯一管控
- 库存低位自动预警

### 3. 定制漆器工单模块
- 客户定制选款、纹样定稿、工期约定
- 领料制作、工序质检、成品交付全流程
- 超时未付定金工单自动作废
- 工单状态自动流转

### 4. 物料消耗成本模块
- 按物料类目、定制工单统计领料消耗量
- 制作损耗记录
- 单品物料成本计算
- 工坊月度营收统计
- 自动生成物料台账
- 支持工单用料明细与成本对账追溯

## 系统特性

- ✅ 遵循 RESTful 接口规范
- ✅ 严格 TypeScript 强类型约束
- ✅ 请求参数业务规则校验（Joi）
- ✅ 多角色权限控制（匠人/物料管理员/运营/财务/管理员）
- ✅ 业务状态自动流转
- ✅ 漆器制作全链路留痕
- ✅ 多表联查数据一致可靠（数据库事务）
- ✅ 全局异常捕获
- ✅ 操作日志留痕
- ✅ 统一响应封装
- ✅ 定时任务调度

## 角色说明

| 角色 | 代码 | 说明 |
|------|------|------|
| 管理员 | admin | 拥有所有权限 |
| 物料管理员 | material_admin | 物料类目、物料档案管理 |
| 运营 | operation | 工单管理、物料领用 |
| 财务 | finance | 成本统计、营收查看 |
| 匠人 | artisan | 工单处理、工序查看 |

## 快速开始

### 环境要求

- Node.js >= 16.0.0
- MySQL >= 5.7

### 安装依赖

```bash
npm install
```

### 环境配置

复制 `.env.example` 为 `.env` 并修改配置：

```bash
cp .env.example .env
```

配置项说明：
- `PORT`: 服务端口
- `NODE_ENV`: 运行环境 (development/production)
- `DB_*`: 数据库连接配置
- `JWT_SECRET`: JWT 密钥
- `JWT_EXPIRES_IN`: Token 过期时间

### 数据库初始化

```bash
# 初始化数据库（创建表、插入初始数据）
npx ts-node src/scripts/initDB.ts
```

初始化完成后，默认账号：
- 用户名: `admin`
- 密码: `admin123`

### 启动服务

```bash
# 开发模式
npm run dev

# 构建
npm run build

# 生产模式
npm run start
```

## API 接口文档

### 认证接口

| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| POST | /api/auth/login | 用户登录 | 公开 |
| POST | /api/auth/register | 用户注册 | 公开 |
| GET | /api/auth/me | 获取当前用户信息 | 已认证 |

### 物料类目接口

| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| GET | /api/material-categories | 获取物料类目列表（树形） | 已认证 |
| GET | /api/material-categories/:id | 获取单个类目详情 | 已认证 |
| POST | /api/material-categories | 创建物料类目 | 物料管理员/管理员 |
| PUT | /api/material-categories/:id | 更新物料类目 | 物料管理员/管理员 |
| DELETE | /api/material-categories/:id | 删除物料类目 | 物料管理员/管理员 |

### 物料档案接口

| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| GET | /api/materials | 获取物料列表（分页） | 已认证 |
| GET | /api/materials/low-stock | 获取低库存物料 | 已认证 |
| GET | /api/materials/:id | 获取单个物料详情 | 已认证 |
| POST | /api/materials | 创建物料 | 物料管理员/管理员 |
| PUT | /api/materials/:id | 更新物料 | 物料管理员/管理员 |
| PATCH | /api/materials/:id/stock | 更新库存（出入库） | 物料管理员/管理员 |
| DELETE | /api/materials/:id | 删除物料 | 物料管理员/管理员 |

### 工单接口

| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| GET | /api/work-orders | 获取工单列表（分页） | 已认证 |
| GET | /api/work-orders/statistics | 获取工单统计 | 已认证 |
| GET | /api/work-orders/:id | 获取单个工单详情 | 已认证 |
| POST | /api/work-orders | 创建工单 | 运营/管理员 |
| PUT | /api/work-orders/:id | 更新工单 | 运营/管理员 |
| PATCH | /api/work-orders/:id/status | 更新工单状态 | 运营/管理员/匠人 |
| DELETE | /api/work-orders/:id | 删除工单 | 运营/管理员 |

### 物料消耗接口

| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| GET | /api/material-consumptions | 获取物料消耗列表 | 已认证 |
| GET | /api/material-consumptions/ledger | 获取物料台账 | 已认证 |
| GET | /api/material-consumptions/monthly-revenue | 获取月度营收 | 财务/管理员 |
| GET | /api/material-consumptions/:id | 获取消耗记录详情 | 已认证 |
| POST | /api/material-consumptions | 创建物料消耗记录 | 物料管理员/运营/管理员 |
| PUT | /api/material-consumptions/:id | 更新物料消耗记录 | 物料管理员/运营/管理员 |
| DELETE | /api/material-consumptions/:id | 删除物料消耗记录 | 物料管理员/管理员 |

## 定时任务

系统内置以下定时任务：

1. **每日工单清理** (每天 00:00 执行)
   - 自动作废超过 3 天未支付定金的工单

2. **库存检查** (每天 09:00、15:00 执行)
   - 检查库存低于安全线的物料
   - 记录预警日志

## 项目结构

```
src/
├── config/              # 配置文件
│   ├── index.ts         # 系统配置
│   └── database.ts      # 数据库配置
├── models/              # 数据模型
│   ├── index.ts         # 模型导出
│   ├── User.ts          # 用户模型
│   ├── MaterialCategory.ts  # 物料类目模型
│   ├── Material.ts      # 物料档案模型
│   ├── WorkOrder.ts     # 工单模型
│   ├── WorkOrderProcess.ts  # 工序模型
│   ├── MaterialConsumption.ts  # 物料消耗模型
│   └── OperationLog.ts  # 操作日志模型
├── controllers/         # 控制器
│   ├── auth.controller.ts
│   ├── materialCategory.controller.ts
│   ├── material.controller.ts
│   ├── workOrder.controller.ts
│   └── materialConsumption.controller.ts
├── routes/              # 路由
│   ├── index.ts
│   ├── auth.routes.ts
│   ├── materialCategory.routes.ts
│   ├── material.routes.ts
│   ├── workOrder.routes.ts
│   └── materialConsumption.routes.ts
├── middlewares/         # 中间件
│   ├── auth.ts          # 认证中间件
│   ├── validate.ts      # 参数校验中间件
│   ├── errorHandler.ts  # 错误处理中间件
│   └── operationLog.ts  # 操作日志中间件
├── validators/          # 参数校验规则
├── utils/               # 工具类
│   ├── logger.ts        # 日志工具
│   ├── response.ts      # 响应封装
│   └── scheduler.ts     # 定时任务
├── scripts/             # 脚本
│   └── initDB.ts        # 数据库初始化
└── app.ts               # 入口文件
```

## 工单状态说明

| 状态 | 代码 | 说明 |
|------|------|------|
| 待付定金 | pending_deposit | 刚创建，等待支付定金 |
| 已确认 | confirmed | 定金已支付，工单确认 |
| 纹样定稿 | design_finalized | 纹样设计已确认 |
| 已领料 | material_collected | 物料已领取 |
| 制作中 | in_production | 正在制作 |
| 质检中 | quality_inspection | 质量检验中 |
| 已完成 | completed | 制作完成 |
| 已交付 | delivered | 已交付客户 |
| 已取消 | cancelled | 手动取消 |
| 已过期 | expired | 超时未付定金自动作废 |

## 开发规范

1. **代码风格**: 使用 ESLint + TypeScript 严格模式
2. **提交规范**: 遵循 Conventional Commits
3. **注释规范**: 关键逻辑必须添加注释
4. **错误处理**: 所有异常必须被捕获并返回统一格式响应
5. **日志记录**: 重要操作必须记录日志

## License

MIT
