# 工业散热铝型材挤压生产管控后端服务

## 技术栈
- **SpringBoot 3.x**
- **MyBatis-Plus 3.5.5**
- **MySQL 8.x**
- **Redis**
- **JWT**
- **定时任务**

## 项目特点
- 遵循 Restful 接口规范
- 统一全局异常捕获
- 注解实现全量请求参数校验
- 划分多级权限控制
- 生产单据状态自动流转
- 多表数据一致性保障
- 全程留存车间生产操作日志

## 功能模块

### 1. 用户权限模块
**角色划分：**
- 原料采购员 (1)
- 挤压工艺员 (2)
- 产线班组长 (3)
- 成品质检员 (4)
- 管理员 (5)

**主要接口：**
- `POST /api/auth/login` - 用户登录
- `POST /api/auth/register` - 用户注册

### 2. 铝型材产品类目模块
**多级分类：**
- 大功率散热器型材
- 设备框架型材
- 异形散热条
- 新能源专用铝排

**主要接口：**
- `POST /api/category` - 新增类目
- `PUT /api/category/{id}/offline` - 旧款型材下线
- `PUT /api/category/{id}/priority` - 排产优先级调整
- `GET /api/category/tree` - 无限级树形递归查询

### 3. 铝棒原料仓储模块
**原料类型：**
- 6063国标铝棒
- 6061工业铝棒
- 高纯合金铝坯
- 表面处理助剂

**主要接口：**
- `POST /api/stock` - 原料入库
- `GET /api/stock/warning` - 库存预警列表
- 自动生成原料唯一批次编码
- 露天堆放原料自动设置氧化预警日期

### 4. 热挤压成型生产工单模块
**工序流程：**
1. 铝棒加温预热
2. 模具挤压成型
3. 在线水冷调直
4. 定尺切割
5. 端面精切
6. 表面氧化处理
7. 成品分拣入库

**主要功能：**
- 工单状态全自动流转
- 超期7天未启动工单自动暂停（每日凌晨2点执行）
- 工单恢复功能

**主要接口：**
- `POST /api/workorder` - 创建工单
- `PUT /api/workorder/{id}/next` - 进入下一工序
- `PUT /api/workorder/{id}/resume` - 恢复暂停工单

### 5. 型材生产利润核算模块
**成本构成：**
- 铝棒原料消耗
- 挤压模具损耗
- 加温设备能耗
- 一线生产工时
- 尺寸偏差报废损失

**主要功能：**
- 按型材品类统计
- 自动生成月度生产经营报表
- 支持工单用料明细与财务成本对账溯源

**主要接口：**
- `POST /api/cost/calculate/{workOrderId}` - 成本核算
- `GET /api/cost/report?year=&month=` - 月度经营报表

### 6. 操作日志模块
**主要接口：**
- `GET /api/log/page` - 操作日志分页查询

## 快速开始

### 1. 环境准备
- JDK 17+
- MySQL 8.x
- Redis

### 2. 数据库初始化
```bash
mysql -uroot -p < src/main/resources/schema.sql
```

### 3. 修改配置
编辑 `src/main/resources/application.yml`，修改数据库和Redis连接信息。

### 4. 启动项目
```bash
mvn spring-boot:run
```

### 5. 测试账号
| 用户名 | 密码 | 角色 |
|--------|------|------|
| admin | 123456 | 管理员 |
| purchaser | 123456 | 采购员 |
| engineer | 123456 | 工艺员 |
| leader | 123456 | 班组长 |
| inspector | 123456 | 质检员 |

## 项目结构
```
src/main/java/com/aluminum/extrusion/
├── annotation/          # 自定义注解
├── common/              # 通用类
├── config/              # 配置类
├── controller/          # 控制器
├── dto/                 # 数据传输对象
├── entity/              # 实体类
├── enums/               # 枚举类
├── exception/           # 异常处理
├── interceptor/         # 拦截器
├── mapper/              # 数据访问层
├── service/             # 业务逻辑层
├── task/                # 定时任务
├── util/                # 工具类
├── vo/                  # 视图对象
└── ExtrusionManagementApplication.java
```
