# 智慧校园无人便利店系统

一个基于 Vue3 + TypeScript + Vite + Node.js + Express + MySQL 的全栈无人便利店管理系统。

## 技术栈

### 前端
- Vue 3 (Composition API)
- TypeScript
- Vite
- Element Plus (UI组件库)
- Vue Router (路由)
- Pinia (状态管理)
- Axios (HTTP请求)

### 后端
- Node.js
- Express
- MySQL (mysql2)
- CORS 跨域处理

## 功能模块

1. **商品分类管理**
   - 分类增删改查
   - 支持多级子分类（零食类、饮品类、文具类、日用类、速食类）
   - 分类层级展示

2. **商品信息管理**
   - 商品基础信息录入（名称、条码、品牌、价格等）
   - 库存信息管理
   - 保质期信息管理
   - 多条件筛选查询
   - 前后端数据同步

3. **商品出入库管理**
   - 商品入库
   - 商品销售
   - 临期/过期下架
   - 高品质管控
   - 过期预警
   - 库存操作记录

4. **操作履历管理**
   - 自动记录操作详情
   - 支持查询追溯
   - 操作统计

5. **多条件筛选查询**
   - 多维度组合筛选
   - 快速定位目标商品

## 项目结构

```
.
├── frontend/              # 前端项目
│   ├── src/
│   │   ├── api/          # API接口
│   │   ├── layouts/      # 布局组件
│   │   ├── router/       # 路由配置
│   │   ├── styles/       # 全局样式
│   │   ├── types/        # TypeScript类型
│   │   ├── views/        # 页面组件
│   │   ├── App.vue
│   │   └── main.ts
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
├── backend/               # 后端项目
│   ├── src/
│   │   ├── config/       # 数据库配置
│   │   ├── routes/       # API路由
│   │   ├── utils/        # 工具函数
│   │   └── index.js      # 入口文件
│   ├── package.json
│   └── .env              # 环境变量
├── database/              # 数据库脚本
│   └── init.sql          # 数据库初始化
├── package.json
└── README.md
```

## 快速开始

### 1. 环境准备
- Node.js >= 16
- MySQL >= 5.7

### 2. 数据库初始化
```bash
mysql -u root -p < database/init.sql
```

### 3. 配置数据库连接
修改 `backend/.env` 文件：
```
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=你的密码
DB_NAME=smart_store
```

### 4. 安装依赖
```bash
# 根目录安装（包含 concurrently）
npm install

# 或分别安装
cd frontend && npm install
cd ../backend && npm install
```

### 5. 启动项目

**方式一：一键启动（推荐）**
```bash
npm run dev
```

**方式二：分别启动**
```bash
# 启动后端
cd backend && npm run dev

# 启动前端（新开终端）
cd frontend && npm run dev
```

### 6. 访问
- 前端: http://localhost:5173
- 后端: http://localhost:3000

## 数据库设计

### categories (商品分类表)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT | 主键 |
| name | VARCHAR(100) | 分类名称 |
| parent_id | INT | 父分类ID |
| description | TEXT | 描述 |
| sort_order | INT | 排序 |

### products (商品信息表)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT | 主键 |
| name | VARCHAR(200) | 商品名称 |
| barcode | VARCHAR(50) | 商品条码（唯一） |
| category_id | INT | 分类ID |
| price | DECIMAL(10,2) | 售价 |
| stock | INT | 库存 |
| expiry_date | DATE | 保质期截止日期 |
| status | VARCHAR(20) | 状态 |

### inventory_records (库存操作记录表)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT | 主键 |
| product_id | INT | 商品ID |
| operation_type | ENUM | 操作类型(inbound/sale/offline) |
| quantity | INT | 数量 |
| before_stock | INT | 操作前库存 |
| after_stock | INT | 操作后库存 |

### operation_logs (操作履历表)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT | 主键 |
| type | VARCHAR(50) | 操作类型 |
| action | VARCHAR(50) | 操作动作 |
| target | VARCHAR(200) | 操作目标 |
| details | TEXT | 操作详情 |
| operator | VARCHAR(100) | 操作人 |

## API 接口

### 分类管理
- `GET /api/categories` - 获取分类列表
- `POST /api/categories` - 新增分类
- `PUT /api/categories/:id` - 更新分类
- `DELETE /api/categories/:id` - 删除分类

### 商品管理
- `GET /api/products` - 获取商品列表（支持筛选）
- `GET /api/products/stats` - 获取商品统计
- `GET /api/products/:id` - 获取商品详情
- `POST /api/products` - 新增商品
- `PUT /api/products/:id` - 更新商品
- `DELETE /api/products/:id` - 删除商品

### 出入库管理
- `POST /api/inventory/inbound` - 商品入库
- `POST /api/inventory/sale` - 商品销售
- `POST /api/inventory/offline` - 商品下架
- `GET /api/inventory/records` - 获取库存记录
- `GET /api/inventory/stats` - 获取出入库统计

### 操作履历
- `GET /api/operation-logs` - 获取操作日志
- `GET /api/operation-logs/stats` - 获取日志统计

## 许可证

MIT
