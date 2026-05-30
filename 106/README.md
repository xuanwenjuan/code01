# 远洋海钓渔获集散分拣管理后端服务

## 项目简介

基于 Spring Boot 3 + MyBatis-Plus 的远洋海钓渔获集散分拣管理系统，支持多角色权限管理、渔获类目管理、渔船档案、分拣工单流程、营收统计等功能。

## 技术栈

- **框架**: Spring Boot 3.2.x
- **ORM**: MyBatis-Plus 3.5.5
- **数据库**: MySQL 8.0+
- **缓存**: Redis
- **认证**: JWT + Spring Security
- **工具**: Hutool
- **构建工具**: Maven

## 功能模块

### 1. 用户认证与权限管理
- JWT 无状态认证
- 多角色权限控制：
  - `ADMIN` - 系统管理员
  - `SORTER` - 分拣员
  - `DISPATCHER` - 船务调度
  - `WAREHOUSE` - 仓储管理员
  - `FINANCE` - 财务管理员
- 统一参数校验
- 全局异常处理

### 2. 海捕鱼获类目模块
- 多级分类管理（支持无限级树形结构）
- 类目类型：深海硬骨鱼、近海虾蟹类、远洋贝类、海产干货制品
- 类目新增、编辑、删除
- 小众渔获品类停收下架
- 市场供货排序
- 树形结构查询

### 3. 出海渔船档案模块
- 渔船备案信息管理
- 所属船队、核定捕捞海域
- 载重吨位记录
- 捕捞许可证管理
- 正常出海/休整停靠/检修停运状态管理
- 捕捞证件到期预警（提前30天）

### 4. 渔获回港分拣工单模块
- 渔船靠岸卸货登记
- 品类分级筛选
- 鲜活度定级
- 冷链打包分装
- 入库暂存全流程
- 工单状态自动流转（待卸货→卸货中→分拣中→打包中→入库完成）
- 超时未完成分拣工单自动预警（4小时超时）

### 5. 集散流通营收模块
- 按渔获品类统计捕捞总产量
- 按出海船队统计分拣折损量
- 冷链储运成本管理
- 线下批发销售额统计
- 自动生成集散经营报表（日报/周报/月报）
- 卸货分拣明细与资金往来对账溯源

### 6. 定时任务模块
- 每小时检查分拣工单超时
- 每日9点检查捕捞证件到期情况

## 项目结构

```
com.fishing.distribution
├── FishingDistributionApplication.java    # 启动类
├── common                                   # 公共模块
│   └── Result.java                        # 统一响应结果
├── config                                   # 配置类
│   ├── CorsConfig.java                    # 跨域配置
│   ├── MyBatisPlusConfig.java             # MyBatis-Plus配置
│   ├── JwtAuthenticationFilter.java       # JWT认证过滤器
│   └── SecurityConfig.java                # Spring Security配置
├── controller                               # 控制器层
│   ├── AuthController.java                # 认证接口
│   ├── FishCategoryController.java        # 渔获类目接口
│   ├── FishingBoatController.java         # 渔船档案接口
│   ├── SortingOrderController.java        # 分拣工单接口
│   └── RevenueController.java             # 营收管理接口
├── dto                                      # 数据传输对象
│   ├── LoginRequest.java
│   ├── PageQuery.java
│   ├── FishCategoryDTO.java
│   ├── FishingBoatDTO.java
│   ├── SortingOrderDTO.java
│   └── RevenueItemDTO.java
├── entity                                   # 实体类
│   ├── BaseEntity.java
│   ├── SysUser.java
│   ├── SysRole.java
│   ├── FishCategory.java
│   ├── FishingBoat.java
│   ├── SortingOrder.java
│   ├── SortingOrderDetail.java
│   ├── RevenueStatistics.java
│   └── RevenueItem.java
├── exception                                # 异常处理
│   ├── BusinessException.java
│   └── GlobalExceptionHandler.java
├── mapper                                   # 数据访问层
│   ├── SysUserMapper.java
│   ├── SysRoleMapper.java
│   ├── FishCategoryMapper.java
│   ├── FishingBoatMapper.java
│   ├── SortingOrderMapper.java
│   ├── SortingOrderDetailMapper.java
│   ├── RevenueStatisticsMapper.java
│   └── RevenueItemMapper.java
├── service                                  # 业务逻辑层
│   ├── AuthService.java
│   ├── FishCategoryService.java
│   ├── FishingBoatService.java
│   ├── SortingOrderService.java
│   └── RevenueService.java
├── task                                     # 定时任务
│   └── ScheduledTask.java
└── util                                     # 工具类
    └── JwtUtil.java
```

