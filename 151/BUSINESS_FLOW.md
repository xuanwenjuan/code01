# 文创文具定制生产管控 - 业务流程指南

## 一、整体业务流程图

```
客户需求 → 产品设计 → 工单创建 → 工单排产 → 物料领用 → 生产加工
                                                         ↓
                                               ← 工序流转 ←
                                                         ↓
                    成本核算 ← 成本统计 ← 质检完成 ← 生产完成
```

---

## 二、核心角色职责

| 角色 | 编码 | 主要职责 |
|------|------|---------|
| 采购专员 | PURCHASER | 原料入库、库存管理、采购追踪 |
| 版式设计员 | DESIGNER | 产品设计、需求对接、设计确认 |
| 产线组长 | PRODUCTION_LEADER | 工单排产、生产调度、工序管理 |
| 成品质检员 | INSPECTOR | 质量检验、次品记录、质检报告 |
| 系统管理员 | ADMIN | 全功能权限、系统配置 |

---

## 三、完整业务流程说明

### 流程1：原料入库流程

**适用角色：采购专员**

| 步骤 | 操作 | 说明 |
|------|------|------|
| 1 | 创建入库单 | 填写物料信息、数量、单价、供应商 |
| 2 | 确认入库 | 系统自动：<br>• 生成批次号<br>• 更新库存数量<br>• 记录库存流水<br>• 自动判断库存状态 |
| 3 | 库存监控 | 系统自动预警：<br>• 低于预警线 → 库存预警状态<br>• 纸质原料 → 防潮存储提醒 |

**相关接口：**
- `POST /api/stock/business/inbound` - 创建入库单
- `PUT /api/stock/business/inbound/{id}/confirm` - 确认入库
- `GET /api/material/warning` - 库存预警列表
- `GET /api/material/moisture` - 防潮原料列表

---

### 流程2：生产工单流程

**适用角色：产线组长 + 质检员**

#### 2.1 工单创建与排产

| 步骤 | 操作 | 角色 | 说明 |
|------|------|------|------|
| 1 | 创建工单 | 产线组长 | 填写产品信息、数量、优先级、设计要求 |
| 2 | 工单排产 | 产线组长 | 指定生产时间、生产组长、设计员 |
| 3 | 配置用料 | 产线组长 | 添加工单所需原料清单 |
| 4 | 物料领用 | 产线组长 | 系统自动扣减库存、记录流水 |

#### 2.2 生产执行流程

工单状态流转：`待排产(0)` → `已排产(1)` → `生产中(2)` → `生产完成(3)` → `待质检(4)` → `质检完成(5)` → `已完结(6)`

| 步骤 | 操作 | 说明 |
|------|------|------|
| 1 | 开始工序 | 选择工序开始生产，校验前序工序已完成 |
| 2 | 工序报工 | 填写工时、产出数量、次品数量、备注 |
| 3 | 自动流转 | 完成当前工序后，系统自动启动下一工序 |
| 4 | 工序监控 | 实时查看工单进度、工序状态 |

**标准工序：**
1. 原料裁切加工
2. 图案印花组装
3. 油墨灌注
4. 装帧装订
5. 瑕疵检验
6. 塑封包装
7. 成品入库

#### 2.3 质量检验流程

| 步骤 | 操作 | 角色 | 说明 |
|------|------|------|------|
| 1 | 质量检验 | 质检员 | 填写合格数量、不合格数量、质检备注 |
| 2 | 工单完结 | 产线组长 | 确认质检结果，工单完成 |

**相关接口：**
- `POST /api/order` - 创建工单
- `PUT /api/production/business/{id}/schedule` - 工单排产
- `PUT /api/production/business/{orderId}/allocate-materials` - 物料领用
- `PUT /api/production/business/{orderId}/process/{processId}/start` - 开始工序
- `PUT /api/production/business/{orderId}/process/{processId}/report` - 工序报工
- `PUT /api/production/business/{id}/inspection` - 质量检验
- `PUT /api/production/business/{id}/finish` - 工单完结
- `GET /api/production/business/{id}/progress` - 工单进度
- `GET /api/production/business/dashboard` - 车间看板

---

### 流程3：成本核算流程

**适用角色：管理员 + 产线组长**

| 步骤 | 操作 | 说明 |
|------|------|------|
| 1 | 成本核算 | 生产完成后，系统自动核算工单成本 |
| 2 | 成本构成 | • 原料成本：物料实际用量 × 单价<br>• 设备成本：总工时 × 50元/小时<br>• 人工成本：总工时 × 80元/小时<br>• 残次成本：原料成本 × 残次率 × 1.2 |
| 3 | 成本分析 | 查看成本结构、占比分析、趋势对比 |
| 4 | 财务对接 | 导出财务数据、物料消耗报表 |

