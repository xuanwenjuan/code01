# 航模无人机零配件定制加工后端服务

## 技术栈

- **运行时**: Node.js
- **框架**: Express.js
- **语言**: TypeScript
- **数据库**: MySQL + Sequelize ORM
- **鉴权**: JWT
- **其他**: 全局异常捕获、操作日志留痕、统一响应封装、数据库事务、定时任务

## 项目要求

- 遵循 RESTful 接口规范
- 严格 TS 强类型约束
- 请求参数业务规则校验
- 设计 / 生产 / 仓储 / 管理员多角色权限
- 业务状态自动流转
- 定制加工全链路留痕
- 多表联查数据一致可靠

## 功能模块

### 1. 航模配件类目模块

- 机架机身、动力电机、飞控电调、螺旋桨叶搭建多级配件分类
- 支持类目新增、规格停产下线、定制展示排序
- 无限级树形递归查询

### 2. 原料坯料档案模块

- 登记铝材碳纤维、塑料树脂、合金材质、坯料规格
- 支持可用 / 耗用 / 待报废状态管理
- 坯料批次编号唯一管控
- 库存低位预警提醒

### 3. 定制加工订单模块

- 客户选型定制、图纸上传、工艺排产、CNC 加工、质检打磨、发货交付全流程
- 超时未支付订单自动关闭（每小时执行）
- 加工状态自动流转
- 全链路操作日志留痕

### 4. 生产成本核算模块

- 按配件类目、材质批次统计原料损耗
- 加工工时、定制溢价、净利润营收统计
- 自动生成成本报表
- 支持订单工艺明细与财务对账追溯

## 快速开始

### 环境要求

- Node.js >= 16.x
- MySQL >= 8.0

### 安装依赖

```bash
npm install
```

### 配置环境变量

复制 `.env.example` 为 `.env` 并修改配置：

```bash
cp .env.example .env
```

主要配置项：

```env
PORT=3000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=3306
DB_NAME=drone_parts_db
DB_USER=root
DB_PASSWORD=your_password

JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=7d
```

### 初始化数据库

```bash
# 创建数据库
# 先在 MySQL 中创建数据库 drone_parts_db

# 执行初始化脚本（创建表和初始数据）
npm run init-db
```

初始化后默认账号：
- 管理员: admin / 123456
- 设计师: design / 123456
- 生产员: production / 123456
- 仓管员: warehouse / 123456

### 启动开发服务器

```bash
npm run dev
```

服务器将运行在 http://localhost:3000

### 生产构建

```bash
npm run build
npm start
```

## API 接口文档

### 认证接口

| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| POST | /api/auth/login | 用户登录 | 公开 |
| POST | /api/auth/register | 用户注册 | 公开 |
| GET | /api/auth/me | 获取当前用户信息 | 已认证 |

### 配件类目接口

| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| GET | /api/categories/tree | 获取类目树 | 公开 |
| GET | /api/categories | 获取类目列表 | 公开 |
| GET | /api/categories/:id | 获取类目详情 | 公开 |
| POST | /api/categories | 创建类目 | 管理员/设计 |
| PUT | /api/categories/:id | 更新类目 | 管理员/设计 |
| DELETE | /api/categories/:id | 删除类目 | 管理员/设计 |
| PATCH | /api/categories/:id/toggle | 切换类目状态 | 管理员/设计 |

### 原料坯料接口

| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| GET | /api/materials | 获取原料列表 | 已认证 |
| GET | /api/materials/low-stock | 获取低库存预警列表 | 已认证 |
| GET | /api/materials/:id | 获取原料详情 | 已认证 |
| POST | /api/materials | 创建原料 | 管理员/仓储 |
| PUT | /api/materials/:id | 更新原料 | 管理员/仓储 |
| DELETE | /api/materials/:id | 删除原料 | 管理员/仓储 |
| PATCH | /api/materials/:id/status | 更新原料状态 | 管理员/仓储 |
| POST | /api/materials/:id/consume | 消耗原料 | 管理员/仓储 |

### 订单接口

| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| GET | /api/orders | 获取订单列表 | 已认证 |
| GET | /api/orders/:id | 获取订单详情 | 已认证 |
| POST | /api/orders | 创建订单 | 已认证 |
| PUT | /api/orders/:id | 更新订单 | 已认证 |
| PATCH | /api/orders/:id/status | 更新订单状态 | 已认证 |
| POST | /api/orders/:id/cancel | 取消订单 | 已认证 |

### 成本报表接口

| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| POST | /api/cost-reports/generate | 生成成本报表 | 管理员 |
| GET | /api/cost-reports/summary | 获取汇总统计 | 管理员 |
| GET | /api/cost-reports | 获取报表列表 | 管理员 |
| GET | /api/cost-reports/:id | 获取报表详情 | 管理员 |
| DELETE | /api/cost-reports/:id | 删除报表 | 管理员 |

## 用户角色说明

| 角色 | 代码 | 权限说明 |
|------|------|----------|
| 管理员 | admin | 全部权限 |
| 设计师 | design | 类目管理、订单设计 |
| 生产员 | production | 订单生产流程操作 |
| 仓管员 | warehouse | 原料库存管理 |

## 订单状态流转

```
待支付 → 已支付 → 设计中 → 排产中 → CNC加工中 → 质检中 → 打磨中 → 待发货 → 已发货 → 已交付
                                    ↓
                                  已取消 / 已关闭
```

- 超时未支付（24小时）的订单会自动关闭
- 状态变更会记录操作日志和操作者

## 项目结构

```
src/
├── config/              # 配置文件
│   ├── environment.ts   # 环境变量
│   ├── database.ts      # 数据库配置
│   └── logger.ts        # 日志配置
├── types/               # TypeScript 类型定义
├── models/              # Sequelize 数据模型
├── controllers/         # 控制器
├── services/            # 业务逻辑层
├── middlewares/         # 中间件
│   ├── auth.ts          # 鉴权中间件
│   ├── errorHandler.ts  # 全局异常处理
│   ├── operationLog.ts  # 操作日志
│   └── upload.ts        # 文件上传
├── routes/              # 路由定义
├── scheduler/           # 定时任务
├── scripts/             # 脚本
│   └── initDB.ts        # 数据库初始化
└── app.ts               # 应用入口
```

## 定时任务

- **每小时执行**: 关闭超时未支付订单
- **每天 9 点执行**: 库存预警检查

## 日志说明

日志文件存储在 `logs/` 目录下：

- `error.log`: 错误日志
- `combined.log`: 综合日志

## 开发说明

### 代码规范

- 使用 TypeScript 严格模式
- 遵循 RESTful API 设计规范
- 使用统一的响应格式
- 参数验证使用 express-validator

### 数据库事务

关键操作（如订单状态变更）使用数据库事务确保数据一致性。

### 权限控制

基于角色的访问控制（RBAC），通过中间件统一处理。

## License

MIT
