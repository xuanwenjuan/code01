# 古法制香祭祀灵香原料配伍管控后端服务 - 项目总结

## 项目架构规范

### PO、DTO、VO三层实体规范化架构
- **PO (Persistent Object)**: 数据库持久化对象，位于 `entity/` 包下
  - `Material`, `ProductionOrder`, `ProductionCost`, `MaterialStockLock`, `ProductionLoss` 等

- **DTO (Data Transfer Object)**: 数据传输对象，位于 `dto/` 包下
  - `MaterialQueryDTO`: 原料多条件查询DTO
  - `OrderFormulaConfirmDTO`: 工单配方确认DTO
  - `ProductionLossDTO`: 生产损耗记录DTO
  - `MaterialUsageDTO`, `MaterialLedgerDTO`, `StockChangeDTO` 等

- **VO (View Object)**: 视图展示对象，位于 `vo/` 包下
  - `MaterialVO`: 原料展示VO（包含可用/锁定库存）
  - `ProductionOrderVO`: 工单详情VO
  - `ProductionCostVO`: 成本核算VO
  - `OrderProcessLogVO`, `ProductionLossVO` 等

## 已完成的核心功能

### 1. 下架香品配方创建拦截
- **位置**: `ProductionOrderService.createOrder()`
- **功能**: 创建工单时自动调用 `categoryService.checkCategoryActive(dto.getCategoryId())`
- **校验**: 检查品类状态是否为已上架(status=1)，已下架品类禁止创建工单

### 2. 无限级树形递归查询优化 + Redis缓存
- **位置**: `CategoryService.getTree()`, `CategoryService.getActiveTree()`
- **优化**: 
  - 使用 `parentId -> children` 分组构建，提升性能
  - Redis缓存热门香品分类树数据，减少数据库查询
  - 支持 `getTree()` 获取全部分类树，`getActiveTree()` 仅获取上架分类树

### 3. 香材研磨细度 + 库存状态多条件组合分页查询
- **位置**: `MaterialService.queryMaterialPage()`
- **功能**: 支持多维度组合查询
  - 原料类型、库存状态、关键词模糊搜索
  - 研磨细度筛选、产地筛选
  - 分页查询、排序

### 4. 制香工单配伍方案确认后自动锁定原料库存占用
- **位置**: `ProductionOrderService.confirmFormula()`, `MaterialStockLockService`
- **核心逻辑**:
  - 工单配方确认时，锁定指定数量的原料库存
  - 支持批量锁定多种原料
  - 库存锁定后，计算可用库存时自动扣除已锁定数量
  - 工单完成后自动确认使用并扣减锁定库存
  - 工单取消/解冻时自动释放锁定库存

### 5. 成品完工入库后生产损耗汇总与成本核算
- **位置**: `ProductionCostService.calculateAndSaveCost()`
- **功能**:
  - 自动汇总工单原料使用成本
  - 自动汇总各类生产损耗
  - 支持加工费用计算
  - 计算总成本与单位成本
  - 成本明细持久化存储

### 6. AOP切面统一操作日志记录
- **位置**: `OperationLogAspect`, `@OperationLog` 注解
- **功能**:
  - 基于注解的方法级日志拦截
  - 自动记录操作人、操作时间、IP地址
  - 自动记录请求参数与响应结果
  - 记录操作耗时
  - 异常时记录错误信息
  - 异步写入数据库，不影响主业务

### 7. 多级职能权限精细化管控
- **权限角色细分**:
  - `ADMIN` - 平台总管：全部权限
  - `MASTER` - 配料师傅：工单操作、配方确认、损耗记录权限
  - `BUYER` - 原料采办：原料管理、入库权限
  - `KEEPER` - 库房管护：台账管理、库存变更权限

- **权限校验实现**: `JwtInterceptor`
  - JWT Token解析获取用户信息
  - ThreadLocal存储用户上下文
  - `@RequiresRole` 注解方法级别权限校验
  - 统一异常返回错误信息

### 8. 核心业务数据库事务管控
- **注解**: `@Transactional(rollbackFor = Exception.class)`
- **覆盖范围**: 所有核心业务操作
  - 原料入库/出库/库存变更
  - 工单创建/状态流转/配方确认
  - 库存锁定/释放/确认使用
  - 生产损耗记录
  - 成本核算
  - 台账记录生成

