# 设备巡检与维保管理系统 API 接口文档

## 接口总览

系统共包含 **9个模块，60+ 接口**，所有接口返回格式统一：

```json
{
  "code": 200,
  "message": "操作成功",
  "data": {}
}
```

## 1. 认证模块 (Auth)

| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| POST | /api/auth/register | 用户注册 | 公开 |
| POST | /api/auth/login | 用户登录 | 公开 |
| GET | /api/auth/profile | 获取当前用户信息 | 登录用户 |
| POST | /api/auth/change-password | 修改密码 | 登录用户 |

## 2. 用户管理模块 (User)

| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| GET | /api/users | 获取用户列表 | 管理员 |
| GET | /api/users/:id | 获取用户详情 | 管理员 |
| POST | /api/users | 创建用户 | 管理员 |
| PUT | /api/users/:id | 更新用户 | 管理员 |
| DELETE | /api/users/:id | 删除用户 | 管理员 |
| PATCH | /api/users/:id/reset-password | 重置密码 | 管理员 |

## 3. 部门管理模块 (Department)

| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| GET | /api/departments | 获取部门列表 | 登录用户 |
| GET | /api/departments/tree | 获取部门树 | 登录用户 |
| GET | /api/departments/:id | 获取部门详情 | 登录用户 |
| POST | /api/departments | 创建部门 | 管理员/经理 |
| PUT | /api/departments/:id | 更新部门 | 管理员/经理 |
| DELETE | /api/departments/:id | 删除部门 | 管理员/经理 |

## 4. 设备分类模块 (EquipmentCategory)

| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| GET | /api/equipment-categories | 获取分类列表 | 登录用户 |
| GET | /api/equipment-categories/tree | 获取分类树 | 登录用户 |
| GET | /api/equipment-categories/:id | 获取分类详情 | 登录用户 |
| POST | /api/equipment-categories | 创建分类 | 管理员/经理 |
| PUT | /api/equipment-categories/:id | 更新分类 | 管理员/经理 |
| DELETE | /api/equipment-categories/:id | 删除分类 | 管理员/经理 |

## 5. 设备档案模块 (Equipment)

| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| GET | /api/equipment | 获取设备列表 | 登录用户 |
| GET | /api/equipment/:id | 获取设备详情 | 登录用户 |
| GET | /api/equipment/statistics | 设备统计 | 登录用户 |
| POST | /api/equipment | 创建设备 | 管理员/经理 |
| PUT | /api/equipment/:id | 更新设备 | 管理员/经理 |
| DELETE | /api/equipment/:id | 删除设备 | 管理员/经理 |
| PATCH | /api/equipment/:id/status | 更新设备状态 | 管理员/经理 |

## 6. 巡检计划模块 (InspectionPlan)

| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| GET | /api/inspection-plans | 获取计划列表 | 登录用户 |
| GET | /api/inspection-plans/:id | 获取计划详情 | 登录用户 |
| POST | /api/inspection-plans | 创建计划 | 管理员/经理 |
| PUT | /api/inspection-plans/:id | 更新计划 | 管理员/经理 |
| DELETE | /api/inspection-plans/:id | 删除计划 | 管理员/经理 |
| PATCH | /api/inspection-plans/:id/toggle | 切换激活状态 | 管理员/经理 |

## 7. 巡检任务模块 (InspectionTask)

| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| GET | /api/inspection-tasks | 获取任务列表 | 登录用户 |
| GET | /api/inspection-tasks/my | 获取我的任务 | 登录用户 |
| GET | /api/inspection-tasks/statistics | 任务统计 | 登录用户 |
| GET | /api/inspection-tasks/:id | 获取任务详情 | 登录用户 |
| POST | /api/inspection-tasks | 创建任务 | 管理员/经理 |
| PUT | /api/inspection-tasks/:id | 更新任务 | 管理员/经理 |
| DELETE | /api/inspection-tasks/:id | 删除任务 | 管理员/经理 |
| PATCH | /api/inspection-tasks/:id/start | 开始巡检 | 巡检员 |
| PATCH | /api/inspection-tasks/:id/submit | 提交巡检结果 | 巡检员 |

