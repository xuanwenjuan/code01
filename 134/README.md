# 工业齿轮精密滚齿加工管控后端服务

## 项目简介

基于 SpringBoot3 + MyBatis-Plus 的工业齿轮精密滚齿加工管控系统后端服务，实现齿轮产品类目管理、坯料库存管理、生产工单管理、生产成本统计等核心功能。

## 技术栈

- **框架**: SpringBoot 3.2.x
- **ORM**: MyBatis-Plus 3.5.5
- **数据库**: MySQL 8.0
- **缓存**: Redis
- **认证**: JWT
- **AOP**: 操作日志切面
- **其他**: Lombok、Hutool

## 功能模块

### 1. 齿轮产品类目模块
- 直齿圆柱齿轮、斜齿传动齿轮、伞齿锥齿轮、减速箱非标齿轮多级分类
- 类目新增、编辑、删除
- 老旧齿型下线停产
- 订单排产优先级调整
- 无限级树形递归查询

### 2. 齿轮坯料库存模块
- 45号钢坯料、合金结构钢坯、调质精锻坯、表面渗碳辅料登记
- 入库单管理（采购入库、生产入库、盘点入库、退货入库）
- 出库单管理（生产领料、销售出库、盘点出库、报废出库）
- 盘点单管理（全盘、抽盘）
- 移库管理
- 库存流水追踪
- 库存充足/预警/停止采购状态管理
- 生成唯一批次编号
- 长周期存放坯料防锈时效提醒

### 3. BOM与工艺路线模块
- BOM清单管理（多级BOM）
- BOM版本管理
- 工艺路线配置
- 工序标准工时、标准工价设置
- 工位、设备管理

### 4. 滚齿加工生产工单
- 坯料粗车成型 → 基准孔定位 → 数控滚齿加工 → 齿面倒角修整 → 渗碳淬火 → 齿向精磨 → 精度检测入库 全流程管理
- 生产报工（良品、不良品）
- 质量检验（首检、巡检、末检、成品检）
- 超时未开工工单自动暂停（定时任务）
- 工单状态自动流转

### 5. 生产成本统计模块
- 按齿轮型号统计坯料原料消耗
- 滚刀刀具损耗统计
- 设备能耗费用统计
- 人工工时统计
- 精度不良报废成本统计
- 自动生成生产报表
- 工单用料明细与财务对账溯源

### 6. 财务模块
- 应收单管理（销售应收、其他应收）
- 应付单管理（采购应付、其他应付）
- 收款单管理
- 付款单管理
- 发票管理（进项、销项）
- 财务核销

### 7. 权限管理模块
- 用户管理
- 角色管理
- 菜单管理
- 角色菜单关联
- 细粒度权限控制
- 数据权限范围控制

### 8. 操作日志模块
- AOP自动记录操作日志
- 记录操作人、操作时间、IP地址、耗时
- 支持操作模块、操作类型分类
- 异常日志记录

## 角色权限

| 角色 | 权限 | 用户名 |
|------|------|--------|
| 超级管理员 (ADMIN) | 全部权限 | admin |
| 采购专员 (PURCHASE) | 库存管理、成本管理、类目管理、应付管理 | purchase |
| 工艺工程师 (PROCESS_ENGINEER) | 类目管理、工单管理、成本管理、BOM管理、工艺路线 | engineer |
| 生产组长 (PRODUCTION_LEADER) | 工单管理、生产报工 | leader |
| 质检人员 (QUALITY_INSPECTOR) | 工序质检、质量检验 | inspector |
| 财务人员 (FINANCE) | 应收应付管理、发票管理、成本结算 | finance |

默认密码: 123456

## 快速开始

### 环境要求
- JDK 17+
- MySQL 8.0+
- Redis 6.0+
- Maven 3.6+

### 数据库初始化
```bash
# 执行数据库脚本
mysql -u root -p < src/main/resources/schema.sql
```

