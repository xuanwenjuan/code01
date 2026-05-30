# 纸质包装制品生产管控后端服务

## 项目简介

本项目是一个基于SpringBoot3的纸质包装制品生产管控系统，提供从原材料采购、工艺设计、生产管理到质量巡检的全流程数字化管控能力。

## 技术栈

- **框架**: SpringBoot 3.2.5
- **ORM**: MyBatis-Plus 3.5.5
- **数据库**: MySQL 8.0+
- **缓存**: Redis
- **认证**: JWT
- **定时任务**: Spring Scheduling
- **接口文档**: Knife4j 4.4.0
- **工具库**: Hutool 5.8.26
- **构建工具**: Maven
- **JDK版本**: 17

## 核心功能模块

### 1. 包装产品分类模块
- 快递纸箱、食品礼盒、彩印包装盒、定制纸质内衬多级分类
- 支持新增品类、老旧款式停止排产
- 客户订单优先级调整
- 无限级树形递归查询

### 2. 纸品原材仓储模块
- 登记牛皮纸、白板纸、瓦楞原纸、印刷油墨、粘合胶水
- 划分正常库存、库存预警、暂停采购状态
- 生成物料唯一批次编号
- 防潮纸张设置仓储存放提醒

### 3. 纸品成型生产工单
- 原纸裁切分条、瓦楞裱合、模切成型、彩色印刷、粘合折叠、外观质检、成品打包入库全流程
- 超时未安排生产工单自动搁置
- 工单状态自动流转

### 4. 生产费用核算模块
- 统计原纸耗材用量、印刷设备损耗、水电能耗、一线操作工工时、裁切残料报废成本
- 自动生成月度生产报表
- 支持工单用料明细对接财务完成成本核对

## 岗位权限

| 岗位 | 权限编码 | 职责 |
|------|---------|------|
| 系统管理员 | ADMIN | 系统最高权限，用户管理、角色配置 |
| 采购员 | PURCHASE | 原材料采购、库存管理、出入库操作 |
| 工艺设计师 | PROCESS | 产品分类管理、工艺设计、BOM制定 |
| 产线管理员 | PRODUCTION | 生产工单管理、工序进度跟踪、工单排产 |
| 质量巡检员 | QUALITY | 质量检验、不良品记录、巡检报告 |

## 项目结构

```
paper-production/
├── src/main/java/com/paper/production/
│   ├── annotation/          # 自定义注解
│   ├── aspect/             # AOP切面
│   ├── common/             # 通用类
│   │   ├── BaseEntity.java
│   │   ├── PageQuery.java
│   │   ├── PageResult.java
│   │   ├── Result.java
│   │   └── ResultCode.java
│   ├── config/             # 配置类
│   │   ├── MybatisPlusConfig.java
│   │   ├── RedisConfig.java
│   │   └── WebConfig.java
│   ├── controller/         # 控制器
│   │   ├── cost/
│   │   ├── material/
│   │   ├── product/
│   │   ├── system/
│   │   └── workorder/
│   ├── dto/                # 数据传输对象
│   │   ├── cost/
│   │   ├── material/
│   │   ├── product/
│   │   ├── system/
│   │   └── workorder/
│   ├── entity/             # 实体类
│   │   ├── cost/
│   │   ├── material/
│   │   ├── product/
│   │   ├── system/
│   │   └── workorder/
│   ├── enums/              # 枚举类
│   ├── exception/          # 异常处理
│   ├── interceptor/        # 拦截器
│   ├── mapper/             # Mapper接口
│   │   ├── cost/
│   │   ├── material/
│   │   ├── product/
│   │   ├── system/
│   │   └── workorder/
│   ├── service/            # 服务层
│   │   ├── cost/
│   │   ├── material/
│   │   ├── product/
│   │   ├── system/
│   │   └── workorder/
│   ├── task/               # 定时任务
│   ├── utils/              # 工具类
│   └── PaperProductionApplication.java
├── src/main/resources/
│   ├── sql/
│   │   └── paper_production.sql
│   └── application.yml
└── pom.xml
```

## 快速开始

### 1. 环境准备
- JDK 17+
- MySQL 8.0+
- Redis 6.0+
- Maven 3.8+

### 2. 数据库初始化
```bash
mysql -u root -p < src/main/resources/sql/paper_production.sql
```

### 3. 修改配置
编辑 `src/main/resources/application.yml`，修改数据库和Redis连接信息。

### 4. 启动项目
```bash
mvn clean install
mvn spring-boot:run
```

### 5. 访问接口文档
启动后访问: http://localhost:8080/api/doc.html

### 6. 默认账号
- 用户名: admin
- 密码: admin123

## 工单状态流转

```
待排产(1) → 已排产(2) → 裁切分条(3) → 瓦楞裱合(4) → 模切成型(5) 
     ↓            ↓           ↓            ↓            ↓
  已搁置(11)  彩色印刷(6) → 粘合折叠(7) → 外观质检(8) → 成品打包(9) → 已完成(10)
                                                              ↓
                                                          已取消(12)
```

## 定时任务

| 任务 | 执行时间 | 说明 |
|------|---------|------|
| 超时工单自动搁置 | 每天凌晨1点 | 24小时未排产的工单自动搁置 |
| 库存预警检查 | 每天凌晨2点 | 检查库存状态，更新预警信息 |
| 月度报表生成 | 每月1号凌晨3点 | 自动生成上月生产报表 |
| 防潮材料提醒 | 每天上午9点 | 检查即将到期的防潮材料 |

