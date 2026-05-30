# 高端手工香薰原液调配供货后端服务

## 项目简介

基于 Spring Boot 3 + MyBatis-Plus + MySQL + Redis + JWT 的高端手工香薰原液调配供货管理系统，支持多角色权限管理、业务状态自动流转、全链路操作留痕等功能。

## 技术栈

- **框架**: Spring Boot 3.2.x
- **ORM**: MyBatis-Plus 3.5.5
- **数据库**: MySQL 8.0
- **缓存**: Redis
- **认证**: JWT
- **定时任务**: Spring Scheduler
- **构建工具**: Maven

## 功能模块

### 1. 香薰香型类目管理
- 自然花果香、木质沉静香、草本疗愈香、复合定制香等多级分类
- 类目新增、编辑、删除
- 老旧香型停产下架
- 渠道供货排序
- 无限级树形递归查询

### 2. 天然萃取原料档案管理
- 原料产地、萃取工艺、纯度、保质期登记
- 库存预警阈值设置
- 原料唯一批次编码管理
- 过期自动停用
- 临期原料自动提醒（30天）
- 库存不足预警

### 3. 定制调配生产工单管理
- 客户香型定制需求录入
- 配方配比确定
- 原液调和过程管理
- 静置熟化计时
- 质检分装记录
- 批量供货出库
- **超时未确认配方自动暂停**（24小时）
- 工单状态自动流转

### 4. 调配供货成本台账管理
- 按香型品类统计原料消耗
- 按原料产地统计成本
- 调和损耗计算
- 人工调配费用核算
- 渠道供货利润分析
- 自动生成经营台账
- 配方明细与财务对账溯源

## 系统角色

| 角色 | 编码 | 权限说明 |
|------|------|----------|
| 管理员 | ADMIN | 所有权限 |
| 调香师 | PERFUMER | 配方确认、调和、熟化、质检 |
| 原料采购员 | BUYER | 原料管理、采购入库 |
| 仓储员 | WAREHOUSE | 库存管理、分装操作 |
| 渠道运营 | OPERATOR | 类目管理、工单创建、发货、成本台账 |

## 数据库表结构

- `sys_user` - 用户表
- `aroma_category` - 香薰香型类目表
- `raw_material` - 天然萃取原料档案表
- `production_work_order` - 定制调配生产工单表
- `work_order_formula` - 工单配方明细表
- `cost_ledger` - 调配供货成本台账表
- `operation_log` - 操作日志表（全链路留痕）

## 项目结构

```
src/main/java/com/aromatherapy/
├── AromaSupplyApplication.java    # 启动类
├── annotation/                     # 自定义注解
│   └── RequiresRole.java          # 角色权限注解
├── common/                         # 公共类
│   └── Result.java                # 统一响应结果
├── config/                         # 配置类
│   ├── MyMetaObjectHandler.java   # 自动填充处理器
│   ├── RedisConfig.java           # Redis配置
│   └── WebConfig.java             # Web配置
├── context/                        # 上下文
│   └── UserContext.java           # 用户上下文
├── controller/                     # 控制器层
│   ├── AuthController.java        # 认证接口
│   ├── AromaCategoryController.java
│   ├── RawMaterialController.java
│   ├── ProductionWorkOrderController.java
│   └── CostLedgerController.java
├── dto/                            # 数据传输对象
│   ├── LoginDTO.java
│   ├── WorkOrderCreateDTO.java
│   └── FormulaItemDTO.java
├── entity/                         # 实体类
│   ├── BaseEntity.java
│   ├── SysUser.java
│   ├── AromaCategory.java
│   ├── RawMaterial.java
│   ├── ProductionWorkOrder.java
│   ├── WorkOrderFormula.java
│   ├── CostLedger.java
│   └── OperationLog.java
├── enums/                          # 枚举类
│   ├── UserRoleEnum.java
│   └── WorkOrderStatusEnum.java
├── exception/                      # 异常处理
│   ├── BusinessException.java
│   └── GlobalExceptionHandler.java
├── interceptor/                    # 拦截器
│   └── JwtInterceptor.java        # JWT认证拦截器
├── mapper/                         # 数据访问层
│   ├── SysUserMapper.java
│   ├── AromaCategoryMapper.java
│   ├── RawMaterialMapper.java
│   ├── ProductionWorkOrderMapper.java
│   ├── WorkOrderFormulaMapper.java
│   ├── CostLedgerMapper.java
│   └── OperationLogMapper.java
├── service/                        # 业务逻辑层
│   ├── AuthService.java
│   ├── AromaCategoryService.java
│   ├── RawMaterialService.java
│   ├── ProductionWorkOrderService.java
│   └── CostLedgerService.java
├── task/                           # 定时任务
│   └── ScheduledTask.java          # 定时任务处理器
└── util/                           # 工具类
    └── JwtUtil.java               # JWT工具类
```