### 配置修改
修改 `application.yml` 中的数据库和Redis连接信息：
```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/gear_manufacture
    username: root
    password: your_password
  data:
    redis:
      host: localhost
      port: 6379
```

### 启动项目
```bash
mvn clean install
mvn spring-boot:run
```

### 访问地址
- 服务端口: 8080
- 接口前缀: /api

## 生产业务流程

### 完整生产流程
```
创建工单
    ↓
开始工序1（粗车成型）
    ↓
生产报工 → 质量检验 → (合格)
    ↓
完成工序1 → 自动流转到工序2
    ↓
开始工序2（基准孔定位）
    ↓
... 重复报工质检流程 ...
    ↓
完成最后工序（精度检测入库）
    ↓
自动生成成品入库单
    ↓
自动计算生产成本
```

### 工单状态流转
- 待开工 → 进行中 → 待转序 → 已完成
- （超时自动暂停）→ 已暂停

## 库存业务流程

### 入库流程
```
创建入库单 → 审核 → 入库确认 → 更新库存 → 生成库存流水
```

### 出库流程
```
创建出库单 → 审核 → 出库确认 → 扣减库存 → 生成库存流水
```

### 盘点流程
```
创建盘点单 → 录入实际库存 → 系统计算差异 → 审核确认 → 调整库存 → 生成库存流水
```

## 财务业务流程

### 应收流程
```
创建应收单 → 客户付款 → 创建收款单 → 核销应收 → 更新应收状态
```

### 应付流程
```
创建应付单 → 付款给供应商 → 创建付款单 → 核销应付 → 更新应付状态
```

## 性能优化

1. **数据库索引优化**: 所有查询字段添加合适索引
2. **Redis缓存**: 热点数据缓存（如类目树形结构、用户信息）
3. **分页查询**: 所有列表接口支持分页
4. **批量操作**: 支持批量入库、批量出库等操作
5. **SQL优化**: 使用MyBatis-Plus Lambda查询，避免N+1问题

## API接口说明

### 认证接口
- `POST /api/auth/login` - 用户登录

### 类目接口
- `GET /api/category/tree` - 获取树形类目列表
- `POST /api/category` - 新增类目
- `PUT /api/category` - 更新类目
- `DELETE /api/category/{id}` - 删除类目
- `PUT /api/category/{id}/offline` - 类目下线
- `PUT /api/category/{id}/priority/{priority}` - 设置优先级

### 库存接口
- `GET /api/stock/list` - 获取库存列表
- `GET /api/stock/warning/rust-proof` - 获取防锈预警列表
- `POST /api/stock` - 新增库存
- `PUT /api/stock` - 更新库存
- `PUT /api/stock/{id}/stop-procurement` - 停止采购

### 入库单接口
- `GET /api/stock-in/list` - 获取入库单列表
- `GET /api/stock-in/{id}` - 获取入库单详情
- `POST /api/stock-in` - 创建入库单
- `PUT /api/stock-in/{id}/audit` - 审核入库单
- `PUT /api/stock-in/{id}/confirm` - 确认入库

### 出库单接口
- `GET /api/stock-out/list` - 获取出库单列表
- `GET /api/stock-out/{id}` - 获取出库单详情
- `POST /api/stock-out` - 创建出库单
- `PUT /api/stock-out/{id}/audit` - 审核出库单
- `PUT /api/stock-out/{id}/confirm` - 确认出库

### 工单接口
- `GET /api/order/list` - 获取工单列表
- `GET /api/order/{orderId}/processes` - 获取工单工序
- `POST /api/order` - 创建工单
- `PUT /api/order/{orderId}/process/{processNo}/start` - 开始工序
- `PUT /api/order/{orderId}/process/{processNo}/complete` - 完成工序

### 报工接口
- `GET /api/report/list` - 获取报工列表
- `POST /api/report` - 提交报工
- `PUT /api/report/{id}/audit` - 审核报工

