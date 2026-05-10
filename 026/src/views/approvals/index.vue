<template>
  <div class="page-container">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
      <h2>审批管理</h2>
      <el-button type="primary" @click="handleAdd">
        <el-icon><Plus /></el-icon>
        新建申请
      </el-button>
    </div>
    
    <el-row :gutter="20" style="margin-bottom: 24px;">
      <el-col :span="6">
        <el-card shadow="hover" :body-style="{ padding: '20px' }">
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <div>
              <div style="font-size: 28px; font-weight: bold; color: #e6a23c;">{{ approvalStore.pendingCount }}</div>
              <div style="margin-top: 8px; color: #606266;">待审批</div>
            </div>
            <el-icon :size="40" style="color: #e6a23c;"><Clock /></el-icon>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" :body-style="{ padding: '20px' }">
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <div>
              <div style="font-size: 28px; font-weight: bold; color: #67c23a;">{{ approvalStore.approvedCount }}</div>
              <div style="margin-top: 8px; color: #606266;">已通过</div>
            </div>
            <el-icon :size="40" style="color: #67c23a;"><CircleCheck /></el-icon>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" :body-style="{ padding: '20px' }">
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <div>
              <div style="font-size: 28px; font-weight: bold; color: #f56c6c;">{{ approvalStore.rejectedCount }}</div>
              <div style="margin-top: 8px; color: #606266;">已驳回</div>
            </div>
            <el-icon :size="40" style="color: #f56c6c;"><CircleClose /></el-icon>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" :body-style="{ padding: '20px' }">
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <div>
              <div style="font-size: 28px; font-weight: bold; color: #409eff;">{{ approvalStore.approvals.length }}</div>
              <div style="margin-top: 8px; color: #606266;">申请总数</div>
            </div>
            <el-icon :size="40" style="color: #409eff;"><Document /></el-icon>
          </div>
        </el-card>
      </el-col>
    </el-row>
    
    <AdvancedFilter
      v-model="filterParams"
      :filters="approvalFilters"
      :show-active-filters="true"
      :auto-search="true"
      @search="handleFilter"
      @reset="handleReset"
    />
    
    <div class="table-container">
      <el-table :data="approvalStore.filteredApprovals" style="width: 100%">
        <el-table-column prop="id" label="单号" width="100" />
        <el-table-column prop="employeeName" label="申请人" width="100" />
        <el-table-column prop="departmentName" label="部门" width="120" />
        <el-table-column label="类型" width="100">
          <template #default="{ row }">
            {{ ApprovalTypeMap[row.type] }}
          </template>
        </el-table-column>
        <el-table-column prop="title" label="标题" width="120" />
        <el-table-column prop="reason" label="理由" show-overflow-tooltip />
        <el-table-column label="时间" width="200">
          <template #default="{ row }">
            <div>{{ row.startTime }}</div>
            <div>至 {{ row.endTime }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="duration" label="时长" width="80">
          <template #default="{ row }">
            {{ row.duration }}天
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <span :class="['status-tag', `status-${row.status}`]">
              {{ ApprovalStatusMap[row.status] }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handleView(row)">
              <el-icon><View /></el-icon>
              查看
            </el-button>
            <template v-if="row.status === 'pending'">
              <el-button type="success" link size="small" @click="handleApprove(row)">
                <el-icon><CircleCheck /></el-icon>
                通过
              </el-button>
              <el-button type="danger" link size="small" @click="handleReject(row)">
                <el-icon><CircleClose /></el-icon>
                驳回
              </el-button>
            </template>
          </template>
        </el-table-column>
      </el-table>
      
      <el-empty v-if="approvalStore.filteredApprovals.length === 0" description="暂无审批记录" />
    </div>
    
    <ApprovalDialog
      v-model:visible="dialogVisible"
      :mode="dialogMode"
      :detail-data="currentApproval"
      :departments="departmentStore.departments"
      @submit="handleDialogSubmit"
      @approve="handleDialogApprove"
      @reject="handleDialogReject"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { useApprovalStore } from '@/stores/approval'
import { useDepartmentStore } from '@/stores/department'
import { useEmployeeStore } from '@/stores/employee'
import type { Approval, FilterParams, ApprovalType, ApprovalStatus } from '@/types'
import { ApprovalTypeMap, ApprovalStatusMap, ApprovalDialogModes } from '@/types'
import ApprovalDialog from '@/components/ApprovalDialog.vue'
import AdvancedFilter, { type FilterConfig } from '@/components/AdvancedFilter.vue'
import { getCurrentDateTime } from '@/utils/date'

const approvalStore = useApprovalStore()
const departmentStore = useDepartmentStore()
const employeeStore = useEmployeeStore()

const approvalFilters = computed<FilterConfig[]>(() => [
  {
    key: 'departmentId',
    label: '部门',
    type: 'select',
    placeholder: '请选择部门',
    width: '180px',
    options: departmentStore.departments.map((dept) => ({
      label: dept.name,
      value: dept.id
    }))
  },
  {
    key: 'approvalType',
    label: '类型',
    type: 'select',
    placeholder: '请选择类型',
    width: '150px',
    options: Object.entries(ApprovalTypeMap).map(([value, label]) => ({
      label,
      value
    }))
  },
  {
    key: 'approvalStatus',
    label: '状态',
    type: 'select',
    placeholder: '请选择状态',
    width: '120px',
    options: Object.entries(ApprovalStatusMap).map(([value, label]) => ({
      label,
      value
    }))
  },
  {
    key: 'keyword',
    label: '关键词',
    type: 'input',
    placeholder: '申请人/申请标题',
    width: '200px'
  }
])

const filterParams = reactive<Record<string, unknown>>({})

const dialogVisible = ref<boolean>(false)
const dialogMode = ref<'create' | 'view' | 'approve' | 'reject'>(ApprovalDialogModes.CREATE)
const currentApproval = ref<Approval | undefined>()

function handleFilter(params: Record<string, unknown>): void {
  const typedParams: Partial<FilterParams> = {
    departmentId: params.departmentId as string | undefined,
    approvalType: params.approvalType as ApprovalType | undefined,
    approvalStatus: params.approvalStatus as ApprovalStatus | undefined,
    keyword: params.keyword as string | undefined
  }
  approvalStore.setFilterParams(typedParams)
}

function handleReset(): void {
  approvalStore.clearFilterParams()
}

function handleAdd(): void {
  currentApproval.value = undefined
  dialogMode.value = ApprovalDialogModes.CREATE
  dialogVisible.value = true
}

function handleView(row: Approval): void {
  currentApproval.value = { ...row }
  dialogMode.value = ApprovalDialogModes.VIEW
  dialogVisible.value = true
}

function handleApprove(row: Approval): void {
  currentApproval.value = { ...row }
  dialogMode.value = ApprovalDialogModes.APPROVE
  dialogVisible.value = true
}

function handleReject(row: Approval): void {
  currentApproval.value = { ...row }
  dialogMode.value = ApprovalDialogModes.REJECT
  dialogVisible.value = true
}

function handleDialogSubmit(formData: Partial<Approval>): void {
  let employeeId = ''
  if (employeeStore.employees.length > 0) {
    const matchedEmployee = employeeStore.employees.find(
      (e) => e.name === formData.employeeName
    )
    if (matchedEmployee) {
      employeeId = matchedEmployee.id
    }
  }
  
  const now = getCurrentDateTime()
  const approvalType = formData.type as ApprovalType
  
  const newApproval: Approval = {
    id: `app_${Date.now()}`,
    employeeId,
    employeeName: formData.employeeName || '',
    departmentId: formData.departmentId || '',
    departmentName: formData.departmentName || '',
    type: approvalType,
    title: ApprovalTypeMap[approvalType],
    reason: formData.reason || '',
    startTime: formData.startTime || '',
    endTime: formData.endTime || '',
    duration: formData.duration || 1,
    status: 'pending',
    createTime: now,
    updateTime: now,
    approverId: null,
    approverName: null,
    comment: null
  }
  
  approvalStore.addApproval(newApproval)
  ElMessage.success('提交成功')
}

function handleDialogApprove(id: string, comment: string): void {
  const success = approvalStore.approveApproval(id, 'admin_1', '系统管理员', comment)
  if (success) {
    ElMessage.success('审批通过')
  } else {
    ElMessage.error('审批失败：只能审批待处理的申请')
  }
}

function handleDialogReject(id: string, comment: string): void {
  const success = approvalStore.rejectApproval(id, 'admin_1', '系统管理员', comment)
  if (success) {
    ElMessage.success('审批驳回')
  } else {
    ElMessage.error('审批失败：只能驳回待处理的申请')
  }
}
</script>
