# 汽车减震弹簧热卷成型生产管控后端服务

## 项目简介
本项目是一个基于Spring Boot 3的汽车减震弹簧生产制造执行系统（MES），实现了弹簧产品类目管理、原料库存、生产工单流程、成本核算等核心功能。

## 技术栈
- **框架**: Spring Boot 3.2.0
- **ORM**: MyBatis-Plus 3.5.5
- **数据库**: MySQL 8.0
- **缓存**: Redis
- **认证**: JWT + Spring Security
- **权限控制**: 基于角色的细粒度权限控制
- **定时任务**: Spring Scheduled

## 核心功能模块

### 1. 权限管理模块
- **用户认证**: JWT令牌认证，支持登录/注册
- **角色权限**:
  - `ADMIN` - 系统管理员
  - `PURCHASER` - 原料采购员
  - `PROCESSOR` - 热处理工艺员
  - `LEADER` - 产线班组长
  - `QUALITY` - 品质质检员
- **权限注解**: `@RequiresRole` 实现细粒度权限控制

### 2. 弹簧产品类目模块
- **多级分类树**: 递归构建无限级分类树结构
- **分类管理**: 新增、编辑、删除、下线分类
- **下线拦截**: 已下线型号禁止下发工单
- **Redis缓存**: 分类树数据缓存，提高查询效率
- **支持类型**:
  - 轿车悬架弹簧
  - 货车载重弹簧
  - 摩托车减震弹簧
  - 工程机械异形弹簧

### 3. 弹簧钢丝原料模块
- **原料类型**: 碳素弹簧钢丝、合金弹簧钢丝、防锈镀层钢丝、热处理辅料
- **批次管理**: 自动生成唯一批次编码
- **库存预警**: 低于预警线自动标记预警状态
- **防潮提醒**: 高韧性钢丝自动添加防潮防护提醒
- **停止采购**: 支持标记原料停止采购

### 4. 热卷成型生产工单模块
- **全流程工序**:
  - 钢丝调直切断
  - 高温加热处理
  - 数控热卷成型
  - 端面磨平
  - 淬火回火定型
  - 压力探伤检测
- **工单状态流转**: 待排产 → 生产中 → 已完成入库
- **工序控制**: 上道工序未完成无法进入下道工序
- **超期暂停**: 每日凌晨2点自动暂停超期未排产工单
- **工单恢复**: 支持暂停后可恢复生产

### 5. 生产制造费用核算模块
- **成本构成**: 原料成本、能耗成本、工装模具损耗、人工工时成本、不良品报废损失
- **月度报表**: 每月1号凌晨3点自动生成上月成本报表
- **分类统计**: 按弹簧产品分类统计成本
- **单位成本**: 自动计算单位产品成本

### 6. 操作日志与定时任务
- **操作日志**: 记录所有关键操作
- **定时任务**:
  - 超期工单自动暂停 (每天2:00)
  - 月度成本报表自动生成 (每月1号3:00)

## 核心特性

### 下线型号工单下发拦截
创建工单时自动校验产品分类状态，已下线型号禁止下发工单，防止无效生产。

### 无限级树形递归查询
优化树形结构构建，支持任意层级分类，使用Map预加载优化递归性能。

### Redis缓存高频查询
- 分类树数据缓存1小时
- 预警原料列表缓存30分钟
- 分类状态缓存1小时

### 统一全局参数校验
使用Jakarta Validation实现全量参数校验，确保数据合法性。

### 细粒度角色权限体系
基于JWT和角色注解实现接口级权限控制，不同角色访问不同接口。

### 工单全流程状态自动流转
工序严格按顺序执行，上道工序完成才能开始下道工序，确保生产流程规范化。

## 项目结构

```
src/main/java/com/spring/manufacturing/
├── SpringManufacturingApplication.java    # 启动类
├── annotation/                          # 自定义注解
│   └── RequiresRole.java             # 角色权限注解
├── common/                              # 公共类
│   ├── Result.java                    # 统一响应结果
│   └── RoleConstants.java           # 角色常量
├── config/                              # 配置类
│   ├── MybatisPlusConfig.java        # MyBatis-Plus配置
│   ├── RedisConfig.java             # Redis配置
│   ├── SecurityConfig.java           # Spring Security配置
│   └── WebConfig.java               # Web配置
├── controller/                          # 控制器层
├── dto/                               # 数据传输对象
├── entity/                            # 实体类
├── exception/                         # 异常处理
│   ├── BusinessException.java        # 业务异常
│   └── GlobalExceptionHandler.java   # 全局异常处理器
├── interceptor/                       # 拦截器
│   └── RoleInterceptor.java         # 角色权限拦截器
├── mapper/                            # 数据访问层
├── service/                           # 业务逻辑层
│   └── impl/                      # 实现类
├── task/                              # 定时任务
│   └── ScheduledTasks.java        # 定时任务类
├── util/                              # 工具类
│   └── JwtUtil.java               # JWT工具类
└── vo/                                # 视图对象
    └── CategoryTreeVO.java           # 分类树VO
```

## 数据库设计

### 核心表
- `sys_user` - 用户表
- `spring_category` - 弹簧产品分类表
- `spring_material` - 弹簧原料表
- `production_work_order` - 生产工单表
- `work_order_process` - 工单工序表
- `production_cost` - 生产成本表
- `operation_log` - 操作日志表

## 快速开始

### 环境要求
- JDK 17+
- MySQL 8.0+
- Redis 6.0+
- Maven 3.6+

### 配置修改
1. 修改 `application.yml` 中的数据库连接配置
2. 修改 Redis 连接配置

### 数据库初始化
```sql
CREATE DATABASE spring_manufacturing DEFAULT CHARACTER SET utf8mb4;
-- 执行相关建表SQL
```

### 启动项目
```bash
mvn clean install
mvn spring-boot:run
```

### 默认账户
- 管理员: admin/123456

## API接口概览

### 认证接口
- `POST /api/auth/login` - 用户登录
- `POST /api/auth/register` - 用户注册

### 产品类目接口
- `GET /api/category/tree` - 获取分类树
- `POST /api/category` - 新增分类
- `PUT /api/category/offline/{id}` - 下线分类

### 原料管理接口
- `GET /api/material/page` - 原料分页查询
- `GET /api/material/warning` - 获取预警原料列表
- `POST /api/material` - 新增原料

### 工单管理接口
- `GET /api/work-order/page` - 工单分页查询
- `POST /api/work-order` - 创建工单
- `PUT /api/work-order/start-process` - 开始工序
- `PUT /api/work-order/complete-process` - 完成工序
- `PUT /api/work-order/pause/{id}` - 暂停工单
- `PUT /api/work-order/resume/{id}` - 恢复工单

### 成本核算接口
- `POST /api/cost/generate-report` - 生成月度成本报表
- `GET /api/cost/page` - 成本报表分页查询

## 注意事项
1. 确保MySQL和Redis服务正常运行
2. 首次启动前执行数据库初始化脚本
3. 生产环境请修改JWT密钥和数据库密码
4. 定时任务默认开启，可根据实际需求调整cron表达式
