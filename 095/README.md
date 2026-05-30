# 极地户外防寒装备定制团购后端服务

## 项目简介

基于 Node.js + Express + TypeScript + MySQL + Sequelize 构建的专业级防寒装备定制团购管理系统，支持多角色权限管理、订单全流程跟踪、库存智能预警、营收统计分析等功能。

## 技术栈

- **后端框架**: Node.js + Express
- **类型系统**: TypeScript
- **数据库**: MySQL + Sequelize ORM
- **认证授权**: JWT + 基于角色的访问控制
- **日志系统**: Winston
- **参数校验**: express-validator
- **定时任务**: node-schedule
- **安全防护**: helmet + cors

## 核心功能模块

### 1. 防寒装备类目模块
- 多级分类树状结构（支持无限级）
- 类目新增、编辑、下架
- 商城展示排序
- 树形递归查询

### 2. 面料辅料档案模块
- 面料、填充物、五金配件、尺码规格管理
- 批次编号唯一管控
- 库存实时管理与低位预警
- 供应商信息管理

### 3. 定制团购订单模块
- 企业成团下单
- 定制LOGO排版
- 尺码统计与管理
- 订单状态自动流转（待付款→已付款→生产中→质检中→已发货→已完成）
- 订单全链路操作日志
- 超时未付款自动失效

### 4. 团购营收台账模块
- 按类目/批次统计出货数量
- 面料损耗统计
- 定制加工费统计
- 团购利润分析
- 财务对账追溯

## 角色权限

| 角色 | 权限 |
|------|------|
| 管理员 | 系统全部功能 |
| 客服 | 订单管理、客户服务 |
| 仓储 | 库存管理、产品管理 |
| 财务 | 报表查看、数据统计 |

## 快速开始

### 环境要求

- Node.js >= 16.0.0
- MySQL >= 5.7
- npm 或 yarn

### 安装依赖

```bash
npm install
```

### 配置环境变量

复制 `.env.example` 为 `.env` 并修改配置：

```env
NODE_ENV=development
PORT=3000

DB_HOST=localhost
DB_PORT=3306
DB_NAME=polar_equipment
DB_USER=root
DB_PASSWORD=your_password

JWT_SECRET=your-super-secret-key
JWT_EXPIRES_IN=24h

ORDER_TIMEOUT_MINUTES=30
INVENTORY_WARNING_THRESHOLD=10
```

### 启动项目

```bash
# 开发模式
npm run dev

# 构建生产版本
npm run build

# 生产模式
npm start
```

### 默认账号

系统启动后会自动创建以下测试账号：

| 用户名 | 密码 | 角色 |
|--------|------|------|
| admin | admin123 | 管理员 |
| service | service123 | 客服 |
| warehouse | warehouse123 | 仓储 |
| finance | finance123 | 财务 |

## API 接口文档

### 认证接口

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /api/auth/login | 用户登录 |
| GET | /api/auth/me | 获取当前用户信息 |

### 类目接口

| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| GET | /api/categories/tree | 获取分类树 | - |
| GET | /api/categories | 获取分类列表 | - |
| GET | /api/categories/:id | 获取分类详情 | - |
| POST | /api/categories | 创建分类 | 管理员/仓储 |
| PUT | /api/categories/:id | 更新分类 | 管理员/仓储 |
| DELETE | /api/categories/:id | 删除分类 | 管理员 |

### 产品接口

| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| GET | /api/products | 获取产品列表 | - |
| GET | /api/products/:id | 获取产品详情 | - |
| POST | /api/products | 创建产品 | 管理员/仓储 |
| PUT | /api/products/:id | 更新产品 | 管理员/仓储 |
| DELETE | /api/products/:id | 删除产品 | 管理员 |

### 面料辅料接口

| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| GET | /api/materials/low-stock | 获取低库存材料列表 | - |
| GET | /api/materials | 获取材料列表 | - |
| GET | /api/materials/:id | 获取材料详情 | - |
| POST | /api/materials | 创建材料 | 管理员/仓储 |
| PUT | /api/materials/:id | 更新材料 | 管理员/仓储 |
| PATCH | /api/materials/:id/stock | 更新库存 | 管理员/仓储 |
| DELETE | /api/materials/:id | 删除材料 | 管理员 |

### 订单接口

| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| GET | /api/orders | 获取订单列表 | 已认证 |
| GET | /api/orders/:id | 获取订单详情 | 已认证 |
| POST | /api/orders | 创建订单 | 管理员/客服 |
| PUT | /api/orders/:id | 更新订单 | 管理员/客服 |
| PATCH | /api/orders/:id/status | 更新订单状态 | 管理员/客服/仓储 |

### 报表接口

| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| GET | /api/reports/revenue | 获取营收统计 | 管理员/财务 |
| GET | /api/reports/revenue/by-category | 按类目统计 | 管理员/财务 |
| GET | /api/reports/revenue/monthly | 按月度统计 | 管理员/财务 |
| POST | /api/reports/generate-daily | 生成日报表 | 管理员/财务 |

## 项目结构

```
src/
├── config/              # 配置文件
│   ├── database.ts      # 数据库配置
│   └── logger.ts        # 日志配置
├── controllers/         # 控制器
│   ├── authController.ts
│   ├── categoryController.ts
│   ├── productController.ts
│   ├── materialController.ts
│   ├── orderController.ts
│   └── reportController.ts
├── middleware/          # 中间件
│   ├── auth.ts          # 认证授权
│   ├── errorHandler.ts  # 错误处理
│   └── operationLog.ts  # 操作日志
├── models/              # 数据模型
│   ├── User.ts
│   ├── Category.ts
│   ├── Product.ts
│   ├── Material.ts
│   ├── Order.ts
│   ├── OrderItem.ts
│   ├── OrderLog.ts
│   ├── RevenueReport.ts
│   └── index.ts
├── routes/              # 路由
│   └── index.ts
├── scheduler/           # 定时任务
│   └── index.ts
├── types/               # 类型定义
│   └── index.ts
├── utils/               # 工具函数
│   └── response.ts      # 统一响应
├── init/                # 初始化
│   └── index.ts
└── app.ts               # 应用入口
```

## 定时任务

- **订单超时检查**: 每5分钟执行一次，自动将超30分钟未付款订单标记为已过期
- **库存预警检查**: 每天上午9点执行，检查低库存材料并记录日志

## 统一响应格式

```json
{
  "code": 200,
  "message": "操作成功",
  "data": {},
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 订单状态流转

```
待付款 (pending_payment)
    ↓
已付款 (paid)
    ↓
生产中 (producing)
    ↓
质检中 (quality_checking)
    ↓
已发货 (shipped)
    ↓
已完成 (completed)

超时未付款 → 已过期 (expired)
```

## 注意事项

1. 生产环境请务必修改 JWT_SECRET
2. 数据库密码请使用强密码
3. 定期备份数据库
4. 日志文件保存在 logs/ 目录下

## License

MIT