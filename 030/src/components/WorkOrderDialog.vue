<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { useCommunityStore } from '@/stores'
import type { WorkOrder } from '@/types'

const props = defineProps<{
  modelValue: boolean
  workOrder?: WorkOrder
  mode: 'create' | 'view' | 'edit' | 'process'
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'success'): void
}>()

const store = useCommunityStore()
const formRef = ref()
const loading = ref(false)

const formData = ref({
  title: '',
  type: 'repair' as WorkOrder['type'],
  priority: 'medium' as WorkOrder['priority'],
  buildingId: '',
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
  residentName: [{ required: true, message: '请输入住户姓名', trigger: 'blur' }],
  phone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  description: [{ required: true, message: '请输入问题描述', trigger: 'blur' }]
}

const isViewMode = computed(() => props.mode === 'view')
const isProcessMode = computed(() => props.mode === 'process')
const isEditMode = computed(() => props.mode === 'edit')

watch(() => props.modelValue, (val) => {
  if (val && props.workOrder) {
    const order = props.workOrder
    formData.value = {
      title: order.title,
      type: order.type,
      priority: order.priority,
      buildingId: order.buildingId,
      residentName: order.residentName,
      phone: order.phone,
      description: order.description,
      remark: order.remark || ''
    }
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
    residentName: '',
    phone: '',
    description: '',
    remark: ''
  }
}

function handleClose() {
  emit('update:modelValue', false)
}

async function handleSubmit() {
  if (!formRef.value) return
  
  await formRef.value.validate()
  loading.value = true
  
  try {
    if (props.mode === 'create') {
      const building = store.buildings.find(b => b.id === formData.value.buildingId)
      store.addWorkOrder({
        residentId: 'temp_' + Date.now(),
        residentName: formData.value.residentName,
        phone: formData.value.phone,
        houseId: 'temp',
        buildingId: formData.value.buildingId,
        buildingName: building?.name || '',
        houseNo: '-',
        type: formData.value.type,
        title: formData.value.title,
        description: formData.value.description,
        priority: formData.value.priority
      })
      ElMessage.success('工单创建成功')
    } else if (props.workOrder) {
      store.updateWorkOrderStatus(props.workOrder.id, props.workOrder.status)
      ElMessage.success('工单更新成功')
    }
    
    emit('success')
    handleClose()
  } catch (error) {
    console.error(error)
    ElMessage.error('操作失败')
  } finally {
    loading.value = false
  }
}

function handleAssign() {
  if (!props.workOrder) return
  store.updateWorkOrderStatus(props.workOrder.id, 'processing')
  ElMessage.success('派单成功')
  emit('success')
  handleClose()
}

function handleComplete() {
  if (!props.workOrder) return
  store.updateWorkOrderStatus(props.workOrder.id, 'checking')
  ElMessage.success('维修完成，等待验收')
  emit('success')
  handleClose()
}

function handleApprove() {
  if (!props.workOrder) return
  store.updateWorkOrderStatus(props.workOrder.id, 'completed')
  ElMessage.success('工单已验收通过')
  emit('success')
  handleClose()
}
</script>

<template>
  <el-dialog
    :model-value="modelValue"
    :title="mode === 'create' ? '创建工单' : mode === 'view' ? '工单详情' : mode === 'process' ? '处理工单' : '编辑工单'"
    width="600px"
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
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="工单标题" prop="title">
            <el-input v-model="formData.title" placeholder="请输入工单标题" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="工单类型" prop="type">
            <el-select v-model="formData.type" placeholder="请选择工单类型">
              <el-option label="维修报修" value="repair" />
              <el-option label="投诉建议" value="complaint" />
              <el-option label="服务建议" value="suggestion" />
              <el-option label="其他" value="other" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="优先级" prop="priority">
            <el-select v-model="formData.priority" placeholder="请选择优先级">
              <el-option label="高" value="high">
                <span style="color: #f56c6c;">高</span>
              </el-option>
              <el-option label="中" value="medium">
                <span style="color: #e6a23c;">中</span>
              </el-option>
              <el-option label="低" value="low">
                <span style="color: #67c23a;">低</span>
              </el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="所在楼栋" prop="buildingId">
            <el-select v-model="formData.buildingId" placeholder="请选择楼栋">
              <el-option
                v-for="building in store.buildings"
                :key="building.id"
                :label="building.name"
                :value="building.id"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="住户姓名" prop="residentName">
            <el-input v-model="formData.residentName" placeholder="请输入住户姓名" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="联系电话" prop="phone">
            <el-input v-model="formData.phone" placeholder="请输入联系电话" />
          </el-form-item>
        </el-col>
      </el-row>
      
      <el-form-item label="问题描述" prop="description">
        <el-input
          v-model="formData.description"
          type="textarea"
          :rows="4"
          placeholder="请输入详细的问题描述"
        />
      </el-form-item>
      
      <el-form-item label="备注">
        <el-input
          v-model="formData.remark"
          type="textarea"
          :rows="2"
          placeholder="请输入备注信息（选填）"
        />
      </el-form-item>
      
      <template v-if="workOrder && (isViewMode || isProcessMode)">
        <el-divider />
        <el-descriptions :column="2" border>
          <el-descriptions-item label="工单编号">{{ workOrder.id }}</el-descriptions-item>
          <el-descriptions-item label="当前状态">
            <el-tag :type="{
              pending: 'warning',
              processing: 'primary',
              checking: 'info',
              completed: 'success'
            }[workOrder.status]">
              {{ { pending: '待派单', processing: '维修中', checking: '待验收', completed: '已完成' }[workOrder.status] }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ workOrder.createTime }}</el-descriptions-item>
          <el-descriptions-item label="派单时间">{{ workOrder.assignTime || '-' }}</el-descriptions-item>
          <el-descriptions-item label="处理人">{{ workOrder.handler || '-' }}</el-descriptions-item>
          <el-descriptions-item label="完成时间">{{ workOrder.completeTime || '-' }}</el-descriptions-item>
        </el-descriptions>
      </template>
    </el-form>
    
    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      
      <template v-if="mode === 'create'">
        <el-button type="primary" :loading="loading" @click="handleSubmit">
          提交
        </el-button>
      </template>
      
      <template v-else-if="workOrder">
        <template v-if="workOrder.status === 'pending' && isProcessMode">
          <el-button type="primary" :loading="loading" @click="handleAssign">
            派单处理
          </el-button>
        </template>
        
        <template v-else-if="workOrder.status === 'processing' && isProcessMode">
          <el-button type="primary" :loading="loading" @click="handleComplete">
            标记完成
          </el-button>
        </template>
        
        <template v-else-if="workOrder.status === 'checking' && isProcessMode">
          <el-button type="success" :loading="loading" @click="handleApprove">
            验收通过
          </el-button>
        </template>
      </template>
    </template>
  </el-dialog>
</template>
