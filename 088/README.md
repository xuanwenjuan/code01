# 标本馆藏文博藏品管理后端服务

## 技术栈

- Node.js + Express + TypeScript
- MySQL + Sequelize ORM
- JWT 身份认证
- 全局异常捕获
- 操作日志留痕
- 统一响应封装
- 数据库事务
- 定时任务

## 功能模块

### 1. 文博藏品类目模块
- 出土文物、动植物标本、古籍文献、民俗器物多级分类
- 类目新增
- 封存归档
- 展馆展示排序
- 无限级树形递归查询

### 2. 馆藏藏品档案模块
- 藏品编号登记
- 年代、材质、来源、保存等级管理
- 完好/待修复/封存状态管理
- 藏品唯一编号管控
- 定期养护到期提醒

### 3. 藏品修复养护模块
- 藏品送修登记
- 修复方案备案
- 技师施工
- 验收归库
- 定期养护记录
- 修复进度状态自动流转
- 养护操作全程留痕

### 4. 馆藏展览调度模块
- 按展馆、展期统计参展藏品数量
- 展出时长统计
- 养护成本统计
- 轮换频次统计
- 自动生成展览台账
- 藏品流转明细与养护账单追溯

## 用户角色

- **管理员 (admin)**: 系统全权限
- **馆藏管理员 (collection_manager)**: 藏品管理、类目管理、展览调度
- **修复技师 (restoration_technician)**: 修复操作、养护记录

## 安装与运行

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env` 并修改配置：

```env
NODE_ENV=development
PORT=3000

DB_HOST=localhost
DB_PORT=3306
DB_NAME=museum_collection
DB_USER=root
DB_PASSWORD=your_password

JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=7d

LOG_LEVEL=info
```

### 3. 运行开发服务器

```bash
npm run dev
```

### 4. 构建生产版本

```bash
npm run build
npm start
```

## API 接口文档

### 认证接口
- `POST /api/auth/login` - 用户登录
- `POST /api/auth/users` - 创建用户（管理员权限）
- `GET /api/auth/users/me` - 获取当前用户信息
- `GET /api/auth/users` - 获取用户列表（管理员权限）
- `PUT /api/auth/users/:id` - 更新用户（管理员权限）
- `DELETE /api/auth/users/:id` - 删除用户（管理员权限）

### 类目接口
- `GET /api/categories/tree` - 获取分类树
- `GET /api/categories/type/:type` - 按类型获取分类
- `GET /api/categories/:id` - 获取单个分类
- `POST /api/categories` - 创建分类
- `PUT /api/categories/:id` - 更新分类
- `PUT /api/categories/sort/batch` - 批量更新排序
- `DELETE /api/categories/:id/archive` - 归档分类

### 藏品接口
- `GET /api/collections` - 获取藏品列表
- `GET /api/collections/maintenance/due-soon` - 获取即将到期保养的藏品
- `GET /api/collections/:id` - 获取单个藏品
- `POST /api/collections` - 创建藏品
- `PUT /api/collections/:id` - 更新藏品
- `PUT /api/collections/:id/status` - 更新藏品状态
- `POST /api/collections/:collectionId/maintenance` - 记录保养

### 修复接口
- `GET /api/restorations` - 获取修复记录列表
- `GET /api/restorations/:id` - 获取单个修复记录
- `POST /api/restorations` - 创建修复记录
- `PUT /api/restorations/:id/approve` - 审批修复方案
- `PUT /api/restorations/:id/start` - 开始修复
- `PUT /api/restorations/:id/complete` - 完成修复
- `PUT /api/restorations/:id/accept` - 验收修复

### 展览接口
- `GET /api/exhibitions` - 获取展览列表
- `GET /api/exhibitions/ledger` - 获取展览台账
- `GET /api/exhibitions/:id` - 获取单个展览
- `GET /api/exhibitions/:id/stats` - 获取展览统计
- `POST /api/exhibitions` - 创建展览
- `PUT /api/exhibitions/:id` - 更新展览
- `POST /api/exhibitions/:exhibitionId/collections/:collectionId` - 添加藏品到展览
- `DELETE /api/exhibitions/:exhibitionId/collections/:collectionId` - 从展览移除藏品

## 项目结构

```
src/
├── config/          # 配置文件
│   ├── database.ts  # 数据库配置
│   └── logger.ts    # 日志配置
├── controllers/     # 控制器
├── middleware/      # 中间件
├── models/          # 数据模型
├── routes/          # 路由
├── services/        # 业务逻辑
├── types/           # 类型定义
└── app.ts           # 应用入口
```
