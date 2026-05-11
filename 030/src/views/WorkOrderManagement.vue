<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useCommunityStore } from '@/stores'
import AdvancedFilter from '@/components/AdvancedFilter.vue'
import WorkOrderDispatchDialog from '@/components/WorkOrderDispatchDialog.vue'
import type { AdvancedFilter as FilterType, WorkOrder, WorkOrderStatus, WorkOrderType, WorkOrderPriority } from '@/types'

const store = useCommunityStore()

const filter = ref<FilterType>({})
const dialogVisible = ref(false)
const dialogMode = ref<'create' | 'view' | 'assign' | 'process'>('create')
const currentWorkOrder = ref<WorkOrder | null>(null)

const filteredWorkOrders = computed(() => {
  return store.filterWorkOrders(filter.value)
})

const workOrderStatusMap: Record<WorkOrderStatus, { type: string; text: string }> = {
  pending: { type: 'warning', text: '待派单' },
  processing: { type: 'primary', text: '维修中' },
  checking: { type: 'info', text: '待验收' },
  completed: { type: 'success', text: '已完成' }
}

const workOrderPriorityMap: Record<WorkOrderPriority, { type: string; text: string }> = {
  high: { type: 'danger', text: '高' },
  medium: { type: 'warning', text: '中' },
  low: { type: 'success', text: '低' }
}

const workOrderTypeMap: Record<WorkOrderType, { type: string; text: string }> = {
  repair: { type: 'primary', text: '维修' },
  complaint: { type: 'danger', text: '投诉' },
  suggestion: { type: 'success', text: '建议' },
  other: { type: 'info', text: '其他' }
}

const statusCounts = computed(() => ({
  pending: store.workOrders.filter((w: WorkOrder) => w.status === 'pending').length,
  processing: store.workOrders.filter((w: WorkOrder) => w.status === 'processing').length,
  checking: store.workOrders.filter((w: WorkOrder) => w.status === 'checking').length,
  completed: store.workOrders.filter((w: WorkOrder) => w.status === 'completed').length
}))

function handleSearch() {
  ElMessage.success(`搜索完成，找到 ${filteredWorkOrders.value.length} 条记录`)
}

function handleReset() {
  filter.value = {}
  ElMessage.info('已重置筛选条件')
}

function openCreateDialog() {
  dialogMode.value = 'create'
  currentWorkOrder.value = null
  dialogVisible.value = true
}

function openViewDialog(order: WorkOrder) {
  dialogMode.value = 'view'
  currentWorkOrder.value = order
  dialogVisible.value = true
}

function openAssignDialog(order: WorkOrder) {
  dialogMode.value = 'assign'
  currentWorkOrder.value = order
  dialogVisible.value = true
}

function openProcessDialog(order: WorkOrder) {
  if (order.status === 'pending') {
    openAssignDialog(order)
  } else {
    dialogMode.value = 'process'
    currentWorkOrder.value = order
    dialogVisible.value = true
  }
}

function handleForceComplete(order: WorkOrder) {
  ElMessageBox.prompt(
    `确定要强制结单「${order.title}」吗？请填写原因：`,
    '确认强制结单',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputPattern: /.+/,
      inputErrorMessage: '请填写强制结单原因',
      type: 'warning',
      inputPlaceholder: '请输入强制结单原因'
    }
  ).then(({ value }) => {
    store.forceCompleteWorkOrder(order.id, value)
    ElMessage.success('强制结单成功')
  }).catch(() => {})
}

function getStatusInfo(status: WorkOrderStatus) {
  return workOrderStatusMap[status]
}

function getPriorityInfo(priority: WorkOrderPriority) {
  return workOrderPriorityMap[priority]
}

function getTypeInfo(type: WorkOrderType) {
  return workOrderTypeMap[type]
}
</script>

