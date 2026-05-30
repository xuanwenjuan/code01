# 非遗传统染料炼制供需管理系统

## 项目简介

基于 SpringBoot 3 + MyBatis-Plus + MySQL + Redis 构建的非遗传统染料全链路管理系统，涵盖原料采购、库存管理、生产炼制、成本核算、供需统计等核心业务流程。

## 技术架构

- **框架**: SpringBoot 3.2.x
- **ORM**: MyBatis-Plus 3.5.5
- **数据库**: MySQL 8.0
- **缓存**: Redis
- **权限**: JWT + 角色权限注解
- **日志**: AOP 操作日志记录
- **参数校验**: Jakarta Validation

## 核心功能

### 1. 染料类目管理
- ✅ 多级分类树（植物/矿物/动物/复合染料）
- ✅ 类目增删改查，支持下架状态过滤
- ✅ 高频接口 Redis 缓存优化
- ✅ 按类型、关键词搜索
- ✅ 父类目状态校验

### 2. 原料产地档案管理
- ✅ 产地档案 CRUD
- ✅ 采收时节 + 管控状态 多条件组合查询
- ✅ 库存预警（低于阈值自动告警）
- ✅ 库存锁定机制（创建工单自动锁定）
- ✅ 锁定库存扣减/解锁

### 3. 古法炼制生产工单管理
- ✅ 创建工单自动锁定原料库存
- ✅ 五工序流转（浸泡→熬煮→过滤→浓缩→分装）
- ✅ 各工序独立记录损耗
- ✅ 完成后自动归集总损耗
- ✅ 自动核算单位成本与总成本
- ✅ 工单状态自动流转（待生产→生产中→已完成）
- ✅ 超期工单自动冻结
- ✅ 取消工单自动解锁库存

### 4. 炼制供需台账管理
- ✅ 工单完成自动生成台账记录
- ✅ 按品类、产地、日期多维度统计
- ✅ 分工序损耗明细统计
- ✅ 成本与利润核算
- ✅ 损耗率自动计算

### 5. 系统基础功能
- ✅ 统一全局参数校验注解
- ✅ 规范 PO/DTO/VO 三层实体结构
- ✅ 多级权限控制（admin/master/purchaser/warehouse/operator）
- ✅ 核心业务事务控制（@Transactional）
- ✅ AOP 操作日志记录
- ✅ 统一全局异常处理器
- ✅ 标准接口返回结构

## 权限矩阵

| 功能 | admin | master | purchaser | warehouse | operator |
|------|-------|--------|-----------|-----------|----------|
| 类目管理 | ✅ | ❌ | ❌ | ❌ | ❌ |
| 产地维护 | ✅ | ❌ | ✅ | ✅ | ❌ |
| 创建工单 | ✅ | ✅ | ❌ | ✅ | ❌ |
| 工序操作 | ✅ | ✅ | ❌ | ❌ | ❌ |
| 取消工单 | ✅ | ❌ | ❌ | ❌ | ❌ |
| 台账查看 | ✅ | ✅ | ✅ | ✅ | ✅ |
| 统计报表 | ✅ | ❌ | ❌ | ❌ | ✅ |

## 项目结构

```
src/main/java/com/heritage/dye/
├── annotation/          # 自定义注解
│   ├── OperationLog.java    # 操作日志注解
│   └── RequireRole.java     # 权限注解
├── aop/                 # 切面
│   └── OperationLogAspect.java
├── common/              # 公共组件
│   ├── Result.java          # 统一返回结果
│   ├── ResultCode.java      # 返回码枚举
│   ├── BusinessException.java # 业务异常
│   └── GlobalExceptionHandler.java # 全局异常处理
├── config/              # 配置类
│   ├── MybatisPlusConfig.java
│   └── RedisConfig.java
├── context/             # 上下文
│   └── UserContext.java     # 用户上下文
├── controller/          # 控制器层
│   ├── DyeCategoryController.java
│   ├── MaterialOriginController.java
│   ├── ProductionOrderController.java
│   └── SupplyLedgerController.java
├── dto/                 # 数据传输对象
│   ├── DyeCategoryDTO.java
│   ├── MaterialOriginDTO.java
│   ├── ProductionOrderDTO.java
│   └── OrderStepDTO.java
├── entity/              # VO 视图对象
│   ├── DyeCategoryVO.java
│   ├── MaterialOriginVO.java
│   ├── ProductionOrderVO.java
│   └── SupplyLedgerVO.java
├── interceptor/         # 拦截器
│   └── JwtInterceptor.java
├── mapper/              # DAO 层
│   ├── DyeCategoryMapper.java
│   ├── MaterialOriginMapper.java
│   ├── ProductionOrderMapper.java
│   ├── OrderStepMapper.java
│   ├── SupplyLedgerMapper.java
│   ├── OperationLogMapper.java
│   └── UserMapper.java
├── po/                  # 持久化对象
│   ├── BasePO.java
│   ├── DyeCategoryPO.java
│   ├── MaterialOriginPO.java
│   ├── ProductionOrderPO.java
│   ├── OrderStepPO.java
│   ├── SupplyLedgerPO.java
│   ├── OperationLogPO.java
│   └── UserPO.java
├── service/             # 业务逻辑层
│   ├── DyeCategoryService.java
│   ├── MaterialOriginService.java
│   ├── ProductionOrderService.java
│   └── SupplyLedgerService.java
├── task/                # 定时任务
│   └── ProductionOrderTask.java
└── DyeApplication.java
```

