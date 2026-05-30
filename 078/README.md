# 企业员工福利集采发放后端服务

## 技术栈

- **后端框架**: Node.js + Express + TypeScript
- **数据库**: MySQL + Sequelize ORM
- **鉴权**: JWT (JSON Web Token)
- **其他**: 全局异常捕获、操作日志留痕、统一响应封装、数据库事务、定时任务

## 项目结构

```
├── src/
│   ├── config/          # 配置文件
│   │   └── database.ts  # 数据库配置
│   ├── controllers/     # 控制器
│   │   ├── authController.ts
│   │   ├── categoryController.ts
│   │   ├── supplierController.ts
│   │   ├── productController.ts
│   │   ├── batchController.ts
│   │   ├── claimController.ts
│   │   └── settlementController.ts
│   ├── middleware/      # 中间件
│   │   ├── auth.ts          # 鉴权中间件
│   │   ├── validation.ts    # 参数验证中间件
│   │   ├── errorHandler.ts  # 全局异常处理
│   │   └── operationLog.ts  # 操作日志留痕
│   ├── models/          # 数据模型
│   │   ├── User.ts
│   │   ├── Department.ts
│   │   ├── BenefitCategory.ts
│   │   ├── Supplier.ts
│   │   ├── BenefitProduct.ts
│   │   ├── BenefitBatch.ts
│   │   ├── BenefitClaim.ts
│   │   ├── BenefitSettlement.ts
│   │   └── OperationLog.ts
│   ├── services/        # 服务层
│   │   └── cronService.ts  # 定时任务服务
│   ├── utils/           # 工具类
│   │   ├── response.ts      # 统一响应封装
│   │   └── logger.ts        # 日志工具
│   ├── routes.ts        # 路由配置
│   └── app.ts           # 应用入口
├── .env                 # 环境变量
├── package.json
└── tsconfig.json
```

## 功能模块

### 1. 福利商品类目模块

- 多级分类树形结构管理
- 类目新增、编辑、删除
- 福利停发/恢复发放
- 分类排序调整
- 无限级树形层级查询

### 2. 集采供应商档案模块

- 供应商资质管理
- 供货品类维护
- 配送覆盖区域管理
- 合作年限记录
- 履约评分系统
- 资质到期提醒（定时任务）
- 多条件筛选查询

### 3. 员工福利申领模块

- 企业统一集采批次管理
- 员工在线选品申领
- 申领名额管控
- 部门审批流程
- 物资发货/签收
- 补发申请处理
- 申领记录永久追溯

### 4. 福利发放结算模块

- 按部门统计集采金额
- 按节日批次统计
- 发放人数统计
- 物资消耗统计
- 未领取结余统计
- 自动生成发放台账
- 财务对账功能
- 明细溯源查询

## 角色权限

- **ADMIN (管理员)**: 全部功能权限
- **MANAGER (部门经理)**: 部门相关审批、查看
- **EMPLOYEE (普通员工)**: 个人申领、查看
- **FINANCE (财务人员)**: 结算、对账相关

## 数据库表说明

| 表名 | 说明 |
|------|------|
| departments | 部门表 |
| users | 用户表 |
| benefit_categories | 福利商品分类表 |
| suppliers | 供应商表 |
| benefit_products | 福利商品表 |
| benefit_batches | 福利发放批次表 |
| benefit_claims | 福利申领表 |
| benefit_settlements | 福利发放结算表 |
| operation_logs | 操作日志表 |

## 核心特性

### 1. 全局异常捕获
统一异常处理机制，规范错误响应格式

### 2. 操作日志留痕
自动记录所有接口操作，包括：
- 请求参数
- 响应数据
- 操作人
- IP地址
- 执行耗时

### 3. 统一响应封装
标准化API响应格式：
```json
{
  "code": 200,
  "message": "操作成功",
  "data": {},
  "timestamp": 1234567890
}
```

### 4. 数据库事务
关键业务操作使用事务保证数据一致性：
- 申领创建（扣减库存 + 创建申领单）
- 取消申领（恢复库存 + 更新状态）
- 补发申请

