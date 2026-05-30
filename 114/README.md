# 蜂箱巢础养蜂器具调配管理后端服务

## 技术栈

- SpringBoot 3.2.0
- MyBatis-Plus 3.5.5
- MySQL 8.0
- Redis
- JWT 0.12.3
- Lombok

## 项目结构

```
bee-equipment-management/
├── src/main/java/com/bee/equipment/
│   ├── annotation/          # 自定义注解
│   ├── aspect/              # AOP切面
│   ├── common/              # 公共类
│   ├── config/              # 配置类
│   ├── controller/          # 控制器
│   ├── dto/                 # 数据传输对象
│   ├── entity/              # 实体类
│   ├── exception/           # 异常处理
│   ├── interceptor/         # 拦截器
│   ├── mapper/              # 数据访问层
│   ├── service/             # 业务逻辑层
│   ├── task/                # 定时任务
│   ├── util/                # 工具类
│   └── BeeEquipmentApplication.java  # 启动类
├── src/main/resources/
│   ├── sql/                 # SQL脚本
│   └── application.yml      # 配置文件
└── pom.xml                  # Maven依赖
```

## 功能模块

### 1. 养蜂器具类目模块
- 类目树形查询
- 类目新增/修改/删除
- 类目状态管理（上架/下架）
- 优先级排序

### 2. 生产物料库存模块
- 物料信息管理
- 库存预警
- 批次管理
- 易潮物料临期提醒
- 采购状态管理

### 3. 器具组装调配工单模块
- 工单创建
- 物料领料
- 组装过程管理
- 质量检验
- 蜂场配发
- 超时工单自动暂停

### 4. 器具产销成本统计模块
- 物料成本统计
- 人工成本统计
- 运输成本统计
- 利润统计
- 经营报表生成

## 角色权限

| 角色 | 权限 |
|------|------|
| ADMIN | 平台管理员，全部权限 |
| ASSEMBLER | 器具组装工，工单操作权限 |
| PURCHASER | 物料采购，物料管理权限 |
| OPERATOR | 蜂场运维，工单配发权限 |

## 快速开始

### 1. 环境要求
- JDK 17+
- Maven 3.6+
- MySQL 8.0+
- Redis 5.0+

### 2. 数据库配置
执行 `src/main/resources/sql/init.sql` 初始化数据库

### 3. 修改配置
修改 `application.yml` 中的数据库和Redis配置

### 4. 启动项目
```bash
mvn spring-boot:run
```

### 5. 访问接口
- 接口地址：http://localhost:8080/api
- 登录接口：POST /auth/login

## 接口文档

### 认证接口
- POST /auth/login - 用户登录

### 类目接口
- GET /category/tree - 获取类目树形结构
- POST /category - 新增类目（管理员）
- PUT /category - 修改类目（管理员）
- DELETE /category/{id} - 删除类目（管理员）
- PUT /category/{id}/status - 修改类目状态（管理员）

### 物料接口
- GET /material/page - 物料分页查询
- GET /material/{id} - 获取物料详情
- POST /material - 新增物料（管理员/采购）
- PUT /material - 修改物料（管理员/采购）
- DELETE /material/{id} - 删除物料（管理员）
- PUT /material/{id}/status - 修改物料状态（管理员/采购）

### 工单接口
- GET /work-order/page - 工单分页查询
- GET /work-order/{id} - 获取工单详情
- POST /work-order - 创建工单（管理员）
- PUT /work-order/{id}/pick - 物料领料（组装工）
- PUT /work-order/{id}/start-assembly - 开始组装（组装工）
- PUT /work-order/{id}/finish-assembly - 完成组装（组装工）
- PUT /work-order/{id}/start-inspection - 开始质检（管理员）
- PUT /work-order/{id}/deliver - 配发蜂场（运维）

### 成本统计接口
- GET /cost-statistics/page - 成本统计分页查询
- POST /cost-statistics/generate - 生成统计数据（管理员）

## 定时任务

| 任务 | 执行时间 | 说明 |
|------|----------|------|
| 超时工单检查 | 每小时0分 | 将24小时未领料的工单暂停 |
| 物料临期检查 | 每天8点 | 检查易潮物料有效期 |
| 成本统计生成 | 每天2点 | 生成前一天的成本统计数据 |

## 开发说明

1. 统一响应格式：Result<T>
2. 统一异常处理：GlobalExceptionHandler
3. 参数校验：使用 jakarta.validation
4. 权限控制：使用 @RequireRole 注解
5. 操作日志：使用 @OperationLog 注解

## 默认账户

系统初始化后包含以下测试账户：

| 用户名 | 角色 | 说明 |
|--------|------|------|
| admin | ADMIN | 平台管理员 |
| assembler01 | ASSEMBLER | 器具组装工 |
| purchaser01 | PURCHASER | 物料采购 |
| operator01 | OPERATOR | 蜂场运维 |

默认密码：123456

## 注意事项

1. 生产环境请修改JWT密钥和数据库密码
2. 建议配置Redis集群以提高性能
3. 定时任务执行时间可根据实际需求调整
4. 请定期备份数据库
