# 液压油缸活塞精密机加工生产管控后端服务

## 项目简介

基于 Spring Boot 3 + MyBatis-Plus 的液压油缸活塞精密机加工生产管理系统，实现从原料采购到成品入库的全流程数字化管理。

## 技术栈

- **框架**: Spring Boot 3.2
- **ORM**: MyBatis-Plus 3.5.5
- **数据库**: MySQL 8.0
- **缓存**: Redis
- **认证**: JWT
- **接口文档**: SpringDoc OpenAPI (Swagger)
- **定时任务**: Spring Scheduling

## 功能模块

### 1. 用户权限管理
- 多级角色：超级管理员、原料采购员、机加工工艺员、数控班组组长、尺寸质检专员
- JWT 无状态认证
- 用户注册、登录

### 2. 活塞产品分类管理
- 无限级树形分类
- 分类新增、编辑、删除
- 老旧结构活塞下线停产
- 客户订单排产优先级调整

### 3. 棒料原料仓储管理
- 调质圆钢、耐磨合金棒、不锈钢坯料等原料管理
- 自动生成唯一生产批次号
- 库存状态：充足、预警、停止采购
- 易变形长棒料仓储堆放时效提醒
- 原料入库、出库、库存预警

### 4. 数控机加工生产工单
- 7道工序自动流转：
  1. 棒料切断下料
  2. 数控粗车外圆
  3. 精车端面沟槽
  4. 滚压内孔纹路
  5. 高频淬火硬化
  6. 外径尺寸研磨
  7. 探伤质检入库
- 工单状态：待开始、进行中、暂停、已完成、已取消
- 超出排产周期未加工工单自动暂停（定时任务）
- 工序完成确认、质检合格/报废登记

### 5. 机加工成本汇总
- 按活塞型号统计：
  - 圆钢原料消耗量
  - 数控刀具损耗
  - 淬火设备能耗
  - 操作工人工工时
  - 尺寸超差报废损失
- 自动生成月度生产统计报表
- 工单用料明细与财务成本一键对账溯源

### 6. 操作日志
- AOP 切面自动记录
- 记录操作人、IP、模块、参数、执行时间
- 支持按用户、模块、状态查询

## 项目结构

```
piston-manufacture/
├── src/main/java/com/hydraulic/piston/
│   ├── annotation/          # 自定义注解
│   │   └── Log.java         # 操作日志注解
│   ├── aspect/              # AOP切面
│   │   └── LogAspect.java   # 操作日志切面
│   ├── common/              # 公共类
│   │   ├── Result.java      # 统一响应封装
│   │   └── RoleEnum.java    # 角色枚举
│   ├── config/              # 配置类
│   │   ├── MybatisPlusConfig.java
│   │   ├── MetaObjectHandlerConfig.java
│   │   └── WebConfig.java
│   ├── controller/          # 控制器层
│   ├── dto/                 # 数据传输对象
│   ├── entity/              # 实体类
│   │   └── sys/             # 系统模块实体
│   ├── exception/           # 异常处理
│   ├── interceptor/         # 拦截器
│   ├── mapper/              # Mapper接口
│   ├── service/             # 服务层
│   ├── task/                # 定时任务
│   ├── util/                # 工具类
│   └── vo/                  # 视图对象
├── src/main/resources/
│   ├── sql/                 # 数据库脚本
│   │   └── init.sql         # 初始化脚本
│   └── application.yml      # 应用配置
└── pom.xml                  # Maven配置
```

## 快速开始

### 1. 环境要求

- JDK 17+
- Maven 3.8+
- MySQL 8.0+
- Redis 6.0+

### 2. 数据库初始化

执行 `src/main/resources/sql/init.sql` 脚本：

```bash
mysql -u root -p < src/main/resources/sql/init.sql
```

默认账号密码：
- 用户名: admin
- 密码: admin123

### 3. 修改配置

编辑 `src/main/resources/application.yml`:

```yaml
# 数据库配置
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/piston_manufacture
    username: root
    password: your_password

# Redis配置
  data:
    redis:
      host: localhost
      port: 6379
      password: your_redis_password
```

### 4. 启动项目

```bash
mvn clean install
mvn spring-boot:run
```

或直接运行主类 `PistonManufactureApplication`

### 5. 访问接口文档

启动成功后访问：
- Swagger UI: http://localhost:8080/swagger-ui.html
- OpenAPI JSON: http://localhost:8080/api-docs

## API接口概览

### 认证接口
- `POST /api/auth/login` - 登录
- `POST /api/auth/register` - 注册

### 活塞产品分类接口
- `GET /api/piston-category/tree` - 获取分类树形结构
- `GET /api/piston-category/{id}` - 获取分类详情
- `POST /api/piston-category` - 新增分类
- `PUT /api/piston-category` - 更新分类
- `DELETE /api/piston-category/{id}` - 删除分类
- `PUT /api/piston-category/{id}/priority` - 调整优先级
- `PUT /api/piston-category/{id}/offline` - 分类下线

### 棒料原料仓储接口
- `GET /api/material-stock/page` - 分页查询原料
- `POST /api/material-stock/inbound` - 原料入库
- `POST /api/material-stock/{id}/outbound` - 原料出库
- `GET /api/material-stock/warning` - 库存预警列表
- `GET /api/material-stock/expiring` - 即将过期列表

### 生产工单接口
- `GET /api/production-order/page` - 分页查询工单
- `POST /api/production-order` - 创建工单
- `POST /api/production-order/{id}/start` - 开始工单
- `POST /api/production-order/process-complete` - 完成工序
- `POST /api/production-order/quality-check` - 质检入库
- `POST /api/production-order/{id}/pause` - 暂停工单
- `POST /api/production-order/{id}/resume` - 恢复工单
- `POST /api/production-order/{id}/cancel` - 取消工单

### 生产成本接口
- `GET /api/production-cost/page` - 分页查询成本记录
- `POST /api/production-cost` - 创建成本记录
- `GET /api/production-cost/monthly-report` - 生成月度报表

### 操作日志接口
- `GET /api/operation-log/page` - 分页查询日志

## 关键业务流程

### 工单生产流程
1. 机加工工艺员创建生产工单
2. 数控班组组长开始工单
3. 依次完成7道加工工序
4. 尺寸质检专员进行质检，登记合格/报废数量
5. 工单自动标记为已完成

### 成本核算流程
1. 工单完成后，录入各项成本（原料、刀具、能耗、人工、报废）
2. 系统自动计算总成本和单位成本
3. 按月份生成统计报表

## 定时任务说明

- **超时工单暂停**：每天凌晨2点自动检查，超出排产周期7天未完成的工单自动暂停

## 权限说明

| 角色 | 权限范围 |
|------|---------|
| 超级管理员 | 所有功能 |
| 原料采购员 | 原料入库、出库、库存查询 |
| 机加工工艺员 | 产品分类管理、工单创建、成本核算 |
| 数控班组组长 | 工单开始、工序完成、工单暂停/恢复 |
| 尺寸质检专员 | 质检入库、质量数据查询 |

## 开发规范

1. 遵循 RESTful API 设计规范
2. 使用 @Valid 进行参数校验
3. 统一异常处理，使用 BusinessException 抛出业务异常
4. 使用 @Log 注解记录关键操作日志
5. 实体类继承 BaseEntity，包含通用字段
6. Service 层进行业务逻辑处理，Controller 只做参数校验和响应封装