## 快速开始

### 1. 环境要求
- JDK 17+
- Maven 3.8+
- MySQL 8.0+
- Redis 5.0+

### 2. 数据库初始化
执行 `src/main/resources/sql/init.sql` 脚本创建数据库表并初始化基础数据。

### 3. 配置修改
修改 `application.yml` 中的数据库和Redis连接信息：
```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/fishing_distribution?useUnicode=true&characterEncoding=utf8&serverTimezone=Asia/Shanghai
    username: root
    password: your_password
  
  data:
    redis:
      host: localhost
      port: 6379
      password: your_password
```

### 4. 启动项目
```bash
mvn clean install
mvn spring-boot:run
```

服务启动后访问：`http://localhost:8080/api`

### 5. 默认账号
| 用户名 | 密码 | 角色 |
|--------|------|------|
| admin | 123456 | 系统管理员 |
| sorter01 | 123456 | 分拣员 |
| dispatcher01 | 123456 | 船务调度 |
| warehouse01 | 123456 | 仓储管理员 |
| finance01 | 123456 | 财务管理员 |

## API 接口概览

### 认证接口
- `POST /api/auth/login` - 用户登录
- `POST /api/auth/logout` - 用户退出

### 渔获类目接口
- `GET /api/fish-category/tree` - 获取类目树
- `GET /api/fish-category/list` - 获取类目列表
- `GET /api/fish-category/{id}` - 获取类目详情
- `POST /api/fish-category` - 新增类目
- `PUT /api/fish-category/{id}` - 编辑类目
- `DELETE /api/fish-category/{id}` - 删除类目

### 渔船档案接口
- `GET /api/fishing-boat/page` - 渔船分页列表
- `GET /api/fishing-boat/list` - 渔船列表
- `GET /api/fishing-boat/{id}` - 渔船详情
- `GET /api/fishing-boat/expiring-license` - 证件到期预警
- `POST /api/fishing-boat` - 新增渔船
- `PUT /api/fishing-boat/{id}` - 编辑渔船
- `DELETE /api/fishing-boat/{id}` - 删除渔船

### 分拣工单接口
- `GET /api/sorting-order/page` - 工单分页列表
- `GET /api/sorting-order/{id}` - 工单详情
- `GET /api/sorting-order/timeout` - 超时预警工单
- `POST /api/sorting-order` - 创建工单
- `PUT /api/sorting-order/{id}/status` - 更新工单状态
- `PUT /api/sorting-order/{id}/cancel` - 取消工单

### 营收管理接口
- `GET /api/revenue/statistics` - 营收统计报表
- `GET /api/revenue/item/page` - 资金往来分页列表
- `GET /api/revenue/item/{id}` - 收支明细详情
- `GET /api/revenue/item/order/{orderId}` - 工单关联收支明细
- `POST /api/revenue/item` - 新增收支明细

## 业务状态说明

### 工单状态
- `1` - 待卸货
- `2` - 卸货中
- `3` - 分拣中
- `4` - 打包中
- `5` - 入库完成
- `6` - 已取消

### 渔船状态
- `1` - 正常出海
- `2` - 休整停靠
- `3` - 检修停运

### 预警状态
- `0` - 正常
- `1` - 超时预警

## 开发规范

1. 遵循 Restful 接口设计规范
2. 严格分层：Controller → Service → Mapper
3. 统一参数校验使用 Jakarta Validation
4. 业务异常统一抛出 BusinessException
5. 多表操作使用 @Transactional 保证数据一致性
6. 操作日志记录（可扩展）

## License

MIT License
