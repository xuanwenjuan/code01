# 工业民用消防器材生产管控后端服务

## 项目简介

本项目是一个基于SpringBoot3的工业民用消防器材生产管控系统，提供完整的消防器材生产全流程管理功能。

## 技术栈

- **后端框架**: Spring Boot 3.2.0
- **持久层**: MyBatis-Plus 3.5.5
- **数据库**: MySQL 8.0+
- **缓存**: Redis
- **认证**: JWT
- **定时任务**: Spring Scheduler
- **API文档**: Knife4j 4.4.0
- **工具库**: Hutool 5.8.25
- **Excel导出**: EasyExcel 3.3.2

## 核心功能模块

### 1. 消防产品分类模块
- 灭火器材、应急逃生器材、消防报警设备、防火防护器材多级树形分类
- 支持新增产品型号、淘汰旧款器材停止排产
- 应急订单生产优先级调整
- 无限级父子级树形递归查询

### 2. 消防主材仓储模块
- 登记干粉原料、合金罐体、耐压阀门、阻燃面料、密封防护辅料
- 划分正常可用库存、库存紧急预警、长期停止采购三类状态
- 自动生成物料唯一质检批次码
- 承压金属原料设置耐压时效复检提醒

### 3. 消防组装生产工单
- 罐体冲压成型、耐压密封处理、灭火剂灌装、阀门组装调试、防火性能检测、压力试压核验、防伪贴标、成品入库全流程
- 超出规定周期未投产工单系统自动暂停
- 工单全流程状态自动流转

### 4. 安全生产成本模块
- 统计主材原料消耗、生产设备损耗、厂区水电能耗、一线组装人工工时、试压不合格报废成本
- 定期自动生成生产经营报表
- 支持工单用料明细导出
- 对接企业财务完成精准成本核对

## 岗位权限划分

| 角色编码 | 角色名称 | 职责 |
|---------|---------|------|
| ADMIN | 系统管理员 | 系统全局管理 |
| PURCHASE | 物资采购 | 主材采购、库存管理 |
| PROCESS | 工艺编制 | 产品工艺、工单创建 |
| PRODUCTION | 生产主管 | 工单排产、生产管理 |
| QUALITY | 安全质检 | 质量检验、复检管理 |

## 快速开始

### 环境要求

- JDK 17+
- MySQL 8.0+
- Redis 6.0+
- Maven 3.8+

### 数据库初始化

1. 创建数据库
```sql
CREATE DATABASE fire_equipment_db DEFAULT CHARACTER SET utf8mb4;
```

2. 执行初始化脚本
```bash
mysql -uroot -p fire_equipment_db < src/main/resources/sql/init.sql
```

### 配置修改

修改 `src/main/resources/application.yml` 中的数据库和Redis配置：

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/fire_equipment_db?useUnicode=true&characterEncoding=utf8&useSSL=false&serverTimezone=Asia/Shanghai
    username: root
    password: your_password
  data:
    redis:
      host: localhost
      port: 6379
      password: your_password
