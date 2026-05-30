# 电机铁芯硅钢片裁切冲压生产管理后端服务

## 技术栈
- Spring Boot 3.x
- MyBatis-Plus
- MySQL
- Redis
- JWT
- 定时任务

## 项目结构
```
com.motor.core
├── annotation          # 自定义注解
│   ├── OperationLog.java
│   └── RequiresRole.java
├── aspect              # AOP切面
│   └── OperationLogAspect.java
├── common              # 通用类
│   └── Result.java
├── config              # 配置类
│   ├── JwtConfig.java
│   ├── MybatisPlusConfig.java
│   ├── RedisConfig.java
│   └── WebConfig.java
├── controller          # 控制器
│   ├── AuthController.java
│   ├── CoreCategoryController.java
│   ├── MaterialController.java
│   ├── OperationLogController.java
│   ├── ProductionCostController.java
│   └── ProductionOrderController.java
├── dto                 # 数据传输对象
│   ├── LoginDTO.java
│   ├── MaterialDTO.java
│   ├── ProductionCostDTO.java
│   └── ProductionOrderDTO.java
├── entity              # 实体类
│   ├── BaseEntity.java
│   ├── CoreCategory.java
│   ├── Material.java
│   ├── OperationLog.java
│   ├── OrderMaterialDetail.java
│   ├── OrderProcess.java
│   ├── ProductionCost.java
│   ├── ProductionOrder.java
│   └── SysUser.java
├── exception           # 异常处理
│   ├── BusinessException.java
│   └── GlobalExceptionHandler.java
├── interceptor         # 拦截器
│   ├── JwtInterceptor.java
│   └── RoleInterceptor.java
├── mapper              # 数据访问层
│   ├── CoreCategoryMapper.java
│   ├── MaterialMapper.java
│   ├── OperationLogMapper.java
│   ├── OrderMaterialDetailMapper.java
│   ├── OrderProcessMapper.java
│   ├── ProductionCostMapper.java
│   ├── ProductionOrderMapper.java
│   └── SysUserMapper.java
├── service             # 业务逻辑层
│   ├── CoreCategoryService.java
│   ├── MaterialService.java
│   ├── OperationLogService.java
│   ├── ProductionCostService.java
│   └── ProductionOrderService.java
├── task                # 定时任务
│   └── ProductionTask.java
└── util                # 工具类
    └── JwtUtil.java
```

## 功能模块

### 1. 铁芯产品类目模块
- **多级分类树查询**：优化无限级树形递归查询，使用HashMap构建父子关系映射，提升查询效率
- **Redis缓存**：分类树数据缓存，提升访问性能，数据变更自动清除缓存
- **类目CRUD**：新增、编辑、删除分类
- **老旧型号下架**：支持类目状态管理，下架型号自动拦截工单单下达
- **订单优先级排序**：支持按优先级排序
- **无限级树形递归查询**：支持多级分类查询

### 2. 硅钢片物料库存模块
- **物料登记**：支持无取向硅钢卷、取向硅钢卷、绝缘涂层辅料等类型
- **批次编码管理**：自动生成唯一批次编码
- **库存状态管理**：自动判断库存充足/预警状态
- **防潮防锈物料存放周期预警**：根据生产日期和保质期自动预警
- **库存分页查询**：支持按物料类型、库存状态筛选
- **库存调整**：支持入库、出库操作，自动更新库存状态

### 3. 裁冲加工生产工单模块
- **工单创建**：支持关联产品类目，自动生成工单号
- **下架型号拦截**：创建工单时自动校验产品类目状态，下架型号禁止下单
- **工序流转**：开平分条 → 精准裁切 → 叠压成型 → 端面打磨 → 绝缘喷涂 → 成品入库，全流程状态自动流转
- **超时搁置**：超过3天未排产的工单自动搁置（每天凌晨1点执行）
- **工单状态管理**：支持搁置、恢复、删除操作
- **工序记录**：记录每道工序的开始/结束时间、操作人员、产出数量、不良品数量
- **状态流转校验**：严格按工序顺序执行，不允许跳工序操作

### 4. 生产能耗成本台账模块
- **原料损耗统计**：记录生产过程中的物料损耗
- **设备用电能耗统计**：记录耗电量和用电成本
- **人工工时统计**：记录人工工时和人工成本
- **不良品报废成本统计**：记录不良品数量和报废成本
- **生产利润核算**：自动计算总成本、单位成本和利润
- **自动生成生产报表**：按时间段、产品类目汇总生成报表
- **工单用料明细**：记录工单物料使用明细，支持财务对账溯源

### 5. 系统功能
- **JWT身份认证**：无状态Token认证，支持用户登录验证
- **细粒度角色权限控制**：基于@RequiresRole注解的角色权限拦截，支持多角色组合
- **全局异常处理**：统一异常处理，返回标准化错误响应
- **参数校验**：基于Jakarta Validation的注解式参数校验
- **操作日志记录**：AOP切面自动记录用户操作，支持按模块、操作人员、时间范围查询