**相关接口：**
- `POST /api/cost/business/calculate/{orderId}` - 核算工单成本
- `GET /api/cost/business/{orderId}/structure` - 工单成本结构
- `GET /api/cost/business/summary` - 成本汇总
- `GET /api/cost/business/monthly-trend` - 月度趋势
- `GET /api/cost/business/category-analysis` - 分类分析
- `GET /api/cost/business/financial-data` - 财务对接数据
- `GET /api/cost/business/material-usage` - 物料消耗报表
- `GET /api/cost/business/dashboard` - 成本看板

---

## 四、工单状态说明

| 状态码 | 状态名称 | 说明 |
|--------|---------|------|
| 0 | 待排产 | 工单已创建，等待安排生产 |
| 1 | 已排产 | 已安排生产计划和人员 |
| 2 | 生产中 | 正在进行生产加工 |
| 3 | 生产完成 | 所有工序已完成，等待质检 |
| 4 | 待质检 | 等待质量检验 |
| 5 | 质检完成 | 质量检验已完成 |
| 6 | 已完结 | 工单全部流程完成 |
| 9 | 已暂停 | 超期未排产或手动暂停 |

---

## 五、库存状态说明

| 状态码 | 状态名称 | 说明 |
|--------|---------|------|
| 1 | 正常库存 | 库存充足 |
| 2 | 库存预警 | 低于预警线，需要采购 |

| 采购状态码 | 状态名称 | 说明 |
|-----------|---------|------|
| 1 | 正常 | 可正常采购 |
| 2 | 待采购 | 需要采购补充 |
| 3 | 暂停采购 | 暂停采购该物料 |

---

## 六、业务操作示例

### 示例1：创建一支定制笔的完整流程

**1. 设计员创建产品分类（已完成基础数据）**

**2. 采购专员原料入库**
```json
POST /api/stock/business/inbound
{
  "materialId": 1,
  "quantity": 1000,
  "unitPrice": 2.5,
  "supplier": "木材加工厂",
  "warehouse": "A区-01",
  "remark": "定制笔专用笔杆"
}
```

**3. 产线组长创建工单**
```json
POST /api/order
{
  "categoryId": 5,
  "categoryName": "中性笔",
  "productName": "定制Logo中性笔",
  "specification": "0.5mm 黑色 蓝色笔身",
  "quantity": 500,
  "priority": 2,
  "customerName": "XX科技公司",
  "customerContact": "13800000000",
  "designRequirements": "笔身印刷公司Logo，蓝色笔帽"
}
```

**4. 产线组长排产**
```
PUT /api/production/business/1/schedule
?planStartTime=2024-01-15 08:00:00
&planEndTime=2024-01-15 18:00:00
&productionUserId=4&productionUserName=王五
```

**5. 添加工单用料**
```json
POST /api/order/material
{
  "orderId": 1,
  "materialId": 1,
  "materialCode": "WOOD_001",
  "materialName": "原木笔杆",
  "specification": "枫木 12cm",
  "unit": "根",
  "plannedQuantity": 500,
  "unitPrice": 2.5
}
```

**6. 物料领用**
```
PUT /api/production/business/1/allocate-materials
```

**7. 工序报工（依次完成7道工序）**
```
PUT /api/production/business/1/process/1/start
PUT /api/production/business/1/process/1/report?workingHours=2
...（依次完成所有工序）
```

**8. 质量检验**
```
PUT /api/production/business/1/inspection
?qualified=495&defective=5&remark=5支笔身划痕
```

**9. 工单完结**
```
PUT /api/production/business/1/finish
```

**10. 成本核算**
```
POST /api/cost/business/calculate/1
```

---

## 七、定时任务说明

| 任务 | 执行时间 | 说明 |
|------|---------|------|
| 超期工单暂停 | 每天 02:00 | 7天未排产的工单自动暂停 |

---

## 八、数据一致性保证

1. **事务保证**：所有写操作使用 `@Transactional` 保证原子性
2. **库存流水**：所有库存变动都记录流水，可追溯
3. **操作日志**：所有关键操作记录审计日志
4. **状态校验**：状态流转前校验，防止非法操作

---

## 九、权限控制矩阵

| 功能模块 | 采购专员 | 设计员 | 产线组长 | 质检员 | 管理员 |
|---------|---------|--------|---------|--------|-------|
| 产品分类 | | ✅ | ✅ | | ✅ |
| 原料入库 | ✅ | | ✅ | | ✅ |
| 原料出库 | | | ✅ | | ✅ |
| 库存查询 | ✅ | | ✅ | | ✅ |
| 工单创建 | | ✅ | ✅ | | ✅ |
| 工单排产 | | | ✅ | | ✅ |
| 工序管理 | | | ✅ | | ✅ |
| 质量检验 | | | | ✅ | ✅ |
| 成本核算 | | | ✅ | | ✅ |
| 报表查询 | | | ✅ | | ✅ |
| 用户管理 | | | | | ✅ |
| 操作日志 | | | | | ✅ |
