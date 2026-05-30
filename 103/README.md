# 高山野生菌菇采收溯源管控后端服务

## 项目简介

本项目是一个基于SpringBoot3的高山野生菌菇采收溯源管理系统，实现从山林产区管理、采收任务派发、现场采收、品质检测、仓储入库到冷链发货的全流程管控，支持多角色权限管理和全链路操作留痕。

## 技术栈

- **框架**: SpringBoot 3.2.x
- **ORM**: MyBatis-Plus 3.5.5
- **数据库**: MySQL 8.0
- **缓存**: Redis
- **认证**: JWT
- **定时任务**: Spring Scheduler
- **参数校验**: Jakarta Validation

## 功能模块

### 1. 菌菇品类类目模块
- 多级分类管理（鲜品、干制、药用、预制食材）
- 无限级树形递归查询
- 野生品类禁采下架管理
- 产地展示排序
- 类目CRUD操作

### 2. 山林产区档案模块
- 产区唯一编码管理
- 海拔、气候环境、盛产品类、采收周期登记
- 正常/封禁状态管控
- 雨季封禁预警机制
- 产区CRUD操作

### 3. 野外采收任务模块
- 片区采收任务派发
- 进山采集分拣管理
- 现场品质初检
- 集中入库定级
- 冷链分拣发货
- 任务状态自动流转（待派发→已派发→采集中→质检中→已入库→已发货）
- 超时未完成任务自动失效
- 采收明细记录

### 4. 产销收支统计模块
- 按菌菇品类统计采收总量
- 按山林片区统计分拣损耗
- 冷链物流成本核算
- 线下批发营收统计
- 净利润自动计算
- 多维度数据查询（日期范围、品类、产区）

### 5. 系统管理模块
- JWT身份认证
- 多角色权限控制（采收员、质检、仓储、运营、管理员）
- 全链路操作日志留痕
- 全局统一参数校验
- 统一异常处理

## 项目结构

```
src/main/java/com/mushroom/traceability/
├── MushroomTraceabilityApplication.java  # 启动类
├── common/                                # 公共类
│   ├── Result.java                        # 统一响应结果
│   └── Constants.java                     # 常量定义
├── config/                                # 配置类
│   ├── MyMetaObjectHandler.java           # MyBatis-Plus自动填充
│   └── WebConfig.java                     # Web配置
├── controller/                            # 控制器层
│   ├── AuthController.java                # 认证接口
│   ├── MushroomCategoryController.java    # 品类类目接口
│   ├── ProductionAreaController.java      # 产区管理接口
│   ├── HarvestTaskController.java         # 采收任务接口
│   └── SalesStatisticsController.java     # 产销统计接口
├── dto/                                   # 数据传输对象
│   └── LoginDTO.java                      # 登录DTO
├── entity/                                # 实体类
│   ├── BaseEntity.java                    # 基础实体
│   ├── SysUser.java                       # 用户实体
│   ├── MushroomCategory.java              # 品类实体
│   ├── ProductionArea.java                # 产区实体
│   ├── HarvestTask.java                   # 采收任务实体
│   ├── HarvestDetail.java                 # 采收明细实体
│   ├── OperationLog.java                  # 操作日志实体
│   └── SalesStatistics.java               # 产销统计实体
├── exception/                             # 异常处理
│   ├── BusinessException.java             # 业务异常
│   └── GlobalExceptionHandler.java        # 全局异常处理器
├── interceptor/                           # 拦截器
│   └── JwtInterceptor.java                # JWT认证拦截器
├── mapper/                                # 数据访问层
│   ├── SysUserMapper.java
│   ├── MushroomCategoryMapper.java
│   ├── ProductionAreaMapper.java
│   ├── HarvestTaskMapper.java
│   ├── HarvestDetailMapper.java
│   ├── OperationLogMapper.java
│   └── SalesStatisticsMapper.java
├── service/                               # 业务逻辑层
│   ├── AuthService.java
│   ├── MushroomCategoryService.java
│   ├── ProductionAreaService.java
│   ├── HarvestTaskService.java
│   ├── HarvestDetailService.java
│   ├── OperationLogService.java
│   └── SalesStatisticsService.java
├── task/                                  # 定时任务
│   └── HarvestTaskScheduler.java          # 采收任务定时处理
└── util/                                  # 工具类
    ├── JwtUtil.java                       # JWT工具
    └── UserContext.java                   # 用户上下文
```

