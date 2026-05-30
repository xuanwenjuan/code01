# 瓶装酒水酿造分装管控后端服务

## 项目简介

基于SpringBoot3 + MyBatis-Plus的瓶装酒水酿造生产管理系统，实现酒水品类分类、酿造物料库存、生产工单管理、成本核算等核心业务功能。

## 技术栈

- **后端框架**: SpringBoot 3.2.0
- **ORM框架**: MyBatis-Plus 3.5.5
- **数据库**: MySQL 8.0+
- **缓存**: Redis
- **认证**: JWT
- **工具库**: Hutool 5.8.23
- **Excel处理**: EasyExcel 3.3.2
- **API文档**: Knife4j 4.4.0
- **构建工具**: Maven
- **Java版本**: JDK 17

## 项目结构

```
liquor-brewing-management/
├── src/main/java/com/liquor/brewing/
│   ├── annotation/          # 自定义注解
│   ├── aspect/              # AOP切面
│   ├── common/              # 通用类
│   │   ├── BaseEntity.java
│   │   ├── Constants.java
│   │   ├── PageQuery.java
│   │   ├── PageResult.java
│   │   ├── Result.java
│   │   └── ResultCode.java
│   ├── config/              # 配置类
│   │   ├── Knife4jConfig.java
│   │   ├── MybatisPlusConfig.java
│   │   ├── RedisConfig.java
│   │   ├── SchedulingConfig.java
│   │   └── WebMvcConfig.java
│   ├── controller/          # 控制层
│   │   ├── AuthController.java
│   │   ├── CostController.java
│   │   ├── LiquorCategoryController.java
│   │   ├── LiquorFormulaController.java
│   │   ├── MaterialController.java
│   │   ├── SysUserController.java
│   │   └── WorkOrderController.java
│   ├── dto/                 # 数据传输对象
│   │   └── LoginDTO.java
│   ├── entity/              # 实体类
│   │   ├── CostStatistics.java
│   │   ├── LiquorCategory.java
│   │   ├── LiquorFormula.java
│   │   ├── Material.java
│   │   ├── MaterialBatch.java
│   │   ├── OperationLog.java
│   │   ├── SysRole.java
│   │   ├── SysUser.java
│   │   ├── WorkOrder.java
│   │   ├── WorkOrderCost.java
│   │   ├── WorkOrderMaterial.java
│   │   └── WorkOrderProcess.java
│   ├── exception/           # 异常处理
│   │   ├── BusinessException.java
│   │   └── GlobalExceptionHandler.java
│   ├── interceptor/         # 拦截器
│   │   └── JwtInterceptor.java
│   ├── mapper/              # 数据访问层
│   │   ├── CostStatisticsMapper.java
│   │   ├── LiquorCategoryMapper.java
│   │   ├── LiquorFormulaMapper.java
│   │   ├── MaterialBatchMapper.java
│   │   ├── MaterialMapper.java
│   │   ├── OperationLogMapper.java
│   │   ├── SysRoleMapper.java
│   │   ├── SysUserMapper.java
│   │   ├── WorkOrderCostMapper.java
│   │   ├── WorkOrderMapper.java
│   │   ├── WorkOrderMaterialMapper.java
│   │   └── WorkOrderProcessMapper.java
│   ├── service/             # 业务逻辑层
│   │   ├── AuthService.java
│   │   ├── CostService.java
│   │   ├── LiquorCategoryService.java
│   │   ├── LiquorFormulaService.java
│   │   ├── MaterialService.java
│   │   ├── SysRoleService.java
│   │   ├── SysUserService.java
│   │   ├── WorkOrderService.java
│   │   └── impl/            # 服务实现类
│   ├── task/                # 定时任务
│   │   └── ScheduledTasks.java
│   ├── util/                # 工具类
│   │   ├── CodeGenerator.java
│   │   ├── JwtUtil.java
│   │   ├── RedisUtil.java
│   │   └── UserContext.java
│   ├── vo/                  # 视图对象
│   │   └── LoginVO.java
│   └── LiquorBrewingApplication.java
├── src/main/resources/
│   ├── application.yml      # 应用配置
│   └── mapper/              # MyBatis XML映射文件
├── sql/
│   └── liquor_management.sql # 数据库脚本
└── pom.xml
```

## 核心功能模块

### 1. 用户权限模块
- 用户登录认证（JWT Token）
- 角色管理（采购统筹、酿造技术员、车间主管、成品巡检员）
- 用户管理（增删改查、状态管理、密码重置）

### 2. 酒水品类分类模块
- 多级树形分类管理
- 酒水配方管理
- 配方启用/停用
- 优先级排序

### 3. 酿造物料库存模块
- 物料档案管理
- 物料批次管理（自动生成唯一溯源批次码）
- 库存出入库管理
- 库存状态管理（正常、预警、停止采购）
- 保质期到期提醒

