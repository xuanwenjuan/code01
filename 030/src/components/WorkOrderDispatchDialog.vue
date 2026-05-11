<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance } from 'element-plus'
import { useCommunityStore } from '@/stores'
import type { WorkOrder, WorkOrderType, WorkOrderPriority, WorkOrderStatus } from '@/types'

type DialogModeType = 'create' | 'view' | 'assign' | 'process'

const props = defineProps<{
  modelValue: boolean
  workOrder?: WorkOrder
  mode: DialogModeType
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'success'): void
}>()

const store = useCommunityStore()
const formRef = ref<FormInstance>()
const loading = ref(false)
const selectedHandlerId = ref<string>('')
const reopenReason = ref<string>('')

const formData = ref({
  title: '',
  type: 'repair' as WorkOrderType,
  priority: 'medium' as WorkOrderPriority,
  buildingId: '',
  houseId: '',
  residentName: '',
  phone: '',
  description: '',
  remark: ''
})

const rules = {
  title: [{ required: true, message: '请输入工单标题', trigger: 'blur' }],
  type: [{ required: true, message: '请选择工单类型', trigger: 'change' }],
  priority: [{ required: true, message: '请选择优先级', trigger: 'change' }],
  buildingId: [{ required: true, message: '请选择楼栋', trigger: 'change' }],
  houseId: [{ required: true, message: '请选择房屋', trigger: 'change' }],
  residentName: [{ required: true, message: '请输入住户姓名', trigger: 'blur' }],
  phone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  description: [{ required: true, message: '请输入问题描述', trigger: 'blur' }]
}

const isViewMode = computed(() => props.mode === 'view')
const isAssignMode = computed(() => props.mode === 'assign')
const isProcessMode = computed(() => props.mode === 'process')
const isCreateMode = computed(() => props.mode === 'create')

const availableHouses = computed(() => {
  if (!formData.value.buildingId) return []
  return store.houses.filter(h => h.buildingId === formData.value.buildingId)
})

const availableResidents = computed(() => {
  if (!formData.value.houseId) return []
  return store.residents.filter(r => r.houseId === formData.value.houseId)
})

const typeOptions = [
  { label: '维修报修', value: 'repair', icon: 'Tools' },
  { label: '投诉建议', value: 'complaint', icon: 'Warning' },
  { label: '服务建议', value: 'suggestion', icon: 'ChatDotRound' },
  { label: '其他', value: 'other', icon: 'MoreFilled' }
]

const priorityOptions = [
  { label: '紧急', value: 'high', color: '#f56c6c' },
  { label: '普通', value: 'medium', color: '#e6a23c' },
  { label: '低', value: 'low', color: '#67c23a' }
]

watch(() => props.modelValue, (val) => {
  if (val && props.workOrder) {
    const order = props.workOrder
    formData.value = {
      title: order.title,
      type: order.type,
      priority: order.priority,
      buildingId: order.buildingId,
      houseId: order.houseId,
      residentName: order.residentName,
      phone: order.phone,
      description: order.description,
      remark: order.remark || ''
    }
    selectedHandlerId.value = order.handlerId || ''
  } else if (val) {
    resetForm()
  }
}, { immediate: true })

function resetForm() {
  formData.value = {
    title: '',
    type: 'repair',
    priority: 'medium',
    buildingId: '',
    houseId: '',
    residentName: '',
    phone: '',
    description: '',
    remark: ''
  }
  selectedHandlerId.value = ''
}

function handleClose() {
  emit('update:modelValue', false)
}

function handleBuildingChange(buildingId: string) {
  formData.value.houseId = ''
  formData.value.residentName = ''
  formData.value.phone = ''
}

function handleHouseChange(houseId: string) {
  const residents = store.getResidentsByHouse(houseId)
  const owner = residents.find(r => r.relationship === 'owner') || residents[0]
  if (owner) {
    formData.value.residentName = owner.name
    formData.value.phone = owner.phone
  }
}

async function handleCreate() {
  if (!formRef.value) return
  await formRef.value.validate()
  
  loading.value = true
  try {
    const building = store.getBuildingById(formData.value.buildingId)
    const house = store.getHouseById(formData.value.houseId)
    
    store.addWorkOrder({
      residentId: availableResidents.value[0]?.id || `temp_${Date.now()}`,
      residentName: formData.value.residentName,
      phone: formData.value.phone,
      houseId: formData.value.houseId,
      buildingId: formData.value.buildingId,
      buildingName: building?.name || '',
      houseNo: house?.houseNo || '',
      type: formData.value.type,
      title: formData.value.title,
      description: formData.value.description,
      priority: formData.value.priority
    })
    
    ElMessage.success('工单创建成功')
    emit('success')
    handleClose()
  } finally {
    loading.value = false
  }
}

