# 矿山工程机械维保调度管理后端服务

## 项目简介

基于SpringBoot3的矿山工程机械维保调度管理系统，实现了设备全生命周期管理、维保工单流程化处理、物资库存核销等核心功能。

## 技术栈

- **SpringBoot 3.2.x** - 基础框架
- **MyBatis-Plus 3.5.5** - ORM框架
- **MySQL 8.x** - 关系型数据库
- **Redis** - 缓存中间件
- **Spring Security + JWT** - 认证授权
- **Spring Scheduled** - 定时任务

## 功能模块

### 1. 工程器械类目模块
- 多级类目树形结构管理
- 类目新增、编辑、删除
- 老旧机型下线管理
- 矿区调配排序
- 无限级树形递归查询

### 2. 在用机械资产模块
- 设备出厂编号管理
- 服役矿区分配
- 投入使用年限记录
- 额定工况配置
- 设备状态管理（正常运行/故障停机/进厂维保）
- 设备唯一编码管理
- 强制维保周期到期预警

### 3. 故障维保派工模块
- 线上故障上报
- 故障等级判定（低/中/高/紧急）
- 维保人员指派
- 现场检修记录
- 配件更换登记
- 试车验收流程
- 超时未接单自动重新派单
- 工单状态自动流转（已上报→已指派→已接单→维修中→已完成→验收通过/重新开单）

### 4. 维保物资核销模块
- 配件领用登记
- 维修成本统计
- 设备停工损耗记录
- 月度维保开支统计
- 运维报表自动生成
- 维保明细与物资财务对账溯源

## 角色权限

- **ADMIN（平台管理员）** - 系统全权限管理
- **DISPATCHER（调度员）** - 工单派工、设备管理
- **TECHNICIAN（维保技师）** - 接单、维修处理
- **MATERIAL（物资管理）** - 物资库存、核销管理

## 项目结构

```
src/main/java/com/mining/maintenance/
├── MaintenanceApplication.java    # 启动类
├── common/                        # 公共模块
│   └── Result.java               # 统一返回结果
├── config/                        # 配置类
│   ├── MybatisPlusConfig.java    # MyBatis-Plus配置
│   ├── RedisConfig.java          # Redis配置
│   ├── SecurityConfig.java       # 安全配置
│   └── MetaObjectHandler.java    # 自动填充处理器
├── controller/                    # 控制器层
│   ├── AuthController.java
│   ├── EquipmentCategoryController.java
│   ├── EquipmentAssetController.java
│   ├── MaintenanceOrderController.java
│   └── MaterialController.java
├── dto/                           # 数据传输对象
│   ├── LoginDTO.java
│   ├── EquipmentCategoryDTO.java
│   ├── EquipmentAssetDTO.java
│   ├── MaintenanceOrderDTO.java
│   └── MaterialUsageDTO.java
├── entity/                        # 实体类
│   ├── BaseEntity.java
│   ├── SysUser.java
│   ├── EquipmentCategory.java
│   ├── EquipmentAsset.java
│   ├── MaintenanceOrder.java
│   ├── MaintenanceOrderLog.java
│   ├── Material.java
│   └── MaterialUsageRecord.java
├── exception/                     # 异常处理
│   ├── BusinessException.java
│   └── GlobalExceptionHandler.java
├── mapper/                        # 数据访问层
│   ├── SysUserMapper.java
│   ├── EquipmentCategoryMapper.java
│   ├── EquipmentAssetMapper.java
│   ├── MaintenanceOrderMapper.java
│   ├── MaintenanceOrderLogMapper.java
│   ├── MaterialMapper.java
│   └── MaterialUsageRecordMapper.java
├── service/                       # 业务逻辑层
│   ├── AuthService.java
│   ├── EquipmentCategoryService.java
│   ├── EquipmentAssetService.java
│   ├── MaintenanceOrderService.java
│   ├── MaterialService.java
│   └── impl/
├── task/                          # 定时任务
│   └── MaintenanceScheduledTask.java
├── util/                          # 工具类
│   └── JwtUtil.java
└── vo/                            # 视图对象
    └── LoginVO.java
```

## 快速开始

### 1. 数据库初始化

执行 `src/main/resources/sql/init.sql` 初始化数据库表结构和测试数据。

默认测试账号：
- 管理员：admin / 123456
- 调度员：dispatcher01 / 123456
- 技师：technician01 / 123456

### 2. 配置修改

修改 `application.yml` 中的数据库和Redis连接配置：

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/mining_maintenance?useUnicode=true&characterEncoding=utf-8&serverTimezone=Asia/Shanghai
    username: root
    password: your_password
  data:
    redis:
      host: localhost
      port: 6379
```

### 3. 启动项目

运行 `MaintenanceApplication.java` 启动项目，默认端口8080。

## API接口清单

### 认证接口
- `POST /api/auth/login` - 用户登录

### 设备类目接口
- `GET /api/equipment/category/tree` - 类目树形列表
- `GET /api/equipment/category/tree/type/{categoryType}` - 按类型查询类目树
- `POST /api/equipment/category` - 新增类目
- `PUT /api/equipment/category` - 编辑类目
- `DELETE /api/equipment/category/{id}` - 删除类目
- `PUT /api/equipment/category/{id}/offline` - 类目下线
- `PUT /api/equipment/category/{id}/online` - 类目上线
- `PUT /api/equipment/category/{id}/sort` - 调整排序

### 设备资产接口
- `GET /api/equipment/asset/page` - 设备分页列表
- `GET /api/equipment/asset/{id}` - 设备详情
- `GET /api/equipment/asset/warning` - 待维保预警列表
- `POST /api/equipment/asset` - 新增设备
- `PUT /api/equipment/asset` - 编辑设备
- `DELETE /api/equipment/asset/{id}` - 删除设备
- `PUT /api/equipment/asset/{id}/status` - 更新设备状态
- `PUT /api/equipment/asset/{id}/refresh-maintenance` - 刷新维保日期

### 维保工单接口
- `POST /api/maintenance/order/report` - 上报故障
- `PUT /api/maintenance/order/{id}/assign` - 指派技师
- `PUT /api/maintenance/order/{id}/accept` - 接单
- `PUT /api/maintenance/order/{id}/start` - 开始维修
- `PUT /api/maintenance/order/{id}/complete` - 完成维修
- `PUT /api/maintenance/order/{id}/check` - 验收
- `GET /api/maintenance/order/page` - 工单分页列表
- `GET /api/maintenance/order/{id}` - 工单详情
- `GET /api/maintenance/order/{id}/logs` - 工单操作日志

### 物资管理接口
- `POST /api/material/use` - 领用物资
- `PUT /api/material/usage/{id}/verify` - 核销物资
- `GET /api/material/usage/page` - 领用记录分页
- `GET /api/material/page` - 物资列表
- `GET /api/material/{id}` - 物资详情

## 核心特性

1. **严格分层架构** - Controller/Service/Mapper三层分离，职责清晰
2. **全局统一处理** - 统一返回格式、全局异常处理、参数校验
3. **操作留痕** - 工单全流程操作日志记录
4. **事务保障** - 关键业务操作使用事务保证数据一致性
5. **自动预警** - 维保周期到期预警、超时工单自动重新派单
6. **树形结构** - 设备类目支持无限级树形结构