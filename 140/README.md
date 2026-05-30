# 工业精密齿轮箱壳体加工管控后端服务

## 项目概述

本项目是一个完整的工业精密齿轮箱壳体加工生产管理系统，涵盖了从原料管理、生产工单、工序流转、质量检验到成本核算的全流程业务体系。

## 技术栈

- **后端框架**: Spring Boot 3.2.x
- **ORM框架**: MyBatis-Plus 3.5.x
- **数据库**: MySQL 8.0
- **缓存**: Redis
- **认证**: JWT
- **定时任务**: Spring Scheduling
- **接口规范**: RESTful API

## 业务模块总览

### 1. 用户权限模块
### 2. 齿轮箱壳体分类模块
### 3. 壳体原料仓储模块
### 4. 壳体加工生产工单模块
### 5. 生产工序管理模块
### 6. 质量检验模块
### 7. 加工成本核算模块
### 8. 操作日志模块

---

## 一、用户权限模块

### 角色定义

| 角色代码 | 角色名称 | 权限范围 |
|---------|---------|---------|
| ADMIN | 系统管理员 | 全部功能 |
| PURCHASER | 采购专员 | 原料管理、物料入库 |
| PROCESS_ENGINEER | 机加工工艺员 | 工单创建、工艺管理 |
| TEAM_LEADER | 产线组长 | 备料、领料、生产工序操作 |
| QUALITY_INSPECTOR | 精度质检员 | 质量检验、结果判定 |

### 接口

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /api/auth/login | 用户登录 |
| GET | /api/user/list-by-role/{role} | 按角色查询用户列表 |

---

## 二、齿轮箱壳体分类模块

### 功能特性

- 多级树形分类结构
- 分类类型：行星齿轮箱、圆柱齿轮箱、斜齿轮箱、定制精密壳体
- 老旧型号下线停产
- 订单排产优先级调整

### 接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/category/tree | 获取树形分类 |
| GET | /api/category/type/{categoryType} | 按类型查询分类 |
| POST | /api/category | 新增分类 |
| PUT | /api/category | 更新分类 |
| PUT | /api/category/offline/{id} | 下线分类 |
| PUT | /api/category/priority/{id} | 更新优先级 |

---

## 三、壳体原料仓储模块

### 功能特性

- **物料类型**：铸铁毛坯、铸钢坯料、铝合金壳体坯、加工切削辅料
- **库存管理**：库存充足 → 库存预警 → 停止采购，三级状态自动流转
- **批次管理**：批次编码生成、批次追溯、先进先出
- **易氧化原料防锈时效提醒**：自动计算有效期，即将过期/已过期状态提醒
- **领料流程**：工单物料领用、批次选择、库存自动扣减

### 核心接口

| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| GET | /api/material/page | 分页查询物料 | - |
| GET | /api/material/type/{materialType} | 按类型查询物料 | - |
| GET | /api/material/status/{status} | 按状态查询物料 | - |
| POST | /api/material | 新增物料 | 采购专员/管理员 |
| POST | /api/material/stock-in/{materialId} | 物料入库 | 采购专员/管理员 |
| POST | /api/material/pick | 工单物料领用 | 产线组长/管理员 |
| GET | /api/material/batch/{materialId} | 查询物料批次 | - |
| GET | /api/material/available-batches/{materialId} | 查询可用批次 | - |

---

## 四、壳体加工生产工单模块

### 工单状态流转

```
待投产(PENDING) → 备料中(PREPARING) → 已备料(READY) → 
粗铣成型(ROUGH_MILLING) → 精铣端面(FINE_MILLING) → 
孔系镗削(BORING) → 螺纹加工(THREADING) → 圆角打磨(GRINDING) → 
精度检测(INSPECTION) → 防锈处理(RUST_PROOF) → 成品入库(FINISHED)
```

### 5个标准工序

| 工序编码 | 工序名称 | 顺序 |
|---------|---------|-----|
| ROUGH_MILLING | 粗铣成型 | 1 |
| FINE_MILLING | 精铣端面 | 2 |
| BORING | 孔系镗削 | 3 |
| THREADING | 螺纹加工 | 4 |
| GRINDING | 圆角打磨 | 5 |

### 核心接口

| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| GET | /api/work-order/page | 分页查询工单 | - |
| GET | /api/work-order/status/{status} | 按状态查询工单 | - |
| GET | /api/work-order/{id} | 工单详情(含物料、工序、检验) | - |
| POST | /api/work-order | 创建工单(自动创建工序) | 工艺员/管理员 |
| PUT | /api/work-order/start-preparation/{id} | 开始备料 | 产线组长/管理员 |
| PUT | /api/work-order/complete-preparation/{id} | 完成备料 | 产线组长/管理员 |
| PUT | /api/work-order/start/{id} | 开始生产 | 产线组长/管理员 |

---

## 五、生产工序管理模块

### 功能特性

- 工序流转控制：必须按顺序完成前序工序
- 自动记录操作人、开始时间、结束时间
- 工时统计：自动计算/人工录入
- 机床工时记录
- 刀具损耗记录

### 核心接口

| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| GET | /api/work-process/list/{workOrderId} | 查询工单工序列表 | - |
| PUT | /api/work-process/start | 开始工序 | 产线组长/管理员 |
| PUT | /api/work-process/complete | 完成工序 | 产线组长/管理员 |

---

## 六、质量检验模块

### 功能特性

- 检验单创建（关联工单、工序）
- 检验数量、合格数量、报废数量、返工数量统计
- 报废原因记录
- 检验项明细记录
- 状态：待检验 → 合格/不合格/需返工
- 检验通过后自动推进工单状态到成品入库

### 核心接口

| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| GET | /api/quality-inspection/list/{workOrderId} | 查询工单检验记录 | - |
| POST | /api/quality-inspection | 创建检验记录 | 质检员/管理员 |
| PUT | /api/quality-inspection/confirm/{id} | 确认检验结果 | 质检员/管理员 |

---

## 七、加工成本核算模块

### 6项成本构成

| 成本项 | 说明 | 计算方式 |
|-------|------|---------|
| 原料成本 | 物料领用成本 | 物料单价 × 领用数量 |
| 刀具损耗成本 | 加工刀具消耗 | 工序刀具损耗记录 |
| 机床能耗成本 | 机床运行能耗 | 机床工时记录 |
| 人工工时成本 | 操作人员工时 | 工序工时 × 工时费率 |
| 报废成本 | 不良品损失 | 报废数量 × 单位成本 |
| 其他成本 | 杂项费用 | 人工录入 |

### 功能特性

- 自动计算：检验合格后自动触发成本核算
- 草稿 → 确认 状态流转
- 总成本自动汇总
- 单位成本自动计算
- 按日期范围查询统计

### 核心接口

| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| GET | /api/cost-accounting/page | 分页查询核算记录 | - |
| GET | /api/cost-accounting/list | 按日期范围查询 | - |
| POST | /api/cost-accounting | 创建核算记录 | 管理员 |
| POST | /api/cost-accounting/auto-calculate/{workOrderId} | 自动核算 | 管理员 |
| PUT | /api/cost-accounting/confirm/{id} | 确认核算 | 管理员 |

---

## 八、操作日志模块

### 日志记录内容

- 操作人ID、用户名
- 操作模块、操作类型
- 请求方法、请求参数
- 返回结果
- IP地址
- 耗时(ms)
- 操作状态(成功/失败)
- 错误信息
- 创建时间

### 定时任务

| 任务 | 执行时间 | 功能 |
|-----|---------|------|
| 超期工单检查 | 每天凌晨1点 | 超期未投产工单自动暂停 |
| 物料批次有效期检查 | 每天凌晨2点 | 检查并更新即将过期/已过期批次 |

---

## 全流程业务示意图

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  工艺员创建  │────▶│  产线组长   │────▶│  物料领用   │
│   工单      │     │   开始备料  │     │  完成备料  │
└─────────────┘     └─────────────┘     └─────────────┘
                                               │
                                               ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  成本核算   │◀────│  质检合格   │◀────│  5个工序   │
│  自动完成   │     │  成品入库   │     │  依次完成  │
└─────────────┘     └─────────────┘     └─────────────┘
```

---

## 性能优化

### 1. 分页查询
- 所有列表接口支持分页
- 默认每页10条记录

### 2. Redis缓存
- 物料类型列表缓存（30分钟）
- 工单状态列表缓存（30分钟）
- 成本核算统计缓存（30分钟）

### 3. 数据库索引优化
```sql
-- 物料表
INDEX idx_material_type (material_type)
INDEX idx_status (status)
INDEX idx_quantity (quantity)

-- 工单表
INDEX idx_order_no (order_no)
INDEX idx_status (status)
INDEX idx_category_id (category_id)
INDEX idx_plan_start_date (plan_start_date)

-- 操作日志
INDEX idx_user_id (user_id)
INDEX idx_create_time (create_time)
INDEX idx_module (module)
```

---

## 数据库初始化

执行 `src/main/resources/sql/init.sql` 初始化数据库，包含：
- 系统表创建
- 默认用户创建（密码：123456）
- 默认分类数据

---

## 配置说明

### application.yml 主要配置

```yaml
server:
  port: 8080
  servlet:
    context-path: /api

spring:
  datasource:
    url: jdbc:mysql://localhost:3306/gearbox_manage
    username: root
    password: root

  data:
    redis:
      host: localhost
      port: 6379
      database: 0

jwt:
  secret: gearbox-manage-secret-key-2024
  expiration: 86400000  # 24小时
```

---

## 启动说明

1. 确保 MySQL 8.0 和 Redis 服务已启动
2. 创建数据库 `gearbox_manage`
3. 执行初始化脚本 `src/main/resources/sql/init.sql`
4. 运行启动类 `GearboxManageApplication`
5. 访问地址：http://localhost:8080/api

---

## 项目结构

```
src/main/java/com/gearbox/manage/
├── annotation/          # 自定义注解
│   ├── Log.java        # 操作日志注解
│   └── RequiresRole.java # 角色权限注解
├── aspect/             # AOP切面
│   ├── LogAspect.java  # 日志切面
│   └── RoleAspect.java # 权限切面
├── common/             # 公共类
│   └── Result.java     # 统一响应结果
├── config/             # 配置类
│   ├── CacheConfig.java    # 缓存配置
│   ├── MyBatisPlusConfig.java
│   ├── MyMetaObjectHandler.java
│   ├── RedisConfig.java
│   └── WebMvcConfig.java
├── context/            # 上下文
│   └── UserContext.java
├── controller/         # 控制器 (8个)
├── dto/                # 请求DTO (5个)
├── entity/             # 实体类 (8个)
├── exception/          # 异常处理
├── interceptor/        # 拦截器
│   └── JwtInterceptor.java
├── mapper/             # Mapper接口 (8个)
├── service/            # 业务服务 (8个)
├── task/               # 定时任务
│   └── ScheduleTask.java
└── util/               # 工具类
    └── JwtUtil.java
```

---

## 开发规范

1. 接口遵循 RESTful 规范
2. 统一异常处理，统一响应格式
3. 使用注解进行参数校验
4. 使用 @Transactional 保证数据一致性
5. 使用 @RequiresRole 进行权限控制
6. 使用 @Log 记录操作日志
7. 使用 @Cacheable 优化查询性能
