# 企业员工考勤与人事薪资后端服务

基于 Node.js + Express + TypeScript 构建的企业级考勤与薪资管理系统。

## 技术栈

- **运行时**: Node.js
- **框架**: Express
- **语言**: TypeScript
- **数据库**: MySQL + Sequelize ORM
- **认证**: JWT (JSON Web Token)
- **日志**: Winston
- **Excel导出**: ExcelJS
- **参数校验**: Joi

## 功能模块

### 1. 部门组织架构模块
- 多级部门新增、编辑、禁用删除
- 部门上下级关联绑定
- 部门列表树形结构查询
- 人员归属关联统计

### 2. 员工人事档案模块
- 员工基础信息录入与管理
- 岗位绑定
- 入职、转正、离职状态管理
- 档案信息修改留痕
- 历史记录可追溯查询

### 3. 日常考勤打卡模块
- 上下班打卡记录
- 迟到、早退、旷工自动判定
- 请假申请审批流程
- 补卡申请登记
- 考勤数据自动归档入库

### 4. 月度薪资核算模块
- 基于考勤、岗位底薪自动核算薪资
- 绩效补贴、扣款项管理
- 薪资明细生成
- 按月份与部门条件查询
- Excel数据导出

## 项目结构

```
src/
├── config/              # 配置文件
│   └── database.ts     # 数据库连接配置
├── models/              # 数据模型
│   ├── User.ts         # 用户模型
│   ├── Department.ts   # 部门模型
│   ├── Employee.ts     # 员工模型
│   ├── Attendance.ts   # 考勤模型
│   ├── LeaveRequest.ts # 请假申请模型
│   ├── MakeupCard.ts   # 补卡申请模型
│   ├── Salary.ts       # 薪资模型
│   └── index.ts
├── controllers/         # 控制器层
├── services/            # 业务逻辑层
├── middleware/          # 中间件
│   ├── auth.ts         # 认证中间件
│   ├── errorHandler.ts # 错误处理中间件
│   ├── requestLogger.ts # 请求日志中间件
│   └── validation.ts   # 参数校验中间件
├── validation/          # 参数校验规则
├── utils/               # 工具函数
│   ├── logger.ts       # 日志工具
│   ├── response.ts     # 响应封装
│   └── jwt.ts          # JWT工具
├── exceptions/          # 异常类
├── routes/              # 路由定义
│   ├── auth.routes.ts
│   ├── department.routes.ts
│   ├── employee.routes.ts
│   ├── attendance.routes.ts
│   └── salary.routes.ts
└── app.ts              # 应用入口
```

## 快速开始

### 环境要求
- Node.js >= 16.x
- MySQL >= 8.0

### 安装依赖

```bash
npm install
```

### 环境配置

复制 `.env` 文件并根据实际情况修改配置：

```env
PORT=3000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=3306
DB_NAME=hr_attendance_db
DB_USER=root
DB_PASSWORD=your_password

JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=24h

LOG_LEVEL=info
```

### 启动服务

开发模式：

```bash
npm run dev
```

生产模式：

```bash
npm run build
npm start
```

### 默认账户

系统启动时会自动创建初始管理员账户：

- 用户名: admin
- 密码: 123456

## API 接口

### 认证接口
- `POST /api/auth/login` - 用户登录
- `POST /api/auth/change-password` - 修改密码
- `GET /api/auth/me` - 获取当前用户信息

### 部门接口
- `GET /api/departments/tree` - 获取部门树形结构
- `GET /api/departments/stats` - 获取部门统计
- `GET /api/departments/:id` - 获取部门详情
- `POST /api/departments` - 创建部门 (管理员/经理)
- `PUT /api/departments/:id` - 更新部门 (管理员/经理)
- `DELETE /api/departments/:id` - 删除部门 (管理员/经理)

### 员工接口
- `GET /api/employees` - 获取员工列表
- `GET /api/employees/stats` - 获取员工统计
- `GET /api/employees/:id` - 获取员工详情
- `GET /api/employees/:id/history` - 获取员工变更历史
- `POST /api/employees` - 创建员工 (管理员/经理)
- `PUT /api/employees/:id` - 更新员工 (管理员/经理)
- `DELETE /api/employees/:id` - 删除员工 (管理员/经理)
- `PUT /api/employees/:id/confirm` - 员工转正 (管理员/经理)
- `PUT /api/employees/:id/resign` - 员工离职 (管理员/经理)

### 考勤接口
- `POST /api/attendance/clock-in` - 上班打卡
- `POST /api/attendance/clock-out` - 下班打卡
- `GET /api/attendance/today` - 获取今日考勤
- `GET /api/attendance/records` - 获取考勤记录
- `GET /api/attendance/stats` - 获取考勤统计
- `POST /api/attendance/leave` - 提交请假申请
- `GET /api/attendance/leave` - 获取请假申请列表
- `PUT /api/attendance/leave/:id/cancel` - 取消请假申请
- `POST /api/attendance/makeup-card` - 提交补卡申请
- `GET /api/attendance/makeup-card` - 获取补卡申请列表
- `PUT /api/attendance/leave/:id/approve` - 审批请假申请 (管理员/经理)
- `PUT /api/attendance/makeup-card/:id/approve` - 审批补卡申请 (管理员/经理)

### 薪资接口
- `GET /api/salary/my` - 获取我的薪资
- `GET /api/salary` - 获取薪资列表
- `GET /api/salary/stats` - 获取薪资统计
- `GET /api/salary/export` - 导出薪资Excel
- `GET /api/salary/:id` - 获取薪资详情
- `POST /api/salary/calculate` - 核算薪资 (管理员/经理)
- `PUT /api/salary/:id` - 更新薪资 (管理员/经理)
- `DELETE /api/salary` - 删除薪资记录 (管理员/经理)
- `PUT /api/salary/mark-paid` - 标记已发放 (管理员/经理)

## 统一响应格式

```json
{
  "code": 200,
  "message": "操作成功",
  "data": {},
  "success": true,
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

## 角色权限

- **ADMIN (管理员)**: 拥有所有接口的访问权限
- **MANAGER (经理)**: 拥有部门管理、员工管理、考勤审批、薪资管理权限
- **EMPLOYEE (员工)**: 仅拥有个人考勤、请假、薪资查询权限

## 开发说明

### 代码规范
- 使用 TypeScript 强类型约束
- 遵循 RESTful API 设计规范
- 使用 Joi 进行参数校验
- 统一的异常处理机制

### 数据库事务
- 关键业务操作使用事务保证数据一致性
- 薪资核算、考勤审批等操作均支持事务回滚

## License

MIT
