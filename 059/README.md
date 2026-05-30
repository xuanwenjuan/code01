# 工业工厂备品备件库存管理后端服务

## 技术栈
- Node.js + Express + TypeScript
- MySQL + Sequelize ORM
- JWT 身份认证
- 全局异常捕获
- 接口请求日志
- 统一响应封装
- 数据库事务控制

## 功能模块

### 1. 备件分类档案模块
- 建立设备备件多级分类体系
- 支持分类新增、编辑、禁用
- 上下级层级关联
- 树形结构关联查询

### 2. 供应商资料管理模块
- 维护备件供应商基础信息
- 供货品类管理
- 合作有效期管理
- 联系人资质管理
- 合作状态变更
- 到期预警数据查询

### 3. 备件出入库管理模块
- 采购入库管理
- 领用出库管理
- 退库归还管理
- 流水台账记录
- 实时更新库存余量
- 锁定库存变动记录

### 4. 安全库存预警模块
- 配置各类备件最低安全库存阈值
- 自动筛查低于阈值物料
- 生成预警清单
- 按车间、分类多维度统计

## 安装和运行

### 1. 安装依赖
```bash
npm install
```

### 2. 配置环境变量
复制 `.env` 文件并配置数据库连接信息：
```env
NODE_ENV=development
PORT=3000

DB_HOST=localhost
DB_PORT=3306
DB_NAME=spare_parts_inventory
DB_USER=root
DB_PASSWORD=your_password

JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=24h

LOG_LEVEL=info
```

### 3. 初始化数据库
确保 MySQL 服务已启动，并创建对应的数据库。

### 4. 启动开发服务器
```bash
npm run dev
```

### 5. 构建生产版本
```bash
npm run build
npm start
```

## 初始化管理员账户

首次启动后，调用接口初始化管理员账户：
```
POST /api/auth/init-admin
```

默认账户信息：
- 用户名：admin
- 密码：123456

## API 接口文档

### 认证接口
- `POST /api/auth/login` - 用户登录
- `GET /api/auth/me` - 获取当前用户信息
- `POST /api/auth/init-admin` - 初始化管理员

### 分类管理
- `GET /api/categories/tree` - 获取分类树
- `GET /api/categories` - 获取分类列表
- `GET /api/categories/:id` - 获取分类详情
- `POST /api/categories` - 创建分类
- `PUT /api/categories/:id` - 更新分类
- `DELETE /api/categories/:id` - 删除分类

### 供应商管理
- `GET /api/suppliers` - 获取供应商列表
- `GET /api/suppliers/expiring` - 获取即将到期供应商
- `GET /api/suppliers/:id` - 获取供应商详情
- `POST /api/suppliers` - 创建供应商
- `PUT /api/suppliers/:id` - 更新供应商
- `DELETE /api/suppliers/:id` - 删除供应商

### 库存管理
- `GET /api/inventory/spare-parts` - 获取备件列表
- `POST /api/inventory/spare-parts` - 创建备件
- `PUT /api/inventory/spare-parts/:id` - 更新备件
- `GET /api/inventory/records` - 获取出入库记录
- `POST /api/inventory/in` - 入库操作
- `POST /api/inventory/out` - 出库操作
- `POST /api/inventory/return` - 退库操作

### 预警管理
- `GET /api/alerts` - 获取预警列表
- `GET /api/alerts/statistics` - 获取预警统计
- `PUT /api/alerts/:id/handle` - 处理预警

## 角色权限说明

- **admin (管理员)**: 拥有所有权限
- **manager (经理)**: 拥有大部分管理权限，可进行增删改操作
- **user (普通用户)**: 可进行查询和出入库操作
- **viewer (查看者)**: 仅可查看数据

## 项目结构

```
.
├── src/
│   ├── config/          # 配置文件
│   ├── controllers/     # 控制器
│   ├── middleware/      # 中间件
│   ├── models/          # 数据模型
│   ├── routes/          # 路由定义
│   ├── services/        # 业务服务
│   ├── types/           # 类型定义
│   ├── utils/           # 工具函数
│   └── app.ts           # 应用入口
├── logs/                # 日志目录
├── dist/                # 编译输出
├── package.json
├── tsconfig.json
├── .env
└── README.md
```

## 统一响应格式

### 成功响应
```json
{
  "code": 200,
  "message": "操作成功",
  "data": {},
  "success": true
}
```

### 失败响应
```json
{
  "code": 500,
  "message": "操作失败",
  "success": false
}
```

## 许可证

MIT