```

### 启动项目

```bash
mvn clean package
java -jar target/fire-equipment-management-1.0.0.jar
```

或者直接运行主类：
```bash
mvn spring-boot:run
```

### 访问地址

- 项目地址: http://localhost:8080/api
- API文档: http://localhost:8080/api/doc.html

### 默认账号

| 用户名 | 密码 | 角色 |
|--------|------|------|
| admin | 123456 | 系统管理员 |
| purchase | 123456 | 物资采购 |
| process | 123456 | 工艺编制 |
| production | 123456 | 生产主管 |
| quality | 123456 | 安全质检 |

## 项目结构

```
src/main/java/com/firecontrol/
├── FireEquipmentApplication.java    # 启动类
├── annotation/                      # 自定义注解
│   └── OperationLog.java           # 操作日志注解
├── aspect/                          # AOP切面
│   └── OperationLogAspect.java     # 操作日志切面
├── common/                          # 通用模块
│   ├── constant/                    # 常量
│   ├── PageQuery.java              # 分页查询
│   ├── Result.java                 # 统一返回结果
│   └── ResultCode.java             # 返回状态码
├── config/                          # 配置类
│   ├── MybatisPlusConfig.java      # MyBatis-Plus配置
│   ├── RedisConfig.java            # Redis配置
│   ├── WebConfig.java              # Web配置
│   └── MetaFieldConfig.java        # 自动填充配置
├── controller/                      # 控制器
│   ├── AuthController.java         # 认证接口
│   ├── ProductCategoryController.java # 产品分类接口
│   ├── MaterialController.java     # 主材仓储接口
│   ├── WorkOrderController.java    # 生产工单接口
│   └── ProductionCostController.java # 生产成本接口
├── dto/                             # 数据传输对象
├── entity/                          # 实体类
├── exception/                       # 异常处理
│   ├── BusinessException.java      # 业务异常
│   └── GlobalExceptionHandler.java # 全局异常处理
├── interceptor/                     # 拦截器
│   └── JwtAuthenticationInterceptor.java # JWT认证拦截器
├── mapper/                          # 数据访问层
├── service/                         # 业务逻辑层
│   └── impl/                        # 业务实现
├── task/                            # 定时任务
│   └── WorkOrderScheduleTask.java  # 工单定时任务
├── utils/                           # 工具类
│   ├── JwtUtil.java                # JWT工具
│   └── UserContextUtil.java        # 用户上下文
└── vo/                              # 视图对象
```

## API接口说明

### 认证接口
- `POST /api/auth/login` - 用户登录
- `POST /api/auth/logout` - 用户登出

### 产品分类接口
- `GET /api/product/category/tree` - 获取分类树形结构
- `POST /api/product/category` - 新增分类
- `PUT /api/product/category` - 修改分类
- `DELETE /api/product/category/{id}` - 删除分类
- `PUT /api/product/category/{id}/priority/{priority}` - 调整优先级
- `PUT /api/product/category/{id}/status/{status}` - 更新状态

### 主材仓储接口
- `POST /api/material/page` - 分页查询物资
- `POST /api/material` - 新增物资
- `POST /api/material/stock-in` - 物资入库
- `GET /api/material/warning` - 获取库存预警列表
- `GET /api/material/recheck-soon` - 获取即将复检列表
- `PUT /api/material/batch/{batchId}/recheck/{status}` - 更新复检状态

### 生产工单接口
- `POST /api/work-order` - 创建工单
- `POST /api/work-order/page` - 分页查询工单
- `POST /api/work-order/process/start` - 开始工序
- `POST /api/work-order/process/complete` - 完成工序
- `PUT /api/work-order/{id}/pause` - 暂停工单
- `PUT /api/work-order/{id}/resume` - 恢复工单
- `GET /api/work-order/{workOrderId}/processes` - 获取工单工序列表
- `GET /api/work-order/{workOrderId}/materials` - 获取工单物料列表

### 生产成本接口
- `POST /api/production-cost/calculate/{workOrderId}` - 核算工单成本
- `GET /api/production-cost/statistics` - 获取成本统计
- `GET /api/production-cost/export/material/{workOrderId}` - 导出工单用料明细

## 业务流程说明

### 工单生产流程
1. 工艺编制人员创建工单，指定产品、数量、计划时间
2. 系统自动初始化8道生产工序
3. 生产主管开始第一道工序，系统自动冻结所需物料
4. 每道工序完成后，自动流转到下一道工序
5. 所有工序完成后，工单状态变为已完成，自动扣减库存
6. 财务人员核算工单成本，生成成本记录

### 定时任务
- 每天凌晨2点自动检查超时未投产工单，自动暂停

## 操作日志

系统自动记录所有关键操作，包括：
- 操作人、操作时间、IP地址
- 请求参数、返回结果
- 操作耗时、操作状态

## 许可证

MIT License