### 9. 全域统一参数校验注解规范
- **位置**: 所有DTO类
- **使用注解**:
  - `@NotBlank(message = "xxx不能为空")` - 字符串非空校验
  - `@NotNull(message = "xxx不能为空")` - 对象非空校验
  - `@Size(max = 100, message = "xxx长度不能超过100")` - 长度校验
  - `@Min`, `@Max` - 数值范围校验
  - 全局异常处理器统一处理校验失败，返回400错误

### 10. 统一全局异常处理与标准接口返回
- **位置**: `GlobalExceptionHandler`, `Result<T>`
- **功能**:
  - 业务异常 (`BusinessException`) 捕获处理
  - 参数校验异常统一处理
  - 系统异常捕获与日志记录
  - 统一返回格式: `{ code: 200, message: "成功", data: {...} }`

## 项目技术栈
- **框架**: Spring Boot 3.x
- **ORM**: MyBatis-Plus
- **数据库**: MySQL
- **缓存**: Redis
- **认证**: JWT
- **定时任务**: Spring Scheduled
- **参数校验**: Jakarta Validation

## 主要API端点

### 认证模块
- `POST /auth/login` - 用户登录
- `POST /auth/register` - 用户注册

### 品类管理
- `GET /category/tree` - 获取全部分类树
- `GET /category/active-tree` - 获取上架分类树
- `GET /category/list/{parentId}` - 按父ID获取子分类
- `GET /category/{id}` - 获取分类详情
- `POST /category` - 新增分类 (ADMIN)
- `PUT /category` - 编辑分类 (ADMIN)
- `DELETE /category/{id}` - 删除分类 (ADMIN)

### 原料管理
- `GET /material/page` - 原料分页列表
- `GET /material/warning` - 库存预警列表
- `GET /material/stats` - 原料状态统计
- `GET /material/list` - 按类型获取可用原料
- `GET /material/{id}` - 获取原料详情
- `POST /material` - 新增原料 (ADMIN, BUYER)
- `PUT /material` - 编辑原料 (ADMIN, BUYER)
- `DELETE /material/{id}` - 删除原料 (ADMIN)
- `PUT /material/{id}/stock` - 更新原料库存 (ADMIN, KEEPER)
- `POST /material/batch-stock` - 批量更新库存 (ADMIN, KEEPER)

### 工单管理
- `GET /order/page` - 工单分页列表
- `GET /order/stats` - 工单状态统计
- `GET /order/{id}` - 获取工单详情
- `GET /order/{id}/logs` - 获取工单流程日志
- `GET /order/{id}/materials` - 获取工单原料使用明细
- `POST /order` - 创建工单 (ADMIN, MASTER)
- `PUT /order/{id}/start-mixing` - 开始拌料 (ADMIN, MASTER)
- `PUT /order/{id}/start-kneading` - 开始揉泥挤香 (ADMIN, MASTER)
- `PUT /order/{id}/start-drying` - 开始晾晒阴干 (ADMIN, MASTER)
- `PUT /order/{id}/start-cutting` - 开始裁切规整 (ADMIN, MASTER)
- `PUT /order/{id}/finish-packaging` - 完成封装入库 (ADMIN, MASTER)
- `PUT /order/{id}/freeze` - 冻结工单 (ADMIN)
- `PUT /order/{id}/unfreeze` - 解冻工单 (ADMIN)
- `PUT /order/{id}/cancel` - 取消工单 (ADMIN)

### 台账管理
- `GET /ledger/page` - 台账分页列表
- `GET /ledger/stats` - 台账统计
- `GET /ledger/{id}` - 获取台账详情
- `POST /ledger` - 新增台账 (ADMIN, KEEPER)
- `GET /ledger/report/page` - 报表分页列表
- `GET /ledger/report/all` - 获取全部报表
- `POST /ledger/report/generate` - 生成季度报表 (ADMIN)

## 定时任务
- `ScheduledTasks.freezeOverdueOrders()` - 每日凌晨2点自动冻结超过24小时未启动的工单

## 核心业务流程

1. **制香工单流程**:
   ```
   创建工单(PENDING) → 开始拌料(MIXING) → 揉泥挤香(KNEADING) → 晾晒阴干(DRYING) → 裁切规整(CUTTING) → 封装入库(PACKAGED)
   ```

2. **原料出库流程**:
   ```
   工单完成时提交原料使用明细 → 自动扣减原料库存 → 生成台账记录
   ```

3. **权限控制流程**:
   ```
   请求到达 → JWT拦截器解析Token → 获取用户角色 → 校验@RequiresRole权限 → 执行业务逻辑
   ```

## 数据一致性保障
- 数据库事务管理 (Transactional)
- 操作前后库存状态校验
- 多表联动更新时的一致性保障
- 操作日志完整记录
