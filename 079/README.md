# 名酒茶叶礼品批发经销后端服务

## 技术栈

- **Node.js** + **Express** + **TypeScript**
- **MySQL** + **Sequelize ORM**
- **JWT** 身份认证
- **全局异常捕获**
- **操作日志留痕**
- **统一响应封装**
- **数据库事务**
- **定时任务**

## 功能模块

### 1. 礼品商品类目模块
- 白酒红酒、名优茶叶、滋补礼盒、文创礼箱
- 多级类目管理
- 季节停售设置
- 展示排序调整
- 无限级树形层级查询

### 2. 供货商品牌档案模块
- 供货商信息维护
- 授权资质管理
- 供货价体系
- 起订门槛设置
- 合作有效期管理
- 品牌授权到期提醒
- 多条件快速检索

### 3. 经销商订货模块
- 选品下单
- 批量采购
- 预付款锁定
- 仓库配货
- 物流发货
- 签收确认全流程
- 未付款订单超时自动失效
- 订单状态自动流转

### 4. 经销对账结算模块
- 按经销商、季度品类统计拿货金额
- 返利额度计算
- 待结算货款管理
- 已结清账目查询
- 自动生成对账单
- 经销明细追溯查询

## 安装与运行

### 环境要求
- Node.js >= 16.x
- MySQL >= 8.0

### 安装依赖

```bash
npm install
```

### 环境配置

复制 `.env.example` 为 `.env` 并修改配置：

```bash
cp .env.example .env
```

配置内容：
```env
NODE_ENV=development
PORT=3000

DB_HOST=localhost
DB_PORT=3306
DB_NAME=gift_wholesale
DB_USER=root
DB_PASSWORD=password

JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=7d
```

### 运行项目

```bash
# 开发模式
npm run dev

# 构建
npm run build

# 生产模式
npm start
```

## API 接口文档

### 认证接口
- `POST /api/auth/login` - 用户登录
- `POST /api/auth/register` - 用户注册
- `GET /api/auth/me` - 获取当前用户信息
- `PUT /api/auth/change-password` - 修改密码

### 商品类目接口
- `GET /api/categories/tree` - 获取类目树形结构
- `GET /api/categories` - 获取类目列表
- `GET /api/categories/:id` - 获取类目详情
- `POST /api/categories` - 创建类目
- `PUT /api/categories/:id` - 更新类目
- `DELETE /api/categories/:id` - 删除类目

### 供货商接口
- `GET /api/suppliers` - 获取供货商列表
- `GET /api/suppliers/expiring` - 获取即将到期的供货商
- `GET /api/suppliers/:id` - 获取供货商详情
- `POST /api/suppliers` - 创建供货商
- `PUT /api/suppliers/:id` - 更新供货商
- `DELETE /api/suppliers/:id` - 删除供货商

### 品牌接口
- `GET /api/brands` - 获取品牌列表
- `GET /api/brands/:id` - 获取品牌详情
- `POST /api/brands` - 创建品牌
- `PUT /api/brands/:id` - 更新品牌
- `DELETE /api/brands/:id` - 删除品牌

### 商品接口
- `GET /api/products` - 获取商品列表
- `GET /api/products/:id` - 获取商品详情
- `POST /api/products` - 创建商品
- `PUT /api/products/:id` - 更新商品
- `DELETE /api/products/:id` - 删除商品
- `PATCH /api/products/:id/stock` - 更新库存

### 订单接口
- `GET /api/orders` - 获取订单列表
- `GET /api/orders/:id` - 获取订单详情
- `POST /api/orders` - 创建订单
- `PUT /api/orders/:id/status` - 更新订单状态
- `DELETE /api/orders/:id/cancel` - 取消订单

### 结算接口
- `GET /api/settlements` - 获取结算列表
- `GET /api/settlements/:id` - 获取结算详情
- `GET /api/settlements/statistics` - 获取经销商统计
- `POST /api/settlements` - 创建结算单
- `PUT /api/settlements/:id/status` - 更新结算状态

## 用户角色权限

- **ADMIN (管理员)** - 所有权限
- **MANAGER (经理)** - 商品、订单、供货商管理
- **SALES (销售)** - 商品查看、订单处理
- **DEALER (经销商)** - 下单、查看自己的订单和结算
- **WAREHOUSE (仓库)** - 库存管理、发货操作
- **FINANCE (财务)** - 结算管理、财务操作

## 订单状态流转

1. **pending_payment** (待付款) → 付款后 → paid
2. **paid** (已付款) → 配货后 → allocating
3. **allocating** (配货中) → 发货后 → shipped
4. **shipped** (已发货) → 签收后 → signed
5. **signed** (已签收) → 完成
6. **cancelled** (已取消) → 终止
7. **expired** (已过期) → 超时未付款自动失效

## 项目结构

```
├── src/
│   ├── config/          # 配置文件
│   ├── controllers/     # 控制器
│   ├── database/        # 数据库配置
│   ├── middlewares/     # 中间件
│   ├── models/          # 数据模型
│   ├── routes/          # 路由
│   ├── types/           # 类型定义
│   ├── utils/           # 工具函数
│   └── app.ts           # 应用入口
├── .env                 # 环境变量
├── .env.example         # 环境变量示例
├── tsconfig.json        # TypeScript配置
├── package.json         # 项目依赖
└── README.md            # 项目说明
```

## 开发规范

1. 遵循 RESTful API 设计规范
2. 严格的 TypeScript 类型约束
3. 统一的响应格式
4. 完善的错误处理
5. 数据库事务保证数据一致性
6. 操作日志完整记录

## License

ISC
