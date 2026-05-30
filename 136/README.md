# 汽车铝制散热器冲压组装管控后端服务

## 技术栈

- Spring Boot 3.2.x
- MyBatis Plus 3.5.x
- MySQL 8.0+
- Redis
- JWT
- Lombok

## 项目结构

```
radiator-management/
├── src/main/java/com/radiator/management/
│   ├── RadiatorManagementApplication.java    # 启动类
│   ├── annotation/                            # 注解
│   │   └── OpLog.java                        # 操作日志注解
│   ├── aspect/                               # 切面
│   │   └── OperationLogAspect.java           # 操作日志切面
│   ├── common/                               # 公共类
│   │   ├── Result.java                       # 统一返回结果
│   │   └── RoleEnum.java                     # 角色枚举
│   ├── config/                               # 配置类
│   │   ├── MyMetaObjectHandler.java          # 自动填充处理器
│   │   └── WebMvcConfig.java                 # Web配置
│   ├── controller/                           # 控制器
│   │   ├── AuthController.java               # 认证控制器
│   │   ├── MaterialInventoryController.java  # 物料库存控制器
│   │   ├── OperationLogController.java       # 操作日志控制器
│   │   ├── ProductionCostController.java     # 生产成本控制器
│   │   ├── ProductionWorkOrderController.java # 生产工单控制器
│   │   ├── RadiatorCategoryController.java   # 散热器品类控制器
│   │   └── SysUserController.java            # 用户控制器
│   ├── dto/                                  # 数据传输对象
│   │   ├── LoginDTO.java                     # 登录请求
│   │   └── LoginResultDTO.java               # 登录结果
│   ├── entity/                               # 实体类
│   │   ├── MaterialInventory.java            # 物料库存
│   │   ├── MonthlyReport.java                # 月度报表
│   │   ├── OperationLog.java                 # 操作日志
│   │   ├── ProductionCost.java               # 生产成本
│   │   ├── ProductionWorkOrder.java          # 生产工单
│   │   ├── RadiatorCategory.java             # 散热器品类
│   │   ├── SysUser.java                      # 系统用户
│   │   └── WorkOrderMaterial.java            # 工单物料
│   ├── exception/                            # 异常处理
│   │   ├── BusinessException.java            # 业务异常
│   │   └── GlobalExceptionHandler.java       # 全局异常处理器
│   ├── interceptor/                          # 拦截器
│   │   └── JwtInterceptor.java               # JWT拦截器
│   ├── mapper/                               # Mapper接口
│   ├── service/                              # 业务逻辑
│   ├── task/                                 # 定时任务
│   │   └── ProductionTask.java               # 生产相关定时任务
│   └── util/                                 # 工具类
│       └── JwtUtil.java                      # JWT工具类
└── src/main/resources/
    ├── application.yml                        # 配置文件
    └── sql/
        └── init.sql                           # 数据库初始化脚本
```

## 功能模块

### 1. 散热器品类模块
- 多级分类管理（轿车水箱散热器、货车散热总成、工程机械散热件、定制异形散热器）
- 老旧款式下线停产
- 订单优先级排序
- 无限级树形递归查询

### 2. 铝材配件库存模块
- 物料登记（铝散热板、散热铜管、密封胶圈、固定支架等）
- 库存状态管理（充足、预警、停止采购）
- 唯一批次编号生成
- 防潮配件仓储存放提醒

### 3. 冲压组装生产工单模块
- 全流程管理：裁切 -> 冲压 -> 管路 -> 组装 -> 检漏 -> 打包 -> 完成
- 超期未排产工单自动暂停（每日凌晨1点执行）
- 工单状态自动流转

### 4. 生产经营成本模块
- 物料消耗统计
- 设备损耗统计
- 人工工时统计
- 检漏耗材支出统计
- 不良品报废损失统计
- 月度生产报表自动生成（每月1日凌晨2点执行）
- 工单用料明细与财务对账核对

## 角色权限

1. **采购专员** (purchase_officer)：负责物料采购、库存管理
2. **组装工艺员** (assembly_technician)：负责生产工艺、工单流程操作
3. **产线组长** (production_leader)：负责生产调度、人员管理
4. **成品质检员** (quality_inspector)：负责质量检验、不良品记录

## 数据库表说明

- `sys_user`：系统用户表
- `radiator_category`：散热器品类表
- `material_inventory`：物料库存表
- `production_work_order`：生产工单表
- `work_order_material`：工单物料明细表
- `production_cost`：生产成本表
- `monthly_report`：月度生产报表
- `operation_log`：操作日志表

## 启动说明

1. 创建MySQL数据库 `radiator_db`
2. 执行 `src/main/resources/sql/init.sql` 初始化数据库
3. 修改 `application.yml` 中的数据库和Redis连接信息
4. 启动 `RadiatorManagementApplication`

## API接口

所有接口前缀：`/api`

- 认证：`POST /auth/login`
- 品类管理：`/category/**`
- 库存管理：`/material/**`
- 工单管理：`/work-order/**`
- 成本管理：`/cost/**`
- 用户管理：`/user/**`
- 操作日志：`/log/**`