## 快速开始

### 1. 数据库初始化
执行 `src/main/resources/sql/init.sql` 初始化数据库表结构和初始数据。

### 2. 配置修改
修改 `src/main/resources/application.yml` 中的数据库和Redis连接配置：
```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/mushroom_traceability
    username: root
    password: your_password
  data:
    redis:
      host: localhost
      port: 6379
      password: your_password
```

### 3. 启动项目
运行主类 `MushroomTraceabilityApplication` 启动项目。

### 4. 初始账号
系统预置测试账号：
- 管理员: admin/123456
- 采收员: harvester1/123456
- 质检: quality1/123456
- 仓储: warehouse1/123456
- 运营: operator1/123456

## API接口列表

### 认证接口
- `POST /api/auth/login` - 用户登录
- `POST /api/auth/register` - 用户注册

### 菌菇品类接口
- `GET /api/categories/tree` - 树形分类列表
- `GET /api/categories/tree/type/{type}` - 按类型查询树形分类
- `GET /api/categories/{id}` - 获取分类详情
- `POST /api/categories` - 新增分类
- `PUT /api/categories` - 更新分类
- `DELETE /api/categories/{id}` - 删除分类
- `PUT /api/categories/{id}/forbidden` - 切换禁采状态
- `PUT /api/categories/{id}/status` - 切换上架下架状态

### 山林产区接口
- `GET /api/areas` - 产区列表
- `GET /api/areas/status/{status}` - 按状态查询产区
- `GET /api/areas/{id}` - 获取产区详情
- `POST /api/areas` - 新增产区
- `PUT /api/areas` - 更新产区
- `DELETE /api/areas/{id}` - 删除产区
- `PUT /api/areas/{id}/status` - 切换封禁状态
- `PUT /api/areas/{id}/rainy-season` - 设置雨季预警

### 采收任务接口
- `GET /api/tasks` - 任务列表
- `GET /api/tasks/status/{status}` - 按状态查询任务
- `GET /api/tasks/{id}` - 获取任务详情
- `GET /api/tasks/{id}/details` - 获取任务明细
- `POST /api/tasks` - 创建任务
- `PUT /api/tasks/{id}/assign` - 派发任务
- `PUT /api/tasks/{id}/start` - 开始采收
- `PUT /api/tasks/{id}/submit-quality` - 提交质检
- `PUT /api/tasks/{id}/quality` - 质检处理
- `PUT /api/tasks/{id}/ship` - 发货
- `PUT /api/tasks/{id}/cancel` - 取消任务
- `POST /api/tasks/details` - 添加采收明细

### 产销统计接口
- `GET /api/statistics` - 统计列表（支持日期范围）
- `GET /api/statistics/category/{categoryId}` - 按品类统计
- `GET /api/statistics/area/{areaId}` - 按产区统计
- `GET /api/statistics/{id}` - 获取统计详情
- `POST /api/statistics` - 新增统计记录
- `PUT /api/statistics` - 更新统计记录
- `DELETE /api/statistics/{id}` - 删除统计记录

## 任务状态说明

| 状态码 | 状态名称 | 说明 |
|--------|----------|------|
| PENDING | 待派发 | 任务已创建，等待派发给采收员 |
| ASSIGNED | 已派发 | 任务已派发给采收员 |
| COLLECTING | 采集中 | 采收员正在进行采收作业 |
| QUALITY_CHECK | 质检中 | 采收完成，等待品质检测 |
| WAREHOUSE | 已入库 | 质检通过，已入仓库 |
| SHIPPED | 已发货 | 已完成冷链发货 |
| EXPIRED | 已失效 | 任务超时未完成自动失效 |
| CANCELLED | 已取消 | 任务被人工取消 |

## 品质等级说明

| 等级 | 说明 |
|------|------|
| A | 特级 |
| B | 一级 |
| C | 二级 |
| D | 不合格 |

## 定时任务

系统内置定时任务：
- **超时任务自动失效**: 每30分钟执行一次，自动将超时未完成的任务标记为已失效

## 开发规范

1. 遵循Restful接口设计规范
2. 所有实体类字段严格使用校验注解
3. 业务异常统一抛出 `BusinessException`
4. 所有操作需记录操作日志
5. 使用事务保证数据一致性
6. 多角色权限通过拦截器和业务逻辑控制