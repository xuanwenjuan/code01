# 口腔连锁诊所诊疗管理后端服务

基于 Node.js + Express + TypeScript + MySQL + Sequelize 开发的口腔诊所管理系统后端服务。

## 功能特性

### 诊疗项目分类管理
- 多级分类树形结构
- 项目新增、编辑、删除
- 价格配置管理
- 上架/停售状态管理

### 医护人员档案管理
- 医生、护士、前台基础资料管理
- 执业资质信息维护
- 擅长诊疗项目管理
- 在职/休假/离职状态管理

### 患者预约就诊管理
- 患者档案建档
- 线上预约功能
- 到店签到确认
- 分诊派号管理
- 诊疗开单功能
- 就诊状态自动流转
- 诊疗记录永久存档

### 诊疗收费账单管理
- 诊疗项目、药品耗材自动合并计费
- 优惠抵扣功能
- 待支付/已支付/退费状态管理
- 按日期、医生多维度营收统计
- 数据库事务支持

### 系统特性
- JWT 身份认证
- 基于角色的权限控制（RBAC）
- 全局异常捕获处理
- 统一响应格式封装
- 接口操作日志记录
- 定时任务调度
- 请求参数合法性校验
- 多表关联查询支持

## 技术栈

- **后端框架**: Express.js
- **开发语言**: TypeScript
- **ORM**: Sequelize
- **数据库**: MySQL
- **认证**: JWT (jsonwebtoken)
- **加密**: bcryptjs
- **参数校验**: Joi
- **日志**: winston
- **定时任务**: node-cron
- **安全**: helmet, cors, express-rate-limit

## 项目结构

```
src/
├── config/              # 配置文件
├── controllers/         # 控制器
├── database/            # 数据库配置
├── middleware/          # 中间件
├── models/              # 数据模型
├── routes/              # 路由定义
├── types/               # TypeScript 类型定义
├── utils/               # 工具函数
├── app.ts               # 应用入口
└── cron.ts              # 定时任务
```

## 快速开始

### 环境要求

- Node.js >= 16.0.0
- MySQL >= 5.7
- npm 或 yarn

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
DB_NAME=dental_clinic
DB_USER=root
DB_PASSWORD=your_password

JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=7d

LOG_LEVEL=info
```

### 创建数据库

```sql
CREATE DATABASE dental_clinic CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 启动开发服务

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

### 启动生产服务

```bash
npm start
```

## API 接口文档

### 认证接口
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `GET /api/auth/me` - 获取当前用户信息

### 诊疗项目分类接口
- `GET /api/categories/tree` - 获取分类树
- `GET /api/categories` - 获取分类列表
- `GET /api/categories/:id` - 获取分类详情
- `POST /api/categories` - 创建分类
- `PUT /api/categories/:id` - 更新分类
- `DELETE /api/categories/:id` - 删除分类

### 诊疗项目接口
- `GET /api/treatments` - 获取项目列表
- `GET /api/treatments/:id` - 获取项目详情
- `POST /api/treatments` - 创建项目
- `PUT /api/treatments/:id` - 更新项目
- `DELETE /api/treatments/:id` - 删除项目

### 医护人员接口
- `GET /api/staff/doctors` - 获取医生列表
- `GET /api/staff` - 获取人员列表
- `GET /api/staff/:id` - 获取人员详情
- `POST /api/staff` - 创建人员
- `PUT /api/staff/:id` - 更新人员
- `DELETE /api/staff/:id` - 删除人员

### 患者管理接口
- `GET /api/patients` - 获取患者列表
- `GET /api/patients/:id` - 获取患者详情
- `POST /api/patients` - 创建患者
- `PUT /api/patients/:id` - 更新患者
- `DELETE /api/patients/:id` - 删除患者

### 预约管理接口
- `GET /api/appointments/queue/today` - 获取今日排队
- `GET /api/appointments` - 获取预约列表
- `GET /api/appointments/:id` - 获取预约详情
- `POST /api/appointments` - 创建预约
- `PUT /api/appointments/:id` - 更新预约
- `PATCH /api/appointments/:id/status` - 更新预约状态
- `DELETE /api/appointments/:id` - 删除预约

### 诊疗记录接口
- `GET /api/records/patient/:patientId` - 获取患者诊疗记录
- `GET /api/records` - 获取诊疗记录列表
- `GET /api/records/:id` - 获取诊疗记录详情
- `POST /api/records` - 创建诊疗记录
- `PUT /api/records/:id` - 更新诊疗记录
- `DELETE /api/records/:id` - 删除诊疗记录

### 收费账单接口
- `GET /api/billings/statistics` - 获取营收统计
- `GET /api/billings` - 获取账单列表
- `GET /api/billings/:id` - 获取账单详情
- `POST /api/billings` - 创建账单
- `PUT /api/billings/:id` - 更新账单
- `POST /api/billings/:id/pay` - 支付账单
- `POST /api/billings/:id/refund` - 退款账单
- `DELETE /api/billings/:id` - 删除账单

## 角色权限说明

| 角色 | 权限说明 |
|------|----------|
| admin | 系统管理员，拥有所有权限 |
| doctor | 医生，可管理患者、预约、诊疗记录、账单 |
| nurse | 护士，可查看患者、预约信息 |
| receptionist | 前台，可管理患者、预约、账单 |

## 数据库表结构

主要数据表包括：
- users - 系统用户表
- treatment_categories - 诊疗项目分类表
- treatment_items - 诊疗项目表
- staff - 医护人员表
- patients - 患者表
- appointments - 预约记录表
- treatment_records - 诊疗记录表
- billings - 收费账单表
- billing_items - 账单明细表
- operation_logs - 操作日志表

## 开发规范

1. 严格遵循 RESTful API 设计规范
2. 使用 TypeScript 强类型约束
3. 统一的响应格式和错误处理
4. 所有接口必须进行参数校验
5. 关键业务操作必须记录操作日志
6. 涉及多表操作必须使用数据库事务

## License

MIT
