# 精品酒店客房前台运营后端服务

基于 Node.js + Express + TypeScript 开发的酒店PMS系统。

## 技术栈

- **后端框架**: Express.js
- **编程语言**: TypeScript
- **数据库**: MySQL
- **ORM**: Sequelize
- **认证**: JWT
- **任务调度**: node-cron

## 功能模块

### 1. 房型分类管理
- 房型增删改查
- 房型上架/下架
- 树形分类查询
- 设施配置与定价策略

### 2. 客房档案管理
- 客房信息管理
- 楼层、朝向、设施配置
- 房态实时标记（空闲/入住/维修/保洁）
- 批量房态管理

### 3. 预订入住管理
- 线上/线下预订
- 订单锁定与状态流转
- 到店办理入住
- 续住变更
- 退房结算
- 入住记录永久归档

### 4. 营收对账模块
- 按房型、日期统计营收
- 入住率统计
- 订单流水查询
- 账单生成
- 退款记录追溯
- 多维度数据汇总

## 项目结构

```
src/
├── config/
│   └── database.ts      # 数据库配置
├── models/              # 数据模型
│   ├── User.ts
│   ├── RoomType.ts
│   ├── Room.ts
│   ├── Guest.ts
│   ├── Reservation.ts
│   ├── CheckInRecord.ts
│   ├── Payment.ts
│   └── OperationLog.ts
├── controllers/         # 控制器
│   ├── auth.controller.ts
│   ├── roomType.controller.ts
│   ├── room.controller.ts
│   ├── reservation.controller.ts
│   └── finance.controller.ts
├── middleware/          # 中间件
│   ├── auth.middleware.ts
│   └── errorHandler.ts
├── utils/              # 工具类
│   ├── response.ts
│   ├── logger.ts
│   └── scheduler.ts
├── exceptions/         # 异常类
│   └── HttpException.ts
├── routes/            # 路由
│   └── index.ts
└── app.ts            # 入口文件
```

## 快速开始

### 1. 环境要求
- Node.js >= 16.0.0
- MySQL >= 5.7

### 2. 安装依赖

```bash
npm install
```

### 3. 配置环境变量

复制 `.env` 文件并配置数据库连接信息：

```env
NODE_ENV=development
PORT=3000

DB_HOST=localhost
DB_PORT=3306
DB_NAME=hotel_db
DB_USER=root
DB_PASSWORD=your_password

JWT_SECRET=hotel-secret-key-2024
JWT_EXPIRES_IN=24h
```

### 4. 启动项目

```bash
# 开发模式
npm run dev

# 构建
npm run build

# 生产模式
npm start
```

### 5. 默认账号

系统会自动创建管理员账号：
- 用户名: `admin`
- 密码: `admin123`

## API 接口

### 认证接口
- `POST /api/auth/login` - 用户登录
- `GET /api/auth/me` - 获取当前用户信息

### 房型管理
- `POST /api/room-types` - 创建房型
- `PUT /api/room-types/:id` - 更新房型
- `DELETE /api/room-types/:id` - 删除房型
- `GET /api/room-types` - 获取房型列表
- `GET /api/room-types/tree` - 获取树形结构
- `PATCH /api/room-types/:id/status` - 切换上架/下架状态

### 客房管理
- `POST /api/rooms` - 创建客房
- `PUT /api/rooms/:id` - 更新客房
- `DELETE /api/rooms/:id` - 删除客房
- `GET /api/rooms` - 获取客房列表
- `PATCH /api/rooms/:id/status` - 更新房态
- `POST /api/rooms/batch-status` - 批量更新房态
- `GET /api/rooms/stats/overview` - 获取客房统计

### 预订与入住
- `POST /api/reservations` - 创建预订
- `POST /api/reservations/check-in` - 办理入住
- `POST /api/reservations/check-out` - 办理退房
- `POST /api/reservations/:id/cancel` - 取消预订
- `GET /api/reservations` - 获取预订列表
- `GET /api/check-in-records` - 获取入住记录
- `POST /api/reservations/renew` - 续住

### 财务对账
- `GET /api/finance/summary` - 获取营收概览
- `GET /api/finance/daily-stats` - 按日统计
- `GET /api/finance/room-type-stats` - 按房型统计
- `GET /api/finance/payments` - 获取支付记录
- `POST /api/finance/refunds` - 创建退款

## 业务状态流转

### 预订状态
- `confirmed` (已确认) → `checked_in` (已入住) → `checked_out` (已退房)
- `confirmed` → `cancelled` (已取消)
- `confirmed` → `no_show` (未到店)

### 房间状态
- `vacant` (空闲) ↔ `occupied` (入住中)
- `vacant` ↔ `cleaning` (清洁中)
- `vacant` ↔ `maintenance` (维修中)

## 数据库事务

所有关键操作（入住、退房、转账等）都使用数据库事务，确保数据的一致性和完整性。

## 操作日志

系统自动记录所有关键操作：
- 操作人
- 操作时间
- 操作类型
- 操作详情
- IP地址

## 定时任务

- 每天凌晨0点：自动处理过期预订（标记为未到店）
- 每小时：检查应离店订单

## 权限控制

系统支持多角色权限控制：
- `admin` (管理员) - 全部权限
- `manager` (经理) - 业务管理权限
- `receptionist` (前台) - 前台操作权限
- `finance` (财务) - 财务对账权限

## License

MIT
