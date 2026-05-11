<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import type { ReturnFormData } from '@/types/borrow'
import dayjs from 'dayjs'

const props = defineProps<{
  visible: boolean
  record?: {
    expectedReturnDate: string
    applicant: string
    assetName: string
  }
}>()

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'submit', data: ReturnFormData): void
}>()

const formRef = ref<FormInstance>()

const isOverdue = computed(() => {
  if (!props.record) return false
  return dayjs().isAfter(dayjs(props.record.expectedReturnDate), 'day')
})

const overdueDays = computed(() => {
  if (!props.record || !isOverdue.value) return 0
  return dayjs().diff(dayjs(props.record.expectedReturnDate), 'day')
})

const formData = ref<ReturnFormData>({
  actualReturnDate: dayjs().format('YYYY-MM-DD'),
  remark: ''
})

const rules: FormRules = {
  actualReturnDate: [{ required: true, message: '请选择实际归还日期', trigger: 'change' }]
}

watch(() => props.visible, (visible) => {
  if (visible) {
    formData.value = {
      actualReturnDate: dayjs().format('YYYY-MM-DD'),
      remark: ''
    }
  }
})

const handleClose = () => {
  emit('update:visible', false)
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    emit('submit', { ...formData.value })
    emit('update:visible', false)
    ElMessage.success('归还成功')
  } catch {
    ElMessage.error('请检查表单数据')
  }
}
</script>

<template>
  <el-dialog
    title="归还设备"
    :model-value="visible"
    :width="450"
    @update:model-value="handleClose"
    :close-on-click-modal="false"
  >
    <div v-if="record" class="return-info">
      <el-alert
        v-if="isOverdue"
        :title="`设备已逾期 ${overdueDays} 天，请尽快处理`"
        type="warning"
        :closable="false"
        show-icon
        class="mb-16"
      />
      <el-descriptions :column="1" border>
        <el-descriptions-item label="领用人">{{ record.applicant }}</el-descriptions-item>
        <el-descriptions-item label="设备名称">{{ record.assetName }}</el-descriptions-item>
        <el-descriptions-item label="预计归还日期">{{ record.expectedReturnDate }}</el-descriptions-item>
      </el-descriptions>
    </div>
    
    <el-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-width="100px"
      class="mt-20"
    >
      <el-form-item label="归还日期" prop="actualReturnDate">
        <el-date-picker
          v-model="formData.actualReturnDate"
          type="date"
          placeholder="选择实际归还日期"
          value-format="YYYY-MM-DD"
          style="width: 100%"
        />
      </el-form-item>
      
      <el-form-item label="归还备注">
        <el-input 
          v-model="formData.remark" 
          type="textarea" 
          :rows="3" 
          placeholder="请输入归还状态、设备情况等备注信息"
        />
      </el-form-item>
    </el-form>
    
    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" @click="handleSubmit">
        确认归还
      </el-button>
    </template>
  </el-dialog>
</template>

<style scoped>
.return-info {
  margin-bottom: 20px;
}

.mb-16 {
  margin-bottom: 16px;
}

.mt-20 {
  margin-top: 20px;
}
</style>
