# 连锁茶饮门店进销存后台服务

## 技术栈
- Node.js + Express + TypeScript
- MySQL + Sequelize ORM
- JWT 鉴权
- 全局异常捕获、操作日志留痕、统一响应封装
- 数据库事务 + 定时任务

## 功能模块

### 1. 茶饮原料类目模块
- 多级原料分类（奶类基底、果糖糖浆、茶叶茶底、包装耗材等）
- 类目新增、停用下架
- 门店可用配置
- 无限级树形递归查询

### 2. 供应商供货档案模块
- 维护原料供应商、供货品类
- 结算账期、配送时效管理
- 合作状态管理
- 供应商绑定门店
- 资质到期预警
- 多条件检索

### 3. 门店采购入库模块
- 门店发起采购
- 总部审核
- 供应商发货
- 原料验收入库
- 批次有效期登记
- 自动更新门店库存台账

### 4. 原料消耗盘点模块
- 每日营业原料扣减
- 定期库存盘点
- 盘盈盘亏登记
- 临期原料预警
- 按门店、原料类目多维度统计消耗与库存

## 角色权限
- **总部 (headquarters)**: 系统管理、审核采购、全部功能
- **门店 (store)**: 发起采购、收货、库存操作、查看本店数据
- **财务 (finance)**: 财务相关统计和报表查看

## 项目结构
```
├── src/
│   ├── controllers/     # 控制器
│   ├── models/          # 数据模型
│   ├── routes/          # 路由
│   ├── middleware/      # 中间件
│   ├── config/          # 配置
│   ├── types/           # 类型定义
│   ├── utils/           # 工具函数
│   ├── services/        # 服务层
│   ├── exceptions/      # 异常类
│   ├── scripts/         # 脚本
│   └── app.ts           # 入口文件
├── .env                 # 环境变量
├── package.json
├── tsconfig.json
└── README.md
```

## 快速开始

### 1. 环境要求
- Node.js >= 16.x
- MySQL >= 8.0

### 2. 安装依赖
```bash
npm install
```

### 3. 配置环境变量
复制 `.env.example` 为 `.env` 并修改配置：
```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=tea_erp
DB_USER=root
DB_PASSWORD=your_password
JWT_SECRET=your-secret-key
```

### 4. 创建数据库
```sql
CREATE DATABASE tea_erp CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 5. 初始化数据
```bash
npm run init:data
```

初始化后默认账号：
- 管理员: admin / 123456 (总部角色)
- 财务: finance / 123456 (财务角色)
- 门店店长: store1 / 123456 (门店角色)

### 6. 启动开发服务器
```bash
npm run dev
```

服务器将在 http://localhost:3000 启动

### 7. 生产构建
```bash
npm run build
npm start
```

## API 接口列表

### 认证
- `POST /api/auth/login` - 用户登录
- `GET /api/auth/me` - 获取当前用户信息

### 原料分类
- `GET /api/material-categories/tree` - 获取分类树
- `GET /api/material-categories` - 获取分类列表
- `GET /api/material-categories/:id` - 获取分类详情
- `POST /api/material-categories` - 创建分类 (总部)
- `PUT /api/material-categories/:id` - 更新分类 (总部)
- `DELETE /api/material-categories/:id` - 删除分类 (总部)

### 原料管理
- `GET /api/materials` - 获取原料列表
- `GET /api/materials/:id` - 获取原料详情
- `POST /api/materials` - 创建原料 (总部)
- `PUT /api/materials/:id` - 更新原料 (总部)
- `DELETE /api/materials/:id` - 删除原料 (总部)

### 供应商管理
- `GET /api/suppliers` - 获取供应商列表
- `GET /api/suppliers/expiring` - 获取即将到期供应商
- `GET /api/suppliers/:id` - 获取供应商详情
- `GET /api/suppliers/:id/stores` - 获取供应商绑定门店
- `POST /api/suppliers` - 创建供应商 (总部)
- `PUT /api/suppliers/:id` - 更新供应商 (总部)
- `DELETE /api/suppliers/:id` - 删除供应商 (总部)

### 采购订单
- `GET /api/purchase-orders` - 获取采购订单列表
- `GET /api/purchase-orders/:id` - 获取采购订单详情
- `POST /api/purchase-orders` - 创建采购订单
- `PATCH /api/purchase-orders/:id/review` - 审核订单 (总部)
- `PATCH /api/purchase-orders/:id/ship` - 标记发货 (总部)
- `PATCH /api/purchase-orders/:id/receive` - 收货入库

### 库存管理
- `GET /api/inventory` - 获取库存列表
- `GET /api/inventory/logs` - 获取库存操作日志
- `GET /api/inventory/checks` - 获取盘点单列表
- `GET /api/inventory/consumption/stats` - 获取消耗统计
- `POST /api/inventory/consumption` - 记录原料消耗
- `POST /api/inventory/checks` - 创建盘点单
- `PATCH /api/inventory/checks/:id/confirm` - 确认盘点单

## 核心特性

### 1. 数据库事务
所有涉及多表操作的业务（如采购收货、盘点确认等）都使用数据库事务，确保数据一致性。

### 2. 操作日志
所有关键操作都会记录操作日志，包含操作人、时间、IP地址、操作内容等信息。

### 3. 全局异常处理
统一的异常处理机制，确保所有错误都能被正确捕获并返回友好的错误信息。

### 4. 定时任务
- 每日 9:00 检查库存预警
- 每日 10:00 检查供应商资质到期情况

### 5. JWT 鉴权
无状态认证机制，支持令牌过期时间配置。

## 开发说明

### 请求参数校验
使用 express-validator 进行请求参数校验，确保数据合法性。

### 数据模型
所有数据模型都包含 createdAt、updatedAt、deletedAt 字段，支持软删除。

### 分页查询
列表接口统一支持分页查询，参数为 `page` 和 `pageSize`。
