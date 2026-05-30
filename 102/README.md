# 私人酒庄红酒酿造窖藏管理后端服务

## 项目简介

这是一个基于 Node.js + Express + TypeScript 开发的私人酒庄红酒酿造窖藏管理系统后端服务，支持酿酒原料管理、酒品档案、酿造工单、成本结算等全流程管理。

## 技术栈

- **框架**: Express.js
- **语言**: TypeScript
- **数据库**: MySQL + Sequelize ORM
- **鉴权**: JWT (JSON Web Token)
- **日志**: Winston
- **任务调度**: node-cron
- **参数校验**: Joi
- **安全**: Helmet, CORS

## 功能模块

### 1. 用户与权限管理
- 多角色支持：管理员、酿酒师、窖藏管理员、销售
- JWT 鉴权
- 角色权限控制

### 2. 酿酒原料类目模块
- 多级原料分类管理（葡萄、酵母、辅料、木桶）
- 树形结构查询
- 原料库存管理
- 分类停用/启用

### 3. 酒庄酒品档案模块
- 酒品档案管理（产区、年份、酒精度等）
- 唯一批次号管控
- 酿造/窖藏/成品/售出状态管理
- 最佳饮用周期提醒

### 4. 酿造窖藏工单模块
- 全流程工单管理（分拣压榨 → 恒温发酵 → 入桶陈酿 → 酒体调配 → 灌装封瓶 → 入库封存）
- 工单状态自动流转
- 超时工单自动搁置（7天未启动）
- 工单逾期检测
- 工单阶段日志记录

### 5. 酿造成本结算模块
- 原料成本、人工成本、仓储成本统计
- 成本明细追溯
- 自动生成成本台账
- 工单完成后自动结算
- 成本分析与预估利润

### 6. 系统特性
- 全局统一响应格式
- 全局异常捕获处理
- 操作日志留痕
- 数据库事务支持
- 定时任务调度

## 项目结构

```
winery-management/
├── src/
│   ├── config/              # 配置文件
│   ├── constants/           # 常量定义
│   ├── controllers/         # 控制器
│   ├── database/            # 数据库连接
│   ├── middleware/          # 中间件
│   ├── models/              # 数据模型
│   ├── routes/              # 路由
│   ├── scripts/             # 脚本文件
│   ├── utils/               # 工具函数
│   ├── validation/          # 参数校验
│   └── app.ts               # 应用入口
├── logs/                    # 日志目录
├── .env                     # 环境变量
├── .env.example             # 环境变量示例
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

## 快速开始

### 环境要求

- Node.js >= 16.0.0
- MySQL >= 8.0
- npm 或 yarn

### 安装依赖

```bash
npm install
```

### 配置环境变量

复制 `.env.example` 为 `.env` 并修改配置：

```bash
cp .env.example .env
```

编辑 `.env`：

```env
PORT=3000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=3306
DB_NAME=winery_management
DB_USER=root
DB_PASSWORD=your_password
DB_DIALECT=mysql

JWT_SECRET=your_secret_key_here
JWT_EXPIRES_IN=24h

