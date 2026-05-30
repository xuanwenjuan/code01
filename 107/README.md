# 传统手工油纸伞定制产销管理后端服务

## 技术栈
- SpringBoot 3.x
- MyBatis-Plus
- MySQL 8.x
- Redis
- JWT
- 定时任务

## 项目结构
```
com.oiledumbrella
├── UmbrellaApplication.java      # 启动类
├── common
│   └── Result.java               # 统一响应结果
├── config
│   ├── MybatisPlusConfig.java    # MyBatis-Plus配置
│   └── WebConfig.java            # Web配置(跨域、拦截器)
├── controller
│   ├── AuthController.java       # 认证控制器
│   ├── CustomOrderController.java # 工单控制器
│   ├── MaterialController.java   # 原料控制器
│   └── UmbrellaCategoryController.java # 类目控制器
├── dto
│   └── LoginDTO.java             # 登录DTO
├── entity
│   ├── BaseEntity.java           # 基础实体
│   ├── CustomOrder.java          # 定制工单实体
│   ├── Material.java             # 原料实体
│   ├── SysUser.java              # 用户实体
│   └── UmbrellaCategory.java     # 伞品类目实体
├── enums
│   └── OrderStatusEnum.java      # 工单状态枚举
├── exception
│   ├── BusinessException.java    # 业务异常
│   └── GlobalExceptionHandler.java # 全局异常处理
├── interceptor
│   └── JwtInterceptor.java       # JWT拦截器
├── mapper
│   ├── CustomOrderMapper.java
│   ├── MaterialMapper.java
│   ├── SysUserMapper.java
│   └── UmbrellaCategoryMapper.java
├── service
│   ├── AuthService.java
│   ├── CustomOrderService.java
│   ├── MaterialService.java
│   └── UmbrellaCategoryService.java
├── task
│   └── OrderTask.java            # 定时任务
└── util
    └── JwtUtil.java              # JWT工具类
```

## 功能模块

### 1. 伞品样式类目模块
- 多级分类树形结构查询
- 类目新增、编辑、删除
- 过时款式下架停订
- 门店展示排序
- 按层级查询分类

### 2. 制伞原料库存模块
- 原料CRUD操作
- 库存低位自动预警
- 库存状态自动更新(断货停用/库存紧张/充足)
- 原料批次管理
- 库存调整

### 3. 私人定制生产工单
- 工单创建与查询
- 定金支付处理
- 工单状态自动流转:
  - 待付定金 → 设计确认 → 骨架拼装 → 上油裱纸 → 手绘装饰 → 成品验收 → 已发货 → 已完成
- 超时未支付定金自动取消(24小时)
- 工单取消功能

### 4. 多角色权限支持
- 制伞工匠: 负责生产工序操作
- 原料采购: 负责原料采购和库存管理
- 门店运营: 负责门店销售和客户服务
- 财务管理员: 负责财务对账和报表管理
- 系统管理员: 最高权限

## 数据库初始化

执行 `src/main/resources/sql/init.sql` 脚本创建数据库和表结构。

初始测试账号:
- 用户名: admin
- 密码: 同数据库中存储的密码

## 配置说明

修改 `application.yml` 中的配置:
- 数据库连接信息
- Redis连接信息
- JWT密钥和过期时间

## API接口

### 认证接口
- POST /api/auth/login - 用户登录

### 类目接口
- GET /api/category/tree - 树形分类
- POST /api/category - 新增分类
- PUT /api/category - 更新分类
- DELETE /api/category/{id} - 删除分类
- PUT /api/category/off-shelve/{id} - 下架分类
- GET /api/category/level/{level} - 按层级查询

### 原料接口
- GET /api/material/page - 分页查询
- POST /api/material - 新增原料
- PUT /api/material - 更新原料
- DELETE /api/material/{id} - 删除原料
- GET /api/material/low-stock - 库存预警列表
- PUT /api/material/stock/{id} - 更新库存
- GET /api/material/list - 可用原料列表

### 工单接口
- GET /api/order/page - 分页查询
- POST /api/order - 创建工单
- PUT /api/order/pay-deposit/{orderId} - 支付定金
- PUT /api/order/next-status/{orderId} - 下一状态
- PUT /api/order/cancel/{orderId} - 取消工单
- GET /api/order/{orderId} - 工单详情
- PUT /api/order - 更新工单

## 定时任务
- 每小时执行一次: 自动取消超时(24小时)未支付定金的工单

## 启动说明

1. 配置MySQL和Redis服务
2. 执行数据库初始化脚本
3. 启动UmbrellaApplication
4. 访问 http://localhost:8080
