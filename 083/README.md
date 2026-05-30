# 汽车4S店配件进销存管理后端服务

## 技术栈

- **Node.js + Express + TypeScript** - 服务端框架
- **MySQL + Sequelize ORM** - 数据库
- **JWT** - 身份认证
- **全局异常捕获 + 操作日志留痕** - 日志系统
- **统一响应封装** - API 规范
- **数据库事务** - 数据一致性
- **定时任务** - 资质到期预警

## 功能模块

### 1. 汽车配件类目模块
- 支持无限级树形分类结构
- 类目新增、编辑、删除
- 停用/启用状态管理
- 排序配置
- 树形结构查询

### 2. 配件品牌供应商模块
- 供应商信息管理
- 授权资质登记
- 供货品类、供货周期、账期结算方式管理
- 资质到期自动预警（定时任务）
- 多维度条件检索

### 3. 配件采购入库模块
- 采购单创建、编辑
- 供应商接单确认
- 到货质检流程
- 批量入库（批次管理）
- 自动更新库存台账
- 完整的状态流转

### 4. 维修领用出库模块
- 维修工单绑定配件
- 技师申领出库
- 损坏配件报废
- 库存扣减回溯
- 配件退回管理
- 按车型、类目、时间段统计领用消耗

### 5. 库存管理模块
- 实时库存查询
- 库存变动日志
- 库存调整
- 低库存预警
- 批次管理

## 角色权限

| 角色 | 权限 |
|------|------|
| **系统管理员** | 全部权限 |
| **门店经理** | 查看报表、审批单据、大部分管理权限 |
| **采购员** | 供应商管理、采购订单管理 |
| **仓管员** | 库存管理、入库出库操作 |
| **技师** | 申领配件、报废登记 |

## 项目结构

```
src/
├── config/              # 配置文件
│   └── index.ts
├── constants/           # 常量定义
│   ├── role.ts
│   └── business.ts
├── database/            # 数据库连接
│   └── index.ts
├── models/              # 数据模型
│   ├── role.model.ts
│   ├── user.model.ts
│   ├── category.model.ts
│   ├── supplier.model.ts
│   ├── part.model.ts
│   ├── stock.model.ts
│   ├── purchaseOrder.model.ts
│   ├── purchaseOrderItem.model.ts
│   ├── outboundOrder.model.ts
│   ├── outboundOrderItem.model.ts
│   └── stockLog.model.ts
├── middlewares/         # 中间件
│   ├── auth.ts
│   ├── errorHandler.ts
│   └── operationLog.ts
├── services/            # 业务服务
│   ├── auth.service.ts
│   ├── category.service.ts
│   ├── supplier.service.ts
│   ├── part.service.ts
│   ├── purchase.service.ts
│   ├── outbound.service.ts
│   └── stock.service.ts
├── controllers/         # 控制器
│   ├── auth.controller.ts
│   ├── category.controller.ts
│   ├── supplier.controller.ts
│   ├── part.controller.ts
│   ├── purchase.controller.ts
│   ├── outbound.controller.ts
│   └── stock.controller.ts
├── routes/              # 路由
│   ├── auth.routes.ts
│   ├── category.routes.ts
│   ├── supplier.routes.ts
│   ├── part.routes.ts
│   ├── purchase.routes.ts
│   ├── outbound.routes.ts
│   └── stock.routes.ts
├── utils/               # 工具类
│   ├── response.ts
│   ├── logger.ts
│   └── scheduler.ts
└── app.ts               # 应用入口
```

## API 接口

### 认证接口
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `GET /api/auth/me` - 获取当前用户信息

### 类目接口
- `POST /api/categories` - 创建类目
- `PUT /api/categories/:id` - 更新类目
- `DELETE /api/categories/:id` - 删除类目
- `GET /api/categories/:id` - 获取类目详情
- `GET /api/categories/tree` - 获取类目树
- `GET /api/categories/list` - 获取类目列表

### 供应商接口
- `POST /api/suppliers` - 创建供应商
- `PUT /api/suppliers/:id` - 更新供应商
- `DELETE /api/suppliers/:id` - 删除供应商
- `GET /api/suppliers/:id` - 获取供应商详情
- `GET /api/suppliers/list` - 获取供应商列表

### 配件接口
- `POST /api/parts` - 创建配件
- `PUT /api/parts/:id` - 更新配件
- `DELETE /api/parts/:id` - 删除配件
- `GET /api/parts/:id` - 获取配件详情
- `GET /api/parts/list` - 获取配件列表

### 采购接口
- `POST /api/purchase` - 创建采购单
- `PUT /api/purchase/:id` - 更新采购单
- `POST /api/purchase/:id/accept` - 接单
- `POST /api/purchase/:id/arrival` - 确认到货
- `POST /api/purchase/:id/inspect` - 质检
- `POST /api/purchase/:id/inbound` - 入库
- `POST /api/purchase/:id/reject` - 拒绝采购单
- `GET /api/purchase/:id` - 获取采购单详情
- `GET /api/purchase/list` - 获取采购单列表

### 出库接口
- `POST /api/outbound` - 创建出库单
- `POST /api/outbound/:id/approve` - 审批出库单
- `POST /api/outbound/:id/outbound` - 确认出库
- `POST /api/outbound/:id/scrap` - 报废配件
- `POST /api/outbound/:id/return` - 退回配件
- `GET /api/outbound/:id` - 获取出库单详情
- `GET /api/outbound/list` - 获取出库单列表
- `GET /api/outbound/statistics` - 领用统计

### 库存接口
- `GET /api/stock/list` - 获取库存列表
- `GET /api/stock/logs` - 获取库存变动日志
- `POST /api/stock/adjust` - 调整库存

## 快速开始

### 1. 配置环境

复制 `.env` 文件并配置数据库连接：

```env
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_NAME=auto_parts_inventory
DB_USER=root
DB_PASSWORD=your_password
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=24h
```

### 2. 安装依赖

```bash
npm install
```

### 3. 初始化数据库

确保 MySQL 已启动，并创建对应的数据库。

### 4. 启动服务

```bash
# 开发模式
npm run dev

# 构建
npm run build

# 生产模式
npm start
```

### 5. 默认账号

系统会自动创建以下默认账号：

- **用户名**: `admin`
- **密码**: `admin123`
- **角色**: 系统管理员

## 业务流程

### 采购入库流程

1. 采购员创建采购单
2. 供应商接单确认
3. 货物到货后仓管员确认到货
4. 质检人员进行质量检查
5. 质检合格后批量入库
6. 库存自动更新并记录入库日志

### 领用出库流程

1. 技师创建领用申请
2. 经理审批出库单
3. 仓管员确认出库，扣减库存
4. 使用后如有损坏，进行报废登记
5. 剩余配件可退回仓库

## 核心特性

1. **严格的 TypeScript 类型约束** - 全程类型安全
2. **完整的鉴权体系** - JWT + 角色权限控制
3. **全局异常处理** - 统一错误响应格式
4. **操作日志留痕** - 记录所有关键操作
5. **数据库事务** - 保证数据一致性
6. **定时任务** - 自动检查资质到期
7. **库存批次管理** - 先进先出，全程可追溯
8. **多维度统计** - 支持按时间、类目、车型等统计

## 开发规范

- 遵循 RESTful API 设计规范
- 统一响应格式 `{ code, message, data, success }`
- 使用 try-catch 处理异常，抛出自定义 BusinessError
- Service 层处理业务逻辑，Controller 层处理请求响应
- 所有数据库写操作使用事务保证数据一致性