LOG_LEVEL=info
```

### 初始化数据库

```bash
npm run init-db
```

该命令会：
1. 创建数据库表结构
2. 创建默认管理员账号 (admin / admin123)
3. 创建测试用户账号
4. 初始化原料分类和测试数据

### 启动开发服务器

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

### 启动生产服务器

```bash
npm start
```

## API 文档

### 基础路径

所有 API 都以 `/api` 为前缀。

### 认证接口

| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| POST | /api/auth/login | 用户登录 | 公开 |
| POST | /api/auth/register | 用户注册 | 公开 |
| GET | /api/auth/me | 获取当前用户信息 | 登录用户 |
| PUT | /api/auth/change-password | 修改密码 | 登录用户 |

### 原料管理接口

| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| GET | /api/materials/categories/tree | 获取分类树 | 登录用户 |
| GET | /api/materials/categories | 分类列表 | 登录用户 |
| GET | /api/materials/categories/:id | 分类详情 | 登录用户 |
| POST | /api/materials/categories | 创建分类 | 酿酒师/管理员 |
| PUT | /api/materials/categories/:id | 更新分类 | 酿酒师/管理员 |
| DELETE | /api/materials/categories/:id | 删除分类 | 管理员 |
| GET | /api/materials | 原料列表 | 登录用户 |
| GET | /api/materials/:id | 原料详情 | 登录用户 |
| POST | /api/materials | 创建原料 | 酿酒师/管理员 |
| PUT | /api/materials/:id | 更新原料 | 酿酒师/管理员 |
| DELETE | /api/materials/:id | 删除原料 | 管理员 |

### 酒品管理接口

| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| GET | /api/wines/statistics | 酒品统计 | 登录用户 |
| GET | /api/wines/batch/:batchNo | 按批次号查询 | 登录用户 |
| GET | /api/wines | 酒品列表 | 登录用户 |
| GET | /api/wines/:id | 酒品详情 | 登录用户 |
| POST | /api/wines | 创建酒品 | 酿酒师/管理员 |
| PUT | /api/wines/:id | 更新酒品 | 酿酒师/管理员 |
| PUT | /api/wines/:id/status | 更新状态 | 酿酒师/管理员 |
| DELETE | /api/wines/:id | 删除酒品 | 管理员 |

### 工单管理接口

| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| GET | /api/work-orders/statistics | 工单统计 | 登录用户 |
| GET | /api/work-orders | 工单列表 | 登录用户 |
| GET | /api/work-orders/:id | 工单详情 | 登录用户 |
| POST | /api/work-orders | 创建工单 | 酿酒师/管理员 |
| PUT | /api/work-orders/:id | 更新工单 | 酿酒师/管理员 |
| PUT | /api/work-orders/:id/stage | 更新阶段 | 酿酒师/管理员 |
| PUT | /api/work-orders/:id/complete | 完成工单 | 酿酒师/管理员 |
| PUT | /api/work-orders/:id/suspend | 搁置工单 | 酿酒师/管理员 |
| DELETE | /api/work-orders/:id | 删除工单 | 管理员 |

### 成本结算接口

| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| GET | /api/costs/statistics | 成本统计 | 登录用户 |
| GET | /api/costs | 结算列表 | 登录用户 |
| GET | /api/costs/:id | 结算详情 | 登录用户 |
| POST | /api/costs | 创建结算 | 酿酒师/管理员 |
| POST | /api/costs/auto/:workOrderId | 自动生成结算 | 酿酒师/管理员 |
| PUT | /api/costs/:id | 更新结算 | 管理员 |
| DELETE | /api/costs/:id | 删除结算 | 管理员 |

### 操作日志接口

| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| GET | /api/operation-logs | 日志列表 | 管理员 |
| GET | /api/operation-logs/:id | 日志详情 | 管理员 |

## 统一响应格式

### 成功响应

```json
{
  "code": 200,
  "message": "操作成功",
  "data": {},
  "success": true,
  "timestamp": 1699999999999
}
```

### 失败响应

```json
{
  "code": 400,
  "message": "参数错误",
  "errors": [],
  "success": false,
  "timestamp": 1699999999999
}
```

## 定时任务

系统包含以下定时任务：

1. **逾期工单检测**（每天 00:00 执行）
   - 检查超过预计完成时间的工单
   - 自动标记为逾期

2. **工单自动搁置**（每天 01:00 执行）
   - 检查创建超过7天未启动的工单
   - 自动搁置处理

## 角色权限说明

| 角色 | 权限范围 |
|------|----------|
| 管理员 | 所有功能权限 |
| 酿酒师 | 原料管理、酒品管理、工单管理、成本查看 |
| 窖藏管理员 | 原料查看/更新、酒品查看/更新、工单查看/更新、成本查看 |
| 销售 | 酒品查看、成本查看 |

## 默认账号

| 用户名 | 密码 | 角色 |
|--------|------|------|
| admin | admin123 | 系统管理员 |
| winemaker | 123456 | 酿酒师 |
| cellarManager | 123456 | 窖藏管理员 |
| sales | 123456 | 销售 |

## 开发说明

### 代码规范

项目使用 TypeScript 严格模式，遵循以下规范：
- 严格类型检查
- ESLint 代码风格检查
- 统一的错误处理机制

### 日志

系统日志保存在 `logs/` 目录：
- `error.log`: 错误日志
- `combined.log`: 全部日志

### 数据库事务

关键操作（如工单完成、成本结算等）使用数据库事务，确保数据一致性。

## 许可证

MIT