function handleAssign() {
  if (!props.workOrder) return
  if (!selectedHandlerId.value) {
    ElMessage.warning('请选择处理人员')
    return
  }
  
  const handler = store.users.find(u => u.id === selectedHandlerId.value)
  if (!handler) return
  
  loading.value = true
  try {
    store.processWorkOrder(props.workOrder.id, 'assign', selectedHandlerId.value)
    ElMessage.success(`已派单给 ${handler.name}`)
    emit('success')
    handleClose()
  } finally {
    loading.value = false
  }
}

function handleComplete() {
  if (!props.workOrder) return
  
  loading.value = true
  try {
    store.processWorkOrder(props.workOrder.id, 'complete')
    ElMessage.success('维修完成，等待验收')
    emit('success')
    handleClose()
  } finally {
    loading.value = false
  }
}

function handleApprove() {
  if (!props.workOrder) return
  
  loading.value = true
  try {
    store.processWorkOrder(props.workOrder.id, 'approve')
    ElMessage.success('工单验收通过')
    emit('success')
    handleClose()
  } finally {
    loading.value = false
  }
}

function handleReopen() {
  if (!props.workOrder) return
  
  ElMessageBox.prompt(
    '请输入验收驳回原因：',
    '验收驳回',
    {
      confirmButtonText: '确认驳回',
      cancelButtonText: '取消',
      inputPattern: /.+/,
      inputErrorMessage: '请输入驳回原因',
      type: 'warning',
      inputPlaceholder: '请详细描述需要重新处理的问题'
    }
  ).then(({ value }) => {
    loading.value = true
    try {
      store.processWorkOrder(props.workOrder!.id, 'reopen')
      ElMessage.success('已驳回，工单重新进入维修状态')
      emit('success')
      handleClose()
    } finally {
      loading.value = false
    }
  }).catch(() => {})
}

const getStatusInfo = (status: WorkOrderStatus) => {
  const map: Record<WorkOrder['status'], { type: string; text: string; description: string }> = {
    pending: { type: 'warning', text: '待派单', description: '等待分配维修人员' },
    processing: { type: 'primary', text: '维修中', description: '维修人员正在处理' },
    checking: { type: 'info', text: '待验收', description: '等待业主验收' },
    completed: { type: 'success', text: '已完成', description: '工单已完成' }
  }
  return map[status]
}
</script>

