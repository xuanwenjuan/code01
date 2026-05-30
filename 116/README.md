# 天然植物染布面料定制管控后端服务

## 项目简介

基于SpringBoot3 + MyBatis-Plus + MySQL + Redis + JWT的天然植物染布面料定制管理系统，支持多角色权限管理、染布色系类目管理、坯布染材库存管理、古法染制加工工单、染制成品成本核算等功能。

## 技术栈

- Spring Boot 3.2.0
- MyBatis-Plus 3.5.5
- MySQL 8.0+
- Redis
- JWT (jjwt 0.12.3)
- Lombok
- Validation

## 项目结构

```
com.naturaldye
├── NaturalDyeApplication.java    # 启动类
├── common
│   ├── GlobalExceptionHandler.java    # 全局异常处理
│   ├── BusinessException.java         # 业务异常
│   └── Result.java                    # 统一响应结果
├── config
│   ├── MybatisPlusConfig.java        # MyBatis-Plus配置
│   ├── MetaObjectHandler.java        # 自动填充处理器
│   └── WebConfig.java                 # Web配置
├── entity
│   ├── BaseEntity.java                # 基础实体类
│   ├── SysUser.java                   # 用户实体
│   ├── ColorCategory.java             # 色系类目实体
│   ├── Inventory.java                 # 库存实体
│   ├── DyeWorkOrder.java              # 工单实体
│   ├── WorkOrderMaterial.java         # 工单用料明细实体
│   ├── CostAccounting.java            # 成本核算实体
│   └── OperationLog.java              # 操作日志实体
├── enums
│   ├── UserRoleEnum.java              # 用户角色枚举
│   ├── CategoryStatusEnum.java        # 类目状态枚举
│   ├── InventoryStatusEnum.java       # 库存状态枚举
│   └── WorkOrderStatusEnum.java       # 工单状态枚举
├── mapper
│   ├── SysUserMapper.java
│   ├── ColorCategoryMapper.java
│   ├── InventoryMapper.java
│   ├── DyeWorkOrderMapper.java
│   ├── WorkOrderMaterialMapper.java
│   ├── CostAccountingMapper.java
│   └── OperationLogMapper.java
├── service
│   ├── AuthService.java               # 认证服务
│   ├── ColorCategoryService.java      # 色系类目服务
│   ├── InventoryService.java          # 库存服务
│   ├── DyeWorkOrderService.java       # 工单服务
│   └── CostAccountingService.java     # 成本核算服务
├── controller
│   ├── AuthController.java
│   ├── ColorCategoryController.java
│   ├── InventoryController.java
│   ├── DyeWorkOrderController.java
│   └── CostAccountingController.java
├── interceptor
│   └── JwtInterceptor.java            # JWT拦截器
├── task
│   └── WorkOrderTask.java             # 定时任务
└── util
    └── JwtUtil.java                   # JWT工具类
```

## 功能模块

### 1. 用户认证与权限管理

- 支持染料调配师、布匹采购、织造工坊、平台管理员四种角色
- JWT令牌认证
- 统一登录/注册接口

### 2. 染布色系类目模块

- 无限级树形类目结构
- 类目新增/编辑/删除
- 老旧配色停产下架
- 订单优先排序
- 草木原色、复配花色、古风禅意色、民俗特色色四大分类

### 3. 坯布染材库存模块

- 纯棉坯布、麻料面料、天然染料、固色助剂等物料管理
- 库存充足/库存预警/停止采购三状态
- 物料唯一批次编号
- 易褪色原料临期提醒

### 4. 古法染制加工工单

- 全流程状态流转：待投料→面料预处理→染料熬煮调色→浸泡匀染→固色漂洗→晾晒定型→成品裁剪出库→已完成
- 超时未投料工单自动暂停（每小时检查）
- 工单用料明细记录
- 库存自动扣减

### 5. 染制成品成本核算

- 按色系品类统计面料消耗、染料用料
- 人工染制工时计算
- 定制订单收益统计
- 自动生成经营报表
- 支持财务对账溯源

## 快速开始

### 1. 数据库初始化

执行 `src/main/resources/schema.sql` 文件初始化数据库。

默认用户账号（密码：123456）：
- admin / 平台管理员
- dyemaster / 染料调配师
- purchaser / 布匹采购
- workshop / 织造工坊

### 2. 配置文件修改

修改 `src/main/resources/application.yml`：

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/natural_dye?useUnicode=true&characterEncoding=utf-8&serverTimezone=Asia/Shanghai&useSSL=false
    username: your_username
    password: your_password
  data:
    redis:
      host: localhost
      port: 6379
      password: your_password
```

### 3. 启动项目

运行 `NaturalDyeApplication.java` 启动类。

项目启动后访问：`http://localhost:8080/api`

## API接口列表

### 认证接口
- POST `/api/auth/login` - 登录
- POST `/api/auth/register` - 注册

### 色系类目接口
- GET `/api/category/tree` - 获取类目树
- GET `/api/category/tree/active` - 获取活跃类目树
- GET `/api/category/{id}` - 获取类目详情
- POST `/api/category` - 新增类目
- PUT `/api/category` - 更新类目
- DELETE `/api/category/{id}` - 删除类目
- PUT `/api/category/{id}/discontinue` - 类目停产下架

### 库存管理接口
- GET `/api/inventory/page` - 库存分页列表
- GET `/api/inventory/{id}` - 库存详情
- GET `/api/inventory/expiring-fading` - 临期易褪色物料
- POST `/api/inventory` - 新增库存
- PUT `/api/inventory` - 更新库存
- DELETE `/api/inventory/{id}` - 删除库存

### 工单管理接口
- GET `/api/work-order/page` - 工单分页列表
- GET `/api/work-order/{id}` - 工单详情
- GET `/api/work-order/{id}/materials` - 工单用料明细
- POST `/api/work-order` - 创建工单
- POST `/api/work-order/{id}/start` - 开始投料生产
- PUT `/api/work-order/{id}/next-status` - 工单流转下一状态
- PUT `/api/work-order/{id}/pause` - 暂停工单

### 成本核算接口
- POST `/api/cost-accounting/generate?date=yyyy-MM-dd` - 生成日报表
- GET `/api/cost-accounting/page` - 成本报表分页
- GET `/api/cost-accounting/{id}` - 报表详情
- GET `/api/cost-accounting/summary` - 报表汇总

## 工单状态流转说明

```
待投料 (1)
    ↓
面料预处理 (2)
    ↓
染料熬煮调色 (3)
    ↓
浸泡匀染 (4)
    ↓
固色漂洗 (5)
    ↓
晾晒定型 (6)
    ↓
成品裁剪出库 (7)
    ↓
已完成 (8)

超时未投料 → 已暂停 (9)
```

## 注意事项

1. 确保MySQL和Redis服务已启动
2. JWT密钥可在配置文件中自定义
3. 定时任务每小时检查超时工单
4. 数据库密码已MD5加密存储
