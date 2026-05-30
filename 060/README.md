# 文旅景区票务分销后台后端服务

## 技术栈

- **Node.js** + **Express** + **TypeScript**
- **MySQL** + **Sequelize** ORM
- **JWT** 身份认证
- **Winston** 日志管理

## 功能模块

### 1. 景区产品类目模块
- 多级产品分类（门票、套票、年卡、游乐项目）
- 分类新增、编辑、删除
- 下架/启用状态切换
- 排序权重配置
- 树形层级查询

### 2. 分销商渠道管理模块
- 分销商信息登记（旅行社、代理、个人）
- 分销佣金比例配置
- 授信额度管理
- 合作生效/终止状态
- 分销商列表查询

### 3. 票务订单核销模块
- 游客购票订单生成
- 电子票码自动生成
- 订单状态流转（待支付、已支付、已核销、已过期、已取消）
- 线下扫码核销
- 票券过期自动作废
- 核销记录永久留存可追溯

### 4. 分销佣金结算模块
- 按分销商、结算周期自动统计
- 订单成交额、可结算佣金计算
- 结算账单生成
- 结算明细查询
- 结算状态管控（待确认、已确认、已支付）

## 项目结构

```
src/
├── config/              # 配置文件
├── controllers/         # 控制器层
├── database/
│   ├── models/         # 数据模型
│   └── sequelize.ts    # 数据库连接
├── middleware/          # 中间件
├── routes/             # 路由定义
├── services/           # 业务逻辑层
├── types/              # TypeScript 类型定义
└── utils/              # 工具函数
```

## 快速开始

### 1. 环境要求

- Node.js >= 16.x
- MySQL >= 5.7
- npm 或 yarn

### 2. 安装依赖

```bash
npm install
```

### 3. 环境配置

复制 `.env.example` 为 `.env` 并修改配置：

```env
PORT=3000
NODE_ENV=development

# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_NAME=tourism_ticket
DB_USER=root
DB_PASSWORD=your_password

# JWT 配置
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d

LOG_LEVEL=info
```

### 4. 创建数据库

```sql
CREATE DATABASE tourism_ticket CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 5. 启动服务

开发模式：
```bash
npm run dev
```

生产模式：
```bash
npm run build
npm start
```

## 默认账号

系统会自动创建初始管理员账号：

- 用户名：`admin`
- 密码：`admin123`

## API 接口文档

### 认证接口

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/auth/login` | 登录 |
| GET | `/api/auth/profile` | 获取当前用户信息 |

### 产品分类接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/product-categories/tree` | 获取树形分类 |
| GET | `/api/product-categories` | 获取分类列表 |
| GET | `/api/product-categories/:id` | 获取分类详情 |
| POST | `/api/product-categories` | 创建分类 |
| PUT | `/api/product-categories/:id` | 更新分类 |
| DELETE | `/api/product-categories/:id` | 删除分类 |
| PATCH | `/api/product-categories/:id/toggle-status` | 切换状态 |

### 分销商接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/distributors` | 获取分销商列表 |
| GET | `/api/distributors/all` | 获取所有启用分销商 |
| GET | `/api/distributors/:id` | 获取分销商详情 |
| POST | `/api/distributors` | 创建分销商 |
| PUT | `/api/distributors/:id` | 更新分销商 |
| DELETE | `/api/distributors/:id` | 删除分销商 |

### 订单接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/orders` | 获取订单列表 |
| GET | `/api/orders/:id` | 获取订单详情 |
| POST | `/api/orders` | 创建订单 |
| POST | `/api/orders/:id/pay` | 支付订单 |
| POST | `/api/orders/:id/cancel` | 取消订单 |

### 票券接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/tickets` | 获取票券列表 |
| GET | `/api/tickets/:id` | 获取票券详情 |
| GET | `/api/tickets/code/:code` | 按票码查询 |
| GET | `/api/tickets/verify-records` | 核销记录 |
| POST | `/api/tickets/verify` | 核销票券 |

### 结算接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/settlements` | 获取结算单列表 |
| GET | `/api/settlements/:id` | 获取结算单详情 |
| GET | `/api/settlements/:id/orders` | 获取结算订单明细 |
| POST | `/api/settlements/generate` | 生成月度结算单 |
| POST | `/api/settlements/:id/confirm` | 确认结算 |
| POST | `/api/settlements/:id/pay` | 支付结算 |

## 用户角色权限

| 角色 | 说明 | 权限 |
|------|------|------|
| SUPER_ADMIN | 超级管理员 | 所有权限 |
| ADMIN | 管理员 | 大部分管理权限 |
| OPERATOR | 操作员 | 核销等操作权限 |
| VIEWER | 查看者 | 只读权限 |

## 统一响应格式

```json
{
  "code": 200,
  "message": "success",
  "data": {},
  "timestamp": 1699999999999
}
```

## 数据库事务

所有涉及多表操作的业务逻辑都使用数据库事务，确保数据一致性：
- 订单创建（订单 + 票券）
- 订单取消（订单状态 + 票券状态）
- 票券核销（票券状态 + 订单状态更新）

## 操作日志

所有关键操作都会记录操作日志，包括：
- 操作人
- 操作时间
- 操作模块
- 操作类型
- 请求参数
- 响应结果

## 开发说明

- 代码遵循严格的 TypeScript 类型约束
- 使用分层架构（Controller -> Service -> Model）
- 全局异常统一处理
- 请求参数校验
- SQL 注入防护
- JWT 无状态认证