### 5. 定时任务
- 每日9:00检查即将到期的供应商资质
- 每日0:00自动更新福利批次状态

## 快速开始

### 环境要求
- Node.js >= 16.x
- MySQL >= 8.0

### 安装依赖
```bash
npm install
```

### 配置环境变量
复制 `.env` 文件并修改数据库配置：
```env
PORT=3000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=3306
DB_NAME=employee_benefit
DB_USER=root
DB_PASSWORD=your_password

JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=24h

LOG_LEVEL=info
```

### 启动开发服务
```bash
npm run dev
```

### 构建生产版本
```bash
npm run build
npm start
```

## API接口

### 认证相关
- `POST /api/auth/login` - 用户登录
- `POST /api/auth/register` - 用户注册
- `GET /api/auth/me` - 获取当前用户信息
- `PUT /api/auth/password` - 修改密码

### 福利分类
- `GET /api/categories/tree` - 获取分类树
- `GET /api/categories` - 获取分类列表
- `GET /api/categories/:id` - 获取分类详情
- `POST /api/categories` - 创建分类
- `PUT /api/categories/:id` - 更新分类
- `DELETE /api/categories/:id` - 删除分类
- `PUT /api/categories/:id/stop` - 停发/恢复发放

### 供应商管理
- `GET /api/suppliers` - 获取供应商列表
- `GET /api/suppliers/expiring` - 获取资质即将到期的供应商
- `GET /api/suppliers/:id` - 获取供应商详情
- `POST /api/suppliers` - 创建供应商
- `PUT /api/suppliers/:id` - 更新供应商
- `DELETE /api/suppliers/:id` - 删除供应商

### 商品管理
- `GET /api/products` - 获取商品列表
- `GET /api/products/:id` - 获取商品详情
- `POST /api/products` - 创建商品
- `PUT /api/products/:id` - 更新商品
- `DELETE /api/products/:id` - 删除商品
- `PUT /api/products/:id/status` - 上下架商品

### 福利批次
- `GET /api/batches` - 获取批次列表
- `GET /api/batches/active` - 获取进行中的批次
- `GET /api/batches/:id` - 获取批次详情
- `POST /api/batches` - 创建批次
- `PUT /api/batches/:id` - 更新批次
- `DELETE /api/batches/:id` - 删除批次
- `PUT /api/batches/:id/publish` - 发布批次

### 福利申领
- `GET /api/claims` - 获取申领列表
- `GET /api/claims/:id` - 获取申领详情
- `POST /api/claims` - 创建申领
- `PUT /api/claims/:id/approve` - 审批申领
- `PUT /api/claims/:id/ship` - 发货
- `PUT /api/claims/:id/receive` - 签收
- `PUT /api/claims/:id/cancel` - 取消申领
- `POST /api/claims/:id/reissue` - 补发申请

### 结算管理
- `GET /api/settlements` - 获取结算列表
- `GET /api/settlements/statistics` - 获取统计数据
- `GET /api/settlements/ledger` - 获取发放台账
- `GET /api/settlements/:id` - 获取结算详情
- `POST /api/settlements` - 创建结算单
- `PUT /api/settlements/:id/confirm` - 确认结算

## 业务状态流转

### 申领单状态
1. **pending** - 待审批
2. **approved** - 已批准
3. **rejected** - 已拒绝
4. **shipped** - 已发货
5. **received** - 已签收
6. **cancelled** - 已取消

### 福利批次状态
1. **draft** - 草稿
2. **published** - 已发布
3. **in_progress** - 发放中
4. **completed** - 已完成
5. **cancelled** - 已取消

## TypeScript严格类型约束

项目启用了TypeScript严格模式：
- `strict: true`
- 所有模型字段类型定义
- 接口请求/响应类型定义
- 枚举类型约束

## 安全性

- JWT无状态认证
- Helmet安全头保护
- CORS跨域配置
- 密码bcrypt加密存储
- SQL注入防护（Sequelize参数化查询）
- 接口权限控制（角色+部门数据隔离）