## 8. 维保工单模块 (WorkOrder)

| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| GET | /api/work-orders | 获取工单列表 | 登录用户 |
| GET | /api/work-orders/my | 获取我的工单 | 登录用户 |
| GET | /api/work-orders/statistics | 工单统计 | 登录用户 |
| GET | /api/work-orders/statistics/type | 按类型统计 | 登录用户 |
| GET | /api/work-orders/:id | 获取工单详情 | 登录用户 |
| POST | /api/work-orders | 创建工单 | 登录用户 |
| PUT | /api/work-orders/:id | 更新工单 | 管理员/经理 |
| DELETE | /api/work-orders/:id | 删除工单 | 管理员/经理 |
| PATCH | /api/work-orders/:id/assign | 派单 | 管理员/经理 |
| PATCH | /api/work-orders/:id/start | 开始维修 | 维修员 |
| PATCH | /api/work-orders/:id/complete | 完成维修 | 维修员 |
| PATCH | /api/work-orders/:id/accept | 验收 | 管理员/经理 |
| PATCH | /api/work-orders/:id/close | 关闭工单 | 管理员/经理 |

## 9. 统计报表模块 (Statistics)

| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| GET | /api/statistics/dashboard | 仪表盘统计 | 登录用户 |
| GET | /api/statistics/equipment | 设备统计 | 登录用户 |
| GET | /api/statistics/inspection | 巡检统计 | 登录用户 |
| GET | /api/statistics/work-order | 工单统计 | 登录用户 |
| GET | /api/statistics/equipment-by-department | 按部门统计设备 | 登录用户 |
| GET | /api/statistics/inspection-by-date | 按日期统计巡检 | 登录用户 |
| GET | /api/statistics/work-order-by-date | 按日期统计工单 | 登录用户 |
| GET | /api/statistics/monthly-trend | 月度趋势分析 | 登录用户 |

## 公共接口

| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| GET | /api/health | 健康检查 | 公开 |

## 用户角色说明

| 角色 | 代码 | 说明 |
|------|------|------|
| 管理员 | admin | 拥有所有权限 |
| 部门经理 | manager | 管理部门设备、工单、巡检计划 |
| 巡检员 | inspector | 执行巡检任务 |
| 维修员 | maintenance | 处理维保工单 |
| 普通用户 | user | 查看设备、上报故障 |

## 业务状态流转

### 巡检任务状态

```
待执行(pending) → 进行中(in_progress) → 已完成(completed)
                                          → 异常(exception)
```

### 维保工单状态

```
待处理(pending) → 已指派(assigned) → 进行中(in_progress) → 
已完成(completed) → 已验收(accepted) → 已关闭(closed)
```

## 数据库事务支持

以下操作支持数据库事务，保证数据一致性：

1. **提交巡检结果**
   - 更新巡检任务状态
   - 如有异常，同步更新设备状态为"故障"

2. **工单验收**
   - 更新工单状态为"已验收"
   - 同步更新设备状态为"正常"

## 请求示例

### 登录
```bash
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```

### 获取设备列表
```bash
GET /api/equipment?page=1&pageSize=10&status=normal
Authorization: Bearer <token>
```

### 创建巡检任务
```bash
POST /api/inspection-tasks
Authorization: Bearer <token>
Content-Type: application/json

{
  "equipmentId": 1,
  "title": "设备日常巡检",
  "scheduledDate": "2024-01-15T09:00:00Z",
  "inspectionItems": "[{\"name\":\"外观检查\",\"required\":true},{\"name\":\"运行声音\",\"required\":true}]"
}
```

## 分页查询参数说明

所有列表接口支持以下分页参数：

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| page | number | 否 | 1 | 页码 |
| pageSize | number | 否 | 10 | 每页条数 |

返回格式：
```json
{
  "code": 200,
  "message": "查询成功",
  "data": {
    "list": [],
    "total": 100,
    "page": 1,
    "pageSize": 10
  }
}
```