<template>
  <div class="work-order-management">
    <AdvancedFilter
      v-model="filter"
      :show-keyword="true"
      :show-building="true"
      :show-work-order-type="true"
      :show-work-order-status="true"
      :show-priority="true"
      :show-date-range="true"
      @search="handleSearch"
      @reset="handleReset"
    />
    
    <el-card>
      <template #header>
        <div class="table-header">
          <div class="header-left">
            <span>工单列表</span>
            <div class="stat-chips">
              <el-tag
                v-for="(status, key) in workOrderStatusMap"
                :key="key"
                :type="status.type"
                effect="light"
                class="stat-chip"
                @click="filter.workOrderStatus = key as WorkOrderStatus"
              >
                {{ status.text }}: {{ statusCounts[key as WorkOrderStatus] }}
              </el-tag>
            </div>
          </div>
          <el-button type="primary" @click="openCreateDialog">
            <el-icon><Plus /></el-icon>
            创建工单
          </el-button>
        </div>
      </template>
      
      <el-table 
        :data="filteredWorkOrders" 
        stripe
        :row-class-name="({ row }: { row: WorkOrder }) => row.isTimeout ? 'timeout-row' : ''"
      >
        <el-table-column type="index" label="序号" width="60" />
        
        <el-table-column label="工单编号" min-width="180">
          <template #default="{ row }: { row: WorkOrder }">
            <div class="order-id">
              <el-tag v-if="row.isTimeout" type="danger" size="small" effect="dark" class="timeout-badge">
                超时
              </el-tag>
              <span class="order-id-text">{{ row.id }}</span>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column prop="title" label="工单标题" min-width="160" show-overflow-tooltip />
        
        <el-table-column label="类型" width="80">
          <template #default="{ row }: { row: WorkOrder }">
            <el-tag :type="getTypeInfo(row.type).type" size="small">
              {{ getTypeInfo(row.type).text }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column label="优先级" width="70">
          <template #default="{ row }: { row: WorkOrder }">
            <el-tag :type="getPriorityInfo(row.priority).type" size="small">
              {{ getPriorityInfo(row.priority).text }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="buildingName" label="楼栋" width="100" />
        <el-table-column prop="houseNo" label="房号" width="80" />
        <el-table-column prop="residentName" label="住户" width="80" />
        <el-table-column prop="phone" label="电话" width="120" />
        
        <el-table-column label="状态" width="90">
          <template #default="{ row }: { row: WorkOrder }">
            <el-tag :type="getStatusInfo(row.status).type" size="small">
              {{ getStatusInfo(row.status).text }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="handler" label="处理人" width="90">
          <template #default="{ row }: { row: WorkOrder }">
            <template v-if="row.handler">
              <el-avatar :size="20" :icon="'UserFilled'" style="vertical-align: middle; margin-right: 6px;" />
              {{ row.handler }}
            </template>
            <span v-else class="empty-handler">-</span>
          </template>
        </el-table-column>
        
        <el-table-column prop="createTime" label="创建时间" width="160" />
        
        <el-table-column label="操作" width="240" fixed="right">
          <template #default="{ row }: { row: WorkOrder }">
            <el-button type="primary" link size="small" @click="openViewDialog(row)">
              详情
            </el-button>
            <el-button 
              v-if="row.status === 'pending'"
              type="primary" 
              link 
              size="small" 
              @click="openAssignDialog(row)"
            >
              派单
            </el-button>
            <el-button 
              v-else-if="row.status !== 'completed'"
              type="success" 
              link 
              size="small" 
              @click="openProcessDialog(row)"
            >
              处理
            </el-button>
            <el-button 
              v-if="row.status !== 'completed'"
              type="danger" 
              link 
              size="small" 
              @click="handleForceComplete(row)"
            >
              强制结单
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <el-pagination
        class="pagination"
        background
        layout="prev, pager, next, jumper, total"
        :total="filteredWorkOrders.length"
        :page-size="10"
      />
    </el-card>
    
    <WorkOrderDispatchDialog
      v-model="dialogVisible"
      :work-order="currentWorkOrder"
      :mode="dialogMode"
      @success="() => ElMessage.success('操作成功')"
    />
  </div>
</template>

<style scoped>
.work-order-management {
  padding: 0;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-chips {
  display: flex;
  gap: 8px;
}

.stat-chip {
  margin: 0 !important;
  cursor: pointer;
  transition: all 0.3s;
}

.stat-chip:hover {
  transform: scale(1.05);
}

.order-id {
  display: flex;
  align-items: center;
  gap: 6px;
}

.order-id-text {
  font-family: 'Courier New', monospace;
  font-size: 12px;
}

.timeout-badge {
  animation: blink 1s infinite;
}

.empty-handler {
  color: #c0c4cc;
}

:deep(.timeout-row) {
  background-color: rgba(245, 108, 108, 0.08) !important;
}

:deep(.timeout-row:hover) {
  background-color: rgba(245, 108, 108, 0.12) !important;
}

@keyframes blink {
  0%, 50%, 100% {
    opacity: 1;
  }
  25%, 75% {
    opacity: 0.6;
  }
}

.pagination {
  margin-top: 20px;
  justify-content: flex-end;
}
</style>
