# 企业团建会务活动报名后端服务

基于 Node.js + Express + TypeScript + MySQL 的企业团建活动管理系统后端服务。

## 技术栈

- **运行环境**: Node.js
- **Web框架**: Express.js
- **开发语言**: TypeScript
- **ORM框架**: Sequelize
- **数据库**: MySQL
- **身份认证**: JWT (JSON Web Token)
- **日志管理**: Winston
- **定时任务**: node-cron

## 功能模块

### 1. 团建活动类目管理
- 多级分类树形结构
- 类目新增/编辑/删除
- 活动停办/启用
- 排序权重配置
- 树形层级查询

### 2. 合作会务商家管理
- 商家信息录入/编辑
- 承接项目管理
- 服务档期管理
- 报价套餐配置
- 商家资质审核
- 档期锁定/解锁
- 多条件检索查询

### 3. 企业活动发布管理
- 活动创建与编辑
- 人数限额设置
- 报名起止时间
- 费用标准设置
- 参与部门限定
- 活动状态自动流转（草稿→报名中→已截止→已完结）
- 定时任务自动更新状态

### 4. 员工报名签到管理
- 在线报名功能
- 部门审批流程
- 名额满员自动截止
- 活动现场签到
- 报名记录归档
- 按部门/活动维度统计参与数据

## 核心特性

- ✅ 严格的 TypeScript 类型约束
- ✅ RESTful API 接口规范
- ✅ 全局异常统一捕获处理
- ✅ 操作日志全程留痕
- ✅ 统一响应格式封装
- ✅ 数据库事务支持
- ✅ 部门角色分级权限
- ✅ 业务状态自动流转
- ✅ 定时任务自动执行
- ✅ JWT 无状态认证

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

复制 `.env` 文件并配置数据库连接信息：

```env
PORT=3000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=3306
DB_NAME=team_building
DB_USER=root
DB_PASSWORD=your_password

JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d

LOG_LEVEL=info
```

### 创建数据库

```sql
CREATE DATABASE team_building CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 初始化数据

```bash
npm run build
node dist/utils/initData.js
```

默认测试账号：
- 用户名: admin
- 密码: 123456

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

## 接口文档

### 认证接口
- `POST /api/auth/login` - 用户登录
- `GET /api/auth/me` - 获取当前用户信息

### 活动类目接口
- `GET /api/categories/tree` - 获取类目树
- `GET /api/categories/:id` - 获取单个类目
- `POST /api/categories` - 创建类目
- `PUT /api/categories/:id` - 更新类目
- `PATCH /api/categories/:id/status` - 切换类目状态
- `DELETE /api/categories/:id` - 删除类目

### 商家管理接口
- `GET /api/merchants` - 获取商家列表
- `GET /api/merchants/:id` - 获取商家详情
- `POST /api/merchants` - 创建商家
- `PUT /api/merchants/:id` - 更新商家
- `PATCH /api/merchants/:id/audit` - 审核商家
- `DELETE /api/merchants/:id` - 删除商家
- `GET /api/merchants/:merchantId/schedules` - 获取商家档期
- `POST /api/merchants/schedules` - 创建档期
- `PATCH /api/merchants/schedules/:id/lock` - 切换档期锁定状态

### 活动管理接口
- `GET /api/activities` - 获取活动列表
- `GET /api/activities/statistics` - 获取报名统计
- `GET /api/activities/:id` - 获取活动详情
- `POST /api/activities` - 创建活动
- `PUT /api/activities/:id` - 更新活动
- `PATCH /api/activities/:id/status` - 更新活动状态
- `DELETE /api/activities/:id` - 删除活动
- `POST /api/activities/register` - 报名活动
- `GET /api/activities/registrations/my` - 获取我的报名
- `PATCH /api/activities/registrations/:id/approve` - 审批报名
- `PATCH /api/activities/registrations/:id/checkin` - 签到
- `PATCH /api/activities/registrations/:id/cancel` - 取消报名

## 权限角色

| 角色ID | 角色名称 | 说明 |
|--------|----------|------|
| 1 | 超级管理员 | 系统最高权限，可执行所有操作 |
| 2 | 管理员 | 后台管理权限 |
| 3 | 部门经理 | 部门管理权限，可审批部门内报名 |
| 4 | 普通员工 | 基础操作权限 |

## 项目结构

```
src/
├── config/          # 配置文件
│   ├── database.ts  # 数据库配置
│   └── logger.ts    # 日志配置
├── controllers/     # 控制器层
├── middleware/      # 中间件
├── models/          # 数据模型
├── routes/          # 路由定义
├── types/           # 类型定义
├── utils/           # 工具函数
└── app.ts           # 应用入口
```

## 统一响应格式

```json
{
  "code": 200,
  "message": "操作成功",
  "data": {},
  "timestamp": 1699999999999
}
```

## 许可证

MIT
