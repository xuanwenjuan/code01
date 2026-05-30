# 古籍复刻雕版印刷物料管理后端服务

基于 Node.js + Express + TypeScript + MySQL 的古籍复刻雕版印刷物料管理系统后端服务。

## 技术栈

- **框架**: Express.js
- **语言**: TypeScript
- **数据库**: MySQL + Sequelize ORM
- **认证**: JWT (JSON Web Token)
- **日志**: Morgan + 自定义操作日志
- **定时任务**: node-cron
- **安全**: Helmet.js, CORS

## 功能模块

### 1. 用户与权限管理
- 用户注册、登录
- JWT 认证鉴权
- 多角色权限控制：管理员、物料管理员、雕版师、排版师

### 2. 印刷物料类目管理
- 无限级树形类目结构
- 类目新增、编辑、删除
- 传统用料停售封存
- 库房存放排序
- 树形结构查询

### 3. 原料储备档案管理
- 物料批次唯一编号
- 木料产地、纸张克重、墨料品级、储存年限管理
- 充足/待补货/过期作废三状态流转
- 到期提醒预警
- 库存统计分析

### 4. 古籍复刻工单管理
- 书目定稿排版
- 雕版选材下料
- 刷印校对
- 装订成册
- 成品入库归档
- 工单状态自动流转（待处理 → 排版中 → 雕版中 → 印刷中 → 装订中 → 已完成）
- 超时未启动工单自动搁置
- 全流程操作留痕追溯

### 5. 复刻用料成本管理
- 按物料类目统计原料消耗
- 按书目统计成本
- 手工工时损耗计算
- 自动生成用料台账
- 工单用料明细与成本对账追溯
- 多维度成本分析统计

## 数据库设计

### 核心表结构
- `users` - 用户表
- `material_categories` - 物料类目表
- `material_stocks` - 原料库存表
- `work_orders` - 工单表
- `work_order_traces` - 工单流程追溯表
- `work_order_materials` - 工单用料明细表
- `cost_ledgers` - 成本台账表
- `operation_logs` - 操作日志表

## 快速开始

### 环境要求
- Node.js >= 16.x
- MySQL >= 8.0

### 安装依赖
```bash
npm install
```

### 环境配置
复制 `.env` 文件并修改配置：
```env
NODE_ENV=development
PORT=3000

DB_HOST=localhost
DB_PORT=3306
DB_NAME=ancient_books_db
DB_USER=root
DB_PASSWORD=your_password

JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d
```

### 启动服务
```bash
# 开发模式
npm run dev

# 构建
npm run build

# 生产模式
npm start
```

### 访问地址
- 健康检查: http://localhost:3000/health
- API 接口: http://localhost:3000/api/

## API 接口文档

### 认证接口
- `POST /api/auth/login` - 用户登录
- `POST /api/auth/register` - 用户注册
- `GET /api/auth/me` - 获取当前用户信息

### 物料类目接口
- `GET /api/categories/tree` - 获取类目树形结构
- `GET /api/categories` - 获取类目列表
- `GET /api/categories/:id` - 获取类目详情
- `POST /api/categories` - 创建类目
- `PUT /api/categories/:id` - 更新类目
- `DELETE /api/categories/:id` - 删除类目
- `POST /api/categories/:id/seal` - 封存类目
- `POST /api/categories/:id/activate` - 启封类目

### 原料库存接口
- `GET /api/stocks` - 获取库存列表
- `GET /api/stocks/expiring` - 获取即将过期库存
- `GET /api/stocks/statistics` - 获取库存统计
- `GET /api/stocks/:id` - 获取库存详情
- `POST /api/stocks` - 创建库存记录
- `PUT /api/stocks/:id` - 更新库存
- `PUT /api/stocks/:id/status` - 更新库存状态
- `DELETE /api/stocks/:id` - 删除库存记录

### 工单管理接口
- `GET /api/orders` - 获取工单列表
- `GET /api/orders/my` - 获取我的工单
- `GET /api/orders/statistics` - 获取工单统计
- `GET /api/orders/:id` - 获取工单详情
- `GET /api/orders/:id/traces` - 获取工单流程追溯
- `GET /api/orders/:id/materials` - 获取工单用料明细
- `POST /api/orders` - 创建工单
- `PUT /api/orders/:id` - 更新工单
- `PUT /api/orders/:id/status` - 更新工单状态
- `PUT /api/orders/:id/assign` - 分配工单
- `POST /api/orders/:id/materials` - 添加工单用料

### 成本管理接口
- `GET /api/costs` - 获取成本台账列表
- `GET /api/costs/statistics` - 获取成本统计
- `GET /api/costs/order-comparison` - 工单成本对比
- `GET /api/costs/category-analysis` - 类目成本分析
- `GET /api/costs/:id` - 获取台账详情
- `POST /api/costs` - 生成成本台账
- `DELETE /api/costs/:id` - 删除台账

## 定时任务

系统内置以下定时任务：
1. **每日状态检查**（每天 00:00 执行）
   - 检查超时未处理工单并自动搁置
   - 检查过期物料并标记状态

2. **到期预警通知**（每天 09:00 执行）
   - 检查未来7天内到期的物料
   - 触发预警通知

## 核心特性

### 权限控制
基于角色的访问控制（RBAC）：
- **admin** - 系统管理员，拥有全部权限
- **material_admin** - 物料管理员，管理类目和库存
- **engraver** - 雕版师，处理工单雕版任务
- **typesetter** - 排版师，处理工单排版任务

### 全局异常捕获
统一异常处理机制，保证系统稳定运行，所有异常自动记录操作日志。

### 操作日志留痕
所有关键操作自动记录日志，包括：
- 操作人信息
- 操作时间
- 操作模块
- 请求参数
- 返回结果
- 错误信息

### 统一响应封装
所有 API 响应统一格式：
```json
{
  "code": 200,
  "message": "操作成功",
  "data": {...},
  "timestamp": 1700000000000
}
```

### 数据库事务
关键业务操作使用事务，确保数据一致性。

## 开发说明

### 项目结构
```
src/
├── config/          # 配置文件
│   └── database.ts  # 数据库配置
├── controllers/     # 控制器
├── middleware/      # 中间件
├── models/          # 数据模型
├── routes/          # 路由配置
├── scheduler/       # 定时任务
├── types/           # 类型定义
├── utils/           # 工具函数
└── app.ts           # 入口文件
```

### 代码规范
- 严格 TypeScript 类型检查
- RESTful API 设计规范
- 请求参数业务规则校验
- 遵循 ESLint 代码规范

## License

MIT
