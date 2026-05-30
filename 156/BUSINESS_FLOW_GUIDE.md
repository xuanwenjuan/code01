# 消防器材生产管控系统 - 业务流程使用指南

## 目录
1. [系统角色说明](#系统角色说明)
2. [完整业务流程演示](#完整业务流程演示)
3. [核心API接口列表](#核心api接口列表)
4. [数据检索能力说明](#数据检索能力说明)

---

## 系统角色说明

| 角色编码 | 角色名称 | 主要职责 | 可访问模块 |
|---------|---------|---------|-----------|
| ADMIN | 系统管理员 | 系统配置、用户管理、全面数据查询 | 所有模块 |
| PURCHASE | 物资采购 | 物资信息管理、采购入库、批次管理 | 主材仓储模块 |
| PROCESS | 工艺编制 | 生产工艺制定、工单创建、工序配置 | 生产工单模块 |
| PRODUCTION | 生产主管 | 工单排产、领料、工序执行、进度跟踪 | 生产工单、生产成本 |
| QUALITY | 安全质检 | 质量检验、复检管理、质检记录 | 主材仓储、生产工单 |

---

## 完整业务流程演示

### 前置准备
1. 启动项目，访问 `http://localhost:8080/api/doc.html` 查看API文档
2. 使用账号登录获取Token，所有后续接口需在Header中携带 `Authorization: Bearer <token>`

### 流程步骤

#### 步骤1：用户登录（任何角色）
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "123456"
}
```
**响应**：
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "userId": 1,
    "username": "admin",
    "realName": "系统管理员",
    "roleCode": "ADMIN"
  }
}
```

---

#### 步骤2：物资入库（采购专员：purchase）
```http
POST /api/material/stock-in
Content-Type: application/json
Authorization: Bearer <token>

{
  "materialId": 1,
  "quantity": 1000,
  "productionDate": "2026-05-15",
  "expiryDate": "2027-05-15",
  "inspectionReport": "质检报告QR20260515001",
  "supplier": "山东干粉厂",
  "warehouseLocation": "A区-01-01",
  "remark": "ABC干粉原料入库"
}
```

---

#### 步骤3：创建生产工单（工艺工程师：process）
```http
POST /api/work-order
Content-Type: application/json
Authorization: Bearer <token>

{
  "productId": 5,
  "productName": "干粉灭火器",
  "categoryId": "1",
  "categoryName": "灭火器材",
  "planQuantity": 100,
  "planStartTime": "2026-05-18T08:00:00",
  "planEndTime": "2026-05-20T18:00:00",
  "priority": 1,
  "remark": "常规生产订单",
  "materials": [
    {
      "materialId": 3,
      "materialCode": "MAT-003",
      "materialName": "合金钢罐体",
      "specification": "2mm厚度",
      "unit": "个",
      "requiredQuantity": 100
    },
    {
      "materialId": 1,
      "materialCode": "MAT-001",
      "materialName": "ABC干粉原料",
      "specification": "50kg/袋",
      "unit": "kg",
      "requiredQuantity": 500
    },
    {
      "materialId": 4,
      "materialCode": "MAT-004",
      "materialName": "碳钢阀门",
      "specification": "DN15",
      "unit": "个",
      "requiredQuantity": 100
    }
  ]
}
```

---

#### 步骤4：开始第一道工序（生产主管：production）
```http
POST /api/work-order/process/start
Content-Type: application/json
Authorization: Bearer <token>

{
  "workOrderId": 1,
  "processCode": "STAMPING",
  "operationContent": "开始罐体冲压成型工序"
}
```

---

#### 步骤5：工单领料（生产主管：production）
```http
POST /api/work-order/pick-material
Content-Type: application/json
Authorization: Bearer <token>

{
  "workOrderId": 1,
  "materialId": 3,
  "batchId": 1,
  "quantity": 100,
  "remark": "罐体冲压领料"
}
```

---

#### 步骤6：完成工序（逐道完成8道工序）
```http
POST /api/work-order/process/complete
Content-Type: application/json
Authorization: Bearer <token>

{
  "workOrderId": 1,
  "processCode": "STAMPING",
  "inspectionResult": "冲压成型合格，100个全部达标",
  "qualifiedQuantity": 100,
  "scrapQuantity": 0,
  "remark": "第一道工序完成"
}
```

*重复此操作，依次完成：耐压密封处理、灭火剂灌装、阀门组装调试、防火性能检测、压力试压核验、防伪贴标、成品入库*

---

#### 步骤7：查看工单进度
```http
GET /api/work-order/1/progress
Authorization: Bearer <token>
```
**响应**：
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "orderNo": "WO20260517001",
    "productName": "干粉灭火器",
    "planQuantity": 100,
    "actualQuantity": 98,
    "qualifiedQuantity": 96,
    "scrapQuantity": 2,
    "status": 4,
    "statusName": "已完成",
    "totalProcesses": 8,
    "completedProcesses": 8,
    "progress": 100.00,
    "currentProcess": "已完成",
    "processes": [...]
  }
}
```

---

#### 步骤8：核算工单成本
```http
POST /api/production-cost/calculate/1
Authorization: Bearer <token>
```

---

#### 步骤9：查看成本分析报表
```http
GET /api/production-cost/analysis?startDate=2026-05-01&endDate=2026-05-31
Authorization: Bearer <token>
```
**响应**：
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "totalCost": 14625.00,
    "totalWorkOrders": 1,
    "totalQuantity": 96,
    "avgCostPerUnit": 152.34,
    "costBreakdown": {
      "materialCost": 10584.00,
      "materialCostRatio": 72.37,
      "equipmentCost": 480.00,
      "equipmentCostRatio": 3.28,
      "energyCost": 240.00,
      "energyCostRatio": 1.64,
      "laborCost": 2880.00,
      "laborCostRatio": 19.69,
      "scrapCost": 441.00,
      "scrapCostRatio": 3.02
    },
    "categoryCosts": [
      {
        "categoryName": "灭火器材",
        "totalCost": 14625.00,
        "ratio": 100.00,
        "workOrderCount": 1
      }
    ],
    "topMaterialCosts": [
      {
        "materialName": "ABC干粉原料",
        "totalCost": 4080.00,
        "totalQuantity": 480.00,
        "ratio": 27.90
      },
      {
        "materialName": "合金钢罐体",
        "totalCost": 4500.00,
        "totalQuantity": 100.00,
        "ratio": 30.77
      }
    ]
  }
}
```

---

## 核心API接口列表

### 主材仓储模块

| 接口 | 方法 | 说明 | 权限 |
|-----|------|------|------|
| `/api/material` | POST | 新增物资 | PURCHASE, ADMIN |
| `/api/material` | PUT | 修改物资 | PURCHASE, ADMIN |
| `/api/material/{id}` | DELETE | 删除物资 | PURCHASE, ADMIN |
| `/api/material/{id}` | GET | 获取物资详情 | 所有登录用户 |
| `/api/material/page` | POST | 分页查询物资 | 所有登录用户 |
| `/api/material/search` | GET | 多条件搜索物资 | 所有登录用户 |
| `/api/material/stock-in` | POST | 物资入库 | PURCHASE, ADMIN |
| `/api/material/stock-records` | GET | 库存变动记录 | 所有登录用户 |
| `/api/material/warning` | GET | 库存预警列表 | 所有登录用户 |
| `/api/material/recheck-soon` | GET | 即将复检物资 | 所有登录用户 |
| `/api/material/{materialId}/batches` | GET | 物资批次列表 | 所有登录用户 |

### 生产工单模块

| 接口 | 方法 | 说明 | 权限 |
|-----|------|------|------|
| `/api/work-order` | POST | 创建工单 | PROCESS, ADMIN |
| `/api/work-order` | PUT | 修改工单 | PROCESS, ADMIN |
| `/api/work-order/{id}` | DELETE | 删除工单 | PROCESS, ADMIN |
| `/api/work-order/{id}` | GET | 获取工单详情 | 所有登录用户 |
| `/api/work-order/page` | POST | 分页查询工单 | 所有登录用户 |
| `/api/work-order/search` | GET | 多条件搜索工单 | 所有登录用户 |
| `/api/work-order/{id}/progress` | GET | 获取工单进度 | 所有登录用户 |
| `/api/work-order/process/start` | POST | 开始工序 | PRODUCTION, ADMIN |
| `/api/work-order/process/complete` | POST | 完成工序 | PRODUCTION, QUALITY, ADMIN |
| `/api/work-order/pick-material` | POST | 工单领料 | PRODUCTION, ADMIN |
| `/api/work-order/return-material` | POST | 工单退料 | PRODUCTION, ADMIN |
| `/api/work-order/{id}/pause` | PUT | 暂停工单 | PRODUCTION, ADMIN |
| `/api/work-order/{id}/resume` | PUT | 恢复工单 | PRODUCTION, ADMIN |
| `/api/work-order/{id}/cancel` | PUT | 取消工单 | PROCESS, ADMIN |

### 生产成本模块

| 接口 | 方法 | 说明 | 权限 |
|-----|------|------|------|
| `/api/production-cost/calculate/{workOrderId}` | POST | 核算工单成本 | ADMIN, PRODUCTION |
| `/api/production-cost/{id}` | GET | 获取成本详情 | ADMIN, PRODUCTION |
| `/api/production-cost/page` | POST | 分页查询成本 | ADMIN, PRODUCTION |
| `/api/production-cost/statistics` | GET | 成本统计数据 | ADMIN, PRODUCTION |
| `/api/production-cost/analysis` | GET | 成本分析报表 | ADMIN, PRODUCTION |
| `/api/production-cost/date-range` | GET | 按日期范围查询 | ADMIN, PRODUCTION |
| `/api/production-cost/export/material/{workOrderId}` | GET | 导出用料明细 | ADMIN, PRODUCTION |

---

## 数据检索能力说明

### 1. 物资多条件检索
**接口**：`GET /api/material/search`

**参数**：
- `keyword`: 关键词搜索（编码、名称、规格）
- `materialType`: 物资类型
- `stockStatus`: 库存状态（1-正常 2-预警）

**示例**：
```
GET /api/material/search?keyword=干粉&materialType=灭火剂原料&stockStatus=1
```

### 2. 工单多条件检索
**接口**：`GET /api/work-order/search`

**参数**：
- `keyword`: 关键词搜索（工单号、产品名称）
- `status`: 工单状态（0-待排产 1-生产中 2-暂停 3-已完成 4-已取消）
- `productCategory`: 产品分类ID

### 3. 库存变动记录查询
**接口**：`GET /api/material/stock-records`

**参数**：
- `materialId`: 物资ID
- `recordType`: 记录类型（1-入库 2-出库 3-退库）
- `pageNum`: 页码
- `pageSize`: 每页条数

### 4. 成本多维分析
**接口**：`GET /api/production-cost/analysis`

**返回数据包含**：
- 总成本趋势（月度）
- 成本构成占比（饼图数据）
- 分类成本统计
- Top10物资成本排名

---

## 定时任务说明

| 任务 | 执行时间 | 说明 |
|-----|---------|------|
| 工单自动暂停 | 每天 02:00 | 自动暂停超出3天未投产的工单 |
| 成本自动核算 | 每天 02:30 | 自动核算前一天完成工单的成本 |
| 月度报表生成 | 每月1日 03:00 | 自动生成上月生产经营报表 |

---

## 快速测试命令

### 导入演示数据
```bash
mysql -uroot -p fire_control < src/main/resources/sql/business_demo_data.sql
```

### 查询演示数据
```sql
-- 查看库存变动记录
SELECT * FROM material_stock_record;

-- 查看工单进度
SELECT * FROM work_order WHERE id = 1;

-- 查看成本数据
SELECT * FROM production_cost;
```
