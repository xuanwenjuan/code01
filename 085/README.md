# 文创手作艺术品线上商城后端服务

基于 Node.js + Express + TypeScript 构建的文创手作艺术品电商平台后端服务。

## 技术栈

- **后端框架**: Express.js
- **语言**: TypeScript
- **数据库**: MySQL + Sequelize ORM
- **认证**: JWT (JSON Web Token)
- **其他**: node-cron (定时任务), bcryptjs (密码加密), joi (数据验证)

## 功能模块

### 1. 文创作品类目模块
- 多级分类树形结构
- 类目新增、编辑、删除
- 临时停售/上架
- 前台展示排序
- 无限级树形递归查询

### 2. 入驻艺术家档案模块
- 艺术家注册申请
- 资质审核流程
- 多维度条件检索
- 艺术家信息管理
- 代表作归档

### 3. 文创作品订单模块
- 用户挑选艺术品下单
- 支付流程
- 定制需求备注
- 发货、收货、评价全流程
- 未支付订单超时自动关闭（30分钟）
- 订单状态自动流转

### 4. 艺术家收益结算模块
- 按作品类目、成交订单自动核算
- 平台服务费（10%）
- 艺术家分成计算
- 月度结算账单生成
- 订单明细与收益对账追溯

## 项目结构

```
src/
├── config/          # 配置文件
├── controllers/     # 控制器
├── database/        # 数据库连接
├── middleware/      # 中间件
├── models/          # 数据模型
├── routes/          # 路由
├── tasks/           # 定时任务
├── types/           # 类型定义
├── utils/           # 工具函数
└── app.ts           # 应用入口
```

## 快速开始

### 1. 环境要求
- Node.js >= 14.x
- MySQL >= 5.7

### 2. 安装依赖
```bash
npm install
```

### 3. 配置环境变量
复制 `.env.example` 为 `.env` 并修改配置：
```bash
cp .env.example .env
```

配置项说明：
- `PORT`: 服务端口
- `NODE_ENV`: 运行环境 (development/production)
- `DB_*`: 数据库连接配置
- `JWT_SECRET`: JWT 密钥
- `JWT_EXPIRES_IN`: JWT 过期时间

### 4. 启动服务
```bash
# 开发模式
npm run dev

# 生产构建
npm run build
npm start
```

## API 接口文档

### 认证模块 (`/api/auth`)
| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| POST | /register | 用户注册 | 公开 |
| POST | /login | 用户登录 | 公开 |
| GET | /profile | 获取个人信息 | 已认证 |
| PUT | /change-password | 修改密码 | 已认证 |

### 类目模块 (`/api/categories`)
| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| GET | /tree | 获取分类树 | 公开 |
| GET | /:id | 获取分类详情 | 公开 |
| POST | / | 创建分类 | 管理员 |
| PUT | /:id | 更新分类 | 管理员 |
| DELETE | /:id | 删除分类 | 管理员 |
| PATCH | /:id/toggle-status | 切换状态 | 管理员 |

### 艺术家模块 (`/api/artists`)
| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| GET | / | 获取艺术家列表 | 公开 |
| GET | /:id | 获取艺术家详情 | 公开 |
| POST | /apply | 申请成为艺术家 | 已认证 |
| GET | /me/profile | 获取我的档案 | 已认证 |
| PUT | /me/profile | 更新我的档案 | 已认证 |
| PUT | /:id/review | 审核艺术家 | 管理员 |
| PUT | /:id/suspend | 暂停艺术家 | 管理员 |

### 商品模块 (`/api/products`)
| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| GET | / | 获取商品列表 | 公开 |
| GET | /:id | 获取商品详情 | 公开 |
| POST | / | 创建商品 | 艺术家/商家 |
| GET | /my/list | 获取我的商品 | 艺术家/商家 |
| PUT | /:id | 更新商品 | 艺术家/商家 |
| DELETE | /:id | 删除商品 | 艺术家/商家 |
| PATCH | /:id/toggle-status | 切换状态 | 艺术家/商家 |

### 订单模块 (`/api/orders`)
| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| POST | / | 创建订单 | 已认证 |
| GET | /my | 获取我的订单 | 已认证 |
| GET | /:id | 获取订单详情 | 已认证 |
| PUT | /:id/pay | 支付订单 | 已认证 |
| PUT | /:id/receive | 确认收货 | 已认证 |
| PUT | /:id/cancel | 取消订单 | 已认证 |
| PUT | /:id/ship | 发货 | 商家/管理员 |
| GET | / | 获取所有订单 | 管理员 |

### 结算模块 (`/api/settlements`)
| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| GET | /my | 获取我的结算 | 已认证 |
| GET | /:id | 获取结算详情 | 已认证 |
| POST | /generate | 生成结算单 | 管理员 |
| GET | / | 获取结算列表 | 管理员 |
| PUT | /:id/confirm | 确认结算 | 管理员 |
| PUT | /:id/pay | 标记打款 | 财务/管理员 |

## 数据模型

### 用户角色 (Role)
- `user`: 普通用户
- `merchant`: 商家/艺术家
- `admin`: 管理员
- `finance`: 财务

### 订单状态 (OrderStatus)
- `pending_payment`: 待支付
- `paid`: 已支付
- `shipped`: 已发货
- `delivered`: 已送达
- `completed`: 已完成
- `cancelled`: 已取消
- `closed`: 已关闭

### 结算状态 (SettlementStatus)
- `pending`: 待确认
- `settled`: 已确认
- `paid`: 已打款

## 定时任务

- **订单超时关闭**: 每5分钟执行一次，关闭30分钟内未支付的订单

## 操作日志

系统会自动记录所有关键操作的日志，包括：
- 操作人信息
- 操作模块
- 操作描述
- 请求方法和URL
- IP地址
- 请求参数
- 响应结果
- 操作耗时
- 操作状态

## 统一响应格式

### 成功响应
```json
{
  "code": 0,
  "message": "success",
  "data": {},
  "timestamp": 1699999999999
}
```

### 错误响应
```json
{
  "code": 1001,
  "message": "错误信息",
  "timestamp": 1699999999999,
  "httpStatus": 400
}
```

## 开发说明

### 代码规范
- 使用 TypeScript 严格模式
- 遵循 RESTful API 设计规范
- 全局异常捕获处理
- 操作日志自动记录
- 数据库事务处理

### 数据库事务
所有涉及多表修改的操作都使用事务保证数据一致性。

### 鉴权机制
基于 JWT 的无状态认证，配合角色权限控制实现细粒度的权限管理。

## License

MIT
