# 市政环卫保洁人员工单调度后端服务

基于 Node.js + Express + TypeScript 构建的市政环卫保洁人员工单调度系统。

## 技术栈

- **框架**: Node.js + Express + TypeScript
- **数据库**: MySQL + Sequelize ORM
- **鉴权**: JWT (JSON Web Token)
- **其他**: 
  - 全局异常捕获
  - 操作日志留痕
  - 统一响应封装
  - 数据库事务
  - 定时任务 (node-cron)

## 功能模块

### 1. 环卫作业区域类目模块
- 主干道、居民区、商圈园区、公园绿地多级分类
- 类目新增、编辑、删除
- 区域停运/启用管控
- 后台排序配置
- 无限级树形递归查询

### 2. 保洁人员档案模块
- 人员信息登记（姓名、身份证、手机号）
- 负责区域分配
- 工种类型管理
- 排班班次配置
- 在岗/请假/离职状态管理
- 作业资质记录
- 员工编号唯一管控
- 劳动合同到期提醒

### 3. 环卫保洁工单模块
- 后台派发保洁任务
- 人员接单认领
- 现场作业打卡
- 问题上报功能
- 完工审核归档
- 超时未接单工单自动重派
- 工单状态自动流转
- 工单全链路操作日志

### 4. 作业考核绩效模块
- 按区域、月份统计工单完成率
- 出勤天数统计
- 违规扣分记录
- 绩效奖金自动计算
- 考核报表生成
- 人员作业明细追溯
- 绩效账单历史查询

## 项目结构

```
sanitation-workorder-service/
├── src/
│   ├── config/           # 配置文件
│   │   └── database.ts   # 数据库连接配置
│   ├── models/           # 数据模型
│   │   ├── User.ts       # 用户模型
│   │   ├── WorkArea.ts   # 作业区域模型
│   │   ├── Cleaner.ts    # 保洁人员模型
│   │   ├── WorkOrder.ts  # 工单模型
│   │   ├── WorkOrderLog.ts # 工单日志模型
│   │   ├── Performance.ts # 绩效模型
│   │   ├── OperationLog.ts # 操作日志模型
│   │   └── index.ts
│   ├── controllers/      # 控制器
│   ├── middlewares/      # 中间件
│   ├── routes/           # 路由
│   ├── scheduler/        # 定时任务
│   ├── exceptions/       # 异常类
│   ├── utils/            # 工具函数
│   └── app.ts            # 应用入口
├── .env                  # 环境变量
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

## API 接口列表

### 认证接口
- `POST /api/auth/login` - 用户登录
- `POST /api/auth/register` - 用户注册
- `GET /api/auth/profile` - 获取个人信息
- `PUT /api/auth/change-password` - 修改密码

### 作业区域接口
- `GET /api/work-areas` - 获取区域列表（树形）
- `GET /api/work-areas/:id` - 获取区域详情
- `POST /api/work-areas` - 创建区域
- `PUT /api/work-areas/:id` - 更新区域
- `DELETE /api/work-areas/:id` - 删除区域
- `PATCH /api/work-areas/:id/status` - 更新区域状态

### 保洁人员接口
- `GET /api/cleaners` - 获取人员列表
- `GET /api/cleaners/contract-expiring` - 获取合同即将到期人员
- `GET /api/cleaners/:id` - 获取人员详情
- `POST /api/cleaners` - 创建人员
- `PUT /api/cleaners/:id` - 更新人员
- `DELETE /api/cleaners/:id` - 删除人员
- `PATCH /api/cleaners/:id/contract-reminded` - 标记合同提醒

### 工单接口
- `GET /api/work-orders` - 获取工单列表
- `GET /api/work-orders/statistics` - 获取工单统计
- `GET /api/work-orders/:id` - 获取工单详情（含日志）
- `POST /api/work-orders` - 创建工单
- `POST /api/work-orders/:id/assign` - 分配工单
- `POST /api/work-orders/:id/accept` - 接单
- `POST /api/work-orders/:id/start` - 开始作业
- `POST /api/work-orders/:id/report` - 问题上报
- `POST /api/work-orders/:id/complete` - 完工
- `POST /api/work-orders/:id/review` - 审核工单
- `POST /api/work-orders/:id/reassign` - 重新分配

### 绩效接口
- `GET /api/performances` - 获取绩效列表
- `GET /api/performances/statistics` - 获取绩效统计
- `GET /api/performances/cleaner/:cleanerId` - 获取人员绩效历史
- `GET /api/performances/:id` - 获取绩效详情
- `POST /api/performances/calculate` - 计算月度绩效
- `PUT /api/performances/:id` - 更新绩效

## 安装与运行

### 环境要求
- Node.js >= 14.x
- MySQL >= 5.7

### 安装依赖
```bash
npm install
```

### 配置环境变量
复制 `.env` 文件并配置数据库连接信息：
```env
PORT=3000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=3306
DB_NAME=sanitation_db
DB_USER=root
DB_PASSWORD=your_password

JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=24h
```

### 创建数据库
```sql
CREATE DATABASE sanitation_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 开发模式运行
```bash
npm run dev
```

### 生产模式构建与运行
```bash
npm run build
npm start
```

## 工单状态流转

```
PENDING (待分配)
    ↓
ASSIGNED (已分配) ←─┐
    ↓                │
ACCEPTED (已接单)    │  REASSIGNED (重新分配)
    ↓                │
IN_PROGRESS (作业中)─┘
    ↓
REPORTED (问题上报)
    ↓
COMPLETED (已完工)
    ↓
REVIEWED (已审核) ←───┐
    ↓                │
    └────────────── 审核驳回重新分配
```

## 用户角色权限

- **ADMIN (管理员)**: 所有模块完全权限
- **MANAGER (经理)**: 人员管理、工单派发、审核权限
- **SUPERVISOR (主管)**: 工单派发、审核权限
- **WORKER (保洁员)**: 接单、作业、上报权限

## 定时任务

系统内置定时任务：
- **超时工单检测**: 每5分钟执行一次，自动重派超时未接单的工单

## 开发规范

1. 遵循 RESTful API 设计规范
2. 严格 TypeScript 类型约束
3. 请求参数校验使用 express-validator
4. 全局异常统一处理
5. 所有数据库写操作使用事务
6. 所有操作自动记录日志

## License

MIT
