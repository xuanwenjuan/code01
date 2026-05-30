# 建筑工程建材出入库管控后端服务 API 文档

## 一、项目概述

基于 SpringBoot3 + MyBatis-Plus + MySQL + Redis + JWT 的建筑工程建材出入库管控系统。

**技术栈：**
- SpringBoot 3.2.x
- MyBatis-Plus 3.5.x
- MySQL 8.0+
- Redis 6.0+
- JWT
- Spring Security（密码加密）

**默认账户：**
- 系统管理员：admin / 123456
- 采购专员：purchaser / 123456
- 工地仓管：warehouse / 123456
- 工程监理：supervisor / 123456
- 财务核算：finance / 123456

## 二、全局规范

### 2.1 统一响应格式

```json
{
  "code": 200,
  "message": "操作成功",
  "data": {},
  "timestamp": 1715856000000
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| code | Integer | 状态码，200-成功，400-参数错误，401-未登录，403-无权限，500-服务器错误 |
| message | String | 提示信息 |
| data | Object | 返回数据 |
| timestamp | Long | 时间戳 |

### 2.2 分页响应格式

```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "list": [],
    "total": 100,
    "pageNum": 1,
    "pageSize": 10
  },
  "timestamp": 1715856000000
}
```

### 2.3 请求头规范

所有需要登录的接口必须携带：
```
Authorization: Bearer {token}
```

## 三、认证接口

### 3.1 用户登录

**接口：** `POST /auth/login`

**请求参数：**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| username | String | 是 | 用户名 |
| password | String | 是 | 密码 |

**响应数据：**

| 字段 | 类型 | 说明 |
|------|------|------|
| token | String | JWT令牌 |
| tokenHead | String | token前缀 |
| expiresIn | Long | 过期时间（秒） |
| user | Object | 用户信息 |

## 四、建材品类分类模块

### 4.1 新增品类

**接口：** `POST /category`

**权限：** ADMIN、PURCHASER

**请求参数：**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| parentId | Long | 否 | 父级ID，0表示顶级 |
| categoryName | String | 是 | 品类名称 |
| categoryCode | String | 是 | 品类编码 |
| unit | String | 否 | 单位 |
| priority | Integer | 否 | 优先级，数值越大越靠前 |
| remark | String | 否 | 备注 |

### 4.2 更新品类

**接口：** `PUT /category`

**权限：** ADMIN、PURCHASER

**请求参数：** 同新增

### 4.3 删除品类

**接口：** `DELETE /category/{id}`

**权限：** ADMIN、PURCHASER

### 4.4 分类树形列表

**接口：** `GET /category/tree`

**权限：** 所有登录用户

### 4.5 启用/停用品类

**接口：** `PUT /category/status/{id}`

**权限：** ADMIN、PURCHASER

**请求参数：** `status` (0-停用, 1-启用)

### 4.6 调整优先级

**接口：** `PUT /category/priority/{id}`

**权限：** ADMIN、PURCHASER

**请求参数：** `priority`

## 五、工程物料库存模块

### 5.1 采购入库

**接口：** `POST /inventory/inbound`

**权限：** ADMIN、PURCHASER、WAREHOUSE_KEEPER

**请求参数：**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| categoryId | Long | 是 | 品类ID |
| materialName | String | 是 | 材料名称 |
| materialCode | String | 是 | 材料编码 |
| specification | String | 是 | 规格 |
| unit | String | 是 | 单位 |
| quantity | BigDecimal | 是 | 入库数量 |
| unitPrice | BigDecimal | 是 | 单价 |
| supplier | String | 是 | 供应商 |
| warehouse | String | 是 | 仓库 |
| location | String | 否 | 库位 |
| productionDate | Date | 否 | 生产日期 |
| moistureProofDays | Integer | 否 | 防潮天数（水泥砂石类） |
| warningQuantity | BigDecimal | 否 | 预警数量 |
| remark | String | 否 | 备注 |

### 5.2 库存调拨

**接口：** `POST /inventory/transfer`

**权限：** ADMIN、WAREHOUSE_KEEPER

**请求参数：**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| inventoryId | Long | 是 | 库存ID |
| quantity | BigDecimal | 是 | 调拨数量 |
| fromWarehouse | String | 是 | 调出仓库 |
| toWarehouse | String | 是 | 调入仓库 |
| remark | String | 否 | 备注 |

### 5.3 库存盘点

**接口：** `POST /inventory/check`

**权限：** ADMIN、WAREHOUSE_KEEPER

**请求参数：**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| inventoryId | Long | 是 | 库存ID |
| checkQuantity | BigDecimal | 是 | 盘点数量 |
| reason | String | 是 | 差异原因 |
| remark | String | 否 | 备注 |

### 5.4 库存分页查询

**接口：** `GET /inventory/page`

**权限：** 所有登录用户

**请求参数：**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| pageNum | Integer | 是 | 页码 |
| pageSize | Integer | 是 | 每页条数 |
| keyword | String | 否 | 关键词（材料名称/编码/规格） |
| categoryId | Long | 否 | 品类ID |
| warehouse | String | 否 | 仓库 |
| inventoryStatus | Integer | 否 | 库存状态（1-正常，2-预警，3-停采） |
| startDate | Date | 否 | 开始时间 |
| endDate | Date | 否 | 结束时间 |

### 5.5 库存流水查询

**接口：** `GET /inventory/flow`

**权限：** 所有登录用户

**请求参数：**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| pageNum | Integer | 是 | 页码 |
| pageSize | Integer | 是 | 每页条数 |
| inventoryId | Long | 否 | 库存ID |
| flowType | Integer | 否 | 流水类型 |
| warehouse | String | 否 | 仓库 |
| startDate | Date | 否 | 开始时间 |
| endDate | Date | 否 | 结束时间 |

### 5.6 库存详情

**接口：** `GET /inventory/{id}`

**权限：** 所有登录用户

### 5.7 获取预警库存

**接口：** `GET /inventory/warning`

**权限：** 所有登录用户

### 5.8 获取库存汇总

**接口：** `GET /inventory/summary`

**权限：** 所有登录用户

## 六、工地领用工单模块

### 6.1 创建工单

**接口：** `POST /workorder`

**权限：** ADMIN、PURCHASER、WAREHOUSE_KEEPER、SUPERVISOR

**请求参数：**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| orderType | Integer | 是 | 单据类型（1-采购入库单，2-班组领用单） |
| projectName | String | 是 | 项目名称 |
| constructionTeam | String | 是 | 施工班组 |
| teamLeader | String | 是 | 班组负责人 |
| teamLeaderPhone | String | 是 | 负责人电话 |
| planUseDate | Date | 是 | 计划使用日期 |
| details | List | 是 | 明细列表 |
| remark | String | 否 | 备注 |

**明细字段：**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| inventoryId | Long | 是 | 库存ID |
| planQuantity | BigDecimal | 是 | 计划数量 |
| remark | String | 否 | 备注 |

### 6.2 审核工单

**接口：** `PUT /workorder/audit/{id}`

**权限：** ADMIN、SUPERVISOR

**请求参数：**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| auditResult | Integer | 是 | 审核结果（1-通过，2-驳回） |
| auditRemark | String | 否 | 审核意见 |

### 6.3 工单出库

**接口：** `PUT /workorder/outbound/{id}`

**权限：** ADMIN、WAREHOUSE_KEEPER

### 6.4 工单核销

**接口：** `PUT /workorder/verify/{id}`

**权限：** ADMIN、SUPERVISOR

**请求参数：**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| details | List | 是 | 核销明细 |

**核销明细字段：**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| detailId | Long | 是 | 工单明细ID |
| usedQuantity | BigDecimal | 是 | 实际使用数量 |
| returnedQuantity | BigDecimal | 是 | 退回数量 |
| lostQuantity | BigDecimal | 是 | 损耗数量 |
| remark | String | 否 | 备注 |

### 6.5 工单分页查询

**接口：** `GET /workorder/page`

**权限：** 所有登录用户

**请求参数：**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| pageNum | Integer | 是 | 页码 |
| pageSize | Integer | 是 | 每页条数 |
| keyword | String | 否 | 关键词（工单号/项目/班组） |
| orderType | Integer | 否 | 单据类型 |
| status | Integer | 否 | 工单状态（1-待审核，2-已审核，3-已出库，4-已核销，5-已驳回） |
| projectName | String | 否 | 项目名称 |
| constructionTeam | String | 否 | 施工班组 |
| startDate | Date | 否 | 开始时间 |
| endDate | Date | 否 | 结束时间 |

### 6.6 工单详情

**接口：** `GET /workorder/{id}`

**权限：** 所有登录用户

### 6.7 工单统计

**接口：** `GET /workorder/statistics`

**权限：** 所有登录用户

**请求参数：**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| startDate | Date | 否 | 开始时间 |
| endDate | Date | 否 | 结束时间 |
| projectName | String | 否 | 项目名称 |

### 6.8 获取待审核工单列表

**接口：** `GET /workorder/pending`

**权限：** ADMIN、SUPERVISOR

### 6.9 获取超期未核销工单

**接口：** `GET /workorder/overdue`

**权限：** 所有登录用户

## 七、工程用料成本模块

### 7.1 获取成本统计

**接口：** `GET /cost/statistics`

**权限：** ADMIN、FINANCE

**请求参数：**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| startDate | Date | 是 | 开始时间 |
| endDate | Date | 是 | 结束时间 |
| projectName | String | 否 | 项目名称 |
| categoryId | Long | 否 | 品类ID |

### 7.2 财务对账

**接口：** `POST /cost/reconciliation`

**权限：** ADMIN、FINANCE

**请求参数：**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| startDate | Date | 是 | 开始时间 |
| endDate | Date | 是 | 结束时间 |
| projectName | String | 否 | 项目名称 |
| actualMainMaterialCost | BigDecimal | 是 | 实际主材费用 |
| actualAuxiliaryMaterialCost | BigDecimal | 是 | 实际辅材费用 |
| actualTransportationCost | BigDecimal | 是 | 实际运输费用 |
| actualLaborCost | BigDecimal | 是 | 实际人工成本 |
| actualWasteCost | BigDecimal | 是 | 实际损耗成本 |

### 7.3 品类成本分析

**接口：** `GET /cost/category-analysis`

**权限：** ADMIN、FINANCE

**请求参数：**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| startDate | Date | 是 | 开始时间 |
| endDate | Date | 是 | 结束时间 |
| projectName | String | 否 | 项目名称 |

### 7.4 材料成本明细

**接口：** `GET /cost/material-details`

**权限：** ADMIN、FINANCE

**请求参数：**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| pageNum | Integer | 是 | 页码 |
| pageSize | Integer | 是 | 每页条数 |
| startDate | Date | 是 | 开始时间 |
| endDate | Date | 是 | 结束时间 |
| projectName | String | 否 | 项目名称 |
| categoryId | Long | 否 | 品类ID |
| materialName | String | 否 | 材料名称 |

### 7.5 项目成本汇总

**接口：** `GET /cost/project-summary`

**权限：** ADMIN、FINANCE

**请求参数：**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| startDate | Date | 否 | 开始时间 |
| endDate | Date | 否 | 结束时间 |

### 7.6 成本趋势分析

**接口：** `GET /cost/trend`

**权限：** ADMIN、FINANCE

**请求参数：**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| startDate | Date | 是 | 开始时间 |
| endDate | Date | 是 | 结束时间 |
| projectName | String | 否 | 项目名称 |

## 八、用户管理模块

### 8.1 新增用户

**接口：** `POST /user`

**权限：** ADMIN

**请求参数：**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| username | String | 是 | 用户名 |
| password | String | 是 | 密码 |
| realName | String | 是 | 真实姓名 |
| phone | String | 是 | 手机号 |
| email | String | 否 | 邮箱 |
| role | String | 是 | 角色（ADMIN/PURCHASER/WAREHOUSE_KEEPER/SUPERVISOR/FINANCE） |
| status | Integer | 否 | 状态（0-禁用，1-启用） |
| remark | String | 否 | 备注 |

### 8.2 更新用户

**接口：** `PUT /user`

**权限：** ADMIN

### 8.3 删除用户

**接口：** `DELETE /user/{id}`

**权限：** ADMIN

### 8.4 用户分页查询

**接口：** `GET /user/page`

**权限：** ADMIN

### 8.5 用户详情

**接口：** `GET /user/{id}`

**权限：** ADMIN

### 8.6 更新用户状态

**接口：** `PUT /user/status/{id}`

**权限：** ADMIN

**请求参数：** `status` (0-禁用, 1-启用)

### 8.7 修改密码

**接口：** `PUT /user/password/{id}`

**权限：** 所有登录用户（只能修改自己的密码）

**请求参数：**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| oldPassword | String | 是 | 原密码 |
| newPassword | String | 是 | 新密码 |

### 8.8 获取角色列表

**接口：** `GET /user/roles`

**权限：** 所有登录用户

## 九、角色权限对照表

| 模块/功能 | 系统管理员 | 采购专员 | 工地仓管 | 工程监理 | 财务核算 |
|----------|----------|----------|----------|----------|----------|
| 品类管理（增删改查） | ✓ | ✓ | ✗ | ✗ | ✗ |
| 采购入库 | ✓ | ✓ | ✓ | ✗ | ✗ |
| 库存调拨 | ✓ | ✗ | ✓ | ✗ | ✗ |
| 库存盘点 | ✓ | ✗ | ✓ | ✗ | ✗ |
| 库存查询 | ✓ | ✓ | ✓ | ✓ | ✓ |
| 新建工单 | ✓ | ✓ | ✓ | ✓ | ✗ |
| 工单审核 | ✓ | ✗ | ✗ | ✓ | ✗ |
| 工单出库 | ✓ | ✗ | ✓ | ✗ | ✗ |
| 工单核销 | ✓ | ✗ | ✗ | ✓ | ✗ |
| 工单查询 | ✓ | ✓ | ✓ | ✓ | ✓ |
| 成本统计 | ✓ | ✗ | ✗ | ✗ | ✓ |
| 财务对账 | ✓ | ✗ | ✗ | ✗ | ✓ |
| 用户管理 | ✓ | ✗ | ✗ | ✗ | ✗ |

## 十、工单状态流转

```
待审核(1) → 审核通过 → 已审核(2) → 出库 → 已出库(3) → 核销 → 已核销(4)
            ↓
          审核驳回 → 已驳回(5)
```

## 十一、库存状态说明

| 状态码 | 状态名称 | 说明 |
|--------|----------|------|
| 1 | 正常库存 | 库存充足，正常使用 |
| 2 | 库存预警 | 库存低于预警值，需要补充 |
| 3 | 停止采购 | 已淘汰材料，停止采购 |

## 十二、库存流水类型

| 类型码 | 类型名称 | 说明 |
|--------|----------|------|
| 1 | 采购入库 | 采购材料入库 |
| 2 | 调拨入库 | 从其他仓库调拨入库 |
| 3 | 盘盈入库 | 盘点盈余入库 |
| 11 | 领用出库 | 工单领用出库 |
| 12 | 调拨出库 | 调拨到其他仓库 |
| 13 | 盘亏出库 | 盘点亏损出库 |
| 14 | 损耗出库 | 材料损耗出库 |
