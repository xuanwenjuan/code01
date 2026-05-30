# 户外路亚垂钓渔具仓配管理系统

基于 Node.js + Express + TypeScript + MySQL 的渔具仓配管理后端服务。

## 技术栈

- **后端框架**: Express.js + TypeScript
- **数据库**: MySQL + Sequelize ORM
- **认证**: JWT (JSON Web Token)
- **其他**:
  - 参数校验: Joi
  - 日志: Winston + Morgan
  - 安全: Helmet + CORS
  - 定时任务: node-cron

## 功能模块

### 1. 垂钓渔具类目管理
- 无限级分类树形结构
- 类目新增、编辑、删除
- 类目排序、启用/停用
- 分类树查询

### 2. 渔具货源供应商管理
- 供应商信息建档
- 主营品类、发货时效管理
- 结算方式配置
- 供货价调价记录留存
- 合作状态管理（正常/暂停/终止）

### 3. 渔具出入库单据管理
- 采购进货登记
- 门店调拨出库
- 线下零售开单
- 库存退货换货
- 破损报损登记
- 单据审核流程
- 超时单据自动驳回（24小时未审核）
- 单据状态自动流转

### 4. 仓储进销存统计
- 库存总量、库存价值统计
- 按类目统计库存分布
- 出入库数量/金额统计
- 供应商采购排名
- 月度趋势分析
- 毛利收益计算

## 角色权限

- **管理员 (admin)**: 系统全权限
- **采购员 (purchaser)**: 采购单管理、供应商管理
- **仓管员 (warehouse_keeper)**: 库存管理、出入库审核
- **销售员 (salesman)**: 零售开单、查询权限

## 项目结构

```
├── src/
│   ├── controllers/      # 控制器
│   ├── models/           # 数据模型
│   ├── routes/           # 路由
│   ├── middleware/       # 中间件
│   ├── exceptions/       # 异常类
│   ├── types/            # 类型定义
│   ├── utils/            # 工具函数
│   ├── database/         # 数据库配置
│   │   └── seeders/      # 数据种子
│   └── app.ts            # 入口文件
├── logs/                 # 日志目录
├── .env                  # 环境变量
├── .env.example          # 环境变量示例
├── package.json          # 依赖配置
└── tsconfig.json         # TypeScript配置
```

## 快速开始

### 环境要求

- Node.js >= 14.x
- MySQL >= 5.7

### 安装依赖

```bash
npm install
```

### 配置数据库

复制 `.env.example` 为 `.env` 并修改数据库配置：

```env
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_password
DB_NAME=fishing_warehouse

JWT_SECRET=your_jwt_secret_key_here
```

### 初始化数据

```bash
npm run seed
```

执行种子脚本后会创建以下用户：

| 用户名 | 密码 | 角色 |
|--------|------|------|
| admin | admin123 | 管理员 |
| purchaser | purchaser123 | 采购员 |
| keeper | keeper123 | 仓管员 |
| salesman | salesman123 | 销售员 |

同时会创建 4 个基础分类：鱼竿竿体、渔轮线组、假饵配件、垂钓服饰。

### 启动开发服务

```bash
npm run dev
```

### 生产构建

```bash
npm run build
npm start
```

## API 接口文档

### 认证接口

- `POST /api/auth/login` - 用户登录
- `GET /api/auth/me` - 获取当前用户信息
- `POST /api/auth/change-password` - 修改密码

### 类目管理

- `GET /api/categories/tree` - 获取分类树
- `GET /api/categories` - 获取分类列表
- `GET /api/categories/:id` - 获取分类详情
- `POST /api/categories` - 创建分类
- `PUT /api/categories/:id` - 更新分类
- `DELETE /api/categories/:id` - 删除分类

### 供应商管理

- `GET /api/suppliers` - 获取供应商列表
- `GET /api/suppliers/:id` - 获取供应商详情
- `POST /api/suppliers` - 创建供应商
- `PUT /api/suppliers/:id` - 更新供应商
- `DELETE /api/suppliers/:id` - 删除供应商
- `POST /api/suppliers/price-adjustments` - 创建价格调整记录
- `GET /api/suppliers/price-adjustments/history` - 获取价格调整历史

### 商品管理

- `GET /api/products` - 获取商品列表
- `GET /api/products/:id` - 获取商品详情
- `POST /api/products` - 创建商品
- `PUT /api/products/:id` - 更新商品
- `DELETE /api/products/:id` - 删除商品

### 仓库单据

- `GET /api/warehouse/documents` - 获取单据列表
- `GET /api/warehouse/documents/:id` - 获取单据详情
- `POST /api/warehouse/documents` - 创建单据
- `POST /api/warehouse/documents/:id/approve` - 审核通过
- `POST /api/warehouse/documents/:id/reject` - 驳回单据
- `POST /api/warehouse/documents/:id/cancel` - 取消单据
- `GET /api/warehouse/stock-logs` - 获取库存变动日志

### 统计报表

- `GET /api/statistics/inventory` - 库存总览统计
- `GET /api/statistics/stock-by-category` - 按类目库存统计
- `GET /api/statistics/in-out` - 出入库统计
- `GET /api/statistics/supplier` - 供应商统计
- `GET /api/statistics/monthly-trend` - 月度趋势统计

## 单据类型说明

| 类型 | 说明 | 库存影响 |
|------|------|----------|
| purchase | 采购进货 | 增加库存 |
| transfer_out | 门店调拨 | 减少库存 |
| retail | 零售出库 | 减少库存 |
| return | 退货入库 | 增加库存 |
| damage | 破损报损 | 减少库存 |

## 业务流程

1. **采购流程**: 采购员创建采购单 -> 仓管员审核 -> 自动入库
2. **销售流程**: 销售员创建零售单 -> 仓管员审核 -> 自动出库
3. **退货流程**: 创建退货单 -> 审核 -> 库存增加
4. **报损流程**: 创建报损单 -> 审核 -> 库存减少

## 安全特性

- JWT 身份认证
- 角色权限控制
- 请求参数校验
- 全局异常捕获
- 操作日志留痕
- SQL 注入防护
- XSS 防护（Helmet）
- CORS 跨域配置

## 定时任务

- **超时单据自动驳回**: 每小时执行一次，24小时未审核的单据自动驳回

## 日志说明

系统日志保存在 `logs/` 目录下：
- `error.log`: 错误日志
- `combined.log`: 综合日志

## 开发说明

- 遵循 TypeScript 严格类型约束
- 遵循 RESTful API 设计规范
- 使用 Sequelize ORM 操作数据库
- 所有接口统一返回格式：`{ code, message, data, success }`

## License

MIT