## 接口规范

所有接口遵循RESTful规范：
- GET: 查询
- POST: 新增
- PUT: 修改
- DELETE: 删除

统一返回格式：
```json
{
  "code": 200,
  "message": "操作成功",
  "data": {}
}
```

## 业务流程说明

### 从原料入库到成品出库完整流程

```
原料采购 → 原料入库 → 生成批次 → 库存管理
                        ↓
                  工单创建 → 工艺设计 → 物料清单
                        ↓
                  工单排产 → 领料出库 → 扣减库存
                        ↓
    裁切分条 → 瓦楞裱合 → 模切成型 → 彩色印刷 → 粘合折叠 → 外观质检 → 成品打包
                        ↓
                  工单完成 → 成本核算 → 成品入库
                        ↓
                  月度报表 → 财务对账
```

### 各模块核心接口

#### 1. 产品分类模块
| 接口 | 方法 | 权限 | 说明 |
|------|------|------|------|
| /api/product/category | POST | PROCESS/ADMIN | 新增分类 |
| /api/product/category/tree | GET | ALL | 获取分类树 |
| /api/product/category/stop/{id} | PUT | PROCESS/PRODUCTION/ADMIN | 停止排产 |
| /api/product/category/priority/{id}/{priority} | PUT | PROCESS/PRODUCTION/ADMIN | 调整优先级 |

#### 2. 原材仓储模块
| 接口 | 方法 | 权限 | 说明 |
|------|------|------|------|
| /api/material | POST | PURCHASE/ADMIN | 新增物料 |
| /api/material/inbound | POST | PURCHASE/ADMIN | 物料入库 |
| /api/material/outbound | POST | PURCHASE/PRODUCTION/ADMIN | 物料出库 |
| /api/material/warning/list | GET | ALL | 获取预警物料 |
| /api/material/statistics | GET | ALL | 获取库存统计 |
| /api/material/page | POST | ALL | 分页查询物料 |

#### 3. 生产工单模块
| 接口 | 方法 | 权限 | 说明 |
|------|------|------|------|
| /api/work-order | POST | PROCESS/PRODUCTION/ADMIN | 创建工单 |
| /api/work-order/schedule/{id} | PUT | PRODUCTION/ADMIN | 排产工单 |
| /api/work-order/process/start | POST | PRODUCTION/QUALITY/ADMIN | 开始工序 |
| /api/work-order/process/finish | POST | PRODUCTION/QUALITY/ADMIN | 完成工序 |
| /api/work-order/progress/{id} | GET | ALL | 获取工序进度 |
| /api/work-order/statistics | GET | ALL | 获取工单统计 |
| /api/work-order/statistics/daily | GET | ALL | 获取每日统计 |

#### 4. 费用核算模块
| 接口 | 方法 | 权限 | 说明 |
|------|------|------|------|
| /api/cost/calculate/{workOrderId} | POST | ADMIN | 核算工单成本 |
| /api/cost/report/{reportMonth} | POST | ADMIN | 生成月度报表 |
| /api/cost/report/list | GET | ALL | 获取报表列表 |

#### 5. 数据看板
| 接口 | 方法 | 权限 | 说明 |
|------|------|------|------|
| /api/dashboard/overview | GET | ALL | 获取综合统计 |
| /api/dashboard/material | GET | ALL | 仓储看板 |
| /api/dashboard/production | GET | ALL | 生产看板 |
| /api/dashboard/cost | GET | ALL | 成本看板 |

## 权限体系说明

### 角色权限矩阵

| 功能模块 | 管理员 | 采购员 | 工艺设计师 | 产线管理员 | 质量巡检员 |
|---------|--------|--------|-----------|-----------|-----------|
| 用户管理 | ✅ | ❌ | ❌ | ❌ | ❌ |
| 产品分类管理 | ✅ | ❌ | ✅ | ✅(部分) | ❌ |
| 物料信息管理 | ✅ | ✅ | ❌ | ❌ | ❌ |
| 物料入库 | ✅ | ✅ | ❌ | ❌ | ❌ |
| 物料出库 | ✅ | ✅ | ❌ | ✅ | ❌ |
| 工单创建 | ✅ | ❌ | ✅ | ✅ | ❌ |
| 工单排产 | ✅ | ❌ | ❌ | ✅ | ❌ |
| 工序操作 | ✅ | ❌ | ❌ | ✅ | ✅ |
| 成本核算 | ✅ | ❌ | ❌ | ❌ | ❌ |
| 报表生成 | ✅ | ❌ | ❌ | ❌ | ❌ |
| 数据查询 | ✅ | ✅ | ✅ | ✅ | ✅ |

## 开发规范

1. 遵循阿里巴巴Java开发规范
2. 使用注解实现参数校验
3. 统一全局异常捕获
4. 操作日志自动记录
5. 多表操作使用事务保证数据一致性
6. 敏感接口必须添加权限注解
7. 所有数据库操作使用MyBatis-Plus

## 部署说明

### 生产环境部署
```bash
# 打包
mvn clean package -Dmaven.test.skip=true

# 运行
java -jar target/paper-production-1.0.0.jar

# 或使用Docker
docker build -t paper-production:1.0.0 .
docker run -d -p 8080:8080 --name paper-production paper-production:1.0.0
```

### 配置文件说明
- `application.yml`: 主配置文件
- 数据库连接配置在 `spring.datasource` 节点
- Redis连接配置在 `spring.data.redis` 节点
- JWT配置在 `jwt` 节点
