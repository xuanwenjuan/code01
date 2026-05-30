# 风机叶轮压铸成型生产管控后端服务

## 技术栈

- Spring Boot 3.x
- MyBatis-Plus
- MySQL 8.x
- Redis
- JWT
- Spring Scheduling

## 项目结构

```
com.fan.impeller
├── annotation          # 自定义注解
├── aspect              # 切面（操作日志）
├── common              # 公共类
│   ├── Constants       # 常量定义
│   ├── PageQuery       # 分页查询参数
│   └── Result          # 统一返回结果
├── config              # 配置类
│   ├── MyBatisPlusConfig
│   ├── MyMetaObjectHandler
│   └── WebConfig
├── context             # 上下文
│   └── UserContext     # 用户上下文
├── controller          # 控制器层
├── dto                 # 数据传输对象
├── entity              # 实体类
├── exception           # 异常处理
│   ├── BusinessException
│   └── GlobalExceptionHandler
├── interceptor         # 拦截器
│   └── JwtInterceptor  # JWT认证拦截器
├── mapper              # 数据访问层
├── service             # 业务逻辑层
├── task                # 定时任务
│   └── ScheduledTasks
├── util                # 工具类
│   └── JwtUtil
└── vo                  # 视图对象
```

## 功能模块

### 1. 用户角色权限模块

- 用户登录/注册
- JWT token认证
- 支持多角色：admin（管理员）、purchase（采购）、process（工艺）、production（生产）、quality（质检）

### 2. 叶轮产品分类模块

- 多级分类树形结构
- 产品分类CRUD
- 旧款产品下线功能
- 订单优先级排序
- 支持无限级递归查询

### 3. 压铸合金原料模块

- 铝合金锭、锌合金原料、精炼助剂、脱模辅料统一登记
- 库存状态管理（充足、预警、停止采购）
- 自动生成唯一批次号
- 原料保质期管理
- 有效期自动检查

### 4. 压铸成型生产工单

- 全流程工序管理：
  1. 原料熔炼调配
  2. 模具合模压铸
  3. 水冷冷却定型
  4. 切边清理
  5. 动平衡校正
  6. 表面处理
  7. 成品入库
- 工单状态自动流转
- 超时未投产工单自动暂停
- 工单用料明细关联

### 5. 生产成本核算模块

- 统计合金原料消耗成本
- 模具损耗成本
- 熔炼能耗成本
- 人工工时成本
- 不良品报废成本
- 自动生成生产报表
- 支持工单用料明细与财务成本对账

### 6. 操作日志模块

- AOP切面自动记录操作日志
- 记录操作人、操作模块、操作类型、参数、结果、耗时、IP等
- 操作日志查询和管理

## API接口列表

### 认证接口
- POST `/api/auth/login` - 用户登录
- POST `/api/auth/register` - 用户注册

### 产品分类接口
- GET `/api/product-category/tree` - 分类树形结构
- GET `/api/product-category/list-by-priority` - 按优先级排序列表
- POST `/api/product-category` - 新增分类
- PUT `/api/product-category` - 更新分类
- PUT `/api/product-category/offline/{id}` - 分类下线
- DELETE `/api/product-category/{id}` - 删除分类

### 原料管理接口
- GET `/api/material/page` - 原料分页列表
- GET `/api/material/{id}` - 原料详情
- POST `/api/material` - 新增原料
- PUT `/api/material` - 更新原料
- DELETE `/api/material/{id}` - 删除原料

### 工单管理接口
- GET `/api/work-order/page` - 工单分页列表
- GET `/api/work-order/{id}` - 工单详情
- GET `/api/work-order/{id}/materials` - 工单用料明细
- POST `/api/work-order` - 创建工单
- PUT `/api/work-order/start/{id}` - 开始生产
- PUT `/api/work-order/next-step` - 进入下一工序
- DELETE `/api/work-order/{id}` - 删除工单

### 生产成本接口
- GET `/api/production-cost/page` - 成本报表分页列表
- GET `/api/production-cost/{id}` - 成本详情
- POST `/api/production-cost/generate/{workOrderId}` - 生成成本报表
- GET `/api/production-cost/material-details/{workOrderId}` - 用料明细
- DELETE `/api/production-cost/{id}` - 删除成本报表

### 操作日志接口
- GET `/api/operation-log/page` - 操作日志分页列表
- GET `/api/operation-log/{id}` - 日志详情
- DELETE `/api/operation-log/{id}` - 删除日志

## 数据库表说明

- `sys_user` - 用户表
- `product_category` - 产品分类表
- `material` - 原料表
- `work_order` - 工单表
- `work_order_material` - 工单原料关联表
- `production_cost` - 生产成本表
- `operation_log` - 操作日志表

## 配置说明

修改 `application.yml` 配置文件：

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/impeller_production?useUnicode=true&characterEncoding=utf-8&serverTimezone=Asia/Shanghai&useSSL=false
    username: root
    password: your_password
  data:
    redis:
      host: localhost
      port: 6379
      password: your_password
```

## 启动步骤

1. 创建MySQL数据库，执行 `resources/schema.sql` 初始化数据库
2. 配置Redis连接
3. 启动Spring Boot应用
4. 默认账号密码：
   - 用户名：admin/purchase/process/production/quality
   - 密码：123456

## 定时任务

| 执行时间 | 任务名称 | 说明 |
|----------|---------|------|
| 每天 01:00 | 超时工单自动暂停 | 创建后24小时未投产的工单自动暂停 |
| 每天 02:00 | 原料有效期检查 | 检查原料是否过期，自动更新库存状态 |
| 每天 03:00 | 自动创建采购订单 | 库存低于阈值时自动创建采购订单 |

## 部署说明

1. 配置MySQL数据库，执行 `resources/schema.sql` 初始化表结构和测试数据
2. 配置Redis服务，用于缓存和分布式锁
3. 修改 `application.yml` 中的数据库连接和Redis连接配置
4. 启动Spring Boot应用
5. 默认账号密码：
   - admin / 123456 (管理员)
   - purchase / 123456 (采购)
   - process / 123456 (工艺)
   - production / 123456 (生产)
   - quality / 123456 (质检)

## 核心特性总结

✅ **完整业务体系**：原料-采购-生产-质检-成本全流程闭环
✅ **角色权限管理**：5种角色精细化权限控制
✅ **全流程追溯**：库存流水、操作日志完整记录
✅ **状态自动流转**：工单状态、工序流转自动化
✅ **定时任务处理**：超时暂停、有效期检查、自动采购
✅ **性能优化**：Redis缓存、数据库索引、分页查询
✅ **统一异常处理**：全局异常捕获，友好错误提示
✅ **操作审计**：所有操作自动记录日志，可追溯