<template>
  <el-dialog
    :model-value="modelValue"
    :title="{
      create: '创建报修工单',
      view: '工单详情',
      assign: '工单派单',
      process: '工单处理'
    }[mode]"
    width="700px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-width="100px"
      :disabled="isViewMode"
    >
      <template v-if="workOrder">
        <el-alert
          :title="getStatusInfo(workOrder.status).description"
          :type="getStatusInfo(workOrder.status).type as 'success' | 'warning' | 'info' | 'error'"
          :closable="false"
          show-icon
          class="status-alert"
        >
          <template #title>
            <div class="status-title">
              <el-tag :type="getStatusInfo(workOrder.status).type" size="large">
                {{ getStatusInfo(workOrder.status).text }}
              </el-tag>
              <span class="status-desc">{{ getStatusInfo(workOrder.status).description }}</span>
            </div>
          </template>
        </el-alert>
        <el-divider />
      </template>
      
      <el-row :gutter="24">
        <el-col :span="16">
          <el-form-item label="工单标题" prop="title">
            <el-input v-model="formData.title" placeholder="请输入工单标题" maxlength="50" show-word-limit />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="优先级" prop="priority">
            <el-select v-model="formData.priority" placeholder="请选择优先级" style="width: 100%">
              <el-option
                v-for="item in priorityOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              >
                <span :style="{ color: item.color }">
                  <el-icon v-if="item.value === 'high'"><Warning /></el-icon>
                  <el-icon v-else-if="item.value === 'medium'"><Bell /></el-icon>
                  <el-icon v-else><InfoFilled /></el-icon>
                  {{ item.label }}
                </span>
              </el-option>
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      
      <el-row :gutter="24">
        <el-col :span="12">
          <el-form-item label="工单类型" prop="type">
            <el-select v-model="formData.type" placeholder="请选择工单类型" style="width: 100%">
              <el-option
                v-for="item in typeOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              >
                <el-icon><component :is="item.icon" /></el-icon>
                {{ item.label }}
              </el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="联系电话" prop="phone">
            <el-input v-model="formData.phone" placeholder="请输入联系电话" maxlength="11" />
          </el-form-item>
        </el-col>
      </el-row>
      
      <el-row :gutter="24">
        <el-col :span="12">
          <el-form-item label="所在楼栋" prop="buildingId">
            <el-select 
              v-model="formData.buildingId" 
              placeholder="请选择楼栋" 
              style="width: 100%"
              @change="handleBuildingChange"
            >
              <el-option
                v-for="building in store.buildings"
                :key="building.id"
                :label="building.name"
                :value="building.id"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="房屋编号" prop="houseId">
            <el-select 
              v-model="formData.houseId" 
              placeholder="请选择房屋" 
              style="width: 100%"
              :disabled="!formData.buildingId"
              @change="handleHouseChange"
            >
              <el-option
                v-for="house in availableHouses"
                :key="house.id"
                :label="house.houseNo"
                :value="house.id"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      
      <el-form-item label="住户姓名" prop="residentName">
        <el-input v-model="formData.residentName" placeholder="请输入住户姓名" />
      </el-form-item>
      
      <el-form-item label="问题描述" prop="description">
        <el-input
          v-model="formData.description"
          type="textarea"
          :rows="4"
          placeholder="请详细描述问题情况..."
          maxlength="500"
          show-word-limit
        />
      </el-form-item>
      
      <el-form-item label="备注">
        <el-input
          v-model="formData.remark"
          type="textarea"
          :rows="2"
          placeholder="请输入备注信息（选填）"
          maxlength="200"
          show-word-limit
        />
      </el-form-item>
      
      <template v-if="workOrder && (isViewMode || isAssignMode || isProcessMode)">
        <el-divider />
        <el-descriptions :column="2" border class="info-descriptions">
          <el-descriptions-item label="工单编号" :span="2">
            <el-tag type="info">{{ workOrder.id }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="创建时间">
            {{ workOrder.createTime }}
          </el-descriptions-item>
          <el-descriptions-item label="派单时间">
            {{ workOrder.assignTime || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="处理人">
            {{ workOrder.handler || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="完成时间">
            {{ workOrder.completeTime || '-' }}
          </el-descriptions-item>
        </el-descriptions>
      </template>
      
      <template v-if="isAssignMode">
        <el-divider />
        <el-form-item label="选择处理人" required>
          <el-select 
            v-model="selectedHandlerId" 
            placeholder="请选择维修人员" 
            style="width: 100%"
          >
            <el-option
              v-for="user in store.maintenanceUsers"
              :key="user.id"
              :label="user.name"
              :value="user.id"
            >
              <div class="handler-option">
                <el-avatar :size="24" :icon="'UserFilled'" />
                <span class="handler-name">{{ user.name }}</span>
                <el-tag type="warning" size="small">维修</el-tag>
              </div>
            </el-option>
          </el-select>
          <div class="tip">
            <el-icon><InfoFilled /></el-icon>
            选择后将自动派单给该维修人员
          </div>
        </el-form-item>
      </template>
    </el-form>
    
    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      
      <template v-if="isCreateMode">
        <el-button type="primary" :loading="loading" @click="handleCreate">
          <el-icon><Plus /></el-icon>
          创建工单
        </el-button>
      </template>
      
      <template v-else-if="isAssignMode">
        <el-button type="primary" :loading="loading" @click="handleAssign">
          <el-icon><UserFilled /></el-icon>
          确认派单
        </el-button>
      </template>
      
      <template v-else-if="isProcessMode && workOrder">
        <template v-if="workOrder.status === 'processing'">
          <el-button type="primary" :loading="loading" @click="handleComplete">
            <el-icon><Check /></el-icon>
            标记完成
          </el-button>
        </template>
        
        <template v-else-if="workOrder.status === 'checking'">
          <el-button type="warning" :loading="loading" @click="handleReopen">
            <el-icon><Refresh /></el-icon>
            验收驳回
          </el-button>
          <el-button type="success" :loading="loading" @click="handleApprove">
            <el-icon><CircleCheck /></el-icon>
            验收通过
          </el-button>
        </template>
      </template>
    </template>
  </el-dialog>
</template>

<style scoped>
.status-alert {
  margin-bottom: 16px;
}

.status-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.status-desc {
  font-size: 13px;
  color: #606266;
}

.info-descriptions {
  margin-top: 8px;
}

.handler-option {
  display: flex;
  align-items: center;
  gap: 10px;
}

.handler-name {
  flex: 1;
}

.tip {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 8px;
  font-size: 12px;
  color: #909399;
}
</style>
