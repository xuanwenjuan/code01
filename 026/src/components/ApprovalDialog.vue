<template>
  <el-dialog
    v-model="visible"
    :title="dialogTitle"
    width="600px"
    destroy-on-close
    :close-on-click-modal="false"
  >
    <el-form
      v-if="mode === 'create'"
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      class="dialog-form"
    >
      <el-form-item label="申请人" prop="employeeName">
        <el-input v-model="formData.employeeName" placeholder="请输入申请人姓名" />
      </el-form-item>
      
      <el-form-item label="部门" prop="departmentId">
        <el-select v-model="formData.departmentId" placeholder="请选择部门" style="width: 100%" @change="handleDepartmentChange">
          <el-option
            v-for="dept in departments"
            :key="dept.id"
            :label="dept.name"
            :value="dept.id"
          />
        </el-select>
      </el-form-item>
      
      <el-form-item label="类型" prop="type">
        <el-select v-model="formData.type" placeholder="请选择申请类型" style="width: 100%" @change="handleTypeChange">
          <el-option 
            v-for="type in approvalTypes" 
            :key="type.value" 
            :label="type.label" 
            :value="type.value" 
          />
        </el-select>
      </el-form-item>
      
      <el-form-item label="理由" prop="reason">
        <el-input
          v-model="formData.reason"
          type="textarea"
          :rows="3"
          placeholder="请输入申请理由"
        />
      </el-form-item>
      
      <el-form-item label="时间范围" prop="startTime">
        <el-date-picker
          v-model="dateRange"
          type="datetimerange"
          range-separator="至"
          start-placeholder="开始时间"
          end-placeholder="结束时间"
          value-format="YYYY-MM-DD HH:mm"
          style="width: 100%"
        />
      </el-form-item>
      
      <el-form-item label="时长(天)" prop="duration">
        <el-input-number v-model="formData.duration" :min="1" :step="1" style="width: 100%" />
      </el-form-item>
    </el-form>
    
    <div v-else-if="mode === 'view'" style="padding: 20px 0;">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="单号">{{ detailData?.id }}</el-descriptions-item>
        <el-descriptions-item label="申请人">{{ detailData?.employeeName }}</el-descriptions-item>
        <el-descriptions-item label="部门">{{ detailData?.departmentName }}</el-descriptions-item>
        <el-descriptions-item label="类型">{{ getApprovalTypeText(detailData?.type) }}</el-descriptions-item>
        <el-descriptions-item label="标题">{{ detailData?.title }}</el-descriptions-item>
        <el-descriptions-item label="时长">{{ detailData?.duration }}天</el-descriptions-item>
        <el-descriptions-item label="开始时间">{{ detailData?.startTime }}</el-descriptions-item>
        <el-descriptions-item label="结束时间">{{ detailData?.endTime }}</el-descriptions-item>
        <el-descriptions-item label="申请时间">{{ detailData?.createTime }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <span :class="['status-tag', `status-${detailData?.status}`]">
            {{ getApprovalStatusText(detailData?.status) }}
          </span>
        </el-descriptions-item>
        <el-descriptions-item label="申请理由" :span="2">
          {{ detailData?.reason }}
        </el-descriptions-item>
        <template v-if="detailData?.approverName">
          <el-descriptions-item label="审批人">{{ detailData.approverName }}</el-descriptions-item>
          <el-descriptions-item label="审批时间">{{ detailData.updateTime }}</el-descriptions-item>
          <el-descriptions-item label="审批意见" :span="2">
            {{ detailData.comment }}
          </el-descriptions-item>
        </template>
      </el-descriptions>
    </div>
    
    <div v-else-if="mode === 'approve'" style="padding: 20px 0;">
      <el-alert
        :title="`正在审批：${detailData?.employeeName}的${getApprovalTypeText(detailData?.type)}`"
        type="success"
        show-icon
        :closable="false"
      />
      
      <div style="margin-top: 20px;">
        <el-form label-width="100px">
          <el-form-item label="审批意见">
            <el-input
              v-model="comment"
              type="textarea"
              :rows="3"
              placeholder="请输入审批意见（选填）"
            />
          </el-form-item>
        </el-form>
      </div>
    </div>
    
    <div v-else-if="mode === 'reject'" style="padding: 20px 0;">
      <el-alert
        :title="`正在驳回：${detailData?.employeeName}的${getApprovalTypeText(detailData?.type)}`"
        type="error"
        show-icon
        :closable="false"
      />
      
      <div style="margin-top: 20px;">
        <el-form label-width="100px">
          <el-form-item label="驳回理由">
            <el-input
              v-model="comment"
              type="textarea"
              :rows="3"
              placeholder="请输入驳回理由"
            />
          </el-form-item>
        </el-form>
      </div>
    </div>
    
    <template #footer>
      <el-button @click="handleClose">关闭</el-button>
      <el-button 
        v-if="mode === 'create'" 
        type="primary" 
        @click="handleSubmit"
        :loading="submitting"
      >
        提交
      </el-button>
      <el-button 
        v-if="mode === 'approve'" 
        type="success" 
        @click="handleApproveConfirm"
      >
        确认通过
      </el-button>
      <el-button 
        v-if="mode === 'reject'" 
        type="danger" 
        @click="handleRejectConfirm"
        :disabled="!comment.trim()"
      >
        确认驳回
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import type { Approval, ApprovalType, ApprovalStatus, Department, ApprovalDialogMode } from '@/types'
import { ApprovalTypeMap, ApprovalStatusMap, ApprovalDialogModes } from '@/types'

export interface ApprovalDialogProps {
  visible: boolean
  mode: 'create' | 'view' | 'approve' | 'reject'
  detailData?: Approval
  departments: Department[]
}

const props = defineProps<ApprovalDialogProps>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  'submit': [data: Partial<Approval>]
  'approve': [id: string, comment: string]
  'reject': [id: string, comment: string]
}>()