### 质检接口
- `GET /api/quality/list` - 获取质检单列表
- `POST /api/quality` - 提交质检结果
- `PUT /api/quality/{id}/audit` - 审核质检单

### 成本接口
- `GET /api/cost/list` - 获取成本列表
- `GET /api/cost/order/{orderId}` - 获取工单成本
- `POST /api/cost` - 新增成本记录
- `PUT /api/cost/{id}/settle` - 结算成本
- `POST /api/cost/calculate/{orderId}` - 自动计算工单成本

### BOM接口
- `GET /api/bom/list` - 获取BOM列表
- `GET /api/bom/{id}` - 获取BOM详情
- `POST /api/bom` - 创建BOM
- `PUT /api/bom` - 更新BOM
- `DELETE /api/bom/{id}` - 删除BOM

### 财务接口
- `GET /api/finance/receivable/list` - 获取应收单列表
- `GET /api/finance/payable/list` - 获取应付单列表
- `GET /api/finance/invoice/list` - 获取发票列表
- `POST /api/finance/receive` - 创建收款单
- `POST /api/finance/payment` - 创建付款单

## 定时任务

- **工单超时检查**: 每天凌晨1点执行，自动暂停超期未开工工单

## 项目结构

```
src/main/java/com/gear/mfg/
├── annotation/          # 自定义注解
│   ├── OperationLog.java   # 操作日志注解
│   └── RequireRole.java    # 角色权限注解
├── aspect/              # AOP切面
│   └── OperationLogAspect.java # 操作日志切面
├── common/              # 通用类
│   ├── Result.java         # 统一响应结果
│   └── PageResult.java     # 分页结果
├── config/              # 配置类
│   └── WebConfig.java     # Web配置
├── context/             # 上下文
│   └── UserContext.java   # 用户上下文
├── controller/          # 控制器层
├── dto/                 # 数据传输对象
├── entity/              # 实体类
│   ├── Warehouse.java       # 仓库
│   ├── StockIn.java         # 入库单
│   ├── StockOut.java        # 出库单
│   ├── StockCheck.java      # 盘点单
│   ├── StockTransfer.java   # 移库单
│   ├── StockFlow.java       # 库存流水
│   ├── Bom.java             # BOM
│   ├── BomDetail.java       # BOM明细
│   ├── ProcessRoute.java    # 工艺路线
│   ├── ProductionReport.java # 生产报工
│   ├── QualityCheck.java    # 质量检验
│   ├── FinanceReceivable.java # 应收单
│   ├── FinancePayable.java  # 应付单
│   ├── FinanceReceive.java  # 收款单
│   ├── FinancePayment.java  # 付款单
│   ├── FinanceInvoice.java  # 发票
│   ├── SysRole.java         # 角色
│   ├── SysMenu.java         # 菜单
│   └── OperationLog.java    # 操作日志
├── exception/           # 异常处理
│   ├── BusinessException.java
│   └── GlobalExceptionHandler.java
├── interceptor/         # 拦截器
│   └── JwtInterceptor.java
├── mapper/              # 数据访问层
├── service/             # 业务逻辑层
│   └── ProductionFlowService.java # 生产流程服务
├── task/                # 定时任务
└── util/                # 工具类
    ├── JwtUtil.java
    └── RedisUtil.java
```

## 状态说明

### 工单状态
- 1: 待开工
- 2: 进行中
- 3: 待转序
- 4: 已完成
- 5: 已暂停

### 工序状态
- 0: 待开始
- 1: 进行中
- 2: 已完成

### 库存状态
- 1: 充足
- 2: 预警
- 3: 停止采购

### 入库/出库单状态
- 1: 待审核
- 2: 已确认
- 3: 已驳回

### 检验结果
- PASS: 合格
- FAIL: 不合格
- REPAIR: 待返修

### 应收/应付状态
- 1: 待收/付款
- 2: 部分收/付款
- 3: 已收/付款
- 4: 已核销

### 类目状态
- 1: 启用
- 0: 下线