## 快速开始

### 1. 环境准备

- JDK 17+
- Maven 3.6+
- MySQL 8.0+
- Redis 5.0+

### 2. 数据库初始化

执行 `src/main/resources/sql/init.sql` 创建数据库和表，并初始化测试数据。

### 3. 配置修改

修改 `application.yml` 中的数据库和Redis连接配置：

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/aroma_supply?useUnicode=true&characterEncoding=utf8&serverTimezone=Asia/Shanghai
    username: root
    password: your_password

  data:
    redis:
      host: localhost
      port: 6379
      password: your_password
```

### 4. 启动项目

```bash
mvn clean install
mvn spring-boot:run
```

项目启动后访问：`http://localhost:8080`

### 5. 测试账号

| 用户名 | 密码 | 角色 |
|--------|------|------|
| admin | admin123 | 管理员 |
| perfumer1 | admin123 | 调香师 |
| buyer1 | admin123 | 原料采购员 |
| warehouse1 | admin123 | 仓储员 |
| operator1 | admin123 | 渠道运营 |

## API接口说明

### 认证接口

- `POST /api/auth/login` - 登录

### 香薰类目接口

- `GET /api/category/tree` - 获取树形分类
- `GET /api/category/supply-sorted` - 获取供货排序列表
- `POST /api/category` - 新增分类
- `PUT /api/category` - 编辑分类
- `DELETE /api/category/{id}` - 删除分类
- `PUT /api/category/{id}/status` - 更新状态（上架/下架）
- `PUT /api/category/{id}/supply-sort` - 更新供货排序

### 原料管理接口

- `GET /api/material` - 原料列表
- `GET /api/material/warning` - 库存预警列表
- `GET /api/material/expiring-soon` - 临期原料列表
- `POST /api/material` - 新增原料
- `PUT /api/material` - 编辑原料
- `PUT /api/material/{id}/stock` - 更新库存

### 工单管理接口

- `GET /api/work-order` - 工单列表
- `GET /api/work-order/{id}` - 工单详情
- `POST /api/work-order` - 创建工单
- `PUT /api/work-order/{id}/confirm-formula` - 确认配方
- `PUT /api/work-order/{id}/start-mixing` - 开始调和
- `PUT /api/work-order/{id}/finish-mixing` - 完成调和
- `PUT /api/work-order/{id}/finish-aging` - 完成熟化
- `PUT /api/work-order/{id}/quality-check` - 质检
- `PUT /api/work-order/{id}/package` - 分装
- `PUT /api/work-order/{id}/ship` - 发货
- `PUT /api/work-order/{id}/suspend` - 暂停工单
- `PUT /api/work-order/{id}/cancel` - 取消工单

### 成本台账接口

- `GET /api/ledger` - 台账列表
- `POST /api/ledger/generate/{workOrderId}` - 生成台账
- `PUT /api/ledger/{id}/settle` - 结算台账
- `GET /api/ledger/statistic` - 统计分析

## 工单状态流转

```
待确认配方(PENDING)
    ↓ (调香师确认配方)
配方已确认(FORMULA_CONFIRMED)
    ↓ (开始调和，扣减原料库存)
原液调和中(MIXING)
    ↓ (完成调和)
静置熟化中(AGING)
    ↓ (质检通过)
质检通过(QC_PASSED)
    ↓ (仓储员分装)
已分装(PACKAGED)
    ↓ (渠道运营发货)
已出库(SHIPPED)

* 质检不通过 → QC_FAILED
* 超时24小时未确认配方 → 自动SUSPENDED
* 管理员可随时SUSPEND或CANCEL
```

## 定时任务

| 任务 | Cron表达式 | 说明 |
|------|-----------|------|
| 超时工单自动暂停 | `0 0 */1 * * ?` | 每小时检查一次，24小时未确认配方自动暂停 |
| 原料状态检查 | `0 0 2 * * ?` | 每天凌晨2点检查原料过期状态 |
| 库存预警通知 | `0 0 9 * * ?` | 每天上午9点发送库存预警 |

## 开发规范

1. **接口风格**: 遵循 RESTful 规范
2. **参数校验**: 使用 `@Valid` + `jakarta.validation` 注解
3. **权限控制**: 使用 `@RequiresRole` 注解进行角色权限控制
4. **事务管理**: 使用 `@Transactional` 保证数据一致性
5. **异常处理**: 业务异常抛出 `BusinessException`，统一拦截处理
6. **实体分层**: Entity/DTO 严格区分，禁止实体类直接返回前端
