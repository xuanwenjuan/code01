# 中小型企业行政物资领用管理后端服务

## 技术栈

- Node.js + Express + TypeScript
- MySQL + Sequelize ORM
- JWT 身份认证
- 全局异常捕获
- 操作日志记录
- 统一响应封装
- 数据库事务
- 定时任务

## 功能模块

### 1. 物资类目分类管理
- 支持多级类目（办公耗材、劳保用品、电子配件、清洁物资等）
- 类目新增、编辑、停用归档
- 层级树形查询
- 排序管理

### 2. 物资库存档案管理
- 物资规格、型号、单价登记
- 库存余量、最低补货阈值设置
- 存放仓库管理
- 库存变动记录追溯
- 台账留存

### 3. 员工申领审批管理
- 员工提交物资申领
- 部门主管审批
- 仓库出库发放
- 驳回退回
- 申领状态自动流转
- 审批节点可追溯

### 4. 库存盘点损耗管理
- 定期库存盘点
- 盘盈盘亏录入
- 物资损耗登记
- 自动生成盘点差异报表
- 按仓库、物资类目多维度查询

## 快速开始

### 环境要求
- Node.js >= 14.x
- MySQL >= 5.7

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
DB_NAME=admin_material
DB_USER=root
DB_PASSWORD=your_password

JWT_SECRET=your_jwt_secret_key_here_change_in_production
JWT_EXPIRES_IN=7d

LOG_LEVEL=info
```

### 初始化数据库

```bash
# 编译 TypeScript
npm run build

# 初始化数据（会创建表并插入测试数据）
node dist/initData.js
```

### 启动服务

```bash
# 开发模式
npm run dev

# 生产模式
npm start
```

## 默认账号

| 用户名 | 密码 | 角色 |
|--------|------|------|
| admin | 123456 | 超级管理员 |
| manager | 123456 | 部门主管 |
| warehouse | 123456 | 仓库管理员 |
| employee | 123456 | 普通员工 |

## API 接口文档

### 认证接口
- `POST /api/auth/login` - 用户登录

### 类目接口
- `GET /api/categories/tree` - 获取类目树
- `GET /api/categories` - 获取类目列表
- `GET /api/categories/:id` - 获取类目详情
- `POST /api/categories` - 创建类目
- `PUT /api/categories/:id` - 更新类目
- `DELETE /api/categories/:id` - 删除类目

### 物资接口
- `GET /api/materials` - 获取物资列表
- `GET /api/materials/:id` - 获取物资详情
- `POST /api/materials` - 创建物资
- `PUT /api/materials/:id` - 更新物资
- `DELETE /api/materials/:id` - 删除物资
- `POST /api/materials/stock-in` - 入库
- `POST /api/materials/stock-out` - 出库
- `GET /api/stock-logs` - 获取库存变动日志

### 申领接口
- `GET /api/requisitions` - 获取申领列表
- `GET /api/requisitions/:id` - 获取申领详情
- `POST /api/requisitions` - 创建申领
- `POST /api/requisitions/:id/submit` - 提交申领
- `POST /api/requisitions/:id/approve` - 审批申领
- `POST /api/requisitions/:id/deliver` - 发放申领
- `POST /api/requisitions/:id/cancel` - 取消申领

### 盘点接口
- `GET /api/inventory-checks` - 获取盘点列表
- `GET /api/inventory-checks/:id` - 获取盘点详情
- `POST /api/inventory-checks` - 创建盘点单
- `PUT /api/inventory-checks/:id/items` - 更新盘点明细
- `POST /api/inventory-checks/:id/confirm` - 确认盘点单
- `POST /api/inventory-checks/:id/complete` - 完成盘点单
- `POST /api/loss` - 登记物资损耗

## 项目结构

```
src/
├── config/          # 配置文件
│   └── database.ts  # 数据库配置
├── controllers/     # 控制器
├── middlewares/     # 中间件
├── models/          # 数据模型
├── routes/          # 路由
├── services/        # 业务逻辑
├── tasks/           # 定时任务
├── utils/           # 工具函数
├── app.ts           # 入口文件
└── initData.ts      # 数据初始化脚本
```

## 核心特性

1. **TypeScript 严格类型约束** - 提供完善的类型定义
2. **JWT 认证** - 无状态认证机制
3. **全局异常处理** - 统一错误响应格式
4. **数据库事务** - 确保数据一致性
5. **操作日志** - 记录所有关键操作
6. **定时任务** - 每日库存预警检查
7. **多级权限控制** - 基于角色的权限管理
8. **状态自动流转** - 申领流程状态自动变更

## 开发命令

```bash
npm run dev          # 开发模式启动
npm run build        # 编译 TypeScript
npm run lint         # 代码检查
npm run typecheck    # 类型检查
```