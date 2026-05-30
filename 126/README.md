# 叶轮铸造生产管理系统

## 技术栈
- Spring Boot 3.x
- MyBatis-Plus
- MySQL
- Redis
- JWT
- 定时任务

## 项目架构

### 功能模块

#### 1. 用户角色权限模块
- 多角色支持：系统管理员、物料采购员、铸造工艺员、生产班组长、品质巡检员
- JWT认证登录
- 统一权限拦截

#### 2. 叶轮产品类目模块
- 无限级树形分类结构
- 类目新增、编辑、删除
- 老旧规格下架
- 生产优先级排序
- 树形递归查询

#### 3. 铸造原辅物料模块
- 物料品类牌号管理（生铁、合金、铸造砂、粘结剂、淬火助剂）
- 库存状态管理（充足、预警、停止采购）
- 物料唯一批次编号
- 易结块辅料存放时效预警
- 库存扣减与预警

#### 4. 铸造加工生产工单模块
- 全流程状态流转：待开炉 -> 熔炼浇筑中 -> 砂型成型中 -> 冷却脱壳中 -> 粗打磨修整中 -> 动平衡校正中 -> 防锈处理中 -> 已入库
- 超时未开炉工单自动冻结（定时任务）
- 工单物料使用记录
- 全流程生产操作日志
- 实际产量、次品数量记录

#### 5. 铸造生产成本台账模块
- 按叶轮品类统计生产成本
- 原料成本、砂料耗材成本、炉火能耗成本、人工工时成本、次品损耗成本统计
- 自动计算总成本
- 支持按日期范围查询
- 工单用料明细与财务成本对账溯源

## 数据库初始化

执行 `src/main/resources/sql/init.sql` 脚本初始化数据库

默认用户:
- 用户名: admin
- 密码: admin123

## 项目配置

修改 `src/main/resources/application.yml` 配置文件：
- 数据库连接配置
- Redis连接配置
- JWT配置

## 启动项目

```bash
mvn spring-boot:run
```

## API接口

### 认证接口
- `POST /api/auth/login` - 登录
- `POST /api/auth/register` - 注册

### 用户管理接口
- `GET /api/users` - 用户列表
- `GET /api/users/{id}` - 用户详情
- `GET /api/users/role/{role}` - 按角色查询用户
- `GET /api/users/process` - 工艺员列表
- `GET /api/users/team-leaders` - 班组长列表
- `GET /api/users/inspectors` - 巡检员列表
- `PUT /api/users` - 更新用户
- `DELETE /api/users/{id}` - 删除用户

### 产品类目接口
- `GET /api/product-categories/tree` - 树形分类
- `GET /api/product-categories` - 分类列表
- `GET /api/product-categories/{id}` - 分类详情
- `POST /api/product-categories` - 新增分类
- `PUT /api/product-categories` - 更新分类
- `PUT /api/product-categories/{id}/status` - 更新状态
- `DELETE /api/product-categories/{id}` - 删除分类

### 物料管理接口
- `GET /api/materials` - 物料列表
- `GET /api/materials/warning` - 库存预警列表
- `GET /api/materials/clumping-warning` - 结块预警列表
- `GET /api/materials/{id}` - 物料详情
- `POST /api/materials` - 新增物料
- `PUT /api/materials` - 更新物料
- `PUT /api/materials/{id}/stock` - 更新库存
- `DELETE /api/materials/{id}` - 删除物料

### 工单管理接口
- `GET /api/work-orders` - 工单列表
- `GET /api/work-orders/{id}` - 工单详情
- `POST /api/work-orders` - 创建工单
- `POST /api/work-orders/process` - 工单状态流转
- `POST /api/work-orders/{id}/freeze` - 冻结工单
- `DELETE /api/work-orders/{id}` - 删除工单

### 成本台账接口
- `GET /api/cost-accounting` - 台账列表（支持日期范围）
- `GET /api/cost-accounting/date/{date}` - 按日期查询
- `GET /api/cost-accounting/{id}` - 台账详情
- `POST /api/cost-accounting` - 新增台账
- `PUT /api/cost-accounting` - 更新台账
- `DELETE /api/cost-accounting/{id}` - 删除台账

## 特色功能
1. 遵循Restful接口规范
2. 统一全局异常处理
3. 注解完成全量参数校验
4. 多角色权限控制
5. 业务单据状态自动流转
6. 多表数据一致性保障（事务）
7. 全流程生产操作日志
8. 定时任务自动冻结超时工单
9. 库存预警、结块预警机制
