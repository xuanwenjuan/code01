# 洗护日化成品生产仓储管控后端服务

## 项目简介

基于 SpringBoot3 + MyBatis-Plus + MySQL + Redis + JWT 构建的洗护日化产品生产仓储管理系统，实现从原料采购、配方研发、生产制造、品质检验到成品仓储的全流程管控。

## 技术栈

- **后端框架**: Spring Boot 3.2.5
- **ORM框架**: MyBatis-Plus 3.5.5
- **数据库**: MySQL 8.0+
- **缓存**: Redis 6.0+
- **认证**: JWT
- **接口文档**: Knife4j 4.4.0
- **工具库**: Hutool 5.8.26
- **构建工具**: Maven

## 功能模块

### 1. 用户权限模块
- 5种角色权限：原料采购、配方研发、生产组长、品控员、仓储管理员
- JWT令牌认证
- 基于注解的角色权限控制

### 2. 洗护产品分类模块
- 多级分类管理（洗发护发类、身体洗护类、家居清洁类、美妆洗护小样）
- 无限级树形递归查询
- 产品新增、下架停产管理
- 销售订单优先级排序

### 3. 日化原料仓储模块
- 原料分类管理：植物萃取、表面活性剂、香精色素、包装瓶盒耗材
- 库存状态：正常库存、库存预警、暂停采购
- 唯一原料批次号生成
- 液态原料保质期到期预警

### 4. 日化调配生产工单模块
- 全流程管控：原料称量 → 混合搅拌 → 恒温乳化 → 除菌过滤 → 灌装分装 → 贴标塑封
- 工单状态自动流转
- 超期未投产工单自动暂停
- 生产工序记录

### 5. 生产营收成本模块
- 原料耗用成本统计
- 包装物料损耗统计
- 生产线能耗统计
- 流水线人工工时统计
- 质检不合格报废成本统计
- 自动生成产销报表

## 数据库设计

### 核心表结构
- `sys_user` - 用户表
- `product_category` - 产品分类表
- `product` - 产品表
- `material` - 原料表
- `material_batch` - 原料批次表
- `formula` - 配方表
- `formula_detail` - 配方明细表
- `work_order` - 生产工单表
- `work_order_material` - 工单用料表
- `work_process` - 生产工序记录表
- `quality_inspection` - 质量检验表
- `finished_product` - 成品库存表
- `cost_statistics` - 成本统计表
- `operation_log` - 操作日志表
- `material_in_out_log` - 原料出入库日志表
- `finished_in_out_log` - 成品出入库日志表

## 快速开始

### 环境要求
- JDK 17+
- MySQL 8.0+
- Redis 6.0+
- Maven 3.6+

### 数据库初始化
1. 创建数据库：`cosmetics_db`
2. 执行脚本：`src/main/resources/sql/schema.sql`
3. 执行脚本：`src/main/resources/sql/data.sql`

### 配置修改
修改 `src/main/resources/application.yml`：
```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/cosmetics_db
    username: your_username
    password: your_password
  data:
    redis:
      host: localhost
      port: 6379
      password: your_password
```

### 启动项目
```bash
mvn clean install
mvn spring-boot:run
```

### 访问接口文档
- 地址：http://localhost:8080/api/doc.html

## 默认账号

| 用户名 | 密码 | 角色 |
|--------|------|------|
| caigou | 123456 | 原料采购 |
| yanfa | 123456 | 配方研发 |
| shengchan | 123456 | 生产组长 |
| pinkong | 123456 | 品控员 |
| cangchu | 123456 | 仓储管理员 |

## 项目结构

```
src/main/java/com/cosmetics
├── annotation/          # 自定义注解
├── aspect/              # 切面（权限、日志）
├── common/              # 公共类（响应、分页）
├── config/              # 配置类
├── context/             # 上下文
├── controller/          # 控制器
├── dto/                 # 数据传输对象
├── entity/              # 实体类
├── enums/               # 枚举类
├── exception/           # 异常处理
├── interceptor/         # 拦截器
├── mapper/              # 数据访问层
├── service/             # 业务逻辑层
│   └── impl/            # 业务实现
├── task/                # 定时任务
├── util/                # 工具类
├── vo/                  # 视图对象
└── CosmeticsApplication.java
```

## 核心特性

1. **Restful接口规范**: 遵循RESTful设计原则
2. **统一全局异常捕获**: 统一异常处理，友好错误提示
3. **注解参数校验**: 使用JSR-380注解进行参数校验
4. **多角色权限控制**: 细粒度的角色权限管理
5. **工单状态流转**: 生产工单全流程状态自动流转
6. **多表数据一致**: 事务保证多表数据一致性
7. **操作日志留存**: 全程留存生产出入库操作日志
8. **定时任务**: 自动处理过期原料、超期工单