const visible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val)
})

const formRef = ref<FormInstance>()
const dateRange = ref<string[]>([])
const submitting = ref(false)
const comment = ref('')

const approvalTypes = Object.entries(ApprovalTypeMap).map(([value, label]) => ({
  value: value as ApprovalType,
  label
}))

const formData = reactive<Partial<Approval>>({
  employeeId: '',
  employeeName: '',
  departmentId: '',
  departmentName: '',
  type: 'leave',
  title: '请假申请',
  reason: '',
  startTime: '',
  endTime: '',
  duration: 1
})

const formRules: FormRules = {
  employeeName: [{ required: true, message: '请输入申请人姓名', trigger: 'blur' }],
  departmentId: [{ required: true, message: '请选择部门', trigger: 'change' }],
  type: [{ required: true, message: '请选择申请类型', trigger: 'change' }],
  reason: [{ required: true, message: '请输入申请理由', trigger: 'blur' }],
  startTime: [{ required: true, message: '请选择开始时间', trigger: 'change' }],
  duration: [{ required: true, message: '请输入时长', trigger: 'blur' }]
}

const dialogTitle = computed(() => {
  const titles: Record<string, string> = {
    create: '新建申请',
    view: '申请详情',
    approve: '审批通过',
    reject: '审批驳回'
  }
  return titles[props.mode] || '审批'
})

const detailData = computed(() => props.detailData)

function getApprovalTypeText(type?: ApprovalType): string {
  return type ? ApprovalTypeMap[type] : ''
}

function getApprovalStatusText(status?: ApprovalStatus): string {
  return status ? ApprovalStatusMap[status] : ''
}

function handleDepartmentChange(val: string) {
  const dept = props.departments.find(d => d.id === val)
  if (dept) {
    formData.departmentName = dept.name
  }
}

function handleTypeChange(val: ApprovalType) {
  formData.title = getApprovalTypeText(val)
}

function handleClose() {
  visible.value = false
  resetForm()
}

function handleSubmit() {
  if (!formRef.value) return
  
  formRef.value.validate((valid) => {
    if (valid) {
      submitting.value = true
      
      if (dateRange.value && dateRange.value.length === 2) {
        formData.startTime = dateRange.value[0]
        formData.endTime = dateRange.value[1]
      }
      
      emit('submit', { ...formData })
      
      setTimeout(() => {
        submitting.value = false
        visible.value = false
        resetForm()
      }, 300)
    }
  })
}

function handleApproveConfirm() {
  if (!detailData.value) return
  emit('approve', detailData.value.id, comment.value || '同意')
  visible.value = false
  resetForm()
}

function handleRejectConfirm() {
  if (!detailData.value || !comment.value.trim()) return
  emit('reject', detailData.value.id, comment.value.trim())
  visible.value = false
  resetForm()
}

function resetForm() {
  formData.employeeId = ''
  formData.employeeName = ''
  formData.departmentId = ''
  formData.departmentName = ''
  formData.type = 'leave'
  formData.title = '请假申请'
  formData.reason = ''
  formData.startTime = ''
  formData.endTime = ''
  formData.duration = 1
  dateRange.value = []
  comment.value = ''
}

watch(() => props.mode, () => {
  if (props.mode === 'create') {
    resetForm()
  }
})
</script>