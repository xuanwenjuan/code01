# 水族原生造景素材供需管理系统后端

## 技术栈

- Spring Boot 3.2.x
- MyBatis Plus 3.5.x
- MySQL 8.0+
- Redis
- JWT
- 定时任务

## 功能模块

### 1. 造景素材类目模块
- 多级分类管理（沉木素材、奇石石材、水生底砂、活体水草）
- 类目新增、编辑、删除
- 冷门素材停采下架
- 商城展示排序
- 无限级树形递归查询

### 2. 原生素材库存模块
- 素材产地、尺寸规格、品相等级管理
- 现货/紧缺/断货状态管理
- 唯一批次编号生成
- 易腐水草类素材临近损耗自动预警

### 3. 定制造景搭建工单
- 客户造景方案敲定
- 素材选配组合
- 缸内布局搭建
- 水质调试
- 成品打包发货
- 超时未确认方案工单自动搁置
- 工单状态自动流转

### 4. 造景成本营收模块
- 按素材品类统计采购支出
- 组合搭配损耗统计
- 人工造景费用统计
- 定制订单利润计算
- 自动生成经营报表
- 工单用料明细与财务对账溯源

## 角色权限

1. 造景师 (SCAPER)
2. 素材采购 (PURCHASER)
3. 仓储打理 (WAREHOUSE)
4. 平台管理 (ADMIN)

## 快速开始

### 1. 数据库初始化

执行 `src/main/resources/schema.sql` 初始化数据库

### 2. 修改配置

修改 `application.yml 中的数据库和Redis连接信息

### 3. 启动项目

```bash
mvn spring-boot:run
```

### 4. 默认账号

| 用户名 | 密码 | 角色 |
|--------|------|------|
| admin | admin123 | 平台管理 |
| scaper01 | 123456 | 造景师 |
| buyer01 | 123456 | 素材采购 |
| keeper01 | 123456 | 仓储打理 |

## API接口

### 认证接口

- POST /api/auth/login - 登录

### 素材类目接口

- GET /api/category/tree - 树形类目列表
- GET /api/category/{id} - 类目详情
- POST /api/category - 新增类目
- PUT /api/category/{id} - 编辑类目
- DELETE /api/category/{id} - 删除类目
- PUT /api/category/{id}/offline - 类目下架

### 素材库存接口

- GET /api/stock - 库存列表
- GET /api/stock/warning - 损耗预警列表
- GET /api/stock/{id} - 库存详情
- POST /api/stock - 新增库存
- PUT /api/stock/{id} - 编辑库存
- DELETE /api/stock/{id} - 删除库存

### 工单接口

- GET /api/order - 工单列表
- GET /api/order/{id} - 工单详情
- POST /api/order - 新建工单
- PUT /api/order/{id}/status - 更新工单状态
- DELETE /api/order/{id} - 删除工单

### 财务接口

- GET /api/finance - 财务记录列表
- POST /api/finance - 新增财务记录
- GET /api/finance/report - 获取经营报表