## 角色权限说明
- **PURCHASE（物料采购）**：负责物料采购、库存管理、物料出入库、工单用料明细录入
- **PROCESS_ENGINEER（工艺工程师）**：负责工艺流程管理、产品类目维护、成本台账管理
- **PRODUCTION_LEADER（生产组长）**：负责工单创建、排产、工序执行、工单状态管理
- **QUALITY_SUPERVISOR（质检主管）**：负责质量检验、确认工序完成、不良品记录

## 工单状态说明
1. **待排产**：工单刚创建，尚未开始生产
2. **已排产**：工单已安排生产计划
3. **开平分条中**：正在进行开平分条工序
4. **精准裁切中**：正在进行精准裁切工序
5. **叠压成型中**：正在进行叠压成型工序
6. **端面打磨中**：正在进行端面打磨工序
7. **绝缘喷涂中**：正在进行绝缘喷涂工序
8. **已完成**：所有工序完成，成品入库
9. **已搁置**：超过3天未排产或手动搁置

## 数据库初始化
执行 `src/main/resources/sql/init.sql` 初始化数据库

## 启动说明
1. 配置 MySQL 连接信息（application.yml）
2. 配置 Redis 连接信息（application.yml）
3. 启动 CoreProductionApplication 主类
4. 默认端口：8080，上下文路径：/api

## API接口汇总

### 认证接口
- `POST /api/auth/login` - 用户登录

### 产品类目接口
- `GET /api/category/tree` - 获取分类树（Redis缓存）
- `POST /api/category` - 新增类目（需要PROCESS_ENGINEER或PRODUCTION_LEADER角色）
- `PUT /api/category` - 更新类目（需要PROCESS_ENGINEER或PRODUCTION_LEADER角色）
- `DELETE /api/category/{id}` - 删除类目（需要PROCESS_ENGINEER或PRODUCTION_LEADER角色）
- `PUT /api/category/{id}/status/{status}` - 更新类目状态

### 物料库存接口
- `GET /api/material/page` - 物料分页查询
- `GET /api/material/{id}` - 获取物料详情
- `POST /api/material` - 新增物料（需要PURCHASE角色）
- `PUT /api/material/{id}` - 更新物料（需要PURCHASE角色）
- `DELETE /api/material/{id}` - 删除物料（需要PURCHASE角色）
- `GET /api/material/warning` - 获取库存预警物料
- `GET /api/material/expiring` - 获取即将过期物料
- `PUT /api/material/{id}/stock` - 调整库存（需要PURCHASE角色）

### 生产工单接口
- `GET /api/order/page` - 工单分页查询
- `GET /api/order/{id}` - 获取工单详情
- `POST /api/order` - 创建工单（需要PRODUCTION_LEADER角色，下架型号自动拦截）
- `PUT /api/order` - 更新工单（需要PRODUCTION_LEADER角色）
- `DELETE /api/order/{id}` - 删除工单（需要PRODUCTION_LEADER角色）
- `GET /api/order/{id}/processes` - 获取工单工序记录
- `POST /api/order/{id}/process/{processCode}/start` - 开始工序（需要PRODUCTION_LEADER角色）
- `POST /api/order/{id}/process/{processCode}/complete` - 完成工序（需要PRODUCTION_LEADER或QUALITY_SUPERVISOR角色）
- `POST /api/order/{id}/suspend` - 搁置工单（需要PRODUCTION_LEADER角色）
- `POST /api/order/{id}/resume` - 恢复工单（需要PRODUCTION_LEADER角色）

### 成本台账接口
- `GET /api/cost/page` - 成本记录分页查询
- `GET /api/cost/{id}` - 获取成本详情
- `POST /api/cost` - 新增成本记录（需要PROCESS_ENGINEER或PRODUCTION_LEADER角色）
- `PUT /api/cost/{id}` - 更新成本记录（需要PROCESS_ENGINEER或PRODUCTION_LEADER角色）
- `DELETE /api/cost/{id}` - 删除成本记录（需要PROCESS_ENGINEER或PRODUCTION_LEADER角色）
- `GET /api/cost/report` - 生成成本报表
- `GET /api/cost/order/{orderId}/materials` - 获取工单用料明细
- `POST /api/cost/order/material` - 添加工单用料明细（需要PURCHASE或PRODUCTION_LEADER角色）

### 操作日志接口
- `GET /api/log/page` - 操作日志分页查询
- `GET /api/log/{id}` - 获取日志详情

## 更新日志

### v2.0.0（当前版本）
- ✅ 修复无限级树形递归查询性能问题，使用HashMap优化
- ✅ 新增下架型号工单下达拦截功能，创建工单时自动校验类目状态
- ✅ 集成Redis缓存，缓存常用铁芯分类树数据
- ✅ 完善统一全局参数校验，使用DTO和@Valid注解
- ✅ 完善JWT细粒度角色权限控制，基于@RequiresRole注解
- ✅ 完善生产工单全流程状态自动流转，支持工序顺序校验
- ✅ 完善硅钢片物料库存模块接口，新增库存调整功能
- ✅ 完善生产能耗成本台账模块，新增报表统计和用料明细
- ✅ 新增操作日志AOP切面，自动记录用户操作
- ✅ 新增工单搁置/恢复功能，支持超时自动搁置
- ✅ 所有接口添加@OperationLog日志记录注解
