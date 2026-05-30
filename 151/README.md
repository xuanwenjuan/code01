# 文创文具定制生产管控后端服务

## 项目简介

基于 SpringBoot3 + MyBatis-Plus 的文创文具定制生产管控系统，实现从原料采购、生产工单、成本统计到质量检验的全流程管理。

## 技术栈

- **后端框架**: SpringBoot 3.2.0
- **ORM框架**: MyBatis-Plus 3.5.5
- **数据库**: MySQL 8.0+
- **缓存**: Redis
- **认证**: JWT
- **定时任务**: Spring Task
- **接口文档**: Knife4j (OpenAPI 3)
- **工具类**: Hutool, Fastjson2
- **密码加密**: Spring Security Crypto

## 角色权限

| 角色编码 | 角色名称 | 主要职责 |
|---------|---------|---------|
| ADMIN | 系统管理员 | 全功能权限 |
| PURCHASER | 采购专员 | 原料库存管理 |
| DESIGNER | 版式设计员 | 产品分类管理、工单设计 |
| PRODUCTION_LEADER | 产线组长 | 工单管理、生产排程 |
| INSPECTOR | 成品质检员 | 质量检验 |

## 核心功能模块

### 1. 产品分类模块
- 多级分类树形结构（无限级）
- 分类新增、修改、删除、状态管理
- 分类树查询、列表查询
- 优先级排序

### 2. 原料库存模块
- 原料登记（原木笔杆、书写油墨、特种纸张、印花耗材、五金配件）
- 库存状态管理（正常库存、库存预警、暂停采购）
- 自动生成唯一物料批次号
- 纸质原料防潮仓储提醒
- 库存出入库管理

### 3. 生产工单模块
- 工单创建、修改、删除
- 生产流程：原料裁切加工 → 图案印花组装 → 油墨灌注 → 装帧装订 → 瑕疵检验 → 塑封包装 → 成品入库
- 工单状态自动流转
- 超期未排产工单自动暂停（定时任务）
- 工序跟踪、工时记录
- 用料明细管理

### 4. 生产成本统计模块
- 原料耗材消耗统计
- 设备加工损耗统计
- 人工组装工时统计
- 定制改版损耗统计
- 残次产品报废成本统计
- 自动生成产销报表
- 工单用料明细对接财务

### 5. 操作日志模块
- 全流程操作日志记录
- 异步存储，不影响主流程
- 操作人、操作时间、IP、请求参数、响应结果记录

## 工单状态说明

| 状态值 | 状态名称 | 说明 |
|-------|---------|------|
| 0 | 待排产 | 工单已创建，等待排产 |
| 1 | 已排产 | 已安排生产计划 |
| 2 | 生产中 | 正在进行生产 |
| 3 | 生产完成 | 所有工序完成 |
| 4 | 待质检 | 等待质量检验 |
| 5 | 质检完成 | 质量检验完成 |
| 6 | 已完结 | 工单全部完成 |
| 9 | 已暂停 | 超期未排产自动暂停 |

## 快速开始

### 1. 环境准备
- JDK 17+
- Maven 3.6+
- MySQL 8.0+
- Redis 5.0+

### 2. 数据库初始化
```bash
mysql -u root -p < src/main/resources/sql/init.sql
```

### 3. 修改配置
编辑 `src/main/resources/application.yml`，修改数据库和Redis连接信息。

### 4. 启动项目
```bash
mvn clean install
mvn spring-boot:run
```

### 5. 访问接口文档
- Knife4j: http://localhost:8080/doc.html

### 6. 默认账号
所有默认账号密码均为: `123456`

| 用户名 | 角色 |
|-------|------|
| admin | 系统管理员 |
| purchaser01 | 采购专员 |
| designer01 | 版式设计员 |
| leader01 | 产线组长 |
| inspector01 | 成品质检员 |

## 项目结构

```
src/main/java/com/stationery/manufacture/
├── StationeryManufactureApplication.java
├── common/                    # 通用模块
│   ├── Result.java            # 统一响应
│   ├── ErrorCode.java         # 错误码
│   ├── BusinessException.java # 业务异常
│   ├── GlobalExceptionHandler.java # 全局异常处理
│   ├── JwtUtil.java           # JWT工具
│   ├── UserContext.java       # 用户上下文
│   ├── RequireRole.java       # 角色权限注解
│   └── OperLog.java           # 操作日志注解
├── config/                    # 配置类
│   ├── RedisConfig.java
│   ├── MybatisPlusConfig.java
│   └── WebConfig.java
├── interceptor/               # 拦截器
│   └── JwtInterceptor.java
├── aspect/                    # 切面
│   ├── RoleAspect.java        # 角色权限切面
│   └── OperationLogAspect.java # 操作日志切面
├── entity/                    # 实体类
├── mapper/                    # Mapper接口
├── service/                   # 业务逻辑
├── controller/                # 控制器
├── task/                      # 定时任务
└── dto/                       # 数据传输对象
```

## API接口列表

### 认证模块
- POST /api/auth/login - 用户登录

### 产品分类模块
- POST /api/category - 新增分类
- PUT /api/category - 修改分类
- DELETE /api/category/{id} - 删除分类
- GET /api/category/{id} - 获取分类详情
- GET /api/category/tree - 获取分类树
- GET /api/category/list - 获取分类列表
- PUT /api/category/{id}/status - 更新分类状态

### 原料库存模块
- POST /api/material - 新增原料库存
- PUT /api/material - 修改原料库存
- DELETE /api/material/{id} - 删除原料库存
- GET /api/material/{id} - 获取原料详情
- GET /api/material/page - 分页查询原料列表
- PUT /api/material/{id}/quantity - 调整库存数量
- GET /api/material/warning - 获取库存预警列表
- GET /api/material/moisture - 获取防潮原料列表
- PUT /api/material/{id}/purchase-status - 更新采购状态

### 生产工单模块
- POST /api/order - 创建工单
- PUT /api/order - 修改工单
- DELETE /api/order/{id} - 删除工单
- GET /api/order/{id} - 获取工单详情
- GET /api/order/page - 分页查询工单
- PUT /api/order/{id}/start - 开始生产
- PUT /api/order/{orderId}/process/{processId}/complete - 完成工序
- PUT /api/order/{id}/inspection - 质检
- PUT /api/order/{id}/finish - 工单完结
- POST /api/order/material - 添加工单用料
- DELETE /api/order/material/{id} - 删除工单用料

### 成本统计模块
- POST /api/cost/calculate/{orderId} - 计算工单成本
- GET /api/cost/{id} - 获取成本详情
- GET /api/cost/page - 分页查询成本列表
- GET /api/cost/report/period - 期间成本报表
- GET /api/cost/report/category - 分类成本报表
- GET /api/cost/order/{orderId}/materials - 获取工单用料明细
- GET /api/cost/order/{orderId}/processes - 获取工序列表

### 操作日志模块
- GET /api/log/page - 分页查询操作日志
- GET /api/log/{id} - 获取日志详情