### 4. 酿造灌装生产工单模块
- 工单创建与管理
- 全流程状态流转（发酵→勾调→陈放→过滤→灌装→贴标→质检→完成）
- 工单自动冻结（长期未启动）
- 工单用料管理
- 工序记录管理

### 5. 酿造成本核算模块
- 工单成本核算（主料、设备、水电、人工、报废）
- 月度成本统计报表
- 工单用料明细导出（Excel）

### 6. 操作日志模块
- 全程记录所有业务操作
- 支持按模块、操作类型、时间范围查询

## 数据库设计

### 主要数据表
- `sys_user` - 系统用户表
- `sys_role` - 系统角色表
- `liquor_category` - 酒水分类表
- `liquor_formula` - 酒水配方表
- `material_type` - 物料类型表
- `material` - 物料表
- `material_batch` - 物料批次表
- `material_stock_record` - 物料出入库记录表
- `work_order` - 生产工单表
- `work_order_material` - 工单用料明细表
- `work_order_process` - 工单流程记录表
- `work_order_cost` - 工单成本表
- `cost_statistics` - 成本统计表
- `operation_log` - 操作日志表

## 快速开始

### 环境要求
- JDK 17+
- MySQL 8.0+
- Redis 6.0+
- Maven 3.8+

### 部署步骤

1. **创建数据库**
```sql
source sql/liquor_management.sql
```

2. **修改配置**
编辑 `src/main/resources/application.yml`，修改数据库和Redis连接信息。

3. **编译运行**
```bash
mvn clean package
java -jar target/liquor-brewing-management-1.0.0.jar
```

4. **访问API文档**
```
http://localhost:8080/api/doc.html
```

### 默认角色
- 采购统筹 (purchaser)
- 酿造技术员 (brewer)
- 车间主管 (supervisor)
- 成品巡检员 (inspector)

## API接口

### 认证接口
- `POST /api/auth/login` - 用户登录
- `POST /api/auth/logout` - 用户登出

### 用户管理
- `GET /api/system/users/page` - 分页查询用户
- `GET /api/system/users/{id}` - 获取用户详情
- `POST /api/system/users` - 新增用户
- `PUT /api/system/users` - 修改用户
- `DELETE /api/system/users/{id}` - 删除用户
- `PUT /api/system/users/{id}/status` - 修改用户状态
- `PUT /api/system/users/{id}/reset-password` - 重置密码

### 分类管理
- `GET /api/category/tree` - 获取分类树形结构
- `GET /api/category/{id}` - 获取分类详情
- `POST /api/category` - 新增分类
- `PUT /api/category` - 修改分类
- `DELETE /api/category/{id}` - 删除分类
- `PUT /api/category/{id}/status` - 修改分类状态

### 物料管理
- `GET /api/material/page` - 分页查询物料
- `GET /api/material/{id}` - 获取物料详情
- `POST /api/material` - 新增物料
- `PUT /api/material` - 修改物料
- `DELETE /api/material/{id}` - 删除物料
- `POST /api/material/stock-in` - 物料入库
- `POST /api/material/stock-out` - 物料出库
- `GET /api/material/expire-warning` - 获取到期预警物料

### 工单管理
- `GET /api/work-order/page` - 分页查询工单
- `GET /api/work-order/{id}` - 获取工单详情
- `POST /api/work-order` - 创建工单
- `PUT /api/work-order/{id}/start` - 开始工单
- `PUT /api/work-order/{id}/finish` - 完成工单
- `PUT /api/work-order/{id}/freeze` - 冻结工单
- `PUT /api/work-order/{id}/unfreeze` - 解冻工单
- `PUT /api/work-order/{id}/cancel` - 取消工单
- `PUT /api/work-order/{id}/process/{processType}/start` - 开始工序
- `PUT /api/work-order/{id}/process/{processType}/finish` - 完成工序

### 成本核算
- `GET /api/cost/work-order/page` - 分页查询工单成本
- `GET /api/cost/statistics/page` - 分页查询月度成本统计
- `POST /api/cost/work-order/{workOrderId}/calculate` - 核算工单成本
- `POST /api/cost/statistics/generate` - 生成月度成本报表
- `GET /api/cost/work-order/{workOrderId}/materials/excel` - 导出工单用料明细Excel

## 定时任务

- **每天02:00** - 自动冻结超过7天未启动的工单
- **每月1日03:00** - 生成上月成本统计报表
- **每天08:00** - 物料到期检查

## 业务规则

1. **工单状态流转**: 已创建 → 发酵中 → 勾调中 → 陈放中 → 过滤中 → 灌装中 → 贴标中 → 质检中 → 已完成
2. **自动冻结**: 工单创建后7天未启动自动冻结
3. **库存状态**: 根据库存数量自动更新（正常/预警/停止采购）
4. **成本核算**: 工单完成后可核算成本，包含主料、设备、水电、人工、报废成本
