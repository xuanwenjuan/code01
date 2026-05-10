# 小型宠物用品店管理系统

一个完整的全栈宠物用品店管理系统，包含分类管理、用品管理、出入库管理和操作履历等功能。

## 技术栈

- **前端**: Vue 3 + TypeScript + Vite + Element Plus
- **后端**: Node.js + Express + TypeScript
- **数据库**: MySQL

## 项目结构

```
023/
├── backend/           # 后端项目
│   ├── src/
│   │   ├── config/    # 配置文件
│   │   ├── controllers/ # 控制器
│   │   ├── models/    # 数据模型
│   │   ├── routes/    # 路由
│   │   ├── services/  # 业务逻辑
│   │   ├── types/     # TypeScript 类型
│   │   ├── utils/     # 工具函数
│   │   └── index.ts   # 入口文件
│   ├── .env           # 环境变量
│   ├── package.json
│   └── tsconfig.json
├── frontend/          # 前端项目
│   ├── src/
│   │   ├── api/       # API 接口
│   │   ├── router/    # 路由配置
│   │   ├── styles/    # 样式文件
│   │   ├── types/     # TypeScript 类型
│   │   ├── views/     # 页面组件
│   │   ├── App.vue    # 根组件
│   │   └── main.ts    # 入口文件
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
└── database/          # 数据库脚本
    └── init.sql       # 初始化脚本
```

## 功能模块

1. **用品分类管理**
   - 分类增删改查
   - 支持父子分类关联
   - 预设分类：食品类、洗护类、玩具类、服饰类、医疗类

2. **用品信息管理**
   - 录入基础信息、库存信息及品质信息
   - 支持编辑更新
   - 品质等级：普通、优质、精品、特级
   - 老化预警（30天内过期）
   - 低库存预警

3. **用品出入库管理**
   - 入库、售卖、残次下架全流程
   - 自动更新库存
   - 记录操作历史

4. **操作履历管理**
   - 自动记录所有操作详情
   - 支持按模块、操作类型、关键词筛选
   - 数据追溯

5. **多条件筛选查询**
   - 关键词搜索（名称、描述、供应商）
   - 分类筛选
   - 品质等级筛选
   - 价格范围筛选
   - 库存预警筛选
   - 临期预警筛选

## 安装与运行

### 1. 数据库准备

在 MySQL 中执行 `database/init.sql` 脚本创建数据库和表，并插入示例数据。

```bash
mysql -u root -p < database/init.sql
```

### 2. 配置后端

修改 `backend/.env` 文件中的数据库连接信息：

```env
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=pet_shop
```

### 3. 安装依赖并启动后端

```bash
cd backend
npm install
npm run dev
```

后端服务将在 `http://localhost:3000` 启动。

### 4. 安装依赖并启动前端

```bash
cd frontend
npm install
npm run dev
```

前端服务将在 `http://localhost:5173` 启动。

### 5. 访问系统

打开浏览器访问 `http://localhost:5173`

## API 接口

### 分类管理
- `GET /api/categories` - 获取分类列表
- `GET /api/categories/tree` - 获取分类树
- `GET /api/categories/:id` - 获取单个分类
- `POST /api/categories` - 创建分类
- `PUT /api/categories/:id` - 更新分类
- `DELETE /api/categories/:id` - 删除分类

### 用品管理
- `GET /api/products` - 获取用品列表（支持筛选）
- `GET /api/products/:id` - 获取单个用品
- `POST /api/products` - 创建用品
- `PUT /api/products/:id` - 更新用品
- `DELETE /api/products/:id` - 删除用品
- `GET /api/products/low-stock` - 获取低库存用品
- `GET /api/products/aging` - 获取临期用品

### 出入库管理
- `GET /api/inventory` - 获取出入库记录
- `POST /api/inventory/inbound` - 入库
- `POST /api/inventory/sale` - 售卖
- `POST /api/inventory/defective` - 残次下架

### 操作履历
- `GET /api/operations` - 获取操作日志
- `GET /api/operations/module/:module` - 按模块获取日志

## 数据库表结构

### categories（分类表）
- id: 主键
- name: 分类名称
- parent_id: 父分类ID
- description: 描述
- created_at, updated_at: 时间戳

### products（用品表）
- id: 主键
- name: 用品名称
- category_id: 分类ID
- price: 售价
- cost_price: 成本价
- stock: 库存数量
- min_stock: 最低库存（预警）
- unit: 单位
- description: 描述
- quality_level: 品质等级
- manufacturing_date: 生产日期
- expiry_date: 过期日期
- supplier: 供应商

### inventory_logs（出入库记录表）
- id: 主键
- product_id: 用品ID
- type: 操作类型（入库/售卖/残次下架）
- quantity: 数量
- price: 单价
- reason: 原因/备注

### operation_logs（操作履历表）
- id: 主键
- module: 模块
- action: 操作
- target_id: 目标ID
- detail: 详情
