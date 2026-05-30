# 职业技能培训学校学员教务后端服务

基于 Node.js + Express + TypeScript 开发的职业技能培训学校教务管理系统后端。

## 技术栈

- **框架**: Express.js
- **语言**: TypeScript
- **数据库**: MySQL + Sequelize ORM
- **认证**: JWT (JSON Web Token)
- **验证**: Joi
- **安全**: Helmet, CORS
- **日志**: Morgan, 操作日志留痕

## 功能模块

### 1. 培训专业类目管理
- 多级分类树状结构（职业考证、技能实操、学历提升、兴趣进修）
- 专业新增、编辑、删除
- 课时配置
- 招生启停状态管理
- 排序维护

### 2. 讲师师资档案管理
- 讲师基本信息录入
- 授课专业绑定
- 教学资历管理
- 全职/兼职类型区分
- 在岗/休假/离职状态管理
- 授课档期查询

### 3. 学员报名分班管理
- 学员信息建档
- 意向专业报名
- 缴费审核确认
- 自动/手动分配班级
- 旁听、结业状态流转
- 报名记录可追溯

### 4. 班级课时考勤管理
- 班级排课管理
- 学员日常打卡考勤
- 请假登记
- 缺勤记录归档
- 多维度出勤统计
- 课时完成进度跟踪

## 项目结构

```
.
├── src/
│   ├── config/              # 配置文件
│   ├── controllers/         # 控制器
│   ├── database/            # 数据库连接
│   ├── exceptions/          # 异常处理
│   ├── middlewares/         # 中间件
│   ├── models/              # 数据模型
│   ├── routes/              # 路由定义
│   ├── scripts/             # 脚本文件
│   ├── types/               # 类型定义
│   ├── utils/               # 工具函数
│   ├── validations/         # 数据验证
│   └── app.ts               # 应用入口
├── .env                     # 环境变量
├── package.json
├── tsconfig.json
└── README.md
```

## 快速开始

### 前置要求

- Node.js >= 16.0.0
- MySQL >= 5.7
- npm 或 yarn

### 安装依赖

```bash
npm install
```

### 环境配置

复制 `.env` 文件并根据实际情况修改配置：

```env
NODE_ENV=development
PORT=3000

DB_HOST=localhost
DB_PORT=3306
DB_NAME=vocational_school
DB_USER=root
DB_PASSWORD=your_password

JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=7d

LOG_LEVEL=info
```

### 数据库初始化

```bash
# 创建数据库
# 执行初始化脚本（创建表结构并插入测试数据）
npm run init:db
```

### 启动开发服务器

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
npm start
```

## 默认账号

| 角色 | 用户名 | 密码 | 说明 |
|------|--------|------|------|
| 超级管理员 | admin | 123456 | 拥有所有权限 |
| 教师 | teacher1 | 123456 | 讲师账号 |
| 学员 | student1 | 123456 | 学员账号 |

## API 接口

### 认证相关
- `POST /api/auth/login` - 用户登录
- `POST /api/auth/register` - 用户注册
- `GET /api/auth/profile` - 获取当前用户信息

### 专业分类
- `GET /api/majors/tree` - 获取分类树
- `GET /api/majors` - 获取分类列表
- `GET /api/majors/:id` - 获取分类详情
- `POST /api/majors` - 创建分类
- `PUT /api/majors/:id` - 更新分类
- `DELETE /api/majors/:id` - 删除分类
- `PATCH /api/majors/:id/status` - 切换状态

### 讲师管理
- `GET /api/teachers/available` - 获取可用讲师列表
- `GET /api/teachers` - 获取讲师列表
- `GET /api/teachers/:id` - 获取讲师详情
- `POST /api/teachers` - 创建讲师
- `PUT /api/teachers/:id` - 更新讲师
- `DELETE /api/teachers/:id` - 删除讲师
- `PATCH /api/teachers/:id/status` - 更新状态

### 学员管理
- `GET /api/students` - 获取学员列表
- `GET /api/students/:id` - 获取学员详情
- `POST /api/students` - 创建学员
- `PUT /api/students/:id` - 更新学员
- `DELETE /api/students/:id` - 删除学员
- `PATCH /api/students/:id/status` - 更新状态

### 报名管理
- `GET /api/enrollments` - 获取报名列表
- `GET /api/enrollments/:id` - 获取报名详情
- `POST /api/enrollments` - 创建报名
- `POST /api/enrollments/:id/approve` - 审核通过
- `POST /api/enrollments/:id/reject` - 拒绝报名
- `POST /api/enrollments/:id/payment` - 确认缴费
- `POST /api/enrollments/assign-class` - 分配班级

### 班级管理
- `GET /api/classes` - 获取班级列表
- `GET /api/classes/:id` - 获取班级详情
- `POST /api/classes` - 创建班级
- `PUT /api/classes/:id` - 更新班级
- `DELETE /api/classes/:id` - 删除班级
- `PATCH /api/classes/:id/status` - 更新状态

### 课时管理
- `GET /api/lessons` - 获取课时列表
- `GET /api/lessons/:id` - 获取课时详情
- `POST /api/lessons` - 创建课时
- `PUT /api/lessons/:id` - 更新课时
- `DELETE /api/lessons/:id` - 删除课时
- `POST /api/lessons/:id/complete` - 完成课时

### 考勤管理
- `GET /api/attendances/lesson/:lessonId` - 获取课时考勤
- `GET /api/attendances/student/:studentId` - 获取学员考勤
- `GET /api/attendances/statistics` - 获取考勤统计
- `POST /api/attendances/check-in` - 签到
- `POST /api/attendances/check-out` - 签退
- `POST /api/attendances/bulk` - 批量创建考勤
- `PUT /api/attendances/:id` - 更新考勤记录

## 核心特性

### 1. 权限控制
- 多角色分级权限（超级管理员、管理员、教师、学员）
- JWT 令牌认证
- 接口级权限控制

### 2. 数据一致性
- 数据库事务支持
- 操作日志全程留痕
- 数据变更可追溯

### 3. 业务流程自动化
- 报名审核流程自动化
- 自动分班逻辑
- 状态自动流转

### 4. 异常处理
- 全局异常捕获
- 统一错误响应格式
- 友好的错误提示

### 5. 操作审计
- 所有写入操作记录日志
- 记录操作人、时间、内容、结果
- 可追溯的审计日志

## 数据库表说明

| 表名 | 说明 |
|------|------|
| users | 系统用户表 |
| major_categories | 专业分类表 |
| teachers | 讲师档案表 |
| students | 学员档案表 |
| classes | 班级表 |
| enrollments | 报名表 |
| lessons | 课时表 |
| attendances | 考勤表 |
| operation_logs | 操作日志表 |

## 开发规范

- 严格遵循 TypeScript 类型约束
- RESTful API 设计规范
- 统一的响应格式
- 参数校验前置
- 合理的分层架构

## 许可证

ISC
