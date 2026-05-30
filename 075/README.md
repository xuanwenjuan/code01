
# 工业园区物业资产管理系统后端服务

基于 Node.js + Express + TypeScript + MySQL + Sequelize 构建的企业级资产管理系统。

## 技术栈

- **后端框架**: Express.js
- **开发语言**: TypeScript
- **数据库**: MySQL 8.0+
- **ORM**: Sequelize
- **身份认证**: JWT (JSON Web Token)
- **参数校验**: express-validator
- **定时任务**: node-cron
- **安全防护**: helmet, cors
- **日志记录**: morgan

## 功能模块

### 1. 用户认证与授权模块
- 用户注册/登录
- JWT 令牌认证
- 角色权限控制（超级管理员、管理员、部门负责人、普通用户）
- 获取当前用户信息

### 2. 园区资产分类模块
- 多级分类体系（支持无限层级）
- 分类新增/编辑/删除
- 分类启用/停用
- 树形结构查询
- 分类排序

### 3. 固定资产档案模块
- 资产信息登记（资产编号、规格型号、品牌、采购日期等）
- 资产状态管理（在用、闲置、维修中、已报废）
- 资产价值管理（采购价格、当前价值、折旧率）
- 资产位置与责任人管理
- 保修到期提醒
- 资产统计分析

### 4. 资产领用调拨模块
- 领用申请（闲置资产领用）
- 调拨申请（跨部门资产调拨）
- 归还申请
- 报修申请
- 多级审批流程
- 审批状态跟踪
- 申请记录永久留存

### 5. 资产盘点折旧模块
- 资产盘点记录
- 批量盘点功能
- 盘点结果统计（正常、盘盈、盘亏）
- 自动计算资产折旧
- 盘点报表生成
- 折旧报表生成
- 多维度数据统计

## 数据库模型

### User（用户表）
- id, username, password, realName, phone, email, department, role, isActive

### AssetCategory（资产分类表）
- id, name, code, parentId, level, sort, description, isActive

### Asset（资产表）
- id, assetCode, name, categoryId, specModel, brand, purchaseDate, purchasePrice, currentValue, depreciationRate, department, storageLocation, responsiblePerson, status, warrantyDate, description

### AssetApplication（申请表）
- id, applicationNo, type, assetId, applicantId, applicantDepartment, targetDepartment, reason, status, approverId, approvalRemark, approvalTime

### AssetInventory（盘点记录表）
- id, inventoryNo, inventoryDate, assetId, bookStatus, actualStatus, result, remark, operatorId

### OperationLog（操作日志表）
- id, userId, username, module, operation, ip, userAgent, createdAt

## 快速开始

### 环境要求
- Node.js 16.x+
- MySQL 8.0+
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
DB_NAME=asset_management
DB_USER=root
DB_PASSWORD=your_password

JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d
```

### 数据库初始化
系统会自动创建表结构，无需手动执行 SQL。

### 启动开发服务器
```bash
npm run dev
```

### 生产构建
```bash
npm run build
npm start
```

## API 接口文档

### 认证接口
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `GET /api/auth/me` - 获取当前用户信息

### 资产分类接口
- `GET /api/categories/tree` - 获取分类树形结构
- `GET /api/categories` - 获取分类列表
- `GET /api/categories/:id` - 获取分类详情
- `POST /api/categories` - 创建分类
- `PUT /api/categories/:id` - 更新分类
- `DELETE /api/categories/:id` - 删除分类

### 资产管理接口
- `GET /api/assets` - 获取资产列表
- `GET /api/assets/statistics` - 获取资产统计
- `GET /api/assets/:id` - 获取资产详情
- `POST /api/assets` - 创建资产
- `PUT /api/assets/:id` - 更新资产
- `PATCH /api/assets/:id/status` - 更新资产状态
- `DELETE /api/assets/:id` - 报废资产

### 申请审批接口
- `GET /api/applications` - 获取申请列表
- `GET /api/applications/:id` - 获取申请详情
- `POST /api/applications` - 创建申请
- `PUT /api/applications/:id/approve` - 审批申请
- `PUT /api/applications/:id/complete` - 完成申请
- `DELETE /api/applications/:id` - 取消申请

### 盘点折旧接口
- `GET /api/inventories` - 获取盘点列表
- `GET /api/inventories/statistics` - 获取盘点统计
- `GET /api/inventories/report` - 生成盘点报表
- `GET /api/inventories/depreciation-report` - 生成折旧报表
- `GET /api/inventories/:id` - 获取盘点详情
- `POST /api/inventories` - 创建盘点记录
- `POST /api/inventories/batch` - 批量盘点

## 系统特性

1. **严格的类型约束** - 使用 TypeScript 确保代码质量
2. **统一响应格式** - 标准化 API 响应结构
3. **全局异常处理** - 统一的错误处理机制
4. **操作日志记录** - 完整记录用户操作和 IP 信息
5. **数据库事务** - 确保关键操作的数据一致性
6. **定时任务调度** - 自动计算折旧、检查保修到期
7. **多角色权限控制** - 基于角色的访问控制（RBAC）
8. **参数校验** - 严格的请求参数验证
9. **树形结构支持** - 多级分类递归查询
10. **数据统计报表** - 多维度数据分析与报表导出

## 项目结构

```
.
├── src/
│   ├── controllers/          # 控制器
│   │   ├── auth.controller.ts
│   │   ├── category.controller.ts
│   │   ├── asset.controller.ts
│   │   ├── application.controller.ts
│   │   └── inventory.controller.ts
│   ├── models/              # 数据模型
│   │   ├── User.ts
│   │   ├── AssetCategory.ts
│   │   ├── Asset.ts
│   │   ├── AssetApplication.ts
│   │   ├── AssetInventory.ts
│   │   ├── OperationLog.ts
│   │   └── index.ts
│   ├── middleware/          # 中间件
│   │   ├── auth.middleware.ts
│   │   └── error.middleware.ts
│   ├── routes/              # 路由
│   │   ├── auth.routes.ts
│   │   ├── category.routes.ts
│   │   ├── asset.routes.ts
│   │   ├── application.routes.ts
│   │   └── inventory.routes.ts
│   ├── utils/               # 工具函数
│   │   ├── response.ts
│   │   ├── logger.ts
│   │   └── scheduler.ts
│   ├── config/              # 配置
│   │   └── database.ts
│   ├── types/               # 类型定义
│   │   └── index.ts
│   └── app.ts               # 应用入口
├── .env                      # 环境变量
├── package.json
├── tsconfig.json
└── README.md
```

## 默认角色

- `SUPER_ADMIN` - 超级管理员，拥有所有权限
- `ADMIN` - 管理员，拥有大部分管理权限
- `DEPARTMENT_HEAD` - 部门负责人，可以审批本部门申请
- `GENERAL_USER` - 普通用户，可以提交申请

## 注意事项

1. 生产环境请务必修改 `JWT_SECRET` 为强随机字符串
2. 数据库密码请妥善保管，不要提交到代码仓库
3. 建议配置 HTTPS 确保传输安全
4. 定期备份数据库数据

## License

MIT