## 快速开始

### 1. 环境准备

- JDK 17+
- Maven 3.6+
- MySQL 8.0+
- Redis 5.0+

### 2. 数据库初始化

```bash
mysql -u root -p < src/main/resources/schema.sql
```

### 3. 修改配置

修改 `application.yml` 中的数据库和 Redis 连接信息：

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/heritage_dye?useUnicode=true&characterEncoding=utf8&zeroDateTimeBehavior=convertToNull&useSSL=true&serverTimezone=GMT%2B8
    username: root
    password: your_password
  data:
    redis:
      host: localhost
      port: 6379
      database: 0
```

### 4. 启动项目

```bash
mvn clean install
mvn spring-boot:run
```

### 5. 测试账号

| 用户名 | 密码 | 角色 | 姓名 |
|--------|------|------|------|
| admin | 123456 | admin | 系统管理员 |
| master01 | 123456 | master | 张炼师 |
| purchaser01 | 123456 | purchaser | 李采购 |
| warehouse01 | 123456 | warehouse | 王库管 |
| operator01 | 123456 | operator | 赵运营 |

## 核心接口示例

### 原料产地多条件查询

```
GET /material-origin/page?status=1&harvestSeason=夏季
```

### 创建生产工单（自动锁定库存）

```
POST /production-order
Content-Type: application/json

{
  "dyeCategoryId": 5,
  "materialOriginId": 1,
  "materialQuantity": 100,
  "expectedOutputRate": 85,
  "warehouseManagerId": 4,
  "masterId": 2,
  "remark": "古法靛蓝炼制"
}
```

### 开始工序

```
POST /production-order/step/start
Content-Type: application/json

{
  "orderId": 1,
  "stepNo": 1
}
```

### 完成工序（记录损耗）

```
POST /production-order/step/complete
Content-Type: application/json

{
  "orderId": 1,
  "stepNo": 1,
  "stepLoss": 2.5,
  "remark": "浸泡完成，正常损耗"
}
```

### 供需统计

```
GET /supply-ledger/statistics?startDate=2024-01-01&endDate=2024-12-31
```

## 工单状态流转

```
待生产(1) → 生产中(2) → 已完成(3)
    ↓
超过7天自动冻结(9)
```

## 库存锁定机制

```
创建工单 → 锁定库存（current_stock → locked_stock）
完成工单 → 扣减锁定库存
取消工单 → 解锁库存（locked_stock → current_stock）
```

## 成本核算规则

```
总成本 = 原料成本(原料数量 * 原料单价) + 人工成本
单位成本 = 总成本 / 实际产出
损耗率 = 总损耗 / 原料数量
```

## 操作日志

所有写操作自动记录操作日志，包含：
- 操作人ID和用户名
- 模块名称和操作类型
- 请求参数
- 操作耗时
- 操作状态（成功/失败）
- 异常信息（失败时）

## Redis 缓存

缓存的高频接口：
- 染料类目树（1小时）
- 按类型的热门类目（1小时）
- 原料产地详情（1小时）

## 事务控制

核心业务 `@Transactional` 注解保证数据一致性：
- 创建工单（库存锁定 + 工单创建 + 工序创建）
- 完成工序（工序更新 + 损耗记录 + 工单状态更新）
- 取消工单（库存解锁 + 工单状态更新）
- 类目/产地的增删改操作

## 全局异常处理

统一捕获并处理：
- 参数校验异常（400）
- 业务异常（自定义 code）
- 权限不足异常（403）
- 资源不存在异常（404）
- 系统内部异常（500）

## 开发规范

1. **实体分层**：PO 对应数据库表，DTO 接收请求，VO 返回响应
2. **参数校验**：所有 DTO 字段添加 `@NotBlank`、`@NotNull`、`@Size` 等注解
3. **权限控制**：敏感接口添加 `@RequireRole` 注解
4. **操作日志**：写操作添加 `@OperationLog` 注解
5. **事务控制**：多表操作添加 `@Transactional` 注解
6. **统一返回**：所有接口返回 `Result<T>` 格式

## License

MIT License
