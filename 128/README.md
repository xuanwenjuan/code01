# 精密轴承套圈冷锻成型生产管控后端服务

## 技术栈
- SpringBoot 3.x
- MyBatis-Plus
- MySQL
- Redis
- JWT
- 定时任务

## 项目要求
- 遵循 Restful 接口规范
- 统一全局异常捕获
- 注解实现全量请求参数校验
- 多级权限控制（原料采购、锻造工艺员、产线组长、品质巡检员）
- 生产单据状态自动流转
- 多表数据一致性保障
- 全程留存车间生产操作日志

## 功能模块

### 1. 轴承套圈品类模块
- 深沟球轴承圈、圆锥滚子轴承圈、调心轴承圈、非标定制轴承套圈多级分类
- 新增品类、老旧规格下线停产
- 生产排单优先级调整
- 无限级树形递归查询

### 2. 特种钢材原料模块
- 登记轴承专用圆钢、合金调质钢、耐磨坯料、表面处理辅料规格牌号
- 库存充足、库存预警、停止采购状态管理
- 生成原料唯一批次编码
- 易锈蚀钢材设置仓储防锈周期提醒

### 3. 冷锻成型生产工单
- 圆钢切断下料、中频预热处理、闭式冷锻成型、精整修边、热处理调质、精密研磨分选、成品入库全流程
- 超期未投产工单自动暂停
- 工单状态全自动流转

### 4. 生产制造成本汇总模块
- 按套圈品类统计钢材原料耗用、锻压设备损耗、热处理能耗支出、一线加工工时、次品报废损失
- 自动生成季度生产报表
- 支持工单用料明细与财务成本对账溯源

## 快速开始

### 1. 环境要求
- JDK 17+
- MySQL 8.0+
- Redis 6.0+
- Maven 3.6+

### 2. 数据库初始化
执行 `src/main/resources/schema.sql` 脚本初始化数据库和基础数据

### 3. 修改配置
修改 `application.yml` 中的数据库和Redis连接配置

### 4. 启动项目
```bash
mvn clean install
mvn spring-boot:run
```

### 5. 默认账号
| 用户名 | 密码 | 角色 |
|--------|------|------|
| admin | 123456 | 系统管理员 |
| purchaser | 123456 | 原料采购员 |
| engineer | 123456 | 锻造工艺员 |
| leader | 123456 | 产线组长 |
| inspector | 123456 | 品质巡检员 |

## API接口文档

### 认证接口
- POST `/api/auth/login` - 用户登录
- POST `/api/auth/register` - 用户注册

### 轴承套圈品类接口
- POST `/api/category` - 新增品类
- PUT `/api/category` - 更新品类
- DELETE `/api/category/{id}` - 删除品类
- PUT `/api/category/{id}/offline` - 品类下线
- PUT `/api/category/{id}/priority?priority=xx` - 调整优先级
- GET `/api/category/tree` - 树形查询
- GET `/api/category/level/{level}` - 按层级查询

### 特种钢材原料接口
- POST `/api/material` - 新增原料
- PUT `/api/material` - 更新原料
- DELETE `/api/material/{id}` - 删除原料
- PUT `/api/material/{id}/stock?quantity=xx` - 更新库存
- GET `/api/material/list?stockStatus=xx` - 按库存状态查询
- GET `/api/material/rust-proof-reminder` - 获取防锈提醒列表
- PUT `/api/material/{id}/rust-proof` - 执行防锈处理

### 冷锻成型生产工单接口
- POST `/api/work-order` - 创建工单
- PUT `/api/work-order/{id}/start` - 开始投产
- PUT `/api/work-order/{id}/next` - 工单状态流转
- PUT `/api/work-order/{id}/suspend` - 暂停工单
- PUT `/api/work-order/{id}/resume` - 恢复工单
- PUT `/api/work-order/{id}/cancel` - 取消工单
- PUT `/api/work-order/{id}/defective` - 更新次品数据
- GET `/api/work-order/list?status=xx` - 按状态查询

### 生产制造成本汇总接口
- POST `/api/cost-summary/generate?year=xx&quarter=xx` - 生成季度报表
- GET `/api/cost-summary/report` - 查询季度报表
- GET `/api/cost-summary/work-order-details` - 查询工单明细

## 项目结构
```
bearing-production/
├── src/main/java/com/bearing/production/
│   ├── annotation/          # 自定义注解
│   ├── aspect/              # AOP切面
│   ├── common/              # 公共类
│   ├── config/              # 配置类
│   ├── context/             # 上下文
│   ├── controller/          # 控制器
│   ├── dto/                 # 数据传输对象
│   ├── entity/              # 实体类
│   ├── enums/               # 枚举类
│   ├── exception/           # 异常处理
│   ├── interceptor/         # 拦截器
│   ├── mapper/              # 数据访问层
│   ├── service/             # 业务逻辑层
│   ├── task/                # 定时任务
│   ├── util/                # 工具类
│   ├── vo/                  # 视图对象
│   └── BearingProductionApplication.java  # 启动类
└── src/main/resources/
    ├── application.yml      # 配置文件
    └── schema.sql           # 数据库脚本
```

## 工单状态说明
| 状态码 | 状态名称 |
|--------|----------|
| 0 | 已创建 |
| 1 | 待投产 |
| 2 | 圆钢切断下料 |
| 3 | 中频预热处理 |
| 4 | 闭式冷锻成型 |
| 5 | 精整修边 |
| 6 | 热处理调质 |
| 7 | 精密研磨分选 |
| 8 | 成品入库 |
| 9 | 已暂停 |
| 10 | 已取消 |

## 角色权限说明
| 角色编码 | 角色名称 | 说明 |
|----------|----------|------|
| 1 | 原料采购员 | 管理原料库存、防锈处理 |
| 2 | 锻造工艺员 | 管理品类、创建工单、生成报表 |
| 3 | 产线组长 | 控制生产流程、状态流转 |
| 4 | 品质巡检员 | 更新次品数据 |
| 5 | 管理员 | 全部权限 |
